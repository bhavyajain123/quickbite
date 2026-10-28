
import React from "react";

export default function ProtectedRoute({ children }) {
  const localSession = localStorage.getItem("quickbite-demo-session");
  const temporarySession = sessionStorage.getItem("quickbite-demo-session");
  const token = localStorage.getItem("token");

  const session = localSession || temporarySession;

  if (!session || !token) {
    window.location.replace("/login");
    return null;
  }

  try {
    const parsedSession = JSON.parse(session);

    if (!parsedSession.loggedIn) {
      window.location.replace("/login");
      return null;
    }
  } catch {
    window.location.replace("/login");
    return null;
  }

  return children;
}
