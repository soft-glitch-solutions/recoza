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
  linkToCollector: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  linkedCollector: any | null;
  isCollector: boolean;
  isHousehold: boolean;
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
  const [linkedCollector, setLinkedCollector] = useState<any | null>(null);

  // Derived state
  const isAuthenticated = !!user;
  const isLoading = loading;
  const isCollector = profile?.is_collector || profile?.collector_approved || false;
  const isHousehold = !isCollector;

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      console.log('👤 [AuthContext] Profile fetched:', {
        id: data?.id,
        is_collector: data?.is_collector,
        collector_approved: data?.collector_approved,
        invite_code: data?.invite_code
      });
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

  const fetchLinkedCollector = async (userId: string) => {
    try {
      // First check household_connections
      const { data: connection, error: connError } = await supabase
        .from('household_connections')
        .select('*, collector:user_profiles!household_connections_collector_id_fkey(*)')
        .eq('household_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (connError) throw connError;
      
      // Collectors don't need linked collectors
      const { data: ownProfile } = await supabase
        .from('user_profiles')
        .select('is_collector, collector_approved')
        .eq('id', userId)
        .maybeSingle();
      
      if (ownProfile?.is_collector || ownProfile?.collector_approved) {
        setLinkedCollector(null);
        return;
      }

      if (connection?.collector) {
        setLinkedCollector(connection.collector);
      } else {
        // Fallback to referred_by in user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('referred_by')
          .eq('id', userId)
          .maybeSingle();
        
        if (profile?.referred_by) {
          const { data: collector } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', profile.referred_by)
            .maybeSingle();
          setLinkedCollector(collector);
        } else {
          setLinkedCollector(null);
        }
      }
    } catch (error) {
      console.error('Error fetching linked collector:', error);
      setLinkedCollector(null);
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
        fetchLinkedCollector(session.user.id);
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
        fetchLinkedCollector(session.user.id);
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

  // Log state changes for debugging
  useEffect(() => {
    if (profile) {
      console.log('🛡️ [AuthContext] Role Update:', {
        isCollector,
        isHousehold,
        raw_is_collector: profile.is_collector,
        raw_approved: profile.collector_approved
      });
    }
  }, [profile, isCollector, isHousehold]);

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
    // Do NOT reset hasSeenOnboarding — user has already seen onboarding.
    // The auth guard will correctly send them to /login (not /onboarding).
    setCollectorApplication(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await getCollectorApplication();
      await fetchLinkedCollector(user.id);
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

  const linkToCollector = async (inviteCode: string) => {
    try {
      if (!user) throw new Error('Not authenticated');
      if (isCollector) throw new Error('Collectors cannot link to other collectors.');

      // Find collector by invite code
      const { data: collector, error: findError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .maybeSingle();

      if (findError) throw findError;
      if (!collector) return { success: false, error: 'Invalid invite code. Please check with your collector.' };
      if (!collector.is_collector) return { success: false, error: 'This user is not registered as a collector.' };
      if (collector.id === user.id) return { success: false, error: 'You cannot link to yourself.' };

      // Create connection
      const { error: linkError } = await supabase
        .from('household_connections')
        .insert({
          collector_id: collector.id,
          household_id: user.id,
          status: 'active'
        });

      if (linkError) throw linkError;

      // Update referred_by as well
      await supabase
        .from('user_profiles')
        .update({ referred_by: collector.id })
        .eq('id', user.id);

      await refreshProfile();
      return { success: true };
    } catch (error) {
      console.error('Error linking to collector:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Linking failed' };
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
    linkToCollector,
    linkedCollector,
    isCollector,
    isHousehold,
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