import { BallotType, ExpiryNotifStatus } from "@prisma/client";
import { prisma } from "./util/prisma";

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
