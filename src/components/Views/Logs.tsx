import { useEffect, useMemo, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import {
  ErrorLogGroup,
  ErrorLogModel,
  ErrorLogResponse,
} from "../Models/ErrorLog/ErrorLogModel";
import { Pagination } from "../Modules/Common/Components/Pagination";
import errorLogService from "../Services/ErrorLog/ErrorLogService";

const emptyResponse: ErrorLogResponse = {
  data: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  stats: {
    total: 0,
    errors: 0,
    warnings: 0,
    unresolved: 0,
    resolved: 0,
  },
  groups: [],
  filters: {
    levels: [],
    sources: [],
    platforms: [],
  },
};

const statusLabel: Record<number, string> = {
  1: "Abierto",
  2: "Resuelto",
};

const levelLabel: Record<string, string> = {
  error: "Error",
  warning: "Warning",
  warn: "Warning",
  info: "Info",
  debug: "Debug",
  fatal: "Fatal",
};

const getLevelColor = (level: string | undefined, c: any) => {
  const normalized = String(level || "").toLowerCase();
  if (normalized === "error" || normalized === "fatal") return c.danger;
  if (normalized === "warning" || normalized === "warn") return c.warning;
  if (normalized === "info") return c.accent;
  return c.textMuted;
};

const shortId = (id = "") => id.slice(-8) || "-";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const safeText = (value: unknown, fallback = "-") => {
  const text = String(value || "").trim();
  return text || fallback;
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function StatCard({
  label,
  value,
  color,
  c,
}: {
  label: string;
  value: number;
  color: string;
  c: any;
}) {
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: 16,
        padding: "16px 18px",
        minWidth: 0,
        boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
      }}
    >
      <div
        style={{
          color,
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: c.textMuted,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function LogRow({
  log,
  selected,
  onClick,
  c,
}: {
  log: ErrorLogModel;
  selected: boolean;
  onClick: () => void;
  c: any;
}) {
  const levelColor = getLevelColor(log.Level, c);
  const status = Number(log.Status || 1);

  return (
    <div
      className="log-row"
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "8px 120px 92px 140px minmax(0,1fr) 140px 110px",
        gap: 12,
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: `1px solid ${c.border}`,
        background: selected ? c.accentSoft : "transparent",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: levelColor,
          boxShadow: `0 0 0 4px ${levelColor}22`,
        }}
      />
      <span style={{ color: c.textMuted, fontSize: 12, fontWeight: 700 }}>
        {formatDateTime(log.CreateDate)}
      </span>
      <span
        style={{
          color: levelColor,
          background: `${levelColor}18`,
          border: `1px solid ${levelColor}33`,
          borderRadius: 999,
          padding: "6px 10px",
          fontSize: 11,
          fontWeight: 900,
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {levelLabel[String(log.Level || "").toLowerCase()] || safeText(log.Level)}
      </span>
      <span style={{ color: c.textMuted, fontSize: 12, fontWeight: 800 }}>
        {safeText(log.Source)} / {safeText(log.Platform)}
      </span>
      <span
        style={{
          color: c.text,
          fontSize: 13,
          fontWeight: 700,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {log.Message}
      </span>
      <span style={{ color: c.textMuted, fontSize: 12, overflowWrap: "anywhere" }}>
        {log.IdUser ? `User ${shortId(log.IdUser)}` : "Sin usuario"}
      </span>
      <span
        style={{
          color: status === 2 ? c.success : c.warning,
          background: `${status === 2 ? c.success : c.warning}18`,
          borderRadius: 999,
          padding: "6px 10px",
          textAlign: "center",
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        {statusLabel[status] || `Status ${status}`}
      </span>
    </div>
  );
}

function GroupPanel({
  groups,
  c,
}: {
  groups: ErrorLogGroup[];
  c: any;
}) {
  const max = Math.max(...groups.map((group) => group.count), 1);

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
      }}
    >
      {groups.length === 0 ? (
        <div style={{ color: c.textMuted, fontSize: 13 }}>
          No hay grupos para los filtros actuales.
        </div>
      ) : (
        groups.map((group) => (
          <div
            key={String(group.key)}
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: 14,
              padding: 12,
              background: c.inputBackground,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <strong
                style={{
                  color: c.text,
                  fontSize: 13,
                  overflowWrap: "anywhere",
                }}
              >
                {safeText(group.key)}
              </strong>
              <span style={{ color: c.accent, fontSize: 12, fontWeight: 900 }}>
                {group.count}
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: c.border,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: `${Math.max(6, (group.count / max) * 100)}%`,
                  height: "100%",
                  background: c.accent,
                }}
              />
            </div>
            <div style={{ color: c.textMuted, fontSize: 11, fontWeight: 700 }}>
              {group.errors} errores · {group.warnings} warnings · ultimo{" "}
              {formatDateTime(group.latest)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function DetailPanel({
  log,
  c,
  onResolve,
  resolving,
}: {
  log: ErrorLogModel | null;
  c: any;
  onResolve: () => void;
  resolving: boolean;
}) {
  if (!log) {
    return (
      <div style={{ color: c.textMuted, fontSize: 13 }}>
        Selecciona un registro para ver stack, endpoint, dispositivo y contexto.
      </div>
    );
  }

  const status = Number(log.Status || 1);
  const details = [
    ["ID", log._id],
    ["Fecha", formatDateTime(log.CreateDate)],
    ["Usuario", log.IdUser],
    ["Pantalla", log.Screen],
    ["Accion", log.Action],
    ["Endpoint", log.Endpoint],
    ["Metodo", log.Method],
    ["Codigo", log.StatusCode],
    ["Version", log.AppVersion],
    ["Dispositivo", log.DeviceModel],
    ["OS", log.OsVersion],
    ["Resuelto", formatDateTime(log.ResolvedDate)],
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div
          style={{
            color: getLevelColor(log.Level, c),
            fontSize: 11,
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {safeText(log.Level)}
        </div>
        <h3 style={{ margin: 0, color: c.text, fontSize: 17, lineHeight: 1.4 }}>
          {log.Message}
        </h3>
      </div>

      {status !== 2 && (
        <button
          onClick={onResolve}
          disabled={resolving}
          className="pill-cta"
          style={{
            justifyContent: "center",
            background: c.success,
            boxShadow: "none",
            opacity: resolving ? 0.7 : 1,
          }}
        >
          {resolving ? "Guardando..." : "Marcar como resuelto"}
        </button>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,minmax(0,1fr))",
          gap: 10,
        }}
      >
        {details.map(([label, value]) => (
          <div
            key={label}
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: 10,
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: c.textMuted,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {label}
            </div>
            <div
              style={{
                color: c.text,
                fontSize: 12,
                fontWeight: 700,
                overflowWrap: "anywhere",
              }}
            >
              {safeText(value)}
            </div>
          </div>
        ))}
      </div>

      {log.Stack && (
        <pre
          style={{
            margin: 0,
            padding: 12,
            maxHeight: 220,
            overflow: "auto",
            border: `1px solid ${c.border}`,
            borderRadius: 12,
            background: c.inputBackground,
            color: c.text,
            fontSize: 11,
            whiteSpace: "pre-wrap",
          }}
        >
          {log.Stack}
        </pre>
      )}

      {log.Extra && (
        <pre
          style={{
            margin: 0,
            padding: 12,
            maxHeight: 180,
            overflow: "auto",
            border: `1px solid ${c.border}`,
            borderRadius: 12,
            background: c.inputBackground,
            color: c.textMuted,
            fontSize: 11,
            whiteSpace: "pre-wrap",
          }}
        >
          {log.Extra}
        </pre>
      )}

      {log.Breadcrumbs && log.Breadcrumbs.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <strong style={{ color: c.text, fontSize: 12 }}>Breadcrumbs</strong>
          {log.Breadcrumbs.map((item, index) => (
            <div
              key={`${item}-${index}`}
              style={{
                color: c.textMuted,
                fontSize: 12,
                borderLeft: `3px solid ${c.accent}`,
                paddingLeft: 10,
                overflowWrap: "anywhere",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailModal({
  log,
  c,
  onClose,
  onResolve,
  resolving,
}: {
  log: ErrorLogModel;
  c: any;
  onClose: () => void;
  onResolve: () => void;
  resolving: boolean;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="log-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="log-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-log-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{ background: c.card, border: `1px solid ${c.border}` }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            padding: "18px 20px",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div>
            <h2
              id="error-log-detail-title"
              style={{ margin: 0, color: c.text, fontSize: 18 }}
            >
              Detalle del ErrorLog
            </h2>
            <div style={{ color: c.textMuted, fontSize: 11, marginTop: 4 }}>
              ID {log._id}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `1px solid ${c.border}`,
              background: c.inputBackground,
              color: c.text,
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ×
          </button>
        </header>
        <div className="log-modal-content">
          <DetailPanel
            log={log}
            c={c}
            onResolve={onResolve}
            resolving={resolving}
          />
        </div>
      </section>
    </div>
  );
}

function ExportModal({
  c,
  onClose,
  onExport,
}: {
  c: any;
  onClose: () => void;
  onExport: (
    dateFrom: string,
    dateTo: string,
    format: "json" | "csv",
  ) => Promise<void>;
}) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState(formatDateInput(monthStart));
  const [dateTo, setDateTo] = useState(formatDateInput(today));
  const [format, setFormat] = useState<"json" | "csv">("csv");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !exporting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exporting, onClose]);

  const handleExport = async () => {
    if (!dateFrom || !dateTo) {
      setExportError("Selecciona ambas fechas.");
      return;
    }
    if (dateFrom > dateTo) {
      setExportError("La fecha desde no puede ser posterior a la fecha hasta.");
      return;
    }

    setExporting(true);
    setExportError("");
    try {
      await onExport(dateFrom, dateTo, format);
      onClose();
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "No se pudo exportar los registros.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="log-modal-backdrop"
      role="presentation"
      onMouseDown={() => !exporting && onClose()}
    >
      <section
        className="log-modal export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-log-export-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{ background: c.card, border: `1px solid ${c.border}` }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            padding: "18px 20px",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div>
            <h2
              id="error-log-export-title"
              style={{ margin: 0, color: c.text, fontSize: 18 }}
            >
              Exportar ErrorLog
            </h2>
            <div style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>
              Se aplicarán también los filtros activos de la tabla.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={exporting}
            aria-label="Cerrar exportación"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `1px solid ${c.border}`,
              background: c.inputBackground,
              color: c.text,
              cursor: exporting ? "not-allowed" : "pointer",
              fontSize: 20,
            }}
          >
            ×
          </button>
        </header>

        <div className="log-modal-content" style={{ display: "grid", gap: 18 }}>
          <div className="export-date-grid">
            <label style={{ display: "grid", gap: 7 }}>
              <span style={{ color: c.textMuted, fontSize: 11, fontWeight: 900 }}>
                DESDE
              </span>
              <input
                className="log-search"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>
            <label style={{ display: "grid", gap: 7 }}>
              <span style={{ color: c.textMuted, fontSize: 11, fontWeight: 900 }}>
                HASTA
              </span>
              <input
                className="log-search"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                max={formatDateInput(today)}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </label>
          </div>

          <div>
            <div
              style={{
                color: c.textMuted,
                fontSize: 11,
                fontWeight: 900,
                marginBottom: 8,
              }}
            >
              TIPO DE DOCUMENTO
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["csv", "json"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormat(item)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${
                      format === item ? c.accent : c.border
                    }`,
                    background:
                      format === item ? c.accentSoft : c.inputBackground,
                    color: format === item ? c.accent : c.text,
                    cursor: "pointer",
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              color: c.textMuted,
              background: c.inputBackground,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: 12,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            La descarga será un archivo ZIP. Dentro encontrarás documentos
            numerados con un máximo de 500 registros cada uno.
          </div>

          {exportError && (
            <div
              role="alert"
              style={{
                color: c.danger,
                background: `${c.danger}12`,
                border: `1px solid ${c.danger}33`,
                borderRadius: 12,
                padding: 12,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {exportError}
            </div>
          )}
        </div>

        <footer
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "16px 20px",
            borderTop: `1px solid ${c.border}`,
          }}
        >
          <button
            type="button"
            className="pill-cta"
            onClick={onClose}
            disabled={exporting}
            style={{ background: c.inputBackground, color: c.text, boxShadow: "none" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="pill-cta"
            onClick={handleExport}
            disabled={exporting}
            style={{ opacity: exporting ? 0.7 : 1 }}
          >
            {exporting ? "Preparando archivos..." : `Exportar ${format.toUpperCase()}`}
          </button>
        </footer>
      </section>
    </div>
  );
}

const Logs = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [response, setResponse] = useState<ErrorLogResponse>(emptyResponse);
  const [selected, setSelected] = useState<ErrorLogModel | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [level, setLevel] = useState("todos");
  const [source, setSource] = useState("todos");
  const [platform, setPlatform] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [groupBy, setGroupBy] = useState("day");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [level, source, platform, status, groupBy]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    errorLogService
      .getAll({
        page,
        limit: 12,
        search: debouncedSearch,
        level,
        source,
        platform,
        status,
        groupBy,
      })
      .then((data) => {
        if (!alive) return;
        setResponse(data);
        setSelected((current) => {
          if (!current) return null;
          return data.data.find((item) => item._id === current._id) || null;
        });
      })
      .catch(() => {
        if (!alive) return;
        setError("No se pudieron cargar los ErrorLog.");
        setResponse(emptyResponse);
        setSelected(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [page, debouncedSearch, level, source, platform, status, groupBy]);

  const groupTitle = useMemo(() => {
    const labels: Record<string, string> = {
      day: "Agrupado por dia",
      level: "Agrupado por nivel",
      source: "Agrupado por source",
      platform: "Agrupado por plataforma",
      status: "Agrupado por estado",
      screen: "Agrupado por pantalla",
    };
    return labels[groupBy] || "Agrupaciones";
  }, [groupBy]);

  const resolveSelected = async () => {
    if (!selected) return;
    setResolving(true);
    try {
      await errorLogService.resolve(selected._id);
      const next = await errorLogService.getAll({
        page,
        limit: 12,
        search: debouncedSearch,
        level,
        source,
        platform,
        status,
        groupBy,
      });
      setResponse(next);
      setSelected(next.data.find((item) => item._id === selected._id) || null);
    } finally {
      setResolving(false);
    }
  };

  const exportLogs = async (
    dateFrom: string,
    dateTo: string,
    format: "json" | "csv",
  ) => {
    const from = new Date(`${dateFrom}T00:00:00.000`);
    const to = new Date(`${dateTo}T23:59:59.999`);
    const blob = await errorLogService.export({
      dateFrom: from.toISOString(),
      dateTo: to.toISOString(),
      format,
      search: debouncedSearch,
      level,
      source,
      platform,
      status,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `error-logs_${dateFrom}_${dateTo}_${format}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .pill-cta {
          display:inline-flex; align-items:center; gap:8px;
          padding:9px 16px; border-radius:999px;
          background:${c.accent}; color:#fff; border:none;
          font-size:12px; font-weight:800; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif;
          box-shadow:0 4px 16px rgba(107,115,240,0.22);
        }
        .log-search, .select-f {
          background:${c.inputBackground};
          border:1.5px solid ${c.inputBorder};
          color:${c.text};
          border-radius:12px;
          padding:10px 12px;
          font:700 12px 'Plus Jakarta Sans',sans-serif;
          outline:none;
          min-height:42px;
        }
        .log-search { min-width:260px; }
        .select-f { cursor:pointer; }
        .logs-shell {
          flex:1; overflow:hidden; display:flex; flex-direction:column;
          gap:16px; padding:26px; font-family:'Plus Jakarta Sans',sans-serif;
        }
        .logs-toolbar {
          display:flex; align-items:center; gap:10px; flex-wrap:wrap;
        }
        .logs-grid {
          flex:1; min-height:0; display:grid;
          grid-template-columns:minmax(0,1fr) 340px;
          gap:16px;
        }
        .logs-panel {
          background:${c.card}; border:1.5px solid ${c.border};
          border-radius:18px; overflow:hidden; min-width:0;
          box-shadow:0 2px 20px rgba(107,115,240,0.06);
        }
        .logs-scroll { overflow:auto; min-height:0; }
        .logs-table-header {
          display:grid; grid-template-columns:8px 120px 92px 140px minmax(0,1fr) 140px 110px;
          gap:12px; padding:10px 16px; border-bottom:1px solid ${c.border};
          color:${c.textMuted}; font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
        }
        .log-modal-backdrop {
          position:fixed; inset:0; z-index:2000;
          display:flex; align-items:center; justify-content:center;
          padding:20px; background:rgba(2,6,23,.68);
          backdrop-filter:blur(5px);
        }
        .log-modal {
          width:min(760px,100%); max-height:min(88dvh,900px);
          display:flex; flex-direction:column; overflow:hidden;
          border-radius:20px; box-shadow:0 30px 90px rgba(0,0,0,.38);
        }
        .log-modal.export-modal { width:min(560px,100%); }
        .log-modal-content { padding:20px; overflow:auto; min-height:0; }
        .export-date-grid {
          display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px;
        }
        .export-date-grid .log-search { width:100%; min-width:0; }
        @media (max-width: 1100px) {
          .logs-grid { grid-template-columns:minmax(0,1fr); }
        }
        @media (max-width: 768px) {
          .logs-shell { padding:14px; overflow:auto; }
          .logs-toolbar { align-items:stretch; flex-direction:column; }
          .logs-toolbar > * { width:100%; }
          .log-modal-backdrop { padding:10px; align-items:flex-end; }
          .log-modal { max-height:92dvh; border-radius:18px 18px 0 0; }
          .export-date-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <main className="logs-shell">
        <section
          className="responsive-page-banner"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#0f1520,#1a1a30)"
                : "linear-gradient(135deg,#f0f4ff,#ededff)",
            border: `1.5px solid ${c.accentMedium}`,
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: c.text, fontSize: 20 }}>
              ErrorLog
            </h2>
            <p style={{ margin: "6px 0 0", color: c.textMuted, fontSize: 13 }}>
              Registros tecnicos de errores, estados, pantalla, endpoint y dispositivo.
            </p>
          </div>
          <button
            className="pill-cta"
            onClick={() => setShowExportModal(true)}
          >
            Exportar
          </button>
        </section>

        <section
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,minmax(0,1fr))",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <StatCard label="Total" value={response.stats.total} color={c.accent} c={c} />
          <StatCard label="Errores" value={response.stats.errors} color={c.danger} c={c} />
          <StatCard label="Warnings" value={response.stats.warnings} color={c.warning} c={c} />
          <StatCard label="Abiertos" value={response.stats.unresolved} color={c.warning} c={c} />
          <StatCard label="Resueltos" value={response.stats.resolved} color={c.success} c={c} />
        </section>

        <section className="logs-toolbar">
          <input
            className="log-search"
            placeholder="Buscar mensaje, stack, usuario, endpoint..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="select-f" value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="todos">Todos los niveles</option>
            {response.filters.levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="select-f" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="todos">Todos los sources</option>
            {response.filters.sources.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="select-f" value={platform} onChange={(event) => setPlatform(event.target.value)}>
            <option value="todos">Todas las plataformas</option>
            {response.filters.platforms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="select-f" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="1">Abiertos</option>
            <option value="2">Resueltos</option>
          </select>
          <select className="select-f" value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
            <option value="day">Agrupar por dia</option>
            <option value="level">Agrupar por nivel</option>
            <option value="source">Agrupar por source</option>
            <option value="platform">Agrupar por plataforma</option>
            <option value="status">Agrupar por estado</option>
            <option value="screen">Agrupar por pantalla</option>
          </select>
        </section>

        {error && (
          <div
            style={{
              color: c.danger,
              background: `${c.danger}12`,
              border: `1px solid ${c.danger}33`,
              borderRadius: 14,
              padding: 12,
              fontWeight: 800,
            }}
          >
            {error}
          </div>
        )}

        <section className="logs-grid logs-responsive-layout">
          <div className="logs-panel" style={{ display: "flex", flexDirection: "column" }}>
            <div className="logs-table-header">
              <span />
              <span>Fecha</span>
              <span>Nivel</span>
              <span>Source</span>
              <span>Mensaje</span>
              <span>Usuario</span>
              <span>Estado</span>
            </div>
            <div className="logs-scroll" style={{ flex: 1 }}>
              {loading ? (
                <div style={{ padding: 40, color: c.textMuted, textAlign: "center", fontWeight: 800 }}>
                  Cargando ErrorLog...
                </div>
              ) : response.data.length === 0 ? (
                <div style={{ padding: 40, color: c.textMuted, textAlign: "center", fontWeight: 800 }}>
                  No hay registros con esos filtros.
                </div>
              ) : (
                response.data.map((log) => (
                  <LogRow
                    key={log._id}
                    log={log}
                    c={c}
                    selected={selected?._id === log._id}
                    onClick={() => setSelected(log)}
                  />
                ))
              )}
          </div>
            <div style={{ borderTop: `1px solid ${c.border}` }}>
              <Pagination
                page={page}
                totalPages={Math.max(response.pagination.totalPages, 1)}
                itemsPerPage={response.pagination.limit}
                totalItems={response.pagination.total}
                search={search}
                setPage={setPage}
                c={c}
                theme={theme}
              />
            </div>
          </div>

          <aside className="logs-panel logs-scroll" style={{ padding: 16 }}>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ margin: "0 0 10px", color: c.text, fontSize: 15 }}>
                {groupTitle}
              </h3>
              <GroupPanel groups={response.groups} c={c} />
            </div>
          </aside>
        </section>
      </main>
      {selected && (
        <DetailModal
          log={selected}
          c={c}
          onClose={() => setSelected(null)}
          onResolve={resolveSelected}
          resolving={resolving}
        />
      )}
      {showExportModal && (
        <ExportModal
          c={c}
          onClose={() => setShowExportModal(false)}
          onExport={exportLogs}
        />
      )}
    </>
  );
};

export default Logs;
