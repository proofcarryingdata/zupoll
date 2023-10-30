import {
  constructPassportPcdGetRequestUrl,
  openPassportPopup,
} from "@pcd/passport-interface";
import { ArgumentTypeName } from "@pcd/pcd-types";
import {
  generateMessageHash,
  SemaphoreGroupPCDPackage,
} from "@pcd/semaphore-group-pcd";

export function openZuzaluMembershipPopup(
  urlToPassportWebsite: string,
  popupUrl: string,
  urlToSemaphoreGroup: string,
  originalSiteName: string,
  signal?: string,
  externalNullifier?: string,
  returnUrl?: string
) {
  const proofUrl = constructPassportPcdGetRequestUrl<
    typeof SemaphoreGroupPCDPackage
  >(
    urlToPassportWebsite,
    returnUrl || popupUrl,
    SemaphoreGroupPCDPackage.name,
    {
      externalNullifier: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value:
          externalNullifier ?? generateMessageHash(originalSiteName).toString(),
      },
      group: {
        argumentType: ArgumentTypeName.Object,
        userProvided: false,
        remoteUrl: urlToSemaphoreGroup,
      },
      identity: {
        argumentType: ArgumentTypeName.PCD,
        value: undefined,
        userProvided: true,
      },
      signal: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value: signal ?? "1",
      },
    },
    {
      title: "Zuzalu Anon Auth",
      description: originalSiteName,
    }
  );
  if (returnUrl) {
    window.location.href = proofUrl;
  } else {
    openPassportPopup(popupUrl, proofUrl);
  }
}
