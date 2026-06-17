import React, { useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";

// Tipos para las props
interface NavbarProps {
  usuario?: {
    nombre: string;
    username: string;
    avatar: string;
    rol: "admin" | "moderador" | "superadmin";
    notificacionesNoLeidas: number;
  };
  onNavigate?: (seccion: string) => void;
  seccionActiva?: string;
}

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
  submenu?: MenuItem[];
};

const Navbar: React.FC<NavbarProps> = ({
  usuario = {
    nombre: "Admin Aycoro",
    username: "@admin",
    avatar: "https://i.pravatar.cc/150?u=admin",
    rol: "superadmin",
    notificacionesNoLeidas: 5,
  },
  onNavigate,
  seccionActiva = "dashboard",
}) => {
  const { theme, setThemes } = useThemeContext();
  const isDark = theme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);

  // Items del menú principal
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      href: "/dashboard",
    },
    {
      id: "mapa",
      label: "Mapa de Servicios",
      icon: "🗺️",
      href: "/mapa",
    },
    {
      id: "reportes",
      label: "Bandeja de Reportes",
      icon: "🚨",
      badge: 12,
      href: "/reportes",
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: "👥",
      submenu: [
        {
          id: "lista-usuarios",
          label: "Lista de Usuarios",
          icon: "📋",
          href: "/usuarios/lista",
        },
        {
          id: "usuarios-reportados",
          label: "Reportados",
          icon: "⚠️",
          badge: 3,
          href: "/usuarios/reportados",
        },
        {
          id: "usuarios-baneados",
          label: "Baneados",
          icon: "🔨",
          href: "/usuarios/baneados",
        },
        {
          id: "verificaciones",
          label: "Solicitudes Verificación",
          icon: "✓",
          badge: 7,
          href: "/usuarios/verificaciones",
        },
      ],
    },
    {
      id: "contenido",
      label: "Contenido",
      icon: "📱",
      submenu: [
        {
          id: "publicaciones",
          label: "Publicaciones",
          icon: "📝",
          href: "/contenido/publicaciones",
        },
        {
          id: "publicaciones-reportadas",
          label: "Publicaciones Reportadas",
          icon: "🚫",
          badge: 8,
          href: "/contenido/reportadas",
        },
        {
          id: "tendencias",
          label: "Tendencias",
          icon: "📈",
          href: "/contenido/tendencias",
        },
        {
          id: "hashtags",
          label: "Hashtags",
          icon: "#️⃣",
          href: "/contenido/hashtags",
        },
      ],
    },
    {
      id: "analiticas",
      label: "Analíticas",
      icon: "📈",
      submenu: [
        {
          id: "crecimiento",
          label: "Crecimiento",
          icon: "🌱",
          href: "/analiticas/crecimiento",
        },
        {
          id: "engagement",
          label: "Engagement",
          icon: "❤️",
          href: "/analiticas/engagement",
        },
        {
          id: "demografia",
          label: "Demografía",
          icon: "🌍",
          href: "/analiticas/demografia",
        },
        {
          id: "reportes-pdf",
          label: "Exportar Reportes",
          icon: "📄",
          href: "/analiticas/exportar",
        },
      ],
    },
    {
      id: "configuracion",
      label: "Configuración",
      icon: "⚙️",
      href: "/configuracion",
    },
  ];

  // Notificaciones de ejemplo
  const notificaciones = [
    {
      id: 1,
      tipo: "reporte",
      mensaje: "Nuevo reporte crítico",
      tiempo: "hace 5 min",
      leida: false,
      prioridad: "alta",
    },
    {
      id: 2,
      tipo: "usuario",
      mensaje: "Usuario reportado por acoso",
      tiempo: "hace 15 min",
      leida: false,
      prioridad: "media",
    },
    {
      id: 3,
      tipo: "sistema",
      mensaje: "Error en el servidor solucionado",
      tiempo: "hace 1 hora",
      leida: true,
      prioridad: "baja",
    },
    {
      id: 4,
      tipo: "reporte",
      mensaje: "5 nuevos reportes pendientes",
      tiempo: "hace 2 horas",
      leida: false,
      prioridad: "media",
    },
    {
      id: 5,
      tipo: "usuario",
      mensaje: "Solicitud de verificación",
      tiempo: "hace 3 horas",
      leida: false,
      prioridad: "baja",
    },
  ];

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const styles = {
    navbar: {
      backgroundColor: colors.colors.card,
      borderBottom: `1px solid ${colors.colors.border}`,
      padding: "0 24px",
      position: "sticky" as const,
      top: 0,
      zIndex: 1000,
      boxShadow: isDark
        ? "0 4px 6px rgba(0,0,0,0.3)"
        : "0 2px 4px rgba(0,0,0,0.1)",
    },
    navbarContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "70px",
      maxWidth: "1400px",
      margin: "0 auto",
    },
    logoSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logo: {
      fontSize: "28px",
      fontWeight: "bold",
      background: `linear-gradient(135deg, ${Colors.detailAppColor}, #8b5cf6)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      cursor: "pointer",
    },
    menuButton: {
      display: "none",
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: colors.colors.text,
      "@media (max-width: 768px)": {
        display: "block",
      },
    },
    navMenu: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flex: 1,
      justifyContent: "center",
      "@media (max-width: 768px)": {
        display: menuOpen ? "flex" : "none",
        position: "absolute",
        top: "70px",
        left: 0,
        right: 0,
        flexDirection: "column",
        backgroundColor: colors.colors.card,
        padding: "20px",
        borderBottom: `1px solid ${colors.colors.border}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 999,
      },
    },
    navItem: {
      position: "relative" as const,
    },
    navLink: (isActive: boolean) => ({
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "8px",
      color: isActive ? Colors.detailAppColor : colors.colors.text,
      backgroundColor: isActive
        ? isDark
          ? "rgba(107, 115, 240, 0.2)"
          : "rgba(107, 115, 240, 0.1)"
        : "transparent",
      fontSize: "14px",
      fontWeight: isActive ? "600" : "400",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "none",
      background: "none",
      width: "100%",
      textAlign: "left" as const,
      ":hover": {
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      },
    }),
    badge: {
      backgroundColor: "#ef4444",
      color: "white",
      fontSize: "11px",
      fontWeight: "600",
      padding: "2px 6px",
      borderRadius: "999px",
      marginLeft: "4px",
    },
    submenu: {
      position: "absolute" as const,
      top: "100%",
      left: 0,
      minWidth: "220px",
      backgroundColor: colors.colors.card,
      border: `1px solid ${colors.colors.border}`,
      borderRadius: "8px",
      padding: "8px 0",
      boxShadow: isDark
        ? "0 4px 6px rgba(0,0,0,0.3)"
        : "0 4px 6px rgba(0,0,0,0.1)",
      zIndex: 1001,
      "@media (max-width: 768px)": {
        position: "static",
        boxShadow: "none",
        border: "none",
        paddingLeft: "20px",
      },
    },
    submenuItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      color: colors.colors.text,
      fontSize: "13px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      border: "none",
      background: "none",
      width: "100%",
      textAlign: "left" as const,
      ":hover": {
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      },
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    iconButton: {
      background: "none",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "50%",
      color: colors.colors.text,
      position: "relative" as const,
      transition: "background-color 0.2s",
      ":hover": {
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      },
    },
    notificationBadge: {
      position: "absolute" as const,
      top: "0",
      right: "0",
      backgroundColor: "#ef4444",
      color: "white",
      fontSize: "10px",
      fontWeight: "600",
      padding: "2px 4px",
      borderRadius: "999px",
      minWidth: "16px",
      textAlign: "center" as const,
    },
    profileButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "4px 8px",
      borderRadius: "8px",
      cursor: "pointer",
      border: `1px solid ${colors.colors.border}`,
      backgroundColor: "transparent",
      color: colors.colors.text,
      transition: "all 0.2s",
      ":hover": {
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      },
    },
    profileImage: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      objectFit: "cover" as const,
    },
    dropdownMenu: {
      position: "absolute" as const,
      top: "calc(100% + 8px)",
      right: 0,
      minWidth: "280px",
      backgroundColor: colors.colors.card,
      border: `1px solid ${colors.colors.border}`,
      borderRadius: "8px",
      padding: "8px 0",
      boxShadow: isDark
        ? "0 4px 6px rgba(0,0,0,0.3)"
        : "0 4px 6px rgba(0,0,0,0.1)",
      zIndex: 1001,
    },
    notificationItem: (prioridad: string, leida: boolean) => ({
      display: "flex",
      gap: "12px",
      padding: "12px 16px",
      borderBottom: `1px solid ${colors.colors.border}`,
      backgroundColor: leida
        ? "transparent"
        : isDark
          ? "rgba(107, 115, 240, 0.1)"
          : "rgba(107, 115, 240, 0.05)",
      cursor: "pointer",
      transition: "background-color 0.2s",
      ":hover": {
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      },
    }),
    notificationDot: (prioridad: string) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor:
        prioridad === "alta"
          ? "#ef4444"
          : prioridad === "media"
            ? "#f59e0b"
            : "#10b981",
      marginTop: "6px",
    }),
    divider: {
      height: "1px",
      backgroundColor: colors.colors.border,
      margin: "8px 0",
    },
    themeToggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 16px",
      cursor: "pointer",
      color: colors.colors.text,
      ":hover": {
        backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      },
    },
  };

  const handleNavigation = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    }
    setMenuOpen(false);
    setSubmenuOpen(null);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarContainer}>
        {/* Logo y menú móvil */}
        <div style={styles.logoSection}>
          <div
            style={styles.logo}
            onClick={() => handleNavigation("dashboard")}
          >
            Aycoro
          </div>
          <button
            style={{ ...styles.iconButton, display: "none" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Menú de navegación */}
        <div style={styles.navMenu}>
          {menuItems.map((item) => (
            <div key={item.id} style={styles.navItem}>
              {item.submenu ? (
                <>
                  <button
                    style={styles.navLink(seccionActiva === item.id)}
                    onClick={() =>
                      setSubmenuOpen(submenuOpen === item.id ? null : item.id)
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span style={styles.badge}>{item.badge}</span>
                    )}
                    <span style={{ marginLeft: "auto", fontSize: "10px" }}>
                      {submenuOpen === item.id ? "▲" : "▼"}
                    </span>
                  </button>
                  {submenuOpen === item.id && (
                    <div style={styles.submenu}>
                      {item.submenu.map((sub) => (
                        <button
                          key={sub.id}
                          style={styles.submenuItem}
                          onClick={() => handleNavigation(sub.id)}
                        >
                          <span>{sub.icon}</span>
                          {sub.label}
                          {sub.badge && (
                            <span style={styles.badge}>{sub.badge}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  style={styles.navLink(seccionActiva === item.id)}
                  onClick={() => handleNavigation(item.id)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {item.badge && <span style={styles.badge}>{item.badge}</span>}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Sección derecha (notificaciones, perfil, tema) */}
        <div style={styles.rightSection}>
          {/* Notificaciones */}
          <div style={{ position: "relative" }}>
            <button
              style={styles.iconButton}
              onClick={() => setNotificacionesOpen(!notificacionesOpen)}
            >
              🔔
              {notificacionesNoLeidas > 0 && (
                <span style={styles.notificationBadge}>
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>

            {notificacionesOpen && (
              <div style={styles.dropdownMenu}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${colors.colors.border}`,
                  }}
                >
                  <span
                    style={{ fontWeight: "600", color: colors.colors.text }}
                  >
                    Notificaciones
                  </span>
                </div>
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    style={styles.notificationItem(
                      notif.prioridad,
                      notif.leida,
                    )}
                  >
                    <div style={styles.notificationDot(notif.prioridad)} />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: notif.leida ? "400" : "600",
                          color: colors.colors.text,
                        }}
                      >
                        {notif.mensaje}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: isDark ? "#9ca3af" : "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        {notif.tiempo}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "8px 16px", textAlign: "center" }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: Colors.detailAppColor,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Perfil */}
          <div style={{ position: "relative" }}>
            <button
              style={styles.profileButton}
              onClick={() => setPerfilOpen(!perfilOpen)}
            >
              <img
                src={usuario.avatar}
                alt={usuario.nombre}
                style={styles.profileImage}
              />
              <span style={{ fontSize: "14px" }}>▼</span>
            </button>

            {perfilOpen && (
              <div style={styles.dropdownMenu}>
                <div
                  style={{
                    padding: "16px",
                    borderBottom: `1px solid ${colors.colors.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={usuario.avatar}
                      alt={usuario.nombre}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                      }}
                    />
                    <div>
                      <div
                        style={{ fontWeight: "600", color: colors.colors.text }}
                      >
                        {usuario.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: isDark ? "#9ca3af" : "#6b7280",
                        }}
                      >
                        {usuario.username}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          backgroundColor: isDark ? "#2d3748" : "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          marginTop: "4px",
                          color: colors.colors.text,
                        }}
                      >
                        {usuario.rol === "superadmin"
                          ? "Super Admin"
                          : usuario.rol === "admin"
                            ? "Administrador"
                            : "Moderador"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  style={styles.submenuItem}
                  onClick={() => handleNavigation("perfil")}
                >
                  <span>👤</span> Mi Perfil
                </button>
                <button
                  style={styles.submenuItem}
                  onClick={() => handleNavigation("ajustes")}
                >
                  <span>⚙️</span> Ajustes de Cuenta
                </button>
                <button
                  style={styles.submenuItem}
                  onClick={() => handleNavigation("actividad")}
                >
                  <span>📊</span> Mi Actividad
                </button>

                <div style={styles.divider} />

                {/* Theme Toggle */}
                <div
                  style={styles.themeToggle}
                  onClick={() => {
                    const newTheme = theme === "light" ? "dark" : "light";
                    setThemes(newTheme);
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{isDark ? "☀️" : "🌙"}</span>
                    Modo {isDark ? "Claro" : "Oscuro"}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: isDark ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    {isDark ? "Activar" : "Activar"}
                  </span>
                </div>

                <div style={styles.divider} />

                <button
                  style={{ ...styles.submenuItem, color: "#ef4444" }}
                  onClick={() => handleNavigation("logout")}
                >
                  <span>🚪</span> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estilos responsive adicionales */}
      <style>
        {`
          @media (max-width: 768px) {
            button[style*="display: none"] {
              display: block !important;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
