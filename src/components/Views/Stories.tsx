import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { HistoryStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import { KpiCard } from "../Modules/Common/Components/bfdhjhg";
import { Pagination } from "../Modules/Common/Components/Pagination";
import adminHistoryService from "../Services/History/AdminHistoryService";

const HISTORY_STATUS: Record<
  number,
  { label: string; color: string; bg: string }
> = {
  [HistoryStatus.PUBLISHED]: {
    label: "Publicada",
    color: "#059669",
    bg: "#d1fae5",
  },
  [HistoryStatus.FLAGGED]: { label: "Marcada", color: "#2563eb", bg: "#dbeafe" },
  [HistoryStatus.REPORTED]: {
    label: "Reportada",
    color: "#dc2626",
    bg: "#fee2e2",
  },
  [HistoryStatus.UNDER_REVIEW]: {
    label: "En revisión",
    color: "#d97706",
    bg: "#fed7aa",
  },
  [HistoryStatus.DELETED]: {
    label: "Eliminada",
    color: "#dc2626",
    bg: "#fee2e2",
  },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const isVideo = (item: any) => {
  const mediaType = `${item?.MediaType || ""}`.toLowerCase();
  const mimeType = `${item?.MediaMimeType || ""}`.toLowerCase();
  const url = `${item?.MediaData || ""}`.toLowerCase();
  return (
    mediaType.includes("video") ||
    mimeType.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)
  );
};

const Stories = () => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;

  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
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
  const debouncedSearch = useDebounce(search, 500);
  const itemsPerPage = 15;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminHistoryService.GetAll(
        page,
        debouncedSearch,
        filterStatus,
      );
      const payload = result.data?.data || result.data;
      const pagination = result.data?.pagination || {};
      setItems(Array.isArray(payload?.Histories) ? payload.Histories : []);
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
        description: "No se pudieron cargar las historias",
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
      await adminHistoryService.UpdateStatus(id, status);
      showToast({
        type: "success",
        title: "Estado actualizado",
        description: `Historia marcada como ${HISTORY_STATUS[status]?.label || status}`,
        duration: 3000,
      });
      setSelected(null);
      await loadData();
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar el estado",
        duration: 4000,
      });
    }
  };

  const statusOptions = [
    { value: HistoryStatus.PUBLISHED, label: "Publicadas" },
    { value: HistoryStatus.REPORTED, label: "Reportadas" },
    { value: HistoryStatus.UNDER_REVIEW, label: "En revisión" },
    { value: HistoryStatus.DELETED, label: "Eliminadas" },
  ];

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
          Historias
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
          Revisa todas las historias subidas por la comunidad.
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
        <KpiCard emoji="🟢" label="Publicadas" value={stats.published} colorKey="success" c={c} />
        <KpiCard emoji="⚠️" label="Reportadas" value={stats.reported} colorKey="danger" c={c} />
        <KpiCard emoji="🔍" label="En revisión" value={stats.reviewed} colorKey="warning" c={c} />
        <KpiCard emoji="🗑️" label="Eliminadas" value={stats.deleted} colorKey="danger" c={c} />
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
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por usuario o texto..."
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
        <button
          onClick={() => setFilterStatus(undefined)}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: `1.5px solid ${c.border}`,
            background: filterStatus === undefined ? c.accentMedium : "transparent",
            color: filterStatus === undefined ? c.accent : c.textMuted,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Todas
        </button>
        {statusOptions.map((option) => (
          <button
            key={option.value}
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                style={{
                  height: 280,
                  borderRadius: 18,
                  background: c.accentSoft,
                }}
              />
            ))
          : items.map((item) => {
              const status = HISTORY_STATUS[item.Status] || HISTORY_STATUS[1];
              return (
                <button
                  key={item._id}
                  onClick={() => item._id && navigate(`/stories/${item._id}`)}
                  style={{
                    border: `1.5px solid ${c.border}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    background: c.card,
                    textAlign: "left",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <div style={{ position: "relative", height: 220, background: "#111" }}>
                    {item.MediaData ? (
                      isVideo(item) ? (
                        <video
                          src={item.MediaData}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          muted
                        />
                      ) : (
                        <img
                          src={item.MediaData}
                          alt={item.Username || "historia"}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: c.textMuted,
                        }}
                      >
                        Sin media
                      </div>
                    )}
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: status.bg,
                        color: status.color,
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 800, color: c.text, fontSize: 13 }}>
                      @{item.Username || "usuario"}
                    </div>
                    <div style={{ color: c.textMuted, fontSize: 11, marginTop: 4 }}>
                      {item.CreateDate
                        ? new Date(item.CreateDate).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </button>
              );
            })}
      </div>

      {!isLoading && items.length === 0 && (
        <div style={{ textAlign: "center", color: c.textMuted, padding: 40 }}>
          No hay historias para mostrar.
        </div>
      )}

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

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              background: c.card,
              borderRadius: 20,
              overflow: "hidden",
              border: `1.5px solid ${c.border}`,
            }}
          >
            <div style={{ height: 420, background: "#111" }}>
              {selected.MediaData ? (
                isVideo(selected) ? (
                  <video
                    src={selected.MediaData}
                    controls
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src={selected.MediaData}
                    alt={selected.Username || "historia"}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )
              ) : null}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 800, color: c.text }}>
                @{selected.Username || "usuario"}
              </div>
              {selected.OverlayText && (
                <div style={{ marginTop: 8, color: c.textMuted, fontSize: 13 }}>
                  {selected.OverlayText}
                </div>
              )}
              {can(Permissions.DELETE_POSTS) && (
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    onClick={() =>
                      handleStatusChange(selected._id, HistoryStatus.UNDER_REVIEW)
                    }
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1.5px solid ${c.border}`,
                      background: c.warningSoft,
                      color: c.warning,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    En revisión
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selected._id, HistoryStatus.DELETED)
                    }
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1.5px solid ${c.border}`,
                      background: c.dangerSoft,
                      color: c.danger,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Stories;
