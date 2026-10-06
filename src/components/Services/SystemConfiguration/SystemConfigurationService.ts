import Http from "../Http/HttpClient";

export type VaultEncryptionKeyStatus = {
  configured: boolean;
  updatedAt: string | null;
  updatedBy: { id: string; name: string; email: string } | null;
  description?: string;
};

export class SystemConfigurationService {
  async getVaultEncryptionKeyStatus(): Promise<VaultEncryptionKeyStatus> {
    const response = await Http.get(
      `/api/system-configuration/security/vault-encryption-key`,
    );
    return response.data;
  }

  async putVaultEncryptionKey(value: string): Promise<VaultEncryptionKeyStatus> {
    const response = await Http.put(
      `/api/system-configuration/security/vault-encryption-key`,
      { value },
    );
    return response.data;
  }
}

const systemConfigurationService = new SystemConfigurationService();
export default systemConfigurationService;
