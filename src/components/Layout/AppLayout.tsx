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
import { UserModel } from "../Models/User/UserModel";
import UserSearchCard from "../Modules/Common/Card/UserSearchCard";
import initializeService from "../Services/Initialize/InitializeService";
import userService from "../Services/User/UserService";

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
        id: "suspenciones",
        label: "Suspensiones",
        emoji: "!",
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
        id: "security",
        label: "Seguridad",
        emoji: "🔐",
        badge: null,
        navigate: "/security",
        permissions: [Permissions.MANAGE_SETTINGS],
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

// ─── Mock data ─────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "critica",
    emoji: "🚨",
    title: "Caso crítico nuevo",
    body: "MOD-001 requiere atención inmediata",
    time: "Hace 3 min",
    read: false,
  },
  {
    id: 2,
    type: "usuario",
    emoji: "👤",
    title: "Nuevo usuario registrado",
    body: "@rosa_tt se unió a la comunidad",
    time: "Hace 12 min",
    read: false,
  },
  {
    id: 3,
    type: "reporte",
    emoji: "⚠️",
    title: "Publicación reportada",
    body: "PUB-102 recibió 7 reportes de usuarios",
    time: "Hace 28 min",
    read: false,
  },
  {
    id: 4,
    type: "sistema",
    emoji: "💾",
    title: "Almacenamiento al 82%",
    body: "Quedan 18 GB libres en el servidor",
    time: "Hace 1h",
    read: true,
  },
  {
    id: 5,
    type: "mod",
    emoji: "🛡️",
    title: "Caso resuelto",
    body: "Carlos resolvió el caso MOD-008",
    time: "Hace 2h",
    read: true,
  },
  {
    id: 6,
    type: "sistema",
    emoji: "✅",
    title: "Backup completado",
    body: "Backup diario ejecutado correctamente",
    time: "Hace 3h",
    read: true,
  },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    from: "carlos_m",
    name: "Carlos Mendoza",
    role: "Moderador",
    initials: "CM",
    color: "#7b83f5",
    last: "¿Revisaste el caso MOD-001? Parece urgente",
    time: "Hace 5 min",
    unread: 2,
  },
  {
    id: 2,
    from: "sofia_r",
    name: "Sofía Ramírez",
    role: "Usuario",
    initials: "SR",
    color: "#34d399",
    last: "Hola, tengo un problema con mi cuenta de publicación",
    time: "Hace 22 min",
    unread: 1,
  },
  {
    id: 3,
    from: "ana_f",
    name: "Ana Flores",
    role: "Usuario",
    initials: "AF",
    color: "#fbbf24",
    last: "Gracias por resolver mi reporte tan rápido 🙏",
    time: "Hace 1h",
    unread: 0,
  },
  {
    id: 4,
    from: "jorge_s",
    name: "Jorge Suárez",
    role: "Usuario",
    initials: "JS",
    color: "#f87171",
    last: "¿Pueden revisar mi video? Lleva 3 días en revisión",
    time: "Ayer",
    unread: 0,
  },
];

const SEARCH_INDEX = [
  {
    type: "usuario",
    emoji: "👤",
    label: "@lucia_v",
    desc: "Admin · lucia@aycoro.app",
    path: "/users",
  },
  {
    type: "usuario",
    emoji: "👤",
    label: "@carlos_m",
    desc: "Moderador · CDMX",
    path: "/users",
  },
  {
    type: "usuario",
    emoji: "👤",
    label: "@sofia_r",
    desc: "Usuario · Bogotá",
    path: "/users",
  },
  {
    type: "pub",
    emoji: "📝",
    label: "PUB-102",
    desc: "Publicación · En revisión",
    path: "/publications",
  },
  {
    type: "pub",
    emoji: "📝",
    label: "PUB-089",
    desc: "Publicación · Eliminada",
    path: "/publications",
  },
  {
    type: "mod",
    emoji: "🛡️",
    label: "MOD-001",
    desc: "Moderación · Prioridad crítica",
    path: "/moderation",
  },
  {
    type: "seccion",
    emoji: "📊",
    label: "Analytics",
    desc: "Sección del panel",
    path: "/analytics",
  },
  {
    type: "seccion",
    emoji: "🛡️",
    label: "Moderación",
    desc: "Sección del panel",
    path: "/moderation",
  },
  {
    type: "seccion",
    emoji: "⚙️",
    label: "Configuración",
    desc: "Sección del panel",
    path: "/settings",
  },
  {
    type: "seccion",
    emoji: "🔐",
    label: "Seguridad",
    desc: "Sección del panel",
    path: "/security",
  },
];

// ─── Utils ─────────────────────────────────────────────────────────────
const ALL_ITEMS = NAV_ITEMS.flatMap((s) => s.items).sort(
  (a, b) => b.navigate.length - a.navigate.length,
);

function getActiveId(pathname: string): string {
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
  const [users, setusers] = useState<UserModel[]>([]);
  useEffect(() => {
    searchUsers(searchWord);
  }, [searchWord]);

  const searchUsers = async (word: string) => {
    const result = await userService.SearchUser(word, 1);
    setusers(result.data);
  };

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
      <div style={{ padding: 8 }}>
        {users.length === 0 ? (
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
          users.map((r, i) => <UserSearchCard key={i} user={r} />)
        )}
      </div>
      <div
        style={{
          padding: "8px 16px",
          borderTop: `1px solid ${c.border}`,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 10, color: c.textMuted }}>
          ↑↓ navegar · Enter seleccionar
        </span>
        <span style={{ fontSize: 10, color: c.textMuted }}>Esc cerrar</span>
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
}: {
  c: any;
  theme: string;
  notifs: typeof MOCK_NOTIFICATIONS;
  setNotifs: any;
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
        {notifs.map((n) => (
          <div
            key={n.id}
            onClick={() =>
              setNotifs((p: any) =>
                p.map((x: any) => (x.id === n.id ? { ...x, read: true } : x)),
              )
            }
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
        ))}
      </div>

      <div style={{ padding: "12px 18px", textAlign: "center" }}>
        <button
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
          Ver historial completo →
        </button>
      </div>
    </div>
  );
}

// ─── MESSAGES PANEL ────────────────────────────────────────────────────
function MessagesPanel({ c, theme }: { c: any; theme: string }) {
  const [openChat, setOpenChat] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [chats, setChats] = useState<
    Record<number, { from: "me" | "them"; text: string; time: string }[]>
  >({
    1: [
      {
        from: "them",
        text: "¿Revisaste el caso MOD-001? Parece urgente",
        time: "Hace 5 min",
      },
    ],
    2: [
      {
        from: "them",
        text: "Hola, tengo un problema con mi cuenta de publicación",
        time: "Hace 22 min",
      },
    ],
    3: [
      {
        from: "them",
        text: "Gracias por resolver mi reporte tan rápido 🙏",
        time: "Hace 1h",
      },
    ],
    4: [
      {
        from: "them",
        text: "¿Pueden revisar mi video? Lleva 3 días en revisión",
        time: "Ayer",
      },
    ],
  });

  const total = MOCK_MESSAGES.reduce((s, m) => s + m.unread, 0);
  const active = MOCK_MESSAGES.find((m) => m.id === openChat);

  const sendReply = () => {
    if (!reply.trim() || !openChat) return;
    setChats((prev) => ({
      ...prev,
      [openChat]: [
        ...(prev[openChat] || []),
        { from: "me", text: reply.trim(), time: "Ahora" },
      ],
    }));
    setReply("");
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
      {!openChat ? (
        <>
          <div
            style={{
              padding: "16px 18px 12px",
              borderBottom: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>
              📨 Mensajes
            </div>
            {total > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: c.accentSoft,
                  color: c.accent,
                }}
              >
                {total} nuevos
              </span>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {MOCK_MESSAGES.map((m) => (
              <div
                key={m.id}
                onClick={() => setOpenChat(m.id)}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom: `1px solid ${c.border}`,
                  cursor: "pointer",
                  background:
                    m.unread > 0
                      ? theme === "dark"
                        ? "rgba(107,115,240,0.06)"
                        : "rgba(107,115,240,0.03)"
                      : "transparent",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = c.accentSoft)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    m.unread > 0
                      ? theme === "dark"
                        ? "rgba(107,115,240,0.06)"
                        : "rgba(107,115,240,0.03)"
                      : "transparent")
                }
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: m.color + "22",
                      border: `2px solid ${m.color}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      color: m.color,
                    }}
                  >
                    {m.initials}
                  </div>
                  {m.unread > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: c.accent,
                        border: `2px solid ${c.card}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        fontWeight: 800,
                        color: "#fff",
                      }}
                    >
                      {m.unread}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{ fontSize: 12, fontWeight: 700, color: c.text }}
                    >
                      {m.name}
                    </span>
                    <span style={{ fontSize: 10, color: c.textMuted }}>
                      {m.time}
                    </span>
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
                    {m.last}
                  </div>
                  <div style={{ fontSize: 9, color: c.border, marginTop: 2 }}>
                    {m.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: "12px 18px",
              textAlign: "center",
              borderTop: `1px solid ${c.border}`,
            }}
          >
            <button
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
              Abrir mensajería completa →
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              onClick={() => setOpenChat(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                color: c.textMuted,
                padding: "0 2px",
                lineHeight: 1,
              }}
            >
              ←
            </button>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: active!.color + "22",
                border: `2px solid ${active!.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                color: active!.color,
              }}
            >
              {active!.initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                {active!.name}
              </div>
              <div style={{ fontSize: 10, color: c.success }}>● En línea</div>
            </div>
          </div>
          <div
            style={{
              padding: 16,
              minHeight: 200,
              maxHeight: 280,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {(chats[openChat] || []).map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
                  background:
                    msg.from === "me"
                      ? c.accentMedium
                      : theme === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                  border:
                    msg.from === "me" ? `1px solid ${c.accent}33` : "none",
                  borderRadius:
                    msg.from === "me" ? "12px 0 12px 12px" : "0 12px 12px 12px",
                  padding: "10px 14px",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: msg.from === "me" ? c.accent : c.text,
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                </div>
                <div style={{ fontSize: 9, color: c.textMuted, marginTop: 4 }}>
                  {msg.time}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: "10px 14px",
              borderTop: `1px solid ${c.border}`,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              placeholder="Escribe un mensaje..."
              style={{
                flex: 1,
                background: c.inputBackground,
                border: `1.5px solid ${c.inputBorder}`,
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                color: c.text,
                outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
            <button
              onClick={sendReply}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: c.accent,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(107,115,240,0.4)",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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
            sub: "Perfil, roles y permisos",
            path: "/account",
            permissions: [] as Permission[],
          },
          {
            icon: "🔐",
            label: "Seguridad",
            sub: "2FA y contraseña",
            path: "/security",
            permissions: [Permissions.MANAGE_SETTINGS],
          },
          {
            icon: "⚙️",
            label: "Configuración",
            sub: "Ajustes de la plataforma",
            path: "/settings",
            permissions: [
              Permissions.MANAGE_SETTINGS,
              Permissions.MANAGE_ADMINS,
              Permissions.DANGER_ZONE,
            ],
          },
          {
            icon: "🗂️",
            label: "Logs",
            sub: "Auditoría y registros",
            path: "/logs",
            permissions: [Permissions.VIEW_ERROR_LOGS],
          },
          {
            icon: "📱",
            label: "SessionLog",
            sub: "Entradas a la app",
            path: "/session-logs",
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
    "search" | "notifs" | "messages" | "profile" | null
  >(null);
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const [reports, setReports] = useState<number>(0);
  const [users, setUsers] = useState<number>(0);
  const [publications, setPublications] = useState<number>(0);
  const [conversations, setConversations] = useState<number>(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
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
  useClickOutside(messagesRef, () => panel === "messages" && closeAll());
  useClickOutside(profileRef, () => panel === "profile" && closeAll());

  const toggle = (p: typeof panel) =>
    setPanel((prev) => (prev === p ? null : p));

  const unreadNotifs = notifs.filter((n) => !n.read).length;
  const unreadMessages = MOCK_MESSAGES.reduce((s, m) => s + m.unread, 0);

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
  };

  const updatedNavItems = NAV_ITEMS.map((section) => ({
    ...section,
    items: section.items.filter((item: any) => canAny(...item.permissions)),
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
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                AD
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: "12px", fontWeight: "700", color: c.text }}
                >
                  Admin
                </div>
                <div style={{ fontSize: "10px", color: c.textMuted }}>
                  Super Admin
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
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                AD
              </div>
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
              // onFocus={() => setPanel("search")}
              onKeyDown={(e) => e.key === "Escape" && closeAll()}
            />
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
                />
              </DropPanel>
            )}
          </div>

          {/* ── Mensajes ── */}
          <div ref={messagesRef} style={{ position: "relative" }}>
            <div
              className={`icon-btn${panel === "messages" ? " open" : ""}`}
              onClick={() => toggle("messages")}
            >
              📨
              {unreadMessages > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 17,
                    height: 17,
                    background: c.accent,
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
                  {unreadMessages}
                </span>
              )}
            </div>
            {panel === "messages" && (
              <DropPanel>
                <MessagesPanel c={c} theme={theme} />
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
