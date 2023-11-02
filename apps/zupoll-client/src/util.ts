import { constructZupassPcdGetRequestUrl } from "@pcd/passport-interface/src/PassportInterface";
import { openZupassPopup } from "@pcd/passport-interface/src/PassportPopup";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreGroupPCDPackage } from "@pcd/semaphore-group-pcd";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { generateSnarkMessageHash } from "@pcd/util";

export const USE_CREATE_BALLOT_REDIRECT = false;

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
  console.log(`[REMOVING QUERY PARAMS POST LOGIN]`, paramsToRemove);

  if (window?.location) {
    const currentUrl = new URL(window.location.href);

    // If no parameters to remove are provided, redirect to root
    if (!paramsToRemove || paramsToRemove.length === 0) {
      currentUrl.pathname = "/";
      currentUrl.search = ""; // Clear any existing query parameters
    } else {
      // Loop through the list and remove each parameter
      paramsToRemove.forEach((param) => {
        currentUrl.searchParams.delete(param);
      });
    }

    // Update the browser's address bar without refreshing the page
    window.history.replaceState({}, document.title, currentUrl.toString());
  }
}
