import express, { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { ApplicationContext } from "../../types";
import {
  ACCESS_TOKEN_SECRET,
  authenticateZuzaluJWT,
  authenticateZuzaluOrganizerJWT,
} from "../../util/auth";
import { sendMessage } from "../../util/bot";
import { prisma } from "../../util/prisma";
import { verifyGroupProof } from "../../util/verify";

export function initAuthedRoutes(
  app: express.Application,
  context: ApplicationContext
): void {
  app.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as LoginRequest;

      try {
        // request.semaphoreGroupUrl is always either SEMAPHORE_GROUP_URL or
        // SEMAPHORE_ADMIN_GROUP_URL or PCDPASS_USERS_GROUP_URL
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

  app.post(
    "/bot-post",
    authenticateZuzaluOrganizerJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as BotPostRequest;

      try {
        sendMessage(request.message, context.bot);
      } catch (e) {
        console.error(e);
        next(e);
      }

      res.status(200);
    }
  );

  app.get(
    "/ballots",
    authenticateZuzaluJWT,
    async (req: Request, res: Response) => {
      const ballots = await prisma.ballot.findMany({
        select: {
          ballotTitle: true,
          ballotURL: true,
          expiry: true,
          ballotType: true,
        },
        orderBy: { expiry: "desc" },
      });

      res.status(200).json({ ballots });
    }
  );

  app.get(
    "/ballot-polls/:ballotURL",
    authenticateZuzaluJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ballotURL = parseInt(req.params.ballotURL);

        if (isNaN(ballotURL)) {
          throw new Error("Invalid ballot URL.");
        }

        const ballot = await prisma.ballot.findUnique({
          where: {
            ballotURL: ballotURL,
          },
        });
        if (ballot === null) {
          throw new Error("Ballot not found.");
        }

        const polls = await prisma.poll.findMany({
          where: {
            ballotURL: ballotURL,
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
          throw new Error("Ballot has no polls.");
        }

        polls.forEach((poll) => {
          const counts = new Array(poll.options.length).fill(0);
          for (const vote of poll.votes) {
            counts[vote.voteIdx] += 1;
          }
          poll.votes = counts;
        });

        res.status(200).json({ ballot, polls });
      } catch (e) {
        console.error(e);
        next(e);
      }
    }
  );
}

export type BotPostRequest = {
  message: string;
};

export type LoginRequest = {
  semaphoreGroupUrl: string;
  proof: string;
};

export type BallotPollRequest = {
  ballotURL: number;
};
