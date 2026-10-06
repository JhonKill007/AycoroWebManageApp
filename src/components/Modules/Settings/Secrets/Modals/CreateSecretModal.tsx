import { useCallback, useState } from "react";
import { Colors } from "../../../../constants/Colors";

interface CreateSecretModalProps {
  c: any;
  theme: string;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    description: string;
    value: string;
  }) => Promise<void>;
}

const CreateSecretModal = ({
  c,
  theme,
  onClose,
  onSave,
}: CreateSecretModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName || !trimmedDescription || !value) {
      setError("Nombre, descripción y valor son obligatorios.");
      return;
    }
    if (trimmedName.length > 100) {
      setError("El nombre no puede superar 100 caracteres.");
      return;
    }
    if (trimmedDescription.length > 500) {
      setError("La descripción no puede superar 500 caracteres.");
      return;
    }
    if (value.length > 10000) {
      setError("El valor no puede superar 10000 caracteres.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        name: trimmedName,
        description: trimmedDescription,
        value,
      });
    } catch {
      setError("No se pudo crear el secreto.");
    } finally {
      setSaving(false);
    }
  }, [name, description, value, onSave]);

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
          maxWidth: 480,
          border: `1.5px solid ${c.border}`,
          padding: 24,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: c.text,
            marginBottom: 8,
          }}
        >
          Nuevo secreto
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#b45309",
            background: theme === "dark" ? "#3b2a12" : "#fef3c7",
            border: "1px solid #f59e0b55",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 16,
            lineHeight: 1.45,
          }}
        >
          El valor se cifra con AES-256-GCM usando la Vault Encryption Key. Solo
          managers con permiso de ver podrán revelarlo; la acción queda auditada.
        </div>

        <label style={{ display: "block", fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
          Nombre
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${c.border}`,
            background: c.bg || c.card,
            color: c.text,
            marginBottom: 12,
            fontSize: 13,
          }}
        />

        <label style={{ display: "block", fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${c.border}`,
            background: c.bg || c.card,
            color: c.text,
            marginBottom: 12,
            fontSize: 13,
            resize: "vertical",
          }}
        />

        <label style={{ display: "block", fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
          Valor
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={10000}
          rows={3}
          autoComplete="off"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${c.border}`,
            background: c.bg || c.card,
            color: c.text,
            marginBottom: 12,
            fontSize: 13,
            fontFamily: "monospace",
            resize: "vertical",
          }}
        />

        {error && (
          <div style={{ color: Colors.detailAppColor || "#dc2626", fontSize: 12, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
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
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "none",
              background: c.accent,
              color: "#fff",
              cursor: saving ? "wait" : "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {saving ? "Guardando…" : "Crear secreto"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSecretModal;
