// Toast.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "./ThemeContext";

interface IToast {
  id?: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

interface ToastContainerProps {
  toasts: IToast[];
  removeToast: (id: string) => void;
}

// Configuración de iconos y colores según el tipo
const TOAST_CONFIG = {
  success: {
    icon: "✓",
    iconColor: "#2ed573",
    background: "#2ed57315",
    borderColor: "#2ed573",
    progressColor: "#2ed573",
  },
  error: {
    icon: "✕",
    iconColor: "#dc3545",
    background: "#dc354515",
    borderColor: "#dc3545",
    progressColor: "#dc3545",
  },
  warning: {
    icon: "⚠️",
    iconColor: "#f59f00",
    background: "#f59f0015",
    borderColor: "#f59f00",
    progressColor: "#f59f00",
  },
  info: {
    icon: "ℹ️",
    iconColor: Colors.detailAppColor,
    background: `${Colors.detailAppColor}15`,
    borderColor: Colors.detailAppColor,
    progressColor: Colors.detailAppColor,
  },
};

// Componente individual de Toast
const Toast = ({ toast, onClose }: { toast: IToast; onClose: () => void }) => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 4000;
  const config = TOAST_CONFIG[toast.type];

  // Animación de progreso
  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, isPaused, onClose]);

  // Auto cierre después de la duración
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPaused) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, isPaused, onClose]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: "relative",
        marginBottom: "12px",
        background: c.card,
        borderLeft: `4px solid ${config.iconColor}`,
        borderRadius: "12px",
        padding: "14px 16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        animation: "slideInRight 0.3s ease",
        width: "360px",
        maxWidth: "calc(100vw - 40px)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Icono */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: config.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          <span>{config.icon}</span>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: c.text,
              marginBottom: toast.description ? "4px" : 0,
            }}
          >
            {toast.title}
          </div>
          {toast.description && (
            <div
              style={{
                fontSize: "12px",
                color: c.textMuted,
                lineHeight: "1.4",
                wordBreak: "break-word",
              }}
            >
              {toast.description}
            </div>
          )}
        </div>

        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
            color: c.textMuted,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = c.accentSoft;
            e.currentTarget.style.color = c.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = c.textMuted;
          }}
        >
          ×
        </button>
      </div>

      {/* Barra de progreso */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          width: `${progress}%`,
          background: config.progressColor,
          transition: "width 16ms linear",
        }}
      />
    </div>
  );
};

// Contenedor de Toasts
const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id!)}
        />
      ))}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

// Hook y contexto global
interface ToastContextType {
  showToast: (toast: Omit<IToast, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// Provider global
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<IToast[]>([]);

  const showToast = useCallback((toast: Omit<IToast, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Función standalone para usar sin contexto (opcional)
let globalShowToast: ((toast: Omit<IToast, "id">) => string) | null = null;

export const registerToastHandler = (
  handler: (toast: Omit<IToast, "id">) => string,
) => {
  globalShowToast = handler;
};

export const showToastGlobal = (toast: Omit<IToast, "id">) => {
  if (globalShowToast) {
    return globalShowToast(toast);
  }
  console.warn("Toast handler not registered");
  return "";
};
