import express, { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { ApplicationContext } from "../../types";
import { ACCESS_TOKEN_SECRET, authenticateJWT } from "../../util/auth";
import { prisma } from "../../util/prisma";
import { verifyGroupProof } from "../../util/verify";

export function initAuthedRoutes(
  app: express.Application,
  _context: ApplicationContext
): void {
  app.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as LoginRequest;

      try {
        await verifyGroupProof(request.semaphoreGroupUrl, request.proof, {});

        const accessToken = sign(
          { groupUrl: request.semaphoreGroupUrl },
          ACCESS_TOKEN_SECRET!
        );

        res.status(200).json({ accessToken });
      } catch (e) {
        console.error(e);
        next(e);
      }
    }
  );

  app.get("/ballots", authenticateJWT, async (req: Request, res: Response) => {
    const ballots = await prisma.ballot.findMany({
      select: {
        ballotTitle: true,
        ballotURL: true,
        expiry: true,
      },
      orderBy: { expiry: "asc" },
    });

    res.status(200).json({ ballots });
  })

  app.get("/ballot-polls", authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as BallotPollRequest;

    try {
      const polls = await prisma.poll.findMany({
        where: {
          ballotURL: request.ballotURL,
        },
        include: {
          votes: {
            select: {
              voteIdx: true,
            },
          },
        },
        orderBy: { expiry: "asc" },
      });
  
      if (polls === null) {
        throw new Error("Ballot not found.");
      }
  
      polls.forEach((poll) => {
        const counts = new Array(poll.options.length).fill(0);
        for (const vote of poll.votes) {
          counts[vote.voteIdx] += 1;
        }
        poll.votes = counts;
      });
  
      res.status(200).json({ polls });
    } catch (e) {
      console.error(e);
      next(e);
    }
  });
}

export type LoginRequest = {
  semaphoreGroupUrl: string;
  proof: string;
}

export type BallotPollRequest = {
  ballotURL: number;
}
