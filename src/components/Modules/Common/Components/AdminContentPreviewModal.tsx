import { useNavigate } from "react-router-dom";
import UserProfile from "../../../assets/UserProfile.jpeg";

type AdminContentPreviewModalProps = {
  item: any | null;
  kind?: "post" | "history";
  c: any;
  theme: string;
  onClose: () => void;
  loading?: boolean;
};

const isVideoItem = (item: any) => {
  const mime = String(item?.MediaMimeType || "").toLowerCase();
  const type = String(item?.MediaType || "").toLowerCase();
  return mime.startsWith("video/") || type === "video" || type === "2";
};

const AdminContentPreviewModal = ({
  item,
  kind = "post",
  c,
  theme,
  onClose,
  loading = false,
}: AdminContentPreviewModalProps) => {
  const navigate = useNavigate();

  if (!item && !loading) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.42)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 22,
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1.5px solid ${c.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
              {kind === "history" ? "Detalle de historia" : "Detalle de publicación"}
            </div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
              {loading
                ? "Cargando..."
                : `ID: ${String(item?._id || "").slice(-8) || "—"}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: c.card,
              color: c.textMuted,
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>

        <div style={{ padding: 22, display: "grid", gap: 16 }}>
          {loading ? (
            <div style={{ color: c.textMuted, fontSize: 13, padding: "24px 0" }}>
              Cargando contenido...
            </div>
          ) : (
            <>
              {item?.MediaData && (
                <div
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: c.accentSoft,
                  }}
                >
                  {isVideoItem(item) ? (
                    <video
                      src={item.MediaData}
                      controls
                      playsInline
                      preload="metadata"
                      style={{
                        width: "100%",
                        maxHeight: "70vh",
                        display: "block",
                        objectFit: "contain",
                        background: "#000",
                      }}
                    />
                  ) : (
                    <img
                      src={item.MediaData}
                      alt={kind === "history" ? "Historia" : "Publicación"}
                      style={{
                        width: "100%",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={item?.ProfilePhoto || UserProfile}
                  alt=""
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${c.accent}44`,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = UserProfile;
                  }}
                />
                <div>
                  {item?.Username ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/users/${item.Username}`);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        fontFamily: "inherit",
                        fontSize: 14,
                        fontWeight: 800,
                        color: c.accent,
                        cursor: "pointer",
                      }}
                    >
                      @{item.Username}
                    </button>
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>
                      Usuario
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                    {item?.CreateDate
                      ? new Date(item.CreateDate).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>

              {(item?.Description || item?.OverlayText) && (
                <div
                  style={{
                    fontSize: 14,
                    color: c.text,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.Description || item.OverlayText}
                </div>
              )}

              {kind === "post" && (
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 12,
                    color: c.textMuted,
                    fontWeight: 700,
                  }}
                >
                  <span>❤️ {item?.Likes ?? 0}</span>
                  <span>💬 {item?.Comments ?? 0}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContentPreviewModal;
