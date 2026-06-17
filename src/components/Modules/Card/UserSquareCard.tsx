import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../assets/UserProfile.jpeg";
import { useImageBankContext } from "../../context/ImageBankContext";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
import followService from "../../Services/Follow/FollowService";

export const UserSquareCard = ({ user }: { user: UserPerfilModel }) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const { searchImage } = useImageBankContext();
  const [profileData, setProfileData] = useState<MediaDataModel>();
  // const [isFollowing, setIsFollowing] = useState<boolean>(user.isFollow!);

  useEffect(() => {
    const fetchImages = async () => {
      if (user.User?.PerfilData?.IdMediaDataProfile) {
        try {
          const [postImage] = await Promise.all([
            searchImage(user.User?.PerfilData?.IdMediaDataProfile),
          ]);
          setProfileData(postImage!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [user, searchImage]);

  const ActionFollow = (idUser: string, action: boolean) => {
    action
      ? followService.FollowUnFollow(idUser, false).catch((err: any) => {
          console.log(err);
        })
      : followService.FollowUnFollow(idUser, true).catch((err: any) => {
          console.log(err);
        });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "15px",
        border: `1px solid ${theme === "light" ? "#e0e0e0" : "#333"}`,
        borderRadius: "12px",
      }}
      onClick={() => {
        navigate(`users/${user.User?.Username}`);
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #0095f6",
        }}
      >
        {profileData ? (
          <img
            src={profileData.Value}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <img
            src={UserProfile}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontWeight: "600",
            fontSize: "14px",
            color: theme === "light" ? "#262626" : "#e0e0e0",
            marginBottom: "4px",
          }}
        >
          {user.User?.Username}
        </div>
        <div
          style={{
            color: "#8e8e8e",
            fontSize: "12px",
            marginBottom: "8px",
          }}
        >
          {user.User?.Name}
        </div>
      </div>
      {/* <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFollowing(!isFollowing);
          ActionFollow(user.User?._id!, !isFollowing);
        }}
        style={{
          background: isFollowing ? "transparent" : "#0095f6",
          border: isFollowing
            ? `1px solid ${theme === "light" ? "#e0e0e0" : "#333"}`
            : "none",
          color: isFollowing ? "gray" : "white",
          fontWeight: "600",
          fontSize: "12px",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        {isFollowing ? getLabel("siguiendo") : getLabel("seguir")}
      </button> */}
    </div>
  );
};
