import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso dentro de Route Handlers do App Router
 * (app/api/.../route.ts). Lê a sessão a partir dos cookies da requisição,
 * então `supabase.auth.getUser()` funciona de verdade no servidor.
 *
 * Fica num arquivo separado (server-only) porque `next/headers` não pode
 * ser importado por componentes de cliente.
 */
export const createRouteHandlerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` pode ser chamado num contexto onde não é possível
            // escrever cookies. Seguro ignorar aqui.
          }
        },
      },
    }
  );
};
