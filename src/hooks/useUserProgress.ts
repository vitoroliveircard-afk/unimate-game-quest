import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

export type UserProgress = Tables<'user_progress'>;

export function useUserProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserProgress[];
    },
    enabled: !!user?.id,
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ lessonId, quizScore }: { lessonId: string; quizScore?: number }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if progress already exists
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();
      
      if (existing) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
            quiz_score: quizScore ?? null,
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new progress
        const { data, error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            quiz_score: quizScore ?? null,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_progress'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateXP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (xpToAdd: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get current profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp_total, level')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const newXP = (profile?.xp_total || 0) + xpToAdd;
      const newLevel = Math.floor(newXP / 500) + 1;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ xp_total: newXP, level: newLevel })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
