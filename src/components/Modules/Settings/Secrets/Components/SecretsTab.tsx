import { useCallback, useEffect, useState } from "react";
import { Permissions } from "../../../../constants/Permissions";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useToast } from "../../../../context/ToastContext";
import vaultService, {
  SecretItem,
} from "../../../../Services/Vault/VaultService";
import ActionAlert from "../../../Common/Modal/ActionAlert";
import { formatDate } from "../../Common/Utils";
import CreateSecretModal from "../Modals/CreateSecretModal";
import EditSecretModal from "../Modals/EditSecretModal";
import ManageSecretPermissionsModal from "../Modals/ManageSecretPermissionsModal";
import RevealSecretModal from "../Modals/RevealSecretModal";

const creatorLabel = (secret: SecretItem) => {
  const createdBy = secret.createdBy;
  if (!createdBy) return "Manager eliminado";
  if (typeof createdBy === "string") return createdBy;
  return createdBy.name || createdBy.email || "Manager eliminado";
};

const PermBadge = ({
  label,
  active,
  c,
  theme,
}: {
  label: string;
  active: boolean;
  c: any;
  theme: string;
}) => (
  <span
    style={{
      fontSize: 10,
      fontWeight: 700,
      padding: "3px 8px",
      borderRadius: 999,
      border: `1px solid ${active ? `${c.accent}55` : c.border}`,
      background: active
        ? theme === "dark"
          ? "#1a1a30"
          : c.accentSoft || "#ededff"
        : "transparent",
      color: active ? c.accent : c.textMuted,
      opacity: active ? 1 : 0.55,
    }}
  >
    {label}
  </span>
);

export const SecretsTab = ({ c, theme }: { c: any; theme: string }) => {
  const { can } = usePermissions();
  const { showToast } = useToast();
  const canAccess = can(Permissions.VAULT_ACCESS);
  const canCreate =
    canAccess && can(Permissions.VAULT_CREATE_SECRET);

  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<SecretItem | null>(null);
  const [managingAccess, setManagingAccess] = useState<SecretItem | null>(null);
  const [revealing, setRevealing] = useState<SecretItem | null>(null);
  const [deleteAlert, setDeleteAlert] = useState<{
    visible: boolean;
    secret: SecretItem | null;
  }>({ visible: false, secret: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSecrets = useCallback(async () => {
    if (!canAccess) {
      setSecrets([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await vaultService.listSecrets();
      setSecrets(Array.isArray(response?.data) ? response.data : []);
    } catch {
      setSecrets([]);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los secretos",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [canAccess, showToast]);

  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  const handleCreate = useCallback(
    async (payload: { name: string; description: string; value: string }) => {
      await vaultService.createSecret(payload);
      setShowCreate(false);
      showToast({
        type: "success",
        title: "Secreto creado",
        description: "El secreto se creó correctamente",
        duration: 3000,
      });
      await loadSecrets();
    },
    [loadSecrets, showToast],
  );

  const handleUpdate = useCallback(
    async (payload: {
      name: string;
      description: string;
      value?: string;
    }) => {
      if (!editing) return;
      await vaultService.updateSecret(editing.id, payload);
      setEditing(null);
      showToast({
        type: "success",
        title: "Secreto actualizado",
        description: "Los cambios se guardaron correctamente",
        duration: 3000,
      });
      await loadSecrets();
    },
    [editing, loadSecrets, showToast],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteAlert.secret) return;
    setIsDeleting(true);
    try {
      await vaultService.deleteSecret(deleteAlert.secret.id);
      setDeleteAlert({ visible: false, secret: null });
      showToast({
        type: "success",
        title: "Secreto eliminado",
        description: "El secreto y sus permisos fueron eliminados",
        duration: 3000,
      });
      await loadSecrets();
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo eliminar el secreto",
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAlert.secret, loadSecrets, showToast]);

  const emptyMessage = canCreate
    ? "No tienes secretos asignados. Puedes crear uno nuevo o solicitar acceso a uno existente."
    : "No tienes secretos asignados.";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
            Secretos
          </div>
          <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
            Gestiona secretos a los que tienes acceso. El valor nunca se muestra
            en el listado.
          </div>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: "none",
              background: c.accent,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Nuevo secreto
          </button>
        )}
      </div>

      <div
        style={{
          border: `1.5px solid ${c.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.4fr 110px 1fr minmax(200px, 1.1fr)",
            gap: 12,
            padding: "12px 16px",
            background: theme === "dark" ? "#12121f" : "#f8f8ff",
            borderBottom: `1px solid ${c.border}`,
            fontSize: 11,
            fontWeight: 700,
            color: c.textMuted,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          <div>Nombre</div>
          <div>Descripción</div>
          <div>Actualizado</div>
          <div>Creador / permisos</div>
          <div>Acciones</div>
        </div>

        {isLoading && (
          <div style={{ padding: 24, color: c.textMuted, fontSize: 13 }}>
            Cargando secretos…
          </div>
        )}

        {!isLoading && secrets.length === 0 && (
          <div style={{ padding: 24, color: c.textMuted, fontSize: 13 }}>
            {emptyMessage}
          </div>
        )}

        {!isLoading &&
          secrets.map((secret) => (
            <div
              key={secret.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1.4fr 110px 1fr minmax(200px, 1.1fr)",
                gap: 12,
                padding: "14px 16px",
                borderBottom: `1px solid ${c.border}`,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                  {secret.name}
                </div>
                {secret.legacy && (
                  <div
                    style={{
                      marginTop: 6,
                      display: "inline-block",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#b45309",
                      background: theme === "dark" ? "#3b2a12" : "#fef3c7",
                      borderRadius: 999,
                      padding: "3px 8px",
                    }}
                  >
                    Legacy — recrear secreto
                  </div>
                )}
              </div>
              <div
                style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.4 }}
              >
                {secret.description}
                {secret.legacy && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#b45309" }}>
                    Este secreto fue creado antes del cifrado actual y debe
                    recrearse.
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: c.textMuted }}>
                {formatDate(secret.updatedAt)}
              </div>
              <div>
                <div style={{ fontSize: 12, color: c.text, fontWeight: 600 }}>
                  {creatorLabel(secret)}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  <PermBadge
                    label="Puede ver"
                    active={Boolean(secret.permissions?.canView)}
                    c={c}
                    theme={theme}
                  />
                  <PermBadge
                    label="Puede editar"
                    active={Boolean(secret.permissions?.canUpdate)}
                    c={c}
                    theme={theme}
                  />
                  <PermBadge
                    label="Puede eliminar"
                    active={Boolean(secret.permissions?.canDelete)}
                    c={c}
                    theme={theme}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {secret.permissions?.canView && !secret.legacy && (
                  <button
                    type="button"
                    onClick={() => setRevealing(secret)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1.5px solid ${c.border}`,
                      background: theme === "dark" ? "#151528" : "#f5f5ff",
                      color: c.text,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Ver secreto
                  </button>
                )}
                {secret.isCreator && (
                  <button
                    type="button"
                    onClick={() => setManagingAccess(secret)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1.5px solid ${c.accent}55`,
                      background: c.accentSoft || "transparent",
                      color: c.accent,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Administrar acceso
                  </button>
                )}
                {secret.permissions?.canUpdate && (
                  <button
                    type="button"
                    onClick={() => setEditing(secret)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1.5px solid ${c.border}`,
                      background: "transparent",
                      color: c.text,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                )}
                {secret.permissions?.canDelete && (
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteAlert({ visible: true, secret })
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1.5px solid #fecaca",
                      background: theme === "dark" ? "#2a1515" : "#fef2f2",
                      color: "#dc2626",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {showCreate && (
        <CreateSecretModal
          c={c}
          theme={theme}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}

      {editing && (
        <EditSecretModal
          c={c}
          theme={theme}
          secret={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}

      {managingAccess && (
        <ManageSecretPermissionsModal
          c={c}
          theme={theme}
          secret={managingAccess}
          onClose={() => setManagingAccess(null)}
        />
      )}

      {revealing && (
        <RevealSecretModal
          c={c}
          theme={theme}
          secret={revealing}
          onClose={() => setRevealing(null)}
        />
      )}

      <ActionAlert
        visible={deleteAlert.visible}
        title="Eliminar secreto"
        description={
          deleteAlert.secret
            ? `¿Eliminar '${deleteAlert.secret.name}'?`
            : "¿Eliminar este secreto?"
        }
        actionText="Eliminar"
        actionColor="#dc2626"
        onAction={handleDelete}
        onCancel={() => setDeleteAlert({ visible: false, secret: null })}
        theme={theme}
        c={c}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SecretsTab;
