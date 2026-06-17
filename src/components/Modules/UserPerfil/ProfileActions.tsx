import {
  faCheck,
  faEllipsis,
  faEnvelope,
  faUserCheck,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useThemeContext } from "../../context/ThemeContext";

interface ProfileActionsProps {
  isFollowing: boolean;
  isPrivate: boolean;
  hasPendingRequest?: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onMessage: () => void;
  onMoreOptions: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isFollowing,
  isPrivate,
  hasPendingRequest = false,
  onFollow,
  onUnfollow,
  onMessage,
  onMoreOptions,
}) => {
  const { theme } = useThemeContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Botón de Seguir
  const FollowButton = () => (
    <button
      onClick={onFollow}
      style={{
        backgroundColor: "#0095f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#007acc";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#0095f6";
      }}
    >
      <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: "12px" }} />
      Seguir
    </button>
  );

  // Botón de Solicitud Enviada
  const RequestedButton = () => (
    <button
      style={{
        backgroundColor: "transparent",
        color: theme === "light" ? "#262626" : "white",
        border: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
        borderRadius: "8px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.3s ease",
      }}
      disabled
    >
      <FontAwesomeIcon icon={faCheck} style={{ fontSize: "12px" }} />
      Solicitud enviada
    </button>
  );

  // Botón de Siguiendo
  const FollowingButton = () => (
    <button
      onClick={onUnfollow}
      style={{
        backgroundColor: "transparent",
        color: theme === "light" ? "#262626" : "white",
        border: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
        borderRadius: "8px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.3s ease",
      }}
    >
      <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: "12px" }} />
      Siguiendo
    </button>
  );

  // Botón de Mensaje
  const MessageButton = () => (
    <button
      onClick={onMessage}
      style={{
        backgroundColor: "transparent",
        color: theme === "light" ? "#262626" : "white",
        border: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
        borderRadius: "8px",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
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
      <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "12px" }} />
      Mensaje
    </button>
  );

  // Botón de Más opciones
  const MoreOptionsButton = () => (
    <button
      onClick={onMoreOptions}
      style={{
        backgroundColor: "transparent",
        color: theme === "light" ? "#262626" : "white",
        border: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
      <FontAwesomeIcon icon={faEllipsis} style={{ fontSize: "14px" }} />
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "20px",

        justifyContent: isMobile ? "center" : undefined,
      }}
    >
      {/* Estado de seguimiento */}
      {hasPendingRequest && <RequestedButton />}
      {!hasPendingRequest && !isFollowing && <FollowButton />}
      {!hasPendingRequest && isFollowing && <FollowingButton />}

      {/* Botón de mensaje */}
      <MessageButton />

      {/* Botón de más opciones */}
      <MoreOptionsButton />
    </div>
  );
};

export default ProfileActions;
