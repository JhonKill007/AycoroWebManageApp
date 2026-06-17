import { useEffect, useState } from "react";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import { UserModel } from "../../../Models/User/UserModel";

export const UserShareCard = ({
  user,
  isSelected,
  handleUserSelect,
}: {
  user: UserModel;
  isSelected: UserModel;
  handleUserSelect: (user: UserModel) => void;
}) => {
  const { theme } = useThemeContext();
  const { searchImage } = useImageBankContext();
  const [image, setImage] = useState<MediaDataModel>();

  useEffect(() => {
    const fetchImages = async () => {
      if (user.PerfilData?.IdMediaDataProfile) {
        try {
          const [Image] = await Promise.all([
            searchImage(user.PerfilData?.IdMediaDataProfile!),
          ]);
          setImage(Image!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [user, searchImage]);
  return (
    <div
      onClick={() => handleUserSelect(user)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: "14px",
          marginRight: "12px",
        }}
      >
        <img
          style={{ width: "100%", height: "100%", borderRadius: "50%" }}
          src={image ? image.Value : UserProfile}
          alt=""
        />
      </div>

      {/* User Info */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color:
              theme === "light"
                ? Colors.light.colors.text
                : Colors.dark.colors.text,
          }}
        >
          {user.Name}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          @{user.Username}
        </div>
      </div>

      {/* Checkbox */}
      <div
        style={{
          width: "20px",
          height: "20px",
          border: `2px solid ${isSelected ? "#3b82f6" : "#d1d5db"}`,
          borderRadius: "4px",
          backgroundColor: isSelected ? "#3b82f6" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
      >
        {isSelected && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              color: "white",
              animation: "checkmarkBounce 0.2s ease-out",
            }}
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
