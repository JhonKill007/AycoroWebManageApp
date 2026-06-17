import React, { useEffect, useRef } from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import useLanguage from "../../../hooks/useLanguage";
import { ModalOptionModel } from "../../../Models/data/ModalOptionModel";

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  options: ModalOptionModel[];
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  visible,
  onClose,
  options,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();

  useEffect(() => {
    if (visible) {
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

  const handleOptionPress = (option: ModalOptionModel) => {
    onClose();
    setTimeout(() => {
      option.function?.();
    }, 300);
  };

  const renderOption = (option: ModalOptionModel) => {
    return (
      <button
        key={option.name}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          minHeight: "56px",
          width: "100%",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          opacity: 1,
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        onClick={() => handleOptionPress(option)}
      >
        <div
          style={{
            flex: 1,
            fontSize: "16px",
            fontWeight: "600",
            color: option.color
              ? option.color
              : theme === "light"
              ? Colors.light.colors.text
              : Colors.dark.colors.text,
            textAlign: "left",
            opacity: 1,
            textAlignLast: "center",
          }}
        >
          {option.name}
        </div>
      </button>
    );
  };

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
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          animation: "modalSlideUp 0.3s ease-out",
        }}
      >
        <div>
          {options.map((option) => renderOption(option))}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 20px",
              minHeight: "56px",
              width: "100%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              opacity: 1,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onClick={onClose}
          >
            <div
              style={{
                flex: 1,
                fontSize: "16px",
                fontWeight: "600",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
                textAlign: "left",
                opacity: 1,
                textAlignLast: "center",
              }}
            >
              {getLabel("cancelar")}
            </div>
          </button>
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

export default OptionsModal;
