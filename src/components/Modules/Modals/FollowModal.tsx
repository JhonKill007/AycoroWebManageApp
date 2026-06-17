import { faSearch, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useThemeContext } from "../../context/ThemeContext";
import { useUserContext } from "../../context/UserContext";
import useLanguage from "../../hooks/useLanguage";
import { UserModel } from "../../Models/User/UserModel";
import { UserPerfilData } from "../../Models/User/UserPerfilData";
import { UserPerfilModel } from "../../Models/User/UserPerfilModel";
import followService from "../../Services/Follow/FollowService";
import { UserFollowCard } from "../Card/UserFollowCard";

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "followers" | "following";
  user: UserPerfilModel;
  setFollow: (id: string, action: boolean) => void;
}

const FollowModal: React.FC<FollowModalProps> = ({
  isOpen,
  onClose,
  type,
  user,
  setFollow,
}) => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const { userData } = useUserContext();
  const [followers, setFollowers] = useState<UserPerfilModel[]>([]);
  const [followins, setFollowins] = useState<UserPerfilModel[]>([]);

  const [followersPag, setFollowersPag] = useState<number>(1);
  const [followinsPag, setFollowinsPag] = useState<any>(1);

  const [activeTab, setActiveTab] = useState<"followers" | "following">();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState<UserPerfilModel[]>([]);

  useEffect(() => {
    getFollower(user.User?._id!, followersPag);
    getFollowing(user.User?._id!, followinsPag);
  }, []);

  useEffect(() => {
    setActiveTab(type);
    setSearchTerm("");
  }, [type]);

  useEffect(() => {
    const source = activeTab === "following" ? followins : followers;
    const filtered = source.filter(
      (u) =>
        u.User?.Username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.User?.Name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [activeTab, searchTerm, followers, followins]);

  // const updateFollow = (
  //   id: string,
  //   action: boolean,
  //   tab: "followers" | "following"
  // ) => {
  //   tab === "followers"
  //     ? setFollowers((prevFollowers) =>
  //         prevFollowers.map((user) =>
  //           user.user?.id === id ? { ...user, isFollow: action } : user
  //         )
  //       )
  //     : setFollowins((prevFollowers) =>
  //         prevFollowers.map((user) =>
  //           user.user?.id === id ? { ...user, isFollow: action } : user
  //         )
  //       );

  //   setFollow(id, action);
  // };

  function mapToUserPerfilModelList(data: any[]): UserPerfilModel[] {
    if (!Array.isArray(data)) return [];

    return data.map((item) => {
      const userPerfil = new UserPerfilModel();

      // Crear el usuario principal
      const user = new UserModel();
      user._id = item.id;
      user.Name = item.name;
      user.Username = item.username;
      user.Phone = item.phone;
      user.Email = item.email;
      user.Password = item.password;
      user.Birthday = item.birthday;
      user.Gender = item.gender;
      user.Status = item.status;
      user.Verify = item.verify;
      user.Validate = item.validate;
      user.CreateDate = item.createDate ? new Date(item.createDate) : undefined;

      // Submodelo: perfilData
      if (item.perfilData) {
        const perfilData = new UserPerfilData();
        perfilData.IdMediaDataProfile = item.perfilData.idMediaDataProfile;
        perfilData.Presentation = item.perfilData.presentation;
        user.PerfilData = perfilData;
      }

      // Asignar usuario al modelo principal
      userPerfil.User = user;

      // Datos del perfil principal
      userPerfil.Followings = item.followings;
      userPerfil.Followers = item.followers;
      userPerfil.Post = item.post;
      userPerfil.ProfilePhoto = item.profilePhoto;

      return userPerfil;
    });
  }

  const getFollower = async (id: string, section: number) => {
    try {
      setIsLoading(true);
      const e = await followService.GetFollowerList(id, section);
      const followers = mapToUserPerfilModelList(e.data);
      setFollowers(followers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowing = async (id: string, section: number) => {
    try {
      setIsLoading(true);
      const e = await followService.GetFollowingList(id, section);
      const followings = mapToUserPerfilModelList(e.data);
      setFollowins(followings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Componente de estado vacío
  const EmptyState = () => (
    <div
      style={{
        padding: "40px 20px",
        textAlign: "center" as const,
        color: theme === "light" ? "#8e8e8e" : "#888",
      }}
    >
      <FontAwesomeIcon
        icon={faUser}
        style={{
          fontSize: "48px",
          marginBottom: "16px",
          opacity: 0.5,
        }}
      />
      <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
        {activeTab === "followers" ? "No hay seguidores" : "No sigues a nadie"}
      </h3>
      <p style={{ margin: 0, fontSize: "14px" }}>
        {activeTab === "followers"
          ? "Cuando tengas seguidores, aparecerán aquí."
          : "Cuando sigas a alguien, aparecerán aquí."}
      </p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme === "light" ? "white" : "#1a1a1a",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column" as const,
          border: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            style={{
              background: "none",
              border: "none",
              color: theme === "light" ? "#262626" : "white",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease",
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "light" ? "#f8f9fa" : "#333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: theme === "light" ? "#262626" : "white",
              textAlign: "center" as const,
              flex: 1,
            }}
          >
            {user?.User?.Username}
          </h2>
          <div style={{ width: "32px" }}></div> {/* Espacio para balance */}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
          }}
        >
          <button
            style={{
              flex: 1,
              padding: "16px",
              background: "none",
              border: "none",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              color: theme === "light" ? "#8e8e8e" : "#888",
              borderBottom: "2px solid transparent",
              transition: "all 0.3s ease",

              ...(activeTab === "followers"
                ? {
                    color: theme === "light" ? "#262626" : "white",
                    borderBottomColor: theme === "light" ? "#262626" : "white",
                  }
                : {}),
            }}
            onClick={() => {
              setActiveTab("followers");
              setSearchTerm("");
            }}
          >
            {getLabel("seguidores")}
          </button>
          <button
            style={{
              flex: 1,
              padding: "16px",
              background: "none",
              border: "none",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              color: theme === "light" ? "#8e8e8e" : "#888",
              borderBottom: "2px solid transparent",
              transition: "all 0.3s ease",

              ...(activeTab === "following"
                ? {
                    color: theme === "light" ? "#262626" : "white",
                    borderBottomColor: theme === "light" ? "#262626" : "white",
                  }
                : {}),
            }}
            onClick={() => {
              setActiveTab("following");
              setSearchTerm("");
            }}
          >
            {getLabel("siguiendo")}
          </button>
        </div>

        {/* Búsqueda */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <FontAwesomeIcon
              icon={faSearch}
              style={{
                position: "absolute" as const,
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: theme === "light" ? "#8e8e8e" : "#888",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              placeholder={`Buscar ${
                activeTab === "followers"
                  ? getLabel("seguidores")
                  : getLabel("seguidos")
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "8px",
                border: `1px solid ${theme === "light" ? "#dbdbdb" : "#333"}`,
                backgroundColor: theme === "light" ? "#fafafa" : "#2a2a2a",
                color: theme === "light" ? "#262626" : "white",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor =
                  theme === "light" ? "white" : "#333";
                e.target.style.borderColor =
                  theme === "light" ? "#667eea" : "#764ba2";
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor =
                  theme === "light" ? "#fafafa" : "#2a2a2a";
                e.target.style.borderColor =
                  theme === "light" ? "#dbdbdb" : "#333";
              }}
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        <div
          style={{
            // flex: 1,
            overflowY: "auto" as const,
            height: "500px",
          }}
        >
          {isLoading ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center" as const,
                color: theme === "light" ? "#8e8e8e" : "#888",
              }}
            >
              Cargando...
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState />
          ) : (
            filteredUsers.map((user) => (
              <UserFollowCard
                key={`${activeTab}-${user.User?._id}`}
                user={user}
                activeTab={activeTab!}
                updateFollow={()=>{
                  
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
