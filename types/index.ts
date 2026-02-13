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
  userId: string;
  type: RecyclableType;
  quantity: number;
  unit: 'kg' | 'items';
  loggedAt: string;
  collected: boolean;
  collectedAt?: string;
  collectorId?: string;
}

export type RecyclableType = 'plastic' | 'paper' | 'glass' | 'metal' | 'cardboard';

export interface RecyclablePrice {
  type: RecyclableType;
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
}
