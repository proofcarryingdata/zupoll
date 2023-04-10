import { ZUPOLL_SERVER_URL } from "./util";

export async function postConfession(
    semaphoreGroupUrl: string,
    confession: string,
    pcdStr: string
): Promise<Response> {
  const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));

  const request = {
    semaphoreGroupUrl,
    confession,
    proof: parsedPcd.pcd
  };
  const url = `${ZUPOLL_SERVER_URL}new-confession`;

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
  const url = `${ZUPOLL_SERVER_URL}/login`;

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
  accessToken: string | null,
): Promise<any> {
  if (!accessToken) return null;

  const url = `${ZUPOLL_SERVER_URL}/polls`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) return null;
  return await res.json();
}
