import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertGameResult } from "@shared/routes";

export function useGameStats() {
  return useQuery({
    queryKey: [api.game.stats.path],
    queryFn: async () => {
      const res = await fetch(api.game.stats.path);
      if (!res.ok) throw new Error("Failed to fetch game stats");
      return api.game.stats.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitGameResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (result: InsertGameResult) => {
      const res = await fetch(api.game.submit.path, {
        method: api.game.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error("Failed to submit game result");
      return api.game.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.game.stats.path] });
    },
  });
}
