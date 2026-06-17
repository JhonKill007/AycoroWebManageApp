import React, { useEffect, useRef, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import useLanguage from "../../../hooks/useLanguage";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
  item: string;
  title?: string;
  maxLength?: number;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  title = "Editar descripción",
  maxLength = 2200,
}) => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const [description, setDescription] = useState(item);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDescription(item);
  }, [item]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || description.trim() === item.trim()) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(description.trim());
      onClose();
    } catch (error) {
      console.error("Error saving description:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }

    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const characterCount = description.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalSlideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spinnerSpin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 640px) {
            .edit-modal-footer {
              flex-direction: column-reverse;
            }
            .edit-modal-cancel-btn,
            .edit-modal-save-btn {
              width: 100%;
            }
          }
        `}
      </style>

      <div
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px",
          animation: "modalFadeIn 0.2s ease-out",
        }}
      >
        <div
          style={{
            background:
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background,
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "100%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflow: "hidden",
            animation: "modalSlideUp 0.2s ease-out",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px 16px",
                borderBottom: `1px solid #${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  margin: 0,
                }}
              >
                {title}
              </h2>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px",
                  borderRadius: "6px",
                  color: "#6b7280",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#6b7280";
                  }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <div style={{ padding: "24px", position: "relative", flex: 1 }}>
              <textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%",
                  border: `1px solid ${
                    isOverLimit
                      ? "#ef4444"
                      : theme === "light"
                      ? Colors.light.colors.inputBorder
                      : Colors.dark.colors.inputBorder
                  }`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  backgroundColor:
                    theme === "light"
                      ? Colors.light.colors.inputBackground
                      : Colors.dark.colors.inputBackground,
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  resize: "vertical",
                  minHeight: "120px",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  if (!isOverLimit) {
                    e.target.style.borderColor = Colors.detailAppColor;
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isOverLimit
                    ? "#ef4444"
                    : theme === "light"
                    ? Colors.light.colors.inputBorder
                    : Colors.dark.colors.inputBorder;
                  e.target.style.boxShadow = "none";
                }}
                placeholder={getLabel("escribe_descripcion")}
                maxLength={maxLength}
                disabled={isSubmitting}
                rows={6}
              />

              {/* Character counter */}
              <div
                style={{
                  textAlign: "right",
                  fontSize: "12px",
                  color: isOverLimit
                    ? "#ef4444"
                    : isNearLimit
                    ? "#f59e0b"
                    : "#6b7280",
                  marginTop: "8px",
                  fontWeight: isOverLimit ? 600 : 400,
                  transition: "color 0.2s ease",
                }}
              >
                {characterCount} / {maxLength}
              </div>
            </div>

            {/* Footer */}
            <div
              className="edit-modal-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "20px 24px",
                borderTop: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="edit-modal-cancel-btn"
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${
                    theme === "light"
                      ? Colors.light.colors.border
                      : Colors.dark.colors.border
                  }`,
                  borderRadius: "6px",
                  backgroundColor:
                    theme === "light"
                      ? Colors.light.colors.background
                      : Colors.dark.colors.background,
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="edit-modal-save-btn"
                disabled={
                  isSubmitting ||
                  description.trim() === item.trim() ||
                  isOverLimit
                }
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor:
                    isSubmitting ||
                    description.trim() === item.trim() ||
                    isOverLimit
                      ? "#9ca3af"
                      : "#3b82f6",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor:
                    isSubmitting ||
                    description.trim() === item.trim() ||
                    isOverLimit
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "100px",
                  justifyContent: "center",
                }}
                onMouseOver={(e) => {
                  if (
                    !isSubmitting &&
                    description.trim() !== item.trim() &&
                    !isOverLimit
                  ) {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }
                }}
                onMouseOut={(e) => {
                  if (
                    !isSubmitting &&
                    description.trim() !== item.trim() &&
                    !isOverLimit
                  ) {
                    e.currentTarget.style.backgroundColor = "#3b82f6";
                  }
                }}
                onMouseDown={(e) => {
                  if (
                    !isSubmitting &&
                    description.trim() !== item.trim() &&
                    !isOverLimit
                  ) {
                    e.currentTarget.style.transform = "translateY(1px)";
                  }
                }}
                onMouseUp={(e) => {
                  if (
                    !isSubmitting &&
                    description.trim() !== item.trim() &&
                    !isOverLimit
                  ) {
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid transparent",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spinnerSpin 1s linear infinite",
                      }}
                    />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditModal;
