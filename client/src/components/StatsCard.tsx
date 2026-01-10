import { motion } from "framer-motion";
import { Trophy, TrendingUp, Hash, XCircle } from "lucide-react";
import { useGameStats } from "@/hooks/use-game";

export function StatsCard() {
  const { data: stats, isLoading } = useGameStats();

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto h-32 animate-pulse bg-black/30 rounded-2xl" />
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Total Games",
      value: stats.totalGames,
      icon: Hash,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },
    {
      label: "Wins",
      value: stats.wins,
      icon: Trophy,
      color: "text-orange-400",
      bg: "bg-orange-500/20",
    },
    {
      label: "Losses",
      value: stats.losses,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/20",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/20",
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
          <span className="text-3xl font-display font-bold text-white">
            {item.value}
          </span>
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider mt-1">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
