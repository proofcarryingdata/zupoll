import { UserType } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { ApplicationContext } from "../../types";
import { SEMAPHORE_ADMIN_GROUP_URL } from "../../util/auth";
import { prisma } from "../../util/prisma";
import { verifyGroupProof } from "../../util/verify";

/**
 * The endpoints in this function accepts proof (pcd) in the request.
 * It verifies the proof before proceed. So in this case no other type of auth (e.g. jwt)
 * is needed.
 */
export function initPCDRoutes(
  app: express.Application,
  _context: ApplicationContext
): void {
  app.post(
    "/create-poll",
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as CreatePollRequest;

      // can't use nullifierhash inside signal cuz it is generated after signal is input into proof.
      const signal: PollSignal = {
        body: request.body,
        expiry: request.expiry,
        options: request.options,
        voterSemaphoreGroupUrls: request.voterSemaphoreGroupUrls,
        voterSemaphoreGroupRoots: request.voterSemaphoreGroupRoots,
      };
      const signalHash = sha256(stableStringify(signal));

      try {
        if (request.pollsterType == UserType.ANON) {
          const nullifier = await verifyGroupProof(
            request.pollsterSemaphoreGroupUrl!,
            request.proof,
            {
              signal: signalHash,
              allowedGroups: [SEMAPHORE_ADMIN_GROUP_URL!],
              claimedExtNullifier: signalHash,
            }
          );

          const newPoll = await prisma.poll.create({
            data: {
              id: signalHash,
              pollsterType: "ANON",
              pollsterNullifier: nullifier,
              pollsterSemaphoreGroupUrl: request.pollsterSemaphoreGroupUrl,
              body: request.body,
              expiry: request.expiry,
              options: request.options,
              voterSemaphoreGroupUrls: request.voterSemaphoreGroupUrls,
              voterSemaphoreGroupRoots: request.voterSemaphoreGroupRoots ?? [],
              proof: request.proof,
            },
          });

          res.json({
            id: newPoll.id,
          });
        } else {
          throw new Error("Unknown pollster type.");
        }

        res.send("ok");
      } catch (e) {
        console.error(e);
        next(e);
      }
    }
  );

  app.post("/vote", async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as VoteRequest;

    const signal: VoteSignal = {
      pollId: request.pollId,
      voteIdx: request.voteIdx,
    };
    const signalHash = sha256(stableStringify(signal));

    try {
      const poll = await prisma.poll.findUnique({
        where: {
          id: request.pollId,
        },
      });

      if (poll === null) {
        throw new Error("Invalid poll id.");
      }
      if (request.voteIdx < 0 || request.voteIdx >= poll.options.length) {
        throw new Error("Invalid vote option.");
      }
      if (poll.expiry < new Date()) {
        throw new Error("Poll has expired.");
      }
      if (request.voterSemaphoreGroupUrl === undefined) {
        throw new Error("No Semaphore group URL attached.");
      }

      if (request.voterType == UserType.ANON) {
        const nullifier = await verifyGroupProof(
          request.voterSemaphoreGroupUrl,
          request.proof,
          {
            signal: signalHash,
            allowedGroups: poll.voterSemaphoreGroupUrls,
            allowedRoots: poll.voterSemaphoreGroupRoots,
            claimedExtNullifier: poll.id,
          }
        );

        const previousVote = await prisma.vote.findUnique({
          where: {
            voterNullifier: nullifier,
          },
        });
        if (previousVote !== null) {
          throw new Error("User has already voted.");
        }

        const newVote = await prisma.vote.create({
          data: {
            pollId: request.pollId,
            voterType: "ANON",
            voterNullifier: nullifier,
            voterSemaphoreGroupUrl: request.voterSemaphoreGroupUrl,
            voteIdx: request.voteIdx,
            proof: request.proof,
          },
        });
        res.json({
          id: newVote.id,
        });
      } else {
        throw new Error("Unknown voter type.");
      }
    } catch (e) {
      console.error(e);
      next(e);
    }
  });
}

export type VoteRequest = {
  pollId: string;
  voterType: UserType;
  voterSemaphoreGroupUrl: string | undefined;
  voterCommitment: string | undefined;
  voterUuid: string | undefined;
  voteIdx: number;
  proof: string;
};

export type VoteSignal = {
  pollId: string;
  voteIdx: number;
};

export type CreatePollRequest = {
  pollsterType: UserType;
  pollsterSemaphoreGroupUrl: string | undefined;
  pollsterCommitment: string | undefined;
  pollsterUuid: string | undefined;
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots?: string[];
  proof: string;
};

export type PollSignal = {
  // nullifier: string;
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots?: string[];
};
