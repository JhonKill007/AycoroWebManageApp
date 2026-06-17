import {
  faAt,
  faCheck,
  faClose,
  faComment,
  faHeart,
  faHistory,
  faMessage,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfilePlaceholder from "../../assets/UserProfile.jpeg";
import { Colors } from "../../constants/Colors";
import { NotifyType } from "../../constants/Types";
import { useImageBankContext } from "../../context/ImageBankContext";
import { useThemeContext } from "../../context/ThemeContext";
import useHourHook from "../../hooks/useHourHook";
import useLanguage from "../../hooks/useLanguage";
import { NotificationModel } from "../../Models/Notification/NotificationModel";

interface NotificationItemProps {
  notification: NotificationModel;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const NotificationItem = memo(
  ({
    notification,
    onMarkAsRead,
    onDelete,
    onClose,
  }: NotificationItemProps) => {
    const navigate = useNavigate();
    const { theme } = useThemeContext();
    const { getLabel } = useLanguage();
    const { searchImage } = useImageBankContext();
    const { getElapsedTime } = useHourHook();
    const [profileImage, setProfileImage] = useState<string>(
      UserProfilePlaceholder
    );
    const [contentImage, setContentImage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Mapeo completo de tipos de notificación
    const notificationTypeConfig = {
      [NotifyType.FOLLOW]: {
        icon: faUserPlus,
        color: "#3b82f6",
        bgColor: theme === "light" ? "#dbeafe" : "#1e3a8a",
        text: getLabel("notificacion_seguimiento"),
        action: "profile",
        emoji: "👤",
      },
      [NotifyType.PUBLICATION_LIKE]: {
        icon: faHeart,
        color: "#ef4444",
        bgColor: theme === "light" ? "#fee2e2" : "#7f1d1d",
        text: getLabel("notificacion_like_publicacion"),
        action: "publication",
        emoji: "❤️",
      },
      [NotifyType.HISTORY_LIKE]: {
        icon: faHeart,
        color: "#ec4899",
        bgColor: theme === "light" ? "#fce7f3" : "#831843",
        text: getLabel("notificacion_like_historia"),
        action: "story",
        emoji: "📱",
      },
      [NotifyType.COMENT_LIKE]: {
        icon: faHeart,
        color: "#f59e0b",
        bgColor: theme === "light" ? "#fef3c7" : "#92400e",
        text: getLabel("notificacion_like_comentario"),
        action: "comment",
        emoji: "💬",
      },
      [NotifyType.COMENT]: {
        icon: faComment,
        color: "#10b981",
        bgColor: theme === "light" ? "#d1fae5" : "#064e3b",
        text: getLabel("notificacion_comentario"),
        action: "publication",
        emoji: "💭",
      },
      [NotifyType.PUBLICATION_MENTION]: {
        icon: faAt,
        color: "#8b5cf6",
        bgColor: theme === "light" ? "#ede9fe" : "#4c1d95",
        text: getLabel("notificacion_mencion_publicacion"),
        action: "publication",
        emoji: "@",
      },
      [NotifyType.HISTORY_MENTION]: {
        icon: faAt,
        color: "#8b5cf6",
        bgColor: theme === "light" ? "#ede9fe" : "#4c1d95",
        text: getLabel("notificacion_mencion_historia"),
        action: "story",
        emoji: "📱@",
      },
      [NotifyType.COMENT_MENTION]: {
        icon: faAt,
        color: "#8b5cf6",
        bgColor: theme === "light" ? "#ede9fe" : "#4c1d95",
        text: getLabel("notificacion_mencion_comentario"),
        action: "comment",
        emoji: "💬@",
      },
      [NotifyType.MESSAGE]: {
        icon: faMessage,
        color: "#06b6d4",
        bgColor: theme === "light" ? "#cffafe" : "#164e63",
        text: getLabel("notificacion_mensaje"),
        action: "message",
        emoji: "✉️",
      },
      // Tipo por defecto
      default: {
        icon: faHistory,
        color: "#6b7280",
        bgColor: theme === "light" ? "#f3f4f6" : "#374151",
        text: getLabel("notificacion_generica"),
        action: "default",
        emoji: "🔔",
      },
    };

    const getConfig = (type: string) => {
      return (
        notificationTypeConfig[type as keyof typeof notificationTypeConfig] ||
        notificationTypeConfig.default
      );
    };

    const config = getConfig(notification.type || "");
    const isLikeType = notification.type?.includes("LIKE");
    const isMentionType = notification.type?.includes("MENTION");

    // Determinar si se necesita imagen de contenido
    const needsContentImage = ![
      NotifyType.FOLLOW,
      NotifyType.MESSAGE,
      NotifyType.COMENT_MENTION,
    ].includes(notification.type as any);

    // Cargar imágenes
    useEffect(() => {
      const loadImages = async () => {
        setIsLoading(true);
        try {
          const promises = [];

          // Cargar imagen de perfil
          if (notification.idMediaDataProfile) {
            promises.push(
              searchImage(notification.idMediaDataProfile).then(
                (img) => img?.Value || UserProfilePlaceholder
              )
            );
          } else {
            promises.push(Promise.resolve(UserProfilePlaceholder));
          }

          // Cargar imagen de contenido si es necesario
          if (needsContentImage && notification.idMediaData) {
            promises.push(
              searchImage(notification.idMediaData).then(
                (img) => img?.Value || ""
              )
            );
          } else {
            promises.push(Promise.resolve(""));
          }

          const [profileImg, contentImg] = await Promise.all(promises);
          setProfileImage(profileImg);
          setContentImage(contentImg);
        } catch (error) {
          console.warn("Error loading notification images:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadImages();
    }, [
      notification.idMediaDataProfile,
      notification.idMediaData,
      notification.type,
      searchImage,
      needsContentImage,
    ]);

    // Manejar clic en la notificación
    const handleClick = useCallback(() => {
      // if (!true) {
      //   onMarkAsRead(notification.id || '');
      // }

      // if (onNavigate) {
      //   onNavigate();
      //   return;
      // }

      // Navegación basada en el tipo de notificación
      switch (notification.type) {
        case NotifyType.FOLLOW:
          if (notification.username) {
            navigate(`/${notification.username}`);
          }
          break;

        case NotifyType.MESSAGE:
          if (notification.username) {
            navigate(`/direct/${notification.username}`);
          }
          break;

        case NotifyType.HISTORY_LIKE:
        case NotifyType.HISTORY_MENTION:
          if (notification.idItem) {
            navigate(`/story/${notification.idItem}`);
          }
          break;

        case NotifyType.COMENT:
        case NotifyType.COMENT_LIKE:
        case NotifyType.COMENT_MENTION:
          if (notification.idItem) {
            navigate(`/publication/${notification.idItem}?comment=true`);
          }
          break;

        case NotifyType.PUBLICATION_LIKE:
        case NotifyType.PUBLICATION_MENTION:
        default:
          if (notification.idItem) {
            console.log("Hola");

            navigate(`/publication/${notification.idItem}`);
          }
          break;
      }
    }, [notification, onMarkAsRead, navigate]);

    // Manejar eliminación
    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(notification.id || "");
      },
      [notification.id, onDelete]
    );

    // Skeleton loader
    if (isLoading) {
      return (
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            backgroundColor: theme === "light" ? "#ffffff" : "#1a1a1a",
            borderBottom: `1px solid ${
              theme === "light" ? "#f3f4f6" : "#374151"
            }`,
          }}
        >
          {/* Avatar skeleton */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: theme === "light" ? "#f3f4f6" : "#374151",
              animation: "pulse 1.5s infinite",
            }}
          />

          {/* Contenido skeleton */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: "120px",
                height: "14px",
                backgroundColor: theme === "light" ? "#f3f4f6" : "#374151",
                borderRadius: "7px",
                marginBottom: "8px",
                animation: "pulse 1.5s infinite 0.2s",
              }}
            />
            <div
              style={{
                width: "200px",
                height: "12px",
                backgroundColor: theme === "light" ? "#f3f4f6" : "#374151",
                borderRadius: "6px",
                marginBottom: "6px",
                animation: "pulse 1.5s infinite 0.4s",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "10px",
                backgroundColor: theme === "light" ? "#f3f4f6" : "#374151",
                borderRadius: "5px",
                animation: "pulse 1.5s infinite 0.6s",
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => {
          if (notification.type == NotifyType.FOLLOW) {
            navigate(`/${notification.username}`);
          } else {
            navigate(`/publication/${notification.idItem}`);
          }
          onClose();
          // setRead(item.id);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          gap: "16px",
          backgroundColor: true
            ? theme === "light"
              ? "#ffffff"
              : "#1a1a1a"
            : theme === "light"
            ? "#f0f9ff"
            : "#1e293b",
          borderBottom: `1px solid ${
            theme === "light" ? "#f3f4f6" : "#374151"
          }`,
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          transform: isHovered ? "translateX(4px)" : "translateX(0)",
          boxShadow: isHovered
            ? `0 4px 12px ${
                theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.2)"
              }`
            : "none",
        }}
      >
        {/* Indicador de estado no leído */}
        {!true && (
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              bottom: "0",
              width: "4px",
              backgroundColor: Colors.detailAppColor,
              borderTopRightRadius: "2px",
              borderBottomRightRadius: "2px",
              animation: "pulse 2s infinite",
            }}
          />
        )}

        {/* Avatar con badge de tipo */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              border: `3px solid ${theme === "light" ? "#ffffff" : "#1a1a1a"}`,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src={profileImage}
              alt={notification.username || "Usuario"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: true ? "none" : "brightness(1.05)",
              }}
            />
          </div>

          {/* Badge de tipo de notificación */}
          <div
            style={{
              position: "absolute",
              bottom: "-4px",
              right: "-4px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: config.bgColor,
              border: `2px solid ${theme === "light" ? "#ffffff" : "#1a1a1a"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: config.color,
              fontSize: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <FontAwesomeIcon icon={config.icon} />
          </div>
        </div>

        {/* Contenido de la notificación */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <strong
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: theme === "light" ? "#111827" : "#f9fafb",
                lineHeight: 1.2,
              }}
            >
              {notification.username || "Usuario"}
            </strong>

            {/* Badge de verificado */}
            {/* {notification.verify === 1 && (
            <span style={{
              fontSize: "10px",
              fontWeight: 600,
              color: Colors.detailAppColor,
              backgroundColor: theme === "light" ? "#dbeafe" : "#1e3a8a",
              padding: "2px 6px",
              borderRadius: "10px",
            }}>
              ✓ Verificado
            </span>
          )} */}

            {/* Badge para menciones */}
            {isMentionType && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#8b5cf6",
                  backgroundColor: theme === "light" ? "#ede9fe" : "#4c1d95",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                @
              </span>
            )}
          </div>

          {/* Texto de la notificación */}
          <p
            style={{
              fontSize: "13px",
              color: theme === "light" ? "#6b7280" : "#9ca3af",
              margin: "6px 0",
              lineHeight: 1.4,
              wordBreak: "break-word",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "14px" }}>{config.emoji}</span>
            <span>{config.text}</span>

            {/* Mensaje específico si existe */}
            {notification.message && (
              <span
                style={{
                  fontStyle: "italic",
                  color: theme === "light" ? "#9ca3af" : "#6b7280",
                  marginLeft: "4px",
                  display: "block",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                "{notification.message}"
              </span>
            )}
          </p>

          {/* Información adicional */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {/* Timestamp */}
            <time
              style={{
                fontSize: "11px",
                color: theme === "light" ? "#9ca3af" : "#6b7280",
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              {notification.createDate
                ? getElapsedTime(new Date(notification.createDate!))
                : "Recientemente"}
            </time>

            {/* Badge de "Nuevo" */}
            {!true && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: Colors.detailAppColor,
                  backgroundColor: theme === "light" ? "#dbeafe" : "#1e3a8a",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  animation: "pulse 1.5s infinite",
                }}
              >
                Nuevo
              </span>
            )}
          </div>
        </div>

        {/* Vista previa del contenido (si aplica) */}
        {contentImage && needsContentImage && (
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              overflow: "hidden",
              flexShrink: 0,
              border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
              position: "relative",
              background: theme === "light" ? "#f3f4f6" : "#374151",
            }}
          >
            <img
              src={contentImage}
              alt="Contenido"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `
                <div style="
                  width: 100%; 
                  height: 100%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  color: ${theme === "light" ? "#9ca3af" : "#6b7280"};
                  font-size: 20px;
                ">
                  ${config.emoji}
                </div>
              `;
              }}
            />
          </div>
        )}

        {/* Para notificaciones sin imagen de contenido, mostrar icono del tipo */}
        {!contentImage && !needsContentImage && (
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              backgroundColor: config.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: config.color,
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            {config.emoji}
          </div>
        )}

        {/* Botón de acciones */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            opacity: isHovered ? 1 : 0.3,
            transition: "all 0.2s ease",
          }}
        >
          {/* Botón de eliminar */}
          <button
            onClick={handleDelete}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: theme === "light" ? "#f3f4f6" : "#374151",
              border: "none",
              color: theme === "light" ? "#9ca3af" : "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f3f4f6" : "#374151";
              e.currentTarget.style.color =
                theme === "light" ? "#9ca3af" : "#6b7280";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>

          {/* Botón de marcar como leída (solo si no está leída) */}
          {!true && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id || "");
              }}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: theme === "light" ? "#f3f4f6" : "#374151",
                border: "none",
                color: Colors.detailAppColor,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = Colors.detailAppColor;
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme === "light" ? "#f3f4f6" : "#374151";
                e.currentTarget.style.color = Colors.detailAppColor;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
          )}
        </div>

        {/* Estilos de animación */}
        <style>
          {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}
        </style>
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
