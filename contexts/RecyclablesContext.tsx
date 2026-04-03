import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { RecyclableItem, RecyclableType, RecyclablePrice, Collection, CollectorStats, HouseholdConnection } from '@/types';
import { Alert } from 'react-native';

interface RecyclablesContextType {
  recyclableItems: RecyclableItem[];
  recyclableTypes: RecyclableType[];
  collections: Collection[];
  collectorStats: CollectorStats | null;
  activeConnections: HouseholdConnection[];
  pendingConnections: HouseholdConnection[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addRecyclableItem: (item: Omit<RecyclableItem, 'id' | 'loggedAt' | 'collected'>) => Promise<{ success: boolean; error?: string }>;
  updateRecyclableItem: (id: string, updates: Partial<RecyclableItem>) => Promise<{ success: boolean; error?: string }>;
  deleteRecyclableItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  createCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<{ success: boolean; error?: string }>;
  fetchHouseholdConnections: () => Promise<void>;
  addHouseholdConnection: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  updateConnectionStatus: (connectionId: string, status: 'active' | 'inactive' | 'disconnected') => Promise<{ success: boolean; error?: string }>;
}

const RecyclablesContext = createContext<RecyclablesContextType | undefined>(undefined);

export const RecyclablesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [recyclableItems, setRecyclableItems] = useState<RecyclableItem[]>([]);
  const [recyclableTypes, setRecyclableTypes] = useState<RecyclableType[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectorStats, setCollectorStats] = useState<CollectorStats | null>(null);
  const [activeConnections, setActiveConnections] = useState<HouseholdConnection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<HouseholdConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecyclableTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('recyclable_types' as any)
        .select('*')
        .eq('active', true);

      if (error) throw error;
      setRecyclableTypes(data as RecyclableType[]);
    } catch (error) {
      console.error('Error fetching recyclable types:', error);
    }
  }, []);

  const fetchRecyclableItems = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('logged_items' as any)
        .select(`
          *,
          type:recyclable_type_id(*)
        `)
        .eq('household_id', user.id)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      
      const formattedItems: RecyclableItem[] = (data || []).map((item: any) => ({
        id: item.id,
        householdId: item.household_id,
        recyclableTypeId: item.recyclable_type_id,
        type: item.type,
        quantity: item.quantity,
        estimatedWeightKg: item.estimated_weight_kg,
        notes: item.notes,
        loggedAt: item.logged_at,
        collected: item.collected,
        collectionId: item.collection_id
      }));

      setRecyclableItems(formattedItems);
    } catch (error) {
      console.error('Error fetching recyclable items:', error);
    }
  }, [user]);

  const fetchCollections = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('user_profiles' as any)
        .select('is_collector')
        .eq('id', user.id)
        .single();
      
      const profile = profileData as any;

      let query = supabase.from('collections' as any).select('*');

      if (profile?.is_collector) {
        // Fetch collections where user is either the collector OR the household
        query = query.or(`collector_id.eq.${user.id},household_id.eq.${user.id}`);
      } else {
        query = query.eq('household_id', user.id);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: false });

      if (error) throw error;
      
      const formattedCollections: Collection[] = (data || []).map((c: any) => ({
        id: c.id,
        collectorId: c.collector_id,
        householdId: c.household_id,
        householdName: c.household_name || `Household ${c.household_id.slice(0, 8)}`,
        scheduledDate: c.scheduled_date,
        status: c.status,
        items: c.items || [],
        totalWeight: c.total_weight || 0,
        estimatedEarnings: c.estimated_earnings || 0,
        completedAt: c.completed_at
      }));

      setCollections(formattedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  }, [user]);

  const fetchCollectorStats = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('user_profiles' as any)
        .select('is_collector')
        .eq('id', user.id)
        .single();
      
      const profile = profileData as any;

      if (!profile?.is_collector) return;

      const { data, error } = await supabase
        .from('collections' as any)
        .select('total_weight_kg, actual_earnings')
        .eq('collector_id', user.id)
        .eq('status', 'completed');

      if (error) throw error;

      const statsData = data as any[];
      const totalWeight = statsData.reduce((acc, curr) => acc + (curr.total_weight_kg || 0), 0);
      const totalEarnings = statsData.reduce((acc, curr) => acc + (curr.actual_earnings || 0), 0);

      setCollectorStats({
        totalWeight,
        totalEarnings,
        totalCollections: statsData.length,
        householdsCount: 0,
        weeklyEarnings: totalEarnings,
      });
    } catch (error) {
      console.error('Error fetching collector stats:', error);
    }
  }, [user]);

  const fetchHouseholdConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('user_profiles' as any)
        .select('is_collector')
        .eq('id', user.id)
        .single();
      
      const profile = profileData as any;

      if (!profile?.is_collector) return;

      const { data, error } = await supabase
        .from('household_connections' as any)
        .select(`
          *,
          household:household_id(id, full_name, phone_number)
        `)
        .eq('collector_id', user.id);

      if (error) throw error;

      const connections = data as any[];
      setActiveConnections(connections.filter(c => c.status === 'active'));
      setPendingConnections(connections.filter(c => c.status === 'pending'));
    } catch (error) {
      console.error('Error fetching household connections:', error);
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchRecyclableTypes(),
      fetchRecyclableItems(),
      fetchCollections(),
      fetchCollectorStats(),
      fetchHouseholdConnections(),
    ]);
    setLoading(false);
  }, [fetchRecyclableTypes, fetchRecyclableItems, fetchCollections, fetchCollectorStats, fetchHouseholdConnections]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const addRecyclableItem = async (item: Omit<RecyclableItem, 'id' | 'loggedAt' | 'collected'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('logged_items' as any)
        .insert([{
          household_id: user.id,
          recyclable_type_id: item.recyclableTypeId,
          quantity: item.quantity,
          estimated_weight_kg: item.estimatedWeightKg,
          notes: item.notes,
          collected: false
        } as any]);

      if (error) throw error;
      
      await fetchRecyclableItems();
      return { success: true };
    } catch (error: any) {
      console.error('Error adding recyclable item:', error);
      return { success: false, error: error.message };
    }
  };

  const updateRecyclableItem = async (id: string, updates: Partial<RecyclableItem>) => {
    try {
      const dbUpdates: any = {};
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.estimatedWeightKg !== undefined) dbUpdates.estimated_weight_kg = updates.estimatedWeightKg;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.collected !== undefined) dbUpdates.collected = updates.collected;
      if (updates.collectionId !== undefined) dbUpdates.collection_id = updates.collectionId;

      const { error } = await supabase
        .from('logged_items' as any)
        .update(dbUpdates as any)
        .eq('id', id);

      if (error) throw error;
      await fetchRecyclableItems();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating recyclable item:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteRecyclableItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('logged_items' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRecyclableItems();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting recyclable item:', error);
      return { success: false, error: error.message };
    }
  };

  const createCollection = async (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { error } = await supabase
        .from('collections' as any)
        .insert([collection as any]);

      if (error) throw error;
      await fetchCollections();
      return { success: true };
    } catch (error: any) {
      console.error('Error creating collection:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    try {
      const { error } = await supabase
        .from('collections' as any)
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;
      await fetchCollections();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating collection:', error);
      return { success: false, error: error.message };
    }
  };

  const addHouseholdConnection = async (inviteCode: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // 1. Find household by invite code
      const { data: householdData, error: fetchError } = await supabase
        .from('user_profiles' as any)
        .select('id')
        .eq('invite_code', inviteCode)
        .single();
      
      const household = householdData as any;

      if (fetchError || !household) {
        return { success: false, error: 'Invalid invite code' };
      }

      // 2. Check if already connected
      const { data: existingConnection } = await supabase
        .from('household_connections' as any)
        .select('id')
        .eq('collector_id', user.id)
        .eq('household_id', household.id)
        .maybeSingle();

      if (existingConnection) {
        return { success: false, error: 'Already connected to this household' };
      }

      // 3. Create connection
      const { error: connectError } = await supabase
        .from('household_connections' as any)
        .insert([{
          household_id: household.id,
          collector_id: user.id,
          status: 'pending'
        } as any]);

      if (connectError) throw connectError;
      
      await fetchHouseholdConnections();
      return { success: true };
    } catch (error: any) {
      console.error('Error adding household connection:', error);
      return { success: false, error: error.message };
    }
  };

  const updateConnectionStatus = async (connectionId: string, status: 'active' | 'inactive' | 'disconnected') => {
    try {
      const { error } = await supabase
        .from('household_connections' as any)
        .update({ status } as any)
        .eq('id', (connectionId as any));

      if (error) throw error;
      await fetchHouseholdConnections();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating connection status:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <RecyclablesContext.Provider
      value={{
        recyclableItems,
        recyclableTypes,
        collections,
        collectorStats,
        activeConnections,
        pendingConnections,
        loading,
        refreshData,
        addRecyclableItem,
        updateRecyclableItem,
        deleteRecyclableItem,
        createCollection,
        updateCollection,
        fetchHouseholdConnections,
        addHouseholdConnection,
        updateConnectionStatus,
      }}
    >
      {children}
    </RecyclablesContext.Provider>
  );
};

export const useRecyclables = () => {
  const context = useContext(RecyclablesContext);
  if (context === undefined) {
    throw new Error('useRecyclables must be used within a RecyclablesProvider');
  }
  return context;
};