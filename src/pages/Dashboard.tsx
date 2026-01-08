import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, BookOpen, Trophy, Flame, Lock, CheckCircle2, Play, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { XPBar } from '@/components/XPBar';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useModules } from '@/hooks/useModules';
import { useLessons } from '@/hooks/useLessons';
import { useUserProgress } from '@/hooks/useUserProgress';

const iconMap: Record<string, React.ElementType> = { BookOpen, Gamepad2, Trophy };

export default function Dashboard() {
  const { signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: allLessons = [] } = useLessons();
  const { data: userProgress = [] } = useUserProgress();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getModuleLessons = (moduleId: string) => allLessons.filter((l) => l.module_id === moduleId);
  const getCompletedLessons = (moduleId: string) => {
    const lessons = getModuleLessons(moduleId);
    return lessons.filter((l) => userProgress.some((p) => p.lesson_id === l.id && p.is_completed));
  };

  const getFirstIncompleteLesson = (moduleId: string) => {
    const lessons = getModuleLessons(moduleId);
    return lessons.find((l) => !userProgress.some((p) => p.lesson_id === l.id && p.is_completed));
  };

  const handleContinue = (moduleId: string) => {
    const nextLesson = getFirstIncompleteLesson(moduleId);
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    } else {
      const lessons = getModuleLessons(moduleId);
      if (lessons.length > 0) navigate(`/lesson/${lessons[0].id}`);
    }
  };

  const totalCompleted = userProgress.filter((p) => p.is_completed).length;

  if (profileLoading || modulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-500">{profile?.current_streak || 0}</span>
            </div>
            <div className="hidden lg:block w-48">
              <XPBar xp={profile?.xp_total || 0} level={profile?.level || 1} showDetails={false} />
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar avatarUrl={profile?.avatar_url} nome={profile?.nome} level={profile?.level || 1} size="sm" />
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">{profile?.nome || 'Jogador'}</p>
                <p className="text-xs text-muted-foreground">Nível {profile?.level || 1}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} title="Admin">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Olá, <span className="text-gradient-blue">{profile?.nome || 'Jogador'}</span>! 👋
          </h1>
          <p className="text-muted-foreground text-lg">Continue sua jornada para se tornar um Game Designer!</p>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {[
            { label: 'XP Total', value: profile?.xp_total || 0, icon: Trophy, color: 'text-primary' },
            { label: 'Nível', value: profile?.level || 1, icon: Gamepad2, color: 'text-purple-400' },
            { label: 'Sequência', value: `${profile?.current_streak || 0} dias`, icon: Flame, color: 'text-orange-500' },
            { label: 'Aulas Completas', value: `${totalCompleted}/${allLessons.length}`, icon: CheckCircle2, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 md:p-6">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" /> Trilha de Aprendizado
          </h2>
          <div className="space-y-4">
            {modules.map((module, index) => {
              const lessons = getModuleLessons(module.id);
              const completed = getCompletedLessons(module.id);
              const Icon = iconMap[module.icon || 'Gamepad2'] || Gamepad2;
              return (
                <motion.div key={module.id} className={`glass-card-hover p-6 ${module.is_locked && 'opacity-60'}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${module.color}20` }}>
                      {module.is_locked ? <Lock className="w-6 h-6" style={{ color: module.color || undefined }} /> : <Icon className="w-7 h-7" style={{ color: module.color || undefined }} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">MÓDULO {index + 1}</span>
                        {!module.is_locked && completed.length < lessons.length && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">Atual</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{lessons.length} aulas</p>
                    </div>
                    {!module.is_locked ? (
                      <Button variant="neon" size="sm" className="gap-2" onClick={() => handleContinue(module.id)}>
                        <Play className="w-4 h-4" /> Continuar
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="w-4 h-4" /> <span className="text-sm">Bloqueado</span>
                      </div>
                    )}
                  </div>
                  {!module.is_locked && lessons.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso</span><span>{completed.length}/{lessons.length}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full" style={{ width: `${(completed.length / lessons.length) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {modules.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum módulo disponível. <button onClick={() => navigate('/admin')} className="text-primary underline">Crie seu primeiro módulo</button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
