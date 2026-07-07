// Publications.tsx (Optimizado con la estructura de respuesta correcta)
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { PostStatus } from "../constants/Status";
import { Permissions } from "../constants/Permissions";
import { usePermissions } from "../hooks/usePermissions";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { PostModel } from "../Models/Post/PostModel";
import { KpiCard } from "../Modules/Common/Components/bfdhjhg";
import { TabChip } from "../Modules/Common/Components/gffsag";
import { Pagination } from "../Modules/Common/Components/Pagination";
import PubCard from "../Modules/Users/Components/PubCard";
import postService from "../Services/Post/PostService";

// ─── Configs de estados según el enum ─────────────────────────────────
const POST_STATUS_CONFIG: Record<
  number,
  { label: string; dot: string; color: string; bg: string }
> = {
  1: { label: "Borrador", dot: "📝", color: "muted", bg: "#f3f4f6" },
  2: { label: "Publicado", dot: "🟢", color: "success", bg: "#d1fae5" },
  3: { label: "Oculto", dot: "🙈", color: "muted", bg: "#f3f4f6" },
  4: { label: "Marcado", dot: "🏷️", color: "info", bg: "#dbeafe" },
  5: { label: "Reportado", dot: "⚠️", color: "danger", bg: "#fee2e2" },
  6: { label: "En revisión", dot: "🔍", color: "warning", bg: "#fed7aa" },
  7: { label: "Archivado", dot: "📦", color: "muted", bg: "#f3f4f6" },
  8: { label: "Eliminado", dot: "🗑️", color: "danger", bg: "#fee2e2" },
  9: { label: "Editado", dot: "✏️", color: "info", bg: "#dbeafe" },
};

const AVATAR_PALETTE: any = [
  "#7b83f5",
  "#f87171",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#a78bfa",
  "#fb923c",
  "#e879f9",
  "#4ade80",
  "#f472b6",
];

const getAvatarColor = (name: string = "") =>
  AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

const fmtNum = (n: number = 0) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const isVideoPublication = (pub: PostModel) => {
  const mediaType = pub.MediaType?.toLowerCase() || "";
  const mimeType = pub.MediaMimeType?.toLowerCase() || "";
  const mediaUrl = pub.MediaData?.toLowerCase() || "";

  return (
    mediaType.includes("video") ||
    mimeType.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v|avi|mkv)(\?|#|$)/i.test(mediaUrl)
  );
};

// ─── Debounce helper ───────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}



function UserAvatar({ username, photoUrl, size = 32 }: any) {
  const bg = getAvatarColor(username);
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={username}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: `2px solid ${bg}55`,
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${bg}22`,
        border: `2px solid ${bg}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: "800",
        color: bg,
        flexShrink: 0,
      }}
    >
      {username?.slice(0, 2).toUpperCase() || "?"}
    </div>
  );
}

// ─── Modal detalle ────────────────────────────────────────────────────
function PublicationModal({ pub, c, theme, onClose, onAction }: any) {
  const { can } = usePermissions();
  const navigate = useNavigate();
  if (!pub) return null;

  // Acciones disponibles según el estado actual
  const getAvailableActions = () => {
    const actions = [];

    if (pub.Status === PostStatus.PUBLISHED || pub.Status === PostStatus.EDITED) {
      return [
        {
          key: PostStatus.DELETED,
          label: "Eliminar",
          color: c.danger,
          bg: c.dangerSoft,
        },
      ];
    }

    if (pub.Status !== 2) {
      actions.push({
        key: 2,
        label: "✅ Publicar",
        color: c.success,
        bg: c.successSoft,
      });
    }
    if (pub.Status !== 6 && pub.Status !== 2) {
      actions.push({
        key: 6,
        label: "🔍 Enviar a revisión",
        color: c.warning,
        bg: c.warningSoft,
      });
    }
    if (pub.Status !== 5) {
      actions.push({
        key: 5,
        label: "⚠️ Marcar como reportado",
        color: c.danger,
        bg: c.dangerSoft,
      });
    }
    if (pub.Status !== 3) {
      actions.push({
        key: 3,
        label: "🙈 Ocultar",
        color: c.muted,
        bg: c.accentSoft,
      });
    }
    if (pub.Status !== 7) {
      actions.push({
        key: 7,
        label: "📦 Archivar",
        color: c.muted,
        bg: c.accentSoft,
      });
    }
    if (pub.Status !== 8) {
      actions.push({
        key: 8,
        label: "🗑️ Eliminar",
        color: c.danger,
        bg: c.dangerSoft,
      });
    }

    return actions;
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Fecha desconocida";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusCfg = POST_STATUS_CONFIG[pub.Status || 2];
  const isVideo = isVideoPublication(pub);

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
        padding: "20px",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: "24px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1.5px solid ${c.border}`,
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1a1a30, #0f0f22)"
                : "linear-gradient(135deg, #ededff, #f5f0ff)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: "20px" }}>{statusCfg?.dot}</span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: statusCfg?.bg,
                  color:
                    statusCfg?.color === "success"
                      ? c.success
                      : statusCfg?.color === "danger"
                        ? c.danger
                        : statusCfg?.color === "warning"
                          ? c.warning
                          : c.text,
                }}
              >
                {statusCfg?.label}
              </span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: c.accent,
                fontFamily: "monospace",
              }}
            >
              ID: {pub._id?.slice(-8)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              border: `1.5px solid ${c.border}`,
              background: c.card,
              cursor: "pointer",
              fontSize: "13px",
              color: c.textMuted,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Media principal */}
          {pub.MediaData && (
            <div
              style={{
                width: "100%",
                borderRadius: "16px",
                overflow: "hidden",
                background: isVideo ? "#05050b" : c.accentSoft,
              }}
            >
              {isVideo ? (
                <video
                  src={pub.MediaData}
                  controls
                  playsInline
                  preload="metadata"
                  style={{
                    width: "100%",
                    maxHeight: "68vh",
                    display: "block",
                    background: "#05050b",
                  }}
                >
                  Tu navegador no puede reproducir este video.
                </video>
              ) : (
                <img
                  src={pub.MediaData}
                  alt="Post"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          )}

          {/* Autor */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <UserAvatar
              username={pub.Username}
              photoUrl={pub.ProfilePhoto}
              size={44}
            />
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
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
                    fontSize: "14px",
                    fontWeight: "800",
                    color: c.text,
                    cursor: "pointer",
                  }}
                >
                  @{pub.Username}
                </button>
                {pub.Verify === 1 && <span>✅</span>}
              </div>
              <div style={{ fontSize: "11px", color: c.textMuted }}>
                {formatDate(pub.CreateDate)}
              </div>
            </div>
          </div>

          {/* Descripción */}
          {pub.Description && (
            <div
              style={{
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                border: `1.5px solid ${c.border}`,
                borderRadius: "14px",
                padding: "16px",
                fontSize: "13px",
                color: c.text,
                lineHeight: 1.7,
              }}
            >
              {pub.Description}
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
              padding: "14px",
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
              borderRadius: "14px",
              border: `1px solid ${c.border}`,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", marginBottom: "3px" }}>❤️</div>
              <div
                style={{ fontSize: "18px", fontWeight: "800", color: c.text }}
              >
                {fmtNum(pub.Likes ?? 0)}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "600",
                  color: c.textMuted,
                }}
              >
                Likes
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", marginBottom: "3px" }}>💬</div>
              <div
                style={{ fontSize: "18px", fontWeight: "800", color: c.text }}
              >
                {fmtNum(pub.Comments ?? 0)}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "600",
                  color: c.textMuted,
                }}
              >
                Comentarios
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div
          style={{
            padding: "14px 24px 20px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {can(Permissions.DELETE_POSTS) && getAvailableActions().map((a) => (
            <button
              key={a.key}
              onClick={() => {
                onAction(pub._id, a.key);
                onClose();
              }}
              style={{
                flex: 1,
                minWidth: "100px",
                padding: "9px 14px",
                borderRadius: "12px",
                border: `1.5px solid ${a.color}33`,
                background: a.bg,
                color: a.color,
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────
const Publications = () => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [publications, setPublications] = useState<PostModel[]>([]);
  const [selected, setSelected] = useState<PostModel | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statsCounters, setStatsCounters] = useState({
    published: 0,
    reported: 0,
    reviewed: 0,
    deleted: 0,
  });
  const itemsPerPage = 12;

  const debouncedSearch = useDebounce(search, 500);

  // Cargar publicaciones desde la API
  const loadPublications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await postService.GetAll(page, debouncedSearch, filterStatus!);

      const postsData = result.data.data?.Posts;
      const paginationData = result.data.pagination;
      
      // Contadores de estadísticas
      const counters = {
        published: result.data.data?.Published || 0,
        reported: result.data.data?.Reported || 0,
        reviewed: result.data.data?.Reviewed || 0,
        deleted: result.data.data?.Deleted || 0,
      };

      setPublications(Array.isArray(postsData) ? postsData : []);
      setStatsCounters(counters);
      setTotalItems(paginationData.total || postsData.length || 0);
      setTotalPages(
        paginationData.totalPages ||
        Math.ceil((paginationData.total || 0) / itemsPerPage) ||
        1,
      );
    } catch (error) {
      console.error("Error loading publications:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar las publicaciones",
        duration: 4000,
      });
      setPublications([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, itemsPerPage, filterStatus, showToast]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus]);

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  // Cambiar estado de la publicación
  const handleStatusChange = useCallback(
    async (id: string, newStatus: number) => {
      // Optimistic update
      setPublications((prev) =>
        prev.map((p) => (p._id === id ? { ...p, Status: newStatus } : p)),
      );

      try {
        await postService.UpdateStatus(id, newStatus);
        showToast({
          type: "success",
          title: "Estado actualizado",
          description: `La publicación ahora está ${POST_STATUS_CONFIG[newStatus]?.label}`,
          duration: 3000,
        });
        await loadPublications(); // Recargar para sincronizar contadores
      } catch (error) {
        await loadPublications(); // Recargar datos frescos en caso de error
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el estado",
          duration: 4000,
        });
      }
    },
    [loadPublications, showToast],
  );


  const clearFilters = () => {
    setSearch("");
    setFilterStatus(undefined);
    setPage(1);
  };

  const statusOptions = [
    { value: PostStatus.PUBLISHED, label: "🟢 Publicadas", color: "success" },
    { value: PostStatus.HIDDEN, label: "🙈 Ocultas", color: "muted" },
    { value: PostStatus.REPORTED, label: "⚠️ Reportadas", color: "warning" },
    { value: PostStatus.ARCHIVED, label: "📦 Archivadas", color: "muted" },
    { value: PostStatus.DELETED, label: "🗑️ Eliminadas", color: "danger" },
  ];

  // Skeleton loader para cards
  const SkeletonCard = () => (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div style={{ width: "100%", height: 200, background: c.accentSoft }} />
      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: c.accentSoft,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: "60%",
                height: 12,
                background: c.accentSoft,
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                width: "40%",
                height: 10,
                background: c.accentSoft,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: "90%",
            height: 14,
            background: c.accentSoft,
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
        <div
          style={{
            width: "70%",
            height: 12,
            background: c.accentSoft,
            borderRadius: 4,
            marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", gap: "16px" }}>
          <div
            style={{
              width: 50,
              height: 14,
              background: c.accentSoft,
              borderRadius: 4,
            }}
          />
          <div
            style={{
              width: 50,
              height: 14,
              background: c.accentSoft,
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        
        .search-input {
          background: ${c.inputBackground};
          border: 1.5px solid ${c.inputBorder};
          border-radius: 10px;
          padding: 8px 14px 8px 36px;
          font-size: 12px; color: ${c.text};
          outline: none; width: 260px;
        }
        .search-input:focus { border-color: ${c.accent}; }
        
        .filter-chip {
          padding: 5px 13px;
          border-radius: 20px;
          border: 1.5px solid ${c.border};
          background: transparent;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          color: ${c.textMuted};
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-chip:hover { border-color: ${c.accent}44; color: ${c.text}; }
        .filter-chip.active {
          background: ${c.accentMedium};
          border-color: ${c.accent}44;
          color: ${c.accent};
        }
        
        .pub-card {
          background: ${c.card};
          border: 1.5px solid ${c.border};
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pub-card:hover {
          border-color: ${c.accent}66;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
      `}</style>

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "26px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Banner */}
        <div
          className="responsive-page-banner"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1a1a30, #0f0f22)"
                : "linear-gradient(135deg, #ededff, #f5f0ff)",
            border: `1.5px solid ${c.accentMedium}`,
            borderRadius: "20px",
            padding: "22px 28px",
            marginBottom: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: c.text,
                marginBottom: "5px",
              }}
            >
              📸 Gestión de Publicaciones
            </div>
            <div style={{ fontSize: "13px", color: c.textMuted }}>
              <strong style={{ color: c.success }}>
                {statsCounters.published} publicadas
              </strong>{" "}
              ·
              <strong style={{ color: c.warning }}>
                {" "}
                {statsCounters.reviewed} en revisión
              </strong>{" "}
              ·
              <strong style={{ color: c.danger }}>
                {" "}
                {statsCounters.reported} reportadas
              </strong>{" "}
              ·
              <strong style={{ color: c.danger }}>
                {" "}
                {statsCounters.deleted} eliminadas
              </strong>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <KpiCard
            emoji="📸"
            label="Total"
            value={totalItems}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="🟢"
            label="Publicadas"
            value={statsCounters.published}
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="⚠️"
            label="Reportadas"
            value={statsCounters.reported}
            colorKey="danger"
            c={c}
          />
          <KpiCard
            emoji="🔍"
            label="En revisión"
            value={statsCounters.reviewed}
            colorKey="warning"
            c={c}
          />
          <KpiCard
            emoji="🗑️"
            label="Eliminadas"
            value={statsCounters.deleted}
            colorKey="danger"
            c={c}
          />
        </div>

        {/* Toolbar */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: "20px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "13px",
                color: c.textMuted,
              }}
            >
              🔍
            </span>
            <input
              className="search-input"
              placeholder="Buscar por usuario o contenido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: c.textMuted,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {statusOptions.map((s) => (
            <TabChip
              key={String(s.value)}
              label={s.label}
              active={filterStatus === s.value}
              onClick={() => setFilterStatus(s.value as any)}
              color={s.color}
              c={c}
            />
          ))}

          {(search || filterStatus !== undefined) && (
            <button
              onClick={clearFilters}
              style={{
                padding: "5px 12px",
                borderRadius: "20px",
                border: `1.5px solid ${c.danger}33`,
                background: c.danger,
                color: c.primary,
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid de Cards usando PubCard */}
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "20px",
              padding: "60px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "48px", opacity: 0.3, marginBottom: "16px" }}
            >
              📸
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: c.textMuted,
              }}
            >
              {search
                ? "No se encontraron publicaciones"
                : "No hay publicaciones para mostrar"}
            </div>
            {search && (
              <button
                onClick={clearFilters}
                style={{
                  marginTop: "12px",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  background: c.accent,
                  color: "#fff",
                  border: "none",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "20px",
              }}
            >
              {publications.map((pub) => (
                <div
                  key={pub._id}
                  className="pub-card"
                  onClick={() => setSelected(pub)}
                >
                  <PubCard publication={pub} />
                </div>
              ))}
            </div>

            {/* Paginación */}
            <div style={{ marginTop: 24 }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                itemsPerPage={publications.length}
                totalItems={totalItems}
                search={search}
                setPage={setPage}
                c={c}
                theme={theme}
              />
            </div>
          </>
        )}
      </main>

      {/* Modal detalle */}
      <PublicationModal
        pub={selected}
        c={c}
        theme={theme}
        onClose={() => setSelected(null)}
        onAction={handleStatusChange}
      />
    </>
  );
};

export default Publications;
