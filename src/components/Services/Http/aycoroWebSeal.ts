import { AxiosInstance } from "axios";
import {
  attachAycoroSeal,
  SealCrypto,
} from "./aycoroSealProtocol";

const webSealCrypto: SealCrypto = {
  async sha256(data) {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  },
  async hmacSha256(key, message) {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, message));
  },
  async aesGcmEncrypt(key, iv, plaintext) {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-GCM" },
      false,
      ["encrypt"],
    );
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      cryptoKey,
      plaintext,
    );
    return new Uint8Array(encrypted);
  },
  randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  },
};

export function installAycoroWebSeal(
  client: AxiosInstance,
  clientType: string,
  secret: string | undefined,
  apiBaseUrl: string | undefined,
) {
  client.interceptors.request.use(async (config) => {
    await attachAycoroSeal(
      config,
      { clientType, secret, apiBaseUrl },
      webSealCrypto,
    );
    return config;
  });
}
