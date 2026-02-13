import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { RecyclableItem, RecyclableType, RecyclablePrice, Collection, CollectorStats, HouseholdConnection } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

// Define the recyclables prices
export const RECYCLABLE_PRICES: RecyclablePrice[] = [
  { type: 'plastic', pricePerKg: 8.50, label: 'Plastic', icon: 'bottle-soda' },
  { type: 'paper', pricePerKg: 3.00, label: 'Paper', icon: 'newspaper' },
  { type: 'glass', pricePerKg: 1.50, label: 'Glass', icon: 'wine-bottle' },
  { type: 'metal', pricePerKg: 12.00, label: 'Metal/Cans', icon: 'cylinder' },
  { type: 'cardboard', pricePerKg: 2.50, label: 'Cardboard', icon: 'box' },
];

// Define the context type
interface RecyclablesContextType {
  recyclableItems: RecyclableItem[];
  collections: Collection[];
  collectorStats: CollectorStats | null;
  householdConnections: HouseholdConnection[];
  loading: boolean;
  error: string | null;
  fetchRecyclableItems: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  fetchCollectorStats: () => Promise<void>;
  fetchHouseholdConnections: () => Promise<void>;
  addRecyclableItem: (item: Omit<RecyclableItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateRecyclableItem: (id: string, updates: Partial<RecyclableItem>) => Promise<{ success: boolean; error?: string }>;
  deleteRecyclableItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  createCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; data?: Collection }>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<{ success: boolean; error?: string }>;
  connectToHousehold: (householdId: string, inviteCode?: string) => Promise<{ success: boolean; error?: string }>;
  disconnectFromHousehold: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  getPriceForType: (type: RecyclableType) => RecyclablePrice | undefined;
  calculateEarnings: (items: { type: RecyclableType; weight: number }[]) => number;
}

// Create context
const RecyclablesContext = createContext<RecyclablesContextType | null>(null);

// Provider component
export function RecyclablesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [recyclableItems, setRecyclableItems] = useState<RecyclableItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectorStats, setCollectorStats] = useState<CollectorStats | null>(null);
  const [householdConnections, setHouseholdConnections] = useState<HouseholdConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recyclable items
  const fetchRecyclableItems = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('recyclable_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRecyclableItems(data || []);
    } catch (err: any) {
      console.error('Error fetching recyclable items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collector:collector_id(*),
          household:household_id(*)
        `)
        .or(`collector_id.eq.${user.id},household_id.eq.${user.id}`)
        .order('scheduled_date', { ascending: true });
      
      if (error) throw error;
      
      setCollections(data || []);
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch collector stats
  const fetchCollectorStats = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('collector_stats')
        .select('*')
        .eq('collector_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      
      setCollectorStats(data || null);
    } catch (err: any) {
      console.error('Error fetching collector stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch household connections
  const fetchHouseholdConnections = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('household_connections')
        .select(`
          *,
          household:household_id(*),
          collector:collector_id(*)
        `)
        .or(`collector_id.eq.${user.id},household_id.eq.${user.id}`)
        .eq('status', 'active');
      
      if (error) throw error;
      
      setHouseholdConnections(data || []);
    } catch (err: any) {
      console.error('Error fetching household connections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add recyclable item
  const addRecyclableItem = async (item: Omit<RecyclableItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('recyclable_items')
        .insert([{ ...item, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setRecyclableItems(prev => [data, ...prev]);
      return { success: true };
    } catch (err: any) {
      console.error('Error adding recyclable item:', err);
      return { success: false, error: err.message };
    }
  };

  // Update recyclable item
  const updateRecyclableItem = async (id: string, updates: Partial<RecyclableItem>) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('recyclable_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setRecyclableItems(prev => prev.map(item => item.id === id ? data : item));
      return { success: true };
    } catch (err: any) {
      console.error('Error updating recyclable item:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete recyclable item
  const deleteRecyclableItem = async (id: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { error } = await supabase
        .from('recyclable_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setRecyclableItems(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting recyclable item:', err);
      return { success: false, error: err.message };
    }
  };

  // Create collection
  const createCollection = async (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert([collection])
        .select()
        .single();
      
      if (error) throw error;
      
      setCollections(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating collection:', err);
      return { success: false, error: err.message };
    }
  };

  // Update collection
  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCollections(prev => prev.map(col => col.id === id ? data : col));
      return { success: true };
    } catch (err: any) {
      console.error('Error updating collection:', err);
      return { success: false, error: err.message };
    }
  };

  // Connect to household
  const connectToHousehold = async (householdId: string, inviteCode?: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      // If invite code provided, validate it
      if (inviteCode) {
        const { data: household, error: householdError } = await supabase
          .from('households')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();
        
        if (householdError || !household) {
          return { success: false, error: 'Invalid invite code' };
        }
        householdId = household.id;
      }
      
      const { data, error } = await supabase
        .from('household_connections')
        .insert([{
          household_id: householdId,
          collector_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setHouseholdConnections(prev => [data, ...prev]);
      return { success: true };
    } catch (err: any) {
      console.error('Error connecting to household:', err);
      return { success: false, error: err.message };
    }
  };

  // Disconnect from household
  const disconnectFromHousehold = async (connectionId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { error } = await supabase
        .from('household_connections')
        .update({ status: 'disconnected' })
        .eq('id', connectionId);
      
      if (error) throw error;
      
      setHouseholdConnections(prev => prev.filter(conn => conn.id !== connectionId));
      return { success: true };
    } catch (err: any) {
      console.error('Error disconnecting from household:', err);
      return { success: false, error: err.message };
    }
  };

  // Helper to get price for a type
  const getPriceForType = (type: RecyclableType): RecyclablePrice | undefined => {
    return RECYCLABLE_PRICES.find(price => price.type === type);
  };

  // Helper to calculate earnings
  const calculateEarnings = (items: { type: RecyclableType; weight: number }[]): number => {
    return items.reduce((total, item) => {
      const price = getPriceForType(item.type);
      return total + (price ? price.pricePerKg * item.weight : 0);
    }, 0);
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchRecyclableItems();
      fetchCollections();
      fetchCollectorStats();
      fetchHouseholdConnections();
    }
  }, [user, fetchRecyclableItems, fetchCollections, fetchCollectorStats, fetchHouseholdConnections]);

  const value = {
    recyclableItems,
    collections,
    collectorStats,
    householdConnections,
    loading,
    error,
    fetchRecyclableItems,
    fetchCollections,
    fetchCollectorStats,
    fetchHouseholdConnections,
    addRecyclableItem,
    updateRecyclableItem,
    deleteRecyclableItem,
    createCollection,
    updateCollection,
    connectToHousehold,
    disconnectFromHousehold,
    getPriceForType,
    calculateEarnings,
  };

  return (
    <RecyclablesContext.Provider value={value}>
      {children}
    </RecyclablesContext.Provider>
  );
}

// Custom hook
export function useRecyclables() {
  const context = useContext(RecyclablesContext);
  if (context === null) {
    throw new Error('useRecyclables must be used within a RecyclablesProvider');
  }
  return context;
}