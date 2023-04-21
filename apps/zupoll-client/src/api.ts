import { ZUPOLL_SERVER_URL } from "../src/util";
import { CreatePollRequest, VoteRequest } from "./types";

export async function createPoll(
  request: CreatePollRequest
): Promise<Response> {
  const url = `${ZUPOLL_SERVER_URL}create-poll`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

export async function doVote(
  request: VoteRequest
): Promise<Response> {
  const url = `${ZUPOLL_SERVER_URL}vote`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
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

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

export async function listPolls(
  accessToken: string | null
): Promise<any> {
  if (!accessToken) return null;

  // const query = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString()
  // }).toString();
  const url = `${ZUPOLL_SERVER_URL}polls`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) return null;
  return await res.json();
}
