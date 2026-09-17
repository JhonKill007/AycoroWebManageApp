import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { getReasonById } from "../constants/ReportsReason";
import { ReportStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import reportService from "../Services/Report/ReportService";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await reportService.getById(id);
      setReport(response.data?.data || response.data);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo cargar el caso.",
      });
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (action: "assign" | "resolve" | "dismiss" | "delete" | "ban") => {
    if (!id) return;
    setSaving(true);
    try {
      if (action === "assign") await reportService.assign(id);
      if (action === "resolve") await reportService.updateStatus(id, ReportStatus.RESOLVED);
      if (action === "dismiss") await reportService.updateStatus(id, ReportStatus.DISMISSED);
      if (action === "delete") await reportService.deleteReportedItem(id);
      if (action === "ban") await reportService.banReportedUser(id);
      showToast({ type: "success", title: "Listo", description: "La acción se aplicó al reporte." });
      await load();
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo completar la acción.",
      });
    } finally {
      setSaving(false);
    }
  };

  const reason = getReasonById(report?.Type);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: 26, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <button
        onClick={() => navigate("/moderation")}
        style={{
          marginBottom: 16,
          padding: "8px 12px",
          borderRadius: 10,
          border: `1.5px solid ${c.border}`,
          background: c.card,
          color: c.text,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        ← Volver a la cola
      </button>
      {loading ? (
        <div style={{ color: c.textMuted }}>Cargando caso...</div>
      ) : !report ? (
        <div style={{ color: c.textMuted }}>No se encontró el reporte.</div>
      ) : (
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: c.text, marginBottom: 8 }}>
            {reason?.icon || "🛡️"} {reason?.label || report.Type || "Reporte"}
          </div>
          <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 18 }}>
            {report.Category || "contenido"} · prioridad {report.Priority || "media"} · {report._id}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: c.textMuted }}>Reportante</div>
              <div style={{ fontWeight: 700, color: c.text }}>
                @{report.ReporterUser?.Username || "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: c.textMuted }}>Reportado</div>
              <div style={{ fontWeight: 700, color: c.text }}>
                @{report.ReportedUser?.Username || "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: c.textMuted }}>Asignado a</div>
              <div style={{ fontWeight: 700, color: c.text }}>
                {report.AssignedToName || "Sin asignar"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: c.textMuted }}>Estado</div>
              <div style={{ fontWeight: 700, color: c.text }}>{report.Status}</div>
            </div>
          </div>
          {(report.Description || report.Content) && (
            <div
              style={{
                background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                borderRadius: 12,
                padding: 14,
                color: c.text,
                fontSize: 13,
                lineHeight: 1.6,
                marginBottom: 18,
              }}
            >
              {report.Description || report.Content}
            </div>
          )}
          {can(Permissions.MODERATE) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: "assign", label: "Asignarme" },
                { id: "resolve", label: "Resolver" },
                { id: "dismiss", label: "Descartar" },
              ].map((action) => (
                <button
                  key={action.id}
                  disabled={saving}
                  onClick={() => runAction(action.id as any)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${c.accent}44`,
                    background: c.accentSoft,
                    color: c.accent,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {action.label}
                </button>
              ))}
              {can(Permissions.DELETE_POSTS) && (
                <button
                  disabled={saving}
                  onClick={() => runAction("delete")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(248,113,113,0.3)",
                    background: "rgba(248,113,113,0.08)",
                    color: "#f87171",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Eliminar contenido
                </button>
              )}
              {can(Permissions.SANCTION_USERS) && (
                <button
                  disabled={saving}
                  onClick={() => runAction("ban")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(248,113,113,0.3)",
                    background: "rgba(248,113,113,0.08)",
                    color: "#f87171",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Banear usuario
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default CaseDetails;
