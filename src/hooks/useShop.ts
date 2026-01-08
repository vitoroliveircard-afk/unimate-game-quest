import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: 'avatar' | 'frame' | 'asset_pack' | 'theme';
  price: number;
  image_url: string | null;
  asset_download_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  purchased_at: string;
  shop_items?: ShopItem;
}

export function useShopItems() {
  return useQuery({
    queryKey: ['shop_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data as ShopItem[];
    },
  });
}

export function useAllShopItems() {
  return useQuery({
    queryKey: ['shop_items_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('type', { ascending: true })
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data as ShopItem[];
    },
  });
}

export function useUserInventory() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user_inventory', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_inventory')
        .select('*, shop_items(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserInventoryItem[];
    },
    enabled: !!user?.id,
  });
}

export function usePurchaseItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ itemId, price }: { itemId: string; price: number }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get current coins
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const currentCoins = profile?.coins || 0;
      if (currentCoins < price) {
        throw new Error('Moedas insuficientes');
      }
      
      // Check if already owned
      const { data: existing } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle();
      
      if (existing) {
        throw new Error('Você já possui este item');
      }
      
      // Deduct coins
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: currentCoins - price })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      // Add to inventory
      const { data, error } = await supabase
        .from('user_inventory')
        .insert({
          user_id: user.id,
          item_id: itemId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCreateShopItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<ShopItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('shop_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop_items'] });
      queryClient.invalidateQueries({ queryKey: ['shop_items_all'] });
    },
  });
}

export function useUpdateShopItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShopItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('shop_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop_items'] });
      queryClient.invalidateQueries({ queryKey: ['shop_items_all'] });
    },
  });
}

export function useDeleteShopItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shop_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop_items'] });
      queryClient.invalidateQueries({ queryKey: ['shop_items_all'] });
    },
  });
}
