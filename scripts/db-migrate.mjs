/**
 * Aplica migrações SQL no Postgres do Supabase.
 *
 *   node scripts/db-migrate.mjs                       # aplica só as migrações "seguras" (idempotentes)
 *   node scripts/db-migrate.mjs 20260906_create_push_subscriptions.sql
 *   node scripts/db-migrate.mjs --all                 # tenta todas (tolera "já existe")
 *
 * Requer no .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL   (para extrair o project ref)
 *   SUPABASE_BD_PASSWORD       (senha do banco — Dashboard > Project Settings > Database)
 * Opcional: SUPABASE_DB_URL (connection string completa; tem prioridade)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// --- carregar .env.local ---
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// --- montar lista de connection strings a tentar ---
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ref = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
const pass = process.env.SUPABASE_BD_PASSWORD;

const candidates = [];
if (process.env.SUPABASE_DB_URL) candidates.push(process.env.SUPABASE_DB_URL);
if (ref && pass) {
  const p = encodeURIComponent(pass);
  // conexão direta (só funciona com IPv6 ou add-on IPv4)
  candidates.push(`postgresql://postgres:${p}@db.${ref}.supabase.co:5432/postgres`);
  // pooler (session mode, porta 5432) — tenta as regiões mais comuns
  const regions = [
    "us-east-1", "us-east-2", "us-west-1", "eu-west-1", "eu-west-2", "eu-west-3",
    "eu-central-1", "eu-central-2", "sa-east-1", "ap-southeast-1", "ap-southeast-2",
    "ap-south-1", "ca-central-1",
  ];
  for (const r of regions) {
    candidates.push(
      `postgresql://postgres.${ref}:${p}@aws-0-${r}.pooler.supabase.com:5432/postgres`
    );
  }
}
if (candidates.length === 0) {
  console.error(
    "Faltam credenciais. Defina SUPABASE_DB_URL, ou NEXT_PUBLIC_SUPABASE_URL + SUPABASE_BD_PASSWORD no .env.local."
  );
  process.exit(1);
}

// --- escolher migrações ---
const migDir = path.join(root, "supabase", "migrations");
const all = fs.readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();
const args = process.argv.slice(2);

let files;
if (args.includes("--all")) files = all;
else if (args.some((a) => a.endsWith(".sql"))) files = args.filter((a) => a.endsWith(".sql"));
else files = ["20260906_create_push_subscriptions.sql"]; // padrão: só a idempotente

const IGNORABLE = new Set(["42P07", "42710", "42P06", "42723"]); // "já existe"

// --- conectar (tenta cada candidato até um funcionar) ---
let client = null;
for (const cs of candidates) {
  const host = cs.match(/@([^/:]+)/)?.[1] || "?";
  const c = new pg.Client({ connectionString: cs, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  try {
    await c.connect();
    client = c;
    console.log(`Conectado via ${host}\n`);
    break;
  } catch (err) {
    console.log(`  ${host}: ${err.message.split("\n")[0]}`);
    try { await c.end(); } catch {}
  }
}
if (!client) {
  console.error("\nNão foi possível conectar. Rode o SQL manualmente no Supabase (Dashboard > SQL Editor):");
  console.error(`  ${path.join(migDir, files[0])}`);
  process.exit(1);
}

// Divide o SQL em statements, respeitando blocos $$ ... $$ (corpo de função)
function splitStatements(sql) {
  const out = [];
  let buf = "";
  let inDollar = false;
  for (const line of sql.split("\n")) {
    if (/^\s*--/.test(line) && !buf.trim()) continue;
    const dollars = (line.match(/\$\$/g) || []).length;
    if (dollars % 2 === 1) inDollar = !inDollar;
    buf += line + "\n";
    if (!inDollar && /;\s*$/.test(line)) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

try {
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migDir, file), "utf8");
    const statements = splitStatements(sql);
    console.log(`→ ${file} (${statements.length} statements)`);
    let ok = 0, skip = 0, fail = 0;
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        ok++;
      } catch (err) {
        if (IGNORABLE.has(err.code)) {
          skip++;
        } else {
          fail++;
          console.error(`   ✗ ${err.code || ""} ${err.message.split("\n")[0]}`);
          console.error(`     ${stmt.split("\n")[0].slice(0, 90)}`);
        }
      }
    }
    console.log(`   ${ok} ok, ${skip} já existiam, ${fail} com erro`);
  }
  console.log("\nConcluído.");
} catch (err) {
  console.error("Erro:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
