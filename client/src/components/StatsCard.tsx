import { motion } from "framer-motion";
import { Trophy, TrendingUp, Hash, XCircle } from "lucide-react";
import { useGameStats } from "@/hooks/use-game";

export function StatsCard() {
  const { data: stats, isLoading } = useGameStats();

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto h-32 animate-pulse bg-white/50 rounded-2xl" />
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Total Games",
      value: stats.totalGames,
      icon: Hash,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Wins",
      value: stats.wins,
      icon: Trophy,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Losses",
      value: stats.losses,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Win Rate",
      value: `${(stats.winRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-12">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform duration-300"
        >
          <div className={`p-3 rounded-full mb-3 ${item.bg} ${item.color}`}>
            <item.icon className="w-6 h-6" />
          </div>
          <span className="text-3xl font-display font-bold text-foreground">
            {item.value}
          </span>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
