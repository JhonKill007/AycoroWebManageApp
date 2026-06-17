// components/PostOptionsModal.tsx
import {
  faBookmark,
  faCheck,
  faEdit,
  faFlag,
  faLink,
  faShare,
  faTimes,
  faUndo,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useThemeContext } from "../../context/ThemeContext";

interface PostOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
  currentCaption?: string;
  onCaptionUpdate?: (newCaption: string) => void;
}

const ModalOptions: React.FC<PostOptionsModalProps> = ({
  isOpen,
  onClose,
  onOptionSelect,
  currentCaption = "",
  onCaptionUpdate,
}) => {
  const { theme } = useThemeContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(currentCaption);
  const [tempCaption, setTempCaption] = useState(currentCaption);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditedCaption(currentCaption);
    setTempCaption(currentCaption);
    onClose();
  };

  const handleOptionClick = (option: string) => {
    if (option === "edit") {
      setIsEditing(true);
      setTempCaption(editedCaption);
      return;
    }
    onOptionSelect(option);
    handleClose();
  };

  const handleSaveEdit = () => {
    setEditedCaption(tempCaption);
    if (onCaptionUpdate) {
      onCaptionUpdate(tempCaption);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempCaption(editedCaption);
    setIsEditing(false);
  };

  // Colores base según el tema
  const colors = {
    background: {
      primary: theme === "light" ? "#ffffff" : "#1a1a1a",
      secondary: theme === "light" ? "#fafafa" : "#2a2a2a",
      overlay: theme === "light" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.7)",
      input: theme === "light" ? "#fafafa" : "#2a2a2a",
    },
    text: {
      primary: theme === "light" ? "#262626" : "#ffffff",
      secondary: theme === "light" ? "#8e8e8e" : "#888888",
      danger: "#ef4444",
      accent: "#0095f6",
    },
    border: {
      primary: theme === "light" ? "#dbdbdb" : "#333333",
      secondary: theme === "light" ? "#e0e0e0" : "#444444",
      focus: theme === "light" ? "#667eea" : "#764ba2",
    },
    accent: "#0095f6",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        opacity: 0.3,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: colors.background.primary,
          borderRadius: "12px",
          border: `1px solid ${colors.border.primary}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: isEditing ? "500px" : "400px",
          overflow: "hidden",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Header del Modal */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.border.secondary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: colors.text.primary,
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {isEditing ? "Editar descripción" : "Opciones de publicación"}
          </h3>
          <button
            onClick={isEditing ? handleCancelEdit : handleClose}
            style={{
              background: "none",
              border: "none",
              color: colors.text.secondary,
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              transition: "background-color 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f8f9fa" : "#333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {isEditing ? (
          /* MODO EDICIÓN */
          <div style={{ padding: "20px" }}>
            {/* Input de edición */}
            <textarea
              value={tempCaption}
              onChange={(e) => setTempCaption(e.target.value)}
              placeholder="Escribe una descripción..."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "16px",
                border: `2px solid ${colors.border.primary}`,
                borderRadius: "8px",
                backgroundColor: colors.background.input,
                color: colors.text.primary,
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor =
                  theme === "light" ? "white" : "#333";
                e.target.style.borderColor = colors.border.focus;
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = colors.background.input;
                e.target.style.borderColor = colors.border.primary;
              }}
            />

            {/* Contador de caracteres */}
            <div
              style={{
                textAlign: "right",
                marginTop: "8px",
                color:
                  tempCaption.length > 2200
                    ? colors.text.danger
                    : colors.text.secondary,
                fontSize: "12px",
              }}
            >
              {tempCaption.length}/2200
            </div>

            {/* Botones de acción edición */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: "transparent",
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === "light" ? "#f8f9fa" : "#333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FontAwesomeIcon icon={faUndo} />
                Cancelar
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={tempCaption.length > 2200}
                style={{
                  backgroundColor:
                    tempCaption.length > 2200 ? "#ccc" : colors.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: tempCaption.length > 2200 ? "not-allowed" : "pointer",
                  transition: "background-color 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: tempCaption.length > 2200 ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (tempCaption.length <= 2200) {
                    e.currentTarget.style.backgroundColor = "#007acc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (tempCaption.length <= 2200) {
                    e.currentTarget.style.backgroundColor = colors.accent;
                  }
                }}
              >
                <FontAwesomeIcon icon={faCheck} />
                Guardar
              </button>
            </div>
          </div>
        ) : (
          /* MODO OPCIONES NORMALES */
          <div style={{ padding: "8px 0" }}>
            {/* Opción Editar */}
            <button
              onClick={() => handleOptionClick("edit")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                color: colors.text.primary,
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#fafafa" : "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FontAwesomeIcon
                icon={faEdit}
                style={{ color: colors.text.primary, width: "16px" }}
              />
              <span>Editar publicación</span>
            </button>

            {/* Opción Guardar */}
            <button
              onClick={() => handleOptionClick("save")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                color: colors.text.primary,
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#fafafa" : "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FontAwesomeIcon
                icon={faBookmark}
                style={{ color: colors.text.primary, width: "16px" }}
              />
              <span>Guardar publicación</span>
            </button>

            {/* Opción Compartir */}
            <button
              onClick={() => handleOptionClick("share")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                color: colors.text.primary,
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#fafafa" : "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FontAwesomeIcon
                icon={faShare}
                style={{ color: colors.text.primary, width: "16px" }}
              />
              <span>Compartir publicación</span>
            </button>

            {/* Opción Copiar enlace */}
            <button
              onClick={() => handleOptionClick("copy_link")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                color: colors.text.primary,
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#fafafa" : "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FontAwesomeIcon
                icon={faLink}
                style={{ color: colors.text.primary, width: "16px" }}
              />
              <span>Copiar enlace</span>
            </button>

            {/* Separador */}
            <div
              style={{
                height: "1px",
                backgroundColor: colors.border.secondary,
                margin: "8px 0",
              }}
            />

            {/* Opción Silenciar */}
            <button
              onClick={() => handleOptionClick("mute")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                color: colors.text.primary,
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#fafafa" : "#2a2a2a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FontAwesomeIcon
                icon={faVolumeMute}
                style={{ color: colors.text.primary, width: "16px" }}
              />
              <span>Silenciar notificaciones</span>
            </button>

            {/* Separador */}
            <div
              style={{
                height: "1px",
                backgroundColor: colors.border.secondary,
                margin: "8px 0",
              }}
            />

            {/* Opciones Peligrosas */}
            <button
              onClick={() => handleOptionClick("report")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                color: colors.text.danger,
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#fef2f2" : "#2a1a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <FontAwesomeIcon
                icon={faFlag}
                style={{ color: colors.text.danger, width: "16px" }}
              />
              <span>Reportar publicación</span>
            </button>
          </div>
        )}

        {/* Footer solo en modo normal */}
        {!isEditing && (
          <div
            style={{
              padding: "16px 20px",
              borderTop: `1px solid ${colors.border.secondary}`,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                backgroundColor: "transparent",
                color: colors.text.primary,
                border: `1px solid ${colors.border.primary}`,
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#f8f9fa" : "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ModalOptions;
