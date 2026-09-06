import { createComponentClient } from "@/models/supabase";
import { useState, useEffect } from "react";

export function useSupabaseUser() {
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createComponentClient();

    async function fetchUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!mounted) return;
        
        if (error) {
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    // opcional: subscribe para mudanças na sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []); // Sem dependências para executar apenas uma vez

  return { user, loading };
}
