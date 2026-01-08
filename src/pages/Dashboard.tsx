import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, BookOpen, Trophy, Flame, Lock, CheckCircle2, Play, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { XPBar } from '@/components/XPBar';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

// Mock modules data
const modules = [
  { id: 1, title: 'Fundamentos', lessons: 5, color: 'from-primary to-cyan-400', icon: BookOpen, unlocked: true },
  { id: 2, title: 'Mecânicas e Conflito', lessons: 5, color: 'from-purple-500 to-pink-500', icon: Gamepad2, unlocked: false },
  { id: 3, title: 'Pré-Produção', lessons: 3, color: 'from-orange-500 to-yellow-500', icon: BookOpen, unlocked: false },
  { id: 4, title: 'Desenvolvimento', lessons: 5, color: 'from-emerald-500 to-teal-500', icon: Gamepad2, unlocked: false },
  { id: 5, title: 'Finalização', lessons: 2, color: 'from-red-500 to-orange-500', icon: Trophy, unlocked: false },
];

export default function Dashboard() {
  const { signOut } = useAuth();
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          
          <div className="flex items-center gap-6">
            {/* Streak */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-500">{profile?.current_streak || 0}</span>
            </div>

            {/* XP Bar */}
            <div className="hidden lg:block w-48">
              <XPBar xp={profile?.xp_total || 0} level={profile?.level || 1} showDetails={false} />
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <UserAvatar 
                avatarUrl={profile?.avatar_url}
                nome={profile?.nome}
                level={profile?.level || 1}
                size="sm"
              />
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">{profile?.nome || 'Jogador'}</p>
                <p className="text-xs text-muted-foreground">Nível {profile?.level || 1}</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Olá, <span className="text-gradient-blue">{profile?.nome || 'Jogador'}</span>! 👋
          </h1>
          <p className="text-muted-foreground text-lg">Continue sua jornada para se tornar um Game Designer!</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { label: 'XP Total', value: profile?.xp_total || 0, icon: Trophy, color: 'text-primary' },
            { label: 'Nível', value: profile?.level || 1, icon: Gamepad2, color: 'text-purple-400' },
            { label: 'Sequência', value: `${profile?.current_streak || 0} dias`, icon: Flame, color: 'text-orange-500' },
            { label: 'Aulas Completas', value: '0/20', icon: CheckCircle2, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 md:p-6">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            Trilha de Aprendizado
          </h2>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                className={`glass-card-hover p-6 ${!module.unlocked && 'opacity-60'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-center gap-4">
                  {/* Module Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${module.color} ${module.unlocked ? 'shadow-lg' : ''}`}>
                    {module.unlocked ? (
                      <module.icon className="w-7 h-7 text-primary-foreground" />
                    ) : (
                      <Lock className="w-6 h-6 text-primary-foreground/70" />
                    )}
                  </div>

                  {/* Module Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">MÓDULO {module.id}</span>
                      {module.unlocked && index === 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                          Atual
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.lessons} aulas</p>
                  </div>

                  {/* Action */}
                  {module.unlocked ? (
                    <Button variant="neon" size="sm" className="gap-2">
                      <Play className="w-4 h-4" />
                      Continuar
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Bloqueado</span>
                    </div>
                  )}
                </div>

                {/* Progress bar for unlocked modules */}
                {module.unlocked && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>0/{module.lessons}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
