import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import { UserModel } from "../../../Models/User/UserModel";

const UserSearchCard = ({ user }: { user: UserModel }) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const { searchImage } = useImageBankContext();
  const [media, setMedia] = useState<MediaDataModel | undefined>(undefined);
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  useEffect(() => {
    const fetchImages = async () => {
      if (user.PerfilData?.IdMediaDataProfile) {
        try {
          const [image] = await Promise.all([
            searchImage(user.PerfilData.IdMediaDataProfile),
          ]);
          setMedia(image!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [user, searchImage]);

  return (
    <div
      key={user._id}
      onClick={() => navigate(`users/${user.Username}`)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 10,
        cursor: "pointer",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = c.accentSoft)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: c.accent + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        <img
          src={media?.Value ? media.Value : UserProfile}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
            border: media?.Value
              ? `2px solid ${Colors.detailAppColor}`
              : undefined,
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>
          {user.Name}
        </div>
        <div style={{ fontSize: 10, color: c.textMuted }}>{user.Username}</div>
      </div>
      <span style={{ fontSize: 12, color: c.border }}>›</span>
    </div>
  );
};

export default UserSearchCard;
