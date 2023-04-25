import { PASSPORT_SERVER_URL, ZUPOLL_SERVER_URL } from "../src/util";
import { BallotPollRequest, CreateBallotRequest } from "./requestTypes";
import { CreatePollRequest, VoteRequest } from "./types";

export async function createPoll(
  request: CreatePollRequest
): Promise<Response | undefined> {
  const url = `${ZUPOLL_SERVER_URL}create-poll`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function createBallot(
  request: CreateBallotRequest
): Promise<Response | undefined> {
  const url = `${ZUPOLL_SERVER_URL}create-ballot`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function doVote(
  request: VoteRequest
): Promise<Response | undefined> {
  const url = `${ZUPOLL_SERVER_URL}vote`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function login(
  semaphoreGroupUrl: string,
  pcdStr: string
): Promise<Response | undefined> {
  const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));

  const request = {
    semaphoreGroupUrl,
    proof: parsedPcd.pcd,
  };
  const url = `${ZUPOLL_SERVER_URL}login`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function listPolls(
  accessToken: string | null
): Promise<Response | undefined> {
  if (!accessToken) return undefined;

  const url = `${ZUPOLL_SERVER_URL}polls`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function listBallotPolls(
  accessToken: string | null,
  ballotURL: string
): Promise<Response | undefined> {
  if (!accessToken) return undefined;

  const ballotPollRequest: BallotPollRequest = {
    ballotURL: parseInt(ballotURL),
  };
  const url = `${ZUPOLL_SERVER_URL}ballot-polls`;

  try {
    const res = await fetch(url, {
      method: "GET",
      body: JSON.stringify(ballotPollRequest),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function getLatestSemaphoreGroupHash(
  groupId: string
): Promise<string | null> {
  const url = `${PASSPORT_SERVER_URL}semaphore/latest-root/${encodeURIComponent(
    groupId
  )}`;
  const res = await fetch(url);

  if (!res.ok) {
    return null;
  }

  const rootHash = await res.json();
  return rootHash;
}

export function getHistoricGroupUrl(groupId: string, rootHash: string): string {
  return `${PASSPORT_SERVER_URL}semaphore/historic/${groupId}/${rootHash}`;
}
