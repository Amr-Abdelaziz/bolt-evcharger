export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  walletBalance: number;
}

export interface Charger {
  id: string;
  type: 'fast' | 'standard';
  status: 'available' | 'occupied' | 'maintenance';
  price_per_kwh: number;
  latitude: number;
  longitude: number;
  estimated_wait_time?: number;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id: string;
  userId: string;
  chargerId: string;
  startTime: Date;
  duration: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  estimatedCost: number;
}
