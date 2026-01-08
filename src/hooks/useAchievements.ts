import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  condition_type: string;
  condition_value: string | null;
  xp_reward: number;
  coin_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievements?: Achievement;
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('condition_type')
        .order('xp_reward');
      
      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function useUserAchievements() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user?.id,
  });
}

export function useEarnAchievement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (achievementId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if already earned
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .maybeSingle();
      
      if (existing) return null; // Already earned
      
      // Get achievement rewards
      const { data: achievement, error: achError } = await supabase
        .from('achievements')
        .select('xp_reward, coin_reward')
        .eq('id', achievementId)
        .single();
      
      if (achError) throw achError;
      
      // Get current profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp_total, coins')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Update profile with rewards
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          xp_total: (profile?.xp_total || 0) + achievement.xp_reward,
          coins: (profile?.coins || 0) + achievement.coin_reward,
        })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      // Add achievement
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        })
        .select('*, achievements(*)')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_achievements'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCheckAchievements() {
  const { user } = useAuth();
  const earnAchievement = useEarnAchievement();
  
  return useMutation({
    mutationFn: async ({ 
      conditionType, 
      conditionValue 
    }: { 
      conditionType: string; 
      conditionValue: string | number;
    }) => {
      if (!user?.id) return [];
      
      // Get all achievements of this type
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('condition_type', conditionType);
      
      if (error) throw error;
      
      const earned: Achievement[] = [];
      
      for (const achievement of achievements || []) {
        const requiredValue = parseInt(achievement.condition_value || '0');
        const actualValue = typeof conditionValue === 'number' ? conditionValue : parseInt(conditionValue);
        
        if (actualValue >= requiredValue) {
          const result = await earnAchievement.mutateAsync(achievement.id);
          if (result) {
            earned.push(achievement);
          }
        }
      }
      
      return earned;
    },
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (achievement: Omit<Achievement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('achievements')
        .insert(achievement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Achievement> & { id: string }) => {
      const { data, error } = await supabase
        .from('achievements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}
