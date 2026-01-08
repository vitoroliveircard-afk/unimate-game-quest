import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  user_id: string;
  nome: string;
  avatar_url: string | null;
  level: number;
  xp_total: number;
  featured_achievements: string[] | null;
}

// Search users by name
export function useSearchUsers(searchQuery: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, nome, avatar_url, level')
        .ilike('nome', `%${searchQuery}%`)
        .neq('user_id', user?.id || '')
        .limit(10);
      
      if (error) throw error;
      return data as PublicProfile[];
    },
    enabled: searchQuery.length >= 2,
  });
}

// Get user's friends (accepted)
export function useFriends() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return data as Friendship[];
    },
    enabled: !!user?.id,
  });
}

// Get pending friend requests (received)
export function usePendingRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pending-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data as Friendship[];
    },
    enabled: !!user?.id,
  });
}

// Get sent requests (pending)
export function useSentRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sent-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data as Friendship[];
    },
    enabled: !!user?.id,
  });
}

// Get a public profile
export function usePublicProfile(userId: string | null) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, nome, avatar_url, level, xp_total, featured_achievements')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data as PublicProfile;
    },
    enabled: !!userId,
  });
}

// Send friend request
export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      queryClient.invalidateQueries({ queryKey: ['search-users'] });
    },
  });
}

// Accept friend request
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
  });
}

// Decline/Remove friendship
export function useRemoveFriendship() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
    },
  });
}

// Get friendship status with a specific user
export function useFriendshipStatus(targetUserId: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['friendship-status', user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return null;
      
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`)
        .maybeSingle();
      
      if (error) throw error;
      return data as Friendship | null;
    },
    enabled: !!user?.id && !!targetUserId,
  });
}
