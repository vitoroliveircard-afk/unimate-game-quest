import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Swords, CheckCircle2, XCircle, ChevronRight, Trophy, Home, Heart, Bug, Shield, Zap, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { CoinCounter } from '@/components/CoinCounter';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useModules, useUpdateModule } from '@/hooks/useModules';
import { useUpdateXP } from '@/hooks/useUserProgress';
import { useProfile } from '@/hooks/useProfile';
import { useAddCoins } from '@/hooks/useCoins';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';

export default function Quiz() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: quizzes = [], isLoading } = useQuizzes(moduleId);
  const { data: modules = [] } = useModules();
  const updateModule = useUpdateModule();
  const updateXP = useUpdateXP();
  const addCoins = useAddCoins();
  const checkAchievements = useCheckAchievements();
  const { profile } = useProfile();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(3);
  const [bossHealth, setBossHealth] = useState(100);

  const currentModule = modules.find((m) => m.id === moduleId);
  const nextModule = modules.find((m) => m.order_index === (currentModule?.order_index || 0) + 1);
  const currentQuiz = quizzes[currentIndex];
  const progress = ((currentIndex + 1) / quizzes.length) * 100;
  const passingScore = Math.ceil(quizzes.length * 0.7);
  const passed = score >= passingScore;

  // Boss names based on module
  const bossNames: Record<number, string> = {
    0: 'Guardião da Lógica',
    1: 'Desafio do Código',
    2: 'O Arquiteto',
    3: 'O Engenheiro',
    4: 'O Mestre Final',
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    const isCorrect = index === currentQuiz.correct_answer;
    
    if (isCorrect) {
      setScore((s) => s + 1);
      // Damage boss
      setBossHealth((h) => Math.max(0, h - (100 / quizzes.length)));
      // Play success sound
      const audio = new Audio('/success.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } else {
      // Player takes damage
      setPlayerHealth((h) => Math.max(0, h - 1));
      // Play error sound
      const audio = new Audio('/error.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  const handleNext = () => {
    if (playerHealth <= 0 || currentIndex >= quizzes.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleFinish = async () => {
    const isPerfect = score === quizzes.length && playerHealth === 3;
    const baseCoins = 50;
    const perfectBonus = isPerfect ? 50 : 0;
    const totalCoins = baseCoins + perfectBonus;
    
    if (passed && nextModule) {
      try {
        await updateModule.mutateAsync({ id: nextModule.id, is_locked: false });
        await updateXP.mutateAsync(500);
        await addCoins.mutateAsync(totalCoins);
        
        // Check achievements
        await checkAchievements.mutateAsync({ conditionType: 'boss_defeat', conditionValue: 1 });
        if (isPerfect) {
          await checkAchievements.mutateAsync({ conditionType: 'perfect_score', conditionValue: 1 });
        }
        await checkAchievements.mutateAsync({ conditionType: 'module_complete', conditionValue: (currentModule?.order_index || 0) + 1 });
        
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#0EA5E9', '#F97316', '#8B5CF6', '#10B981'],
        });
        
        toast({
          title: isPerfect ? '🌟 Perfect Run!' : '🎉 Boss Derrotado!',
          description: `Você ganhou +${totalCoins} moedas${isPerfect ? ' (Bônus Perfeccionista!)' : ''} e desbloqueou "${nextModule.title}"!`,
        });
      } catch {
        toast({ title: 'Erro ao desbloquear próximo módulo', variant: 'destructive' });
      }
    }
    
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Swords className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhuma pergunta configurada para este Boss Fight</p>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  if (isFinished) {
    const defeated = passed || playerHealth > 0;
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-lg w-full text-center"
        >
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
            passed 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
              : 'bg-gradient-to-br from-red-500 to-orange-500'
          }`}>
            {passed ? (
              <Trophy className="w-12 h-12 text-white" />
            ) : (
              <XCircle className="w-12 h-12 text-white" />
            )}
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            {passed ? '🎉 Boss Derrotado!' : playerHealth <= 0 ? '💀 Game Over!' : 'Quase Lá!'}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {passed 
              ? `Parabéns! Você derrotou ${bossNames[currentModule?.order_index || 0]}!`
              : playerHealth <= 0 
              ? 'Você perdeu todas as vidas. Tente novamente!'
              : `Você acertou ${score} de ${quizzes.length}. Precisa de ${passingScore} para passar.`
            }
          </p>
          
          <div className="h-4 bg-muted rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all ${
                passed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
              }`}
              style={{ width: `${(score / quizzes.length) * 100}%` }}
            />
          </div>
          
          <div className="flex gap-4 justify-center">
            {!passed && (
              <Button variant="outline" onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setIsFinished(false);
                setPlayerHealth(3);
                setBossHealth(100);
              }}>
                Tentar Novamente
              </Button>
            )}
            <Button variant={passed ? 'neon' : 'default'} onClick={handleFinish} className="gap-2">
              <Home className="w-4 h-4" />
              {passed ? 'Continuar Jornada' : 'Voltar ao Dashboard'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const bossName = bossNames[currentModule?.order_index || 0];

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <CoinCounter coins={profile?.coins || 0} size="sm" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Swords className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-500">Boss Fight</span>
            </div>
          </div>
        </div>
      </header>

      {/* Boss Battle Arena */}
      <div className="container mx-auto px-6 py-6">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Player Side */}
            <motion.div 
              className="flex items-center gap-4"
              animate={selectedAnswer !== null && selectedAnswer !== currentQuiz?.correct_answer ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center border-2 border-primary/50">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border border-primary">
                  <span className="text-xs font-bold">{profile?.level || 1}</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">{profile?.nome || 'Jogador'}</p>
                <div className="flex gap-1 mt-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={i >= playerHealth ? { scale: 0.8, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                    >
                      <Heart 
                        className={`w-5 h-5 ${i < playerHealth ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-8 h-8 text-orange-500" />
              </motion.div>
              <span className="text-xs font-bold text-muted-foreground">VS</span>
            </div>

            {/* Boss Side */}
            <motion.div 
              className="flex items-center gap-4 flex-row-reverse"
              animate={selectedAnswer !== null && selectedAnswer === currentQuiz?.correct_answer ? { x: [5, -5, 5, -5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center border-2 border-red-500/50"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bug className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-red-400">{bossName}</p>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${bossHealth}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Counter */}
            <div className="text-center mb-6">
              <span className="text-sm text-muted-foreground">
                Pergunta {currentIndex + 1} de {quizzes.length}
              </span>
            </div>

            {/* Question Image */}
            {currentQuiz.image_url && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={currentQuiz.image_url}
                  alt="Questão"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Question */}
            <div className="glass-card p-6 mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-center">
                {currentQuiz.question}
              </h2>
            </div>

            {/* Options */}
            <div className="grid gap-3 mb-6">
              {(currentQuiz.options_json as string[]).map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuiz.correct_answer;
                
                let variant: 'default' | 'correct' | 'incorrect' = 'default';
                if (isAnswered) {
                  if (isCorrect) variant = 'correct';
                  else if (isSelected) variant = 'incorrect';
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-xl text-left font-medium transition-all flex items-center gap-4 ${
                      variant === 'correct'
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                        : variant === 'incorrect'
                        ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                        : isSelected
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
                    }`}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      variant === 'correct'
                        ? 'bg-emerald-500 text-white'
                        : variant === 'incorrect'
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && selectedAnswer !== currentQuiz.correct_answer && currentQuiz.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 mb-6 border-l-4 border-orange-500"
              >
                <p className="text-sm text-muted-foreground">
                  <strong className="text-orange-400">Dica:</strong> {currentQuiz.explanation}
                </p>
              </motion.div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <Button variant="neon" size="lg" onClick={handleNext} className="gap-2">
                  {currentIndex < quizzes.length - 1 && playerHealth > 0 ? 'Próxima Pergunta' : 'Ver Resultado'}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
