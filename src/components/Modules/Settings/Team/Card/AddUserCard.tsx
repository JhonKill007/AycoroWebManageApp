import UserProfile from "../../../../assets/UserProfile.jpeg";
import { Colors } from "../../../../constants/Colors";
import { useThemeContext } from "../../../../context/ThemeContext";
import { UserModel } from "../../../../Models/User/UserModel";

const AddUserCard = ({
  user,
  selected,
  setSelected,
}: {
  user: UserModel;
  selected: UserModel;
  setSelected: (user: UserModel) => void;
}) => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c: any = colors.colors;
  const isSel = selected?._id === user._id;

  return (
    <div
      key={user._id}
      onClick={() => setSelected(user)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 12,
        cursor: "pointer",
        border: `1.5px solid ${isSel ? c.accent + "55" : c.border}`,
        background: isSel ? c.accentSoft : "transparent",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isSel)
          (e.currentTarget as HTMLElement).style.background =
            theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
      }}
      onMouseLeave={(e) => {
        if (!isSel)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: `${Colors.detailAppColor}22`,
          border: `2px solid ${Colors.detailAppColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          color: Colors.detailAppColor,
          flexShrink: 0,
        }}
      >
        <img
          src={user.ProfilePhoto ? user.ProfilePhoto : UserProfile}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            objectFit: "cover",
            border: user.ProfilePhoto
              ? `2px solid ${Colors.detailAppColor}`
              : undefined,
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: c.text,
          }}
        >
          {user.Name}
        </div>
        <div style={{ fontSize: 10, color: c.textMuted }}>
          @{user.Username} · {user.Email}
        </div>
      </div>
      {/* Check */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `2px solid ${isSel ? c.accent : c.border}`,
          background: isSel ? c.accent : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          color: "#fff",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {isSel && "✓"}
      </div>
    </div>
  );
};

export default AddUserCard;
