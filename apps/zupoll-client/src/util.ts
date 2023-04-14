export const IS_PROD = process.env.NODE_ENV === "production";

export const PASSPORT_URL = IS_PROD
  ? "https://zupass.org/"
  : "http://localhost:3000/";

export const PASSPORT_SERVER_URL = IS_PROD
  ? "https://api.pcd-passport.com/"
  : "http://localhost:3002/";

export const CONFESSIONS_SERVER_URL = IS_PROD
  ? "https://confessions-server.onrender.com/"
  : "http://localhost:3005/";

export const SEMAPHORE_GROUP_URL = IS_PROD
  ? "https://api.pcd-passport.com/semaphore/1"
  : "http://localhost:3002/semaphore/1";

export const SEMAPHORE_ADMIN_GROUP_URL = IS_PROD
  ? "https://api.pcd-passport.com/semaphore/1"
  : "http://localhost:3002/semaphore/1";

console.log("environment variables:");
console.log("PASSPORT_URL", PASSPORT_URL);
console.log("PASSPORT_SERVER_URL", PASSPORT_SERVER_URL);
console.log("CONFESSIONS_SERVER_URL", CONFESSIONS_SERVER_URL);
console.log("SEMAPHORE_GROUP_URL", SEMAPHORE_GROUP_URL);
console.log("SEMAPHORE_ADMIN_GROUP_URL", SEMAPHORE_ADMIN_GROUP_URL);

// Popup window will redirect to the passport to request a proof.
// Open the popup window under the current domain, let it redirect there:
export function requestProofFromPassport(proofUrl: string, onPopupClose: () => void) {
  const popupUrl = `/popup?proofUrl=${encodeURIComponent(proofUrl)}`;
  const win = window.open(popupUrl, "_blank", "width=360,height=480,top=100,popup");
  const timer = setInterval(function() {
    if(win && win.closed) {
      clearInterval(timer);
      onPopupClose();
    }
  }, 1000);
}
