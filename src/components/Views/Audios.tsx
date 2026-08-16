import { useCallback, useEffect, useState } from "react";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import { KpiCard } from "../Modules/Common/Components/bfdhjhg";
import { Pagination } from "../Modules/Common/Components/Pagination";
import adminAudioService from "../Services/Audio/AdminAudioService";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const Audios = () => {
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
  const [stats, setStats] = useState({ active: 0, deleted: 0 });
  const debouncedSearch = useDebounce(search, 500);
  const itemsPerPage = 15;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminAudioService.GetAll(
        page,
        debouncedSearch,
        filterStatus,
      );
      const payload = result.data?.data || result.data;
      const pagination = result.data?.pagination || {};
      setItems(Array.isArray(payload?.Audios) ? payload.Audios : []);
      setStats({
        active: payload?.Active || 0,
        deleted: payload?.Deleted || 0,
      });
      setTotalItems(pagination.total || 0);
      setTotalPages(pagination.totalPages || 1);
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los audios",
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
      await adminAudioService.UpdateStatus(id, status);
      showToast({
        type: "success",
        title: "Estado actualizado",
        description: status === 0 ? "Audio eliminado" : "Audio reactivado",
        duration: 3000,
      });
      await loadData();
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar el audio",
        duration: 4000,
      });
    }
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
          Audios
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
          Audios generados o asociados a publicaciones.
        </div>
      </div>

      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <KpiCard emoji="🎵" label="Activos" value={stats.active} colorKey="success" c={c} />
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
          placeholder="Buscar por nombre o usuario..."
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
          { value: 1, label: "Activos" },
          { value: 0, label: "Eliminados" },
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
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div style={{ padding: 24, color: c.textMuted }}>Cargando audios...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, color: c.textMuted, textAlign: "center" }}>
            No hay audios para mostrar.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item._id}
              style={{
                display: "grid",
                gridTemplateColumns: "64px minmax(0, 1.4fr) minmax(0, 1fr) auto",
                gap: 14,
                alignItems: "center",
                padding: "14px 16px",
                borderTop: index === 0 ? "none" : `1px solid ${c.border}`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  overflow: "hidden",
                  background: c.accentSoft,
                  flexShrink: 0,
                }}
              >
                {item.ImageUrl || item.PostMediaData ? (
                  <img
                    src={item.ImageUrl || item.PostMediaData}
                    alt={item.Name || "audio"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🎵
                  </div>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: c.text, fontSize: 14 }}>
                  {item.Name || "Audio sin nombre"}
                </div>
                <div style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>
                  @{item.Username || "usuario"}
                  {item.SourceType ? ` · ${item.SourceType}` : ""}
                </div>
                {item.MediaData && (
                  <audio
                    controls
                    src={item.MediaData}
                    style={{ width: "100%", marginTop: 8, maxWidth: 360 }}
                  />
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700 }}>
                  Publicación
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: c.text,
                    marginTop: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.PostDescription || item.IdPost || "Sin publicación"}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
                  {item.CreateDate
                    ? new Date(item.CreateDate).toLocaleString()
                    : "—"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: item.Status === 0 ? c.dangerSoft : c.successSoft,
                    color: item.Status === 0 ? c.danger : c.success,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {item.Status === 0 ? "Eliminado" : "Activo"}
                </span>
                {can(Permissions.DELETE_POSTS) && (
                  <button
                    onClick={() =>
                      handleStatusChange(item._id, item.Status === 0 ? 1 : 0)
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: `1.5px solid ${c.border}`,
                      background: c.inputBackground,
                      color: c.text,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {item.Status === 0 ? "Reactivar" : "Eliminar"}
                  </button>
                )}
              </div>
            </div>
          ))
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
    </main>
  );
};

export default Audios;
