import { useCallback, useEffect, useMemo, useState } from "react";
import vaultService, {
  SecretItem,
  SecretPermissionRow,
  VaultManagerOption,
} from "../../../../Services/Vault/VaultService";
import { useToast } from "../../../../context/ToastContext";

interface ManageSecretPermissionsModalProps {
  c: any;
  theme: string;
  secret: SecretItem;
  onClose: () => void;
}

const checkboxStyle = (c: any) => ({
  display: "flex" as const,
  alignItems: "center" as const,
  gap: 6,
  fontSize: 12,
  color: c.text,
  cursor: "pointer" as const,
  userSelect: "none" as const,
});

const ManageSecretPermissionsModal = ({
  c,
  theme,
  secret,
  onClose,
}: ManageSecretPermissionsModalProps) => {
  const { showToast } = useToast();
  const [rows, setRows] = useState<SecretPermissionRow[]>([]);
  const [managers, setManagers] = useState<VaultManagerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [addFlags, setAddFlags] = useState({
    canView: true,
    canUpdate: false,
    canDelete: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [perms, mgrs] = await Promise.all([
        vaultService.listPermissions(secret.id),
        vaultService.listManagers(),
      ]);
      setRows(Array.isArray(perms?.data) ? perms.data : []);
      setManagers(Array.isArray(mgrs?.data) ? mgrs.data : []);
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los permisos",
        duration: 4000,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [secret.id, showToast, onClose]);

  useEffect(() => {
    load();
  }, [load]);

  const assignedIds = useMemo(
    () => new Set(rows.map((r) => r.managerId)),
    [rows],
  );

  const availableManagers = useMemo(
    () => managers.filter((m) => !assignedIds.has(m.id)),
    [managers, assignedIds],
  );

  const saveFlags = useCallback(
    async (
      managerId: string,
      flags: { canView: boolean; canUpdate: boolean; canDelete: boolean },
    ) => {
      setBusyId(managerId);
      try {
        const updated = await vaultService.upsertPermission(
          secret.id,
          managerId,
          flags,
        );
        setRows((prev) => {
          const exists = prev.some((r) => r.managerId === managerId);
          if (exists) {
            return prev.map((r) =>
              r.managerId === managerId ? { ...r, ...updated } : r,
            );
          }
          return [...prev, updated];
        });
        showToast({
          type: "success",
          title: "Permisos actualizados",
          description: "Los cambios se guardaron",
          duration: 2500,
        });
      } catch {
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el permiso",
          duration: 4000,
        });
        await load();
      } finally {
        setBusyId(null);
      }
    },
    [secret.id, showToast, load],
  );

  const toggleFlag = useCallback(
    async (
      row: SecretPermissionRow,
      key: "canView" | "canUpdate" | "canDelete",
    ) => {
      if (row.isCreator || busyId) return;
      const next = {
        canView: row.canView,
        canUpdate: row.canUpdate,
        canDelete: row.canDelete,
        [key]: !row[key],
      };
      // Client-side mirror of backend normalize: update/delete imply view.
      if (next.canUpdate || next.canDelete) next.canView = true;
      if (!next.canView && !next.canUpdate && !next.canDelete) {
        showToast({
          type: "warning",
          title: "Sin permisos",
          description: "Usa «Quitar acceso» para revocar por completo",
          duration: 3500,
        });
        return;
      }
      await saveFlags(row.managerId, next);
    },
    [busyId, saveFlags, showToast],
  );

  const handleRevoke = useCallback(
    async (managerId: string) => {
      if (busyId) return;
      setBusyId(managerId);
      try {
        await vaultService.revokePermission(secret.id, managerId);
        setRows((prev) => prev.filter((r) => r.managerId !== managerId));
        showToast({
          type: "success",
          title: "Acceso eliminado",
          description: "El manager ya no verá este secreto",
          duration: 3000,
        });
      } catch {
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo quitar el acceso",
          duration: 4000,
        });
      } finally {
        setBusyId(null);
      }
    },
    [busyId, secret.id, showToast],
  );

  const handleAdd = useCallback(async () => {
    if (!selectedManagerId || busyId) return;
    let flags = { ...addFlags };
    if (flags.canUpdate || flags.canDelete) flags.canView = true;
    if (!flags.canView) flags.canView = true;
    await saveFlags(selectedManagerId, flags);
    setShowAdd(false);
    setSelectedManagerId("");
    setAddFlags({ canView: true, canUpdate: false, canDelete: false });
  }, [selectedManagerId, busyId, addFlags, saveFlags]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          borderRadius: 20,
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
          border: `1.5px solid ${c.border}`,
          padding: 24,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
          {secret.name}
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 16 }}>
          Administrar acceso
        </div>

        {loading ? (
          <div style={{ color: c.textMuted, fontSize: 13, padding: "12px 0" }}>
            Cargando…
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((row) => (
              <div
                key={row.managerId}
                style={{
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  opacity: busyId === row.managerId ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: c.text }}
                    >
                      {row.managerName || row.managerEmail || row.managerId}
                      {row.isCreator && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 600,
                            color: c.accent,
                          }}
                        >
                          Creador
                        </span>
                      )}
                    </div>
                    {row.managerEmail && (
                      <div style={{ fontSize: 11, color: c.textMuted }}>
                        {row.managerEmail}
                      </div>
                    )}
                  </div>
                  {!row.isCreator && (
                    <button
                      type="button"
                      disabled={busyId === row.managerId}
                      onClick={() => handleRevoke(row.managerId)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 8,
                        border: "1.5px solid #fecaca",
                        background: theme === "dark" ? "#2a1515" : "#fef2f2",
                        color: "#dc2626",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Quitar acceso
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                  <label style={checkboxStyle(c)}>
                    <input
                      type="checkbox"
                      checked={row.canView}
                      disabled={row.isCreator || busyId === row.managerId}
                      onChange={() => toggleFlag(row, "canView")}
                    />
                    Ver
                  </label>
                  <label style={checkboxStyle(c)}>
                    <input
                      type="checkbox"
                      checked={row.canUpdate}
                      disabled={row.isCreator || busyId === row.managerId}
                      onChange={() => toggleFlag(row, "canUpdate")}
                    />
                    Editar
                  </label>
                  <label style={checkboxStyle(c)}>
                    <input
                      type="checkbox"
                      checked={row.canDelete}
                      disabled={row.isCreator || busyId === row.managerId}
                      onChange={() => toggleFlag(row, "canDelete")}
                    />
                    Eliminar
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 16 }}>
            {!showAdd ? (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                disabled={availableManagers.length === 0}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: `1.5px dashed ${c.border}`,
                  background: "transparent",
                  color: c.text,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor:
                    availableManagers.length === 0 ? "not-allowed" : "pointer",
                  opacity: availableManagers.length === 0 ? 0.5 : 1,
                }}
              >
                + Agregar manager
              </button>
            ) : (
              <div
                style={{
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: c.textMuted,
                    marginBottom: 6,
                  }}
                >
                  Manager
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${c.border}`,
                    background: c.bg || c.card,
                    color: c.text,
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  <option value="">Seleccionar…</option>
                  {availableManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email} {m.email ? `(${m.email})` : ""}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 14,
                    marginBottom: 12,
                  }}
                >
                  <label style={checkboxStyle(c)}>
                    <input
                      type="checkbox"
                      checked={addFlags.canView}
                      onChange={(e) =>
                        setAddFlags((f) => ({
                          ...f,
                          canView: e.target.checked,
                        }))
                      }
                    />
                    Ver
                  </label>
                  <label style={checkboxStyle(c)}>
                    <input
                      type="checkbox"
                      checked={addFlags.canUpdate}
                      onChange={(e) =>
                        setAddFlags((f) => ({
                          ...f,
                          canUpdate: e.target.checked,
                          canView: e.target.checked ? true : f.canView,
                        }))
                      }
                    />
                    Editar
                  </label>
                  <label style={checkboxStyle(c)}>
                    <input
                      type="checkbox"
                      checked={addFlags.canDelete}
                      onChange={(e) =>
                        setAddFlags((f) => ({
                          ...f,
                          canDelete: e.target.checked,
                          canView: e.target.checked ? true : f.canView,
                        }))
                      }
                    />
                    Eliminar
                  </label>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdd(false);
                      setSelectedManagerId("");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1.5px solid ${c.border}`,
                      background: "transparent",
                      color: c.text,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!selectedManagerId || !!busyId}
                    onClick={handleAdd}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: c.accent,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: selectedManagerId ? "pointer" : "not-allowed",
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.text,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSecretPermissionsModal;
