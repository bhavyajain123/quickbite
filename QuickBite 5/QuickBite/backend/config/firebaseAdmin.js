
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
 return require("./firebase-service-account.json");
}
let app;

function getFirebaseApp() {
  if (app) return app;

  app =
    getApps().find((item) => item.name === "quickbite-admin") ||
    initializeApp(
      {
        credential: cert(serviceAccount),
      },
      "quickbite-admin"
    );
  return app;
}
module.exports = { getFirebaseApp, getAuth };
