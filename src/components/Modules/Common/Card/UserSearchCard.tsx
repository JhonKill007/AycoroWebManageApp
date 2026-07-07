import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import { UserModel } from "../../../Models/User/UserModel";

const UserSearchCard = ({ user }: { user: UserModel }) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { searchImage } = useImageBankContext();
  const [media, setMedia] = useState<MediaDataModel | undefined>(undefined);
  const [imageFailed, setImageFailed] = useState(false);
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const profileMediaId = user.PerfilData?.IdMediaDataProfile;
  const profilePhoto = user.ProfilePhoto || media?.Value;

  useEffect(() => {
    let cancelled = false;

    const fetchImages = async () => {
      setImageFailed(false);
      setMedia(undefined);

      if (!user.ProfilePhoto && profileMediaId) {
        try {
          const image = await searchImage(profileMediaId);
          if (!cancelled) setMedia(image);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();

    return () => {
      cancelled = true;
    };
  }, [profileMediaId, searchImage, user.ProfilePhoto]);

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
          borderRadius: "50%",
          background: c.accent + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
          overflow: "hidden",
          border:
            profilePhoto && !imageFailed
              ? `2px solid ${Colors.detailAppColor}`
              : `1px solid ${c.border}`,
        }}
      >
        <img
          src={!imageFailed && profilePhoto ? profilePhoto : UserProfile}
          alt={`Foto de perfil de ${user.Name || user.Username || "usuario"}`}
          onError={() => setImageFailed(true)}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
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
