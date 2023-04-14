import {
  deserializeSemaphoreGroup,
  SemaphoreGroupPCDPackage,
  SerializedSemaphoreGroup,
} from "@pcd/semaphore-group-pcd";
import {
  generateMessageHash,
  SemaphoreSignaturePCDPackage,
} from "@pcd/semaphore-signature-pcd";
import { Group } from "@semaphore-protocol/group";

// Returns nullfier or throws error.
export async function verifyGroupProof(
  semaphoreGroupUrl: string,
  proof: string,
  options: {
    signal?: string;
    allowedGroups?: string[];
    claimedExtNullifier?: string;
  }
): Promise<string> {
  if (
    options.allowedGroups &&
    !options.allowedGroups.includes(semaphoreGroupUrl)
  ) {
    throw new Error(
      `Not in semaphore groups allowed to perform action. expected ${options.allowedGroups} actual: ${semaphoreGroupUrl}`
    );
  }

  const pcd = await SemaphoreGroupPCDPackage.deserialize(proof);
  if (
    options.claimedExtNullifier &&
    generateMessageHash(options.claimedExtNullifier).toString() !=
      pcd.claim.externalNullifier
  ) {
    throw new Error("invalid external nullifier in proof");
  }

  const verified = await SemaphoreGroupPCDPackage.verify(pcd);
  if (!verified) {
    throw new Error("invalid proof");
  }

  // check semaphoreGroupUrl matches the claim
  const response = await fetch(semaphoreGroupUrl);
  const json = await response.text();
  const serializedGroup = JSON.parse(json) as SerializedSemaphoreGroup;
  const group = new Group(1, 16);
  group.addMembers(serializedGroup.members);
  if (
    deserializeSemaphoreGroup(pcd.claim.group).root.toString() !==
    group.root.toString()
  ) {
    throw new Error(
      "semaphoreGroupUrl doesn't match claim group merkletree root"
    );
  }

  if (
    options.signal &&
    pcd.claim.signal !== generateMessageHash(options.signal).toString()
  ) {
    throw new Error("signal doesn't match claim");
  }

  return pcd.claim.nullifierHash;
}

export async function verifySignatureProof(
  commitment: string,
  proof: string,
  signal: string,
  allowedGroups: string[]
): Promise<string> {
  let found = false;
  for (const group of allowedGroups) {
    const response = await fetch(group);
    const json = await response.text();
    const serializedGroup = JSON.parse(json) as SerializedSemaphoreGroup;
    if (serializedGroup.members.includes(commitment)) {
      found = true;
      break;
    }
  }
  if (!found) {
    throw new Error(
      `Not in any of semaphore groups allowed to perform action.`
    );
  }

  const pcd = await SemaphoreSignaturePCDPackage.deserialize(proof);

  const verified = await SemaphoreSignaturePCDPackage.verify(pcd);
  if (!verified) {
    throw new Error("invalid proof");
  }

  // check commitment matches the claim
  if (commitment !== pcd.claim.identityCommitment) {
    throw new Error("given commitment doesn't match PCD signature");
  }

  if (pcd.claim.signedMessage !== signal) {
    throw new Error("signal doesn't match claim");
  }

  return pcd.claim.nullifierHash;
}
