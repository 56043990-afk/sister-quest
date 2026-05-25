/**
 * Active user singleton — imported by NavBar, dashboards, quiz, and review pages.
 * Always resolves from localStorage; updated atomically via switchUser().
 * Listeners (NavBar) re-render automatically when userId changes.
 */

import { USERS } from "@/types/user";

let _activeUserId: string = "pink";
type Listener = (id: string) => void;
const _listeners = new Set<Listener>();

if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("sisterquest_user");
    _activeUserId = stored || "pink";
  } catch {}
}

export function getActiveUserId(): string {
  return _activeUserId;
}

export function getActiveUser() {
  return USERS.find((u) => u.id === _activeUserId) || USERS[0];
}

export function switchUser(userId: string) {
  _activeUserId = userId;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("sisterquest_user", userId);
    } catch {}
  }
  _listeners.forEach((fn) => fn(userId));
}

export function subscribeActiveUser(listener: Listener): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}