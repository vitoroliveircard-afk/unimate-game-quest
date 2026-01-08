import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, Gamepad2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Bem-vindo de volta, Jogador! 🎮');
        navigate('/dashboard');
      } else {
        if (!nome.trim()) {
          toast.error('Digite seu nome de jogador!');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, nome);
        if (error) throw error;
        toast.success('Conta criada! Sua jornada começa agora! 🚀');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex cyber-grid">
      {/* Left side - Decorative */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Floating elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Large glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-2xl" />
            
            {/* Content */}
            <div className="relative z-10 text-center px-12">
              <motion.div
                className="float-animation mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-xl shadow-2xl neon-glow-blue">
                  <Gamepad2 className="w-24 h-24 text-primary" />
                </div>
              </motion.div>

              <motion.h1 
                className="text-5xl font-black mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="text-gradient-blue">Aprenda</span>{' '}
                <span className="text-gradient-orange">Jogando</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted-foreground mb-8 max-w-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Domine a arte do Game Design e crie seus próprios jogos incríveis!
              </motion.p>

              {/* Feature badges */}
              <motion.div 
                className="flex flex-wrap justify-center gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { icon: Sparkles, text: 'Gamificado' },
                  { icon: Rocket, text: '5 Módulos' },
                  { icon: Gamepad2, text: 'GDevelop' },
                ].map((item, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-full" />
        <div className="absolute bottom-32 right-20 w-48 h-48 border border-secondary/20 rounded-full" />
        <div className="absolute top-1/3 right-32 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
      </motion.div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          {/* Toggle */}
          <div className="flex p-1 mb-8 rounded-xl bg-muted/50 border border-white/5">
            {['Entrar', 'Criar Conta'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setIsLogin(i === 0)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  (i === 0 ? isLogin : !isLogin)
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="nome"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="nome" className="text-sm font-medium text-muted-foreground mb-2 block">
                    Nome de Jogador
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome épico"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="pl-12 h-12 bg-muted/50 border-white/10 focus:border-primary rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-12 bg-muted/50 border-white/10 focus:border-primary rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground mb-2 block">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-12 h-12 bg-muted/50 border-white/10 focus:border-primary rounded-xl"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="neon"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Iniciar Missão' : 'Criar Conta'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com os{' '}
            <span className="text-primary hover:underline cursor-pointer">Termos de Uso</span>
            {' '}da Unimate Labs.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
