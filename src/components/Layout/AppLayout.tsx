import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon from "../assets/icon.png";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { Permission, Permissions } from "../constants/Permissions";
import { useHubsContext } from "../context/HubsContext";
import { useThemeContext } from "../context/ThemeContext";
import { useUserContext } from "../context/UserContext";
import { usePermissions } from "../hooks/usePermissions";
import { AycoroAuthUserPerfilModel } from "../Models/User/AycoroAuthUserPerfilModel";
import initializeService from "../Services/Initialize/InitializeService";
import searchService from "../Services/Search/SearchService";
import alertService from "../Services/Alert/AlertService";

// ─── Nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS: any[] = [
  {
    section: "General",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        emoji: "🏠",
        badge: null,
        navigate: "/",
        permissions: [Permissions.VIEW_DASHBOARD],
      },
      {
        id: "analytics",
        label: "Analytics",
        emoji: "📊",
        badge: null,
        navigate: "/analytics",
        permissions: [Permissions.VIEW_ANALYTICS],
      },
      {
        id: "trends",
        label: "Tendencias",
        emoji: "🔥",
        badge: null,
        navigate: "/trends",
        permissions: [Permissions.VIEW_TRENDS],
      },
      {
        id: "reports",
        label: "Reportes",
        emoji: "📋",
        badge: null,
        navigate: "/reports",
        permissions: [Permissions.VIEW_MODERATION],
      },
      {
        id: "requests",
        label: "Solicitudes",
        emoji: "✅",
        badge: null,
        navigate: "/requests",
        permissions: [Permissions.VIEW_MODERATION],
      },
      {
        id: "moderation",
        label: "Moderación",
        emoji: "🛡️",
        badge: null,
        alert: true,
        navigate: "/moderation",
        permissions: [Permissions.VIEW_MODERATION],
      },
    ],
  },
  {
    section: "Comunidad",
    items: [
      {
        id: "users",
        label: "Usuarios",
        emoji: "👥",
        badge: null,
        navigate: "/users",
        permissions: [Permissions.VIEW_USERS],
      },
      {
        id: "publications",
        label: "Publicaciones",
        emoji: "🖼️",
        badge: null,
        navigate: "/publications",
        permissions: [Permissions.VIEW_POSTS],
      },
      {
        id: "stories",
        label: "Historias",
        emoji: "⏱️",
        badge: null,
        navigate: "/stories",
        permissions: [Permissions.VIEW_STORIES],
      },
      {
        id: "audios",
        label: "Audios",
        emoji: "🎵",
        badge: null,
        navigate: "/audios",
        permissions: [Permissions.VIEW_AUDIOS],
      },
      {
        id: "comments",
        label: "Comentarios",
        emoji: "💬",
        badge: null,
        navigate: "/comments",
        permissions: [Permissions.VIEW_COMMENTS],
      },
      {
        id: "suspenciones",
        label: "Suspensiones",
        emoji: "⛔",
        badge: null,
        navigate: "/suspenciones",
        permissions: [Permissions.VIEW_USERS],
      },
      // {
      //   id: "conversations",
      //   label: "Conversaciones",
      //   emoji: "💬",
      //   badge: null,
      //   navigate: "/conversations",
      // },
      // {
      //   id: "moderation",
      //   label: "Moderación",
      //   emoji: "🛡️",
      //   badge: "7",
      //   alert: true,
      //   navigate: "/moderation",
      // },
    ],
  },
  {
    section: "Sistema",
    items: [
      {
        id: "settings",
        label: "Configuración",
        emoji: "⚙️",
        badge: null,
        navigate: "/settings",
        permissions: [Permissions.MANAGE_SETTINGS, Permissions.MANAGE_ADMINS, Permissions.DANGER_ZONE],
      },
      {
        id: "logs",
        label: "Logs",
        emoji: "🗂️",
        badge: null,
        navigate: "/logs",
        permissions: [Permissions.VIEW_ERROR_LOGS],
      },
      {
        id: "audit",
        label: "Auditoría",
        emoji: "📝",
        badge: null,
        navigate: "/audit",
        permissions: [Permissions.VIEW_ERROR_LOGS, Permissions.MANAGE_ADMINS],
      },
      {
        id: "session-logs",
        label: "Session",
        emoji: "📱",
        badge: null,
        navigate: "/session",
        permissions: [Permissions.VIEW_SESSION_LOGS],
      },
    ],
  },
];

type AdminAlert = {
  id: string;
  type: string;
  emoji: string;
  title: string;
  body: string;
  time: string;
  path?: string;
  read: boolean;
};

type SearchHit = {
  type: string;
  emoji: string;
  label: string;
  desc: string;
  path: string;
  image?: string | null;
};

// ─── Utils ─────────────────────────────────────────────────────────────
const ALL_ITEMS = NAV_ITEMS.flatMap((s) => s.items).sort(
  (a, b) => b.navigate.length - a.navigate.length,
);

function getActiveId(pathname: string): string {
  if (pathname === "/online") return "dashboard";
  const match = ALL_ITEMS.find((item) =>
    item.navigate === "/"
      ? pathname === "/"
      : pathname === item.navigate || pathname.startsWith(item.navigate + "/"),
  );
  return match?.id ?? "dashboard";
}

function useClickOutside(ref: React.RefObject<HTMLDivElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

// ─── Panel wrapper ──────────────────────────────────────────────────────
function DropPanel({
  children,
  width = 360,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        width,
        maxWidth: "calc(100vw - 24px)",
        zIndex: 999,
        animation: "panel-drop 0.18s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </div>
  );
}

// ─── SEARCH PANEL ──────────────────────────────────────────────────────
function SearchPanel({
  c,
  searchWord,
  onNavigate,
}: {
  c: any;
  searchWord: string;
  onNavigate: (p: string) => void;
}) {
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchService.search(searchWord);
        if (!cancelled) setHits(response.data?.data || response.data || []);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchWord]);

  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
      }}
    >
      <div
        style={{ padding: "10px 16px", borderBottom: `1px solid ${c.border}` }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: c.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {searchWord ? `Resultados para "${searchWord}"` : "Accesos rápidos"}
        </span>
      </div>
      <div style={{ padding: 8, maxHeight: 360, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: c.textMuted }}>
            Buscando...
          </div>
        ) : hits.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              fontSize: 12,
              color: c.textMuted,
            }}
          >
            Sin resultados
          </div>
        ) : (
          hits.map((hit, i) => (
            <div
              key={`${hit.path}-${i}`}
              onClick={() => onNavigate(hit.path)}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = c.accentSoft)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span style={{ width: 36, height: 36, flex: "0 0 auto" }}>
                {hit.image || hit.type === "usuario" ? (
                  <img
                    src={hit.image || UserProfile}
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", display: "block", background: c.border }}
                    onError={(event) => {
                      (event.target as HTMLImageElement).src = UserProfile;
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 16 }}>{hit.emoji}</span>
                )}
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>
                  {hit.label}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted }}>{hit.desc}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS PANEL ───────────────────────────────────────────────
function NotificationsPanel({
  c,
  theme,
  notifs,
  setNotifs,
  onNavigate,
}: {
  c: any;
  theme: string;
  notifs: AdminAlert[];
  setNotifs: any;
  onNavigate: (path: string) => void;
}) {
  const unread = notifs.filter((n) => !n.read).length;
  const typeColor: Record<string, string> = {
    critica: c.danger,
    usuario: c.accent,
    reporte: c.warning,
    sistema: c.info,
    mod: c.success,
  };

  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
      }}
    >
      <div
        style={{
          padding: "16px 18px 12px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>
            🔔 Notificaciones
          </div>
          <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
            {unread > 0 ? `${unread} sin leer` : "Todo al día"}
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={() =>
              setNotifs((p: any) => p.map((n: any) => ({ ...n, read: true })))
            }
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: c.accent,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Marcar todo ✓
          </button>
        )}
      </div>

      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {notifs.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: c.textMuted }}>
            No hay alertas pendientes.
          </div>
        ) : (
          notifs.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              setNotifs((p: AdminAlert[]) =>
                p.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
              );
              if (n.path) onNavigate(n.path);
            }}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 18px",
              borderBottom: `1px solid ${c.border}`,
              background: !n.read
                ? theme === "dark"
                  ? "rgba(107,115,240,0.06)"
                  : "rgba(107,115,240,0.03)"
                : "transparent",
              cursor: "pointer",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = c.accentSoft)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = !n.read
                ? theme === "dark"
                  ? "rgba(107,115,240,0.06)"
                  : "rgba(107,115,240,0.03)"
                : "transparent")
            }
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: (typeColor[n.type] || c.accent) + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                {n.emoji}
              </div>
              {!n.read && (
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: c.accent,
                    border: `2px solid ${c.card}`,
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.text,
                  marginBottom: 2,
                }}
              >
                {n.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: c.textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {n.body}
              </div>
              <div style={{ fontSize: 10, color: c.border, marginTop: 3 }}>
                {n.time}
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      <div style={{ padding: "12px 18px", textAlign: "center" }}>
        <button
          onClick={() => onNavigate("/moderation")}
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: c.accent,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Ir a moderación →
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE MENU ──────────────────────────────────────────────────────
// ─── PROFILE MENU ──────────────────────────────────────────────────────
function ProfileMenu({
  user,
  c,
  theme,
  navigate,
  onClose,
}: {
  user: AycoroAuthUserPerfilModel;
  c: any;
  theme: string;
  navigate: any;
  onClose: () => void;
}) {
  const { removeUser } = useUserContext();
  const { canAny } = usePermissions();
  const go = (path: string) => {
    navigate(path);
    onClose();
  };
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
        width: 240,
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          background:
            theme === "dark"
              ? "linear-gradient(135deg,#1a1a30,#0f0f22)"
              : "linear-gradient(135deg,#ededff,#f5f0ff)",
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "#fff",
              boxShadow: "0 4px 14px rgba(107,115,240,0.4)",
            }}
          >
            <img
              src={user?.profilePhoto ? user?.profilePhoto : UserProfile}
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                objectFit: "cover",
                border: user?.profilePhoto
                  ? `2px solid ${Colors.detailAppColor}`
                  : undefined,
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>
              {user.user?.name}
            </div>
            <div style={{ fontSize: 10, color: c.textMuted, marginBottom: 4 }}>
              {user.user?.email}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 10,
                background: c.accentSoft,
                color: c.accent,
                border: `1px solid ${c.accentMedium}`,
              }}
            >
              {user.user?.roleName || "Manager"}
            </span>
          </div>
        </div>
      </div>
      <div style={{ padding: 8 }}>
        {[
          {
            icon: "👤",
            label: "Mi cuenta",
            sub: "Datos de este manager",
            path: "/account",
            permissions: [] as Permission[],
          },
          {
            icon: "⚙️",
            label: "Configuración",
            sub: "Managers, roles y versiones",
            path: "/settings",
            permissions: [
              Permissions.MANAGE_SETTINGS,
              Permissions.MANAGE_ADMINS,
              Permissions.DANGER_ZONE,
            ],
          },
          {
            icon: "📝",
            label: "Auditoría",
            sub: "Acciones de administradores",
            path: "/audit",
            permissions: [Permissions.VIEW_ERROR_LOGS, Permissions.MANAGE_ADMINS],
          },
          {
            icon: "🗂️",
            label: "Logs",
            sub: "Errores de la app",
            path: "/logs",
            permissions: [Permissions.VIEW_ERROR_LOGS],
          },
          {
            icon: "📱",
            label: "Session",
            sub: "Entradas a la app",
            path: "/session",
            permissions: [Permissions.VIEW_SESSION_LOGS],
          },
        ]
          .filter(
            (item) =>
              item.permissions.length === 0 || canAny(...item.permissions),
          )
          .map((item, i) => (
          <div
            key={i}
            onClick={() => go(item.path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              cursor: "pointer",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = c.accentSoft)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: c.accentSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>
                {item.label}
              </div>
              <div style={{ fontSize: 10, color: c.textMuted }}>{item.sub}</div>
            </div>
          </div>
          ))}
      </div>
      <div
        style={{ padding: "6px 8px 10px", borderTop: `1px solid ${c.border}` }}
      >
        <div
          onClick={removeUser}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            cursor: "pointer",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = c.dangerSoft)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: c.dangerSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            🚪
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.danger }}>
            Cerrar sesión
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────
export default function AycoroAdminNav() {
  const navigate = useNavigate();
  const { userData, saveUser } = useUserContext();
  const { canAny } = usePermissions();

  const { JoinApp } = useHubsContext();

  const [onlinePass, setOnlinePass] = useState<boolean>(false);

  const { pathname } = useLocation();
  const active = getActiveId(pathname);
  const { theme, setThemes } = useThemeContext();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchWord, setSearchWord] = useState<string>("");
  const [panel, setPanel] = useState<
    "search" | "notifs" | "profile" | null
  >(null);
  const [notifs, setNotifs] = useState<AdminAlert[]>([]);

  const [reports, setReports] = useState<number>(0);
  const [users, setUsers] = useState<number>(0);
  const [publications, setPublications] = useState<number>(0);
  const [conversations, setConversations] = useState<number>(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => setPanel(null), []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useClickOutside(searchRef, () => panel === "search" && closeAll());
  useClickOutside(notifsRef, () => panel === "notifs" && closeAll());
  useClickOutside(profileRef, () => panel === "profile" && closeAll());

  const toggle = (p: typeof panel) =>
    setPanel((prev) => (prev === p ? null : p));

  const unreadNotifs = notifs.filter((n) => !n.read).length;

  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const activeItem = ALL_ITEMS.find((i) => i.id === active);

  useEffect(() => {
    if (!onlinePass && userData) {
      JoinApp(userData?.user?.id!, userData?.user?.username!);
      setOnlinePass(true);
    }
  }, [JoinApp, onlinePass]);

  useEffect(() => {
    if (!userData?.user?.id!) return;
    initialize(userData?.user?.id!);
  }, [userData?.user?.id]);

  const initialize = async (id: string) => {
    const { data } = await initializeService.initialize(id);
    if (!userData?.user?.id) return;
    saveUser({
      ...userData,
      user: {
        ...userData.user!,
        role: data.role,
        roleName: data.roleName,
        permissions: data.permissions,
      },
    });
    setReports(data.reports);
    setUsers(data.users);
    setPublications(data.publications);
    setConversations(data.conversations);
    try {
      const alerts = await alertService.getAlerts();
      setNotifs(alerts.data?.data || alerts.data || []);
    } catch {
      setNotifs([]);
    }
  };

  const updatedNavItems = NAV_ITEMS.map((section) => ({
    ...section,
    items: section.items
      .filter((item: any) => canAny(...item.permissions))
      .map((item: any) => {
        if (item.id === "reports" || item.id === "moderation") {
          return {
            ...item,
            badge: reports > 0 ? String(reports) : null,
            alert: reports > 0,
          };
        }
        return item;
      }),
  })).filter((section) => section.items.length > 0);

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        background: c.background,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        transition: "background 0.3s",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:${c.border};border-radius:4px;}

        .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;cursor:pointer;user-select:none;position:relative;transition:background 0.18s,transform 0.12s;}
        .nav-item:hover{background:${c.accentSoft};transform:translateX(3px);}
        .nav-item.active{background:${c.accentMedium};box-shadow:0 2px 14px rgba(107,115,240,0.15);}
        .nav-item.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:${c.accent};border-radius:0 3px 3px 0;}

        .toggle-track{width:44px;height:24px;border-radius:12px;position:relative;cursor:pointer;background:${theme === "dark" ? c.accentMedium : c.border};border:1.5px solid ${theme === "dark" ? c.accent : c.border};transition:all 0.3s;flex-shrink:0;}
        .toggle-thumb{position:absolute;width:18px;height:18px;border-radius:50%;background:${theme === "dark" ? c.accent : "#bbb"};top:1px;left:${theme === "dark" ? "21px" : "1px"};transition:left 0.3s;box-shadow:0 2px 6px rgba(0,0,0,0.25);}

        .search-input{width:100%;background:${c.inputBackground};border:1.5px solid ${c.inputBorder};border-radius:10px;padding:8px 14px 8px 38px;font-size:13px;color:${c.text};font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:border-color 0.2s;}
        .search-input::placeholder{color:${c.textMuted};}
        .search-input:focus{border-color:${c.accent};}

        .icon-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid ${c.border};background:${c.card};display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;transition:all 0.2s;position:relative;flex-shrink:0;}
        .icon-btn:hover,.icon-btn.open{border-color:${c.accent};background:${c.accentSoft};}

        .collapse-btn{width:26px;height:26px;border-radius:8px;border:1.5px solid ${c.border};background:${c.card};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;color:${c.textMuted};transition:all 0.2s;flex-shrink:0;}
        .collapse-btn:hover{border-color:${c.accent};color:${c.accent};}

        .mobile-menu-btn{display:none;}
        .admin-main{min-width:0;}
        .admin-sidebar{will-change:transform;}

        @media (max-width: 768px){
          .mobile-menu-btn{display:flex;}
          .desktop-search{display:none !important;}
          .admin-topbar{padding:0 12px !important;gap:8px !important;}
          .admin-breadcrumb{min-width:0;flex:1;overflow:hidden;}
          .admin-breadcrumb>div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
          .admin-main>main{padding:14px !important;}
          .admin-main>main>div{max-width:100%;}
          .collapse-btn{display:none;}
        }

        @keyframes panel-drop{
          from{opacity:0;transform:translateY(-8px) scale(0.97);}
          to  {opacity:1;transform:translateY(0)    scale(1);}
        }
      `}</style>

      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 390,
            background: "rgba(2,6,23,0.62)",
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside
        className="admin-sidebar"
        style={{
          width: isMobile ? "260px" : collapsed ? "66px" : "238px",
          background: c.sidebarBg,
          borderRight: `1.5px solid ${c.border}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          flexShrink: 0,
          ...(isMobile
            ? {
                position: "fixed" as const,
                inset: "0 auto 0 0",
                zIndex: 400,
                transform: mobileMenuOpen ? "translateX(0)" : "translateX(-105%)",
                boxShadow: mobileMenuOpen ? "18px 0 50px rgba(0,0,0,.3)" : "none",
              }
            : {}),
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: "62px",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: "10px",
            borderBottom: `1.5px solid ${c.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              style={{ width: "36px", height: "36px", borderRadius: "11px" }}
              src={Icon}
              alt=""
            />
          </div>
          {(!collapsed || isMobile) && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "800",
                  color: c.text,
                  letterSpacing: "-0.02em",
                }}
              >
                Aycoro
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: c.textMuted,
                  letterSpacing: "0.08em",
                  fontWeight: "600",
                }}
              >
                ADMIN PANEL
              </div>
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav links */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "12px 8px",
          }}
        >
          {updatedNavItems.map((section) => (
            <div key={section.section} style={{ marginBottom: "8px" }}>
              {(!collapsed || isMobile) && (
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: c.textMuted,
                    padding: "0 12px",
                    marginBottom: "4px",
                    marginTop: "8px",
                  }}
                >
                  {section.section}
                </div>
              )}
              {(section.items as any[]).map((item) => (
                <div
                  key={item.id}
                  className={`nav-item${active === item.id ? " active" : ""}`}
                  onClick={() => {
                    navigate(item.navigate);
                    setMobileMenuOpen(false);
                  }}
                  title={collapsed ? item.label : ""}
                  style={{
                    justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                  }}
                >
                  <span
                    style={{ fontSize: "18px", flexShrink: 0, lineHeight: 1 }}
                  >
                    {item.emoji}
                  </span>
                  {(!collapsed || isMobile) && (
                    <>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: active === item.id ? "700" : "500",
                          color: active === item.id ? c.accent : c.text,
                          whiteSpace: "nowrap",
                          transition: "color 0.15s",
                        }}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "2px 7px",
                            borderRadius: "20px",
                            marginLeft: "auto",
                            flexShrink: 0,
                            background: item.alert
                              ? "rgba(240,79,107,0.12)"
                              : c.accentSoft,
                            color: item.alert ? c.danger : c.accent,
                            border: `1px solid ${item.alert ? "rgba(240,79,107,0.25)" : c.accentMedium}`,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && !isMobile && item.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: 7,
                        right: 7,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: item.alert ? c.danger : c.accent,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer / avatar */}
        <div
          style={{
            padding: "12px 8px",
            borderTop: `1.5px solid ${c.border}`,
            flexShrink: 0,
          }}
        >
          {!collapsed || isMobile ? (
            <div
              onClick={() => navigate("/account")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "14px",
                background: c.accentSoft,
                border: `1.5px solid ${c.accentMedium}`,
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <img
                src={userData?.profilePhoto || UserProfile}
                alt=""
                onError={(event) => {
                  (event.target as HTMLImageElement).src = UserProfile;
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  background: c.border,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: c.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userData?.user?.name || "Admin"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: c.textMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userData?.user?.roleName || "Manager"}
                </div>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  background: c.success,
                  color: "#fff",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  fontWeight: "700",
                }}
              >
                ● Live
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/account")}
            >
              <img
                src={userData?.profilePhoto || UserProfile}
                alt=""
                onError={(event) => {
                  (event.target as HTMLImageElement).src = UserProfile;
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed && !isMobile ? "center" : "space-between",
              padding: collapsed && !isMobile ? "0" : "0 4px",
            }}
          >
            {(!collapsed || isMobile) && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: c.textMuted,
                }}
              >
                {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
              </span>
            )}
            <div
              className="toggle-track"
              onClick={() => setThemes(theme === "light" ? "dark" : "light")}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div
        className="admin-main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Topbar */}
        <header
          className="admin-topbar"
          style={{
            height: "62px",
            background: c.topbarBg,
            borderBottom: `1.5px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 26px",
            gap: "14px",
            flexShrink: 0,
            zIndex: 200,
            position: "relative",
          }}
        >
          {/* Breadcrumb */}
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir navegación"
          >
            ☰
          </button>
          <div className="admin-breadcrumb">
            <div
              style={{
                fontSize: "15px",
                fontWeight: "800",
                color: c.text,
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <span>{activeItem?.emoji}</span> {activeItem?.label}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: c.textMuted,
                fontWeight: "600",
              }}
            >
              aycoro / {active}
            </div>
          </div>

          {/* ── Search ── */}
          <div
            className="desktop-search"
            ref={searchRef}
            style={{
              flex: 1,
              maxWidth: "340px",
              marginLeft: "auto",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "15px",
                color: c.textMuted,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              className="search-input"
              placeholder="Buscar usuarios, publicaciones..."
              value={searchWord}
              onChange={(e) => {
                setSearchWord(e.target.value);
                e.target.value.length >= 1 ? setPanel("search") : closeAll();
              }}
              onKeyDown={(e) => e.key === "Escape" && closeAll()}
              style={{ paddingRight: searchWord ? 34 : undefined }}
            />
            {searchWord ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setSearchWord("");
                  closeAll();
                }}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 22,
                  height: 22,
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.card,
                  color: c.text,
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            ) : null}
            {panel === "search" && (
              <DropPanel width={400}>
                <SearchPanel
                  c={c}
                  searchWord={searchWord}
                  onNavigate={(p) => {
                    navigate(p);
                    closeAll();
                    setSearchWord("");
                  }}
                />
              </DropPanel>
            )}
          </div>

          {/* ── Notificaciones ── */}
          <div ref={notifsRef} style={{ position: "relative" }}>
            <div
              className={`icon-btn${panel === "notifs" ? " open" : ""}`}
              onClick={() => toggle("notifs")}
            >
              🔔
              {unreadNotifs > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 17,
                    height: 17,
                    background: c.danger,
                    borderRadius: "50%",
                    border: `2px solid ${c.topbarBg}`,
                    fontSize: "8px",
                    fontWeight: "800",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unreadNotifs}
                </span>
              )}
            </div>
            {panel === "notifs" && (
              <DropPanel>
                <NotificationsPanel
                  c={c}
                  theme={theme}
                  notifs={notifs}
                  setNotifs={setNotifs}
                  onNavigate={(path) => {
                    navigate(path);
                    closeAll();
                  }}
                />
              </DropPanel>
            )}
          </div>

          {/* ── Perfil ── */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <div
              onClick={() => toggle("profile")}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "800",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 3px 12px rgba(107,115,240,0.40)",
                flexShrink: 0,
                border:
                  panel === "profile"
                    ? `2.5px solid ${c.accent}`
                    : "2.5px solid transparent",
                transition: "border 0.15s",
              }}
            >
              <img
                src={
                  userData?.profilePhoto ? userData?.profilePhoto : UserProfile
                }
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: userData?.profilePhoto
                    ? `2px solid ${Colors.detailAppColor}`
                    : undefined,
                }}
              />
            </div>
            {panel === "profile" && (
              <DropPanel width={240}>
                <ProfileMenu
                  user={userData!}
                  c={c}
                  theme={theme}
                  navigate={navigate}
                  onClose={closeAll}
                />
              </DropPanel>
            )}
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
