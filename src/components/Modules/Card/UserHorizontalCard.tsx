import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../assets/UserProfile.jpeg";
import { useImageBankContext } from "../../context/ImageBankContext";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
import followService from "../../Services/Follow/FollowService";

export const UserHorizontalCard = ({ user }: { user: UserPerfilModel }) => {
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
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
        padding: "8px 0",
        cursor: "pointer",
      }}
      onClick={() => {
        navigate(`users/${user.User?.Username}`);
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          overflow: "hidden",
          // border: "2px solid #0095f6",
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
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: "600",
            fontSize: "14px",
            color: theme === "light" ? "#262626" : "#e0e0e0",
          }}
        >
          {user.User?.Username?.length! > 15
            ? user.User?.Username?.substr(0, 15) + "..."
            : user.User?.Username}
        </div>
        <div
          style={{
            color: "#8e8e8e",
            fontSize: "12px",
          }}
        >
          {/* {user.user?.name} */}
          {user.User?.Name?.length! > 20
            ? user.User?.Name?.substr(0, 20) + "..."
            : user.User?.Name}
        </div>
      </div>
      {/* <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFollowing(!isFollowing);
          ActionFollow(user.User?.id!, !isFollowing);
        }}
        style={{
          background: isFollowing ? "transparent" : "#0095f6",
          border: isFollowing ? "1px solid #dbdbdb" : "none",
          color: isFollowing
            ? theme === "light"
              ? "#262626"
              : "#e0e0e0"
            : "white",
          fontWeight: "600",
          fontSize: "12px",
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: "8px",
          minWidth: "80px",
        }}
      >
        {isFollowing ? getLabel("siguiendo") : getLabel("seguir")}
      </button> */}
    </div>
  );
};
