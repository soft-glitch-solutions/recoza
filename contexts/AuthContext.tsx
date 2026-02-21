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
  collectorApplication: any | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    inviteCode?: string
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setOnboardingComplete: (completed: boolean) => Promise<void>;
  applyAsCollector: (motivation: string, area: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  checkCollectorStatus: () => Promise<{ status: string | null; application: any | null }>;
  getCollectorApplication: () => Promise<void>;
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
  const [collectorApplication, setCollectorApplication] = useState<any | null>(null);

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

  const getCollectorApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('collector_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setCollectorApplication(data);
    } catch (error) {
      console.error('Error fetching collector application:', error);
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
        getCollectorApplication();
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
        getCollectorApplication();
        const onboardingCompleted = session.user.user_metadata?.onboarding_completed || false;
        setHasSeenOnboarding(onboardingCompleted);
      } else {
        setProfile(null);
        setCollectorApplication(null);
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
    phoneNumber: string,
    inviteCode?: string
  ) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
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

      // Generate a unique invite code for the new user
      const newInviteCode = 'RCZ' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          phone_number: phoneNumber,
          referred_by: referredBy,
          invite_code: newInviteCode,
          is_collector: false,
          collector_approved: false,
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
    setCollectorApplication(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('hasSeenOnboarding');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await getCollectorApplication();
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

  const applyAsCollector = async (motivation: string, area: string) => {
    try {
      if (!user) {
        return { 
          success: false, 
          error: 'You must be logged in to apply' 
        };
      }

      // Check if user already has an application
      const { data: existingApp, error: checkError } = await supabase
        .from('collector_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingApp) {
        if (existingApp.status === 'pending') {
          return { 
            success: false, 
            error: 'You already have a pending application' 
          };
        } else if (existingApp.status === 'approved') {
          return { 
            success: false, 
            error: 'Your collector application has already been approved' 
          };
        } else if (existingApp.status === 'rejected') {
          return { 
            success: false, 
            error: 'Your previous application was rejected. Please contact support for more information.' 
          };
        }
      }

      // Insert new application
      const { data, error } = await supabase
        .from('collector_applications')
        .insert({
          user_id: user.id,
          motivation,
          area,
          status: 'pending',
          applied_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCollectorApplication(data);

      return { 
        success: true, 
        data,
        message: 'Application submitted successfully' 
      };
      
    } catch (error) {
      console.error('Error applying as collector:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit application' 
      };
    }
  };

  const checkCollectorStatus = async () => {
    if (!user) {
      return { status: null, application: null };
    }

    try {
      // Get the latest application
      const { data: application, error } = await supabase
        .from('collector_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCollectorApplication(application);

      // Determine status
      let status = 'none';
      if (profile?.is_collector) {
        status = 'approved';
      } else if (profile?.collector_approved) {
        status = 'approved';
      } else if (application) {
        status = application.status;
      }

      return { status, application };
      
    } catch (error) {
      console.error('Error checking collector status:', error);
      return { status: null, application: null };
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
    collectorApplication,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    setOnboardingComplete,
    applyAsCollector,
    checkCollectorStatus,
    getCollectorApplication,
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