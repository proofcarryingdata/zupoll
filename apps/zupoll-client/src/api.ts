import { ZUPOLL_SERVER_URL } from "./env";
import {
  BotPostRequest,
  CreateBallotRequest,
  MultiVoteRequest
} from "./requestTypes";
import { LoginConfig } from "./types";

export async function createBallot(
  request: CreateBallotRequest,
  accessToken: string
): Promise<Response | undefined> {
  if (!accessToken) return undefined;

  const url = `${ZUPOLL_SERVER_URL}create-ballot`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function voteBallot(
  request: MultiVoteRequest,
  accessToken: string
): Promise<Response | undefined> {
  if (!accessToken) return undefined;

  const url = `${ZUPOLL_SERVER_URL}vote-ballot`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function login(
  config: LoginConfig,
  pcdStr: string
): Promise<Response | undefined> {
  const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));
  const request = {
    semaphoreGroupUrl: config.groupUrl,
    proof: parsedPcd.pcd
  };
  const url = `${ZUPOLL_SERVER_URL}login`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function botPost(
  request: BotPostRequest,
  accessToken: string | null
): Promise<Response | undefined> {
  if (!accessToken) return undefined;

  const url = `${ZUPOLL_SERVER_URL}bot-post`;

  try {
    const res = fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function listBallots(
  accessToken: string | null
): Promise<Response | undefined> {
  if (!accessToken) return undefined;

  const url = `${ZUPOLL_SERVER_URL}ballots`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
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

  const url = `${ZUPOLL_SERVER_URL}ballot-polls/${ballotURL}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function getLatestSemaphoreGroupHash(
  url: string
): Promise<string | null> {
  const res = await fetch(url);

  if (!res.ok) {
    return null;
  }

  const rootHash = await res.json();
  return rootHash;
}

export function getHistoricGroupUrl(
  groupId: string,
  rootHash: string,
  serverUrl: string
): string {
  return `${serverUrl}semaphore/historic/${groupId}/${rootHash}`;
}

/**
 * When attempting to interact with a ballot, the user may be in an invalid
 * login state. In that case, they need to be redirected to a login landing
 * page. This page varies depending on the ballot type, which might not be
 * known to the client. In this case, we can request that the server tell us
 * which URL to direct the user to.
 */
export async function getLoginRedirectUrl(ballotURL: string): Promise<string> {
  const url = `${ZUPOLL_SERVER_URL}login-redirect?ballotURL=${ballotURL}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.url ?? "/";
  } catch (e) {
    console.log(e);
    return "/";
  }
}
