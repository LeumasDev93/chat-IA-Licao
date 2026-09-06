import { NextResponse } from 'next/server';

// Referência para o cache (será compartilhada com o route principal)
declare global {
  // eslint-disable-next-line no-var
  var responseCache: Map<string, { response: string; timestamp: number }> | undefined;
}

if (!global.responseCache) {
  global.responseCache = new Map();
}

export async function POST() {
  try {
    // Limpa todo o cache
    global.responseCache?.clear();
    
    return NextResponse.json({ 
      message: "Cache limpo com sucesso",
      clearedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
    return NextResponse.json(
      { message: "Erro ao limpar cache" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cacheSize = global.responseCache?.size || 0;
    const cacheEntries = Array.from(global.responseCache?.entries() || []);
    
    return NextResponse.json({
      cacheSize,
      cacheEntries: cacheEntries.map(([key, value]: [string, { response: string; timestamp: number }]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    });
  } catch (error) {
    console.error("Erro ao obter informações do cache:", error);
    return NextResponse.json(
      { message: "Erro ao obter informações do cache" },
      { status: 500 }
    );
  }
}
