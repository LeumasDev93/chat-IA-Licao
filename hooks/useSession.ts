// hooks/useSession.ts
"use client";

import { useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { auth } from '@/app/lib/auth';

export function useAsyncSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const sessionData = await auth();
      setSession(sessionData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return {
    session,
    loading,
    error,
    refresh: refreshSession
  };
}