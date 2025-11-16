'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, db } from './supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  username?: string;
  userhash: string;
  name?: string;
  phone?: string;
  organization?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isLoadingProfileRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const loadProfile = async (userId: string, userEmail?: string) => {
      // Prevent multiple simultaneous profile loads using ref
      if (isLoadingProfileRef.current) {
        console.log('Profile load already in progress, skipping...');
        return;
      }

      isLoadingProfileRef.current = true;
      try {
        let { data, error } = await db.getProfile(userId);
        
        // If profile doesn't exist (error or no data), create it
        if (!data || (error && (error.code === 'PGRST116' || error.message?.includes('No rows')))) {
          const email = userEmail || (await auth.getUser()).data?.user?.email;
          if (email) {
            const createResult = await db.createProfile(userId, email);
            if (createResult.error) {
              console.error('Error creating profile:', createResult.error);
              if (isMounted) {
                setProfile(null);
              }
              return;
            }
            data = createResult.data;
          } else {
            console.error('Cannot create profile: no email available');
            if (isMounted) {
              setProfile(null);
            }
            return;
          }
        } else if (error) {
          console.error('Error loading profile:', error);
          if (isMounted) {
            setProfile(null);
          }
          return;
        }
        
        if (isMounted && data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        isLoadingProfileRef.current = false;
      }
    };

    // Check initial session
    const checkSession = async () => {
      try {
        const { session } = await auth.getSession();
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          setIsLoggedIn(true);
          // Load profile but don't wait for it - set loading to false immediately
          // Profile will load in background
          loadProfile(session.user.id, session.user.email).catch(err => {
            console.error('Background profile load failed:', err);
          });
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        // Always set loading to false after auth check, regardless of profile status
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription: sub } } = auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // Only set loading for actual auth changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setIsLoading(true);
      }
      
      try {
        if (session?.user) {
          setUser(session.user);
          setIsLoggedIn(true);
          // Load profile in background - don't block on it
          loadProfile(session.user.id, session.user.email).catch(err => {
            console.error('Background profile load failed:', err);
          });
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        // Always set loading to false after auth state change
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    subscription = sub;

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await auth.signIn(email, password);
      if (error) throw error;
      // Profile will be loaded by auth state change listener
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await auth.signUp(email, password, username);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setIsLoggedIn(false);
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };
    
    setIsLoading(true);
    try {
      const { data, error } = await db.updateProfile(user.id, updates);
      if (error) throw error;
      if (data) setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const email = user.email || (await auth.getUser()).data?.user?.email;
      // We need to access loadProfile, but it's inside useEffect
      // So we'll trigger a re-check by calling getProfile directly
      try {
        let { data, error } = await db.getProfile(user.id);
        if (!data || (error && (error.code === 'PGRST116' || error.message?.includes('No rows')))) {
          const userEmail = email || user.email;
          if (userEmail) {
            const createResult = await db.createProfile(user.id, userEmail);
            if (!createResult.error && createResult.data) {
              setProfile(createResult.data);
            }
          }
        } else if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  return {
    user,
    profile,
    isLoggedIn,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };
}

