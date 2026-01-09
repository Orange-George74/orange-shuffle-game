import { gameResults, type InsertGameResult, type GameResult, type GameStats } from "@shared/schema";
import { db } from "./db";
import { count, eq, sql } from "drizzle-orm";

export interface IStorage {
  createGameResult(result: InsertGameResult): Promise<GameResult>;
  getGameStats(): Promise<GameStats>;
}

export class DatabaseStorage implements IStorage {
  async createGameResult(result: InsertGameResult): Promise<GameResult> {
    const [newResult] = await db.insert(gameResults).values(result).returning();
    return newResult;
  }

  async getGameStats(): Promise<GameStats> {
    const [total] = await db.select({ value: count() }).from(gameResults);
    const [wins] = await db
      .select({ value: count() })
      .from(gameResults)
      .where(eq(gameResults.won, true));
    
    const totalGames = total?.value || 0;
    const totalWins = wins?.value || 0;
    const losses = totalGames - totalWins;
    const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

    return {
      totalGames,
      wins: totalWins,
      losses,
      winRate: Number(winRate.toFixed(1)),
    };
  }
}

export const storage = new DatabaseStorage();
