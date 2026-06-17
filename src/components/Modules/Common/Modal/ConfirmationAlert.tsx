import React, { useEffect, useRef } from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";

interface ConfirmationAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "default" | "danger" | "warning" | "success";
}

const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "default",
}) => {
  const { theme } = useThemeContext();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (document.activeElement === confirmButtonRef.current) {
        handleConfirm();
      } else if (document.activeElement === cancelButtonRef.current) {
        onClose();
      } else {
        handleConfirm();
      }
    }

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      confirmButtonRef.current?.focus();
    }

    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      cancelButtonRef.current?.focus();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          confirmButtonColor: "#dc2626",
          confirmButtonHoverColor: "#b91c1c",
          iconColor: "#dc2626",
        };
      case "warning":
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          confirmButtonColor: "#d97706",
          confirmButtonHoverColor: "#b45309",
          iconColor: "#d97706",
        };
      case "success":
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          confirmButtonColor: "#16a34a",
          confirmButtonHoverColor: "#15803d",
          iconColor: "#16a34a",
        };
      default:
        return {
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          confirmButtonColor: "#3b82f6",
          confirmButtonHoverColor: "#2563eb",
          iconColor: "#3b82f6",
        };
    }
  };

  const typeStyles = getTypeStyles();

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes alertFadeIn {
            from { 
              opacity: 0;
              transform: scale(0.9) translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes backdropFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
          animation: "backdropFadeIn 0.2s ease-out",
        }}
      >
        <div
          onKeyDown={handleKeyDown}
          style={{
            background:
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background,
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "100%",
            maxWidth: "400px",
            overflow: "hidden",
            animation: "alertFadeIn 0.2s ease-out",
          }}
        >
          {/* Content */}
          <div style={{ padding: "24px" }}>
            {/* Icon and Title */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  color: typeStyles.iconColor,
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                {typeStyles.icon}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                    margin: "4px 0 4px 0",
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h3>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              padding: "16px 24px 24px",
              borderTop: `1px solid ${
                theme === "light"
                  ? Colors.light.colors.border
                  : Colors.dark.colors.border
              }`,
            }}
          >
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onClose}
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
                minWidth: "80px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light"
                    ? Colors.dark.colors.background
                    : Colors.light.colors.background;
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.color =
                  theme === "light"
                    ? Colors.dark.colors.text
                    : Colors.light.colors.text;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background;
                e.currentTarget.style.borderColor =
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border;
                e.currentTarget.style.color =
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text;
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {cancelText}
            </button>

            <button
              ref={confirmButtonRef}
              type="button"
              onClick={handleConfirm}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: typeStyles.confirmButtonColor,
                color: "white",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                minWidth: "80px",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  typeStyles.confirmButtonHoverColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor =
                  typeStyles.confirmButtonColor;
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 3px ${typeStyles.confirmButtonColor}33`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(1px)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationAlert;
