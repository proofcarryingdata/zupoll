import express,{ NextFunction,Request,Response } from "express";
import { sha256 } from "js-sha256";
import sortKeys from 'sort-keys';
import { ApplicationContext } from "../../types";
import { SEMAPHORE_GROUP_URL } from "../../util/auth";
import { prisma } from "../../util/prisma";
import { verifyGroupProof, verifySignatureProof } from "../../util/verify";
import { fetchAndVerifyName } from "../../util/util";

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
        pollType: request.pollType,
        body: request.body,
        expiry: request.expiry,
        options: request.options,
        voterSemaphoreGroupUrls: request.voterSemaphoreGroupUrls
      };
      const signalHash = sha256(JSON.stringify(sortKeys(signal)));

      try {
        if (request.pollsterType == UserType.ANON) {
          const nullifier = await verifyGroupProof(
            request.pollsterSemaphoreGroupUrl!,
            request.proof,
            signalHash,
            [SEMAPHORE_GROUP_URL!]
          );

          await prisma.poll.create({ data: {
            id: signalHash,
            pollsterType: "ANON",
            pollsterNullifier: nullifier,
            pollsterSemaphoreGroupUrl: request.pollsterSemaphoreGroupUrl,
            pollType: request.pollType,
            body: request.body,
            expiry: request.expiry,
            options: request.options,
            voterSemaphoreGroupUrls: request.voterSemaphoreGroupUrls,
            proof: request.proof
          }});
        } else if (request.pollsterType == UserType.NONANON) {
          const nullifier = await verifySignatureProof(
            request.pollsterCommitment!,
            request.proof,
            signalHash,
            [SEMAPHORE_GROUP_URL!]
          );
          const pollsterName = await fetchAndVerifyName(request.pollsterCommitment!, request.pollsterUuid!);

          await prisma.poll.create({ data: {
            id: signalHash,
            pollsterType: "NONANON",
            pollsterNullifier: nullifier,
            pollsterName: pollsterName,
            pollsterUuid: request.pollsterUuid,
            pollsterCommitment: request.pollsterCommitment,
            pollType: request.pollType,
            body: request.body,
            expiry: request.expiry,
            options: request.options,
            voterSemaphoreGroupUrls: request.voterSemaphoreGroupUrls,
            proof: request.proof
          }});
        } else {
          throw new Error("Unknown pollster type");
        }

        res.send("ok");
      } catch (e) {
        console.error(e);
        next(e);
      }
    }
  );

  app.post(
    "/vote",
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as VoteRequest;

      const signal: VoteSignal = {
        pollId: request.pollId,
        voteIdx: request.voteIdx
      };
      const signalHash = sha256(JSON.stringify(sortKeys(signal)));

      try {
        const poll = await prisma.poll.findUnique({
          where: {
            id: request.pollId
          }
        });
        if (poll === null) {
          throw new Error("Invalid pollId");
        }
        if(request.voteIdx < 0 || request.voteIdx >= poll.options.length) {
          throw new Error("Invalid vote idx");
        }

        if (request.voterType == UserType.ANON) {
          const nullifier = await verifyGroupProof(
            request.voterSemaphoreGroupUrl!,
            request.proof,
            signalHash,
            poll.voterSemaphoreGroupUrls
          );

          await prisma.vote.create({ data: {
            pollId: request.pollId,
            voterType: "ANON",
            voterNullifier: nullifier,
            voterSemaphoreGroupUrl: request.voterSemaphoreGroupUrl,
            voteIdx: request.voteIdx,
            proof: request.proof
          }});
        } else if (request.voterType == UserType.NONANON) {
          const nullifier = await verifySignatureProof(
            request.voterCommitment!,
            request.proof,
            signalHash,
            poll.voterSemaphoreGroupUrls
          );
          const voterName = await fetchAndVerifyName(request.voterCommitment!, request.voterUuid!);

          await prisma.vote.create({ data: {
            pollId: request.pollId,
            voterType: "NONANON",
            voterNullifier: nullifier,
            voterName: voterName,
            voterUuid: request.voterUuid,
            voterCommitment: request.voterCommitment,
            voteIdx: request.voteIdx,
            proof: request.proof
          }});
        } else {
          throw new Error("Unknown voter type");
        }

        res.send("ok");
      } catch (e) {
        console.error(e);
        next(e);
      }
    }
  );
}

export enum UserType {
  ANON = "ANON",
  NONANON = "NONANON",
}

export enum PollType {
  REFERENDUM = "REFERENDUM"
}

export interface VoteRequest {
  pollId: string;
  voterType: UserType;
  voterSemaphoreGroupUrl: string | undefined;
  voterCommitment: string | undefined;
  voterUuid: string | undefined;
  voteIdx: number;
  proof: string;
}

export interface VoteSignal {
  pollId: string;
  voteIdx: number;
}


export interface CreatePollRequest {
  pollsterType: UserType;
  pollsterSemaphoreGroupUrl: string | undefined;
  pollsterCommitment: string | undefined;
  pollsterUuid: string | undefined;
  pollType: PollType;
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
  proof: string;
}

export interface PollSignal {
  // nullifier: string;
  pollType: PollType;
  body: string;
  expiry: Date;
  options: string[];
  voterSemaphoreGroupUrls: string[];
}
