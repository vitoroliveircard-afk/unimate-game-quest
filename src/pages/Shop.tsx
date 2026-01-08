import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, ShoppingBag, User, Frame, Package, Palette, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { CoinCounter } from '@/components/CoinCounter';
import { UserAvatar } from '@/components/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useShopItems, usePurchaseItem, useUserInventory, type ShopItem } from '@/hooks/useShop';
import { useToast } from '@/hooks/use-toast';

type TabType = 'avatar' | 'frame' | 'asset_pack';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'avatar', label: 'Avatares', icon: <User className="w-4 h-4" /> },
  { id: 'frame', label: 'Molduras', icon: <Frame className="w-4 h-4" /> },
  { id: 'asset_pack', label: 'Assets', icon: <Package className="w-4 h-4" /> },
];

export default function Shop() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { data: shopItems = [], isLoading } = useShopItems();
  const { data: inventory = [] } = useUserInventory();
  const purchaseItem = usePurchaseItem();
  
  const [activeTab, setActiveTab] = useState<TabType>('avatar');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const filteredItems = shopItems.filter(item => item.type === activeTab);
  const ownedItemIds = new Set(inventory.map(i => i.item_id));
  const coins = profile?.coins || 0;

  const handlePurchase = async (item: ShopItem) => {
    if (coins < item.price) {
      // Shake animation handled in UI
      toast({
        title: '❌ Moedas Insuficientes',
        description: `Você precisa de mais ${item.price - coins} moedas.`,
        variant: 'destructive',
      });
      return;
    }

    setPurchasingId(item.id);
    
    try {
      await purchaseItem.mutateAsync({ itemId: item.id, price: item.price });
      
      // Play kaching sound
      const audio = new Audio('/kaching.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      
      toast({
        title: '🎉 Compra Realizada!',
        description: `Você adquiriu "${item.name}"!`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro na compra',
        description: error.message || 'Não foi possível completar a compra.',
        variant: 'destructive',
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="sm" />
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-gradient-blue">Loja</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <CoinCounter coins={coins} />
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              nome={profile?.nome}
              level={profile?.level || 1}
              size="sm"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className="gap-2 whitespace-nowrap"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nenhum item disponível nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                const isOwned = ownedItemIds.has(item.id);
                const canAfford = coins >= item.price;
                const isPurchasing = purchasingId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 relative overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {activeTab === 'avatar' && <User className="w-20 h-20 text-muted-foreground/30" />}
                          {activeTab === 'frame' && <Frame className="w-20 h-20 text-muted-foreground/30" />}
                          {activeTab === 'asset_pack' && <Package className="w-20 h-20 text-muted-foreground/30" />}
                        </div>
                      )}
                      
                      {/* Owned badge */}
                      {isOwned && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Adquirido
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Price and Buy Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-amber-400">{item.price}</span>
                        </div>

                        {isOwned ? (
                          <Button variant="outline" size="sm" disabled>
                            <Check className="w-4 h-4 mr-1" />
                            Adquirido
                          </Button>
                        ) : (
                          <motion.div
                            animate={!canAfford ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                          >
                            <Button
                              variant={canAfford ? 'neon' : 'outline'}
                              size="sm"
                              onClick={() => handlePurchase(item)}
                              disabled={isPurchasing || !canAfford}
                              className="gap-1"
                            >
                              {isPurchasing ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : !canAfford ? (
                                <>
                                  <Lock className="w-4 h-4" />
                                  Bloqueado
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-4 h-4" />
                                  Comprar
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
