import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { xpProgressPercent, xpForNextLevel } from '@/hooks/useProfile';

interface XPBarProps {
  xp: number;
  level: number;
  showDetails?: boolean;
}

export function XPBar({ xp, level, showDetails = true }: XPBarProps) {
  const progress = xpProgressPercent(xp, level);
  const nextLevelXP = xpForNextLevel(level);
  const currentLevelXP = xpForNextLevel(level - 1);

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-full border border-primary/30">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-bold text-primary">Nível {level}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">
              {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </span>
          </div>
        </div>
      )}
      
      <div className="xp-bar">
        <motion.div 
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}
