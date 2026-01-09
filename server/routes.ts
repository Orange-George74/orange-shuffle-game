import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.game.submit.path, async (req, res) => {
    try {
      const input = api.game.submit.input.parse(req.body);
      await storage.createGameResult(input);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false });
    }
  });

  app.get(api.game.stats.path, async (req, res) => {
    const stats = await storage.getGameStats();
    res.json(stats);
  });

  return httpServer;
}
