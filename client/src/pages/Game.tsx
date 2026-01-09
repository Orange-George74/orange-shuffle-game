import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSubmitGameResult } from "@/hooks/use-game";
import { StatsCard } from "@/components/StatsCard";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CUP_COUNT = 3;

type GameState = "idle" | "shuffling" | "guessingFruit" | "guessingGlass" | "revealed";

type HiddenObject = "fruit" | "glass" | null;

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [cupOrder, setCupOrder] = useState<number[]>([0, 1, 2]);
  const [shufflesLeft, setShufflesLeft] = useState(0);
  
  const [fruitCup, setFruitCup] = useState<number>(0);
  const [glassCup, setGlassCup] = useState<number>(2);
  
  const [fruitFound, setFruitFound] = useState<boolean | null>(null);
  const [glassFound, setGlassFound] = useState<boolean | null>(null);
  const [guessedCups, setGuessedCups] = useState<number[]>([]);
  
  const submitResult = useSubmitGameResult();
  const { toast } = useToast();

  const shuffleCups = () => {
    setCupOrder((prev) => {
      const newOrder = [...prev];
      const idx1 = Math.floor(Math.random() * CUP_COUNT);
      let idx2 = Math.floor(Math.random() * CUP_COUNT);
      while (idx1 === idx2) idx2 = Math.floor(Math.random() * CUP_COUNT);
      
      const temp = newOrder[idx1];
      newOrder[idx1] = newOrder[idx2];
      newOrder[idx2] = temp;
      
      return newOrder;
    });
  };

  useEffect(() => {
    if (gameState === "shuffling" && shufflesLeft > 0) {
      const timeout = setTimeout(() => {
        shuffleCups();
        setShufflesLeft((prev) => prev - 1);
      }, 400);
      return () => clearTimeout(timeout);
    } else if (gameState === "shuffling" && shufflesLeft === 0) {
      setGameState("guessingFruit");
    }
  }, [gameState, shufflesLeft]);

  const startGame = () => {
    setFruitFound(null);
    setGlassFound(null);
    setGuessedCups([]);
    
    const cups = [0, 1, 2];
    const fruitPosition = cups[Math.floor(Math.random() * cups.length)];
    const remainingCups = cups.filter(c => c !== fruitPosition);
    const glassPosition = remainingCups[Math.floor(Math.random() * remainingCups.length)];
    
    setFruitCup(fruitPosition);
    setGlassCup(glassPosition);
    
    setCupOrder([0, 1, 2]);
    setGameState("shuffling");
    setShufflesLeft(10);
  };

  const handleCupClick = async (cupId: number) => {
    if (gameState === "guessingFruit") {
      const isCorrect = cupId === fruitCup;
      setFruitFound(isCorrect);
      setGuessedCups([cupId]);
      
      if (isCorrect) {
        toast({
          title: "You found the fruit!",
          description: "Now find the glass of juice...",
          className: "bg-green-50 border-green-200 text-green-900",
        });
      } else {
        toast({
          title: "Wrong cup for the fruit!",
          description: "Now try to find the glass...",
          variant: "destructive",
        });
      }
      
      setGameState("guessingGlass");
      
    } else if (gameState === "guessingGlass") {
      const isCorrect = cupId === glassCup;
      setGlassFound(isCorrect);
      setGuessedCups(prev => [...prev, cupId]);
      setGameState("revealed");
      
      const fruitWon = fruitFound === true;
      const bothWon = fruitWon && isCorrect;
      
      if (bothWon) {
        toast({
          title: "Perfect! Both found!",
          description: "You're a shell game master!",
          className: "bg-green-50 border-green-200 text-green-900",
        });
      } else if (fruitWon || isCorrect) {
        toast({
          title: "Partial win!",
          description: `You found ${fruitWon ? "the fruit" : ""}${fruitWon && isCorrect ? " and " : ""}${isCorrect ? "the glass" : ""}.`,
          className: "bg-amber-50 border-amber-200 text-amber-900",
        });
      } else {
        toast({
          title: "Both missed!",
          description: "Better luck next time.",
          variant: "destructive",
        });
      }

      try {
        await submitResult.mutateAsync({ won: bothWon });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getObjectUnderCup = (cupId: number): HiddenObject => {
    if (cupId === fruitCup) return "fruit";
    if (cupId === glassCup) return "glass";
    return null;
  };

  const getPromptText = () => {
    switch (gameState) {
      case "shuffling":
        return "Shuffling...";
      case "guessingFruit":
        return "Find the Orange!";
      case "guessingGlass":
        return "Now find the Juice Glass!";
      case "revealed":
        return "Game Over!";
      default:
        return "Start Game";
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold tracking-wide uppercase mb-2">
          Decentralized Luck
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">
          Shell Game
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Find both the <span className="text-orange-600 font-bold">Orange</span> and the <span className="text-amber-500 font-bold">Juice Glass</span>!
        </p>
      </motion.div>

      <div className="flex gap-8 justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full orange-gradient" />
          <span className="text-sm text-muted-foreground">Orange Fruit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 glass-icon" />
          <span className="text-sm text-muted-foreground">Juice Glass</span>
        </div>
      </div>

      <div className="relative w-full max-w-4xl h-80 md:h-96 flex items-center justify-center bg-white/40 rounded-3xl backdrop-blur-sm border border-white/60 shadow-inner overflow-hidden mb-8">
        <div className="flex gap-4 md:gap-12 lg:gap-24 relative z-10 px-8">
          <AnimatePresence>
            {cupOrder.map((cupId) => (
              <Cup 
                key={cupId} 
                id={cupId} 
                hiddenObject={getObjectUnderCup(cupId)}
                isRevealed={gameState === "revealed" || gameState === "idle"}
                wasGuessed={guessedCups.includes(cupId)}
                fruitFound={fruitFound}
                glassFound={glassFound}
                fruitCup={fruitCup}
                glassCup={glassCup}
                onClick={() => handleCupClick(cupId)}
                clickable={
                  (gameState === "guessingFruit" && !guessedCups.includes(cupId)) ||
                  (gameState === "guessingGlass" && !guessedCups.includes(cupId))
                }
                gameState={gameState}
              />
            ))}
          </AnimatePresence>
        </div>
        
        <div className="absolute bottom-16 w-3/4 h-8 bg-black/5 blur-xl rounded-[100%]" />
      </div>

      <motion.div 
        key={gameState}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-2xl font-display font-bold text-orange-600 mb-6"
      >
        {getPromptText()}
      </motion.div>

      <div className="flex justify-center mb-16">
        <Button
          onClick={startGame}
          disabled={gameState === "shuffling" || gameState === "guessingFruit" || gameState === "guessingGlass" || submitResult.isPending}
          size="lg"
          data-testid="button-start-game"
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
          ) : gameState === "revealed" || gameState === "idle" ? (
            gameState === "revealed" ? "Play Again" : "Start Game"
          ) : (
            "Make your guess!"
          )}
        </Button>
      </div>

      <StatsCard />
    </div>
  );
}

function Cup({ 
  id, 
  hiddenObject, 
  isRevealed, 
  wasGuessed,
  fruitFound,
  glassFound,
  fruitCup,
  glassCup,
  onClick, 
  clickable,
  gameState,
}: { 
  id: number; 
  hiddenObject: HiddenObject;
  isRevealed: boolean; 
  wasGuessed: boolean;
  fruitFound: boolean | null;
  glassFound: boolean | null;
  fruitCup: number;
  glassCup: number;
  onClick: () => void;
  clickable: boolean;
  gameState: GameState;
}) {
  const shouldShowObject = isRevealed || (gameState === "guessingGlass" && id === fruitCup);
  
  const getHighlightStyle = () => {
    if (!isRevealed && gameState !== "guessingGlass") return "";
    
    if (id === fruitCup && fruitFound === true) return "border-green-400 ring-4 ring-green-500/30";
    if (id === fruitCup && fruitFound === false && isRevealed) return "border-orange-400 ring-4 ring-orange-500/30";
    if (id === glassCup && glassFound === true) return "border-green-400 ring-4 ring-green-500/30";
    if (id === glassCup && glassFound === false && isRevealed) return "border-amber-400 ring-4 ring-amber-500/30";
    
    return "";
  };

  return (
    <motion.div
      layout
      layoutId={`cup-container-${id}`}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      className="relative flex flex-col items-center justify-end"
      style={{ width: 128, height: 160 }}
    >
      {hiddenObject === "fruit" && (
        <motion.div
          initial={false}
          animate={{ 
            opacity: shouldShowObject ? 1 : 0,
            scale: shouldShowObject ? 1 : 0.5 
          }}
          className="absolute bottom-2 w-10 h-10 md:w-14 md:h-14 rounded-full orange-gradient shadow-inner z-0"
        />
      )}
      
      {hiddenObject === "glass" && (
        <motion.div
          initial={false}
          animate={{ 
            opacity: shouldShowObject ? 1 : 0,
            scale: shouldShowObject ? 1 : 0.5 
          }}
          className="absolute bottom-2 w-10 h-14 md:w-12 md:h-16 glass-icon z-0"
        />
      )}

      <motion.button
        onClick={onClick}
        disabled={!clickable}
        data-testid={`button-cup-${id}`}
        initial={false}
        animate={{
          y: shouldShowObject && hiddenObject ? -60 : 0,
          scale: clickable ? 1.05 : 1,
        }}
        whileHover={clickable ? { y: -10 } : {}}
        whileTap={clickable ? { scale: 0.95 } : {}}
        className={`
          relative z-10 w-full h-full 
          bg-gradient-to-br from-orange-400 to-orange-600
          border-2 rounded-t-[40px] rounded-b-[15px]
          cup-shadow flex items-center justify-center
          transition-colors duration-300
          ${getHighlightStyle() || 'border-orange-700'}
          ${clickable ? 'cursor-pointer hover:border-orange-300 hover:from-orange-300 hover:to-orange-500' : 'cursor-default'}
        `}
      >
        <span className={`
          text-3xl font-bold font-display opacity-40 text-white
        `}>
          ?
        </span>
        
        <div className="absolute top-2 right-4 w-4 h-20 bg-white/30 rounded-full blur-[2px] skew-x-[-15deg]" />
      </motion.button>
      
      <div className="absolute -bottom-4 w-20 h-4 bg-black/10 blur-md rounded-[100%] z-0" />
    </motion.div>
  );
}
