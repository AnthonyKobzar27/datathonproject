import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const auth = {
  async signUp(email: string, password: string, username?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper function to generate ETH-style hash
function generateUserHash(userId: string, email: string): string {
  // Generate a hash from user ID + email
  // Use a simple hash function that creates a consistent 40-char hex string
  const str = `${userId}-${email}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Create a longer hash by combining multiple parts
  const hash1 = Math.abs(hash).toString(16);
  const hash2 = Math.abs(hash * 31 + str.length).toString(16);
  const hash3 = Math.abs(hash * 17 + email.length).toString(16);
  // Combine and pad to 40 characters (ETH address length)
  const combined = (hash1 + hash2 + hash3).replace(/[^0-9a-f]/g, '');
  const hex = combined.padStart(40, '0').substring(0, 40);
  return `0x${hex}`;
}

// Database helper functions
export const db = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async createProfile(userId: string, email: string) {
    const userhash = generateUserHash(userId, email);
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: email,
        userhash: userhash,
      })
      .select()
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },

  async getPredictions(userId: string) {
    const { data, error } = await supabase
      .from('predictions_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async savePrediction(userId: string, predictionData: any) {
    const { data, error } = await supabase
      .from('predictions_history')
      .insert({
        user_id: userId,
        ...predictionData,
      })
      .select()
      .single();
    return { data, error };
  },
};
