import { createComponentClient } from "@/models/supabase";
import { useState, useEffect } from "react";

export function useSupabaseUser() {
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createComponentClient();

    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setUser(null);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }

    fetchUser();

    // opcional: subscribe para mudanças na sessão (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
