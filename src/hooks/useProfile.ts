import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  nome: string;
  avatar_url: string | null;
  xp_total: number;
  level: number;
  current_streak: number;
  coins: number;
  current_avatar_id: string | null;
  current_frame_id: string | null;
  theme_preference: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const addXP = useMutation({
    mutationFn: async (xpAmount: number) => {
      if (!user?.id || !profile) throw new Error('No user or profile');
      
      const newXP = profile.xp_total + xpAmount;
      const newLevel = calculateLevel(newXP);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          xp_total: newXP,
          level: newLevel,
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    addXP: addXP.mutate,
  };
}

// Calculate level based on XP (each level needs progressively more XP)
export function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Calculate XP needed for next level
export function xpForNextLevel(level: number): number {
  return level * level * 100;
}

// Calculate XP progress to next level (0-100%)
export function xpProgressPercent(xp: number, level: number): number {
  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
