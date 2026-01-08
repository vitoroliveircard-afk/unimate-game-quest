import { useState } from 'react';
import { Users, Search, Bell, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserSearch } from './UserSearch';
import { FriendsList } from './FriendsList';
import { PendingRequests } from './PendingRequests';
import { PublicProfileModal } from './PublicProfileModal';
import { usePendingRequests } from '@/hooks/useFriendships';

export function SocialHub() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { data: pendingRequests = [] } = usePendingRequests();

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Social Hub</h2>
          <p className="text-sm text-muted-foreground">Conecte-se com outros jogadores</p>
        </div>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="w-4 h-4" />
            Amigos
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            Buscar
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2 relative">
            <Bell className="w-4 h-4" />
            Solicitações
            {pendingRequests.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <FriendsList onViewProfile={handleViewProfile} />
        </TabsContent>

        <TabsContent value="search" className="mt-4">
          <UserSearch onSelectUser={handleViewProfile} />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <PendingRequests />
        </TabsContent>
      </Tabs>

      <PublicProfileModal
        userId={selectedUserId}
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </div>
  );
}
