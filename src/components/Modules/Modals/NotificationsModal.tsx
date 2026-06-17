import { useEffect, useRef, useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";
import { NotificationModel } from "../../Models/Notification/NotificationModel";
import NotificationItem from "../Notification/NotificationItem";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationModel[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsModal = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onDeleteNotification,
  onMarkAllAsRead,
}: NotificationsModalProps) => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return true;
    return true;
  });

  const unreadCount = notifications.filter((n) => true).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor:
            theme === "light" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          position: "fixed",
          top: "60px",
          right: "20px",
          width: "400px",
          maxWidth: "calc(100vw - 40px)",
          maxHeight: "calc(95vh - 80px)",
          backgroundColor: theme === "light" ? "#ffffff" : "#1a1a1a",
          border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
          borderRadius: "16px",
          boxShadow:
            theme === "light"
              ? "0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08)"
              : "0 20px 60px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          zIndex: 1001,
          animation: "slideDownFade 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${
              theme === "light" ? "#f3f4f6" : "#374151"
            }`,
            backgroundColor: theme === "light" ? "#ffffff" : "#1a1a1a",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
                color: theme === "light" ? "#111827" : "#f9fafb",
              }}
            >
              {getLabel("notificaciones")}
            </h3>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: "14px",
                    color: Colors.detailAppColor,
                    fontWeight: 600,
                    backgroundColor: theme === "light" ? "#dbeafe" : "#1e3a8a",
                    padding: "4px 10px",
                    borderRadius: "12px",
                  }}
                >
                  {unreadCount} {getLabel("nuevas")}
                </span>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setFilter("all")}
              style={{
                padding: "6px 12px",
                backgroundColor:
                  filter === "all"
                    ? theme === "light"
                      ? Colors.detailAppColor
                      : "#3b82f6"
                    : theme === "light"
                    ? "#f3f4f6"
                    : "#374151",
                color:
                  filter === "all"
                    ? "white"
                    : theme === "light"
                    ? "#6b7280"
                    : "#9ca3af",
                border: "none",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {getLabel("todas")}
            </button>
            <button
              onClick={() => setFilter("unread")}
              style={{
                padding: "6px 12px",
                backgroundColor:
                  filter === "unread"
                    ? theme === "light"
                      ? Colors.detailAppColor
                      : "#3b82f6"
                    : theme === "light"
                    ? "#f3f4f6"
                    : "#374151",
                color:
                  filter === "unread"
                    ? "white"
                    : theme === "light"
                    ? "#6b7280"
                    : "#9ca3af",
                border: "none",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {getLabel("no_leidas")}
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
          }}
        >
          {filteredNotifications.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: theme === "light" ? "#9ca3af" : "#6b7280",
              }}
            >
              <div
                style={{
                  fontSize: "64px",
                  marginBottom: "16px",
                  opacity: 0.3,
                }}
              >
                🔔
              </div>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: "0 0 8px",
                  color: theme === "light" ? "#6b7280" : "#9ca3af",
                }}
              >
                {filter === "unread"
                  ? getLabel("no_notificaciones_no_leidas")
                  : getLabel("no_notificaciones")}
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  margin: 0,
                  opacity: 0.7,
                }}
              >
                {getLabel("no_notificaciones_descripcion")}
              </p>
            </div>
          ) : (
            <div style={{ padding: "4px 0" }}>
              {filteredNotifications.map((notification, index) => (
                <NotificationItem
                  key={index}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDeleteNotification}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Estilos globales */}
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideDownFade {
              from {
                opacity: 0;
                transform: translateY(-12px) scale(0.98);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            
            ::-webkit-scrollbar {
              width: 6px;
            }
            
            ::-webkit-scrollbar-track {
              background: ${theme === "light" ? "#f1f1f1" : "#2d2d2d"};
            }
            
            ::-webkit-scrollbar-thumb {
              background: ${theme === "light" ? "#c1c1c1" : "#555"};
              border-radius: 3px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: ${theme === "light" ? "#a8a8a8" : "#777"};
            }
          `}
        </style>
      </div>
    </>
  );
};

export default NotificationsModal;
