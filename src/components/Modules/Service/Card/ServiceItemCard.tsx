// components/ServiceItemCard.tsx
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../../../constants/Colors";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import useLanguage from "../../../hooks/useLanguage";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import { ServiceModel } from "../../../Models/Service/ServiceModel";

interface ServiceItemCardProps {
  item: ServiceModel;
  isVerified?: boolean;
  isRepresentative?: boolean;
}

const ServiceItemCard: React.FC<ServiceItemCardProps> = ({
  item,
  isVerified = false,
  isRepresentative = false,
}) => {
  const { theme } = useThemeContext();
  const navigate = useNavigate();
  const { getLabel } = useLanguage();
  const { searchImage } = useImageBankContext();
  const [Image, setImage] = useState<MediaDataModel>();

  useEffect(() => {
    const fetchImages = async () => {
      if (item.idMediaData) {
        try {
          const [Image] = await Promise.all([searchImage(item.idMediaData!)]);
          setImage(Image!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [item, searchImage]);

  const getTypeLabel = (type: string) => {
    const labels = {
      service: getLabel("servicio"),
      product: getLabel("producto"),
      professional: getLabel("profesional"),
      business: getLabel("negocio"),
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      service: "#007bff",
      product: "#28a745",
      professional: "#6f42c1",
      business: "#b4c142ff",
    };
    return colors[type as keyof typeof colors] || "#6c757d";
  };

  const calculateRating = () => {
    return item?.cantScorer === 0 ? 0 : item?.score! / item?.cantScorer!;
  };

  const renderStars = (rating: number, size: string = "sm") => {
    const sizeMap = {
      sm: "12px",
      md: "14px",
      lg: "16px",
      xl: "20px",
    };

    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesomeIcon
            key={star}
            icon={faStar}
            style={{
              color: star <= rating ? "#FFD700" : "#e5e7eb",
              fontSize: sizeMap[size as keyof typeof sizeMap],
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .action-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-size: 14px;
          }
          
          .action-button.primary {
            background: ${Colors.detailAppColor};
            color: white;
          }
          
          .action-button.primary:hover {
            background: ${Colors.detailAppColor}dd;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px ${Colors.detailAppColor}40;
          }
          
          .action-button.secondary {
            background: transparent;
            border: 1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"};
            color: ${theme === "light" ? "#374151" : "#d1d5db"};
          }
          
          .action-button.secondary:hover {
            background: ${theme === "light" ? "#f9fafb" : "#374151"};
            border-color: ${theme === "light" ? "#9ca3af" : "#6b7280"};
          }
          
          .service-card {
            background: ${theme === "light" ? "#ffffff" : "#1f2937"};
            border-radius: 12px;
            padding: 20px;
            border: 1px solid ${theme === "light" ? "#e5e7eb" : "#374151"};
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .service-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            border-color: ${Colors.detailAppColor};
          }
          
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          
          .modal-content {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 16px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease;
          }
          
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .rating-input {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            justify-content: center;
          }
          
          .rating-star {
            cursor: pointer;
            transition: transform 0.2s;
            font-size: 32px;
            color: #e5e7eb;
          }
          
          .rating-star.active {
            color: #FFD700;
          }
          
          .rating-star:hover {
            transform: scale(1.2);
          }
          
          .stat-card {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid ${theme === "light" ? "#e2e8f0" : "#374151"};
          }
          
          .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: ${
              theme === "light"
                ? Colors.light.colors.text
                : Colors.dark.colors.text
            };
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 14px;
            color: ${
              theme === "light"
                ? Colors.light.colors.text
                : Colors.dark.colors.text
            };
          }
          
          .comment-card {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 12px;
            padding: 20px;
            border: 1px solid ${
              theme === "light"
                ? Colors.light.colors.border
                : Colors.dark.colors.border
            };
            transition: all 0.2s;
          }
          
          .comment-card:hover {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
          }
          
          .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .feature-list li {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 0;
            color: ${
              theme === "light"
                ? Colors.light.colors.text
                : Colors.dark.colors.text
            };
          }
          
          .feature-list li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
          }
          
          .progress-bar {
            height: 8px;
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 4px;
            overflow: hidden;
            margin: 8px 0;
          }
          
          .progress-fill {
            height: 100%;
            background: ${Colors.detailAppColor};
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          
          .mobile-only {
            display: none;
          }
          
          .desktop-only {
            display: block;
          }
          
        
        `}
      </style>
      <div
        className="service-card"
        onClick={() => navigate(`/services/${item.id}`)}
      >
        <div
          style={{
            position: "relative",
            height: "200px",
            overflow: "hidden",
            borderRadius: "10px",
          }}
        >
          {Image ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Background borroso */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${Image?.Value})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(3px)",
                  transform: "scale(1.1)", // evita bordes tras el blur
                  opacity: 0.6,
                }}
              />

              {/* Imagen principal */}
              <img
                src={Image?.Value}
                alt={item.title}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 8,
                  zIndex: 1,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                backgroundColor:
                  theme === "light"
                    ? "#879bb2ff"
                    : Colors.dark.colors.background,
                height: 200,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 208, 172, 0.15) 0%, transparent 50%)",
                  color: "#ffffffff",
                  fontSize: "48px",
                  fontWeight: "bold",
                }}
              >
                {item.title?.charAt(0)}
              </div>
            </div>
          )}

          {/* Badge de Categoría */}
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "white",
              backgroundColor: getTypeColor(item.type as string),
              zIndex: 2,
            }}
          >
            {getTypeLabel(item.type as string)}
          </span>

          {/* Badge Verificado en imagen */}
          {isVerified && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "bold",
                color: "white",
                backgroundColor: "#28a745",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                zIndex: 2,
              }}
            >
              <span>✓</span>
              <span>{getLabel("verificado")}</span>
            </div>
          )}

          {/* Badge Representante en imagen */}
          {isRepresentative && (
            <div
              style={{
                position: "absolute",
                top: isVerified ? "40px" : "10px",
                left: "10px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "bold",
                color: "white",
                backgroundColor: "#6f42c1",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                zIndex: 2,
              }}
            >
              <span>👤</span>
              <span>{getLabel("representante")}</span>
            </div>
          )}
        </div>
        {/* <div
          style={{
            height: "200px",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
            marginBottom: "15px",
          }}
        >
          <img
            src={
              "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"
            }
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
          />
        </div> */}

        <div style={{ height: "60px", marginTop: "10px" }}>
          <h4
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
              margin: "0 0 10px 0",

              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {item.title}
          </h4>
        </div>
        <div style={{ height: "50px" }}>
          <p
            style={{
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,

              fontSize: "14px",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
              margin: "0 0 15px 0",
            }}
          >
            {item.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {renderStars(item.score || 4, "sm")}
            <span
              style={{
                fontSize: "14px",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
              }}
            >
              ({calculateRating() || 0})
            </span>
          </div>

          <button
            className="action-button secondary"
            style={{ padding: "8px 16px" }}
          >
            {getLabel("ver_detalles")}
          </button>
        </div>
      </div>
    </>
  );
};

export default ServiceItemCard;
