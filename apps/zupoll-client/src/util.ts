import { constructZupassPcdGetRequestUrl } from "@pcd/passport-interface/src/PassportInterface";
import { openZupassPopup } from "@pcd/passport-interface/src/PassportPopup";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreGroupPCDPackage } from "@pcd/semaphore-group-pcd";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { generateSnarkMessageHash } from "@pcd/util";

export function openGroupMembershipPopup(
  urlToZupassClient: string,
  popupUrl: string,
  urlToSemaphoreGroup: string,
  originalSiteName: string,
  signal?: string,
  externalNullifier?: string,
  returnUrl?: string
) {
  const proofUrl = constructZupassPcdGetRequestUrl<
    typeof SemaphoreGroupPCDPackage
  >(
    urlToZupassClient,
    returnUrl || popupUrl,
    SemaphoreGroupPCDPackage.name,
    {
      externalNullifier: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value:
          externalNullifier ??
          generateSnarkMessageHash(originalSiteName).toString(),
      },
      group: {
        argumentType: ArgumentTypeName.Object,
        userProvided: false,
        remoteUrl: urlToSemaphoreGroup,
      },
      identity: {
        argumentType: ArgumentTypeName.PCD,
        pcdType: SemaphoreIdentityPCDPackage.name,
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
    openZupassPopup(popupUrl, proofUrl);
  }
}

export function removeQueryParameters(paramsToRemove?: string[]) {
  if (window?.location) {
    const currentUrl = new URL(window.location.toString());

    // Loop through the list and remove each parameter
    paramsToRemove &&
      paramsToRemove.forEach((param) => {
        currentUrl.searchParams.delete(param);
      });

    // Update the browser's address bar without refreshing the page
    window.history.replaceState({}, document.title, currentUrl.toString());
  }
}
