import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAddCoins() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get current coins
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const newCoins = (profile?.coins || 0) + amount;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
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

export function useEquipItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ itemId, type }: { itemId: string; type: 'avatar' | 'frame' }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const updateData = type === 'avatar' 
        ? { current_avatar_id: itemId }
        : { current_frame_id: itemId };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
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
