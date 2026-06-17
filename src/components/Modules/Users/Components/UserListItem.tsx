import { useState } from "react";
import { UserPerfilModel } from "../../../Models/User/UserPerfilModel";
import UserProfile from "../../../assets/UserProfile.jpeg";
import IconVerify from "../../../assets/img/verified-badge-profile-icon-png.webp";
import { Colors } from "../../../constants/Colors";
import { VerificationStatus } from "../../../constants/Status";
import { useThemeContext } from "../../../context/ThemeContext";
import { formatDate } from "../../Settings/Common/Utils";
import { UserDetailModal } from "./UserDetailModal";
import UserStatusBadge from "./UserStatusBadge";

const UserListItem = ({
  user,
  updateUser,
}: {
  user: UserPerfilModel;
  updateUser: (id: string, status: number) => void;
}) => {
  const { theme } = useThemeContext();
  const [userSelected, setUserSelected] = useState<UserPerfilModel | undefined>(
    undefined,
  );

  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  return (
    <>
      <div
        key={user.User?._id}
        className="user-row"
        onClick={() => setUserSelected(user)}
      >
        {/* Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
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
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              border: user.ProfilePhoto
                ? `2px solid ${Colors.detailAppColor}`
                : undefined,
            }}
          />
        </div>

        {/* Nombre */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: c.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.User?.Name}
            </span>
            {user.User?.Verify === VerificationStatus.VERIFIED && (
              <img src={IconVerify} style={{ width: "13px" }} alt="" />
            )}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: c.textMuted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            @{user.User?.Username}
          </div>
        </div>

        {/* País */}
        <div
          style={{
            fontSize: "12px",
            color: c.textMuted,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>{user.User?.IP || "none"}</span>
        </div>

        {/* País */}
        <div
          style={{
            fontSize: "12px",
            color: c.textMuted,
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: c.textMuted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.User?.Country || "N/A"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: c.textMuted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.User?.City || "N/A"}
          </div>
        </div>

        {/* Posts */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: c.text,
          }}
        >
          {user.Posts}
        </div>

        {/* Seguidores */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: c.text,
          }}
        >
          {user.Followers}
        </div>

        {/* Creado */}
        <div style={{ fontSize: 11, color: c.textMuted }}>
          {formatDate(`${user.User?.CreateDate}`)}
        </div>

        {/* Reportes */}
        <div>
          {user.Reports! > 0 ? (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: c.text,
                background: c.danger,
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              ⚠️ {user.Reports}
            </span>
          ) : (
            <span style={{ fontSize: "11px", color: c.textMuted }}>—</span>
          )}
        </div>

        {/* Estado */}
        <UserStatusBadge status={user.User?.Status!} />
      </div>
      {userSelected && (
        <UserDetailModal
          user={userSelected}
          onClose={() => setUserSelected(undefined)}
          onAction={updateUser}
        />
      )}
    </>
  );
};

export default UserListItem;
