import { useState } from 'react';
import { Check, X, Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePendingRequests, useAcceptFriendRequest, useRemoveFriendship, usePublicProfile } from '@/hooks/useFriendships';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface RequestCardProps {
  requesterId: string;
  friendshipId: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isProcessing: boolean;
}

function RequestCard({ requesterId, friendshipId, onAccept, onDecline, isProcessing }: RequestCardProps) {
  const { data: profile, isLoading } = usePublicProfile(requesterId);

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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-yellow-500/30 hover:border-yellow-500/50 transition-colors"
    >
      <Avatar className="w-10 h-10 ring-2 ring-yellow-500/30">
        <AvatarImage src={profile.avatar_url || undefined} />
        <AvatarFallback>{profile.nome?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium">{profile.nome}</p>
        <p className="text-xs text-muted-foreground">Nível {profile.level}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => onAccept(friendshipId)}
          disabled={isProcessing}
          className="gap-1"
        >
          <Check className="w-4 h-4" />
          Aceitar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDecline(friendshipId)}
          disabled={isProcessing}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export function PendingRequests() {
  const { data: requests = [], isLoading } = usePendingRequests();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useRemoveFriendship();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (friendshipId: string) => {
    setProcessingId(friendshipId);
    try {
      await acceptRequest.mutateAsync(friendshipId);
      toast({
        title: 'Amigo adicionado!',
        description: 'Vocês agora são amigos.',
      });
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (friendshipId: string) => {
    setProcessingId(friendshipId);
    try {
      await declineRequest.mutateAsync(friendshipId);
      toast({ title: 'Solicitação recusada' });
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível recusar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>Nenhuma solicitação pendente</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        {requests.length} solicitação{requests.length !== 1 ? 'ões' : ''} pendente{requests.length !== 1 ? 's' : ''}
      </p>
      <AnimatePresence>
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            requesterId={request.requester_id}
            friendshipId={request.id}
            onAccept={handleAccept}
            onDecline={handleDecline}
            isProcessing={processingId === request.id}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
