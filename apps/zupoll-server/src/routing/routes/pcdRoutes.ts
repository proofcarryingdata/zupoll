import {
  Ballot,
  BallotType,
  MessageType,
  Poll,
  UserType,
  Vote,
} from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { ApplicationContext } from "../../types";
import {
  authenticateJWT,
  getVisibleBallotTypesForUser,
  PCDPASS_USERS_GROUP_URL,
  ZUZALU_ORGANIZERS_GROUP_URL,
  ZUZALU_PARTICIPANTS_GROUP_URL,
} from "../../util/auth";
import {
  formatPollCreated,
  generatePollHTML,
  PollWithVotes,
  sendMessage,
} from "../../util/bot";
import { prisma } from "../../util/prisma";
import { AuthType } from "../../util/types";
import { verifyGroupProof } from "../../util/verify";

/**
 * The endpoints in this function accepts proof (PCD) in the request. It verifies
 * the proof before proceed. So in this case no other type of auth (e.g. JWT)
 * is needed.
 */
export function initPCDRoutes(
  app: express.Application,
  context: ApplicationContext
): void {
  app.post(
    "/create-ballot",
    authenticateJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as CreateBallotRequest;

      const prevBallot = await prisma.ballot.findUnique({
        where: {
          ballotURL: request.ballot.ballotURL,
        },
      });

      if (prevBallot !== null) {
        throw new Error("Ballot already exists with this URL.");
      }

      if (req.authUserType === AuthType.PCDPASS) {
        if (request.ballot.ballotType !== BallotType.PCDPASSUSER) {
          throw new Error(
            `${req.authUserType} user can't create this ballot type`
          );
        }
      } else if (req.authUserType === AuthType.ZUZALU_PARTICIPANT) {
        if (
          request.ballot.ballotType === BallotType.PCDPASSUSER ||
          request.ballot.ballotType === BallotType.ADVISORYVOTE ||
          request.ballot.ballotType === BallotType.ORGANIZERONLY
        ) {
          throw new Error(
            `${req.authUserType} user can't create this ballot type`
          );
        }
      } else if (req.authUserType === AuthType.ZUZALU_ORGANIZER) {
        if (request.ballot.ballotType === BallotType.PCDPASSUSER) {
          throw new Error(
            `${req.authUserType} user can't create this ballot type`
          );
        }
      }

      const ballotSignal: BallotSignal = {
        pollSignals: [],
        ballotTitle: request.ballot.ballotTitle,
        ballotDescription: request.ballot.ballotDescription,
        ballotType: request.ballot.ballotType,
        expiry: request.ballot.expiry,
        voterSemaphoreGroupUrls: request.ballot.voterSemaphoreGroupUrls,
        voterSemaphoreGroupRoots: request.ballot.voterSemaphoreGroupRoots,
      };

      request.polls.forEach((poll: Poll) => {
        const pollSignal: PollSignal = {
          body: poll.body,
          options: poll.options,
        };
        ballotSignal.pollSignals.push(pollSignal);
      });

      const signalHash = sha256(stableStringify(ballotSignal));
      console.log(`[SERVER BALLOT SIGNAL]`, ballotSignal);
      console.log(`[SERVER SIGNAL HASH OF BALLOT]`, signalHash);

      try {
        if (request.ballot.pollsterType == UserType.ANON) {
          let groupUrl = ZUZALU_PARTICIPANTS_GROUP_URL;
          if (request.ballot.ballotType === BallotType.ADVISORYVOTE) {
            groupUrl = ZUZALU_ORGANIZERS_GROUP_URL;
          } else if (request.ballot.ballotType === BallotType.ORGANIZERONLY) {
            groupUrl = ZUZALU_ORGANIZERS_GROUP_URL;
          } else if (request.ballot.ballotType === BallotType.STRAWPOLL) {
            groupUrl = ZUZALU_PARTICIPANTS_GROUP_URL;
          } else if (request.ballot.ballotType === BallotType.PCDPASSUSER) {
            groupUrl = PCDPASS_USERS_GROUP_URL;
          }

          // pollsterSemaphoreGroupUrl is always either SEMAPHORE_GROUP_URL or
          // SEMAPHORE_ADMIN_GROUP_URL or PCDPASS_USERS_GROUP_URL
          const nullifier = await verifyGroupProof(
            request.ballot.pollsterSemaphoreGroupUrl!,
            request.proof,
            {
              signal: signalHash,
              allowedGroups: [groupUrl!],
              claimedExtNullifier: signalHash,
            }
          );

          console.log("Valid proof with nullifier", nullifier);

          const newBallot = await prisma.ballot.create({
            data: {
              ballotTitle: request.ballot.ballotTitle,
              ballotDescription: request.ballot.ballotDescription,
              expiry: request.ballot.expiry,
              proof: request.proof,
              pollsterType: "ANON",
              pollsterNullifier: nullifier,
              pollsterSemaphoreGroupUrl:
                request.ballot.pollsterSemaphoreGroupUrl,
              voterSemaphoreGroupRoots: request.ballot.voterSemaphoreGroupRoots,
              voterSemaphoreGroupUrls: request.ballot.voterSemaphoreGroupUrls,
              ballotType: request.ballot.ballotType,
            },
          });

          await Promise.all(
            request.polls.map(async (poll) => {
              // store poll order in options so we can maintain the same
              // database schema and maintain data
              poll.options.push("poll-order-" + poll.id);

              return prisma.poll.create({
                data: {
                  body: poll.body,
                  options: poll.options,
                  ballotURL: newBallot.ballotURL,
                  expiry: request.ballot.expiry,
                },
              });
            })
          );

          if (
            newBallot.ballotType !== BallotType.PCDPASSUSER &&
            newBallot.ballotType !== BallotType.ORGANIZERONLY
          ) {
            // send message on TG channel, if bot is setup
            const ballotPost = formatPollCreated(newBallot, request.polls);
            console.log(ballotPost);
            const msg = await sendMessage(ballotPost, context.bot);
            if (msg) {
              const chatId = process.env.BOT_SUPERGROUP_ID;
              const threadId = process.env.BOT_CHANNEL_ID;
              if (!chatId || !threadId) {
                console.log(`No chatId or threadId found in .env`);
              } else {
                // Write to db
                await prisma.tGMessage.create({
                  data: {
                    messageId: msg.message_id,
                    chatId: msg.chat.id,
                    topicId: msg.message_thread_id,
                    ballotId: newBallot.ballotId,
                    messageType: MessageType.CREATE,
                  },
                });
                console.log(`[DB] message id stored`);
              }
              //
            }
          }

          res.json({
            url: newBallot.ballotURL,
          });
        } else {
          throw new Error("Unknown pollster type.");
        }
      } catch (e) {
        console.error(e);
        next(e);
      }
    }
  );

  app.post(
    "/vote-ballot",
    authenticateJWT,
    async (req: Request, res: Response, next: NextFunction) => {
      const request = req.body as MultiVoteRequest;

      const votePollIds = new Set<string>();
      const multiVoteSignal: MultiVoteSignal = {
        voteSignals: [],
      };
      for (const vote of request.votes) {
        // To confirm there is at most one vote per poll
        if (votePollIds.has(vote.pollId)) {
          if (process.env.NODE_ENV !== "development")
            throw new Error("Duplicate vote for a poll.");
        }
        votePollIds.add(vote.pollId);

        const voteSignal: VoteSignal = {
          pollId: vote.pollId,
          voteIdx: vote.voteIdx,
        };
        multiVoteSignal.voteSignals.push(voteSignal);
      }
      const signalHash = sha256(stableStringify(multiVoteSignal));

      const allVotes: PollWithVotes[] = [];

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

        const ballotURL = parseInt(request.ballotURL);
        if (isNaN(ballotURL)) {
          throw new Error("Invalid ballot URL.");
        }
        const ballot = await prisma.ballot.findFirst({
          where: {
            ballotURL: ballotURL,
            ballotType: {
              in: getVisibleBallotTypesForUser(req.authUserType),
            },
          },
        });

        if (ballot === null) {
          throw new Error("Can't find the given ballot.");
        }

        // Only use of voterSemaphoreGroupUrl is to check if it's in the list of
        // allowed groups. The proof is verified by checking that the root in the
        // PCD matches one of the roots in ballot.voterSemaphoreGroupRoots
        const nullifier = await verifyGroupProof(
          request.voterSemaphoreGroupUrl,
          request.proof,
          {
            signal: signalHash,
            allowedGroups: ballot.voterSemaphoreGroupUrls,
            allowedRoots: ballot.voterSemaphoreGroupRoots,
            claimedExtNullifier: ballot.ballotId.toString(),
          }
        );

        const previousBallotVote = await prisma.vote.findFirst({
          where: {
            voterNullifier: nullifier,
          },
        });
        if (previousBallotVote !== null) {
          // This error string is used in the frontend to determine whether to
          // show the "already voted" message and thus display the vote results.
          // Do not change without changing the corresponding check in frontend.
          if (process.env.NODE_ENV !== "development")
            throw new Error("User has already voted on this ballot.");
        }

        for (const vote of request.votes) {
          await prisma.vote.create({
            data: {
              pollId: vote.pollId,
              voterType: "ANON",
              voterNullifier: nullifier,
              voterSemaphoreGroupUrl: request.voterSemaphoreGroupUrl,
              voteIdx: vote.voteIdx,
              proof: request.proof,
            },
          });

          const poll = await prisma.poll.findUnique({
            where: {
              id: vote.pollId,
            },
            include: { votes: true },
          });
          if (poll) allVotes.push(poll);
        }

        const multiVoteResponse: MultiVoteResponse = {
          userVotes: multiVoteSignal.voteSignals,
        };

        const originalBallotMsg = await prisma.tGMessage.findFirst({
          where: {
            ballotId: ballot.ballotId,
            messageType: MessageType.CREATE,
          },
        });
        const voteBallotMsg = await prisma.tGMessage.findFirst({
          where: {
            ballotId: ballot.ballotId,
            messageType: MessageType.RESULTS,
          },
        });
        if (voteBallotMsg) {
          console.log(`Vote msg found`);

          //
          const msg = await context.bot?.api.editMessageText(
            voteBallotMsg.chatId.toString(),
            parseInt(voteBallotMsg.messageId.toString()),
            generatePollHTML(allVotes),
            { parse_mode: "HTML" }
          );
          if (msg) console.log(`Edited vote msg`);
        } else if (originalBallotMsg) {
          console.log(`No vote msg found`);
          // TODO: Include "Vote Here"
          const msg = await context.bot?.api.sendMessage(
            originalBallotMsg.chatId.toString(),
            generatePollHTML(allVotes),
            {
              reply_to_message_id: parseInt(
                originalBallotMsg.messageId.toString()
              ),
              parse_mode: "HTML",
            }
          );
          if (msg) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, messageId, ...resultsMsg } = originalBallotMsg;
            await prisma.tGMessage.create({
              data: {
                ...resultsMsg,
                messageId: msg.message_id,
                messageType: MessageType.RESULTS,
              },
            });
            console.log(`Updated DB with RESULTS`);
          }
          //
        }
        res.json(multiVoteResponse);
      } catch (e) {
        console.error(e);
        next(e);
      }
    }
  );
}

export type CreateBallotRequest = {
  ballot: Ballot;
  polls: Poll[];
  proof: string;
};

export type BallotSignal = {
  pollSignals: PollSignal[];
  ballotTitle: string;
  ballotDescription: string;
  ballotType: BallotType;
  expiry: Date;
  voterSemaphoreGroupUrls: string[];
  voterSemaphoreGroupRoots: string[];
};

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
};

export type VoteSignal = {
  pollId: string;
  voteIdx: number;
};

export type MultiVoteResponse = {
  userVotes: VoteSignal[];
};
