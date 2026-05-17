import { usersApi } from "./api";

const THROTTLE_MS = 5 * 60 * 1000;
let lastPingAt = 0;

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "web-default";
  let id = localStorage.getItem("cp_device_id");
  if (!id) {
    id = `web-${crypto.randomUUID()}`;
    localStorage.setItem("cp_device_id", id);
  }
  return id;
}

/** Report web activity for DAU/WAU/MAU (throttled, non-blocking). */
export async function pingUserActivity(): Promise<void> {
  const now = Date.now();
  if (now - lastPingAt < THROTTLE_MS) return;
  lastPingAt = now;

  try {
    await usersApi.recordActivity({
      platform: "web",
      deviceId: getOrCreateDeviceId(),
    });
  } catch {
    // Activity tracking must not affect UX
  }
}
