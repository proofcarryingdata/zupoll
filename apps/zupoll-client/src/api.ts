import { ZUPOLL_SERVER_URL } from "../src/util";
import { CreatePollRequest, VoteRequest } from "./types";

export async function createPoll(
  request: CreatePollRequest
): Promise<any> {
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
    return undefined;
  }
}

export async function doVote(
  request: VoteRequest
): Promise<any> {
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
  } catch {
    return undefined;
  }
}

export async function login(
  semaphoreGroupUrl: string,
  pcdStr: string
): Promise<any> {
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
    return undefined;
  }
}

export async function listPolls(
  accessToken: string | null
): Promise<any> {
  if (!accessToken) return null;

  const url = `${ZUPOLL_SERVER_URL}polls`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return undefined;
  }
}
