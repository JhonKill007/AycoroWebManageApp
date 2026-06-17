import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { ChatType } from "../../../constants/Types";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import useEncryptHook from "../../../hooks/useEncryptHook";
import useLanguage from "../../../hooks/useLanguage";
import { MessageParams } from "../../../Models/Message/MessageParams";
import { UserModel } from "../../../Models/User/UserModel";
import chatService from "../../../Services/Chat/ChatService";
import userService from "../../../Services/User/UserService";
import { UserShareCard } from "../Card/UserShareCard";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  idItem: string;
  type: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  idItem,
  type,
}) => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const { userData } = useUserContext();
  const { Encrypt } = useEncryptHook();
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Search("a", 1);
  }, []);

  useEffect(() => {
    Search(searchQuery, 1);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const Search = (e: string, section: number) => {
    userService
      .SearchUser(e ? e : "a", section)
      .then((res: any) => {
        setUsers(res.data);
      })
      .catch((res: any) => {
        console.log(res);
      });
  };

  const handleUserSelect = (user: UserModel) => {
    setSelectedUsers((prev) => {
      const isAlreadySelected = prev.find((u) => u._id === user._id);
      if (isAlreadySelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, { ...user, isSelected: true }];
      }
    });
  };

  const saveMessge = (m: MessageParams) => {
    chatService
      .Save(m)
      .then((res: any) => {})
      .catch((e: any) => {
        console.log(e);
      });
  };

  const handleClose = () => {
    setSearchQuery("");
    setMessage("");
    setSelectedUsers([]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const idUserSender = userData?.user?.id!;
      const usernameSender = userData?.user?.username!;
      const verifyUserSender = userData?.user?.verify;
      const nameSender = userData?.user?.name;
      const idMediaDataProfileSender =
        userData?.user?.perfilData?.idMediaDataProfile;

      for (const user of selectedUsers) {
        const result = await chatService.IsExist(user._id);

        let encryptKey = await chatService.getEncryptKey(result.data);

        let encryptMessage = Encrypt(message, encryptKey.data, type);

        const messageObj: MessageParams = {
          idChat: result.data,
          idUserSender,
          idMediaDataProfileSender,
          idUserReceiver: user._id,
          idMediaDataProfileReceiver: user.PerfilData?.IdMediaDataProfile,
          messageValue: encryptMessage,
          usernameReceiver: user.Username,
          verifyUserReceiver: user.Verify,
          usernameSender,
          verifyUserSender,
          nameReceiver: user.Name,
          nameSender,
          nameGroup: "",
          type: type,
          idMedia: idItem,
          conversationType: ChatType.DIRECT,
          createDate: `${new Date(Date.now())}`,
        };
        await saveMessge(messageObj);
      }
      handleClose();
    } catch (error) {
      console.error("Error sharing content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalSlideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spinnerSpin {
            to { transform: rotate(360deg); }
          }
          @keyframes checkmarkBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @media (max-width: 640px) {
            .share-modal-footer {
              flex-direction: column;
            }
            .share-modal-cancel-btn,
            .share-modal-share-btn {
              width: 100%;
            }
          }

           /* Scrollbar styling */
        .users-list::-webkit-scrollbar {
          width: 6px;
        }

        .users-list::-webkit-scrollbar-track {
          background: ${
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background
          };
          border-radius: 3px;
        }

        .users-list::-webkit-scrollbar-thumb {
          background: ${Colors.detailAppColor};
          border-radius: 3px;
        }

        .users-list::-webkit-scrollbar-thumb:hover {
          background: ${Colors.detailAppColor};
        }
        `}
      </style>

      <div
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px",
          animation: "modalFadeIn 0.2s ease-out",
        }}
      >
        <div
          style={{
            background:
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background,
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "100%",
            maxWidth: "500px",
            maxHeight: "95vh",
            overflow: "hidden",
            animation: "modalSlideUp 0.2s ease-out",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px 16px",
                borderBottom: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  margin: 0,
                }}
              >
                {getLabel("compartir_publicacion")}
              </h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px",
                  borderRadius: "6px",
                  color:
                    theme === "light"
                      ? Colors.light.colors.primary
                      : Colors.dark.colors.primary,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor =
                      theme === "light"
                        ? Colors.dark.colors.background
                        : Colors.light.colors.background;
                    e.currentTarget.style.color =
                      theme === "light"
                        ? Colors.dark.colors.primary
                        : Colors.light.colors.primary;
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color =
                      theme === "light"
                        ? Colors.light.colors.primary
                        : Colors.dark.colors.primary;
                  }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    position: "absolute",
                    left: "12px",
                    color: "#9ca3af",
                  }}
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getLabel("buscar_usuarios")}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    border: `1px solid ${
                      theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder
                    }`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    color:
                      theme === "light"
                        ? Colors.light.colors.inputColor
                        : Colors.dark.colors.inputColor,
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.inputBackground
                        : Colors.dark.colors.inputBackground,
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = Colors.detailAppColor;
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
            <div style={{ height: "400px" }}>
              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div
                  style={{
                    maxHeight: "100px",
                    padding: "12px 24px",
                    borderBottom: `1px solid ${
                      theme === "light"
                        ? Colors.light.colors.border
                        : Colors.dark.colors.border
                    }`,
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.background
                        : Colors.dark.colors.background,
                    overflowY: "auto",
                  }}
                  className="users-list"
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#3b82f6",
                      marginBottom: "8px",
                      fontWeight: 500,
                    }}
                  >
                    {getLabel("compartir_con", {
                      param: `${selectedUsers.length}`,
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {selectedUsers.map((user) => (
                      <div
                        key={user._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 8px",
                          backgroundColor:
                            theme === "light"
                              ? Colors.light.colors.background
                              : Colors.dark.colors.background,
                          border: `2px solid #3b82f6`,
                          borderRadius: "16px",
                          fontSize: "12px",
                          color: "#3b82f6",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>{user.Name}</span>
                        <button
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#0369a1",
                            cursor: "pointer",
                            padding: "2px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#fecaca";
                            e.currentTarget.style.color = "#dc2626";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#0369a1";
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  maxHeight: selectedUsers.length > 0 ? "300px" : "400px",
                }}
                className="users-list"
              >
                {users.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 24px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      size="xl"
                      style={{ margin: "0 auto 12px", color: "#d1d5db" }}
                    />
                    <div style={{ fontSize: "14px" }}>
                      {getLabel("no_se_encontraron_usuarios")}
                    </div>
                  </div>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedUsers.find(
                      (u) => u._id === user._id
                    );
                    return (
                      <UserShareCard
                        user={user}
                        isSelected={isSelected!}
                        handleUserSelect={handleUserSelect}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Message Input */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
              }}
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={getLabel("anade_mensaje")}
                style={{
                  width: "100%",
                  border: `1px solid ${
                    theme === "light"
                      ? Colors.light.colors.inputBorder
                      : Colors.dark.colors.inputBorder
                  }`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color:
                    theme === "light"
                      ? Colors.light.colors.inputColor
                      : Colors.dark.colors.inputColor,
                  backgroundColor:
                    theme === "light"
                      ? Colors.light.colors.inputBackground
                      : Colors.dark.colors.inputBackground,
                  resize: "vertical",
                  minHeight: "80px",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = Colors.detailAppColor;
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    theme === "light"
                      ? Colors.light.colors.inputBorder
                      : Colors.dark.colors.inputBorder;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Footer */}
            <div
              className="share-modal-footer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderTop: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background,
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {selectedUsers.length > 0
                  ? getLabel("usuarios_seleccionados", {
                      param: `${selectedUsers.length}`,
                    })
                  : getLabel("selecciona_usuarios")}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="share-modal-cancel-btn"
                  style={{
                    padding: "10px 20px",
                    border: `1px solid ${
                      theme === "light"
                        ? Colors.light.colors.border
                        : Colors.dark.colors.border
                    }`,
                    borderRadius: "6px",
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.background
                        : Colors.dark.colors.background,
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {getLabel("cancelar")}
                </button>

                <button
                  type="submit"
                  className="share-modal-share-btn"
                  disabled={selectedUsers.length === 0 || isSubmitting}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor:
                      selectedUsers.length === 0 ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "100px",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) => {
                    if (selectedUsers.length > 0 && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = "#2563eb";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedUsers.length > 0 && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = "#3b82f6";
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid transparent",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                          animation: "spinnerSpin 1s linear infinite",
                        }}
                      />
                      {getLabel("compartiendo")}
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {getLabel("compartir")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ShareModal;
