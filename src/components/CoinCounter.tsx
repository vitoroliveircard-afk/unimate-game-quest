import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CoinCounterProps {
  coins: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export function CoinCounter({ coins, size = 'md', showAnimation = true }: CoinCounterProps) {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);
  const [coinDiff, setCoinDiff] = useState(0);

  useEffect(() => {
    if (coins !== displayCoins) {
      const diff = coins - displayCoins;
      setCoinDiff(diff);
      setIsAnimating(true);
      
      // Animate counting up/down
      const duration = 500;
      const steps = 20;
      const stepValue = diff / steps;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayCoins(coins);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 500);
        } else {
          setDisplayCoins(prev => Math.round(prev + stepValue));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }
  }, [coins, displayCoins]);

  const sizeClasses = {
    sm: 'text-sm gap-1.5',
    md: 'text-base gap-2',
    lg: 'text-lg gap-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="relative">
      <motion.div
        className={`flex items-center ${sizeClasses[size]} px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30`}
        animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={isAnimating ? { rotate: [0, 360] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Coins className={`${iconSizes[size]} text-amber-400`} />
        </motion.div>
        <span className="font-bold text-amber-400">{displayCoins.toLocaleString()}</span>
      </motion.div>

      {/* Floating coin animation */}
      <AnimatePresence>
        {showAnimation && isAnimating && coinDiff > 0 && (
          <motion.div
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{ opacity: 0, y: -40, x: 10 }}
            exit={{ opacity: 0 }}
            className="absolute -top-2 right-0 text-amber-400 font-bold text-sm pointer-events-none"
          >
            +{coinDiff}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
