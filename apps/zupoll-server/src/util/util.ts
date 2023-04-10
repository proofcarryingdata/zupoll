import { PASSPORT_SERVER } from "./auth";

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export async function fetchAndVerifyName(commitment: string, uuid: string): Promise<string> {
  const response = await fetch(`${PASSPORT_SERVER}/zuzalu/participant/${uuid}`);
  const participant = await response.json();

  if (participant["uuid"] !== uuid || participant["commitment"] !== commitment) {
    throw new Error("Invalid uuid or commitment for participant");
  }

  return participant["name"];
}


