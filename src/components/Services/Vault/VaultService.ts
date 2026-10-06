import Http from "../Http/HttpClient";

export type SecretPermissions = {
  canView: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type SecretCreator = {
  id: string;
  name: string;
  email: string;
};

export type SecretItem = {
  id: string;
  name: string;
  description: string;
  createdBy: SecretCreator | string;
  createdAt: string;
  updatedAt: string;
  permissions: SecretPermissions;
  /** True when the authenticated manager is Secret.CreatedBy (from backend). */
  isCreator?: boolean;
  /** True when the secret uses the pre-AES placeholder schema. */
  legacy?: boolean;
};

export type CreateSecretPayload = {
  name: string;
  description: string;
  value: string;
};

export type UpdateSecretPayload = {
  name?: string;
  description?: string;
  value?: string;
};

export type SecretPermissionRow = {
  managerId: string;
  managerName: string;
  managerEmail: string;
  canView: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isCreator: boolean;
};

export type VaultManagerOption = {
  id: string;
  name: string;
  email: string;
};

export type UpsertPermissionPayload = {
  canView: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export class VaultService {
  async listSecrets(): Promise<{ data: SecretItem[] }> {
    const response = await Http.get(`/api/vault/secrets`);
    return response.data;
  }

  async createSecret(payload: CreateSecretPayload): Promise<SecretItem> {
    const response = await Http.post(`/api/vault/secrets`, payload);
    return response.data;
  }

  async updateSecret(
    id: string,
    payload: UpdateSecretPayload,
  ): Promise<SecretItem> {
    const response = await Http.put(`/api/vault/secrets/${id}`, payload);
    return response.data;
  }

  async deleteSecret(id: string): Promise<{ message: string; id: string }> {
    const response = await Http.delete(`/api/vault/secrets/${id}`);
    return response.data;
  }

  async listPermissions(
    secretId: string,
  ): Promise<{ data: SecretPermissionRow[] }> {
    const response = await Http.get(`/api/vault/secrets/${secretId}/permissions`);
    return response.data;
  }

  async upsertPermission(
    secretId: string,
    managerId: string,
    payload: UpsertPermissionPayload,
  ): Promise<SecretPermissionRow> {
    const response = await Http.put(
      `/api/vault/secrets/${secretId}/permissions/${managerId}`,
      payload,
    );
    return response.data;
  }

  async revokePermission(
    secretId: string,
    managerId: string,
  ): Promise<{ message: string; managerId: string }> {
    const response = await Http.delete(
      `/api/vault/secrets/${secretId}/permissions/${managerId}`,
    );
    return response.data;
  }

  async listManagers(): Promise<{ data: VaultManagerOption[] }> {
    const response = await Http.get(`/api/vault/managers`);
    return response.data;
  }

  async revealSecret(
    id: string,
  ): Promise<{ value: string; revealedAt: string }> {
    const response = await Http.post(`/api/vault/secrets/${id}/reveal`);
    return response.data;
  }
}

const vaultService = new VaultService();
export default vaultService;
