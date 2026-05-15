import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

const colors = ['#FF7B7B', '#FFD93D', '#C084FC', '#7DD3E0', '#98E4D6', '#FF9F8A'];

export function useConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const trigger = () => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as ConfettiPiece['shape'],
      });
    }
    setPieces(newPieces);
    setIsActive(true);
  };

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setIsActive(false);
        setPieces([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return { trigger, pieces, isActive };
}

export function Confetti({ pieces }: { pieces: ConfettiPiece[] }) {
  return (
    <div className="confetti-container">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              x: piece.x + (Math.random() - 0.5) * 200,
              y: window.innerHeight + 20,
              rotate: piece.rotation + Math.random() * 720,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random() * 2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: 'absolute',
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'square' ? '0%' : '0%',
              clipPath: piece.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
