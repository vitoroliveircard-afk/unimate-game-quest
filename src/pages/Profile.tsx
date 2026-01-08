import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Trophy, Package, Settings, Check, Download, 
  Coins, Star, Target, BookOpen, Bug, Crown, Eye, Compass, Wrench,
  Footprints, GraduationCap, Skull
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { CoinCounter } from '@/components/CoinCounter';
import { XPBar } from '@/components/XPBar';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useUserInventory, type ShopItem } from '@/hooks/useShop';
import { useAchievements, useUserAchievements, type Achievement } from '@/hooks/useAchievements';
import { useEquipItem } from '@/hooks/useCoins';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Bug: <Bug className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
  Eye: <Eye className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  Footprints: <Footprints className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Skull: <Skull className="w-6 h-6" />,
};

type TabType = 'achievements' | 'inventory';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { data: inventory = [] } = useUserInventory();
  const { data: achievements = [] } = useAchievements();
  const { data: userAchievements = [] } = useUserAchievements();
  const equipItem = useEquipItem();
  
  const [activeTab, setActiveTab] = useState<TabType>('achievements');

  const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
  
  const avatarItems = inventory.filter(i => (i.shop_items as ShopItem | undefined)?.type === 'avatar');
  const frameItems = inventory.filter(i => (i.shop_items as ShopItem | undefined)?.type === 'frame');
  const assetItems = inventory.filter(i => (i.shop_items as ShopItem | undefined)?.type === 'asset_pack');

  const handleEquip = async (itemId: string, type: 'avatar' | 'frame') => {
    try {
      await equipItem.mutateAsync({ itemId, type });
      toast({
        title: '✨ Item equipado!',
        description: type === 'avatar' ? 'Seu avatar foi atualizado.' : 'Sua moldura foi atualizada.',
      });
    } catch {
      toast({ title: 'Erro ao equipar item', variant: 'destructive' });
    }
  };

  const currentAvatarUrl = profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=player';

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
          </div>
          <CoinCounter coins={profile?.coins || 0} />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar with Frame */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-cyan-400 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  <img
                    src={currentAvatarUrl}
                    alt={profile?.nome || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-cyan-400 rounded-full">
                <span className="text-sm font-bold text-white">Nível {profile?.level || 1}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black mb-2">{profile?.nome || 'Jogador'}</h1>
              <div className="mb-4">
                <XPBar xp={profile?.xp_total || 0} level={profile?.level || 1} />
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-amber-400">{profile?.coins || 0} UniBits</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-purple-400">{userAchievements.length} Conquistas</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'achievements' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('achievements')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Conquistas
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('inventory')}
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            Inventário
          </Button>
        </div>

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const isEarned = earnedAchievementIds.has(achievement.id);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card p-4 text-center ${
                    isEarned ? '' : 'opacity-50 grayscale'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    isEarned 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {iconMap[achievement.icon] || <Trophy className="w-6 h-6" />}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                  {isEarned && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-400">
                      <Check className="w-3 h-3" />
                      Conquistado
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            {/* Avatars */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Avatares ({avatarItems.length})
              </h3>
              {avatarItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum avatar comprado ainda.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {avatarItems.map((item) => {
                    const shopItem = item.shop_items as ShopItem | undefined;
                    const isEquipped = profile?.current_avatar_id === item.item_id;
                    
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        className={`glass-card p-2 cursor-pointer ${isEquipped ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => handleEquip(item.item_id, 'avatar')}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-white/5 mb-2">
                          <img
                            src={shopItem?.image_url || ''}
                            alt={shopItem?.name || ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-medium text-center truncate">{shopItem?.name}</p>
                        {isEquipped && (
                          <div className="text-xs text-center text-primary mt-1">Equipado</div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Frames */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Molduras ({frameItems.length})
              </h3>
              {frameItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma moldura comprada ainda.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {frameItems.map((item) => {
                    const shopItem = item.shop_items as ShopItem | undefined;
                    const isEquipped = profile?.current_frame_id === item.item_id;
                    
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        className={`glass-card p-2 cursor-pointer ${isEquipped ? 'ring-2 ring-purple-400' : ''}`}
                        onClick={() => handleEquip(item.item_id, 'frame')}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-white/5 mb-2 flex items-center justify-center">
                          <Settings className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs font-medium text-center truncate">{shopItem?.name}</p>
                        {isEquipped && (
                          <div className="text-xs text-center text-purple-400 mt-1">Equipado</div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Asset Packs */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Packs de Assets ({assetItems.length})
              </h3>
              {assetItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum pack de assets comprado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assetItems.map((item) => {
                    const shopItem = item.shop_items as ShopItem | undefined;
                    
                    return (
                      <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Package className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{shopItem?.name}</h4>
                          <p className="text-sm text-muted-foreground">{shopItem?.description}</p>
                        </div>
                        {shopItem?.asset_download_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(shopItem.asset_download_url || '', '_blank')}
                            className="gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Baixar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
