import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSubmitGameResult } from "@/hooks/use-game";
import { StatsCard } from "@/components/StatsCard";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Constants
const CUP_COUNT = 3;
const POSITIONS = [0, 1, 2];
// Using relative percentages for responsiveness or fixed widths
// For framer motion layout animations, simple indexes work best if we position absolutely or use layoutId
// Here we will use flexbox and layoutId for automatic position animation

type GameState = "idle" | "shuffling" | "guessing" | "revealed";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [ballPosition, setBallPosition] = useState<number>(1); // 0, 1, 2
  const [cupOrder, setCupOrder] = useState<number[]>([0, 1, 2]); // visual order of cups
  const [shufflesLeft, setShufflesLeft] = useState(0);
  const [winningCup, setWinningCup] = useState<number | null>(null); // Visual highlight
  
  const submitResult = useSubmitGameResult();
  const { toast } = useToast();

  // Helper to shuffle array
  const shuffleCups = () => {
    setCupOrder((prev) => {
      const newOrder = [...prev];
      // Simple swap of two random cups
      const idx1 = Math.floor(Math.random() * CUP_COUNT);
      let idx2 = Math.floor(Math.random() * CUP_COUNT);
      while (idx1 === idx2) idx2 = Math.floor(Math.random() * CUP_COUNT);
      
      const temp = newOrder[idx1];
      newOrder[idx1] = newOrder[idx2];
      newOrder[idx2] = temp;
      
      return newOrder;
    });
  };

  // Game Loop Effect
  useEffect(() => {
    if (gameState === "shuffling" && shufflesLeft > 0) {
      const timeout = setTimeout(() => {
        shuffleCups();
        setShufflesLeft((prev) => prev - 1);
      }, 400); // Speed of shuffle
      return () => clearTimeout(timeout);
    } else if (gameState === "shuffling" && shufflesLeft === 0) {
      setGameState("guessing");
    }
  }, [gameState, shufflesLeft]);

  const startGame = () => {
    // Hide ball first
    setWinningCup(null);
    setGameState("shuffling");
    
    // Pick new random position for the ball logically (0, 1, 2 in the array)
    // But visual position depends on shuffling. 
    // Actually, physically, the ball is under a specific cup ID.
    // Let's say Ball is always under Cup ID 1 (The middle one initially).
    // We just track where Cup ID 1 moves.
    
    setShufflesLeft(10); // Number of swaps
  };

  const handleCupClick = async (cupId: number) => {
    if (gameState !== "guessing") return;

    setGameState("revealed");
    const isWin = cupId === 1; // Ball is always under Cup #1
    
    if (isWin) {
      setWinningCup(cupId);
      toast({
        title: "You found it! 🎉",
        description: "Great eye! The Web3 orange is yours.",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } else {
      setWinningCup(1); // Show where it really was
      toast({
        title: "Wrong cup!",
        description: "Better luck next time.",
        variant: "destructive",
      });
    }

    try {
      await submitResult.mutateAsync({ won: isWin });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold tracking-wide uppercase mb-2">
          Decentralized Luck
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">
          Shell Game
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Keep your eye on the <span className="text-orange-600 font-bold">Orange Cup</span>. 
          Don't lose track as they shuffle!
        </p>
      </motion.div>

      {/* Game Area */}
      <div className="relative w-full max-w-4xl h-80 md:h-96 flex items-center justify-center bg-white/40 rounded-3xl backdrop-blur-sm border border-white/60 shadow-inner overflow-hidden mb-12">
        <div className="flex gap-4 md:gap-12 lg:gap-24 relative z-10 px-8">
          <AnimatePresence>
            {cupOrder.map((cupId) => (
              <Cup 
                key={cupId} 
                id={cupId} 
                hasBall={cupId === 1}
                isRevealed={gameState === "revealed" || gameState === "idle"}
                highlight={winningCup === cupId}
                onClick={() => handleCupClick(cupId)}
                clickable={gameState === "guessing"}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {/* Decorative floor shadow */}
        <div className="absolute bottom-16 w-3/4 h-8 bg-black/5 blur-xl rounded-[100%]" />
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-16">
        <Button
          onClick={startGame}
          disabled={gameState === "shuffling" || submitResult.isPending}
          size="lg"
          className="
            h-16 px-12 text-lg rounded-2xl font-display font-bold tracking-wide shadow-xl shadow-orange-500/20
            bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600
            transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {gameState === "shuffling" ? (
            <>
              <RefreshCw className="mr-3 h-6 w-6 animate-spin" />
              Shuffling...
            </>
          ) : gameState === "guessing" ? (
            "Pick a Cup!"
          ) : (
            "Start Game"
          )}
        </Button>
      </div>

      {/* Stats */}
      <StatsCard />
    </div>
  );
}

// Sub-component for individual cup
function Cup({ 
  id, 
  hasBall, 
  isRevealed, 
  highlight, 
  onClick, 
  clickable 
}: { 
  id: number; 
  hasBall: boolean; 
  isRevealed: boolean; 
  highlight: boolean;
  onClick: () => void;
  clickable: boolean;
}) {
  return (
    <motion.div
      layout
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      className="relative flex flex-col items-center justify-end w-24 md:w-32 h-32 md:h-40"
    >
      {/* The Ball - Positioned absolute so it can sit 'under' */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: hasBall ? 1 : 0,
          scale: hasBall ? 1 : 0.5 
        }}
        className="absolute bottom-2 w-10 h-10 md:w-14 md:h-14 rounded-full orange-gradient shadow-inner z-0"
      />

      {/* The Cup */}
      <motion.button
        onClick={onClick}
        disabled={!clickable}
        initial={false}
        animate={{
          y: isRevealed && hasBall ? -60 : isRevealed && !hasBall ? -20 : 0,
          scale: clickable ? 1.05 : 1,
        }}
        whileHover={clickable ? { y: -10 } : {}}
        whileTap={clickable ? { scale: 0.95 } : {}}
        className={`
          relative z-10 w-full h-full 
          bg-gradient-to-br from-white to-orange-50
          border-2 rounded-t-[40px] rounded-b-[15px]
          cup-shadow flex items-center justify-center
          transition-colors duration-300
          ${highlight ? 'border-green-500 ring-4 ring-green-500/20' : 'border-orange-200'}
          ${clickable ? 'cursor-pointer hover:border-orange-400' : 'cursor-default'}
        `}
      >
        <span className={`
          text-3xl font-bold font-display opacity-20
          ${highlight ? 'text-green-500' : 'text-orange-900'}
        `}>
          ?
        </span>
        
        {/* Cup shine reflection */}
        <div className="absolute top-2 right-4 w-4 h-20 bg-white/40 rounded-full blur-[2px] skew-x-[-15deg]" />
      </motion.button>
      
      {/* Shadow under the cup */}
      <div className="absolute -bottom-4 w-20 h-4 bg-black/10 blur-md rounded-[100%] z-0" />
    </motion.div>
  );
}
