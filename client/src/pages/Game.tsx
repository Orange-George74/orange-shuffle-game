import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Target, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bgImage from "@assets/a-modern-abstract-digital-background-fea_XOEiEaRDTkmr_0f0Fy6tC_1768020326024.png";

const SHELL_COUNT = 3;
const TOURNAMENT_GAMES = 3;

type GameState = "idle" | "shuffling" | "guessing" | "revealed" | "tournament_end";

function getComment(wins: number, played: number): string {
  if (played === 0) return "Ready?";
  const ratio = wins / played;
  if (ratio >= 1) return "Perfect!";
  if (ratio >= 0.66) return "Amazing!";
  if (ratio >= 0.5) return "Great job!";
  if (ratio >= 0.33) return "Keep trying!";
  return "Practice more!";
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [shellOrder, setShellOrder] = useState<number[]>([0, 1, 2]);
  const [shufflesLeft, setShufflesLeft] = useState(0);
  const [winningShell, setWinningShell] = useState<number | null>(null);
  
  // Tournament state
  const [tournamentWins, setTournamentWins] = useState(0);
  const [tournamentLosses, setTournamentLosses] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  const { toast } = useToast();

  const shuffleShells = () => {
    setShellOrder((prev) => {
      const newOrder = [...prev];
      const idx1 = Math.floor(Math.random() * SHELL_COUNT);
      let idx2 = Math.floor(Math.random() * SHELL_COUNT);
      while (idx1 === idx2) idx2 = Math.floor(Math.random() * SHELL_COUNT);
      
      const temp = newOrder[idx1];
      newOrder[idx1] = newOrder[idx2];
      newOrder[idx2] = temp;
      
      return newOrder;
    });
  };

  useEffect(() => {
    if (gameState === "shuffling" && shufflesLeft > 0) {
      const timeout = setTimeout(() => {
        shuffleShells();
        setShufflesLeft((prev) => prev - 1);
      }, 400);
      return () => clearTimeout(timeout);
    } else if (gameState === "shuffling" && shufflesLeft === 0) {
      setGameState("guessing");
    }
  }, [gameState, shufflesLeft]);

  const startGame = () => {
    if (gameState === "tournament_end") {
      // Reset tournament
      setTournamentWins(0);
      setTournamentLosses(0);
      setGamesPlayed(0);
    }
    setWinningShell(null);
    setGameState("shuffling");
    setShufflesLeft(10);
  };

  const handleShellClick = (shellId: number) => {
    if (gameState !== "guessing") return;

    const isWin = shellId === 1;
    const newGamesPlayed = gamesPlayed + 1;
    
    setGamesPlayed(newGamesPlayed);
    
    if (isWin) {
      setWinningShell(shellId);
      setTournamentWins((prev) => prev + 1);
      toast({
        title: "You found it!",
        description: "Great eye! The orange is yours.",
        className: "bg-green-900/90 border-green-700 text-green-100",
      });
    } else {
      setWinningShell(1);
      setTournamentLosses((prev) => prev + 1);
      toast({
        title: "Wrong shell!",
        description: "Better luck next time.",
        className: "bg-red-900/90 border-red-700 text-red-100",
      });
    }

    if (newGamesPlayed >= TOURNAMENT_GAMES) {
      setGameState("tournament_end");
    } else {
      setGameState("revealed");
    }
  };

  const isTournamentActive = gamesPlayed > 0 && gamesPlayed < TOURNAMENT_GAMES;
  const isTournamentEnd = gameState === "tournament_end";

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center game-bg"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="fixed inset-0 bg-black/40 -z-10" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4 relative z-10"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-semibold tracking-widest uppercase mb-2">
          Web3 Gaming
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 drop-shadow-lg">
          ORANGE SHELLS
        </h1>
        <p className="text-xl text-gray-300 max-w-lg mx-auto font-light">
          Keep your eye on the <span className="text-orange-400 font-semibold">Orange</span>. 
          Don't lose track as they shuffle!
        </p>
      </motion.div>

      {/* Tournament Score */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mb-8"
      >
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold">
              Tournament {gamesPlayed}/{TOURNAMENT_GAMES}
            </span>
            <span className={`text-lg font-display font-bold ${
              tournamentWins > tournamentLosses ? 'text-green-400' : 
              tournamentLosses > tournamentWins ? 'text-red-400' : 'text-orange-400'
            }`}>
              {getComment(tournamentWins, gamesPlayed)}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-2xl font-display font-bold text-white">{gamesPlayed}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Played</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-2xl font-display font-bold text-white">{tournamentWins}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Wins</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <X className="w-5 h-5" />
              </div>
              <div className="text-2xl font-display font-bold text-white">{tournamentLosses}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Losses</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Game Area */}
      <div className="relative w-full max-w-4xl h-80 md:h-96 flex items-center justify-center bg-black/30 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden mb-12">
        <div className="flex gap-4 md:gap-12 lg:gap-24 relative z-10 px-8">
          <AnimatePresence>
            {shellOrder.map((shellId) => (
              <Shell 
                key={shellId} 
                id={shellId} 
                hasOrange={shellId === 1}
                isRevealed={gameState === "revealed" || gameState === "idle" || gameState === "tournament_end"}
                highlight={winningShell === shellId}
                onClick={() => handleShellClick(shellId)}
                clickable={gameState === "guessing"}
              />
            ))}
          </AnimatePresence>
        </div>
        
        <div className="absolute bottom-16 w-3/4 h-8 bg-black/5 blur-xl rounded-[100%]" />
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={startGame}
          disabled={gameState === "shuffling"}
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
          ) : gameState === "guessing" ? (
            "Pick a Shell!"
          ) : isTournamentEnd ? (
            "New Tournament"
          ) : (
            isTournamentActive ? "Next Round" : "Start Game"
          )}
        </Button>
      </div>

      {/* Tournament End Message */}
      {isTournamentEnd && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center glass-card rounded-2xl p-6 max-w-md"
        >
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Tournament Complete!
          </h2>
          <p className="text-gray-300">
            You won <span className="text-green-400 font-bold">{tournamentWins}</span> out of <span className="text-orange-400 font-bold">{TOURNAMENT_GAMES}</span> games.
            {tournamentWins === TOURNAMENT_GAMES && " Perfect score!"}
            {tournamentWins === 0 && " Don't give up!"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Orange fruit component
function OrangeFruit({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ 
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.5 
      }}
      className="absolute bottom-2 z-0"
    >
      {/* Orange body */}
      <div className="relative w-10 h-10 md:w-14 md:h-14">
        <div className="w-full h-full rounded-full orange-gradient" />
        {/* Orange texture dots */}
        <div className="absolute inset-1 rounded-full" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 60% 20%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 40% 70%, rgba(255,255,255,0.25) 1px, transparent 1px), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 1px, transparent 1px)',
        }} />
        {/* Leaf */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="w-3 h-4 md:w-4 md:h-5 bg-gradient-to-b from-green-500 to-green-600 rounded-full transform rotate-12 origin-bottom" 
            style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }} 
          />
          {/* Stem */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-green-700 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

// Shell component
function Shell({ 
  id, 
  hasOrange, 
  isRevealed, 
  highlight, 
  onClick, 
  clickable 
}: { 
  id: number; 
  hasOrange: boolean; 
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
      {/* Orange Fruit */}
      <OrangeFruit visible={hasOrange} />

      {/* The Shell */}
      <motion.button
        onClick={onClick}
        disabled={!clickable}
        data-testid={`button-shell-${id}`}
        initial={false}
        animate={{
          y: isRevealed && hasOrange ? -60 : isRevealed && !hasOrange ? -20 : 0,
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
          ${highlight ? 'border-green-400 ring-4 ring-green-500/30' : 'border-orange-700'}
          ${clickable ? 'cursor-pointer hover:border-orange-300 hover:from-orange-300 hover:to-orange-500' : 'cursor-default'}
        `}
      >
        <span className={`
          text-3xl font-bold font-display opacity-40
          ${highlight ? 'text-green-300' : 'text-white'}
        `}>
          ?
        </span>
        
        {/* Shell shine reflection */}
        <div className="absolute top-2 right-4 w-4 h-20 bg-white/30 rounded-full blur-[2px] skew-x-[-15deg]" />
      </motion.button>
      
      {/* Shadow under the shell */}
      <div className="absolute -bottom-4 w-20 h-4 bg-black/10 blur-md rounded-[100%] z-0" />
    </motion.div>
  );
}
