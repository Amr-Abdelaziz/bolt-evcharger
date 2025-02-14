import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email: string, password: string) => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }

      if (!authUser) {
        throw new Error('No user data returned after login');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Error loading user profile');
      }

      if (!profile) {
        throw new Error('User profile not found');
      }

      set({
        user: {
          id: authUser.id,
          email: authUser.email!,
          name: profile.name,
          phone: profile.phone,
          walletBalance: profile.wallet_balance || 0,
        },
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'An error occurred during login');
    }
  },

  signup: async (email: string, password: string) => {
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
        throw signUpError;
      }

      if (!authUser) {
        throw new Error('No user data returned after signup');
      }

      // Create initial profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          wallet_balance: 0,
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error('Error creating user profile');
      }

      set({
        user: {
          id: authUser.id,
          email: authUser.email!,
          name: null,
          phone: null,
          walletBalance: 0,
        },
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'An error occurred during signup');
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAuthenticated: false });
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Error during logout');
    }
  },

  addFunds: async (amount: number) => {
    const user = get().user;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('User profile not found');
      }

      const newBalance = profile.wallet_balance + amount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      set((state) => ({
        user: state.user ? { ...state.user, walletBalance: newBalance } : null,
      }));
    } catch (error: any) {
      console.error('Add funds error:', error);
      throw new Error(error.message || 'An error occurred while adding funds.');
    }
  },
}));
