import { MessageType } from "../constants/Types";

const useEncryptHook = () => {
  const Encrypt = (value: string, key: string, type: string) => {
    if (!value) return "";
    if (type == MessageType.AUDIO) return value;
    let encrypted = "";
    for (let i = 0; i < value.length; i++) {
      encrypted += String.fromCharCode(
        value.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  };

  const Desencrypt = (value: string, key: string, type: string) => {
    if (!value) return "";
    if (type == MessageType.AUDIO) return value;
    const decoded = atob(value);
    let decrypted = "";
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  };

  return { Encrypt, Desencrypt };
};

export default useEncryptHook;
