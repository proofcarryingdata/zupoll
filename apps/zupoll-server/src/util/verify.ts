import {
  SemaphoreGroupPCDPackage,
  SerializedSemaphoreGroup,
} from "@pcd/semaphore-group-pcd";
import {
  generateMessageHash,
  SemaphoreSignaturePCDPackage,
} from "@pcd/semaphore-signature-pcd";
import {
  ADMIN_GROUP_ID,
  PARTICIPANTS_GROUP_ID,
  PCDPASS_GROUP_ID,
  PCDPASS_HISTORIC_API_URL,
  ZUZALU_HISTORIC_API_URL,
  ZUZALU_ORGANIZERS_GROUP_URL,
  ZUZALU_PARTICIPANTS_GROUP_URL,
} from "./auth";

const residentRootCache = new Set<string>();
const organizerRootCache = new Set<string>();
const pcdpassUserRootCache = new Set<string>();

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
    generateMessageHash(options.claimedExtNullifier).toString() !==
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
  } else if (semaphoreGroupUrl === ZUZALU_PARTICIPANTS_GROUP_URL) {
    if (!residentRootCache.has(pcd.claim.merkleRoot)) {
      const validResidentRoot = await verifyRootValidity(
        PARTICIPANTS_GROUP_ID,
        pcd.claim.merkleRoot
      );
      if (validResidentRoot) {
        residentRootCache.add(pcd.claim.merkleRoot);
      } else {
        throw new Error("Claim root isn't a valid resident root.");
      }
    }
  } else if (semaphoreGroupUrl === ZUZALU_ORGANIZERS_GROUP_URL) {
    if (!organizerRootCache.has(pcd.claim.merkleRoot)) {
      const validOrganizerRoot = await verifyRootValidity(
        ADMIN_GROUP_ID,
        pcd.claim.merkleRoot
      );
      if (validOrganizerRoot) {
        organizerRootCache.add(pcd.claim.merkleRoot);
      } else {
        throw new Error("Claim root isn't a valid organizer root.");
      }
    }
  } else if (semaphoreGroupUrl === PCDPASS_GROUP_ID) {
    if (!pcdpassUserRootCache.has(pcd.claim.merkleRoot)) {
      const validPcdpassRoot = await verifyRootValidity(
        PCDPASS_GROUP_ID,
        pcd.claim.merkleRoot,
        PCDPASS_HISTORIC_API_URL
      );
      if (validPcdpassRoot) {
        pcdpassUserRootCache.add(pcd.claim.merkleRoot);
      } else {
        throw new Error("Claim root isn't a valid organizer root.");
      }
    }
  } else {
    throw new Error(
      "No allowed roots specified and group is neither the organizer or resident group."
    );
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

async function verifyRootValidity(
  groupId: string,
  root: string,
  historicAPI?: string
): Promise<boolean> {
  const response = await fetch(
    historicAPI ?? ZUZALU_HISTORIC_API_URL + groupId + "/" + root
  );
  const result = await response.json();
  return result.valid;
}
