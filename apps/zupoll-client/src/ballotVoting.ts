export function votedOn(ballotURL: string): boolean {
  return getVoted().includes(ballotURL);
}

export function getVoted(): Array<string> {
  const voted: Array<string> = JSON.parse(
    window.localStorage.getItem("voted") || "[]"
  );
  return voted;
}

export function setVoted(voted: Array<string>) {
  window.localStorage.setItem("voted", JSON.stringify(voted));
}