import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostModel } from "../../../Models/Post/PostModel";
import statusService from "../../../Services/Status/StatusService";
import { Colors } from "../../../constants/Colors";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import { useAlertConfirmation } from "../../../hooks/useAlertConfirmation";
import useHourHook from "../../../hooks/useHourHook";
import useLanguage from "../../../hooks/useLanguage";

const isVideoPublication = (publication: PostModel) => {
  const mediaType = publication.MediaType?.toLowerCase() || "";
  const mimeType = publication.MediaMimeType?.toLowerCase() || "";
  const mediaUrl = publication.MediaData?.toLowerCase() || "";

  return (
    mediaType.includes("video") ||
    mimeType.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v|avi|mkv)(\?|#|$)/i.test(mediaUrl)
  );
};

const PubCard = React.memo(({ publication }: { publication: PostModel }) => {
  const mentionRegex = /(@[^\s]+)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const { getLabel } = useLanguage();
  const { searchImage } = useImageBankContext();
  // const { searchPost, updatePost } = useBanksContext();
  const { getElapsedTime } = useHourHook();
  const { alertState, showAlert, handleClose } = useAlertConfirmation();

  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  // const [post, setPost] = useState<PostModel>();
  const [classlike, setClasslike] = useState<boolean>(false);
  const [isRepost, setIsRepost] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isModalEditVisible, setModalEditVisible] = useState<boolean>(false);
  const [optionsModalVisible, setOptionsModalVisible] =
    useState<boolean>(false);

  const [commentModalVisible, setCommentModalVisible] = useState(false);

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (classlike) {
      const timeout = setTimeout(() => {
        setClasslike(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [classlike]);

  const DeletePost = (id: string) => {
    statusService
      .ApplyStatusToDelete(id)
      .then((e: any) => {})
      .catch((err: any) => {
        console.error(err);
      });
  };

  const ArchivedPost = (id: string) => {
    statusService
      .ApplyStatusToArchived(id)
      .then((e: any) => {})
      .catch((err: any) => {
        console.error(err);
      });
  };

  const handlePressMention = (mention: string) => {
    const username = mention.slice(1);
    navigate(`/${username}`);
  };

  const combinedRegex = new RegExp(
    `${urlRegex.source}|${mentionRegex.source}`,
    "g",
  );

  const stringDescription =
    publication?.Description && publication?.Description.trim() !== ""
      ? publication!.Description!.split(combinedRegex)
      : "ghost description".split(combinedRegex);

  const fmt = (n: number = 0) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const isVideo = isVideoPublication(publication);

  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.18s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${c.accent}44`;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 28px rgba(107,115,240,0.1)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = c.border;
        el.style.transform = "";
        el.style.boxShadow = "";
      }}
    >
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${`#0112fa1a`}, ${`#0112fa1a`}66, transparent)`,
        }}
      />
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
            }}
          >
            {publication.MediaData ? (
              isVideo ? (
                <>
                  <video
                    src={publication.MediaData}
                    muted
                    playsInline
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      background: "#05050b",
                      pointerEvents: "none",
                    }}
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      if (Number.isFinite(video.duration) && video.duration > 0) {
                        try {
                          video.currentTime = Math.min(0.2, video.duration);
                        } catch {
                          // Some browsers/CDNs block seek before data is loaded.
                        }
                      }
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.38))",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 62,
                        height: 62,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.58)",
                        border: "1.5px solid rgba(255,255,255,0.45)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        boxShadow: "0 12px 36px rgba(0,0,0,0.28)",
                      }}
                    >
                      ▶
                    </div>
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 10,
                      padding: "5px 9px",
                      borderRadius: 999,
                      background: "rgba(0,0,0,0.62)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.3,
                    }}
                  >
                    VIDEO
                  </span>
                </>
              ) : (
                <img
                  src={publication.MediaData}
                  alt={publication.Description || "Publicacion"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: c.accentSoft,
                  color: c.textMuted,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Sin media
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: c.textMuted,
            lineHeight: 1.5,
            marginBottom: 10,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              color:
                theme === "light"
                  ? Colors.light.colors.primary
                  : Colors.dark.colors.primary,
            }}
          >
            {publication?.Description &&
              publication.Description.trim() !== "" &&
              stringDescription.map((part, index) => {
                // if (urlRegex.test(part)) {
                //   return (
                //     <TouchableOpacity
                //       key={index}
                //       onPress={() => handlePressUrl(part)}
                //     >
                //       <Text style={{ color: "blue" }}>{part}</Text>
                //     </TouchableOpacity>
                //   );
                // }
                if (mentionRegex.test(part)) {
                  return (
                    <span
                      key={index}
                      onClick={() => handlePressMention(part)}
                      style={{ color: "#0095f6", cursor: "pointer" }}
                    >
                      {part}
                    </span>
                  );
                }
                return part;
              })}
          </span>
        </div>
        {/* <div
          style={{
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {pub.tags.map((tag: string) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 10,
                background: c.accentSoft,
                color: c.accent,
              }}
            >
              #{tag}
            </span>
          ))}
        </div> */}

        <span
          style={{
            fontSize: 10,
            color: c.textMuted,
            marginLeft: "auto",
            cursor: "pointer",
          }}
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/users/${publication?.Username}`);
          }}
        >
          {publication.Username}
        </span>
        <div
          style={{
            display: "flex",
            gap: 12,
            paddingTop: 10,
            borderTop: `1px solid ${c.border}`,
          }}
        >
          {[
            // { icon: "👁️", val: fmt(pub.views) },
            { icon: "❤️", val: fmt(publication?.Likes), label: "Likes" },
            { icon: "💬", val: fmt(publication?.Comments), label: "Comentarios" },
            // { icon: "🔁", val: fmt(pub.shares) },
          ].map((m) => (
            <span
              key={m.icon}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 10,
                color: c.textMuted,
              }}
            >
              <span style={{ fontSize: 11 }}>{m.icon}</span> {m.val} {m.label}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 10, color: c.textMuted, marginLeft: "auto" }}>
          {getElapsedTime(new Date(publication.CreateDate!))}
        </span>
      </div>
    </div>
  );
});
export default PubCard;
