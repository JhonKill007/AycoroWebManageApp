import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../assets/UserProfile.jpeg";
import { useImageBankContext } from "../../context/ImageBankContext";
import { useThemeContext } from "../../context/ThemeContext";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { UserModel } from "../../Models/User/UserModel";
import "./SearchBox.css";

interface ISearchItem {
  user: UserModel;
}

const SearchItem = ({ user }: ISearchItem) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { searchImage } = useImageBankContext();
  const [userProfilePhoto, setuserProfilePhoto] = useState<MediaDataModel>();
  useEffect(() => {
    const fetchImages = async () => {
      if (user.PerfilData?.IdMediaDataProfile) {
        try {
          const [profileMediaData] = await Promise.all([
            searchImage(user.PerfilData?.IdMediaDataProfile),
          ]);
          setuserProfilePhoto(profileMediaData!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [user, searchImage]);
  return (
    <div
      onClick={() => {
        navigate(`users/${user.Username}`);
      }}
      key={user._id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 0",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #0095f6",
        }}
      >
        {userProfilePhoto ? (
          <img
            src={userProfilePhoto.Value}
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
            color: theme === "light" ? "#1a1a1a" : "#fafafa",
          }}
        >
          {user.Username}
        </div>
        <div
          style={{
            color: "gray",
            fontSize: "12px",
          }}
        >
          {user.Name}
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
