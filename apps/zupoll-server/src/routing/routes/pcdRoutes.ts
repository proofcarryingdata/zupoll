import { Ballot, Poll, Vote, UserType, BallotType } from "@prisma/client";
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
    "/create-ballot",
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as CreateBallotRequest;

      const prevBallot = await prisma.ballot.findUnique({
        where: {
          ballotURL: request.ballot.ballotURL,
        }
      });
      if (prevBallot !== null) { 
        throw new Error("Ballot already exists with this URL.");
      }

      const ballotSignal: BallotSignal = {
        pollSignals: [],
        ballotURL: request.ballot.ballotURL,
        ballotTitle: request.ballot.ballotTitle,
        ballotDescription: request.ballot.ballotDescription,
        ballotType: request.ballot.ballotType,
        expiry: request.ballot.expiry,
        voterSemaphoreGroupUrls: request.ballot.voterSemaphoreGroupRoots,
        voterSemaphoreGroupRoots: request.ballot.voterSemaphoreGroupUrls,
      };
      request.polls.forEach((poll: Poll) => {
        const pollSignal: PollSignal = {
          body: poll.body,
          options: poll.options,
        }
        ballotSignal.pollSignals.push(pollSignal);
      });
      const signalHash = sha256(stableStringify(ballotSignal));

      try {
        if (request.ballot.pollsterType == UserType.ANON) {
          const nullifier = await verifyGroupProof(
            request.ballot.pollsterSemaphoreGroupUrl!,
            request.proof,
            {
              signal: signalHash,
              allowedGroups: [SEMAPHORE_ADMIN_GROUP_URL!],
              claimedExtNullifier: signalHash,
            }
          );

          const newBallot = await prisma.ballot.create({
            data: {
              ballotId: signalHash,
              ballotURL: request.ballot.ballotURL,
              ballotTitle: request.ballot.ballotTitle,
              ballotDescription: request.ballot.ballotDescription,
              expiry: request.ballot.expiry,
              proof: request.proof,
              pollsterType: "ANON",
              pollsterNullifier: nullifier,
              pollsterSemaphoreGroupUrl: request.ballot.pollsterSemaphoreGroupUrl,
              voterSemaphoreGroupRoots: request.ballot.voterSemaphoreGroupRoots,
              voterSemaphoreGroupUrls: request.ballot.voterSemaphoreGroupUrls,
              ballotType: request.ballot.ballotType,
            }
          });

          for (const poll of request.polls) {
            await prisma.poll.create({
              data: {
                body: poll.body,
                options: poll.options,
                ballotURL: request.ballot.ballotURL,
                expiry: request.ballot.expiry,
              }
            });
          }

          res.json({
            url: newBallot.ballotURL,
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

  app.post("/vote-ballot", async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as MultiVoteRequest;

    const multiVoteSignal : MultiVoteSignal = {
      voteSignals: [],
    };
    request.votes.forEach((vote: Vote) => {
      const voteSignal: VoteSignal = {
        pollId: vote.pollId,
        voteIdx: vote.voteIdx,
      };
      multiVoteSignal.voteSignals.push(voteSignal);
    });
    const signalHash = sha256(stableStringify(multiVoteSignal));

    try {
      for (const vote of request.votes) {
        const poll = await prisma.poll.findUnique({
          where: {
            id: vote.pollId,
          },
        });
  
        if (poll === null) {
          throw new Error("Invalid poll id.");
        }
        if (vote.voteIdx < 0 || vote.voteIdx >= poll.options.length) {
          throw new Error("Invalid vote option.");
        }
        if (poll.expiry < new Date()) {
          throw new Error("Poll has expired.");
        }
        if (vote.voterSemaphoreGroupUrl === undefined) {
          throw new Error("No Semaphore group URL attached.");
        }
        if (vote.voterType !== UserType.ANON) {
          throw new Error("Unknown voter type.");
        }
      }

      const ballot = await prisma.ballot.findUnique({
        where: {
          ballotURL: request.ballotURL,
        }
      });
      if (ballot === null) { 
        throw new Error("Invalid ballot id.");
      }

      const nullifier = await verifyGroupProof(
        request.voterSemaphoreGroupUrl,
        request.proof,
        {
          signal: signalHash,
          allowedGroups: ballot.voterSemaphoreGroupUrls,
          allowedRoots: ballot.voterSemaphoreGroupRoots,
          claimedExtNullifier: ballot.ballotURL,
        }
      );

      const previousBallotVote = await prisma.vote.findUnique({
        where: {
          voterNullifier: nullifier,
        },
      });
      if (previousBallotVote !== null) {
        throw new Error("User has already voted on this ballot.");
      }

      const voteIds = [];
      for (const vote of request.votes) {
        const newVote = await prisma.vote.create({
          data: {
            pollId: vote.pollId,
            voterType: "ANON",
            voterNullifier: nullifier,
            voterSemaphoreGroupUrl: request.voterSemaphoreGroupUrl,
            voteIdx: vote.voteIdx,
            proof: request.proof,
          }
        });
        voteIds.push(newVote.id);
      }

      res.json({
        ids: voteIds
      });
    } catch (e) {
      console.error(e);
      next(e);
    }
  });
}

export type CreateBallotRequest = {
  ballot: Ballot;
  polls: Poll[];
  proof: string;
}

export type BallotSignal = {
  pollSignals: PollSignal[];
  ballotURL: string;
  ballotTitle: string;
  ballotDescription: string;
  ballotType: BallotType;
  expiry: Date;
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots: string[];
}

export type PollSignal = {
  body: string;
  options: string[];
};

export type MultiVoteRequest = {
  votes: Vote[];
  ballotURL: string;
  voterSemaphoreGroupUrl: string;
  proof: string;
};

export type MultiVoteSignal = {
  voteSignals: VoteSignal[];
}

export type VoteSignal = {
  pollId: string;
  voteIdx: number;
};
