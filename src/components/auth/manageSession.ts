const INTERNAL_TOKEN_KEY = "internalToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const AYCORO_TOKEN_KEY = "aycoroAuthToken";
const SYSTEM_TOKEN_KEY = "systemToken";
const MANAGE_DEVICE_ID_KEY = "manageDeviceId";
const LOGOUT_BROADCAST_KEY = "aycoro-manage-logout";

const MANAGE_API_URL =
  process.env.REACT_APP_MANAGE_API_URL || "https://manage.api.aycoro.com";
const AYCORO_API_URL = process.env.REACT_APP_API_URL || "https://api.aycoro.com";

export const MANAGE_JWT_CLOCK_SKEW_SECONDS = 60;
export const MANAGE_SESSION_CHECK_MS = 30 * 1000;
export const MANAGE_HEARTBEAT_MS = 5 * 60 * 1000;

const SESSION_KEYS = [
  INTERNAL_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  AYCORO_TOKEN_KEY,
  SYSTEM_TOKEN_KEY,
];

type SessionListener = (authenticated: boolean) => void;

const listeners = new Set<SessionListener>();
let endingSession = false;
let watchStarted = false;
let checkTimer: number | undefined;
let heartbeatTimer: number | undefined;

export const getManageDeviceId = (): string => {
  try {
    const existing = localStorage.getItem(MANAGE_DEVICE_ID_KEY);
    if (existing) return existing;
    const created = `manage-${crypto.randomUUID()}`;
    localStorage.setItem(MANAGE_DEVICE_ID_KEY, created);
    return created;
  } catch {
    return "manage-web";
  }
};

export const decodeJwtPayload = (
  token: string,
): Record<string, unknown> | null => {
  const trimmed = String(token || "").trim();
  const parts = trimmed.split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
};

export const getJwtExpiryMs = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp);
  if (!Number.isFinite(exp) || exp <= 0) return null;
  return exp * 1000;
};

export const isJwtExpired = (
  token: string,
  now = Date.now(),
  skewSeconds = MANAGE_JWT_CLOCK_SKEW_SECONDS,
): boolean => {
  const trimmed = String(token || "").trim();
  if (!trimmed) return true;
  const expiryMs = getJwtExpiryMs(trimmed);
  if (expiryMs == null) return true;
  return now >= expiryMs + skewSeconds * 1000;
};

export const hasValidManageSession = (now = Date.now()): boolean => {
  try {
    const internalToken = localStorage.getItem(INTERNAL_TOKEN_KEY);
    const aycoroToken = localStorage.getItem(AYCORO_TOKEN_KEY);
    if (!internalToken || !aycoroToken) return false;
    return !isJwtExpired(internalToken, now) && !isJwtExpired(aycoroToken, now);
  } catch {
    return false;
  }
};

export const subscribeManageSession = (listener: SessionListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifySessionListeners = (authenticated: boolean) => {
  listeners.forEach((listener) => listener(authenticated));
};

const clearSessionStorage = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  try {
    localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()));
  } catch {
    // Ignore quota / private-mode failures; local keys are already cleared.
  }
};

const revokeAycoroSession = (aycoroToken: string) => {
  const token = String(aycoroToken || "").trim();
  if (!token) return;

  const body = JSON.stringify({ accessToken: token });
  try {
    fetch(`${AYCORO_API_URL}/api/v3/AuthSession/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Logout must continue even if the network call cannot start.
  }
};

const revokeViaManageApi = (internalToken: string, aycoroToken: string) => {
  const access = String(internalToken || "").trim();
  if (!access) return;

  try {
    fetch(`${MANAGE_API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
        "X-Aycoro-Token": String(aycoroToken || "").trim(),
      },
      body: "{}",
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Auxiliary; WebApi logout is the session-revocation authority.
  }
};

export const sendManageHeartbeat = async (): Promise<"ok" | "unauthorized" | "forbidden" | "error"> => {
  const internalToken = localStorage.getItem(INTERNAL_TOKEN_KEY);
  const aycoroToken = localStorage.getItem(AYCORO_TOKEN_KEY);
  if (!internalToken || !aycoroToken) return "unauthorized";

  try {
    const response = await fetch(`${MANAGE_API_URL}/api/auth/heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${internalToken}`,
        "X-Aycoro-Token": aycoroToken,
      },
      body: "{}",
    });
    if (response.status === 401) return "unauthorized";
    if (response.status === 403) return "forbidden";
    if (!response.ok) return "error";
    return "ok";
  } catch {
    return "error";
  }
};

export const endManageSession = (options?: {
  redirect?: boolean;
  revoke?: boolean;
}): void => {
  if (endingSession) return;
  endingSession = true;

  let internalToken = "";
  let aycoroToken = "";
  try {
    internalToken = localStorage.getItem(INTERNAL_TOKEN_KEY) || "";
    aycoroToken = localStorage.getItem(AYCORO_TOKEN_KEY) || "";
  } catch {
    internalToken = "";
    aycoroToken = "";
  }

  if (options?.revoke !== false) {
    revokeAycoroSession(aycoroToken);
    revokeViaManageApi(internalToken, aycoroToken);
  }

  try {
    clearSessionStorage();
  } catch {
    // Continue redirect even if storage is unavailable.
  }

  notifySessionListeners(false);

  const redirect = options?.redirect !== false;
  if (redirect && window.location.pathname !== "/login") {
    window.location.href = "/login";
    return;
  }

  endingSession = false;
};

export const isManageSessionEnding = () => endingSession;

const onVisibilityOrClock = async () => {
  if (endingSession) return;
  if (!hasValidManageSession()) {
    if (localStorage.getItem(INTERNAL_TOKEN_KEY) || localStorage.getItem(AYCORO_TOKEN_KEY)) {
      endManageSession();
    }
    return;
  }

  if (document.visibilityState !== "visible") return;

  const heartbeat = await sendManageHeartbeat();
  if (heartbeat === "unauthorized") {
    endManageSession();
  }
};

const onStorage = (event: StorageEvent) => {
  if (endingSession) return;
  if (event.key === LOGOUT_BROADCAST_KEY && event.newValue) {
    endManageSession({ redirect: true, revoke: false });
    return;
  }
  if (
    event.key &&
    SESSION_KEYS.includes(event.key) &&
    !event.newValue &&
    !hasValidManageSession()
  ) {
    endManageSession({ redirect: true, revoke: false });
  }
};

export const startManageSessionWatch = () => {
  if (watchStarted || typeof window === "undefined") return;
  watchStarted = true;

  window.addEventListener("storage", onStorage);
  document.addEventListener("visibilitychange", () => {
    void onVisibilityOrClock();
  });
  window.addEventListener("focus", () => {
    void onVisibilityOrClock();
  });

  checkTimer = window.setInterval(() => {
    if (!hasValidManageSession()) {
      if (localStorage.getItem(INTERNAL_TOKEN_KEY) || localStorage.getItem(AYCORO_TOKEN_KEY)) {
        endManageSession();
      }
    }
  }, MANAGE_SESSION_CHECK_MS);

  heartbeatTimer = window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    void onVisibilityOrClock();
  }, MANAGE_HEARTBEAT_MS);

  void onVisibilityOrClock();
};

export const stopManageSessionWatch = () => {
  if (!watchStarted) return;
  watchStarted = false;
  window.removeEventListener("storage", onStorage);
  if (checkTimer) window.clearInterval(checkTimer);
  if (heartbeatTimer) window.clearInterval(heartbeatTimer);
};
