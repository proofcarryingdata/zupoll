import { ZUPOLL_SERVER_URL } from "../src/util";
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
    proof: parsedPcd.pcd
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
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return undefined;
    return await res;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}
