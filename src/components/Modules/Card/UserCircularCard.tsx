import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../assets/UserProfile.jpeg";
import { useImageBankContext } from "../../context/ImageBankContext";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
import followService from "../../Services/Follow/FollowService";
// import "./RoundProfileCard.css";

const UserCircularCard = ({ user }: { user: UserPerfilModel }) => {
  const navigate = useNavigate();
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();
  const { searchImage } = useImageBankContext();
  const [profileData, setProfileData] = useState<MediaDataModel>();
  // const [isFollowing, setIsFollowing] = useState<boolean>(user.isFollow!);

  useEffect(() => {
    const fetchImages = async () => {
      if (user.User?.PerfilData?.IdMediaDataProfile) {
        try {
          const [Image] = await Promise.all([
            searchImage(user.User.PerfilData.IdMediaDataProfile),
          ]);
          setProfileData(Image!);
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
        minWidth: "80px",
      }}
      onClick={() => {
        navigate(`/${user.User?.Username}`);
      }}
    >
      <div
        style={{
          position: "relative",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          overflow: "hidden",
          // border: "2px solid #007bff",
          cursor: "pointer",
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
      <span
        style={{
          fontSize: "12px",
          fontWeight: "500",
          color: "gray",
          textAlign: "center",
        }}
      >
        @{user.User?.Username}
      </span>
      {/* <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFollowing(!isFollowing);
          ActionFollow(user.user?.id!, !isFollowing);
        }}
        style={{
          padding: "6px 12px",
          background: isFollowing ? "transparent" : "#0095f6",
          color: isFollowing
            ? theme === "light"
              ? Colors.light.colors.text
              : Colors.dark.colors.text
            : "white",
          border: isFollowing
            ? `1px solid ${theme === "light" ? "#e0e0e0" : "#333"}`
            : "none",
          borderRadius: "15px",
          fontSize: "11px",
          fontWeight: "500",
          cursor: "pointer",
        }}
      >
        {isFollowing ? getLabel("siguiendo") : getLabel("seguir")}
      </button> */}
    </div>
  );
};

export default UserCircularCard;
