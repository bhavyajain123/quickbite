
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./firebase-service-account.json");

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
