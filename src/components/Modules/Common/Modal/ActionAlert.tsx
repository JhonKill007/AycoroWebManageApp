import { useCallback, useEffect } from "react";
import { Colors } from "../../../constants/Colors";

interface IActionAlert {
  visible: boolean;
  title: string;
  description: string;
  actionText: string;
  cancelText?: string;
  actionColor?: string;
  onAction: () => void;
  onCancel: () => void;
  theme: string;
  c: any;
  icon?: string;
  isLoading?: boolean;
}

const ActionAlert = ({
  visible,
  title,
  description,
  actionText,
  cancelText = "Cancelar",
  actionColor = Colors.detailAppColor,
  onAction,
  onCancel,
  theme,
  c,
  icon = "⚠️",
  isLoading = false,
}: IActionAlert) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        onCancel();
      }
      if (e.key === "Enter" && visible && !isLoading) {
        onAction();
      }
    },
    [visible, onCancel, onAction, isLoading]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [visible, handleKeyDown]);

  if (!visible) return null;

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
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          borderRadius: 24,
          width: "100%",
          maxWidth: 420,
          padding: "28px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
          animation: "scaleIn 0.25s ease",
          textAlign: "center",
        }}
      >
        {/* Icono */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            background: `${actionColor}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            fontSize: 32,
          }}
        >
          {icon}
        </div>

        {/* Título */}
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: c.text,
            marginBottom: "12px",
          }}
        >
          {title}
        </h3>

        {/* Descripción */}
        <p
          style={{
            fontSize: "14px",
            color: c.textMuted,
            lineHeight: 1.5,
            marginBottom: "24px",
          }}
        >
          {description}
        </p>

        {/* Botones */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              borderRadius: 40,
              fontSize: "14px",
              fontWeight: 500,
              border: `1px solid ${c.border}`,
              background: "transparent",
              color: c.text,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              transition: "all 0.2s",
              flex: 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = c.accentSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onAction}
            disabled={isLoading}
            style={{
              padding: "10px 24px",
              borderRadius: 40,
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              background: actionColor,
              color: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.2s",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(0.98)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Procesando...
              </>
            ) : (
              actionText
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ActionAlert;