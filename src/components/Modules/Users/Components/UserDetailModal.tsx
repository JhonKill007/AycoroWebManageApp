import { useNavigate } from "react-router-dom";
import IconVerify from "../../../assets/img/verified-badge-profile-icon-png.webp";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { UserStatus, VerificationStatus } from "../../../constants/Status";
import { useThemeContext } from "../../../context/ThemeContext";
import { UserPerfilModel } from "../../../Models/User/UserPerfilModel";
import { formatDate } from "../../Settings/Common/Utils";
import UserStatusBadge from "./UserStatusBadge";
import { Permissions } from "../../../constants/Permissions";
import { usePermissions } from "../../../hooks/usePermissions";

export const UserDetailModal = ({
  user,
  onAction,
  onClose,
}: {
  user: UserPerfilModel;
  onAction: (id: string, status: number) => void;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const AVATAR_PALETTE: any = [
    "#7b83f5",
    "#f87171",
    "#34d399",
    "#fbbf24",
    "#60a5fa",
    "#a78bfa",
    "#fb923c",
    "#e879f9",
    "#4ade80",
    "#f472b6",
  ];


  function getAvatarColor(name: string) {
    return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
  }

  const bg = getAvatarColor(user.User?.Username!);

  const ACTIONS = [
    {
      key: "suspendido",
      label: "⏸ Suspender",
      color: c.text,
      bg: c.warning,
      function: () => {
        onAction(user.User?._id!, UserStatus.SUSPENDED);
      },
      show: user.User?.Status === UserStatus.ACTIVE,
    },
    {
      key: "activo",
      label: "✅ Reactivar",
      color: c.text,
      bg: c.success,
      function: () => {
        onAction(user.User?._id!, UserStatus.ACTIVE);
      },
      show: user.User?.Status === UserStatus.SUSPENDED,
    },
    {
      key: "activo",
      label: "✅ Reactivar",
      color: c.text,
      bg: c.success,
      function: () => {
        onAction(user.User?._id!, UserStatus.ACTIVE);
      },
      show: user.User?.Status === UserStatus.BANNED,
    },

    {
      key: "baneado",
      label: "🚫 Banear",
      color: c.text,
      bg: c.danger,
      function: () => {
        onAction(user.User?._id!, UserStatus.BANNED);
      },
      show: user.User?.Status !== UserStatus.BANNED,
    },
    // {
    //   key: "moderador",
    //   label: "🛡️ Hacer Mod",
    //   color: c.primary,
    //   bg: c.primary,
    //   show: user.role === "usuario",
    // },
    // {
    //   key: "usuario",
    //   label: "👤 Quitar Mod",
    //   color: c.textMuted,
    //   bg: c.accentSoft,
    //   show: user.role === "moderador",
    // },
  ].filter((a) => a.show);

  if (!user) return null;

  const statItem = (label: string, value: any, color: any) => (
    <div style={{ textAlign: "center" }}>
      <div
        style={{ fontSize: "18px", fontWeight: "800", color: color || c.text }}
      >
        {value}
      </div>
      <div style={{ fontSize: "10px", color: c.textMuted, fontWeight: "600" }}>
        {label}
      </div>
    </div>
  );

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
          borderRadius: "24px",
          width: "100%",
          maxWidth: "480px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* Cover + Avatar */}
        <div
          style={{
            height: "90px",
            // background: `linear-gradient(135deg, ${bg}33, ${bg}11)`,
            // borderBottom: `1.5px solid ${c.border}`,
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 28,
              height: 28,
              borderRadius: "8px",
              border: `1.5px solid ${c.border}`,
              background: c.card,
              cursor: "pointer",
              fontSize: "13px",
              color: c.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Avatar flotando */}
          <div style={{ position: "absolute", bottom: -22, left: 24 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                boxShadow: "0 6px 20px rgba(107,115,240,0.4)",
              }}
            >
              <img
                src={user.ProfilePhoto ? user.ProfilePhoto : UserProfile}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: user.ProfilePhoto
                    ? `2px solid ${Colors.detailAppColor}`
                    : undefined,
                }}
              />
            </div>
          </div>
        </div>

        {/* Info principal */}
        <div style={{ padding: "30px 24px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{ fontSize: "16px", fontWeight: "800", color: c.text }}
                >
                  {user.User?.Name}
                </span>
                {user.User?.Verify === VerificationStatus.VERIFIED && (
                  <img src={IconVerify} style={{ width: "13px" }} alt="" />
                )}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: c.textMuted,
                  marginTop: "2px",
                }}
              >
                @{user.User?.Username}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: c.textMuted,
                  marginTop: "1px",
                }}
              >
                {user.User?.Country || "N/A"} ● {user.User?.City || "N/A"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <UserStatusBadge status={user.User?.Status!} />
            </div>
          </div>

          {user.User?.PerfilData?.Presentation && (
            <div
              style={{
                marginTop: "14px",
                fontSize: "12px",
                color: c.textMuted,
                lineHeight: 1.6,
                padding: "10px 14px",
                borderRadius: "10px",
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.03)",
                border: `1px solid ${c.border}`,
              }}
            >
              "{user.User?.PerfilData?.Presentation}"
            </div>
          )}

          <button
            onClick={() => {
              onClose();
              navigate(`/users/${user.User?.Username}`);
            }}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "9px 14px",
              borderRadius: "12px",
              border: `1.5px solid ${c.accent}44`,
              background: c.accentSoft,
              color: c.accent,
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = c.accentMedium;
              el.style.borderColor = `${c.accent}88`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = c.accentSoft;
              el.style.borderColor = `${c.accent}44`;
            }}
          >
            👤 Ir al perfil
            <span style={{ fontSize: "13px" }}>→</span>
          </button>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
              marginTop: "16px",
              padding: "14px",
              borderRadius: "14px",
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
              border: `1px solid ${c.border}`,
            }}
          >
            {statItem("Posts", user.Posts, c.accent)}
            {statItem("Seguidores", user.Followers, c.text)}
            {statItem("Siguiendo", user.Followings, c.text)}
            {statItem(
              "Reportes",
              user.Reports,
              user.Reports! > 0 ? c.danger : c.success,
            )}
          </div>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "14px",
            }}
          >
            {[
              {
                label: "📅 Registro",
                value: formatDate(`${user.User?.CreateDate}`),
              },
              // { label: "🕐 Última vez", value: "Hace 3 horas" },
              { label: "✉️ Email", value: user.User?.Email },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  padding: "5px 11px",
                  borderRadius: "8px",
                  background: c.accentSoft,
                  border: `1px solid ${c.accentMedium}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: c.textMuted,
                  }}
                >
                  {m.label}:
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: c.accent,
                  }}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div
          style={{
            padding: "16px 24px 20px",
            marginTop: "16px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {can(Permissions.SANCTION_USERS) && ACTIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => {
                a.function();
                onClose();
              }}
              style={{
                flex: 1,
                minWidth: "100px",
                padding: "9px 14px",
                borderRadius: "12px",
                border: `1.5px solid ${a.color}33`,
                background: a.bg,
                color: a.color,
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "opacity 0.15s",
              }}
            >
              {a.label}
            </button>
          ))}
          {/* <button
            style={{
              flex: 1,
              minWidth: "100px",
              padding: "9px 14px",
              borderRadius: "12px",
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.textMuted,
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            ✉️ Mensaje
          </button> */}
        </div>
      </div>
    </div>
  );
};
