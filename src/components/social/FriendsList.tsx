import { useState } from 'react';
import { Users, UserMinus, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useFriends, useRemoveFriendship, usePublicProfile } from '@/hooks/useFriendships';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FriendCardProps {
  friendUserId: string;
  friendshipId: string;
  onViewProfile: (userId: string) => void;
  onRemove: (friendshipId: string) => void;
  isRemoving: boolean;
}

function FriendCard({ friendUserId, friendshipId, onViewProfile, onRemove, isRemoving }: FriendCardProps) {
  const { data: profile, isLoading } = usePublicProfile(friendUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 rounded-lg bg-card border border-border">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
    >
      <button 
        onClick={() => onViewProfile(friendUserId)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <Avatar className="w-12 h-12 ring-2 ring-green-500/30">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>{profile.nome?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile.nome}</p>
          <p className="text-xs text-muted-foreground">
            Nível {profile.level} • {profile.xp_total.toLocaleString()} XP
          </p>
        </div>
      </button>

      <div className="flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onViewProfile(friendUserId)}
          title="Ver perfil"
        >
          <Eye className="w-4 h-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={isRemoving}
              title="Remover amigo"
            >
              <UserMinus className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover amigo?</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem certeza que deseja remover {profile.nome} da sua lista de amigos?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRemove(friendshipId)}>
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

interface FriendsListProps {
  onViewProfile: (userId: string) => void;
}

export function FriendsList({ onViewProfile }: FriendsListProps) {
  const { user } = useAuth();
  const { data: friends = [], isLoading } = useFriends();
  const removeFriendship = useRemoveFriendship();
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (friendshipId: string) => {
    setRemovingId(friendshipId);
    try {
      await removeFriendship.mutateAsync(friendshipId);
      toast({ title: 'Amigo removido' });
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o amigo.',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Você ainda não tem amigos.</p>
        <p className="text-sm">Use a busca para encontrar jogadores!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        {friends.length} amigo{friends.length !== 1 ? 's' : ''}
      </p>
      <AnimatePresence>
        {friends.map((friendship) => {
          const friendUserId = friendship.requester_id === user?.id 
            ? friendship.addressee_id 
            : friendship.requester_id;
          
          return (
            <FriendCard
              key={friendship.id}
              friendUserId={friendUserId}
              friendshipId={friendship.id}
              onViewProfile={onViewProfile}
              onRemove={handleRemove}
              isRemoving={removingId === friendship.id}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
