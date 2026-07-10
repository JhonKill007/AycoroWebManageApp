// Reports.tsx (optimizado con búsqueda en API y paginación)
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { REPORT_REASONS } from "../constants/ReportsReason";
import { Permissions } from "../constants/Permissions";
import { CONTENT_DELETED_MESSAGE } from "../constants/SystemMessages";
import { usePermissions } from "../hooks/usePermissions";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { ReportModel } from "../Models/Report/ReportModel";
import { Pagination } from "../Modules/Common/Components/Pagination";
import { formatDate } from "../Modules/Settings/Common/Utils";
import reportService from "../Services/Report/ReportService";
import systemMessageService from "../Services/SystemMessage/SystemMessageService";

// ─── Configs de UI ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  number,
  { label: string; color: string; dot: string; bg: string }
> = {
  1: { label: "Pendiente", color: "#b45309", dot: "🟡", bg: "#fef3c7" },
  2: { label: "En revisión", color: "#6d28d9", dot: "🟣", bg: "#ede9fe" },
  3: { label: "Resuelto", color: "#dc2626", dot: "🔴", bg: "#fee2e2" },
  4: { label: "Descartado", color: "#6c7c9b", dot: "⚫", bg: "#f3f4f6" },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  critical: { label: "Crítica", color: "#fc4747", bg: "#fee2e2" },
  high: { label: "Alta", color: "#fd8c0c", bg: "#fed7aa" },
  medium: { label: "Media", color: "#539dff", bg: "#dbeafe" },
  low: { label: "Baja", color: "#4994f7", bg: "#dbeafe" },
};

const CATEGORY_EMOJI: Record<string, string> = {
  story: "🎞️",
  history: "🎞️",
  historia: "🎞️",
  post: "🖼️",
  publication: "🖼️",
  publicacion: "🖼️",
  publicación: "🖼️",
  message: "💬",
  user: "👤",
  profile: "👤",
  account: "🪪",
  group: "👥",
  comment: "💬",
  service: "🧰",
};

const CATEGORY_LABEL: Record<string, string> = {
  story: "Historia",
  history: "Historia",
  historia: "Historia",
  post: "Publicación",
  publication: "Publicación",
  publicacion: "Publicación",
  publicación: "Publicación",
  message: "Mensaje",
  user: "Usuario",
  profile: "Perfil",
  account: "Cuenta",
  group: "Grupo",
  comment: "Comentario",
  service: "Servicio",
};

const getCategoryDisplay = (category?: string) => {
  const normalized = String(category || "").toLowerCase();
  return {
    icon: CATEGORY_EMOJI[normalized] || "📄",
    label: CATEGORY_LABEL[normalized] || category || "N/A",
  };
};

// Helper para obtener la configuración de una razón de reporte
const getReasonConfig = (reasonId: string) => {
  return REPORT_REASONS.find((r) => r.id === reasonId);
};

const getUserDisplay = (user: any, fallbackId?: string) => ({
  name: user?.Name || user?.Username || fallbackId?.slice(-8) || "Usuario",
  username: user?.Username ? `@${user.Username}` : fallbackId || "N/A",
  email: user?.Email || "Sin email",
});

const isVideoUrl = (url?: string) => /\.(mp4|webm|mov|m4v)$/i.test(url || "");

const isDeletableContentReport = (report: ReportModel) => {
  const category = String(report.Category || "").toLowerCase();
  return ["post", "publication", "publicacion", "publicación"].includes(
    category,
  );
};

const REPORT_STATUS = {
  PENDING: 1,
  IN_REVIEW: 2,
  RESOLVED: 3,
  DISMISSED: 4,
};

// ─── Debounce helper ───────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ─── ReportDetailModal ─────────────────────────────────────────────────
function ReportDetailModal({
  report,
  c,
  theme,
  onClose,
  onStatusChange,
  onDeleteItem,
  onBanUser,
  onOpenUser,
}: any) {
  const { can } = usePermissions();
  if (!report) return null;

  const reasonConfig = getReasonConfig(report.Type || "");
  const statusConfig = STATUS_CONFIG[report.Status ?? 0];
  const priorityConfig = PRIORITY_CONFIG[report.Priority || "medium"];
  const reporter = getUserDisplay(report.ReporterUser, report.IdUser);
  const reported = getUserDisplay(report.ReportedUser, report.IdUserReported);
  const reportedItem = report.ReportedItem;
  const contentMediaUrl =
    typeof report.Content === "string" && /^https?:\/\//i.test(report.Content)
      ? report.Content
      : undefined;
  const reportedMediaUrl = reportedItem?.mediaUrl || contentMediaUrl;
  const canDeleteItem = isDeletableContentReport(report);
  const isResolved = report.Status === REPORT_STATUS.RESOLVED;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: "22px",
          width: "100%",
          maxWidth: "560px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1.5px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#1a1a30,#0f0f22)"
                : "linear-gradient(135deg,#ededff,#f5f0ff)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "20px" }}>
                {reasonConfig?.icon || "📋"}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: reasonConfig?.color || c.accent,
                  letterSpacing: "0.08em",
                }}
              >
                {reasonConfig?.label?.toUpperCase() ||
                  report.Type?.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: c.text }}>
              Reporte #{report._id?.slice(-8)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "4px 12px",
                borderRadius: "20px",
                background: statusConfig?.bg || c.accentSoft,
                color: statusConfig?.color || c.text,
              }}
            >
              {statusConfig?.dot} {statusConfig?.label}
            </span>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                border: `1.5px solid ${c.border}`,
                background: c.card,
                cursor: "pointer",
                fontSize: "14px",
                color: c.textMuted,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Descripción del reporte */}
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: c.textMuted,
                letterSpacing: "0.1em",
                marginBottom: "8px",
              }}
            >
              Descripción del reporte
            </div>
            <div
              style={{
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.03)",
                border: `1.5px solid ${c.border}`,
                borderRadius: "12px",
                padding: "14px 16px",
                fontSize: "13px",
                color: c.text,
                lineHeight: 1.6,
              }}
            >
              {reasonConfig?.longDescription ||
                report.Description ||
                "Sin descripción adicional"}
            </div>
          </div>

          {/* Contenido reportado (si existe) */}
          {reportedItem && (
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: c.textMuted,
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                Vista del contenido reportado
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "96px 1fr",
                  gap: "12px",
                  alignItems: "center",
                  border: `1.5px solid ${c.border}`,
                  borderRadius: "14px",
                  padding: "10px",
                  background:
                    theme === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: c.accentSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: c.accent,
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {reportedMediaUrl ? (
                    isVideoUrl(reportedMediaUrl) ? (
                      <video
                        src={reportedMediaUrl}
                        controls
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={reportedMediaUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )
                  ) : (
                    <span>{reportedItem.type === "story" ? "Historia" : "Sin media"}</span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: c.text,
                      textTransform: "capitalize",
                    }}
                  >
                    {reportedItem.type || report.Category || "Contenido"}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: c.textMuted,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {reportedItem.description ||
                      reportedItem.unavailableReason ||
                      report.Content ||
                      "Sin descripción"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {report.Content && (
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: c.textMuted,
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                Contenido reportado
              </div>
              <div
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)",
                  border: `1.5px solid ${c.border}`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  fontSize: "13px",
                  color: c.text,
                  lineHeight: 1.6,
                }}
              >
                "{report.Content}"
              </div>
            </div>
          )}

          {/* Partes involucradas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              onClick={() => onOpenUser(report.ReporterUser?.Username)}
              title={
                report.ReporterUser?.Username
                  ? `Abrir perfil de ${report.ReporterUser.Username}`
                  : undefined
              }
              style={{
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.02)",
                border: `1.5px solid ${c.border}`,
                borderRadius: "12px",
                padding: "12px 14px",
                cursor: report.ReporterUser?.Username ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                🚩 Reportado por
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {report.ProfilePhotoUser ? (
                  <img
                    src={report.ProfilePhotoUser}
                    alt=""
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: c.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.accent,
                    }}
                  >
                    {report.IdUser?.slice(-2).toUpperCase() || "?"}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: c.text }}>
                    {reporter.name}
                  </div>
                  <div style={{ fontSize: 10, color: c.textMuted }}>
                    {reporter.username}
                  </div>
                  <div style={{ fontSize: 10, color: c.textMuted }}>
                    {reporter.email}
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => onOpenUser(report.ReportedUser?.Username)}
              title={
                report.ReportedUser?.Username
                  ? `Abrir perfil de ${report.ReportedUser.Username}`
                  : undefined
              }
              style={{
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.02)",
                border: `1.5px solid ${c.border}`,
                borderRadius: "12px",
                padding: "12px 14px",
                cursor: report.ReportedUser?.Username ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                ⚠️ Usuario reportado
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {report.ProfilePhotoUserReported ? (
                  <img
                    src={report.ProfilePhotoUserReported}
                    alt=""
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: c.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.accent,
                    }}
                  >
                    {report.IdUserReported?.slice(-2).toUpperCase() || "?"}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: c.text }}>
                    {reported.name}
                  </div>
                  <div style={{ fontSize: 10, color: c.textMuted }}>
                    {reported.username}
                  </div>
                  <div style={{ fontSize: 10, color: c.textMuted }}>
                    {reported.email}
                  </div>
                  <div style={{ fontSize: 10, color: c.danger, marginTop: 3 }}>
                    {report.ConfirmedReports || 0} reportes confirmados
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                background: c.accentSoft,
                border: `1px solid ${c.accentMedium}`,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                }}
              >
                Categoría:
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: c.accent,
                  marginLeft: "6px",
                }}
              >
                {CATEGORY_EMOJI[report.Category || ""]} {report.Category}
              </span>
            </div>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                background: c.accentSoft,
                border: `1px solid ${c.accentMedium}`,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                }}
              >
                Prioridad:
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: priorityConfig?.color,
                  marginLeft: "6px",
                }}
              >
                {priorityConfig?.label}
              </span>
            </div>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                background: c.accentSoft,
                border: `1px solid ${c.accentMedium}`,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                }}
              >
                Fecha:
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: c.accent,
                  marginLeft: "6px",
                }}
              >
                {report.CreateDate
                  ? new Date(report.CreateDate).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                background: c.accentSoft,
                border: `1px solid ${c.accentMedium}`,
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                }}
              >
                Item ID:
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: c.accent,
                  marginLeft: "6px",
                  fontFamily: "monospace",
                }}
              >
                {report.IdItem?.slice(-8)}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div
          style={{
            visibility: can(Permissions.MODERATE) ? "visible" : "hidden",
            padding: "16px 24px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <button
            disabled={isResolved}
            onClick={() => {
              onStatusChange(report._id, REPORT_STATUS.IN_REVIEW);
              onClose();
            }}
            style={{
              flex: 1,
              padding: "9px 14px",
              borderRadius: "12px",
              border: `1.5px solid ${c.info || c.accent}33`,
              background: c.infoSoft || c.accentSoft,
              color: c.info || c.accent,
              fontSize: "12px",
              fontWeight: "700",
              cursor: isResolved ? "not-allowed" : "pointer",
              opacity: isResolved ? 0.5 : 1,
            }}
          >
            Revisar
          </button>
          <button
            disabled={isResolved}
            onClick={() => {
              onStatusChange(report._id, REPORT_STATUS.DISMISSED);
              onClose();
            }}
            style={{
              flex: 1,
              padding: "9px 14px",
              borderRadius: "12px",
              border: `1.5px solid ${c.textMuted}33`,
              background: c.accentSoft,
              color: c.textMuted,
              fontSize: "12px",
              fontWeight: "700",
              cursor: isResolved ? "not-allowed" : "pointer",
              opacity: isResolved ? 0.5 : 1,
            }}
          >
            Descartar
          </button>
          {canDeleteItem && (
            <button
              disabled={isResolved}
              onClick={() => {
                onDeleteItem(report);
                onClose();
              }}
              style={{
                flex: 1,
                padding: "9px 14px",
                borderRadius: "12px",
                border: `1.5px solid ${c.danger}33`,
                background: c.dangerSoft || "#fee2e2",
                color: c.danger,
                fontSize: "12px",
                fontWeight: "700",
                cursor: isResolved ? "not-allowed" : "pointer",
                opacity: isResolved ? 0.5 : 1,
              }}
            >
              Eliminar contenido
            </button>
          )}
          <button
            disabled={isResolved}
            onClick={() => {
              onBanUser(report._id);
              onClose();
            }}
            style={{
              flex: 1,
              padding: "9px 14px",
              borderRadius: "12px",
              border: `1.5px solid ${c.danger}33`,
              background: "transparent",
              color: c.danger,
              fontSize: "12px",
              fontWeight: "700",
              cursor: isResolved ? "not-allowed" : "pointer",
              opacity: isResolved ? 0.5 : 1,
            }}
          >
            Bannear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal optimizado ──────────────────────────────────
const Reports = () => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c: any = colors.colors;

  // Estados
  const [reports, setReports] = useState<ReportModel[]>([]);
  const [selected, setSelected] = useState<ReportModel | null>(null);
  const [filterStatus, setFilterStatus] = useState<number | "todos">("todos");
  const [filterType, setFilterType] = useState<string>("todos");
  const [filterPriority, setFilterPriority] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [globalStats, setGlobalStats] = useState({
    pendientes: 0,
    revision: 0,
    resueltos: 0,
    criticos: 0,
  });
  const itemsPerPage = 15;

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(search, 500);

  // Construir parámetros de búsqueda
  const buildSearchParams = useCallback(() => {
    let searchParams = "";

    // Agregar búsqueda por texto
    if (debouncedSearch) {
      searchParams += debouncedSearch;
    }

    return searchParams;
  }, [debouncedSearch]);

  // Cargar reportes desde la API con paginación y búsqueda
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchParams = buildSearchParams();
      const response = await reportService.getAll(page, searchParams, {
        status: filterStatus,
        type: filterType,
        priority: filterPriority,
        sortBy,
      });

      let reportsData: ReportModel[] = [];
      let totalItemsCount = 0;
      let totalPagesCount = 1;

      if (response.data && Array.isArray(response.data.data)) {
        reportsData = response.data.data;
        totalItemsCount =
          response.data.pagination?.total || response.data.data.length;
        totalPagesCount =
          response.data.pagination?.totalPages ||
          Math.ceil(totalItemsCount / itemsPerPage);
        if (response.data.stats) {
          setGlobalStats({
            pendientes: response.data.stats.pendientes || 0,
            revision: response.data.stats.revision || 0,
            resueltos: response.data.stats.resueltos || 0,
            criticos: response.data.stats.criticos || 0,
          });
        }
      } else if (Array.isArray(response.data)) {
        reportsData = response.data;
        totalItemsCount = response.data.length;
        totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage);
      } else {
        reportsData = [];
      }

      setReports(reportsData);
      setTotalItems(totalItemsCount);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.error("Error loading reports:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los reportes",
        duration: 4000,
      });
      setReports([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    itemsPerPage,
    buildSearchParams,
    filterStatus,
    filterType,
    filterPriority,
    sortBy,
    showToast,
  ]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, filterType, filterPriority, sortBy]);

  // Cargar reportes cuando cambia página o búsqueda
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Cambiar estado del reporte
  const handleStatusChange = useCallback(
    async (reportId: string, newStatus: number) => {
      try {
        await reportService.updateStatus(reportId, newStatus);
        showToast({
          type: "success",
          title: "Estado actualizado",
          description: `El reporte ahora está ${STATUS_CONFIG[newStatus]?.label}`,
          duration: 3000,
        });
        await loadReports(); // Recargar para sincronizar
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el estado del reporte",
          duration: 4000,
        });
      }
    },
    [loadReports, showToast],
  );

  // Estadísticas optimizadas (usando totalItems de la API)
  const handleDeleteItem = useCallback(
    async (reportId: string) => {
      try {
        await reportService.deleteReportedItem(reportId);
        showToast({
          type: "success",
          title: "Contenido eliminado",
          description:
            "El contenido reportado fue eliminado y el reporte quedó confirmado",
          duration: 3500,
        });
        await loadReports();
      } catch (error: any) {
        showToast({
          type: "error",
          title: "Error",
          description:
            error?.response?.data?.message ||
            "No se pudo eliminar el contenido reportado",
          duration: 4000,
        });
      }
    },
    [loadReports, showToast],
  );
  void handleDeleteItem;

  const handleDeleteReportedContent = useCallback(
    async (report: ReportModel) => {
      try {
        await reportService.deleteReportedItem(report._id!);

        let messageSent = true;

        try {
          await systemMessageService.sendUserMessage(
            {
              _id: report.IdUserReported,
              Username: report.ReportedUser?.Username,
              Name: report.ReportedUser?.Name,
              Verify: report.ReportedUser?.Verify,
              VerifyType: report.ReportedUser?.VerifyType,
              PerfilData: report.ReportedUser?.PerfilData,
              ProfilePhoto: report.ProfilePhotoUserReported,
            },
            CONTENT_DELETED_MESSAGE,
          );
        } catch (error) {
          messageSent = false;
          console.error("Error sending deleted content report message:", error);
        }

        showToast({
          type: messageSent ? "success" : "error",
          title: "Contenido eliminado",
          description: messageSent
            ? "El contenido reportado fue eliminado, el reporte quedo confirmado y se envio el mensaje al usuario"
            : "El contenido reportado fue eliminado, pero no se pudo enviar el mensaje al usuario",
          duration: messageSent ? 3500 : 5500,
        });
        await loadReports();
      } catch (error: any) {
        showToast({
          type: "error",
          title: "Error",
          description:
            error?.response?.data?.message ||
            "No se pudo eliminar el contenido reportado",
          duration: 4000,
        });
      }
    },
    [loadReports, showToast],
  );

  const handleBanUser = useCallback(
    async (reportId: string) => {
      try {
        await reportService.banReportedUser(reportId);
        showToast({
          type: "success",
          title: "Cuenta banneada",
          description:
            "La cuenta reportada fue banneada y el reporte quedó confirmado",
          duration: 3500,
        });
        await loadReports();
      } catch (error: any) {
        showToast({
          type: "error",
          title: "Error",
          description:
            error?.response?.data?.message ||
            "No se pudo bannear la cuenta reportada",
          duration: 4000,
        });
      }
    },
    [loadReports, showToast],
  );

  const handleOpenUser = useCallback(
    (username?: string) => {
      if (!username) return;
      setSelected(null);
      navigate(`/users/${username}`);
    },
    [navigate],
  );

  const stats = useMemo(() => {
    return globalStats;
  }, [globalStats]);

  // Filtros locales (aplicados después de la carga de API)
  const filteredReports = useMemo(() => {
    return Array.isArray(reports) ? reports : [];

    // Filtro por estado
    // Filtro por tipo/razón
    // Filtro por prioridad
    // Ordenamiento
  }, [reports]);

  // Resetear filtros
  const clearFilters = useCallback(() => {
    setFilterStatus("todos");
    setFilterType("todos");
    setFilterPriority("todos");
    setSearch("");
    setSortBy("date");
    setPage(1);
  }, []);

  // Obtener razón única para filtros
  const uniqueTypes = useMemo(() => {
    const types = new Set([
      ...REPORT_REASONS.map((reason) => reason.id),
      ...reports.map((r) => r.Type).filter(Boolean),
    ]);
    return Array.from(types);
  }, [reports]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .report-row {
          display: grid;
          grid-template-columns: 100px 110px 1fr 110px 120px 110px 160px;
          align-items: center;
          gap: 12px;
          padding: 13px 18px;
          border-bottom: 1px solid ${c.border};
          cursor: pointer;
          transition: background 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .report-row:last-child { border-bottom: none; }
        .report-row:hover { background: ${c.accentSoft}; }

        .filter-chip {
          padding: 6px 13px;
          border-radius: 20px;
          border: 1.5px solid ${c.border};
          background: transparent;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          color: ${c.textMuted};
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-chip:hover { border-color: ${c.accent}44; color: ${c.text}; }
        .filter-chip.active {
          background: ${c.accentMedium};
          border-color: ${c.accent}44;
          color: ${c.accent};
        }

        .search-input {
          background: ${c.inputBackground};
          border: 1.5px solid ${c.inputBorder};
          border-radius: 10px;
          padding: 8px 14px 8px 36px;
          font-size: 12px;
          color: ${c.text};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          width: 260px;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: ${c.textMuted}; }
        .search-input:focus { border-color: ${c.accent}; }

        .pill-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 22px;
          background: ${c.accent}; color: #fff; border: none;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(107,115,240,0.35);
          transition: opacity 0.15s, transform 0.15s;
        }
        .pill-cta:hover { opacity: 0.9; transform: translateY(-1px); }

        .skeleton-row {
          display: grid;
          grid-template-columns: 100px 110px 1fr 110px 120px 110px 160px;
          gap: 12px;
          padding: 13px 18px;
          border-bottom: 1px solid ${c.border};
          align-items: center;
        }

        @media (max-width: 900px) {
          .report-row {
            grid-template-columns: 100px 1fr 110px 90px;
          }
          .col-reporter, .col-category, .col-date { display: none; }
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
        {/* Header */}
        <div
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
            gap: "16px",
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
              🛡️ Centro de Reportes
            </div>
            <div
              style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}
            >
              Gestiona y resuelve los reportes de la comunidad.{" "}
              <strong style={{ color: c.danger }}>
                {stats.pendientes} pendientes
              </strong>{" "}
              requieren atención.
            </div>
          </div>
          <button
            className="pill-cta"
            onClick={() => window.open("/reports/export", "_blank")}
          >
            Exportar reportes →
          </button>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "16px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: c.warningSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🟣
            </div>
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "#5159cb",
                }}
              >
                {stats.pendientes}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#5159cb",
                }}
              >
                Pendientes
              </div>
            </div>
          </div>
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "16px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: c.infoSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🔵
            </div>
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: c.primary,
                }}
              >
                {stats.revision}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: c.textMuted,
                }}
              >
                En revisión
              </div>
            </div>
          </div>
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "16px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: c.successSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🟢
            </div>
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: c.success,
                }}
              >
                {stats.resueltos}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: c.textMuted,
                }}
              >
                Resueltos
              </div>
            </div>
          </div>
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "16px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: c.dangerSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🔴
            </div>
            <div>
              <div
                style={{ fontSize: "22px", fontWeight: "800", color: c.danger }}
              >
                {stats.criticos}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: c.textMuted,
                }}
              >
                Críticos
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div
          className="responsive-table-card reports-table"
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              padding: "16px 18px",
              borderBottom: `1.5px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
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
                placeholder="Buscar por ID, usuario..."
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
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { value: "todos", label: "🔘 Todos" },
                { value: REPORT_STATUS.PENDING, label: "🟡 Pendiente" },
                { value: REPORT_STATUS.IN_REVIEW, label: "🔵 En revisión" },
                { value: REPORT_STATUS.RESOLVED, label: "🔴 Resuelto" },
                { value: REPORT_STATUS.DISMISSED, label: "⚫ Descartado" },
              ].map((s) => (
                <button
                  key={String(s.value)}
                  className={`filter-chip${filterStatus === s.value ? " active" : ""}`}
                  onClick={() => setFilterStatus(s.value as any)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
              <button
                className={`filter-chip${sortBy === "date" ? " active" : ""}`}
                onClick={() => setSortBy("date")}
              >
                📅 Fecha
              </button>
              <button
                className={`filter-chip${sortBy === "priority" ? " active" : ""}`}
                onClick={() => setSortBy("priority")}
              >
                🔺 Prioridad
              </button>
            </div>
          </div>

          {/* Filter row */}
          <div
            style={{
              padding: "10px 18px",
              borderBottom: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: c.textMuted,
              }}
            >
              TIPO:
            </span>
            <button
              className={`filter-chip${filterType === "todos" ? " active" : ""}`}
              onClick={() => setFilterType("todos")}
            >
              Todos
            </button>
            {uniqueTypes.map((type) => {
              const reason = getReasonConfig(type as string);
              return (
                <button
                  key={type}
                  className={`filter-chip${filterType === type ? " active" : ""}`}
                  onClick={() => setFilterType(type as string)}
                >
                  {reason?.icon || "📋"} {reason?.label || type}
                </button>
              );
            })}
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: c.textMuted,
                marginLeft: "8px",
              }}
            >
              PRIORIDAD:
            </span>
            <button
              className={`filter-chip${filterPriority === "todos" ? " active" : ""}`}
              onClick={() => setFilterPriority("todos")}
            >
              Todas
            </button>
            <button
              className={`filter-chip${filterPriority === "critical" ? " active" : ""}`}
              onClick={() => setFilterPriority("critical")}
            >
              🔴 Crítica
            </button>
            <button
              className={`filter-chip${filterPriority === "high" ? " active" : ""}`}
              onClick={() => setFilterPriority("high")}
            >
              🟠 Alta
            </button>
            <button
              className={`filter-chip${filterPriority === "medium" ? " active" : ""}`}
              onClick={() => setFilterPriority("medium")}
            >
              🔵 Media
            </button>
            <button
              className={`filter-chip${filterPriority === "low" ? " active" : ""}`}
              onClick={() => setFilterPriority("low")}
            >
              🟢 Baja
            </button>
            {(filterStatus !== "todos" ||
              filterType !== "todos" ||
              filterPriority !== "todos" ||
              search) && (
                <button
                  className="filter-chip"
                  onClick={clearFilters}
                  style={{ background: c.dangerSoft, color: c.danger }}
                >
                  ✕ Limpiar filtros
                </button>
              )}
          </div>

          {/* Table header */}
          <div
            className="reports-table-header"
            style={{
              display: "grid",
              gridTemplateColumns: "80px 180px 1fr 120px 90px 100px 80px 120px",
              gap: "12px",
              padding: "10px 18px",
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            {[
              "ID",
              "Tipo",
              "Descripción",
              "Categoría",
              "Partes",
              "Estado",
              "Prioridad",
              "Fecha"
            ].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <>
              {[...Array(9)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "60px",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "70px",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "80%",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "60px",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "80px",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "70px",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "50px",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: c.accentSoft,
                      borderRadius: "4px",
                      width: "50px",
                    }}
                  />
                </div>
              ))}
            </>
          )}

          {/* Data rows */}
          {!isLoading && filteredReports.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div
                style={{ fontSize: "36px", opacity: 0.3, marginBottom: "12px" }}
              >
                🔍
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: c.textMuted,
                }}
              >
                Sin resultados
              </div>
              <div
                style={{ fontSize: "12px", color: c.border, marginTop: "4px" }}
              >
                {search
                  ? "No se encontraron reportes con esa búsqueda"
                  : "Prueba con otros filtros"}
              </div>
            </div>
          ) : (
            !isLoading &&
            filteredReports.map((report) => {
              const reason = getReasonConfig(report.Type || "");
              const status = STATUS_CONFIG[report.Status ?? 0];
              const priority = PRIORITY_CONFIG[report.Priority || "medium"];
              const category = getCategoryDisplay(report.Category);
              return (
                <div
                  key={report._id}
                  className="report-row"
                  onClick={() => setSelected(report)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 180px 1fr 120px 90px 100px 80px 120px",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: c.accent,
                      fontFamily: "monospace",
                    }}
                  >
                    {report._id?.slice(-8)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>
                      {reason?.icon || "📋"}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: c.text,
                      }}
                    >
                      {reason?.label || report.Type}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: c.textMuted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {reason?.description ||
                      report.Description ||
                      "Sin descripción"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: c.textMuted,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{category.icon}</span>
                    <span style={{ textTransform: "capitalize" }}>
                      {category.label}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: c.accentSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 700,
                        color: c.accent,
                      }}
                    >
                      <img
                        src={
                          report.ProfilePhotoUser
                            ? report.ProfilePhotoUser
                            : UserProfile
                        }
                        alt=""
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "10px", color: c.textMuted }}>
                      →
                    </span>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: c.dangerSoft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 700,
                        color: c.danger,
                      }}
                    >
                      <img
                        src={
                          report.ProfilePhotoUserReported
                            ? report.ProfilePhotoUserReported
                            : UserProfile
                        }
                        alt=""
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        background: status?.bg,
                        color: status?.color,
                      }}
                    >
                      {status?.dot} {status?.label}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        background: priority?.bg,
                        color: priority?.color,
                      }}
                    >
                      {priority?.label}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: c.textMuted }}>
                      {formatDate(`${report?.CreateDate}`)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer con paginación */}
        <div style={{ marginTop: "16px" }}>
          <Pagination
            page={page}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            search={search}
            setPage={setPage}
            c={c}
            theme={theme}
          />
        </div>
      </main>

      {/* Modal detalle */}
      <ReportDetailModal
        report={selected}
        c={c}
        theme={theme}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onDeleteItem={handleDeleteReportedContent}
        onBanUser={handleBanUser}
        onOpenUser={handleOpenUser}
      />
    </>
  );
};

export default Reports;
