import { BallotType, ExpiryNotifStatus } from "@prisma/client";
import { getVisibleBallotTypesForUser } from "./util/auth";
import { prisma } from "./util/prisma";
import { AuthType } from "./util/types";

export async function getAllBallotsForAlerts() {
  console.log(`Running getAllBallotsForAlerts: ${Date.now()}`);

  const ballots = await prisma.ballot.findMany({
    select: {
      ballotTitle: true,
      ballotURL: true,
      expiry: true,
      expiryNotif: true,
      ballotType: true
    },
    orderBy: { expiry: "desc" },
    where: {
      NOT: {
        ballotType: {
          in: [BallotType.PCDPASSUSER, BallotType.ORGANIZERONLY]
        }
      }
    }
  });

  return ballots;
}

export async function updateBallotExpiryNotif(
  ballotURL: number,
  expiryNotif: ExpiryNotifStatus
) {
  console.log(`Running updateBallotExpiryNotif: ${Date.now()}`);

  await prisma.ballot.update({
    where: {
      ballotURL
    },
    data: {
      expiryNotif
    }
  });
}

export async function getBallotsVisibleToUserType(
  userType: AuthType | undefined
) {
  return prisma.ballot.findMany({
    select: {
      ballotTitle: true,
      ballotURL: true,
      expiry: true,
      ballotType: true,
      createdAt: true
    },
    orderBy: { expiry: "desc" },
    where: {
      ballotType: {
        in: getVisibleBallotTypesForUser(userType)
      }
    }
  });
}

export async function getBallotById(ballotURL: number) {
  return prisma.ballot.findFirst({
    where: {
      ballotURL
    }
  });
}

export async function getBallotPolls(ballotURL: number) {
  return prisma.poll.findMany({
    where: {
      ballotURL
    },
    include: {
      votes: {
        select: {
          voteIdx: true
        }
      }
    },
    orderBy: { expiry: "asc" }
  });
}
