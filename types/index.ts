export interface User {
  $id: string;
  email: string;
  name: string;
  phone?: string;
  isCollector: boolean;
  collectorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  defaultCollectorId?: string;
  inviteCode?: string;
  createdAt: string;
}

export interface RecyclableItem {
  id: string;
  householdId?: string;
  recyclableTypeId: string;
  type?: RecyclableType; // Optional joined data
  quantity: number;
  estimatedWeightKg: number;
  notes?: string;
  loggedAt: string;
  collected: boolean;
  collectionId?: string;
}

export interface RecyclableType {
  id: string;
  name: string;
  description?: string;
  estimatedPricePerKg: number;
  iconName: string;
  active: boolean;
}

export interface RecyclablePrice {
  type: string; // Type name
  pricePerKg: number;
  label: string;
  icon: string;
}

export interface Collection {
  id: string;
  collectorId: string;
  householdId: string;
  householdName: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  items: RecyclableItem[];
  totalWeight: number;
  estimatedEarnings: number;
  completedAt?: string;
}

export interface CollectorStats {
  totalCollections: number;
  totalEarnings: number;
  totalWeight: number;
  householdsCount: number;
  weeklyEarnings: number;
}

export interface HouseholdConnection {
  id: string;
  householdId: string;
  householdName: string;
  householdEmail: string;
  connectedAt: string;
  totalItemsLogged: number;
  status?: 'active' | 'pending' | 'inactive' | 'disconnected';
}
