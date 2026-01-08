import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePublicProfile, useFriendshipStatus, useSendFriendRequest, useRemoveFriendship } from '@/hooks/useFriendships';
import { useAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Star, UserPlus, UserMinus, Clock, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PublicProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicProfileModal({ userId, open, onOpenChange }: PublicProfileModalProps) {
  const { user: currentUser } = useAuth();
  const { data: profile, isLoading } = usePublicProfile(userId);
  const { data: friendship } = useFriendshipStatus(userId);
  const { data: allAchievements = [] } = useAchievements();
  const sendRequest = useSendFriendRequest();
  const removeFriendship = useRemoveFriendship();
  const { toast } = useToast();

  const isOwnProfile = currentUser?.id === userId;

  const featuredAchievements = profile?.featured_achievements
    ?.map(id => allAchievements.find(a => a.id === id))
    .filter(Boolean) || [];

  const handleAddFriend = async () => {
    if (!userId) return;
    try {
      await sendRequest.mutateAsync(userId);
      toast({
        title: 'Solicitação enviada!',
        description: 'Aguarde a resposta do jogador.',
      });
    } catch (e) {
      toast({
        title: 'Erro',
        description: e instanceof Error ? e.message : 'Erro ao enviar solicitação.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendship?.id) return;
    try {
      await removeFriendship.mutateAsync(friendship.id);
      toast({ title: 'Amigo removido' });
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o amigo.',
        variant: 'destructive',
      });
    }
  };

  const renderFriendshipButton = () => {
    if (isOwnProfile) return null;

    if (friendship?.status === 'accepted') {
      return (
        <Button variant="outline" onClick={handleRemoveFriend} className="gap-2">
          <UserMinus className="w-4 h-4" />
          Remover Amigo
        </Button>
      );
    }

    if (friendship?.status === 'pending') {
      const isSender = friendship.requester_id === currentUser?.id;
      return (
        <Button variant="outline" disabled className="gap-2">
          <Clock className="w-4 h-4" />
          {isSender ? 'Solicitação Enviada' : 'Solicitação Recebida'}
        </Button>
      );
    }

    return (
      <Button onClick={handleAddFriend} disabled={sendRequest.isPending} className="gap-2">
        <UserPlus className="w-4 h-4" />
        Adicionar Amigo
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Perfil de {profile.nome}</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Avatar with level border */}
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-50"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.5))`,
                  }}
                />
                <Avatar className="w-24 h-24 ring-4 ring-primary/50 relative">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">{profile.nome?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Nível {profile.level}
                </Badge>
              </div>

              {/* Name and XP */}
              <div>
                <h2 className="text-xl font-bold">{profile.nome}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {profile.xp_total.toLocaleString()} XP
                </p>
              </div>

              {/* Friendship button */}
              {renderFriendshipButton()}

              {/* Featured Achievements */}
              {featuredAchievements.length > 0 && (
                <div className="w-full pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Conquistas em Destaque
                  </h3>
                  <div className="flex justify-center gap-3">
                    {featuredAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement?.id || index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                          <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                          {achievement?.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {featuredAchievements.length === 0 && !isOwnProfile && (
                <p className="text-sm text-muted-foreground pt-4 border-t border-border w-full">
                  Este jogador ainda não destacou conquistas.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Perfil não encontrado.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
