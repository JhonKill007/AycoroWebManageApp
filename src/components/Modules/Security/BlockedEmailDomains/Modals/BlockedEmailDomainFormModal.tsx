import { CSSProperties, useCallback, useState } from "react";
import { BlockedEmailDomainModel } from "../../../../Models/Security/BlockedEmailDomainModel";
import { isLikelyValidDomain } from "../../../../utils/blockedEmailDomainValidation";

type FormValues = {
  domain: string;
  reason: string;
  includeSubdomains: boolean;
  isActive: boolean;
};

interface Props {
  c: any;
  theme: string;
  initial?: BlockedEmailDomainModel | null;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void>;
}

const BlockedEmailDomainFormModal = ({
  c,
  theme,
  initial,
  onClose,
  onSave,
}: Props) => {
  const isEdit = !!initial;
  const [domain, setDomain] = useState(initial?.domain || "");
  const [reason, setReason] = useState(initial?.reason || "");
  const [includeSubdomains, setIncludeSubdomains] = useState(
    !!initial?.includeSubdomains,
  );
  const [isActive, setIsActive] = useState(
    initial ? !!initial.isActive : true,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    const trimmedDomain = domain.trim().toLowerCase();
    const trimmedReason = reason.trim();
    if (!trimmedDomain) {
      setError("El dominio es obligatorio.");
      return;
    }
    if (!isLikelyValidDomain(trimmedDomain)) {
      setError(
        "Introduce un dominio válido (por ejemplo example.com), sin URL ni correo completo.",
      );
      return;
    }
    if (!trimmedReason) {
      setError("El motivo es obligatorio.");
      return;
    }
    if (trimmedReason.length > 500) {
      setError("El motivo no puede superar 500 caracteres.");
      return;
    }

    if (
      isEdit &&
      !initial?.includeSubdomains &&
      includeSubdomains &&
      !window.confirm(
        "Incluir subdominios ampliará el alcance del bloqueo (por ejemplo mail.example.com). ¿Continuar?",
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        domain: trimmedDomain,
        reason: trimmedReason,
        includeSubdomains,
        isActive,
      });
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la regla.");
    } finally {
      setSaving(false);
    }
  }, [
    domain,
    reason,
    includeSubdomains,
    isActive,
    isEdit,
    initial,
    onSave,
  ]);

  const fieldStyle: CSSProperties = {
    width: "100%",
    borderRadius: 12,
    border: `1.5px solid ${c.border}`,
    background: theme === "dark" ? "#0f172a" : "#fff",
    color: c.text,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none",
  };

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
          maxWidth: 520,
          border: `1.5px solid ${c.border}`,
          padding: 24,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
          {isEdit ? "Editar dominio bloqueado" : "Agregar dominio bloqueado"}
        </div>
        <div style={{ fontSize: 12, color: c.textMuted, marginTop: 6, marginBottom: 18 }}>
          La API normaliza el dominio y aplica el bloqueo en registro y cambio de correo.
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: c.textMuted }}>
          Dominio
        </label>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          style={{ ...fieldStyle, marginTop: 6, marginBottom: 14 }}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />

        <label style={{ fontSize: 12, fontWeight: 600, color: c.textMuted }}>
          Motivo
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Dominio utilizado para registros automatizados"
          rows={3}
          style={{
            ...fieldStyle,
            marginTop: 6,
            marginBottom: 14,
            resize: "vertical",
          }}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            cursor: "pointer",
            color: c.text,
            fontSize: 13,
          }}
        >
          <input
            type="checkbox"
            checked={includeSubdomains}
            onChange={(e) => setIncludeSubdomains(e.target.checked)}
          />
          Incluir subdominios (p. ej. mail.example.com)
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            cursor: "pointer",
            color: c.text,
            fontSize: 13,
          }}
        >
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Regla activa
        </label>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              borderRadius: 12,
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.textMuted,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              borderRadius: 12,
              border: "none",
              background: c.accent,
              color: "#fff",
              padding: "10px 16px",
              fontWeight: 700,
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Agregar dominio"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockedEmailDomainFormModal;
