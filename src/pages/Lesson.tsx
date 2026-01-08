import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, ChevronRight, Swords, Sparkles, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { XPBar } from '@/components/XPBar';
import { UserAvatar } from '@/components/UserAvatar';
import { CoinCounter } from '@/components/CoinCounter';
import { LessonSidebar } from '@/components/LessonSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MarkdownContent } from '@/components/MarkdownContent';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLesson, useLessons } from '@/hooks/useLessons';
import { useUserProgress, useCompleteLesson, useUpdateXP } from '@/hooks/useUserProgress';
import { useAddCoins } from '@/hooks/useCoins';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: lesson, isLoading: lessonLoading } = useLesson(lessonId || '');
  const { data: moduleLessons = [] } = useLessons(lesson?.module_id);
  const { data: userProgress = [] } = useUserProgress();
  const completeLesson = useCompleteLesson();
  const updateXP = useUpdateXP();
  const addCoins = useAddCoins();
  const checkAchievements = useCheckAchievements();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const LESSON_COIN_REWARD = 10;

  const isLessonCompleted = userProgress.some(
    (p) => p.lesson_id === lessonId && p.is_completed
  );

  const currentLessonIndex = moduleLessons.findIndex((l) => l.id === lessonId);
  const isLastLesson = currentLessonIndex === moduleLessons.length - 1;
  const nextLesson = moduleLessons[currentLessonIndex + 1];

  const handleComplete = async () => {
    if (!lessonId || isCompleting || isLessonCompleted) return;
    
    setIsCompleting(true);
    
    try {
      await completeLesson.mutateAsync({ lessonId });
      await updateXP.mutateAsync(lesson?.xp_reward || 100);
      await addCoins.mutateAsync(LESSON_COIN_REWARD);
      
      // Check for lesson completion achievements
      const completedCount = userProgress.filter(p => p.is_completed).length + 1;
      await checkAchievements.mutateAsync({ conditionType: 'lesson_complete', conditionValue: completedCount });
      
      // Play success sound
      const audio = new Audio('/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0EA5E9', '#F97316', '#8B5CF6', '#10B981'],
      });
      
      toast({
        title: '🎉 Aula Concluída!',
        description: `Você ganhou +${lesson?.xp_reward || 100} XP e +${LESSON_COIN_REWARD} moedas!`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível completar a aula.',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNext = () => {
    if (isLastLesson) {
      // Go to boss fight / quiz
      navigate(`/quiz/${lesson?.module_id}`);
    } else if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Aula não encontrada</p>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-4">
            <CoinCounter coins={profile?.coins || 0} size="sm" />
            <div className="hidden lg:block w-40">
              <XPBar xp={profile?.xp_total || 0} level={profile?.level || 1} showDetails={false} />
            </div>
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              nome={profile?.nome}
              level={profile?.level || 1}
              size="sm"
            />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <LessonSidebar
          lessons={moduleLessons}
          currentLessonId={lessonId || ''}
          userProgress={userProgress}
          moduleTitle={lesson.modules?.title || 'Módulo'}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          onSelectLesson={(id) => navigate(`/lesson/${id}`)}
          onBossFight={() => navigate(`/quiz/${lesson.module_id}`)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 lg:p-10">
            {/* Lesson Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{lesson.modules?.title}</span>
                <ChevronRight className="w-4 h-4" />
                <span>Aula {currentLessonIndex + 1}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black mb-4">{lesson.title}</h1>
              
              {isLessonCompleted && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Aula concluída
                </div>
              )}
            </motion.div>

            {/* Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <VideoPlayer videoUrl={lesson.video_url} title={lesson.title} />
            </motion.div>

            {/* Content */}
            {lesson.content_text && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 lg:p-8 mb-8"
              >
                <MarkdownContent content={lesson.content_text} />
              </motion.div>
            )}

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              {!isLessonCompleted ? (
                <Button
                  variant="neon"
                  size="lg"
                  className="gap-2 text-lg px-8"
                  onClick={handleComplete}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Completando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Concluir Aula (+{lesson.xp_reward} XP)
                    </>
                  )}
                </Button>
              ) : isLastLesson ? (
                <Button
                  variant="default"
                  size="lg"
                  className="gap-2 text-lg px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  onClick={handleNext}
                >
                  <Swords className="w-5 h-5" />
                  ENFRENTAR O CHEFE
                </Button>
              ) : (
                <Button
                  variant="neon"
                  size="lg"
                  className="gap-2 text-lg px-8"
                  onClick={handleNext}
                >
                  Próxima Aula
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
