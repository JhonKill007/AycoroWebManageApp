import axios, { AxiosRequestConfig } from "axios";

/**
 * Aycoro Seal phase 1.
 *
 * Any secret shipped to a browser or a mobile binary can be recovered by
 * reverse engineering. This seal is an anti-automation barrier, not a secret
 * that must remain unknowable. Do not log the master secret, the hourly key,
 * or the decrypted payload.
 *
 * Hourly key material: ClientType|KeyVersion|YYYY-MM-DD|HH (UTC, hour 00-23).
 * HourlyKey = HMAC-SHA256(UTF-8(ClientMasterSecret), UTF-8(material)).
 * Payload keys, in order: bodyHash, clientType, endpoint, method, nonce,
 * protocolVersion, timestamp. No extra whitespace. UTF-8 JSON.
 * Seal wire format: base64url(IV(12) || ciphertext || GCM tag(16)).
 * Endpoint: path plus query pairs sorted by decoded key, then value.
 * Query decode treats "+" as space. Query encode is RFC 3986.
 * BodyHash is lowercase hex SHA-256 of the exact bytes sent.
 * Multipart and an empty body both hash zero bytes.
 * KeyVersion and ProtocolVersion are 1. They are not the API route version.
 */

export const AYCORO_SEAL_KEY_VERSION = 1;
export const AYCORO_SEAL_PROTOCOL_VERSION = 1;

export const AycoroClientType = {
  Mobile: "MOBILE",
  Web: "WEB",
  ManageWeb: "MANAGE_WEB",
  AuthSystemWeb: "AUTH_SYSTEM_WEB",
} as const;

export type SealCrypto = {
  sha256(data: Uint8Array): Promise<Uint8Array>;
  hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array>;
  aesGcmEncrypt(key: Uint8Array, iv: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array>;
  randomBytes(length: number): Uint8Array | Promise<Uint8Array>;
};

type SealRequestConfig = AxiosRequestConfig & {
  headers?: Record<string, unknown>;
};

export function shouldAttachSeal(absoluteUrl: string, apiBaseUrl?: string): boolean {
  if (!absoluteUrl) return false;
  if (!/^https?:\/\//i.test(absoluteUrl)) return true;
  if (!apiBaseUrl) return false;

  try {
    return new URL(absoluteUrl).host === new URL(apiBaseUrl).host;
  } catch {
    return false;
  }
}

export function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => {
    return `%${char.charCodeAt(0).toString(16).toUpperCase()}`;
  });
}

export function decodeFormComponent(value: string): string {
  const withSpaces = value.replace(/\+/g, " ");
  try {
    return decodeURIComponent(withSpaces);
  } catch {
    return withSpaces;
  }
}

export function canonicalEndpoint(path: string, rawQuery: string): string {
  let normalized = path || "/";
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;

  const query = rawQuery.startsWith("?") ? rawQuery.slice(1) : rawQuery;
  if (!query) return normalized;

  const pairs: Array<[string, string]> = [];
  for (const part of query.split("&")) {
    if (!part) continue;
    const separator = part.indexOf("=");
    const rawKey = separator >= 0 ? part.slice(0, separator) : part;
    const rawValue = separator >= 0 ? part.slice(separator + 1) : "";
    pairs.push([decodeFormComponent(rawKey), decodeFormComponent(rawValue)]);
  }

  if (!pairs.length) return normalized;

  pairs.sort((left, right) => {
    if (left[0] < right[0]) return -1;
    if (left[0] > right[0]) return 1;
    if (left[1] < right[1]) return -1;
    if (left[1] > right[1]) return 1;
    return 0;
  });

  const encoded = pairs
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");
  return `${normalized}?${encoded}`;
}

export function jsonEscape(value: string): string {
  let escaped = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    switch (char) {
      case "\\":
        escaped += "\\\\";
        break;
      case "\"":
        escaped += "\\\"";
        break;
      case "\b":
        escaped += "\\b";
        break;
      case "\f":
        escaped += "\\f";
        break;
      case "\n":
        escaped += "\\n";
        break;
      case "\r":
        escaped += "\\r";
        break;
      case "\t":
        escaped += "\\t";
        break;
      default:
        if (char < " ") {
          escaped += `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
        } else {
          escaped += char;
        }
        break;
    }
  }
  return escaped;
}

export function buildSealPayload(input: {
  bodyHash: string;
  clientType: string;
  endpoint: string;
  method: string;
  nonce: string;
  protocolVersion: number;
  timestamp: number;
}): string {
  return (
    `{"bodyHash":"${jsonEscape(input.bodyHash)}"` +
    `,"clientType":"${jsonEscape(input.clientType)}"` +
    `,"endpoint":"${jsonEscape(input.endpoint)}"` +
    `,"method":"${jsonEscape(input.method)}"` +
    `,"nonce":"${jsonEscape(input.nonce)}"` +
    `,"protocolVersion":${input.protocolVersion}` +
    `,"timestamp":${input.timestamp}}`
  );
}

export function canonicalKeyMaterial(
  clientType: string,
  keyVersion: number,
  timestampSeconds: number,
): { material: string; keySlot: number } {
  const date = new Date(timestampSeconds * 1000);
  const year = date.getUTCFullYear().toString();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  const hour = `${date.getUTCHours()}`.padStart(2, "0");
  return {
    material: `${clientType}|${keyVersion}|${year}-${month}-${day}|${hour}`,
    keySlot: date.getUTCHours(),
  };
}

function utf8Encode(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (let index = 0; index < bytes.length; index += 1) {
    hex += bytes[index].toString(16).padStart(2, "0");
  }
  return hex;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function concat(left: Uint8Array, right: Uint8Array): Uint8Array {
  const combined = new Uint8Array(left.length + right.length);
  combined.set(left, 0);
  combined.set(right, left.length);
  return combined;
}

function randomNonce(bytes: Uint8Array): string {
  const hex = toHex(bytes);
  const variant = ((bytes[8] & 0x3f) | 0x80).toString(16).padStart(2, "0");
  const version = ((bytes[6] & 0x0f) | 0x40).toString(16).padStart(2, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${version}${hex.slice(14, 16)}-${variant}${hex.slice(18, 20)}-${hex.slice(20)}`;
}

async function bodyBytes(config: SealRequestConfig): Promise<Uint8Array> {
  const data = config.data;
  if (data == null || data === "") return new Uint8Array(0);
  if (typeof FormData !== "undefined" && data instanceof FormData) return new Uint8Array(0);
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return new Uint8Array(await data.arrayBuffer());
  }
  if (typeof data === "string") return utf8Encode(data);
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  if (typeof URLSearchParams !== "undefined" && data instanceof URLSearchParams) {
    return utf8Encode(data.toString());
  }

  const json = JSON.stringify(data);
  config.data = json;
  return utf8Encode(json);
}

export async function attachAycoroSeal(
  config: SealRequestConfig,
  options: { clientType: string; secret?: string; apiBaseUrl?: string },
  crypto: SealCrypto,
): Promise<void> {
  const secret = options.secret?.trim();
  if (!secret) return;

  try {
    const absolute = axios.getUri(config);
    if (!shouldAttachSeal(absolute, options.apiBaseUrl || config.baseURL)) return;

    const url = new URL(absolute);
    const endpoint = canonicalEndpoint(url.pathname, url.search);
    const method = (config.method || "GET").toUpperCase();
    const bytes = await bodyBytes(config);
    const bodyHash = toHex(await crypto.sha256(bytes));
    const timestamp = Math.floor(Date.now() / 1000);
    const { material, keySlot } = canonicalKeyMaterial(
      options.clientType,
      AYCORO_SEAL_KEY_VERSION,
      timestamp,
    );
    const hourlyKey = await crypto.hmacSha256(utf8Encode(secret), utf8Encode(material));
    const nonce = randomNonce(new Uint8Array(await crypto.randomBytes(16)));
    const payload = buildSealPayload({
      bodyHash,
      clientType: options.clientType,
      endpoint,
      method,
      nonce,
      protocolVersion: AYCORO_SEAL_PROTOCOL_VERSION,
      timestamp,
    });
    const iv = new Uint8Array(await crypto.randomBytes(12));
    const encrypted = await crypto.aesGcmEncrypt(hourlyKey, iv, utf8Encode(payload));
    const seal = toBase64Url(concat(iv, encrypted));

    config.headers = config.headers ?? {};
    config.headers["X-Aycoro-Client-Type"] = options.clientType;
    config.headers["X-Aycoro-Timestamp"] = `${timestamp}`;
    config.headers["X-Aycoro-Key-Version"] = `${AYCORO_SEAL_KEY_VERSION}`;
    config.headers["X-Aycoro-Key-Slot"] = `${keySlot}`;
    config.headers["X-Aycoro-Seal"] = seal;
  } catch {
    return;
  }
}
