import {
  deserializeSemaphoreGroup,
  SemaphoreGroupPCDPackage,
  SerializedSemaphoreGroup,
} from "@pcd/semaphore-group-pcd";
import {
  generateMessageHash,
  SemaphoreSignaturePCDPackage,
} from "@pcd/semaphore-signature-pcd";

// Returns nullfier or throws error.
export async function verifyGroupProof(
  semaphoreGroupUrl: string,
  proof: string,
  options: {
    signal?: string;
    allowedGroups?: string[];
    allowedRoots?: string[];
    claimedExtNullifier?: string;
  }
): Promise<string> {
  if (
    options.allowedGroups &&
    !options.allowedGroups.includes(semaphoreGroupUrl)
  ) {
    throw new Error(`Not in Semaphore groups allowed to perform action.`);
  }

  const pcd = await SemaphoreGroupPCDPackage.deserialize(proof);
  const verified = await SemaphoreGroupPCDPackage.verify(pcd);
  if (!verified) {
    throw new Error("Invalid proof.");
  }

  // check externalNullifier
  if (
    options.claimedExtNullifier &&
    generateMessageHash(options.claimedExtNullifier).toString() !=
      pcd.claim.externalNullifier
  ) {
    throw new Error("Invalid external nullifier in proof.");
  }

  // check signal
  if (
    options.signal &&
    pcd.claim.signal !== generateMessageHash(options.signal).toString()
  ) {
    throw new Error("Posted signal doesn't match signal in claim.");
  }

  if (options.allowedRoots && options.allowedRoots.length > 0) {
    let anyRootMatches = false;

    for (const root of options.allowedRoots) {
      if (pcd.claim.merkleRoot === root) {
        anyRootMatches = true;
        break;
      }
    }

    if (!anyRootMatches) {
      console.log("allowed roots", options.allowedRoots);
      console.log("merkle root", pcd.claim.merkleRoot);

      throw new Error("Current root doesn't match any of the allowed roots");
    }
  } else {
    const response = await fetch(semaphoreGroupUrl);
    const json = await response.text();
    const serializedGroup = JSON.parse(json) as SerializedSemaphoreGroup;
    const group = deserializeSemaphoreGroup(serializedGroup);
    if (pcd.claim.merkleRoot !== group.root.toString()) {
      throw new Error(
        "Current root doesn't match claim group merkle tree root."
      );
    }
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
    throw new Error(`Not in Semaphore groups allowed to perform action.`);
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
