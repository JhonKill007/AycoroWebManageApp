// components/MobileNavigation.tsx
import {
  faBell,
  faGear,
  faHome,
  faMoon,
  faPaperPlane,
  faPlus,
  faPlusSquare,
  faRightFromBracket,
  faRocket,
  faSearch,
  faSun,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Colors } from "../../constants/Colors";
import { aspectRatioType } from "../../constants/Types";
import { useThemeContext } from "../../context/ThemeContext";
import { useUserContext } from "../../context/UserContext";
import useLanguage from "../../hooks/useLanguage";
import { NotificationModel } from "../../Models/Notification/NotificationModel";
import notificationService from "../../Services/Notification/NotificationService";
import userService from "../../Services/User/UserService";
import NotificationsModal from "../Modals/NotificationsModal";

interface MobileNavigationProps {
  search: string;
  setSearch: Function;
  setUsers: Function;
  setSearchVisible: Function;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  search,
  setSearch,
  setUsers,
  setSearchVisible,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, removeUser } = useUserContext();
  const { theme, setThemes } = useThemeContext();
  const { getLabel } = useLanguage();

  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const createPostRef = useRef<HTMLDivElement>(null);

  const [isCreatePostModalOpen, setIsCreatePostModalOpen] =
    useState<boolean>(false);

  const [noticationsCount, setNoticationsCount] = useState<number>(0);
  const [notifications, setnotifications] = useState<NotificationModel[]>([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [aspectRatio, setAspectRatio] = useState<number>();

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setMobile(mobile);
      // if (!mobile) {
      //   setShowMobileMenu(false);
      // }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createPostRef.current &&
        !createPostRef.current.contains(event.target as Node)
      ) {
        setIsCreatePostModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getNotificationsCount();
    getNotifications(1);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setSelectedFile(null);
    setIsEditorOpen(false);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemes(newTheme);
  };

  const handleLogout = () => {
    removeUser();
  };

  const Search = (e: string) => {
    if (e !== undefined && e !== "") {
      setSearchVisible(true);
      userService
        .SearchUser(e, 1)
        .then((res: any) => {
          setUsers(res.data);
        })
        .catch((res: any) => {
          console.error(res);
        });
    } else {
      setSearchVisible(false);
    }
  };

  const getNotificationsCount = () => {
    notificationService
      .GetUnreadNotificationCount()
      .then((e: any) => {
        setNoticationsCount(e.data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const setNotificationsRead = () => {
    notificationService
      .SetNotificationRead()
      .then((e: any) => {
        setNoticationsCount(0);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const getNotifications = (section: number) => {
    notificationService
      .GetAll(section)
      .then((e: any) => {
        setnotifications((prevNotify) => [...e.data, ...prevNotify]);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const navigationItems = [
    { icon: faHome, label: "Inicio", active: true, rute: "/" },
    { icon: faRocket, label: "Servicios", active: false, rute: "/services" },
    { icon: faSearch, label: "Explorar", active: false, rute: "/explorer" },
    { icon: faPaperPlane, label: "Mensajes", active: false, rute: "/inbox" },
    { icon: faBell, label: "Notificaciones", active: false },
    { icon: faPlusSquare, label: "Crear", active: false },
  ];

  const userMenuItems = [
    {
      icon: faUser,
      label: getLabel("perfil"),
      action: () => navigate(`/${userData?.user?.username}`),
    },
    {
      icon: theme === "light" ? faMoon : faSun,
      label: `${
        theme === "light" ? getLabel("modo_oscuro") : getLabel("modo_claro")
      }`,
      action: handleThemeToggle,
    },
    {
      icon: faGear,
      label: getLabel("configuracion"),
      action: () => navigate(`/settings`),
    },
    {
      icon: faRightFromBracket,
      label: getLabel("salir"),
      action: handleLogout,
      isDanger: true,
    },
  ];

  const UploadMenuItems = [
    {
      icon: faPlusSquare,
      label: getLabel("subir_publicacion"),
      action: () => {
        fileInputRef.current?.click();
        setAspectRatio(aspectRatioType.PUBLICATION);
      },
    },
    {
      icon: faPlus,
      label: getLabel("subir_historia"),
      action: () => {
        fileInputRef.current?.click();
        setAspectRatio(aspectRatioType.HISTORY);
      },
    },
  ];

  if (!mobile) return null;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: mobile ? "50px" : "60px",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        borderTop: `1px solid ${
          theme === "light"
            ? Colors.light.colors.border
            : Colors.dark.colors.border
        }`,
        display: "flex",
        alignItems: "center",
        justifyContent: mobile ? "space-around" : "space-between",
        padding: mobile ? "0 10px" : "0 20px",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        // accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      {/* Iconos de Navegación y Usuario */}
      <div
        style={{
          flex: mobile ? 1 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: mobile ? "15px" : "20px",
        }}
      >
        {/* Iconos de Navegación */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: mobile ? "15px" : "20px",
          }}
        >
          {navigationItems.map((item, index) => {
            const showNotification =
              item.label === "Notificaciones" && noticationsCount > 0;

            if (
              mobile &&
              ![
                "Inicio",
                "Explorar",
                "Servicios",
                "Crear",
                "Mensajes",
              ].includes(item.label)
            ) {
              return null;
            }

            return item.label == "Crear" ? (
              <div ref={createPostRef} style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    if (item.rute) {
                      navigate(`${item.rute}`);
                    }
                    if (item.label == "Crear") {
                      setIsCreatePostModalOpen(!isCreatePostModalOpen);
                    }
                    if (item.label == "Notificaciones") {
                      setIsNotificationModalOpen(true);
                    }
                  }}
                  key={index}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color:
                      location.pathname == item.rute
                        ? Colors.detailAppColor
                        : "#888",
                    fontSize: mobile ? "18px" : "20px",
                    position: "relative",
                    transition: "all 0.3s ease",
                    padding: "20px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <FontAwesomeIcon icon={item.icon} />

                    {/* Badge de notificaciones */}
                    {showNotification && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          minWidth: noticationsCount > 9 ? "18px" : "16px",
                          height: mobile ? "16px" : "18px",
                          backgroundColor:
                            noticationsCount > 0 ? "#ff4757" : "#6c757d",
                          color: "white",
                          borderRadius: "8px",
                          fontSize: mobile ? "9px" : "10px",
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                          border: "2px solid white",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
                          zIndex: 10,
                          fontFamily: "'Segoe UI', sans-serif",
                          letterSpacing: "-0.5px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {noticationsCount > 99 ? "99+" : noticationsCount}
                      </div>
                    )}
                  </div>

                  {/* Indicador activo */}
                  {location.pathname == item.rute && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: mobile ? "4px" : "6px",
                        height: mobile ? "4px" : "6px",
                        borderRadius: "50%",
                        backgroundColor: Colors.detailAppColor,
                        boxShadow: `0 0 8px ${Colors.detailAppColor}`,
                      }}
                    />
                  )}
                </button>

                {isCreatePostModalOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-115px",
                      left: -150,
                      marginTop: "8px",
                      width: "220px",
                      backgroundColor: theme === "light" ? "white" : "#2a2a2a",
                      border: `1px solid ${
                        theme === "light" ? "#dbdbdb" : "#333"
                      }`,
                      borderRadius: "12px",
                      boxShadow:
                        theme === "light"
                          ? "0 8px 24px rgba(0,0,0,0.15)"
                          : "0 8px 24px rgba(0,0,0,0.4)",
                      overflow: "hidden",
                      zIndex: 1001,
                      animation: "slideDown 0.2s ease",
                    }}
                  >
                    {/* Opciones del Menú */}
                    <div style={{ padding: "8px 0" }}>
                      {UploadMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            item.action();
                            setIsCreatePostModalOpen(false);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: theme === "light" ? "#333" : "white",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              theme === "light" ? "#f8f9fa" : "#333";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            style={{
                              width: "16px",
                              color: theme === "light" ? "#666" : "#888",
                            }}
                          />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (item.rute) {
                    navigate(`${item.rute}`);
                  }
                  if (item.label == "Notificaciones") {
                    setIsNotificationModalOpen(true);
                  }
                }}
                key={index}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color:
                    location.pathname == item.rute
                      ? Colors.detailAppColor
                      : "#888",
                  fontSize: mobile ? "18px" : "20px",
                  position: "relative",
                  transition: "all 0.3s ease",
                  padding: "20px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
                  <FontAwesomeIcon icon={item.icon} />

                  {/* Badge de notificaciones */}
                  {showNotification && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        minWidth: noticationsCount > 9 ? "18px" : "16px",
                        height: mobile ? "16px" : "18px",
                        backgroundColor:
                          noticationsCount > 0 ? "#ff4757" : "#6c757d",
                        color: "white",
                        borderRadius: "8px",
                        fontSize: mobile ? "9px" : "10px",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        border: "2px solid white",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
                        zIndex: 10,
                        fontFamily: "'Segoe UI', sans-serif",
                        letterSpacing: "-0.5px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {noticationsCount > 99 ? "99+" : noticationsCount}
                    </div>
                  )}
                </div>

                {/* Indicador activo */}
                {location.pathname == item.rute && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: mobile ? "4px" : "6px",
                      height: mobile ? "4px" : "6px",
                      borderRadius: "50%",
                      backgroundColor: Colors.detailAppColor,
                      boxShadow: `0 0 8px ${Colors.detailAppColor}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>
        {`
          @keyframes slideDown {
              from {
                  opacity: 0;
                  transform: translateY(-10px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
          }
        `}
      </style>

      <NotificationsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={() => {}}
        onDeleteNotification={() => {}}
        onMarkAllAsRead={() => {}}
      />
    </nav>
  );
};

export default MobileNavigation;
