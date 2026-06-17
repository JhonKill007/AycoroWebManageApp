import { faCircleCheck, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
import UserProfile from "../../assets/UserProfile.jpeg";
import { VerificationStatus } from "../../constants/Status";
import { useImageBankContext } from "../../context/ImageBankContext";
import { useThemeContext } from "../../context/ThemeContext";
import { useUserContext } from "../../context/UserContext";

export const UserFollowCard = ({
  user,
  activeTab,
  updateFollow,
}: {
  user: UserPerfilModel;
  activeTab: "followers" | "following";
  updateFollow: (
    id: string,
    action: boolean,
    tab: "followers" | "following"
  ) => void;
}) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const { searchImage } = useImageBankContext();
  const [profileData, setProfileData] = useState<MediaDataModel>();

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

  // Handlers
  // const handleFollow = async (userId: string) => {
  //   updateFollow(userId, true, activeTab);
  //   // setIsFollow(true);
  // };

  // const handleUnfollow = async (userId: string) => {
  //   updateFollow(userId, false, activeTab);
  //   setIsFollow(false);
  // };

  // Componente de botón de acción
  // const ActionButton = ({ user }: { user: UserPerfilModel }) => {
  //   const isCurrentUser = user.User?._id === userData?.user?.id;

  //   if (isCurrentUser) {
  //     return null; // No mostrar botón para el usuario actual
  //   }

  //   if (activeTab === "followers") {
  //     if (isFollow) {
  //       return (
  //         <button
  //           style={{
  //             backgroundColor: "transparent",
  //             color: theme === "light" ? "#262626" : "white",
  //             border: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
  //             borderRadius: "8px",
  //             padding: "6px 12px",
  //             fontSize: "12px",
  //             fontWeight: "600",
  //             cursor: "pointer",
  //             minWidth: "80px",
  //             transition: "all 0.3s ease",
  //           }}
  //           onClick={() => handleUnfollow(user.User?._id!)}
  //           onMouseEnter={(e) => {
  //             e.currentTarget.style.backgroundColor =
  //               theme === "light" ? "#f8f9fa" : "#333";
  //           }}
  //           onMouseLeave={(e) => {
  //             e.currentTarget.style.backgroundColor = "transparent";
  //           }}
  //         >
  //           Siguiendo
  //         </button>
  //       );
  //     } else {
  //       return (
  //         <button
  //           style={{
  //             backgroundColor: "#0095f6",
  //             color: "white",
  //             border: "none",
  //             borderRadius: "8px",
  //             padding: "6px 12px",
  //             fontSize: "12px",
  //             fontWeight: "600",
  //             cursor: "pointer",
  //             minWidth: "80px",
  //             transition: "background-color 0.3s ease",
  //           }}
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             handleFollow(user.User?._id!);
  //           }}
  //           onMouseEnter={(e) => {
  //             e.currentTarget.style.backgroundColor = "#007acc";
  //           }}
  //           onMouseLeave={(e) => {
  //             e.currentTarget.style.backgroundColor = "#0095f6";
  //           }}
  //         >
  //           Seguir
  //         </button>
  //       );
  //     }
  //   } 
  //   // else {
  //   //   // following tab
  //   //   if (isFollow) {
  //   //     return (
  //   //       <button
  //   //         style={{
  //   //           backgroundColor: "transparent",
  //   //           color: "#ef4444",
  //   //           border: `1px solid #ef4444`,
  //   //           borderRadius: "8px",
  //   //           padding: "6px 12px",
  //   //           fontSize: "12px",
  //   //           fontWeight: "600",
  //   //           cursor: "pointer",
  //   //           minWidth: "80px",
  //   //           transition: "all 0.3s ease",
  //   //         }}
  //   //         onClick={(e) => {
  //   //           e.stopPropagation();
  //   //           handleUnfollow(user.User?._id!);
  //   //         }}
  //   //         onMouseEnter={(e) => {
  //   //           e.currentTarget.style.backgroundColor = "#fee2e2";
  //   //         }}
  //   //         onMouseLeave={(e) => {
  //   //           e.currentTarget.style.backgroundColor = "transparent";
  //   //         }}
  //   //       >
  //   //         Dejar de seguir
  //   //       </button>
  //   //     );
  //   //   } else {
  //   //     return (
  //   //       <button
  //   //         style={{
  //   //           backgroundColor: "#0095f6",
  //   //           color: "white",
  //   //           border: "none",
  //   //           borderRadius: "8px",
  //   //           padding: "6px 12px",
  //   //           fontSize: "12px",
  //   //           fontWeight: "600",
  //   //           cursor: "pointer",
  //   //           minWidth: "80px",
  //   //           transition: "background-color 0.3s ease",
  //   //         }}
  //   //         onClick={(e) => {
  //   //           e.stopPropagation();
  //   //           handleFollow(user.User?._id!);
  //   //         }}
  //   //         onMouseEnter={(e) => {
  //   //           e.currentTarget.style.backgroundColor = "#007acc";
  //   //         }}
  //   //         onMouseLeave={(e) => {
  //   //           e.currentTarget.style.backgroundColor = "#0095f6";
  //   //         }}
  //   //       >
  //   //         Seguir
  //   //       </button>
  //   //     );
  //   //   }
  //   // }
  // };

  const handleMoreOptions = (userId: string) => {
    // Aquí podrías mostrar un menú contextual
    console.log("Más opciones para:", userId);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: `1px solid ${theme === "light" ? "#f0f0f0" : "#2a2a2a"}`,
        transition: "background-color 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          theme === "light" ? "#f8f9fa" : "#2a2a2a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      onClick={() => {
        navigate(`users/${user.User?.Username}`);
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
        }}
      >
        {profileData ? (
          <img
            src={profileData?.Value}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              objectFit: "cover" as const,
            }}
          />
        ) : (
          <img
            src={UserProfile}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              objectFit: "cover" as const,
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column" as const,
            gap: "2px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: theme === "light" ? "#262626" : "white",
              margin: 0,
              padding: 0,
            }}
          >
            {user.User?.Username}
            {user.User?.Verify == VerificationStatus.VERIFIED && (
              <FontAwesomeIcon
                style={{
                  color: "#089aff",
                  fontSize: "15px",
                }}
                icon={faCircleCheck}
              />
            )}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: theme === "light" ? "#8e8e8e" : "#888",
              margin: 0,
              padding: 0,
            }}
          >
            {user.User?.Name}
          </p>
          {/* {user.mutualFollowers && user.mutualFollowers > 0 && ( */}
          <p
            style={{
              fontSize: "12px",
              color: theme === "light" ? "#8e8e8e" : "#888",
              margin: "2px 0 0 0",
              padding: 0,
            }}
          >
            {/* {user.mutualFollowers} seguidores en común */}
            {10} seguidores en común
          </p>
          {/* )} */}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* <ActionButton user={ser} /> */}
        <button
          style={{
            background: "none",
            border: "none",
            color: theme === "light" ? "#8e8e8e" : "#888",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => handleMoreOptions(user.User?._id!)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              theme === "light" ? "#f8f9fa" : "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>
    </div>
  );
};
