import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { getReasonById } from "../constants/ReportsReason";
import { ReportStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import reportService from "../Services/Report/ReportService";

const STATUS_CFG: Record<number, { label: string; color: string }> = {
  [ReportStatus.PENDING]: { label: "Pendiente", color: "#f87171" },
  [ReportStatus.IN_REVIEW]: { label: "En revisión", color: "#fbbf24" },
  [ReportStatus.RESOLVED]: { label: "Resuelto", color: "#34d399" },
  [ReportStatus.DISMISSED]: { label: "Descartado", color: "#94a3b8" },
};

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Moderation = () => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pendientes: 0,
    revision: 0,
    resueltos: 0,
    criticos: 0,
  });
  const [statusFilter, setStatusFilter] = useState<number | "todos">(ReportStatus.PENDING);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportService.getAll(1, search, {
        status: statusFilter,
        sortBy: "date",
      });
      const payload = response.data || response;
      setItems(payload.data || []);
      if (payload.stats) setStats(payload.stats);
    } catch (error) {
      console.error("Error loading moderation queue:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo cargar la cola de moderación.",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, showToast, statusFilter]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const kpis = useMemo(
    () => [
      { label: "Pendientes", value: stats.pendientes, emoji: "🔴" },
      { label: "En revisión", value: stats.revision, emoji: "🟡" },
      { label: "Resueltos", value: stats.resueltos, emoji: "🟢" },
      { label: "Críticos", value: stats.criticos, emoji: "🚨" },
    ],
    [stats],
  );

  const assignToMe = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!can(Permissions.MODERATE)) return;
    setAssigningId(id);
    try {
      await reportService.assign(id);
      showToast({
        type: "success",
        title: "Caso asignado",
        description: "El reporte quedó en revisión a tu nombre.",
      });
      loadQueue();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo asignar el reporte.",
      });
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <main
      style={{
        flex: 1,
        overflow: "auto",
        padding: 26,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
        <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>🛡️ Cola de moderación</div>
        <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
          Reportes reales pendientes o en revisión. Asigna un caso y ábrelo para actuar.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 16,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 22 }}>{kpi.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.text }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: ReportStatus.PENDING, label: "Pendientes" },
          { id: ReportStatus.IN_REVIEW, label: "En revisión" },
          { id: "todos" as const, label: "Todos" },
        ].map((tab) => (
          <button
            key={String(tab.id)}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 20,
              border: `1.5px solid ${statusFilter === tab.id ? c.accent + "55" : c.border}`,
              background: statusFilter === tab.id ? c.accentMedium : "transparent",
              color: statusFilter === tab.id ? c.accent : c.textMuted,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tipo, categoría o id..."
          style={{
            marginLeft: "auto",
            background: c.inputBackground,
            border: `1.5px solid ${c.inputBorder}`,
            borderRadius: 10,
            padding: "8px 12px",
            color: c.text,
            minWidth: 240,
          }}
        />
      </div>

      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 28, color: c.textMuted }}>Cargando cola...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 28, color: c.textMuted }}>No hay casos en esta cola.</div>
        ) : (
          items.map((report) => {
            const reason = getReasonById(report.Type);
            const status = STATUS_CFG[Number(report.Status)] || STATUS_CFG[ReportStatus.PENDING];
            return (
              <div
                key={report._id}
                onClick={() => navigate(`/moderation/${report._id}`)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 140px 150px",
                  gap: 12,
                  padding: "16px 18px",
                  borderBottom: `1px solid ${c.border}`,
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>
                    {reason?.icon || "📋"} {reason?.label || report.Type || "Reporte"}
                  </div>
                  <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>
                    {report.Category || "contenido"} · @{report.ReportedUser?.Username || "usuario"}
                    {report.ReporterUser?.Username ? ` · reportado por @${report.ReporterUser.Username}` : ""}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{formatDate(report.CreateDate)}</div>
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: status.color,
                      background: `${status.color}22`,
                      padding: "4px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {status.label}
                  </span>
                </div>
                <div>
                  {report.AssignedToName ? (
                    <span style={{ fontSize: 11, color: c.textMuted }}>{report.AssignedToName}</span>
                  ) : can(Permissions.MODERATE) ? (
                    <button
                      onClick={(event) => assignToMe(report._id, event)}
                      disabled={assigningId === report._id}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 10,
                        border: `1.5px solid ${c.accent}44`,
                        background: c.accentSoft,
                        color: c.accent,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {assigningId === report._id ? "Asignando..." : "Asignarme"}
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: c.textMuted }}>Sin asignar</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};

export default Moderation;
