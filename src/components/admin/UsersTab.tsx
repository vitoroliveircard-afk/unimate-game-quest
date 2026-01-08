import { useState } from 'react';
import { useAllUsers, useSetUserRole, UserWithRole } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, GraduationCap, Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  moderator: 'Moderador',
  student: 'Estudante',
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  moderator: <Users className="w-4 h-4" />,
  student: <GraduationCap className="w-4 h-4" />,
};

const roleBadgeVariants: Record<AppRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  admin: 'destructive',
  moderator: 'default',
  student: 'secondary',
};

export function UsersTab() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error } = useAllUsers();
  const setUserRole = useSetUserRole();
  const { toast } = useToast();
  const [changingUserId, setChangingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (userId === currentUser?.id) {
      toast({
        title: 'Ação bloqueada',
        description: 'Você não pode alterar seu próprio cargo.',
        variant: 'destructive',
      });
      return;
    }

    setChangingUserId(userId);
    try {
      await setUserRole.mutateAsync({ userId, role: newRole });
      toast({
        title: 'Cargo atualizado!',
        description: `O usuário agora é ${roleLabels[newRole]}.`,
      });
    } catch (e) {
      toast({
        title: 'Erro ao atualizar cargo',
        description: e instanceof Error ? e.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setChangingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Erro ao carregar usuários: {error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Gerenciar Usuários</h2>
        <Badge variant="outline" className="ml-2">
          {users.length} usuário{users.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: UserWithRole) => (
              <TableRow key={user.user_id}>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariants[user.role]} className="gap-1">
                    {roleIcons[user.role]}
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  {user.user_id === currentUser?.id ? (
                    <span className="text-xs text-muted-foreground italic">Você</span>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole)}
                      disabled={changingUserId === user.user_id}
                    >
                      <SelectTrigger className="w-[140px]">
                        {changingUserId === user.user_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Estudante</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
