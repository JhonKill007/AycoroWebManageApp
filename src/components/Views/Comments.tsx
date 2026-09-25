import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { CommentStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import AdminContentPreviewModal from "../Modules/Common/Components/AdminContentPreviewModal";
import { KpiCard } from "../Modules/Common/Components/bfdhjhg";
import { Pagination } from "../Modules/Common/Components/Pagination";
import adminComentService from "../Services/Coments/AdminComentService";

const COMMENT_STATUS: Record<
  number,
  { label: string; color: string; bg: string }
> = {
  [CommentStatus.PUBLISHED]: {
    label: "Publicado",
    color: "#059669",
    bg: "#d1fae5",
  },
  [CommentStatus.FLAGGED]: { label: "Marcado", color: "#2563eb", bg: "#dbeafe" },
  [CommentStatus.REPORTED]: {
    label: "Reportado",
    color: "#dc2626",
    bg: "#fee2e2",
  },
  [CommentStatus.UNDER_REVIEW]: {
    label: "En revisión",
    color: "#d97706",
    bg: "#fed7aa",
  },
  [CommentStatus.DELETED]: {
    label: "Eliminado",
    color: "#dc2626",
    bg: "#fee2e2",
  },
  [CommentStatus.EDITED]: { label: "Editado", color: "#2563eb", bg: "#dbeafe" },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const Comments = () => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;

  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    published: 0,
    reported: 0,
    reviewed: 0,
    deleted: 0,
  });
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const itemsPerPage = 15;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminComentService.GetAll(
        page,
        debouncedSearch,
        filterStatus,
      );
      const payload = result.data?.data || result.data;
      const pagination = result.data?.pagination || {};
      setItems(Array.isArray(payload?.Comments) ? payload.Comments : []);
      setStats({
        published: payload?.Published || 0,
        reported: payload?.Reported || 0,
        reviewed: payload?.Reviewed || 0,
        deleted: payload?.Deleted || 0,
      });
      setTotalItems(pagination.total || 0);
      setTotalPages(pagination.totalPages || 1);
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        duration: 4000,
      });
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, filterStatus, showToast]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await adminComentService.UpdateStatus(id, status);
      showToast({
        type: "success",
        title: "Estado actualizado",
        description: `Comentario marcado como ${COMMENT_STATUS[status]?.label || status}`,
        duration: 3000,
      });
      await loadData();
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar el comentario",
        duration: 4000,
      });
    }
  };

  const openPost = async (postId?: string) => {
    if (!postId) {
      showToast({
        type: "error",
        title: "Sin publicación",
        description: "Este comentario no tiene una publicación asociada",
        duration: 3000,
      });
      return;
    }

    navigate(`/publications/${postId}`);
  };

  return (
    <main
      style={{
        flex: 1,
        overflow: "auto",
        padding: 26,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minWidth: 0,
      }}
    >
      <div
        className="responsive-page-banner"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #1a1a30, #0f0f22)"
              : "linear-gradient(135deg, #ededff, #f5f0ff)",
          border: `1.5px solid ${c.accentMedium}`,
          borderRadius: 20,
          padding: "22px 28px",
          marginBottom: 22,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>
          Comentarios
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
          Todos los comentarios, quién los hizo y a qué publicación pertenecen.
        </div>
      </div>

      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <KpiCard emoji="🟢" label="Publicados" value={stats.published} colorKey="success" c={c} />
        <KpiCard emoji="⚠️" label="Reportados" value={stats.reported} colorKey="danger" c={c} />
        <KpiCard emoji="🔍" label="En revisión" value={stats.reviewed} colorKey="warning" c={c} />
        <KpiCard emoji="🗑️" label="Eliminados" value={stats.deleted} colorKey="danger" c={c} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 18,
          alignItems: "center",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por texto o usuario..."
          style={{
            background: c.inputBackground,
            border: `1.5px solid ${c.inputBorder}`,
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 12,
            color: c.text,
            outline: "none",
            minWidth: 220,
            flex: "1 1 220px",
          }}
        />
        {[
          { value: undefined, label: "Todos" },
          { value: CommentStatus.PUBLISHED, label: "Publicados" },
          { value: CommentStatus.REPORTED, label: "Reportados" },
          { value: CommentStatus.UNDER_REVIEW, label: "En revisión" },
          { value: CommentStatus.DELETED, label: "Eliminados" },
        ].map((option) => (
          <button
            key={String(option.value)}
            onClick={() => setFilterStatus(option.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: `1.5px solid ${c.border}`,
              background:
                filterStatus === option.value ? c.accentMedium : "transparent",
              color: filterStatus === option.value ? c.accent : c.textMuted,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className="responsive-table-card"
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.6fr 1.4fr 120px 140px",
            gap: 12,
            padding: "12px 16px",
            borderBottom: `1px solid ${c.border}`,
            minWidth: 860,
            fontSize: 11,
            fontWeight: 800,
            color: c.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <div>Autor</div>
          <div>Comentario</div>
          <div>Publicación</div>
          <div>Estado</div>
          <div>Acciones</div>
        </div>

        {isLoading ? (
          <div style={{ padding: 24, color: c.textMuted }}>Cargando comentarios...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, color: c.textMuted, textAlign: "center" }}>
            No hay comentarios para mostrar.
          </div>
        ) : (
          items.map((item) => {
            const status =
              COMMENT_STATUS[Number(item.Status)] ||
              COMMENT_STATUS[CommentStatus.PUBLISHED];
            return (
              <div
                key={item._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 1.6fr 1.4fr 120px 140px",
                  gap: 12,
                  padding: "14px 16px",
                  borderTop: `1px solid ${c.border}`,
                  minWidth: 860,
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                  {item.ProfilePhoto ? (
                    <img
                      src={item.ProfilePhoto}
                      alt={item.Username || "user"}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: c.accentSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        color: c.accent,
                        fontSize: 11,
                      }}
                    >
                      {(item.Username || "?").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: c.text, fontSize: 13 }}>
                      @{item.Username || "usuario"}
                    </div>
                    <div style={{ color: c.textMuted, fontSize: 11 }}>
                      {item.CreateDate
                        ? new Date(item.CreateDate).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <div style={{ color: c.text, fontSize: 13, lineHeight: 1.45 }}>
                  {item.ComentValue || "—"}
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openPost(item.PostId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPost(item.PostId);
                    }
                  }}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    minWidth: 0,
                    cursor: item.PostId ? "pointer" : "default",
                    borderRadius: 10,
                    padding: 4,
                    margin: -4,
                  }}
                  title={item.PostId ? "Ver publicación" : undefined}
                >
                  {item.PostMediaData ? (
                    <img
                      src={item.PostMediaData}
                      alt="post"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: c.accentSoft,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: c.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.PostDescription || "Publicación sin descripción"}
                    </div>
                    <div style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
                      {item.PostOwnerUsername
                        ? `@${item.PostOwnerUsername}`
                        : item.PostId || "—"}
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: status.bg,
                      color: status.color,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                <div>
                  {can(Permissions.DELETE_POSTS) &&
                    Number(item.Status) !== CommentStatus.DELETED && (
                      <button
                        onClick={() =>
                          handleStatusChange(item._id, CommentStatus.DELETED)
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: `1.5px solid ${c.border}`,
                          background: c.dangerSoft,
                          color: c.danger,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        search={debouncedSearch}
        setPage={setPage}
        c={c}
        theme={theme || "light"}
      />

      <AdminContentPreviewModal
        item={selectedPost}
        kind="post"
        c={c}
        theme={theme || "light"}
        loading={loadingPost}
        onClose={() => {
          setSelectedPost(null);
          setLoadingPost(false);
        }}
      />
    </main>
  );
};

export default Comments;
