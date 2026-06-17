import {
  faCalendarAlt,
  faCamera,
  faCircleCheck,
  faCog,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../assets/UserProfile.jpeg";
import { Colors } from "../../constants/Colors";
import { VerificationStatus } from "../../constants/Status";
import { useThemeContext } from "../../context/ThemeContext";
import { useUserContext } from "../../context/UserContext";
import useLanguage from "../../hooks/useLanguage";
import { AycoroAuthUserPerfilModel } from "../../Models/User/AycoroAuthUserPerfilModel";
import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
import changesService from "../../Services/Changes/ChangesService";
import FollowModal from "../Modals/FollowModal";
import Notify from "../Notify/Notify";
import ProfileActions from "./ProfileActions";
import "./UserPerfil.css";

interface IUserPerfil {
  user: UserPerfilModel;
  setFollow: (id: string, action: boolean) => void;
}

const UserPerfil = ({ user, setFollow }: IUserPerfil) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { userData, updateUser } = useUserContext();
  const { getLabel } = useLanguage();
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);
  const [presentacion, setPresentation] = useState<string | undefined>(
    userData?.user?.perfilData?.presentation!
  );

  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const ImageRef = React.createRef<HTMLInputElement>();
  const [image, setImage] = useState<any>(null);

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // const handlePress = (url: string) => {
  //   Linking.openURL(url);
  // };

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">(
    "followers"
  );
  const [modalUsers, setModalUsers] = useState<any[]>([]);

  const presentation =
    user?.User?.PerfilData?.Presentation! &&
    user?.User?.PerfilData?.Presentation!.trim() !== ""
      ? user?.User?.PerfilData?.Presentation!.split(urlRegex)
      : "ghost presentation".split(urlRegex);

  useEffect(() => {
    // Cambiar el título de la página cuando el componente se monta
    document.title = `${user?.User?.Name} (${user?.User?.Username})`;

    // También puedes restablecer el título cuando el componente se desmonta
    return () => {
      document.title = `${process.env.REACT_APP_TITTLE_BASE}`;
    };
  }, []);

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openFollowersModal = () => {
    setModalType("followers");
    setIsModalOpen(true);
  };

  const openFollowingModal = () => {
    setModalType("following");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalUsers([]);
  };

  const OnImageChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setInputValue(e.target.value);
      var img = e.target.files[0];
      setImage(img);
    }
  };

  // Función para formatear números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const changePresentation = () => {
    changesService
      .Presentation(presentacion!)
      .then((e: any) => {
        if (e.status === 200) {
          const updatedUser: AycoroAuthUserPerfilModel = {
            ...userData!,
            user: {
              ...userData?.user!,
              perfilData: {
                ...userData?.user?.perfilData!,
                presentation: presentacion,
              },
            },
          };
          updateUser(updatedUser);
          Notify(e.data, "La presentacion");
        } else {
          Notify(e.data, "La presentacion");
        }
        setIsEditing(false);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "24px" : "60px",
          marginBottom: isMobile ? "32px" : "44px",
          padding: isMobile ? "0 16px" : "0 20px",
        }}
      >
        {/* Foto de perfil */}
        <div
          style={{
            position: "relative",
            flexShrink: 0,
            width: isMobile ? 80 : 150,
            height: isMobile ? 80 : 150,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #0095f6",
            alignSelf: isMobile ? "center" : "flex-start",
            cursor:
              user?.User?._id === userData?.user?.id ? "pointer" : "default",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        >
          {/* Input oculto */}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={ImageRef}
            value={inputValue}
            onChange={OnImageChange}
          />

          {/* Imagen de perfil */}
          {userData?.user?.id == user.User?._id ? (
            <img
              src={userData?.profilePhoto || UserProfile}
              alt="Foto de perfil"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 0.3s ease",
              }}
            />
          ) : (
            <img
              src={user.ProfilePhoto || UserProfile}
              alt="Foto de perfil"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 0.3s ease",
              }}
            />
          )}

          {/* Overlay al pasar el mouse */}
          {isHoveringImage && user.User?._id == userData?.user?.id && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "opacity 0.3s ease",
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (user?.User?._id === userData?.user?.id) {
                    setAspectRatio(1);
                    ImageRef.current?.click();
                  }
                }}
                style={{
                  background: "#0095f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 50,
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.background = "#0095f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "#0095f6";
                }}
              >
                <FontAwesomeIcon
                  style={{
                    color: theme === "light" ? "white" : "#1a1a1a",
                    fontSize: "15px",
                  }}
                  icon={faCamera}
                />
              </button>
            </div>
          )}
        </div>

        {/* Información del usuario */}
        <div
          style={{
            flex: 1,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {/* Nombre y acciones */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "flex-start",
              gap: isMobile ? "16px" : "20px",
              marginBottom: isMobile ? "16px" : "20px",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? "22px" : "28px",
                fontWeight: "300",
                color: theme === "light" ? "#262626" : "white",
              }}
            >
              {user.User?.Username}
            </h1>
            <div style={{ width: 15, marginLeft: -15, marginTop: 5 }}>
              {user.User?.Verify == VerificationStatus.VERIFIED && (
                <FontAwesomeIcon
                  style={{
                    color: "#089aff",
                    fontSize: "15px",
                  }}
                  icon={faCircleCheck}
                />
              )}
            </div>
            {userData?.user?.id === user.User?._id && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    flex: isMobile ? 1 : "none",
                    padding: isMobile ? "10px 16px" : "8px 16px",
                    backgroundColor: theme === "light" ? "white" : "#1a1a1a",
                    border: `1px solid ${
                      theme === "light" ? "#e0e0e0" : "#333"
                    }`,
                    borderRadius: "8px",
                    fontSize: isMobile ? "14px" : "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    color: theme === "light" ? "#262626" : "white",
                  }}
                >
                  {getLabel("editar_perfil")}
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  style={{
                    padding: isMobile ? "10px 16px" : "8px 16px",
                    backgroundColor: theme === "light" ? "white" : "#1a1a1a",
                    border: `1px solid ${
                      theme === "light" ? "#e0e0e0" : "#333"
                    }`,
                    borderRadius: "8px",
                    fontSize: isMobile ? "14px" : "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    color: theme === "light" ? "#262626" : "white",
                    display: isMobile ? "flex" : "none",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesomeIcon icon={faCog} />
                </button>
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: theme === "light" ? "white" : "#1a1a1a",
                    border: `1px solid ${
                      theme === "light" ? "#e0e0e0" : "#333"
                    }`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    color: theme === "light" ? "#262626" : "white",
                    display: isMobile ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => navigate("/settings")}
                >
                  <FontAwesomeIcon icon={faCog} />
                </button>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div
            style={{
              display: "flex",
              gap: isMobile ? "20px" : "40px",
              marginBottom: isMobile ? "16px" : "20px",
              justifyContent: isMobile ? "space-around" : "flex-start",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: "600",
                  color: theme === "light" ? "#262626" : "white",
                }}
              >
                {formatNumber(user.Posts!)}
              </span>
              <div
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  color: "#8e8e8e",
                }}
              >
                {getLabel("publicaciones")}
              </div>
            </div>
            <div
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => openFollowersModal()}
            >
              <span
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: "600",
                  color: theme === "light" ? "#262626" : "white",
                }}
              >
                {formatNumber(user.Followers!)}
              </span>
              <div
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  color: "#8e8e8e",
                }}
              >
                {getLabel("seguidores")}
              </div>
            </div>
            <div
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => openFollowingModal()}
            >
              <span
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: "600",
                  color: theme === "light" ? "#262626" : "white",
                }}
              >
                {formatNumber(user.Followings!)}
              </span>
              <div
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  color: "#8e8e8e",
                }}
              >
                {getLabel("siguiendo")}
              </div>
            </div>
          </div>

          {/* Biografía e información */}
          <div
            style={{
              marginBottom: "16px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: isMobile ? "20px" : "25px",
                fontWeight: "600",
                color: theme === "light" ? "#262626" : "white",
              }}
            >
              {user.User?.Name}
            </h2>
            <div
              style={{
                width: isMobile ? 400 : 700,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                margin: isMobile ? "auto" : undefined,
              }}
            >
              <span
                style={{
                  margin: "0 0 12px 0",
                  fontSize: isMobile ? "13px" : "14px",
                  color: theme === "light" ? "#262626" : "white",
                  lineHeight: "1.4",
                }}
              >
                {presentation}
              </span>
            </div>

            {/* Webside */}
            {/* {currentUser.website && ( */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "6px",
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <FontAwesomeIcon
                icon={faLink}
                style={{ fontSize: "12px", color: "#8e8e8e" }}
              />
              <a
                // href={`https://${currentUser.website}`}
                href={`https://aycoro.com`}
                style={{
                  fontSize: isMobile ? "13px" : "14px",
                  color: "#0095f6",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                https://aycoro.com
                {/* {currentUser.website} */}
              </a>
            </div>
            {/* )} */}

            {/* {currentUser.location && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "6px",
                  justifyContent: isMobile ? "center" : "flex-start",
                }}
              >
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  style={{ fontSize: "12px", color: "#8e8e8e" }}
                />
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#262626",
                  }}
                >
                  {currentUser.location}
                </span>
              </div>
            )} */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <FontAwesomeIcon
                icon={faCalendarAlt}
                style={{ fontSize: "12px", color: "#8e8e8e" }}
              />
              <span
                style={{
                  fontSize: isMobile ? "13px" : "14px",
                  color: theme === "light" ? "#262626" : "white",
                }}
              >
                Se unió en Enero 2023
                {/* {currentUser.joinDate} */}
              </span>
            </div>

            {user.User?._id != userData?.user!.id && (
              <ProfileActions
                isFollowing={true}
                isPrivate={false}
                hasPendingRequest={false}
                onFollow={() => {
                  setFollow(user.User?._id!, true);
                }}
                onUnfollow={() => {
                  setFollow(user.User?._id!, false);
                }}
                onMessage={() => {
                  navigate(`/Inbox/${user?.User?.Username}`);
                }}
                onMoreOptions={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edición de Perfil */}
      {isEditing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.76)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "20px",
          }}
        >
          <div
            style={{
              backgroundColor:
                theme === "light"
                  ? Colors.light.colors.background
                  : Colors.dark.colors.background,
              borderRadius: "12px",
              padding: isMobile ? "20px" : "24px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: `1px solid ${
                theme === "light"
                  ? Colors.light.colors.border
                  : Colors.dark.colors.border
              }`,
            }}
          >
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: isMobile ? "18px" : "20px",
                fontWeight: "600",
                textAlign: "center",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
              }}
            >
              {getLabel("editar_perfil")}
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                {getLabel("presentacion")}
              </label>
              <textarea
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${
                    theme === "light"
                      ? Colors.light.colors.border
                      : Colors.dark.colors.border
                  }`,
                  backgroundColor:
                    theme === "light"
                      ? Colors.light.colors.inputBackground
                      : Colors.dark.colors.inputBackground,
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                placeholder={getLabel("presentacion")}
                value={presentacion}
                onChange={(e: any) => {
                  setPresentation(e.target.value);
                }}
                maxLength={200}
                rows={4}
                onFocus={(e: any) => {
                  e.target.style.backgroundColor =
                    theme === "light"
                      ? Colors.light.colors.inputActiveBackground
                      : Colors.dark.colors.inputActiveBackground;
                  e.target.style.borderColor = Colors.detailAppColor;
                }}
                onBlur={(e: any) => {
                  e.target.style.backgroundColor =
                    theme === "light"
                      ? Colors.light.colors.inputBackground
                      : Colors.dark.colors.inputBackground;
                  e.target.style.borderColor =
                    theme === "light"
                      ? Colors.light.colors.inputBorder
                      : Colors.dark.colors.inputBorder;
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor:
                    theme === "light"
                      ? Colors.light.colors.background
                      : Colors.dark.colors.background,
                  border: `1px solid ${
                    theme === "light"
                      ? Colors.light.colors.border
                      : Colors.dark.colors.border
                  }`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                {getLabel("cancelar")}
              </button>
              <button
                onClick={changePresentation}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0095f6",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                {getLabel("guardar")}
              </button>
            </div>
          </div>
        </div>
      )}

      <FollowModal
        isOpen={isModalOpen}
        onClose={closeModal}
        type={modalType}
        user={user}
        setFollow={setFollow}
      />
    </>
  );
};

export default UserPerfil;
