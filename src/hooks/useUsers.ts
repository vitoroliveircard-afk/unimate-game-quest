import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  user_id: string;
  email: string;
  nome: string;
  role: AppRole;
  created_at: string;
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;
      return data as UserWithRole[];
    },
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.rpc('set_user_role', {
        target_user_id: userId,
        new_role: role,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['is-admin'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
    },
  });
}
