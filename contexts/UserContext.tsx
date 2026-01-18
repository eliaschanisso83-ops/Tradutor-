import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface UserContextType {
  user: UserProfile | null;
  updateProfile: (username: string, avatar: string) => Promise<void>;
  isLoading: boolean;
  isProfileOpen: boolean;
  setProfileOpen: (isOpen: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'afrilingo_user_id';

const DEFAULT_AVATARS = ['🦁', '🐘', '🦒', '🦓', '🌍', '🥁', '🌞', '💎'];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setProfileOpen] = useState(false);

  // Initialize User
  useEffect(() => {
    const initUser = async () => {
      setIsLoading(true);
      
      // 1. Get or Create Local ID
      let userId = localStorage.getItem(STORAGE_KEY);
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, userId);
      }

      // 2. Try to fetch profile from Supabase
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data) {
          setUser({
            id: data.id,
            username: data.username,
            avatar: data.avatar || '🦁'
          });
        } else {
          // No profile yet, creates a temporary local state
          // We don't save to DB until they actually set a name
          setUser({
            id: userId,
            username: 'Guest Explorer',
            avatar: '🦁'
          });
        }
      } catch (e) {
        console.error("Error fetching profile", e);
        // Fallback to local guest
        setUser({
          id: userId,
          username: 'Guest Explorer',
          avatar: '🦁'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  const updateProfile = async (username: string, avatar: string) => {
    if (!user) return;

    // Optimistic Update
    const updatedUser = { ...user, username, avatar };
    setUser(updatedUser);

    try {
      // Upsert to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          avatar,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (e) {
      console.error("Error saving profile", e);
      // Revert if critical (optional, for now we keep optimistic state)
    }
  };

  return (
    <UserContext.Provider value={{ user, updateProfile, isLoading, isProfileOpen, setProfileOpen }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
