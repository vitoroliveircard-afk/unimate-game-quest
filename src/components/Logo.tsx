import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
        <div className="relative bg-gradient-to-br from-primary to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-primary/40">
          <Gamepad2 size={icon} className="text-primary-foreground" />
        </div>
      </motion.div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${text} text-gradient-blue leading-tight`}>
            Unimate
          </span>
          <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
            Games Academy
          </span>
        </div>
      )}
    </motion.div>
  );
}
