import { faComment as faCommentRegular } from "@fortawesome/free-regular-svg-icons";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { CommentType } from "../../../constants/Types";
import { useBanksContext } from "../../../context/BanksContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import useLanguage from "../../../hooks/useLanguage";
import { ComentModel } from "../../../Models/Coment/ComentModel";
import { ComentParams } from "../../../Models/Coment/ComentParams";
import comentService from "../../../Services/Coments/ComentService";
import { CommetHomeCard } from "../Card/CommetHomeCard";

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  publicationId: string;
  countOfComent: number;
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  publicationId,
  countOfComent,
}) => {
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const { getLabel } = useLanguage();
  const { updatePost } = useBanksContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [coments, setComents] = useState<ComentModel[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  useEffect(() => {
    const getComents = () => {
      comentService
        .GetAll(publicationId, 1)
        .then((e: any) => {
          setComents(e.data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    };
    getComents();
  }, []);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentModel: ComentParams = {
        idcoment: "",
        iditem: publicationId,
        iduser: userData?.user?.id,
        coment: newComment,
        type: CommentType.PUBLICATION,
      };
      const newComent = await comentService.Save(commentModel);
      setComents((coments: any) => [...coments, newComent.data]);
      updatePost(publicationId!, {
        comments: countOfComent! + 1,
      });
      setNewComment("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleComentChange = (modifiedComent: ComentModel) => {
    const updatedComents = coments.map((coment) => {
      if (coment.id === modifiedComent.id) {
        return modifiedComent;
      }
      return coment;
    });
    setComents(updatedComents);
  };

  const deleteComment = (id: string) => {
    const updatedComments = coments.filter((_, index) => _.id !== id);
    setComents(updatedComments);
    updatePost(publicationId!, {
      comments: countOfComent - 1,
    });
  };

  const renderComment = (item: ComentModel, index: number) => (
    <CommetHomeCard
      key={index}
      coment={item}
      handleComentChange={handleComentChange}
      onDelete={deleteComment}
    />
  );

  if (!visible) return null;

  return (
    <div
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
      }}
    >
      <div
        ref={modalRef}
        style={{
          background:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
          borderRadius: "12px",
          width: "90%",
          maxWidth: "500px",
          height: "90vh",
          maxHeight: "900px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          animation: "modalSlideUp 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            borderBottom: `1px solid ${
              theme === "light"
                ? Colors.light.colors.border
                : Colors.dark.colors.border
            }`,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
            }}
          >
            {getLabel("comentarios")}
          </div>
          <button
            style={{
              position: "absolute",
              right: "16px",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
              color:
                theme === "light"
                  ? Colors.light.colors.primary
                  : Colors.dark.colors.primary,
              transition: "color 0.2s",
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Comments List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
          }}
          className="comments-list"
        >
          {coments.length > 0 ? (
            coments.map(renderComment)
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "60px 0",
                color: "#666",
              }}
            >
              <div
                style={{
                  fontSize: "64px",
                  marginBottom: "12px",
                }}
              >
                <FontAwesomeIcon
                  icon={faCommentRegular}
                  size="lg"
                  color={
                    theme === "light"
                      ? Colors.light.colors.primary
                      : Colors.dark.colors.primary
                  }
                />
              </div>
              <div
                style={{
                  fontSize: "16px",
                  textAlign: "center",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                {getLabel("publicacion_no_comentarios")}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: `1px solid ${
              theme === "light"
                ? Colors.light.colors.border
                : Colors.dark.colors.border
            }`,
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            <input
              ref={inputRef}
              className="comment-textarea"
              style={{
                flex: 1,
                borderRadius: "20px",
                padding: "12px 16px",
                fontSize: "14px",
                resize: "vertical",
                minHeight: "44px",
                maxHeight: "120px",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                outline: "none",
                border: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.inputBorder
                    : Colors.dark.colors.inputBorder
                }`,
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.inputBackground
                    : Colors.dark.colors.inputBackground,
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = Colors.detailAppColor;
                e.target.style.backgroundColor =
                  theme === "light"
                    ? Colors.light.colors.inputActiveBackground
                    : Colors.dark.colors.inputActiveBackground;
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  theme === "light"
                    ? Colors.light.colors.inputBorder
                    : Colors.dark.colors.inputBorder;
                e.target.style.backgroundColor =
                  theme === "light"
                    ? Colors.light.colors.inputBackground
                    : Colors.dark.colors.inputBackground;
              }}
              placeholder={getLabel("escribe_un_comentario")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={500}
              disabled={isSubmitting}
              // rows={3}
            />

            <button
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "none",
                background:
                  newComment.trim() && !isSubmitting
                    ? Colors.detailAppColor
                    : "#e0e0e0",
                cursor:
                  newComment.trim() && !isSubmitting
                    ? "pointer"
                    : "not-allowed",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.2s",
                fontSize: "16px",
                opacity: isSubmitting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (newComment.trim() && !isSubmitting) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  ...
                </span>
              ) : (
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  size="lg"
                  color={newComment.trim() ? "#e0e0e0" : Colors.detailAppColor}
                />
              )}
            </button>
          </div>

          {newComment.length > 0 && (
            <div
              style={{
                fontSize: "11px",
                textAlign: "right",
                marginTop: "4px",
                color: "#666",
              }}
            >
              {newComment.length}/500
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes modalSlideUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            .modal-content {
              width: 95%;
              height: 90vh;
              max-height: none;
              border-radius: 12px 12px 0 0;
              margin-top: auto;
            }
            
            .modal-overlay {
              align-items: flex-end;
            }
          }

          /* Scrollbar styling */
          .comments-list::-webkit-scrollbar {
            width: 6px;
          }

          .comments-list::-webkit-scrollbar-track {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 3px;
          }

          .comments-list::-webkit-scrollbar-thumb {
            background: ${Colors.detailAppColor};
            border-radius: 3px;
          }

          .comments-list::-webkit-scrollbar-thumb:hover {
            background: ${Colors.detailAppColor};
          }

          .comment-textarea::placeholder {
            color: ${
              theme === "light"
                ? Colors.light.colors.text
                : Colors.dark.colors.text
            };
            opacity: 1;
          }
      
          .comment-textarea:-ms-input-placeholder {
            color: ${
              theme === "light"
                ? Colors.light.colors.text
                : Colors.dark.colors.text
            };
          }
      
          .comment-textarea::-ms-input-placeholder {
            color: ${
              theme === "light"
                ? Colors.light.colors.text
                : Colors.dark.colors.text
            };
          }
        `}
      </style>
    </div>
  );
};

export default CommentModal;
