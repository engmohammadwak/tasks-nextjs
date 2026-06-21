'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AuthScreen from './components/AuthScreen';
import TasksApp from './components/TasksApp';

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#FAFBFC',
        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
        color: '#8693A8',
      }}>
        جارٍ التحميل...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <TasksApp session={session} />;
}
