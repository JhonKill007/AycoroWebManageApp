import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { REPORT_REASONS } from "../constants/ReportsReason";
import { MessageType } from "../constants/Types";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import { ReportModel } from "../Models/Report/ReportModel";
import reportService from "../Services/Report/ReportService";
import systemMessageService from "../Services/SystemMessage/SystemMessageService";

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: "Pendiente", color: "#b45309" },
  2: { label: "En revisión", color: "#6d28d9" },
  3: { label: "Resuelto", color: "#dc2626" },
  4: { label: "Descartado", color: "#6c7c9b" },
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const CATEGORY_LABEL: Record<string, string> = {
  message: "Mensaje",
  post: "Publicación",
  publication: "Publicación",
  story: "Historia",
  history: "Historia",
  comment: "Comentario",
  user: "Usuario",
  group: "Grupo",
  service: "Servicio",
  account: "Cuenta",
};

const MESSAGE_TYPE_LABEL: Record<string, string> = {
  TEXT: "Texto",
  IMAGE: "Imagen",
  VIDEO: "Video",
  AUDIO: "Audio",
  STICKER: "Sticker",
  PUBLICATION: "Publicación",
  STORY: "Historia",
  USER: "Perfil",
  SERVICE: "Servicio",
  LINK: "Enlace",
  POLL: "Encuesta",
  LOCATION: "Ubicación",
};

const REPORT_STATUS = {
  IN_REVIEW: 2,
  RESOLVED: 3,
  DISMISSED: 4,
};

const isVideo = (url?: string, mediaType?: string) => {
  const type = String(mediaType || "").toLowerCase();
  return type.includes("video") || /\.(mp4|mov|m4v|webm)(\?|#|$)/i.test(url || "");
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;
  const [report, setReport] = useState<ReportModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await reportService.getById(id);
      setReport(result.data?.data || result.data || null);
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo cargar el reporte",
      });
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const changeStatus = async (status: number) => {
    if (!report?._id) return;
    try {
      await reportService.updateStatus(report._id, status);
      await load();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        description: error?.response?.data?.message || "No se pudo actualizar el reporte",
      });
    }
  };

  const sendToReporter = async () => {
    if (!report?.IdUser) return;
    const item = report.ReportedItem;
    const quoted = String(report.Content || item?.description || "").trim();
    const text = [note.trim(), quoted].filter(Boolean).join("\n\n");
    const category = String(report.Category || "").toLowerCase();
    const parentType = String(item?.parentType || "").toLowerCase();
    let type: string = MessageType.TEXT;
    let idMedia: string | undefined;

    if (parentType === "post" || ["post", "publication"].includes(category)) {
      type = MessageType.PUBLICATION;
      idMedia = item?.parentId || report.IdItem;
    } else if (parentType === "story" || ["story", "history"].includes(category)) {
      type = MessageType.STORY;
      idMedia = item?.parentId || report.IdItem;
    } else if (category === "service") {
      type = MessageType.SERVICE;
      idMedia = report.IdItem;
    } else if (report.IdUserReported) {
      type = MessageType.USER;
      idMedia = report.IdUserReported;
    }

    if (!text && !idMedia) return;
    setSending(true);
    try {
      await systemMessageService.sendUserMessage(
        {
          _id: report.IdUser,
          Username: report.ReporterUser?.Username,
          Name: report.ReporterUser?.Name,
          ProfilePhoto: report.ProfilePhotoUser,
        },
        text || report.ReportedUser?.Username || "Aycoro",
        { type, idMedia },
      );
      setNote("");
      showToast({
        type: "success",
        title: "Mensaje enviado",
        description: "Se envió el mensaje a quien reportó",
      });
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <main style={{ padding: 26, color: c.textMuted }}>Cargando reporte...</main>;
  }

  if (!report) {
    return <main style={{ padding: 26, color: c.textMuted }}>Reporte no encontrado.</main>;
  }

  const reason = REPORT_REASONS.find((item) => item.id === report.Type);
  const status = STATUS_CONFIG[report.Status || 0];
  const categoryKey = String(report.Category || "").toLowerCase();
  const category = CATEGORY_LABEL[categoryKey] || report.Category;
  const canDeleteContent = [
    "post",
    "publication",
    "publicacion",
    "publicación",
    "comment",
    "comentario",
    "story",
    "history",
    "historia",
  ].includes(categoryKey);
  const item = report.ReportedItem;
  const messageLabel = MESSAGE_TYPE_LABEL[String(item?.messageType || "").toUpperCase()];
  const resolved = report.Status === REPORT_STATUS.RESOLVED;
  const canModerate = can(Permissions.MODERATE);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: 26 }}>
      <button type="button" onClick={() => navigate("/reports")} style={backButtonStyle(c)}>
        <span aria-hidden="true">←</span>
        Volver
      </button>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: reason?.color || c.accent }}>
        {(reason?.label || report.Type || "Reporte").toUpperCase()}
      </div>
      <h1 style={{ margin: "6px 0 18px", color: c.text, fontSize: 22 }}>
        Reporte #{report._id?.slice(-8)}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 520px) minmax(280px, 1fr)", gap: 18, alignItems: "start" }}>
        <section style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, overflow: "hidden" }}>
          {item?.mediaUrl ? (
            isVideo(item.mediaUrl, item.mediaType) ? (
              <video src={item.mediaUrl} controls style={{ width: "100%", maxHeight: 640, background: "#111" }} />
            ) : item.messageType === "AUDIO" || String(item.mediaType || "").toLowerCase().includes("audio") ? (
              <audio src={item.mediaUrl} controls style={{ width: "100%", padding: 16 }} />
            ) : (
              <img src={item.mediaUrl} alt="" style={{ width: "100%", display: "block", maxHeight: 640, objectFit: "contain", background: "#111" }} />
            )
          ) : null}
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: c.textMuted, fontWeight: 700 }}>
              {category}
              {messageLabel ? ` · ${messageLabel}` : ""}
            </div>
            <div style={{ marginTop: 10, color: c.text, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {item?.description || report.Content || item?.unavailableReason || "Este reporte no incluye contenido visible."}
            </div>
            {item?.parentType === "post" && item.parentId ? (
              <button type="button" onClick={() => navigate(`/publications/${item.parentId}`)} style={linkStyle(c)}>
                Abrir publicación
              </button>
            ) : null}
            {item?.parentType === "story" && item.parentId ? (
              <button type="button" onClick={() => navigate(`/stories/${item.parentId}`)} style={linkStyle(c)}>
                Abrir historia
              </button>
            ) : null}
            {item?.parentUsername ? (
              <button type="button" onClick={() => navigate(`/users/${item.parentUsername}`)} style={linkStyle(c)}>
                Abrir perfil compartido
              </button>
            ) : null}
          </div>
        </section>

        <div style={{ display: "grid", gap: 18 }}>
          <section style={panelStyle(c)}>
            <div style={{ color: c.textMuted, fontSize: 12, fontWeight: 700 }}>Descripción del reporte</div>
            <div style={{ marginTop: 8, color: c.text, fontWeight: 800 }}>{reason?.label || report.Type}</div>
            {reason?.description ? <div style={{ marginTop: 4, color: c.textMuted, fontSize: 13 }}>{reason.description}</div> : null}
            {report.Description ? <div style={{ marginTop: 8, color: c.text, fontSize: 14 }}>"{report.Description}"</div> : null}
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
              <span style={{ color: status?.color || c.text }}>{status?.label || "Sin estado"}</span>
              <span style={{ color: c.textMuted }}>{PRIORITY_LABEL[report.Priority || ""] || report.Priority}</span>
              <span style={{ color: c.textMuted }}>
                {report.CreateDate ? new Date(report.CreateDate).toLocaleString() : ""}
              </span>
            </div>
          </section>

          <PersonCard
            title="Reportado por"
            name={report.ReporterUser?.Name}
            username={report.ReporterUser?.Username}
            email={report.ReporterUser?.Email}
            photo={report.ProfilePhotoUser}
            c={c}
            onOpen={() => report.ReporterUser?.Username && navigate(`/users/${report.ReporterUser.Username}`)}
          />
          <PersonCard
            title="Usuario reportado"
            name={report.ReportedUser?.Name}
            username={report.ReportedUser?.Username}
            email={report.ReportedUser?.Email}
            photo={report.ProfilePhotoUserReported}
            extra={`${report.ConfirmedReports || 0} reportes confirmados`}
            c={c}
            onOpen={() => report.ReportedUser?.Username && navigate(`/users/${report.ReportedUser.Username}`)}
            action={
              canModerate && can(Permissions.SANCTION_USERS) ? (
                <ActionButton
                  disabled={resolved}
                  label="Bannear cuenta"
                  onClick={async () => {
                    if (!report._id) return;
                    await reportService.banReportedUser(report._id);
                    await load();
                  }}
                  color={c.danger}
                />
              ) : null
            }
          />

          {canModerate ? (
            <section style={panelStyle(c)}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ActionButton disabled={resolved} label="Revisar" onClick={() => void changeStatus(REPORT_STATUS.IN_REVIEW)} color={c.accent} />
                <ActionButton disabled={resolved} label="Descartar" onClick={() => void changeStatus(REPORT_STATUS.DISMISSED)} color={c.textMuted} />
                <ActionButton disabled={resolved} label="Resuelto" onClick={() => void changeStatus(REPORT_STATUS.RESOLVED)} color="#16a34a" />
              </div>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Mensaje para quien reportó"
                rows={4}
                style={{
                  width: "100%",
                  marginTop: 12,
                  borderRadius: 12,
                  border: `1px solid ${c.border}`,
                  background: "transparent",
                  color: c.text,
                  padding: 12,
                  font: "inherit",
                }}
              />
              <ActionButton disabled={sending} label="Enviar mensaje al reportante" onClick={() => void sendToReporter()} color={c.accent} />
            </section>
          ) : null}
        </div>
      </div>
      {canDeleteContent && canModerate && can(Permissions.DELETE_POSTS) ? (
        <section style={{ ...panelStyle(c), marginTop: 18 }}>
          <div style={{ color: c.text, fontWeight: 800, marginBottom: 6 }}>Contenido reportado</div>
          <div style={{ color: c.textMuted, fontSize: 13, marginBottom: 8 }}>
            Cambia el estado del contenido a eliminado. Los otros reportes de este mismo contenido quedan resueltos.
          </div>
          <ActionButton
            label="Eliminar contenido"
            color={c.danger}
            onClick={async () => {
              if (!report._id) return;
              try {
                await reportService.deleteReportedItem(report._id);
                showToast({
                  type: "success",
                  title: "Contenido eliminado",
                  description: "El contenido cambió de estado y los reportes abiertos quedaron resueltos",
                });
                await load();
              } catch (error: any) {
                showToast({
                  type: "error",
                  title: "Error",
                  description: error?.response?.data?.message || "No se pudo eliminar el contenido",
                });
              }
            }}
          />
        </section>
      ) : null}
    </main>
  );
};

const backButtonStyle = (c: any) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 16,
  padding: "8px 14px",
  borderRadius: 12,
  border: `1px solid ${c.border}`,
  background: c.card,
  color: c.text,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
});

const panelStyle = (c: any) => ({
  background: c.card,
  border: `1px solid ${c.border}`,
  borderRadius: 16,
  padding: 16,
});

const linkStyle = (c: any) => ({
  marginTop: 12,
  border: "none",
  background: "transparent",
  color: c.accent,
  cursor: "pointer",
  padding: 0,
  fontWeight: 700,
  font: "inherit",
});

const PersonCard = ({
  title,
  name,
  username,
  email,
  photo,
  extra,
  action,
  c,
  onOpen,
}: {
  title: string;
  name?: string;
  username?: string;
  email?: string;
  photo?: string;
  extra?: string;
  action?: React.ReactNode;
  c: any;
  onOpen: () => void;
}) => (
  <section style={panelStyle(c)}>
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",
        border: "none",
        background: "transparent",
        textAlign: "left",
        cursor: username ? "pointer" : "default",
        color: c.text,
        font: "inherit",
        padding: 0,
      }}
    >
      <div style={{ fontSize: 12, color: c.textMuted, fontWeight: 700 }}>{title}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
        <img src={photo || UserProfile} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
        <span>
          <strong style={{ display: "block" }}>{name || username || "Usuario"}</strong>
          <span style={{ display: "block", color: c.textMuted, fontSize: 13 }}>{username ? `@${username}` : ""}</span>
          {email ? <span style={{ display: "block", color: c.textMuted, fontSize: 12 }}>{email}</span> : null}
          {extra ? <span style={{ display: "block", color: c.danger, fontSize: 12, marginTop: 4 }}>{extra}</span> : null}
        </span>
      </div>
    </button>
    {action}
  </section>
);

const ActionButton = ({
  label,
  onClick,
  disabled,
  color,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color: string;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={{
      marginTop: 8,
      border: `1px solid ${color}55`,
      background: "transparent",
      color,
      borderRadius: 12,
      padding: "9px 14px",
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {label}
  </button>
);

export default ReportDetail;
