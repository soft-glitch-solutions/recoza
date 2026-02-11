
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { RecyclableItem, RecyclableType, RecyclablePrice, Collection, CollectorStats, HouseholdConnection } from '@/types';
import { useAuth } from './AuthContext';

const RECYCLABLE_PRICES: RecyclablePrice[] = [
  { type: 'plastic', pricePerKg: 8.50, label: 'Plastic', icon: 'bottle-soda' },
  { type: 'paper', pricePerKg: 3.00, label: 'Paper', icon: 'newspaper' },
  { type: 'glass', pricePerKg: 1.50, label: 'Glass', icon: 'wine-bottle' },
  { type: 'metal', pricePerKg: 12.00, label: 'Metal/Cans', icon: 'cylinder' },
  { type: 'cardboard', pricePerKg: 2.50, label: 'Cardboard', icon: 'box' },
];

