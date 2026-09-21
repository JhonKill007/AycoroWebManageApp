import { SessionStatus } from "../../constants/Status";
import { AuthSessionModel } from "../../Models/Session/AuthSessionModel";

const formatDate = (value?: string | null) => {
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

const safe = (value: unknown, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const formatDuration = (ms?: number) => {
  const value = Math.abs(Number(ms) || 0);
  const minutes = Math.round(value / 60000);
  if (minutes < 1) return "menos de 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} d`;
};

const formatTimeRelation = (createdAt?: string, sessionDate?: string, diffMs?: number) => {
  if (diffMs == null && createdAt && sessionDate) {
    diffMs =
      new Date(sessionDate).getTime() - new Date(createdAt).getTime();
  }
  if (diffMs == null || Number.isNaN(diffMs)) return "Sin referencia de tiempo";
  if (Math.abs(diffMs) < 60000) return "Casi al mismo momento del inicio de sesion";
  if (diffMs >= 0) {
    return `${formatDuration(diffMs)} despues del inicio de sesion`;
  }
  return `${formatDuration(diffMs)} antes del inicio de sesion`;
};

function InfoRow({
  label,
  value,
  c,
}: {
  label: string;
  value: string;
  c: any;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          color: c.textMuted,
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: c.text,
          fontSize: 13,
          fontWeight: 800,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}

type AuthSessionDetailModalProps = {
  c: any;
  theme: string;
  session: AuthSessionModel | null;
  loading?: boolean;
  activating?: boolean;
  error?: string;
  onClose: () => void;
  onActivate: () => void;
};

const AuthSessionDetailModal = ({
  c,
  theme,
  session,
  loading = false,
  activating = false,
  error = "",
  onClose,
  onActivate,
}: AuthSessionDetailModalProps) => {
  const notification = session?.NotificationSession;
  const canActivate =
    !!notification && notification.Status === SessionStatus.DESACTIVE;
  const username = session?.User?.Username || session?.User?.Name;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.38)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          overflow: "auto",
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          boxShadow: "0 22px 70px rgba(0,0,0,0.32)",
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            borderBottom: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
              AuthSession
            </div>
            <div style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>
              {username ? `@${username}` : "Inicio de sesion"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.textMuted,
              borderRadius: 10,
              height: 34,
              padding: "0 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 16 }}>
          {loading ? (
            <div style={{ padding: 28, textAlign: "center", color: c.textMuted, fontWeight: 800 }}>
              Cargando detalle...
            </div>
          ) : !session ? (
            <div style={{ padding: 28, textAlign: "center", color: c.textMuted, fontWeight: 800 }}>
              No se encontro esta AuthSession.
            </div>
          ) : (
            <>
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

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background: session.IsActive ? c.successSoft : c.dangerSoft,
                    color: session.IsActive ? c.success : c.danger,
                    borderRadius: 999,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {session.IsActive ? "Activa" : session.IsRevoked ? "Revocada" : "Expirada"}
                </span>
                <span
                  style={{
                    background: c.accentSoft,
                    color: c.accent,
                    borderRadius: 999,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {safe(session.DeviceOS, "OS desconocido")}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                  gap: 14,
                }}
              >
                <InfoRow label="Usuario" value={username ? `@${username}` : safe(session.UserId)} c={c} />
                <InfoRow label="Email" value={safe(session.User?.Email)} c={c} />
                <InfoRow label="UserId" value={safe(session.UserId)} c={c} />
                <InfoRow label="AuthSession id" value={safe(session._id)} c={c} />
                <InfoRow label="Dispositivo" value={safe(session.DeviceModel)} c={c} />
                <InfoRow label="DeviceId" value={safe(session.DeviceId)} c={c} />
                <InfoRow label="Version" value={safe(session.AppVersion)} c={c} />
                <InfoRow label="IP" value={safe(session.Ip)} c={c} />
                <InfoRow label="Pais" value={safe(session.Country)} c={c} />
                <InfoRow label="Ciudad" value={safe(session.City)} c={c} />
                <InfoRow label="Inicio" value={formatDate(session.CreatedAt)} c={c} />
                <InfoRow label="Access expira" value={formatDate(session.ExpiresAt)} c={c} />
                <InfoRow
                  label="Refresh expira"
                  value={formatDate(session.RefreshTokenExpiresAt)}
                  c={c}
                />
                <InfoRow label="Revocada" value={formatDate(session.RevokedAt)} c={c} />
              </div>

              <div
                style={{
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 16,
                  padding: 16,
                  background: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(107,115,240,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ color: c.text, fontSize: 14, fontWeight: 900 }}>
                      Sesion de notificaciones
                    </div>
                    <div style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>
                      {!notification
                        ? "Este usuario no tiene Session de notificaciones."
                        : notification.MatchSource === "LAST_REGISTERED"
                          ? "No hay Session activa. Se muestra la ultima registrada."
                          : "Session de notificaciones activa de este usuario."}
                    </div>
                  </div>
                  {notification && (
                    <span
                      style={{
                        background: notification.IsActive ? c.successSoft : c.warningSoft,
                        color: notification.IsActive ? c.success : c.warning,
                        borderRadius: 999,
                        padding: "5px 10px",
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      {notification.IsActive ? "Activa" : "Desactivada"}
                    </span>
                  )}
                </div>

                {!notification ? (
                  <div style={{ color: c.textMuted, fontSize: 13, fontWeight: 800 }}>
                    No hay una Session de notificaciones para este usuario.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ color: c.text, fontSize: 12, fontWeight: 800 }}>
                      {formatTimeRelation(
                        session.CreatedAt,
                        notification.CreateDate,
                        notification.TimeDiffMs,
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                        gap: 14,
                      }}
                    >
                      <InfoRow label="Session id" value={safe(notification._id)} c={c} />
                      <InfoRow label="OS" value={safe(notification.DeviceOS)} c={c} />
                      <InfoRow label="Tipo" value={safe(notification.Type)} c={c} />
                      <InfoRow label="Idioma" value={safe(notification.Language)} c={c} />
                      <InfoRow label="IP" value={safe(notification.IP)} c={c} />
                      <InfoRow label="Ubicacion" value={`${safe(notification.City)}, ${safe(notification.Country)}`} c={c} />
                      <InfoRow label="Creada" value={formatDate(notification.CreateDate)} c={c} />
                      <InfoRow
                        label="DeviceToken"
                        value={safe(notification.DeviceToken)}
                        c={c}
                      />
                    </div>
                    {canActivate && (
                      <button
                        onClick={onActivate}
                        disabled={activating}
                        style={{
                          justifySelf: "start",
                          border: "none",
                          background: c.accent,
                          color: "#fff",
                          borderRadius: 12,
                          minHeight: 42,
                          padding: "0 16px",
                          fontWeight: 900,
                          cursor: activating ? "wait" : "pointer",
                          opacity: activating ? 0.7 : 1,
                        }}
                      >
                        {activating
                          ? "Activando..."
                          : "Activar registro de notificaciones"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSessionDetailModal;
