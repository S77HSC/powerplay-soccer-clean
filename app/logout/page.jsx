'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const signOutUser = async () => {
      await supabase.auth.signOut();
      router.push('/login');
    };

    signOutUser();
  }, [router]);

  return null;
}
