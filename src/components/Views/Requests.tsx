import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import {
  RequestModel,
  RequestStatus,
  RequestType,
  ServiceOwnershipData,
  VerificationData,
} from "../Models/Request/RequestModel";
import { RequestParams } from "../Models/Request/RequestParams";
import { Pagination } from "../Modules/Common/Components/Pagination";
import { formatDate } from "../Modules/Settings/Common/Utils";
import requestService from "../Services/Request/RequestService";
import systemMessageService from "../Services/SystemMessage/SystemMessageService";

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pendiente", color: "#6b7280", bg: "rgba(107,114,128,0.14)" },
  IN_REVIEW: { label: "En revision", color: Colors.detailAppColor, bg: "rgba(107,115,240,0.14)" },
  APPROVED: { label: "Aprobada", color: "#16a34a", bg: "rgba(22,163,74,0.13)" },
  REJECTED: { label: "Rechazada", color: "#dc2626", bg: "rgba(220,38,38,0.13)" },
};

const TYPE_CONFIG: Record<RequestType, { label: string; icon: string }> = {
  VERIFICATION: { label: "Verificacion", icon: "V" },
  SERVICE_OWNERSHIP: { label: "Propiedad de servicio", icon: "S" },
};

const EMPTY_STATS = {
  pending: 0,
  review: 0,
  approved: 0,
  rejected: 0,
};

const VERIFY_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  green: { label: "Green", color: "#16a34a", bg: "rgba(22,163,74,0.14)" },
  blue: { label: "Blue", color: "#2563eb", bg: "rgba(37,99,235,0.14)" },
  gold: { label: "Gold", color: "#d97706", bg: "rgba(217,119,6,0.14)" },
};

const VERIFICATION_APPROVED_MESSAGE = `✅ Verificación aprobada

¡Tu solicitud fue aprobada! 🎉

Nos complace informarte que tu cuenta ha sido verificada exitosamente.

A partir de ahora, tu perfil mostrará la insignia de verificación correspondiente, ayudando a que otros usuarios identifiquen tu cuenta con mayor confianza y autenticidad.

Gracias por formar parte de Aycoro. 💜`;

const VERIFICATION_REJECTED_MESSAGE = `❌ Verificación denegada

No pudimos aprobar tu solicitud.

Tras revisar la información proporcionada, tu solicitud de verificación no cumple actualmente con los requisitos necesarios para ser aprobada.

Esto no afecta el funcionamiento de tu cuenta y podrás enviar una nueva solicitud cuando dispongas de información o documentación adicional que respalde tu verificación.

Gracias por tu comprensión. 💜`;

const GREEN_VERIFICATION_NAME_TEMPLATE =
  "Hola {nombre}, solicitaste la verificación verde y para ella el nombre de tu cuenta debe ser mínimo un nombre y un apellido como está en tus documentos de identidad, cambia tu nombre para poder otorgarte la verificación";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const getUserName = (request: RequestModel) =>
  request.User?.Username || request.User?.Name || request.idUser?.slice(-8) || "Usuario";

const getDisplayName = (request: RequestModel) =>
  request.User?.Name || request.User?.Username || request.idUser?.slice(-8) || "Usuario";

const getVerifyType = (request: RequestModel) =>
  request.requestType === "VERIFICATION"
    ? ((request.metadata as VerificationData)?.verifyType || "").toLowerCase()
    : "";

const getDocumentUrl = (document: any) =>
  document.MediaData?.Url ||
  (document.mediaData as any)?.Url ||
  document.mediaData?.Value ||
  "";

const isImageDocument = (document: any, url: string) => {
  const mimeType = document.MediaData?.MimeType || (document.mediaData as any)?.MimeType || "";
  const type = document.MediaData?.Type || document.mediaData?.Type || "";

  return (
    mimeType.toLowerCase().startsWith("image/") ||
    type.toLowerCase() === "image" ||
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(url)
  );
};

const getMetadataRows = (request: RequestModel) => {
  if (request.requestType === "VERIFICATION") {
    const metadata = request.metadata as VerificationData;
    return [
      ["Tipo de verificacion", metadata?.verifyType || "N/A"],
      ["Categoria", metadata?.category || "N/A"],
    ];
  }

  const metadata = request.metadata as ServiceOwnershipData;
  return [
    ["Servicio", metadata?.idItem || "N/A"],
    ["Tipo de item", metadata?.itemType || "N/A"],
    ["Motivo", metadata?.ownershipReason || "N/A"],
    ["Negocio", metadata?.businessName || "N/A"],
    ["Telefono", metadata?.contactPhone || "N/A"],
    ["Email", metadata?.contactEmail || "N/A"],
  ];
};

function RequestDetailModal({
  request,
  c,
  theme,
  onClose,
  onStatusChange,
  onReject,
  onApply,
  onSendMessage,
  isWorking,
}: {
  request: RequestModel | null;
  c: any;
  theme: string;
  onClose: () => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
  onReject: (id: string) => void;
  onApply: (id: string) => void;
  onSendMessage: (request: RequestModel, message: string) => void;
  isWorking: boolean;
}) {
  const navigate = useNavigate();
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [message, setMessage] = useState("");
  const [previewDocument, setPreviewDocument] = useState<{
    title: string;
    url: string;
    isImage: boolean;
  } | null>(null);

  if (!request) return null;

  const status = STATUS_CONFIG[request.status || "PENDING"];
  const type = TYPE_CONFIG[request.requestType || "VERIFICATION"];
  const isClosed = request.status === "APPROVED" || request.status === "REJECTED";
  const disabled = isWorking || isClosed;
  const reviewDisabled = disabled || request.status === "IN_REVIEW";
  const verifyType = getVerifyType(request);
  const verifyConfig = VERIFY_TYPE_CONFIG[verifyType];
  const username = request.User?.Username;
  const canSendMessage = Boolean(message.trim());
  const requesterName = request.User?.Name || request.User?.Username || "usuario";
  const greenVerificationNameMessage =
    GREEN_VERIFICATION_NAME_TEMPLATE.replace("{nombre}", requesterName);

  return (
    <div className="request-modal-backdrop" onClick={onClose}>
      <div className="request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="request-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="request-type-icon">{type.icon}</div>
            <div>
              <div className="eyebrow">{type.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>
                Solicitud #{request._id?.slice(-8)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="status-pill" style={{ background: status.bg, color: status.color }}>
              {status.label}
            </span>
            <button className="icon-button" onClick={onClose}>x</button>
          </div>
        </div>

        <div className="request-modal-body">
          <section>
            <div className="eyebrow">Solicitante</div>
            <div
              className="person-card clickable"
              onClick={() => username && navigate(`/users/${username}`)}
              title={username ? `Abrir perfil de ${username}` : undefined}
            >
              <img
                src={request.ProfilePhotoUser || UserProfile}
                alt=""
                className="avatar"
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: c.text }}>
                  {getDisplayName(request)}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
                  {request.User?.Username ? `@${request.User.Username}` : request.idUser}
                  {request.User?.Email ? ` • ${request.User.Email}` : ""}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="eyebrow">Descripcion</div>
            <div className="text-box">{request.description || "Sin descripcion"}</div>
          </section>

          <section>
            <div className="eyebrow">Datos de la solicitud</div>
            <div className="metadata-grid">
              {getMetadataRows(request).map(([label, value]) => (
                <div className="metadata-item" key={label}>
                  <span>{label}</span>
                  {label === "Tipo de verificacion" && verifyConfig ? (
                    <strong
                      className="metadata-badge"
                      style={{
                        background: verifyConfig.bg,
                        color: verifyConfig.color,
                        borderColor: `${verifyConfig.color}44`,
                      }}
                    >
                      {verifyConfig.label}
                    </strong>
                  ) : label === "Categoria" ? (
                    <strong className="metadata-badge app-badge">{value}</strong>
                  ) : (
                    <strong>{value}</strong>
                  )}
                </div>
              ))}
            </div>
          </section>

          {request.links && request.links.length > 0 && (
            <section>
              <div className="eyebrow">Links</div>
              <div style={{ display: "grid", gap: 8 }}>
                {request.links.map((link) => (
                  <a className="link-row" key={link} href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                ))}
              </div>
            </section>
          )}

          {request.documents && request.documents.length > 0 && (
            <section>
              <div className="eyebrow">Documentos</div>
              <div className="documents-grid">
                {request.documents.map((document, index) => {
                  const url = getDocumentUrl(document);
                  const isImage = isImageDocument(document, url);
                  const title = `${document.documentType || "Documento"} - ${document.side || "single"}`;
                  return (
                    <div
                      className="document-card"
                      key={`${document.idMediaData}-${index}`}
                      onClick={() => url && setPreviewDocument({ title, url, isImage })}
                    >
                      {url ? (
                        isImage ? (
                          <img className="document-thumb" src={url} alt={title} />
                        ) : (
                          <div className="document-file-thumb">DOC</div>
                        )
                      ) : (
                        <div className="document-file-thumb">N/A</div>
                      )}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: c.text }}>
                          {document.documentType}
                        </div>
                        <div style={{ fontSize: 11, color: c.textMuted }}>
                          Lado: {document.side}
                        </div>
                        {url && <span className="document-open">Ver grande</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        <div className="request-actions">
          <button
            className="action-button secondary"
            onClick={() => setShowMessageComposer(true)}
            type="button"
          >
            Enviar mensaje
          </button>
          <button
            className="action-button secondary"
            disabled={reviewDisabled}
            onClick={() => request._id && onStatusChange(request._id, "IN_REVIEW")}
          >
            Marcar en revision
          </button>
          <button
            className="action-button danger"
            disabled={disabled}
            onClick={() => request._id && onReject(request._id)}
          >
            Rechazar
          </button>
          <button
            className="action-button success"
            disabled={disabled}
            onClick={() => request._id && onApply(request._id)}
          >
            Aplicar accion
          </button>
        </div>
      </div>

      {showMessageComposer && (
        <div
          className="message-modal-backdrop"
          onClick={(event) => {
            event.stopPropagation();
            setShowMessageComposer(false);
            setMessage("");
          }}
        >
          <div className="message-modal" onClick={(event) => event.stopPropagation()}>
            <div className="message-modal-header">
              <div>
                <div className="eyebrow">Mensaje al solicitante</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: c.text, marginTop: 3 }}>
                  Enviar mensaje
                </div>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  setShowMessageComposer(false);
                  setMessage("");
                }}
                type="button"
              >
                x
              </button>
            </div>
            <div className="message-modal-body">
              <button
                className="message-template-button"
                onClick={() => setMessage(greenVerificationNameMessage)}
                type="button"
              >
                Usar plantilla: nombre requerido para verificación verde
              </button>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escribe el mensaje que deseas enviar..."
                rows={7}
              />
            </div>
            <div className="message-modal-actions">
              <button
                className="action-button secondary"
                onClick={() => {
                  setShowMessageComposer(false);
                  setMessage("");
                }}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="action-button success"
                disabled={!canSendMessage}
                onClick={() => {
                  if (!canSendMessage) return;
                  onSendMessage(request, message.trim());
                  setMessage("");
                  setShowMessageComposer(false);
                }}
                type="button"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {previewDocument && (
        <div
          className="document-preview-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewDocument(null);
          }}
        >
          <div className="document-preview" onClick={(e) => e.stopPropagation()}>
            <div className="document-preview-header">
              <strong>{previewDocument.title}</strong>
              <button className="icon-button" onClick={() => setPreviewDocument(null)}>
                x
              </button>
            </div>
            {previewDocument.isImage ? (
              <img src={previewDocument.url} alt={previewDocument.title} />
            ) : (
              <iframe title={previewDocument.title} src={previewDocument.url} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Requests = () => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const c: any = (theme === "dark" ? Colors.dark : Colors.light).colors;

  const [requests, setRequests] = useState<RequestModel[]>([]);
  const [selected, setSelected] = useState<RequestModel | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "todos">("todos");
  const [filterType, setFilterType] = useState<RequestType | "todos">("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const itemsPerPage = 10;
  const debouncedSearch = useDebounce(search, 500);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await requestService.getAll(
        page,
        debouncedSearch,
        filterStatus,
        filterType,
      );
      const data = response.data?.data || [];
      const pagination = response.data?.pagination;
      const counters = response.data?.counters;
      setRequests(data);
      setTotalItems(pagination?.total || data.length);
      setTotalPages(pagination?.totalPages || 1);
      setStats({
        pending: counters?.pending || 0,
        review: counters?.inReview || 0,
        approved: counters?.approved || 0,
        rejected: counters?.rejected || 0,
      });
    } catch (error) {
      console.error("Error loading requests:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar las solicitudes",
        duration: 4000,
      });
      setRequests([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, filterStatus, filterType, showToast]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, filterType]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const refreshSelected = (updated: RequestModel) => {
    setRequests((prev) =>
      prev.map((request) => (request._id === updated._id ? updated : request)),
    );
    setSelected(updated);
  };

  const sendRequestMessage = async (request: RequestModel, message: string) => {
    await systemMessageService.sendRequestMessage(request, message);
  };

  const sendAutomaticVerificationMessage = async (
    request: RequestModel | null,
    message: string,
  ) => {
    if (request?.requestType !== "VERIFICATION") return true;

    try {
      await sendRequestMessage(request, message);
      return true;
    } catch (error) {
      console.error("Error sending automatic verification message:", error);
      return false;
    }
  };

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    setIsWorking(true);
    try {
      const model = new RequestParams();
      model._id = id;
      model.status = status;
      const response = await requestService.updateStatus(model);
      refreshSelected(response.data);
      setSelected(null);
      await loadRequests();
      showToast({
        type: "success",
        title: "Estado actualizado",
        description: `La solicitud ahora esta ${STATUS_CONFIG[status].label}`,
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar la solicitud",
        duration: 4000,
      });
    } finally {
      setIsWorking(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsWorking(true);
    try {
      const currentRequest = selected;
      const response = await requestService.reject(id);
      const messageSent = await sendAutomaticVerificationMessage(
        currentRequest,
        VERIFICATION_REJECTED_MESSAGE,
      );
      refreshSelected(response.data);
      setSelected(null);
      await loadRequests();
      showToast({
        type: messageSent ? "success" : "error",
        title: "Solicitud rechazada",
        description: messageSent
          ? "La solicitud fue marcada como rechazada y el mensaje fue enviado"
          : "La solicitud fue rechazada, pero no se pudo enviar el mensaje automatico",
        duration: messageSent ? 3000 : 5000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        duration: 4000,
      });
    } finally {
      setIsWorking(false);
    }
  };

  const handleApply = async (id: string) => {
    setIsWorking(true);
    try {
      const currentRequest = selected;
      const response = await requestService.apply(id);
      const messageSent = await sendAutomaticVerificationMessage(
        currentRequest,
        VERIFICATION_APPROVED_MESSAGE,
      );
      refreshSelected(response.data.request);
      setSelected(null);
      await loadRequests();
      showToast({
        type: messageSent ? "success" : "error",
        title: "Solicitud aprobada",
        description: messageSent
          ? response.data.message || "La accion fue aplicada correctamente y el mensaje fue enviado"
          : "La solicitud fue aprobada, pero no se pudo enviar el mensaje automatico",
        duration: messageSent ? 4000 : 5000,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        description: error.response?.data?.message || "No se pudo aplicar la solicitud",
        duration: 4000,
      });
    } finally {
      setIsWorking(false);
    }
  };

  const handleSendMessage = async (request: RequestModel, message: string) => {
    setIsWorking(true);
    try {
      await sendRequestMessage(request, message);
      showToast({
        type: "success",
        title: "Mensaje enviado",
        description: "El mensaje fue enviado al solicitante",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error sending request message:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo enviar el mensaje",
        duration: 4000,
      });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <style>{`
        .requests-main{flex:1;overflow:auto;padding:24px;background:${c.background};font-family:'Plus Jakarta Sans',sans-serif;}
        .requests-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px;}
        .page-title{font-size:24px;font-weight:900;color:${c.text};letter-spacing:0;}
        .page-subtitle{font-size:12px;color:${c.textMuted};margin-top:4px;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:12px;margin-bottom:18px;}
        .stat-card{background:${c.card};border:1.5px solid ${c.border};border-radius:16px;padding:16px;}
        .stat-label{font-size:11px;font-weight:700;color:${c.textMuted};}
        .stat-value{font-size:24px;font-weight:900;color:${c.text};margin-top:6px;}
        .request-panel{background:${c.card};border:1.5px solid ${c.border};border-radius:18px;overflow:hidden;}
        .toolbar{padding:14px 16px;border-bottom:1.5px solid ${c.border};display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
        .request-search{width:280px;background:${c.inputBackground};border:1.5px solid ${c.inputBorder};border-radius:10px;padding:9px 12px;font-size:13px;color:${c.text};outline:none;}
        .chip{border:1.5px solid ${c.border};background:transparent;color:${c.textMuted};border-radius:10px;padding:8px 11px;font-size:11px;font-weight:800;cursor:pointer;}
        .chip.active{background:${c.accentMedium};border-color:${c.accent}55;color:${c.accent};}
        .requests-table-head,.request-row{display:grid;grid-template-columns:90px 170px 1fr 170px 120px 100px;gap:12px;align-items:center;}
        .requests-table-head{padding:10px 16px;background:${theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"};border-bottom:1px solid ${c.border};}
        .requests-table-head div{font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${c.textMuted};}
        .request-row{padding:13px 16px;border-bottom:1px solid ${c.border};cursor:pointer;transition:background 0.16s;}
        .request-row:hover{background:${c.accentSoft};}
        .status-pill{display:inline-flex;align-items:center;border-radius:999px;padding:4px 10px;font-size:10px;font-weight:900;white-space:nowrap;}
        .type-badge{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:800;color:${c.text};}
        .request-type-badge{display:inline-flex;width:max-content;max-width:100%;align-items:center;gap:8px;border:1px solid ${c.accent}44;background:${c.accentSoft};color:${c.accent};border-radius:999px;padding:5px 10px;font-size:11px;font-weight:900;white-space:nowrap;}
        .type-icon,.request-type-icon{width:28px;height:28px;border-radius:9px;background:${c.accentSoft};color:${c.accent};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;}
        .request-type-badge .type-icon{width:20px;height:20px;border-radius:999px;background:${c.accentMedium};font-size:10px;}
        .avatar{width:34px;height:34px;border-radius:50%;object-fit:cover;}
        .person-card{display:flex;align-items:center;gap:10px;background:${theme === "dark" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)"};border:1px solid ${c.border};border-radius:12px;padding:10px;}
        .person-card.clickable{cursor:pointer;transition:border-color 0.16s,background 0.16s;}
        .person-card.clickable:hover{border-color:${c.accent};background:${c.accentSoft};}
        .eyebrow{font-size:10px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:${c.textMuted};}
        .request-modal-backdrop{position:fixed;inset:0;background:${theme === "dark" ? "rgba(0,0,0,0.76)" : "rgba(0,0,0,0.42)"};z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);}
        .request-modal{width:100%;max-width:720px;max-height:88vh;overflow:hidden;background:${c.card};border:1.5px solid ${c.border};border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,0.35);display:flex;flex-direction:column;}
        .request-modal-header{padding:18px 22px;border-bottom:1.5px solid ${c.border};display:flex;align-items:center;justify-content:space-between;gap:14px;}
        .request-modal-body{padding:20px 22px;display:grid;gap:18px;overflow:auto;}
        .icon-button{width:30px;height:30px;border-radius:8px;border:1.5px solid ${c.border};background:${c.card};color:${c.textMuted};cursor:pointer;font-weight:800;}
        .text-box{background:${theme === "dark" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)"};border:1px solid ${c.border};border-radius:12px;padding:12px 14px;font-size:13px;color:${c.text};line-height:1.55;margin-top:8px;}
        .metadata-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:8px;}
        .metadata-item{border:1px solid ${c.border};border-radius:12px;padding:10px;background:${c.accentSoft};}
        .metadata-item span{display:block;font-size:10px;font-weight:800;color:${c.textMuted};margin-bottom:4px;}
        .metadata-item strong{font-size:12px;color:${c.text};word-break:break-word;}
        .metadata-badge{display:inline-flex;width:max-content;max-width:100%;border:1px solid ${c.border};border-radius:999px;padding:5px 10px;font-size:11px;font-weight:900;text-transform:uppercase;line-height:1;}
        .metadata-badge.app-badge{background:${c.accentSoft};color:${c.accent};border-color:${c.accent}44;}
        .link-row{border:1px solid ${c.border};border-radius:10px;padding:9px 11px;color:${c.accent};font-size:12px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .documents-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:8px;}
        .document-card{border:1px solid ${c.border};border-radius:12px;padding:10px;background:${theme === "dark" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)"};display:grid;grid-template-columns:82px 1fr;gap:10px;align-items:center;cursor:pointer;transition:border-color 0.16s,background 0.16s;}
        .document-card:hover{border-color:${c.accent};background:${c.accentSoft};}
        .document-thumb{width:82px;height:72px;border-radius:10px;object-fit:cover;border:1px solid ${c.border};background:${c.inputBackground};}
        .document-file-thumb{width:82px;height:72px;border-radius:10px;border:1px solid ${c.border};background:${c.accentSoft};color:${c.accent};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;}
        .document-open{display:inline-block;margin-top:5px;font-size:11px;font-weight:900;color:${c.accent};}
        .document-preview-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:1200;display:flex;align-items:center;justify-content:center;padding:22px;}
        .document-preview{width:min(960px,96vw);height:min(860px,92vh);background:${c.card};border:1.5px solid ${c.border};border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 90px rgba(0,0,0,0.55);}
        .document-preview-header{height:52px;padding:0 16px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between;color:${c.text};font-size:13px;}
        .document-preview img{width:100%;height:calc(100% - 52px);object-fit:contain;background:#050508;}
        .document-preview iframe{width:100%;height:calc(100% - 52px);border:0;background:#fff;}
        .message-modal-backdrop{position:fixed;inset:0;background:${theme === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.38)"};z-index:1100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);}
        .message-modal{width:100%;max-width:560px;background:${c.card};border:1.5px solid ${c.border};border-radius:18px;box-shadow:0 22px 70px rgba(0,0,0,0.35);overflow:hidden;}
        .message-modal-header{padding:16px 18px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .message-modal-body{padding:16px 18px;display:grid;gap:10px;}
        .message-template-button{width:100%;border:1px solid ${c.accent}44;background:${c.accentSoft};color:${c.accent};border-radius:12px;padding:10px 12px;font-size:12px;font-weight:900;text-align:left;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;}
        .message-template-button:hover{border-color:${c.accent};}
        .message-modal-body textarea{width:100%;resize:vertical;min-height:150px;border:1px solid ${c.inputBorder};border-radius:12px;background:${c.inputBackground};color:${c.text};font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.55;padding:12px;outline:none;}
        .message-modal-body textarea:focus{border-color:${c.accent};}
        .message-modal-actions{padding:14px 18px;border-top:1px solid ${c.border};display:flex;gap:10px;justify-content:flex-end;}
        .request-actions{padding:16px 22px;border-top:1.5px solid ${c.border};display:flex;gap:10px;justify-content:flex-end;}
        .action-button{border:1.5px solid ${c.border};border-radius:11px;padding:10px 14px;font-size:12px;font-weight:900;cursor:pointer;}
        .action-button:disabled{opacity:0.55;cursor:not-allowed;}
        .action-button.secondary{background:${c.accentSoft};color:${c.accent};border-color:${c.accent}44;}
        .action-button.danger{background:rgba(220,38,38,0.12);color:#dc2626;border-color:rgba(220,38,38,0.25);}
        .action-button.success{background:rgba(22,163,74,0.12);color:#16a34a;border-color:rgba(22,163,74,0.25);}
        .empty-state{padding:46px;text-align:center;color:${c.textMuted};font-size:13px;font-weight:800;}
        @media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)}.requests-table-head,.request-row{grid-template-columns:80px 150px 1fr 110px}.hide-mobile{display:none}.metadata-grid,.documents-grid{grid-template-columns:1fr}}
      `}</style>

      <main className="requests-main">
        <div className="requests-header">
          <div>
            <div className="page-title">Solicitudes</div>
            <div className="page-subtitle">
              Revision de verificaciones y reclamos de propiedad de servicio.
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Pendientes</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">En revision</div>
            <div className="stat-value">{stats.review}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Aprobadas</div>
            <div className="stat-value">{stats.approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rechazadas</div>
            <div className="stat-value">{stats.rejected}</div>
          </div>
        </div>

        <div className="request-panel">
          <div className="toolbar">
            <input
              className="request-search"
              placeholder="Buscar por usuario, estado, tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {(["todos", "PENDING", "IN_REVIEW", "APPROVED", "REJECTED"] as const).map(
              (status) => (
                <button
                  key={status}
                  className={`chip${filterStatus === status ? " active" : ""}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "todos" ? "Todos" : STATUS_CONFIG[status].label}
                </button>
              ),
            )}
            <div style={{ flex: 1 }} />
            {(["todos", "VERIFICATION", "SERVICE_OWNERSHIP"] as const).map((type) => (
              <button
                key={type}
                className={`chip${filterType === type ? " active" : ""}`}
                onClick={() => setFilterType(type)}
              >
                {type === "todos" ? "Todos los tipos" : TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>

          <div className="requests-table-head">
            <div>ID</div>
            <div>Tipo</div>
            <div>Usuario</div>
            <div className="hide-mobile">Descripcion</div>
            <div>Estado</div>
            <div className="hide-mobile">Creado</div>
          </div>

          {isLoading ? (
            <div className="empty-state">Cargando solicitudes...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">No hay solicitudes para mostrar</div>
          ) : (
            requests.map((request) => {
              const status = STATUS_CONFIG[request.status || "PENDING"];
              const type = TYPE_CONFIG[request.requestType || "VERIFICATION"];
              return (
                <div
                  className="request-row"
                  key={request._id}
                  onClick={() => setSelected(request)}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: c.accent, fontFamily: "monospace" }}>
                    {request._id?.slice(-8)}
                  </div>
                  <div className="request-type-badge">
                    <span className="type-icon">{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <img src={request.ProfilePhotoUser || UserProfile} alt="" className="avatar" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getUserName(request)}
                      </div>
                      <div style={{ fontSize: 10, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {request.User?.Email || request.idUser}
                      </div>
                    </div>
                  </div>
                  <div className="hide-mobile" style={{ fontSize: 12, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {request.description || "Sin descripcion"}
                  </div>
                  <div>
                    <span className="status-pill" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="hide-mobile" style={{ fontSize: 11, color: c.textMuted }}>
                    {request.createdDate ? formatDate(`${request.createdDate}`) : "N/A"}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 16 }}>
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

      <RequestDetailModal
        request={selected}
        c={c}
        theme={theme}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onReject={handleReject}
        onApply={handleApply}
        onSendMessage={handleSendMessage}
        isWorking={isWorking}
      />
    </>
  );
};

export default Requests;
