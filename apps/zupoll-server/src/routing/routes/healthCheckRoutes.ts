import express, { Request, Response } from "express";
import { logger } from "src/util/log";
import { ApplicationContext } from "../../types";

export function initHealthcheckRoutes(
  app: express.Application,
  _context: ApplicationContext
): void {
  logger.info("[INIT] Initializing health check routes");
  app.get("/", async (req: Request, res: Response) => {
    res.send("PCD-Consuming Application - OK!");
  });
}
