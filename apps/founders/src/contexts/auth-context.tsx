'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch profile:', error);
        return null;
      }
      return data as Profile | null;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      console.log('[AUTH] getUser started');
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log('[AUTH] getUser result:', user?.id);
        setUser(user);

        if (user) {
          console.log('[AUTH] fetching profile for:', user.id);
          const profileData = await fetchProfile(user.id);
          console.log('[AUTH] profile fetched:', profileData);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('[AUTH] Failed to get user:', error);
      } finally {
        console.log('[AUTH] getUser done, setIsLoading(false)');
        setIsLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] onAuthStateChange:', event, session?.user?.id);
      try {
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('[AUTH] Auth state change error:', error);
      } finally {
        console.log('[AUTH] onAuthStateChange done, setIsLoading(false)');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
