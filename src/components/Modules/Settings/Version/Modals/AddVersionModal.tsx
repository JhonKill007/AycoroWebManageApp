// Modals/AddVersionModal.tsx
import { useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { useUserContext } from "../../../../context/UserContext";
import { VersionParams } from "../../../../Models/Version/VersionParams";

// ─── Configuraciones ───────────────────────────────────────────────────
const SEVERITY_OPTIONS = [
  {
    value: "High",
    label: "Alta",
    icon: "🔴",
    color: "#dc2626",
    bg: "#fee2e2",
  },
  {
    value: "Medium",
    label: "Media",
    icon: "🟠",
    color: "#ea580c",
    bg: "#fed7aa",
  },
  {
    value: "Low",
    label: "Baja",
    icon: "🔵",
    color: "#2563eb",
    bg: "#dbeafe",
  },
];

const TYPE_OPTIONS = [
  {
    value: "ios",
    label: "iOS",
    icon: "🍎",
    color: "#8b5cf6",
    bg: "#ede9fe",
  },
  {
    value: "android",
    label: "Android",
    icon: "🤖",
    color: "#10b981",
    bg: "#d1fae5",
  },
];

const STATUS_OPTIONS = [
  { value: 0, label: "Pendiente", icon: "🕒", color: "#6b7280", bg: "#f3f4f6" },
  { value: 1, label: "Publicada", icon: "✅", color: "#10b981", bg: "#d1fae5" },
];

interface AddVersionModalProps {
  c: any;
  theme: string;
  onSave: (data: VersionParams) => Promise<void>;
  onClose: () => void;
}

const AddVersionModal = ({
  c,
  theme,
  onSave,
  onClose,
}: AddVersionModalProps) => {
  const { userData } = useUserContext();
  const [formData, setFormData] = useState({
    Value: "",
    Description: "",
    Type: "ios",
    Severity: "medium",
    Status: 0,
    Link: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.Value.trim()) {
      newErrors.Value = "La versión es requerida";
    } else if (
      !/^v?\d+\.\d+\.\d+$/.test(formData.Value.trim()) &&
      !/^\d+\.\d+\.\d+$/.test(formData.Value.trim())
    ) {
      newErrors.Value = "Formato inválido. Usa: 1.0.0 o v1.0.0";
    }

    if (!formData.Description.trim()) {
      newErrors.Description = "La descripción es requerida";
    } else if (formData.Description.length < 10) {
      newErrors.Description =
        "La descripción debe tener al menos 10 caracteres";
    }

    if (
      formData.Link &&
      !formData.Link.match(
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      )
    ) {
      newErrors.Link = "Ingresa una URL válida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let link = formData.Link;

      if (!formData.Link.trim()) {
        if (formData.Type === "ios") {
          link = "https://apps.apple.com/us/app/aycoro/id6759249907";
        } else if (formData.Type === "android") {
          link =
            "https://play.google.com/store/apps/details?id=com.jhondavidrd.Aycoro";
        }
      }
      await onSave({
        _id: undefined,
        Value: `${formData.Value}v`,
        Description: formData.Description,
        Severity: formData.Severity,
        Link: link,
        Type: formData.Type,
        Status: formData.Status,
        CreateBy: userData?.user?.id,
      });
      onClose();
    } catch (error) {
      console.error("Error creating version:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          borderRadius: 24,
          width: "100%",
          maxWidth: 580,
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 28px 90px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header - Fijo */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1.5px solid ${c.border}`,
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#1a1a30,#0f0f22)"
                : "linear-gradient(135deg,#f8f9ff,#ffffff)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 800,
                  color: c.text,
                }}
              >
                ✨ Nueva versión
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: c.textMuted,
                }}
              >
                Registra una nueva versión del sistema
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1.5px solid ${c.border}`,
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
                color: c.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = c.accentSoft;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulario - Scrollable */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "0 24px",
          }}
        >
          <form onSubmit={handleSubmit} id="version-form">
            {/* Versión */}
            <div style={{ marginBottom: 20, marginTop: 8 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 8,
                }}
              >
                Versión <span style={{ color: c.danger }}>*</span>
              </label>
              <input
                type="text"
                value={formData.Value}
                onChange={(e) => updateField("Value", e.target.value)}
                placeholder="Ej: 2.0.0"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${errors.Value ? c.danger : c.border}`,
                  background: c.inputBackground,
                  color: c.text,
                  fontSize: 14,
                  fontFamily: "monospace",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = Colors.detailAppColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${Colors.detailAppColor}20`;
                }}
                onBlur={(e) => {
                  if (!errors.Value) {
                    e.currentTarget.style.borderColor = c.border;
                  }
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {errors.Value && (
                <div
                  style={{ fontSize: "11px", color: c.danger, marginTop: 6 }}
                >
                  {errors.Value}
                </div>
              )}
              <div
                style={{ fontSize: "10px", color: c.textMuted, marginTop: 4 }}
              >
                Formato: versión mayor.menor.parche (ej: 2.0.0)
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 8,
                }}
              >
                Descripción <span style={{ color: c.danger }}>*</span>
              </label>
              <textarea
                value={formData.Description}
                onChange={(e) => updateField("Description", e.target.value)}
                placeholder="Describe los cambios, mejoras o correcciones de esta versión..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${errors.Description ? c.danger : c.border}`,
                  background: c.inputBackground,
                  color: c.text,
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  resize: "vertical",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = Colors.detailAppColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${Colors.detailAppColor}20`;
                }}
                onBlur={(e) => {
                  if (!errors.Description) {
                    e.currentTarget.style.borderColor = c.border;
                  }
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {errors.Description && (
                <div
                  style={{ fontSize: "11px", color: c.danger, marginTop: 6 }}
                >
                  {errors.Description}
                </div>
              )}
            </div>

            {/* Severidad y Estado (2 columnas) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Severidad */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: c.text,
                    marginBottom: 8,
                  }}
                >
                  Severidad
                </label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {SEVERITY_OPTIONS.map((severity) => (
                    <label
                      key={severity.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${formData.Severity === severity.value ? severity.color : c.border}`,
                        background:
                          formData.Severity === severity.value
                            ? `${severity.color}10`
                            : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={severity.value}
                        checked={formData.Severity === severity.value}
                        onChange={() => updateField("Severity", severity.value)}
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 16 }}>{severity.icon}</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: c.text,
                          flex: 1,
                        }}
                      >
                        {severity.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: c.text,
                    marginBottom: 8,
                  }}
                >
                  Estado
                </label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <label
                      key={status.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${formData.Status === status.value ? status.color : c.border}`,
                        background:
                          formData.Status === status.value
                            ? `${status.color}10`
                            : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={formData.Status === status.value}
                        onChange={() => updateField("Status", status.value)}
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 16 }}>{status.icon}</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: c.text,
                          flex: 1,
                        }}
                      >
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Tipo */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 8,
                }}
              >
                Plataforma
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {TYPE_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField("Type", type.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "12px",
                      borderRadius: 10,
                      border: `2px solid ${formData.Type === type.value ? type.color : c.border}`,
                      background:
                        formData.Type === type.value
                          ? `${type.color}15`
                          : "transparent",
                      color:
                        formData.Type === type.value ? type.color : c.textMuted,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Link de tienda */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 8,
                }}
              >
                Link de tienda
              </label>
              <input
                type="text"
                value={formData.Link}
                onChange={(e) => updateField("Link", e.target.value)}
                placeholder="https://apps.apple.com/..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${errors.Link ? c.danger : c.border}`,
                  background: c.inputBackground,
                  color: c.text,
                  fontSize: 13,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = Colors.detailAppColor;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${Colors.detailAppColor}20`;
                }}
                onBlur={(e) => {
                  if (!errors.Link) {
                    e.currentTarget.style.borderColor = c.border;
                  }
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {errors.Link && (
                <div
                  style={{ fontSize: "11px", color: c.danger, marginTop: 6 }}
                >
                  {errors.Link}
                </div>
              )}
              <div
                style={{ fontSize: "10px", color: c.textMuted, marginTop: 4 }}
              >
                El link se genera automáticamente según la plataforma
                seleccionada
              </div>
            </div>

            {/* Preview - Dentro del scroll */}
            <div
              style={{
                background: c.accentSoft + "33",
                borderRadius: 12,
                padding: "16px",
                marginBottom: 8,
                border: `1px solid ${c.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: c.textMuted,
                  marginBottom: 12,
                  textTransform: "uppercase",
                }}
              >
                Vista previa
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: c.text,
                    fontFamily: "monospace",
                  }}
                >
                  {formData.Value || "0.0.0"}
                </span>
                {formData.Type && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: TYPE_OPTIONS.find(
                        (t) => t.value === formData.Type,
                      )?.bg,
                      color: TYPE_OPTIONS.find((t) => t.value === formData.Type)
                        ?.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {TYPE_OPTIONS.find((t) => t.value === formData.Type)?.icon}
                    {TYPE_OPTIONS.find((t) => t.value === formData.Type)?.label}
                  </span>
                )}
                {formData.Severity && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: SEVERITY_OPTIONS.find(
                        (s) => s.value === formData.Severity,
                      )?.bg,
                      color: SEVERITY_OPTIONS.find(
                        (s) => s.value === formData.Severity,
                      )?.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {
                      SEVERITY_OPTIONS.find(
                        (s) => s.value === formData.Severity,
                      )?.icon
                    }
                    {
                      SEVERITY_OPTIONS.find(
                        (s) => s.value === formData.Severity,
                      )?.label
                    }
                  </span>
                )}
                {formData.Status !== undefined && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: STATUS_OPTIONS.find(
                        (s) => s.value === formData.Status,
                      )?.bg,
                      color: STATUS_OPTIONS.find(
                        (s) => s.value === formData.Status,
                      )?.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {
                      STATUS_OPTIONS.find((s) => s.value === formData.Status)
                        ?.icon
                    }
                    {
                      STATUS_OPTIONS.find((s) => s.value === formData.Status)
                        ?.label
                    }
                  </span>
                )}
              </div>
              {formData.Description && (
                <div
                  style={{
                    fontSize: 12,
                    color: c.textMuted,
                    marginTop: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {formData.Description.length > 100
                    ? formData.Description.substring(0, 100) + "..."
                    : formData.Description}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fijo */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: `1.5px solid ${c.border}`,
            background: c.card,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 24px",
                borderRadius: 12,
                border: `1.5px solid ${c.border}`,
                background: "transparent",
                color: c.textMuted,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = c.accentSoft;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="version-form"
              disabled={isSubmitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 28px",
                borderRadius: 12,
                background: Colors.detailAppColor,
                color: "#fff",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                transition: "all 0.15s",
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: `2px solid #fff`,
                      borderTop: `2px solid transparent`,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Creando...
                </>
              ) : (
                <>✨ Crear versión</>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AddVersionModal;
