import { useCallback, useEffect, useState } from "react";
import ActionAlert from "../../../Common/Modal/ActionAlert";
import { useToast } from "../../../../context/ToastContext";
import { usePermissions } from "../../../../hooks/usePermissions";
import systemConfigurationService, {
  VaultEncryptionKeyStatus,
} from "../../../../Services/SystemConfiguration/SystemConfigurationService";

const SystemConfigurationTab = ({ c, theme }: { c: any; theme: string }) => {
  const { isSuperAdmin } = usePermissions();
  const { showToast } = useToast();
  const [status, setStatus] = useState<VaultEncryptionKeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!isSuperAdmin) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data =
        await systemConfigurationService.getVaultEncryptionKeyStatus();
      setStatus(data);
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo cargar la configuración de seguridad",
        duration: 4000,
      });
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      showToast({
        type: "warning",
        title: "Clave requerida",
        description: "Introduce una nueva encryption key (base64 de 32 bytes)",
        duration: 4000,
      });
      return;
    }
    setSaving(true);
    try {
      const data = await systemConfigurationService.putVaultEncryptionKey(
        trimmed,
      );
      setStatus(data);
      setValue("");
      setConfirmOpen(false);
      showToast({
        type: "success",
        title: status?.configured ? "Clave actualizada" : "Clave configurada",
        description: "La Vault Encryption Key se guardó correctamente",
        duration: 3500,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        description:
          err?.response?.data?.message ||
          "No se pudo guardar la encryption key",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }, [value, showToast, status?.configured]);

  const handlePrimary = () => {
    if (!value.trim()) {
      showToast({
        type: "warning",
        title: "Clave requerida",
        description: "Introduce una nueva encryption key",
        duration: 3500,
      });
      return;
    }
    if (status?.configured) {
      setConfirmOpen(true);
      return;
    }
    void submit();
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ color: c.textMuted, fontSize: 13 }}>
        No hay configuraciones disponibles para tu rol.
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
        Configuración del sistema
      </div>
      <div
        style={{
          fontSize: 13,
          color: c.textMuted,
          marginTop: 6,
          marginBottom: 22,
          lineHeight: 1.5,
          maxWidth: 640,
        }}
      >
        Parámetros internos que controlan el comportamiento y la seguridad de
        Aycoro. Algunas opciones pueden afectar servicios críticos y deben
        modificarse con cuidado.
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: c.accent,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
        }}
      >
        Seguridad
      </div>

      <div
        style={{
          border: `1.5px solid ${c.border}`,
          borderRadius: 16,
          padding: 20,
          background: theme === "dark" ? "#12121f" : "#fafaff",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>
          Vault Encryption Key
        </div>
        <div
          style={{
            fontSize: 13,
            color: c.textMuted,
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          Clave maestra utilizada para proteger los valores almacenados en el
          Vault. La aplicación utiliza esta clave para cifrar y descifrar
          información sensible. Por seguridad, el valor actual nunca vuelve a
          mostrarse una vez guardado.
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#b45309",
            background: theme === "dark" ? "#3b2a12" : "#fef3c7",
            border: "1px solid #f59e0b55",
            borderRadius: 10,
            padding: "10px 12px",
            lineHeight: 1.45,
          }}
        >
          Reemplazar esta clave sin rotar previamente los secretos existentes
          puede impedir recuperar sus valores. Este almacenamiento en Manage DB
          es operativo y no sustituye a un KMS.
        </div>

        {loading ? (
          <div style={{ marginTop: 16, color: c.textMuted, fontSize: 13 }}>
            Cargando…
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 16,
                fontSize: 12,
                color: c.textMuted,
              }}
            >
              <div>
                Estado:{" "}
                <strong style={{ color: c.text }}>
                  {status?.configured ? "Configurada" : "No configurada"}
                </strong>
              </div>
              {status?.configured && status.updatedAt && (
                <div>
                  Última actualización:{" "}
                  <strong style={{ color: c.text }}>
                    {new Date(status.updatedAt).toLocaleString("es-DO")}
                  </strong>
                </div>
              )}
              {status?.configured && status.updatedBy && (
                <div>
                  Actualizado por:{" "}
                  <strong style={{ color: c.text }}>
                    {status.updatedBy.name ||
                      status.updatedBy.email ||
                      status.updatedBy.id}
                  </strong>
                </div>
              )}
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12,
                color: c.textMuted,
                marginTop: 18,
                marginBottom: 6,
              }}
            >
              {status?.configured
                ? "Nueva encryption key"
                : "Encryption Key"}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                status?.configured
                  ? "••••••••••••••••••••••••••••"
                  : "Base64 de 32 bytes aleatorios"
              }
              style={{
                width: "100%",
                maxWidth: 480,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1.5px solid ${c.border}`,
                background: c.card,
                color: c.text,
                fontSize: 13,
                fontFamily: "monospace",
              }}
            />
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                disabled={saving}
                onClick={handlePrimary}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: c.accent,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving
                  ? "Guardando…"
                  : status?.configured
                    ? "Actualizar clave"
                    : "Agregar clave"}
              </button>
            </div>
          </>
        )}
      </div>

      <ActionAlert
        visible={confirmOpen}
        title="Rotar Vault Encryption Key"
        description="Esta acción reemplazará la clave maestra del Vault. Si existen secretos cifrados con la clave actual, cambiarla sin realizar una rotación puede hacer que esos secretos no puedan ser descifrados. ¿Deseas continuar?"
        actionText="Sí, reemplazar clave"
        actionColor="#dc2626"
        onAction={submit}
        onCancel={() => setConfirmOpen(false)}
        theme={theme}
        c={c}
        isLoading={saving}
      />
    </div>
  );
};

export default SystemConfigurationTab;
