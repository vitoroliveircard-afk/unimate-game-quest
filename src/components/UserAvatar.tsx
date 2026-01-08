import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  nome?: string;
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}

export function UserAvatar({ 
  avatarUrl, 
  nome = 'Jogador', 
  level = 1, 
  size = 'md',
  showLevel = true 
}: UserAvatarProps) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const levelColors = {
    1: 'from-gray-400 to-gray-500',
    5: 'from-emerald-400 to-emerald-600',
    10: 'from-primary to-cyan-400',
    15: 'from-purple-400 to-purple-600',
    20: 'from-yellow-400 to-orange-500',
  };

  const getLevelColor = (lvl: number) => {
    if (lvl >= 20) return levelColors[20];
    if (lvl >= 15) return levelColors[15];
    if (lvl >= 10) return levelColors[10];
    if (lvl >= 5) return levelColors[5];
    return levelColors[1];
  };

  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 ${sizes[size]} bg-gradient-to-r ${getLevelColor(level)} blur-md opacity-50 rounded-full`} />
      
      {/* Avatar container */}
      <div className={`relative ${sizes[size]} rounded-full overflow-hidden border-2 border-white/20 bg-gradient-to-br from-muted to-muted/50`}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={nome} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
            <User className="w-1/2 h-1/2 text-primary" />
          </div>
        )}
      </div>

      {/* Level badge */}
      {showLevel && (
        <motion.div 
          className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getLevelColor(level)} text-primary-foreground shadow-lg`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {level}
        </motion.div>
      )}
    </motion.div>
  );
}
