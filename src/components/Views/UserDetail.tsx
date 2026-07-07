import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { PostStatus, UserStatus } from "../constants/Status";
import { useImageBankContext } from "../context/ImageBankContext";
import { useThemeContext } from "../context/ThemeContext";
import { useUserContext } from "../context/UserContext";
import useLanguage from "../hooks/useLanguage";
import { PostModel } from "../Models/Post/PostModel";
import { UserPerfilModel } from "../Models/User/UserPerfilModel";
import PubCard from "../Modules/Users/Components/PubCard";
import postService from "../Services/Post/PostService";
import userService from "../Services/User/UserService";

// ─── Mock usuario ──────────────────────────────────────────────────────
const MOCK_USER = {
  id: "USR-042",
  name: "Sofía Ramírez",
  username: "sofia_r",
  email: "sofia@gmail.com",
  bio: "Diseñadora UX/UI 🎨 · Amante del café ☕ · Creando cosas bonitas desde 2019. Siempre explorando nuevas ideas y conectando con personas increíbles.",
  location: "🇨🇴 Bogotá, Colombia",
  website: "sofiaramirez.design",
  joined: "14 mar 2023",
  lastSeen: "Hace 12 min",
  status: "activo" as "activo" | "suspendido" | "baneado",
  verified: true,
  premium: true,
  avatar: "SR",
  avatarColor: "#34d399",
  coverGradient:
    "linear-gradient(135deg, #0d1f2d 0%, #1a2f4a 50%, #0f3460 100%)",
  stats: {
    seguidores: 4820,
    seguidos: 312,
    bloqueados: 7,
    publicaciones: 89,
    archivadas: 14,
    reposteadas: 23,
    guardadas: 156,
  },
};

// ─── Mock publicaciones ────────────────────────────────────────────────
const genPubs = (type: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `PUB-${type.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
    title: [
      "El diseño minimalista y su impacto en la experiencia del usuario",
      "Explorando nuevas técnicas de ilustración digital",
      "Retrospectiva: mis mejores proyectos de 2024",
      "¿Cómo organizo mi flujo de trabajo creativo?",
      "Herramientas que uso a diario como diseñadora",
      "La importancia del feedback en el diseño colaborativo",
      "Proceso creativo: de la idea al producto final",
      "Tendencias en UI design para este año",
    ][i % 8],
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.",
    type: (["texto", "imagen", "video", "encuesta"] as const)[i % 4],
    likes: Math.floor(Math.random() * 800) + 20,
    comments: Math.floor(Math.random() * 120) + 2,
    shares: Math.floor(Math.random() * 60),
    views: Math.floor(Math.random() * 5000) + 100,
    date: `${Math.floor(Math.random() * 28) + 1} feb 2025`,
    tags: [
      ["diseño", "ux", "ui"],
      ["arte", "ilustración"],
      ["proceso", "creativo"],
      ["tips", "diseño"],
    ][i % 4],
    reportes: i === 2 ? 3 : i === 5 ? 1 : 0,
  }));

const PUBLICATIONS = {
  activas: genPubs("act", 12),
  archivadas: genPubs("arc", 14),
  reposteadas: genPubs("rep", 8),
  guardadas: genPubs("sav", 15),
  eliminadas: genPubs("del", 3),
};

// ─── Configs ───────────────────────────────────────────────────────────
const STATUS_CFG = {
  activo: {
    label: "Activo",
    emoji: "✅",
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.28)",
  },
  suspendido: {
    label: "Suspendido",
    emoji: "⏸️",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.28)",
  },
  baneado: {
    label: "Baneado",
    emoji: "🚫",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.28)",
  },
};

const TYPE_CFG = {
  texto: { emoji: "📝", color: "#6b73f0" },
  imagen: { emoji: "🖼️", color: "#34d399" },
  video: { emoji: "🎬", color: "#f87171" },
  encuesta: { emoji: "📊", color: "#fbbf24" },
};

const PUB_TABS = [
  { id: "todas", label: "Todas", emoji: "\uD83D\uDCDA", statuses: [] },
  {
    id: "activas",
    label: "Activas",
    emoji: "\uD83D\uDCE2",
    statuses: [PostStatus.PUBLISHED, PostStatus.EDITED],
  },
  {
    id: "revision",
    label: "En revision",
    emoji: "\uD83D\uDD0D",
    statuses: [PostStatus.UNDER_REVIEW],
  },
  {
    id: "reportadas",
    label: "Reportadas",
    emoji: "\u26A0\uFE0F",
    statuses: [PostStatus.REPORTED],
  },
  {
    id: "archivadas",
    label: "Archivadas",
    emoji: "\uD83D\uDCE6",
    statuses: [PostStatus.ARCHIVED],
  },
  {
    id: "eliminadas",
    label: "Eliminadas",
    emoji: "\uD83D\uDDD1\uFE0F",
    statuses: [PostStatus.DELETED],
  },
] as const;
type PubTabId = (typeof PUB_TABS)[number]["id"];

const fmt = (n: number = 0) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const getUserStatusKey = (status?: number) => {
  if (status === UserStatus.SUSPENDED) return "suspendido";
  if (status === UserStatus.BANNED) return "baneado";
  return "activo";
};

const getUserStatusCode = (status: keyof typeof STATUS_CFG) => {
  if (status === "suspendido") return UserStatus.SUSPENDED;
  if (status === "baneado") return UserStatus.BANNED;
  return UserStatus.ACTIVE;
};

const formatBirthDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function UserPublicationModal({ pub, c, theme, onClose }: any) {
  const navigate = useNavigate();

  if (!pub) return null;

  const formatDate = (date?: Date) => {
    if (!date) return "Fecha desconocida";
    return new Date(date).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusLabel =
    pub.Status === PostStatus.PUBLISHED
      ? "Publicada"
      : pub.Status === PostStatus.EDITED
        ? "Editada"
        : pub.Status === PostStatus.UNDER_REVIEW
          ? "En revision"
          : pub.Status === PostStatus.REPORTED
            ? "Reportada"
            : pub.Status === PostStatus.ARCHIVED
              ? "Archivada"
              : pub.Status === PostStatus.DELETED
                ? "Eliminada"
                : "Publicacion";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.42)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 22,
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1.5px solid ${c.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
              Detalle de publicacion
            </div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
              {statusLabel} · ID: {pub._id?.slice(-8)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: c.card,
              color: c.textMuted,
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>

        <div style={{ padding: 22, display: "grid", gap: 16 }}>
          {pub.MediaData && (
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                overflow: "hidden",
                background: c.accentSoft,
              }}
            >
              <img
                src={pub.MediaData}
                alt="Post"
                style={{ width: "100%", display: "block", objectFit: "cover" }}
              />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={pub.ProfilePhoto || UserProfile}
              alt=""
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${c.accent}44`,
              }}
            />
            <div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/users/${pub.Username}`);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 900,
                  color: c.text,
                  cursor: "pointer",
                }}
              >
                @{pub.Username}
              </button>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                {formatDate(pub.CreateDate)}
              </div>
            </div>
          </div>

          {pub.Description && (
            <div
              style={{
                border: `1px solid ${c.border}`,
                borderRadius: 14,
                padding: 14,
                fontSize: 13,
                color: c.text,
                lineHeight: 1.7,
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
              }}
            >
              {pub.Description}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {[
              { label: "Likes", value: pub.Likes ?? 0, icon: "\u2764\uFE0F" },
              {
                label: "Comentarios",
                value: pub.Comments ?? 0,
                icon: "\uD83D\uDCAC",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  padding: 14,
                  textAlign: "center",
                  background: c.inputBackground,
                }}
              >
                <div style={{ fontSize: 16 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: c.text,
                    marginTop: 4,
                  }}
                >
                  {fmt(item.value)}
                </div>
                <div style={{ fontSize: 10, color: c.textMuted }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PubCard ───────────────────────────────────────────────────────────

// ─── Componente principal ──────────────────────────────────────────────
const UserDetail = () => {
  const { username } = useParams();
  const { getLabel } = useLanguage();
  const { userData, updateUser } = useUserContext();
  const { searchImage } = useImageBankContext();
  const [perfilUser, setPerfilUser] = useState<UserPerfilModel | undefined>();
  const [perfilPost, setPerfilPost] = useState<PostModel[]>([]);
  const [selectedPublication, setSelectedPublication] =
    useState<PostModel | null>(null);
  const [archivedPost, setArchivedPost] = useState<PostModel[]>([]);
  const [userPostSection, setUserPostSection] = useState(1);
  const { theme } = useThemeContext();
  const navigate = useNavigate();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [user, setUser] = useState(MOCK_USER);
  const [pubTab, setPubTab] = useState<PubTabId>("activas");
  const [searchPub, setSearch] = useState("");
  const [confirmBan, setConfirmBan] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<typeof user.status>(
    user.status,
  );

  const [loadingData, setLoadingData] = useState({
    user: true,
    posts: true,
  });

  useEffect(() => {
    if (username) {
      loadData();
    }
  }, [username]);

  const loadData = useCallback(async () => {
    setLoadingData({ user: true, posts: true });
    setUserPostSection(1);
    setPerfilPost([]);

    try {
      const [userResponse, postResponse] = await Promise.all([
        userService.GetUserByUsername(username!),
        postService.GetForUser(username!, 1),
        // postService.GetArchivedPost(1),
      ]);


      setPerfilUser(userResponse.data);
      const userStatus = getUserStatusKey(userResponse.data?.User?.Status);
      setUser((current) => ({ ...current, status: userStatus }));
      setPendingStatus(userStatus);

      setPerfilPost(postResponse.data);
      // postResponse.data.forEach((post: any) => savePost(post));

      // setArchivedPost(archivedPost.data);
      // archivedPost.data.forEach((post: any) => savePost(post));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingData({ user: false, posts: false });
      // setRefreshing(false);
    }
  }, [username, userData, searchImage]);



  const pubs = useMemo(() => {
    const selectedTab = PUB_TABS.find((tab) => tab.id === pubTab);
    const tabStatuses = (selectedTab?.statuses || []) as readonly number[];
    const list =
      tabStatuses.length === 0
        ? perfilPost
        : perfilPost.filter((post) =>
            tabStatuses.includes(post.Status as any),
          );

    if (!searchPub.trim()) return list;
    const q = searchPub.toLowerCase();
    return list.filter(
      (p) =>
        p.Description?.toLowerCase().includes(q) ||
        p.Username?.toLowerCase().includes(q),
    );
  }, [perfilPost, pubTab, searchPub]);

  const getTabCount = (tab: (typeof PUB_TABS)[number]) => {
    if (tab.statuses.length === 0) return perfilPost.length;
    const tabStatuses = tab.statuses as readonly number[];
    return perfilPost.filter((post) => tabStatuses.includes(post.Status as any))
      .length;
  };

  const applyStatus = async () => {
    if (!perfilUser?.User?._id) return;

    setStatusSaving(true);
    try {
      if (pendingStatus === "baneado") {
        await userService.BannedUser(perfilUser.User._id);
      } else if (pendingStatus === "suspendido") {
        await userService.SuspendUser(perfilUser.User._id);
      } else if (user.status === "baneado") {
        await userService.UnBannedUser(perfilUser.User._id);
      } else {
        await userService.ReactiveUser(perfilUser.User._id);
      }

      const nextStatusCode = getUserStatusCode(pendingStatus);
      setPerfilUser((current) =>
        current?.User
          ? {
              ...current,
              User: {
                ...current.User,
                Status: nextStatusCode,
              },
            }
          : current,
      );
      setUser((u) => ({ ...u, status: pendingStatus }));
      setStatusSaved(true);
      setStatusModalOpen(false);
      setConfirmStatusOpen(false);
      setTimeout(() => setStatusSaved(false), 2200);
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setStatusSaving(false);
    }
  };

  const sc = STATUS_CFG[user.status];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 4px; }

        .status-chip {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px 14px; border-radius: 14px;
          border: 1.5px solid; cursor: pointer; flex: 1;
          font-size: 12px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.17s; position: relative; white-space: nowrap;
        }
        .status-chip:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }

        .action-btn {
          padding: 8px 16px; border-radius: 12px;
          border: 1.5px solid ${c.border}; background: transparent;
          color: ${c.textMuted}; font-size: 11px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s; white-space: nowrap;
        }
        .action-btn:hover { border-color: ${c.accent}44; color: ${c.accent}; background: ${c.accentSoft}; }
        .action-btn.danger { color: #f87171; border-color: rgba(248,113,113,0.3); }
        .action-btn.danger:hover { border-color: rgba(248,113,113,0.5); background: rgba(248,113,113,0.08); }

        .pub-tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 22px;
          border: 1.5px solid ${c.border}; background: transparent;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: ${c.textMuted}; transition: all 0.15s; white-space: nowrap;
        }
        .pub-tab-btn:hover { border-color: ${c.accent}44; color: ${c.accent}; background: ${c.accentSoft}; }
        .pub-tab-btn.active { background: ${c.accentMedium}; border-color: ${c.accent}44; color: ${c.accent}; box-shadow: 0 3px 12px rgba(107,115,240,0.2); }

        .pub-search {
          background: ${c.inputBackground}; border: 1.5px solid ${c.inputBorder};
          border-radius: 10px; padding: 8px 14px 8px 36px;
          font-size: 12px; color: ${c.text};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; width: 220px; transition: border-color 0.2s;
        }
        .pub-search::placeholder { color: ${c.textMuted}; }
        .pub-search:focus { border-color: ${c.accent}; }

        .social-col {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 22px 16px; cursor: default; transition: background 0.15s;
        }
        .social-col:hover { background: rgba(107,115,240,0.04); }

        .content-stat-cell {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 5px; padding: 20px 12px; cursor: pointer;
          transition: all 0.15s; position: relative;
        }
        .content-stat-cell:hover { transform: translateY(-2px); }

        @media (max-width: 768px) {
          .user-detail-content { padding: 0 14px 28px !important; }
          .user-detail-status {
            align-items: stretch !important;
            flex-direction: column !important;
          }
          .user-detail-status .action-btn { width: 100%; min-height: 42px; }
          .user-detail-overview {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
          }
          .user-detail-profile-card {
            width: 100% !important;
            min-height: 280px;
            padding: 24px 18px !important;
          }
          .user-detail-info-card { width: 100%; min-width: 0; }
          .user-detail-info-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px !important;
          }
          .user-detail-info-grid > div {
            align-items: flex-start;
            flex-direction: column !important;
            gap: 3px !important;
            padding-bottom: 8px;
            border-bottom: 1px solid ${c.border};
          }
          .user-detail-info-value {
            width: 100%;
            overflow: visible !important;
            text-overflow: clip !important;
            white-space: normal !important;
            overflow-wrap: anywhere;
          }
          .user-detail-actions {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px !important;
          }
          .user-detail-actions .action-btn {
            min-height: 44px;
            white-space: normal;
          }
        }

        @media (max-width: 440px) {
          .user-detail-content { padding-inline: 10px !important; }
          .user-detail-stats { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .user-detail-stats .social-col { min-width: 0; padding: 14px 5px !important; }
          .user-detail-stats .social-col > div:first-child { font-size: 20px !important; }
          .user-detail-stats .social-col > div:last-child { font-size: 9px !important; overflow-wrap: anywhere; }
          .user-detail-actions { grid-template-columns: minmax(0, 1fr); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.28s ease; }
      `}</style>

      <main
        style={{
          flex: 1,
          overflow: "auto",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* ══════════════════════════════════════════
            COVER
        ══════════════════════════════════════════ */}
        <div
          style={{
            position: "relative",
            height: 60,
            flexShrink: 0,
          }}
        >
          <div style={{ position: "absolute" }} />
          {/* Degradado hacia abajo para suavizar el corte */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
            }}
          />

          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: 16,
              left: 22,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.card,
              color: c.text,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backdropFilter: "blur(8px)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                `${c.card}000`)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = c.card)
            }
          >
            ← Volver
          </button>

          <div
            style={{
              position: "absolute",
              top: 16,
              right: 22,
              display: "flex",
              gap: 8,
            }}
          >
            <button
              className="action-btn"
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
                color: c.text,
                backdropFilter: "blur(8px)",
              }}
            >
              📤 Exportar
            </button>
          </div>
        </div>

        <div className="user-detail-content" style={{ padding: "0 28px 40px" }}>
          {/* ══════════════════════════════════════════
              BLOQUE 1 — Control de estado HORIZONTAL
          ══════════════════════════════════════════ */}

          <div
            className="user-detail-status"
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 16,
              padding: "12px 14px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{sc.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: c.text }}>
                  Estado del usuario: {sc.label}
                </div>
                {statusSaved && (
                  <div style={{ fontSize: 10, color: c.success, marginTop: 2 }}>
                    Estado actualizado correctamente
                  </div>
                )}
              </div>
            </div>
            <button
              className="action-btn"
              onClick={() => {
                setPendingStatus(user.status);
                setStatusModalOpen(true);
              }}
              style={{
                background: c.accentSoft,
                borderColor: `${c.accent}44`,
                color: c.accent,
              }}
            >
              Cambiar estado
            </button>
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 2 — Foto de perfil (izq) + Red social (der)
              Alineados de forma PARALELA / side by side
          ══════════════════════════════════════════ */}
          <div
            className="user-detail-overview"
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 20,
              alignItems: "stretch",
            }}
          >
            {/* ── Foto de perfil grande ── */}
            <div
              className="user-detail-profile-card"
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                flexShrink: 0,
                width: 220,
              }}
            >
              {/* Avatar con ring de estado */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `${user.avatarColor}20`,
                    border: `3px solid ${user.avatarColor}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 42,
                    fontWeight: 900,
                    color: user.avatarColor,
                    boxShadow: `0 0 0 6px ${user.avatarColor}12, 0 12px 40px rgba(0,0,0,0.18)`,
                  }}
                >
                  <img
                    src={
                      perfilUser?.ProfilePhoto
                        ? perfilUser?.ProfilePhoto
                        : UserProfile
                    }
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: perfilUser?.ProfilePhoto
                        ? `2px solid ${Colors.detailAppColor}`
                        : undefined,
                    }}
                  />
                </div>
                {/* Anillo de estado */}
                <div
                  style={{
                    position: "absolute",
                    inset: -6,
                    borderRadius: "50%",
                    border: `2.5px solid ${sc.color}55`,
                    boxShadow: `0 0 18px ${sc.color}44`,
                    pointerEvents: "none",
                  }}
                />
                {/* Dot */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: sc.color,
                    border: `3px solid ${c.card}`,
                    boxShadow: `0 0 14px ${sc.color}bb`,
                  }}
                />
              </div>

              {/* Nombre + username */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: c.text,
                    marginBottom: 2,
                  }}
                >
                  {perfilUser?.User?.Name}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted }}>
                  @{perfilUser?.User?.Username}
                </div>
              </div>
            </div>

            {/* ── Red social: seguidores, seguidos, bloqueados + bio ── */}
            <div
              className="user-detail-info-card"
              style={{
                flex: 1,
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "10px 18px",
                  borderBottom: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: c.textMuted,
                    letterSpacing: "0.06em",
                  }}
                >
                  ESTADÍSTICAS
                </span>
              </div>

              {/* Tres columnas de stats — más compactas */}
              <div className="user-detail-stats" style={{ display: "flex" }}>
                {[
                  {
                    label: "Seguidores",
                    value: perfilUser?.Followers ?? 0,
                    color: c.accent,
                  },
                  {
                    label: "Seguidos",
                    value: perfilUser?.Followings ?? 0,
                    color: c.accent,
                  },
                  {
                    label: "Publicaciones",
                    value: perfilUser?.Posts ?? (perfilUser as any)?.Post ?? 0,
                    color: c.warning,
                  },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="social-col"
                    style={{
                      borderRight: i < 2 ? `1px solid ${c.border}` : "none",
                      padding: "14px 10px",
                      gap: 3,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        `${s.color}08`)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: s.color,
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                      }}
                    >
                      {fmt(s.value)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: c.textMuted,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bio + Info del usuario */}
              <div
                style={{
                  borderTop: `1px solid ${c.border}`,
                  padding: "12px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                }}
              >
                {/* Grid de info */}
                <div
                  className="user-detail-info-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px 14px",
                  }}
                >
                  {[
                    {
                      label: "Email",
                      value: perfilUser?.User?.Email,
                      extra: perfilUser?.User?.Validate ? (
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: "rgba(52,211,153,0.12)",
                            color: c.success,
                            border: "1px solid rgba(52,211,153,0.25)",
                            marginLeft: 4,
                          }}
                        >
                          ✓ validado
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: "rgba(248,113,113,0.10)",
                            color: c.danger,
                            border: "1px solid rgba(248,113,113,0.2)",
                            marginLeft: 4,
                          }}
                        >
                          ✕ no validado
                        </span>
                      ),
                    },
                    {
                      label: "Teléfono",
                      value: perfilUser?.User?.Phone || "—",
                    },
                    {
                      label: "Fecha de nacimiento",
                      value: formatBirthDate(perfilUser?.User?.Birthday),
                    },
                    {
                      label: "Género",
                      value: perfilUser?.User?.Gender || "—",
                    },
                    {
                      label: "Edad",
                      value: `${17} años`,
                    },                    {
                      label: "Ciudad",
                      value: perfilUser?.User?.City || "-",
                    },
                    {
                      label: "Pais",
                      value: perfilUser?.User?.Country || "-",
                    },                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                      }}
                    >
                      <div
                        className="user-detail-info-value"
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: c.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {item.label}:
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color:
                            item.value && item.value !== "—"
                              ? c.text
                              : c.border,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.value}
                        {"extra" in item && item.extra}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: c.border }} />

                {/* Bio */}
                {perfilUser?.User?.PerfilData?.Presentation && (
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: c.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 4,
                      }}
                    >
                      Bio
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: c.textMuted,
                        lineHeight: 1.6,
                      }}
                    >
                      {perfilUser?.User?.PerfilData?.Presentation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 3 — Stats de contenido + Acciones rápidas
          ══════════════════════════════════════════ */}
          <div
            style={{
              marginBottom: 20,
            }}
          >
            {/* Acciones rápidas */}
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
              }}
            >
              <div
                className="user-detail-actions"
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "row",
                  gap: 5,
                }}
              >
                {[
                  { label: "✉️ Enviar mensaje", cls: "" },
                  { label: "🔍 Ver actividad", cls: "" },
                  { label: "📋 Ver logs del usuario", cls: "" },
                  { label: "⚠️ Crear reporte", cls: "" },
                  { label: "🚫 Banear usuario", cls: "danger" },
                ].map((a) => (
                  <button
                    key={a.label}
                    className={`action-btn ${a.cls}`}
                    style={{ width: "100%", textAlign: "left" }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 4 — Sección de publicaciones
          ══════════════════════════════════════════ */}
          <div id="pub-section">
            {/* Toolbar: tabs + buscador */}
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                padding: "16px 20px",
                marginBottom: 16,
                boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {PUB_TABS.map((t) => (
                  <button
                    key={t.id}
                    className={`pub-tab-btn${pubTab === t.id ? " active" : ""}`}
                    onClick={() => {
                      setPubTab(t.id);
                      setSearch("");
                    }}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 8,
                        background:
                          pubTab === t.id ? c.accent + "33" : c.accentSoft,
                        color: pubTab === t.id ? c.accent : c.textMuted,
                      }}
                    >
                      {getTabCount(t)}
                    </span>
                  </button>
                ))}
                <div style={{ marginLeft: "auto", position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 12,
                      color: c.textMuted,
                      pointerEvents: "none",
                    }}
                  >
                    🔍
                  </span>
                  <input
                    className="pub-search"
                    placeholder="Buscar publicación…"
                    value={searchPub}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Grid de tarjetas */}
            <div
              className="fade-up"
              key={pubTab}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: 14,
              }}
            >
              {pubs.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1/-1",
                    padding: 52,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 36, opacity: 0.2, marginBottom: 10 }}>
                    📭
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: c.textMuted,
                    }}
                  >
                    Sin resultados para "{searchPub}"
                  </div>
                </div>
              ) : (
                pubs.map((pub) => (
                  <div
                    key={pub._id}
                    onClick={() => setSelectedPublication(pub)}
                    style={{ cursor: "pointer" }}
                  >
                    <PubCard publication={pub} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <UserPublicationModal
        pub={selectedPublication}
        c={c}
        theme={theme}
        onClose={() => setSelectedPublication(null)}
      />

      {statusModalOpen && (
        <div
          onClick={() => setStatusModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background:
              theme === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.38)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 18,
              boxShadow: "0 22px 70px rgba(0,0,0,0.32)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: `1px solid ${c.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
                  Cambiar estado del usuario
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                  Selecciona el nuevo estado antes de confirmar.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.card,
                  color: c.textMuted,
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>

            <div style={{ padding: 16, display: "grid", gap: 10 }}>
              {(
                Object.entries(STATUS_CFG) as [
                  typeof user.status,
                  (typeof STATUS_CFG)[keyof typeof STATUS_CFG],
                ][]
              ).map(([k, v]) => (
                <button
                  key={k}
                  className="status-chip"
                  type="button"
                  onClick={() => setPendingStatus(k)}
                  style={{
                    borderColor: pendingStatus === k ? v.color + "77" : c.border,
                    background: pendingStatus === k ? v.bg : c.card,
                    color: pendingStatus === k ? v.color : c.textMuted,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{v.emoji}</span>
                  <span>{v.label}</span>
                  {user.status === k && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 9,
                        fontWeight: 900,
                        color: v.color,
                      }}
                    >
                      ACTUAL
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderTop: `1px solid ${c.border}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="action-btn"
                disabled={pendingStatus === user.status}
                onClick={() => setConfirmStatusOpen(true)}
                style={{
                  background:
                    pendingStatus === user.status ? c.accentSoft : c.accent,
                  color: pendingStatus === user.status ? c.textMuted : "#fff",
                  borderColor:
                    pendingStatus === user.status ? c.border : c.accent,
                  opacity: pendingStatus === user.status ? 0.7 : 1,
                  cursor:
                    pendingStatus === user.status ? "not-allowed" : "pointer",
                }}
              >
                Guardar cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmStatusOpen && (
        <div
          onClick={() => setConfirmStatusOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "rgba(0,0,0,0.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
              Confirmar cambio
            </div>
            <div
              style={{
                fontSize: 12,
                color: c.textMuted,
                lineHeight: 1.6,
                marginTop: 8,
              }}
            >
              Vas a cambiar el estado de @{perfilUser?.User?.Username} a{" "}
              <strong style={{ color: STATUS_CFG[pendingStatus].color }}>
                {STATUS_CFG[pendingStatus].label}
              </strong>
              . Esta accion actualizara tambien la disponibilidad de sus
              publicaciones segun corresponda.
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={() => setConfirmStatusOpen(false)}
                disabled={statusSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={applyStatus}
                disabled={statusSaving}
                style={{
                  background: STATUS_CFG[pendingStatus].color,
                  borderColor: STATUS_CFG[pendingStatus].color,
                  color: "#fff",
                  opacity: statusSaving ? 0.7 : 1,
                }}
              >
                {statusSaving ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetail;
