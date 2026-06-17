import { useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import { ServiceModel } from "../../Models/Service/ServiceModel";

// Tipos de servicio disponibles
const SERVICE_TYPES = {
  PROFESIONAL: "professional",
  NEGOCIO: "business",
  SERVICIO: "service",
  OTRO: "otro",
};

// Documentación requerida por tipo de servicio
const REQUIRED_DOCS = {
  [SERVICE_TYPES.PROFESIONAL]: [
    "Título profesional (escaneado)",
    "Cédula profesional o licencia para ejercer",
    "Certificado de especialidad (si aplica)",
    "Identificación oficial (INE/Pasaporte)",
    "Comprobante de domicilio",
  ],
  [SERVICE_TYPES.NEGOCIO]: [
    "Acta constitutiva de la empresa",
    "RFC y comprobante de situación fiscal",
    "Licencia comercial o permiso de operación",
    "Comprobante de domicilio del negocio",
    "Identificación oficial del representante legal",
    "Contrato de arrendamiento o propiedad del local",
  ],
  [SERVICE_TYPES.SERVICIO]: [
    "Certificado de estudios técnicos",
    "Licencia o permiso para ejercer (si aplica)",
    "Certificaciones especializadas",
    "Identificación oficial",
    "Comprobante de experiencia laboral",
  ],
  [SERVICE_TYPES.OTRO]: [
    "Identificación oficial",
    "Comprobante de domicilio",
    "Cualquier documento que acredite la propiedad del servicio",
  ],
};

export const ModalServiceClaim = ({
  isOpen,
  onClose,
  service,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceModel;
}) => {
  const { theme } = useThemeContext();
  const [reclamationData, setReclamationData] = useState({
    firstName: "",
    lastName: "",
    legalId: "",
    email: "",
    phone: "",
    serviceType: "",
    verificationCode: "",
    agreeContactVisibility: false,
    agreeTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setReclamationData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setReclamationData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReclamarPropiedad = async () => {
    // Validaciones mejoradas
    const errors = [];

    if (!reclamationData.firstName.trim()) errors.push("Nombre");
    if (!reclamationData.lastName.trim()) errors.push("Apellido");
    if (!reclamationData.legalId.trim()) errors.push("Identificación legal");
    if (!reclamationData.email.trim()) errors.push("Correo electrónico");
    if (!reclamationData.phone.trim()) errors.push("Teléfono");
    if (!reclamationData.serviceType) errors.push("Tipo de servicio");
    if (!reclamationData.agreeContactVisibility)
      errors.push("Aceptar visibilidad de contacto");
    if (!reclamationData.agreeTerms)
      errors.push("Aceptar términos y condiciones");

    if (errors.length > 0) {
      alert(
        `Por favor, completa los siguientes campos:\n• ${errors.join("\n• ")}`
      );
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reclamationData.email)) {
      alert("Por favor, ingresa un correo electrónico válido");
      return;
    }

    setIsSubmitting(true);

    try {
      // const response = await fetch("/api/services/claim", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     serviceId: service?.id,
      //     serviceName: service?.name,
      //     // serviceType: reclamationData.serviceType,
      //     ...reclamationData,
      //     submittedAt: new Date().toISOString(),
      //   }),
      // });
      // if (response.ok) {
      //   alert(
      //     "✅ Reclamación enviada exitosamente. Te contactaremos por el chat de la app en 24-48 horas."
      //   );
      //   onClose();
      // } else {
      //   const error = await response.json();
      //   alert(
      //     `❌ Error: ${error.message || "No se pudo enviar la reclamación"}`
      //   );
      // }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "❌ Error al procesar la solicitud. Por favor, intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDocs = () => {
    return REQUIRED_DOCS[service.type as keyof typeof REQUIRED_DOCS] || [];
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "modalFadeIn 0.3s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="custom-scroll"
        style={{
          background:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
          border: `1px solid ${
            theme === "light"
              ? Colors.light.colors.border
              : Colors.dark.colors.border
          }`,
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          animation: "modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con icono */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
            paddingBottom: "20px",
            borderBottom: `1px solid ${theme === "light" ? "#eee" : "#333"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
            >
              <span style={{ fontSize: "24px", color: "white" }}>👑</span>
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: "800",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Reclamar Servicio
              </h2>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: theme === "light" ? "#666" : "#aaa",
                }}
              >
                {service?.title}
                {service.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "30px",
              cursor: "pointer",
              color: theme === "light" ? "#999" : "#666",
              padding: "8px",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              transition: "all 0.2s ease",
              backgroundColor: theme === "light" ? "#f8f9fa" : "#222",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#e9ecef" : "#333";
              e.currentTarget.style.color = theme === "light" ? "#333" : "#fff";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f8f9fa" : "#222";
              e.currentTarget.style.color = theme === "light" ? "#999" : "#666";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
          >
            ×
          </button>
        </div>

        {/* Alerta de visibilidad */}
        <div
          style={{
            padding: "18px",
            backgroundColor: theme === "light" ? "#fff3cd" : "#332701",
            border: `1px solid ${theme === "light" ? "#ffecb5" : "#665003"}`,
            borderRadius: "12px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: theme === "light" ? "#ffc107" : "#ffb300",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  color: theme === "light" ? "#856404" : "#332701",
                }}
              >
                📢
              </span>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "700",
                  color: theme === "light" ? "#856404" : "#ffd54f",
                  fontSize: "15px",
                  marginBottom: "6px",
                }}
              >
                Información importante sobre visibilidad
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: theme === "light" ? "#856404" : "#ffd54f",
                }}
              >
                Tu correo electrónico y número de teléfono serán visibles para
                los clientes que deseen contactarte directamente. Asegúrate de
                proporcionar información actualizada y profesional.
              </p>
            </div>
          </div>
        </div>

        {/* Formulario en grid responsive */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Columna izquierda - Datos personales */}
          <div>
            <div
              style={{
                paddingBottom: "16px",
                marginBottom: "20px",
                borderBottom: `2px solid ${
                  theme === "light" ? "#e9ecef" : "#333"
                }`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "700",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "20px" }}>👤</span>
                Datos personales
              </h3>
            </div>

            {["firstName", "lastName", "legalId"].map((field, index) => (
              <div key={field} style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                  }}
                >
                  {field === "firstName" && "Nombre *"}
                  {field === "lastName" && "Apellido *"}
                  {field === "legalId" && "Identificación legal *"}
                </label>
                <input
                  name={field}
                  value={
                    reclamationData[
                      field as keyof typeof reclamationData
                    ] as string
                  }
                  onChange={handleInputChange}
                  placeholder={
                    field === "firstName"
                      ? "Juan"
                      : field === "lastName"
                      ? "Pérez"
                      : "INE, RFC, Pasaporte, Cédula Profesional"
                  }
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `2px solid ${
                      theme === "light" ? "#e0e0e0" : "#444"
                    }`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    backgroundColor: theme === "light" ? "white" : "#2d2d2d",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "light" ? "#e0e0e0" : "#444";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {field === "legalId" && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: theme === "light" ? "#666" : "#999",
                      marginTop: "6px",
                      fontStyle: "italic",
                    }}
                  >
                    Documento oficial que acredite tu identidad
                  </p>
                )}
              </div>
            ))}

            {/* Tipo de servicio */}
            {/* <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                Tipo de servicio *
              </label>
              <select
                name="serviceType"
                value={reclamationData.serviceType}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: `2px solid ${theme === "light" ? "#e0e0e0" : "#444"}`,
                  borderRadius: "10px",
                  fontSize: "15px",
                  backgroundColor: theme === "light" ? "white" : "#2d2d2d",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  outline: "none",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='${
                    theme === "light" ? "%23666" : "%23ccc"
                  }' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                  backgroundSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    theme === "light" ? "#e0e0e0" : "#444";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">Selecciona el tipo de servicio</option>
                <option value={SERVICE_TYPES.PROFESIONAL}>
                  👨‍⚕️ Profesional (Médico, Abogado, Ingeniero, etc.)
                </option>
                <option value={SERVICE_TYPES.NEGOCIO}>
                  🏢 Negocio / Empresa
                </option>
                <option value={SERVICE_TYPES.SERVICIO}>
                  🔧 Servicio Técnico / Especializado
                </option>
                <option value={SERVICE_TYPES.OTRO}>
                  🎯 Otro tipo de servicio
                </option>
              </select>
            </div> */}
          </div>

          {/* Columna derecha - Contacto */}
          <div>
            <div
              style={{
                paddingBottom: "16px",
                marginBottom: "20px",
                borderBottom: `2px solid ${
                  theme === "light" ? "#e9ecef" : "#333"
                }`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "700",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "20px" }}>📞</span>
                Información de contacto
              </h3>
            </div>

            {["email", "phone"].map((field, index) => (
              <div key={field} style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                  }}
                >
                  {field === "email" && "Correo electrónico *"}
                  {field === "phone" && "Teléfono *"}
                </label>
                <input
                  name={field}
                  type={
                    field === "email"
                      ? "email"
                      : field === "phone"
                      ? "tel"
                      : "text"
                  }
                  value={
                    reclamationData[
                      field as keyof typeof reclamationData
                    ] as string
                  }
                  onChange={handleInputChange}
                  placeholder={
                    field === "email"
                      ? "ejemplo@dominio.com"
                      : field === "phone"
                      ? "+52 55 1234 5678"
                      : "Si ya recibiste un código de verificación"
                  }
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `2px solid ${
                      theme === "light" ? "#e0e0e0" : "#444"
                    }`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    backgroundColor: theme === "light" ? "white" : "#2d2d2d",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "light" ? "#e0e0e0" : "#444";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {field === "email" && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: theme === "light" ? "#666" : "#999",
                      marginTop: "6px",
                    }}
                  >
                    Los clientes podrán contactarte por este correo
                  </p>
                )}
                {field === "phone" && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: theme === "light" ? "#666" : "#999",
                      marginTop: "6px",
                    }}
                  >
                    Incluye código de país. Visible para los clientes.
                  </p>
                )}
              </div>
            ))}
          </div>
          {/* Checkboxes de aceptación */}
        </div>
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              cursor: "pointer",
              fontSize: "15px",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: theme === "light" ? "#f8f9fa" : "#2a2a2a",
              borderRadius: "10px",
              border: `1px solid ${theme === "light" ? "#e9ecef" : "#444"}`,
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#e9ecef" : "#333";
              e.currentTarget.style.borderColor =
                theme === "light" ? "#dee2e6" : "#555";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f8f9fa" : "#2a2a2a";
              e.currentTarget.style.borderColor =
                theme === "light" ? "#e9ecef" : "#444";
            }}
          >
            <input
              type="checkbox"
              name="agreeContactVisibility"
              checked={reclamationData.agreeContactVisibility}
              onChange={handleInputChange}
              style={{
                marginTop: "3px",
                width: "18px",
                height: "18px",
                cursor: "pointer",
                accentColor: "#667eea",
              }}
            />
            <span style={{ lineHeight: "1.5" }}>
              <strong>✅ Acepto la visibilidad de contacto:</strong> Entiendo y
              acepto que mi correo electrónico y número de teléfono serán
              visibles públicamente para que los clientes puedan contactarme.
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              cursor: "pointer",
              fontSize: "15px",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
              padding: "12px",
              backgroundColor: theme === "light" ? "#f8f9fa" : "#2a2a2a",
              borderRadius: "10px",
              border: `1px solid ${theme === "light" ? "#e9ecef" : "#444"}`,
              transition: "all 0.2s ease",
              marginLeft: "20px",
              marginBottom: "20px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#e9ecef" : "#333";
              e.currentTarget.style.borderColor =
                theme === "light" ? "#dee2e6" : "#555";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f8f9fa" : "#2a2a2a";
              e.currentTarget.style.borderColor =
                theme === "light" ? "#e9ecef" : "#444";
            }}
          >
            <input
              type="checkbox"
              name="agreeTerms"
              checked={reclamationData.agreeTerms}
              onChange={handleInputChange}
              style={{
                marginTop: "3px",
                width: "18px",
                height: "18px",
                cursor: "pointer",
                accentColor: "#667eea",
              }}
            />
            <span style={{ lineHeight: "1.5" }}>
              <strong>📋 Acepto términos y condiciones:</strong> He leído y
              acepto los{" "}
              <a
                href="/terminos"
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                  fontWeight: "600",
                  borderBottom: "1px dotted #667eea",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                Términos de Servicio
              </a>{" "}
              y confirmo ser el propietario legítimo de este servicio.
            </span>
          </label>
        </div>

        {/* Documentación informativa (no seleccionable) */}

        <div
          style={{
            marginBottom: "32px",
            padding: "24px",
            backgroundColor: theme === "light" ? "#f8f9ff" : "#1a1a2e",
            borderRadius: "16px",
            border: `2px solid ${theme === "light" ? "#e0e7ff" : "#2a2a4a"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: theme === "light" ? "#667eea" : "#764ba2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "22px", color: "white" }}>📄</span>
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                Documentación requerida
              </h3>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "14px",
                  color: theme === "light" ? "#666" : "#aaa",
                }}
              >
                Para servicios de tipo:{" "}
                <strong>
                  {reclamationData.serviceType === SERVICE_TYPES.PROFESIONAL
                    ? "Profesional"
                    : reclamationData.serviceType === SERVICE_TYPES.NEGOCIO
                    ? "Negocio/Empresa"
                    : reclamationData.serviceType === SERVICE_TYPES.SERVICIO
                    ? "Servicio Técnico"
                    : "Otro"}
                </strong>
              </p>
            </div>
          </div>

          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.6",
              color: theme === "light" ? "#555" : "#ccc",
              marginBottom: "20px",
            }}
          >
            Para verificar tu identidad como propietario, necesitarás
            proporcionar
            <strong> al menos uno</strong> de los siguientes documentos durante
            el proceso de verificación:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {getCurrentDocs().map((doc, index) => (
              <div
                key={index}
                style={{
                  padding: "16px",
                  backgroundColor: theme === "light" ? "white" : "#2a2a2a",
                  borderRadius: "10px",
                  border: `1px solid ${theme === "light" ? "#e0e0e0" : "#444"}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor:
                        theme === "light" ? "#e3f2fd" : "#0d47a1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>
                      {index === 0 ? "📑" : index === 1 ? "🆔" : "📋"}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color:
                        theme === "light"
                          ? Colors.light.colors.text
                          : Colors.dark.colors.text,
                    }}
                  >
                    {doc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              backgroundColor: theme === "light" ? "#fff3e0" : "#332600",
              borderRadius: "10px",
              borderLeft: `4px solid ${
                theme === "light" ? "#ff9800" : "#ffb74d"
              }`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                lineHeight: "1.5",
                color: theme === "light" ? "#e65100" : "#ffcc80",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "18px" }}>💡</span>
              <span>
                <strong>Nota:</strong> Los documentos se solicitarán durante el
                proceso de verificación a través del chat de la aplicación.
                Mantén estos documentos digitalizados y listos para enviar.
              </span>
            </p>
          </div>
        </div>

        {/* Proceso de verificación */}
        <div
          style={{
            marginBottom: "32px",
            padding: "24px",
            backgroundColor: theme === "light" ? "#e8f5e9" : "#1b3a1b",
            borderRadius: "16px",
            border: `2px solid ${theme === "light" ? "#c8e6c9" : "#2e7d32"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: theme === "light" ? "#4caf50" : "#2e7d32",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "22px", color: "white" }}>⏳</span>
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color: theme === "light" ? "#2e7d32" : "#a5d6a7",
                }}
              >
                Proceso de verificación
              </h3>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "14px",
                  color: theme === "light" ? "#388e3c" : "#81c784",
                }}
              >
                Comunicación exclusiva a través del chat de la aplicación
              </p>
            </div>
          </div>

          {/* <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              { icon: "📩", title: "1. Revisión inicial", desc: "24-48 horas" },
              {
                icon: "💬",
                title: "2. Contacto por chat",
                desc: "Nos comunicaremos contigo a través del chat de la app",
              },
              {
                icon: "📎",
                title: "3. Envío de documentos",
                desc: "Sube los documentos solicitados por el chat",
              },
              {
                icon: "✅",
                title: "4. Verificación completa",
                desc: "2-5 días hábiles",
              },
            ].map((step, index) => (
              <div
                key={index}
                style={{
                  padding: "20px",
                  backgroundColor: theme === "light" ? "white" : "#2a2a2a",
                  borderRadius: "12px",
                  border: `1px solid ${
                    theme === "light" ? "#c8e6c9" : "#2e7d32"
                  }`,
                  transition: "transform 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{step.icon}</span>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "700",
                      color: theme === "light" ? "#2e7d32" : "#a5d6a7",
                    }}
                  >
                    {step.title}
                  </h4>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: theme === "light" ? "#555" : "#ccc",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div> */}
          {/* Información del proceso */}
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: theme === "light" ? "#f3f4f6" : "#1f2937",
              borderRadius: "8px",
              borderLeft: `4px solid ${
                theme === "light" ? "#10b981" : "#34d399"
              }`,
            }}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>📋</span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: theme === "light" ? "#065f46" : "#a7f3d0",
                    fontSize: "14px",
                  }}
                >
                  Proceso de verificación
                </p>
                <ul
                  style={{
                    margin: "8px 0 0 0",
                    paddingLeft: "20px",
                    fontSize: "13px",
                    color: theme === "light" ? "#047857" : "#6ee7b7",
                  }}
                >
                  <li>Revisión inicial: 24-48 horas</li>
                  <li>Contacto para solicitar documentos</li>
                  <li>Verificación completa: 2-5 días hábiles</li>
                  <li>Notificación por chat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: `2px solid ${theme === "light" ? "#eee" : "#333"}`,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "18px 24px",
              backgroundColor: "transparent",
              color: theme === "light" ? "#666" : "#999",
              border: `2px solid ${theme === "light" ? "#ddd" : "#444"}`,
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              letterSpacing: "0.5px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f5f5f5" : "#333";
              e.currentTarget.style.borderColor =
                theme === "light" ? "#bbb" : "#555";
              e.currentTarget.style.color = theme === "light" ? "#333" : "#fff";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor =
                theme === "light" ? "#ddd" : "#444";
              e.currentTarget.style.color = theme === "light" ? "#666" : "#999";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleReclamarPropiedad}
            disabled={isSubmitting}
            style={{
              flex: 2,
              padding: "18px 24px",
              background: isSubmitting
                ? theme === "light"
                  ? "linear-gradient(135deg, #ccc 0%, #999 100%)"
                  : "linear-gradient(135deg, #555 0%, #333 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              letterSpacing: "0.5px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(102, 126, 234, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(102, 126, 234, 0.3)";
              }
            }}
          >
            {isSubmitting ? (
              <>
                <span>⏳</span>
                Procesando solicitud...
              </>
            ) : (
              <>
                <span>🚀</span>
                Enviar reclamación
              </>
            )}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes modalSlideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Scrollbar personalizado */
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: ${Colors.detailAppColor} ${
          theme === "light" ? "#f1f1f1" : "#2a2a2a"
        };
          }

          .custom-scroll::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          .custom-scroll::-webkit-scrollbar-track {
            background: ${theme === "light" ? "#f8f9fa" : "#2a2a2a"};
            border-radius: 10px;
          }

          .custom-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            border: 2px solid ${theme === "light" ? "#f8f9fa" : "#2a2a2a"};
          }

          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          }

          /* Responsive design */
          @media (max-width: 768px) {
            .custom-scroll {
              padding: 24px 20px;
              max-height: 85vh;
              border-radius: 16px 16px 0 0;
              margin-top: auto;
            }

            .modal-overlay {
              padding: 0;
              align-items: flex-end;
            }

            h2 {
              font-size: 24px;
            }
          }

          @media (max-width: 640px) {
            .custom-scroll {
              padding: 20px 16px;
            }

            h2 {
              font-size: 22px;
            }

            .form-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .buttons-container {
              flex-direction: column;
              gap: 12px;
            }

            .buttons-container button {
              width: 100%;
            }
          }

          /* Mejoras de accesibilidad */
          input:focus-visible,
          select:focus-visible,
          button:focus-visible {
            outline: 2px solid #667eea;
            outline-offset: 2px;
          }

          /* Transiciones suaves */
          * {
            transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
          }

          /* Estilos para checkboxes personalizados */
          input[type="checkbox"] {
            accent-color: #667eea;
          }

          /* Mejora de legibilidad */
          p, span, label {
            line-height: 1.6;
          }

          /* Efecto de carga para el botón */
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          button:disabled {
            animation: pulse 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
};
