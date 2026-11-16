import React, { useEffect, useMemo, useState } from "react";
import analyticsService from "../../Services/Analytics/AnalyticsService";

type ExportFormat = "csv" | "xlsx" | "pdf";
type ExportPeriod =
  | "7d"
  | "30d"
  | "90d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "all"
  | "custom";

type SectionOption = { id: string; label: string };

const PERIOD_OPTIONS: { value: ExportPeriod; label: string }[] = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "this_month", label: "Mes actual" },
  { value: "last_month", label: "Mes anterior" },
  { value: "this_year", label: "Año actual" },
  { value: "all", label: "Histórico completo" },
  { value: "custom", label: "Rango personalizado" },
];

const DEFAULT_SECTIONS = [
  "summary",
  "users",
  "active_users",
  "content",
  "retention",
  "funnel",
  "definitions",
];

interface ExportAnalyticsModalProps {
  c: any;
  theme: string;
  onClose: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const ExportAnalyticsModal = ({
  c,
  theme,
  onClose,
  onError,
  onSuccess,
}: ExportAnalyticsModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [period, setPeriod] = useState<ExportPeriod>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [sections, setSections] = useState<Set<string>>(
    new Set(DEFAULT_SECTIONS),
  );
  const [catalog, setCatalog] = useState<SectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    let cancelled = false;
    analyticsService
      .getExportMeta()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data?.sections || [];
        setCatalog(list);
        if (Array.isArray(res?.data?.defaults) && res.data.defaults.length) {
          setSections(new Set(res.data.defaults));
        }
      })
      .catch(() => {
        setCatalog([
          { id: "summary", label: "Resumen general" },
          { id: "users", label: "Usuarios y crecimiento" },
          { id: "active_users", label: "Usuarios activos (DAU/MAU)" },
          { id: "content", label: "Publicaciones e interacciones" },
          { id: "conversations", label: "Conversaciones y mensajes" },
          { id: "sessions", label: "Sesiones" },
          { id: "retention", label: "Retención" },
          { id: "funnel", label: "Funnel" },
          { id: "definitions", label: "Definiciones" },
        ]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allIds = useMemo(
    () => (catalog.length ? catalog.map((s) => s.id) : DEFAULT_SECTIONS),
    [catalog],
  );

  const toggleSection = (id: string) => {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSections(new Set(allIds));
  const clearAll = () => setSections(new Set());
  const resetDefaults = () => setSections(new Set(DEFAULT_SECTIONS));

  const generate = async () => {
    if (sections.size === 0) {
      onError("Seleccione al menos una sección del informe.");
      return;
    }
    if (period === "custom" && (!customStart || !customEnd)) {
      onError("Indique fecha inicial y final para el rango personalizado.");
      return;
    }
    if (period === "custom" && customStart > customEnd) {
      onError("La fecha inicial no puede ser posterior a la final.");
      return;
    }

    setLoading(true);
    try {
      const response = await analyticsService.exportAnalytics({
        format,
        period,
        customStart: period === "custom" ? customStart : undefined,
        customEnd: period === "custom" ? customEnd : undefined,
        sections: Array.from(sections),
        includeDefinitions: sections.has("definitions"),
      });

      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "application/octet-stream",
      });
      const ext = format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aycoro-analytics.${ext}`;
      link.click();
      URL.revokeObjectURL(url);
      onSuccess(`Informe ${ext.toUpperCase()} generado correctamente.`);
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "No se pudo generar el informe. Intente con un período más corto.";
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const overlayBg =
    theme === "dark" ? "rgba(0,0,0,0.65)" : "rgba(15,23,42,0.45)";
  const panelBg = c.background || (theme === "dark" ? "#0f172a" : "#ffffff");
  const border = theme === "dark" ? "#334155" : "#e2e8f0";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: overlayBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          background: panelBg,
          borderRadius: 16,
          border: `1px solid ${border}`,
          padding: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.text }}>
              Exportar Analytics
            </div>
            <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
              Genera CSV, Excel o PDF con las mismas definiciones del dashboard.
            </div>
          </div>
          <button className="pill-cta" onClick={onClose} disabled={loading}>
            Cerrar
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: c.text }}>
            Formato
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["xlsx", "csv", "pdf"] as ExportFormat[]).map((f) => (
              <button
                key={f}
                className="pill-cta"
                onClick={() => setFormat(f)}
                style={{
                  opacity: format === f ? 1 : 0.55,
                  fontWeight: format === f ? 700 : 500,
                }}
              >
                {f === "xlsx" ? "Excel (.xlsx)" : f === "csv" ? "CSV" : "PDF"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: c.text }}>
            Período
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ExportPeriod)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: theme === "dark" ? "#1e293b" : "#fff",
              color: c.text,
            }}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {period === "custom" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 10,
              }}
            >
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: theme === "dark" ? "#1e293b" : "#fff",
                  color: c.text,
                }}
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: theme === "dark" ? "#1e293b" : "#fff",
                  color: c.text,
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 600, color: c.text }}>Secciones</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="pill-cta" onClick={selectAll} type="button">
                Todo
              </button>
              <button className="pill-cta" onClick={clearAll} type="button">
                Ninguno
              </button>
              <button className="pill-cta" onClick={resetDefaults} type="button">
                Predeterminado
              </button>
            </div>
          </div>
          {loadingMeta ? (
            <div style={{ color: c.textMuted }}>Cargando opciones…</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {(catalog.length
                ? catalog
                : allIds.map((id) => ({ id, label: id }))
              ).map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    color: c.text,
                    fontSize: 13,
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: `1px solid ${border}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sections.has(item.id)}
                    onChange={() => toggleSection(item.id)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 8,
          }}
        >
          <button className="pill-cta" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="pill-cta"
            onClick={generate}
            disabled={loading}
            style={{ fontWeight: 700 }}
          >
            {loading ? "Generando…" : "Generar informe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportAnalyticsModal;
