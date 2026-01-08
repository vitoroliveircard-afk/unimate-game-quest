import { useState } from 'react';
import { Search, UserPlus, Clock, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSearchUsers, useSendFriendRequest, useSentRequests, useFriends } from '@/hooks/useFriendships';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface UserSearchProps {
  onSelectUser?: (userId: string) => void;
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const { data: results = [], isLoading } = useSearchUsers(query);
  const { data: sentRequests = [] } = useSentRequests();
  const { data: friends = [] } = useFriends();
  const sendRequest = useSendFriendRequest();
  const { toast } = useToast();

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest.mutateAsync(userId);
      toast({
        title: 'Solicitação enviada!',
        description: 'Aguarde a resposta do usuário.',
      });
    } catch (e) {
      toast({
        title: 'Erro',
        description: e instanceof Error ? e.message : 'Não foi possível enviar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const isPending = (userId: string) => 
    sentRequests.some(r => r.addressee_id === userId);

  const isFriend = (userId: string) =>
    friends.some(f => f.requester_id === userId || f.addressee_id === userId);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar jogadores pelo nome..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <AnimatePresence mode="wait">
        {isLoading && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-4 text-muted-foreground"
          >
            Buscando...
          </motion.div>
        )}

        {!isLoading && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {results.map((user) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <button 
                  onClick={() => onSelectUser?.(user.user_id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.nome?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.nome}</p>
                    <p className="text-xs text-muted-foreground">Nível {user.level}</p>
                  </div>
                </button>

                {isFriend(user.user_id) ? (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Check className="w-4 h-4" />
                    Amigo
                  </span>
                ) : isPending(user.user_id) ? (
                  <span className="flex items-center gap-1 text-xs text-yellow-500">
                    <Clock className="w-4 h-4" />
                    Pendente
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendRequest(user.user_id)}
                    disabled={sendRequest.isPending}
                    className="gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    Adicionar
                  </Button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && query.length >= 2 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            Nenhum jogador encontrado com "{query}"
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
