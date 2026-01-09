import { z } from "zod";
import { insertGameResultSchema } from "./schema";

export const api = {
  game: {
    submit: {
      method: "POST" as const,
      path: "/api/game/result",
      input: insertGameResultSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    stats: {
      method: "GET" as const,
      path: "/api/game/stats",
      responses: {
        200: z.object({
          totalGames: z.number(),
          wins: z.number(),
          losses: z.number(),
          winRate: z.number(),
        }),
      },
    },
  },
};
