// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/database';

// Define the context type
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
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
  setOnboardingComplete: (completed: boolean) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component - use function declaration instead of arrow function
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Derived state
  const isAuthenticated = !!user;
  const isLoading = loading;

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

  // Check local storage for onboarding status (for non-authenticated users)
  const checkLocalOnboardingStatus = () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(stored === 'true');
      }
    } catch (error) {
      console.error('Error checking local storage:', error);
    }
  };

  useEffect(() => {
    console.log('🔧 [AuthProvider] Initializing...');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📦 [AuthProvider] Got session:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        // Check onboarding status from user metadata
        const onboardingCompleted = session.user.user_metadata?.onboarding_completed || false;
        setHasSeenOnboarding(onboardingCompleted);
      } else {
        checkLocalOnboardingStatus();
      }
      
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 [AuthProvider] Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        const onboardingCompleted = session.user.user_metadata?.onboarding_completed || false;
        setHasSeenOnboarding(onboardingCompleted);
      } else {
        setProfile(null);
        checkLocalOnboardingStatus();
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
        options: {
          data: {
            onboarding_completed: false
          }
        }
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

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hasSeenOnboarding', 'false');
      }
      setHasSeenOnboarding(false);

      return { success: true, data: authData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      if (data.user) {
        const onboardingCompleted = data.user.user_metadata?.onboarding_completed || false;
        setHasSeenOnboarding(onboardingCompleted);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('hasSeenOnboarding', onboardingCompleted.toString());
        }
      }

      return { success: true, data };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setHasSeenOnboarding(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('hasSeenOnboarding');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const setOnboardingComplete = async (completed: boolean) => {
    setHasSeenOnboarding(completed);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', completed.toString());
    }
    
    if (user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { onboarding_completed: completed }
        });
        if (error) throw error;
      } catch (error) {
        console.error('Error setting onboarding complete:', error);
      }
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isLoading,
    isAuthenticated,
    hasSeenOnboarding,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    setOnboardingComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}