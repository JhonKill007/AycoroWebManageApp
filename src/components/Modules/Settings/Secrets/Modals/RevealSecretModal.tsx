import { useCallback, useEffect, useRef, useState } from "react";
import vaultService, {
  SecretItem,
} from "../../../../Services/Vault/VaultService";
import { useToast } from "../../../../context/ToastContext";
import ActionAlert from "../../../Common/Modal/ActionAlert";

const AUTO_HIDE_MS = 30_000;

interface RevealSecretModalProps {
  c: any;
  theme: string;
  secret: SecretItem;
  onClose: () => void;
}

const RevealSecretModal = ({
  c,
  theme,
  secret,
  onClose,
}: RevealSecretModalProps) => {
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearValue = useCallback(() => {
    setValue(null);
    setVisible(false);
    setCopied(false);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearValue();
    onClose();
  }, [clearValue, onClose]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const scheduleAutoHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      clearValue();
      setConfirmOpen(true);
    }, AUTO_HIDE_MS);
  }, [clearValue]);

  const doReveal = useCallback(async () => {
    setLoading(true);
    try {
      const result = await vaultService.revealSecret(secret.id);
      setValue(result.value);
      setVisible(true);
      setConfirmOpen(false);
      scheduleAutoHide();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "No se pudo revelar el secreto";
      showToast({
        type: "error",
        title: "Error",
        description: message,
        duration: 5000,
      });
      handleClose();
    } finally {
      setLoading(false);
    }
  }, [secret.id, scheduleAutoHide, showToast, handleClose]);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        duration: 3000,
      });
    }
  }, [value, showToast]);

  return (
    <>
      <ActionAlert
        visible={confirmOpen && value === null}
        title="Revelar secreto"
        description='Vas a revelar un valor sensible. Esta acción quedará registrada en auditoría.'
        actionText="Revelar"
        cancelText="Cancelar"
        actionColor={c.accent}
        onAction={doReveal}
        onCancel={handleClose}
        theme={theme}
        c={c}
        isLoading={loading}
      />

      {value !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            padding: 20,
          }}
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: c.card,
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
              border: `1.5px solid ${c.border}`,
              padding: 24,
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
              {secret.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: c.textMuted,
                marginTop: 4,
                marginBottom: 14,
              }}
            >
              Valor revelado — se ocultará automáticamente en 30 segundos
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: `1.5px solid ${c.border}`,
                background: theme === "dark" ? "#0f0f1a" : "#f8f8ff",
                fontFamily: "monospace",
                fontSize: 13,
                color: c.text,
                wordBreak: "break-all",
                minHeight: 44,
              }}
            >
              {visible ? value : "••••••••••••••••••••••••"}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 14,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
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
                {visible ? "Ocultar" : "Mostrar"}
              </button>
              <button
                type="button"
                onClick={handleCopy}
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
                {copied ? "Copiado" : "Copiar"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: c.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RevealSecretModal;
