import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    inviteCode?: string
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboardingComplete?: (completed: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    inviteCode?: string
  ) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned');

      let referredBy = null;
      if (inviteCode) {
        const { data: referrerData } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('invite_code', inviteCode)
          .maybeSingle();

        if (referrerData) {
          referredBy = referrerData.id;
        }
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          referred_by: referredBy,
        });

      if (profileError) throw profileError;

      return { success: true, data: authData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AuthContext] signIn called with email:', email);
    
    try {
      console.log('📞 [AuthContext] Calling Supabase signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📦 [AuthContext] Supabase response:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.error('❌ [AuthContext] Supabase error:', error);
        // Return error message string, NOT the error object
        return { 
          success: false, 
          error: error.message || 'Invalid email or password' 
        };
      }

      console.log('✅ [AuthContext] Sign in successful');
      return { success: true, data };
      
    } catch (error) {
      console.error('💥 [AuthContext] Unexpected error:', error);
      // Return error message string, NOT the error object
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Add onboarding completion function
  const setOnboardingComplete = async (completed: boolean) => {
    console.log('📝 [AuthContext] Setting onboarding complete:', completed);
    // You can store this in user metadata or a separate table
    if (user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { onboarding_completed: completed }
        });
        if (error) throw error;
        console.log('✅ [AuthContext] Onboarding complete set successfully');
      } catch (error) {
        console.error('❌ [AuthContext] Error setting onboarding complete:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        setOnboardingComplete,
      }}
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