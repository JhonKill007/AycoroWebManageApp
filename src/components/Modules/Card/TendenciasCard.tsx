import {
  faBookmark as faBookmarkRegular,
  faHeart as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBookmark,
  faComment,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useImageBankContext } from "../../context/ImageBankContext";
import { useThemeContext } from "../../context/ThemeContext";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { PostModel } from "../../Models/Post/PostModel";

interface ITendenciasCard {
  index: number;
  publication: PostModel | undefined;
  tendencia: number;
  watchElement: Function;
}

const TendenciasCard = ({
  index,
  publication,
  tendencia,
  watchElement,
}: ITendenciasCard) => {
  const { theme } = useThemeContext();
  const { searchImage } = useImageBankContext();
  const [image, setImage] = useState<MediaDataModel>();

  useEffect(() => {
    const fetchImages = async () => {
      if (publication!.idMediaData) {
        try {
          const [postImage] = await Promise.all([
            searchImage(publication!.idMediaData!),
          ]);
          setImage(postImage!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [publication, searchImage]);

  const getTrendingNumberColor = (position: number) => {
    const colors = {
      1: "#ff6b35",
      2: "#ff8e53",
      3: "#ffb174",
      4: "#4ecdc4",
      5: "#45b7d1",
      6: "#96ceb4",
      7: "#96c4ceff",
      8: "#969dceff",
      9: "#b459c4ff",
      10: "#e94e4eff",
    };
    return colors[position as keyof typeof colors] || "#6c757d";
  };

  return (
    <div
      onClick={() => watchElement(index)}
      style={{
        minWidth: "280px",
        backgroundColor: theme === "light" ? "#fafafa" : "#1a1a1a",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
        cursor: "pointer",
        transition: "transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: "32px",
          height: "32px",
          backgroundColor: getTrendingNumberColor(tendencia),
          color: theme === "light" ? "#fafafa" : "#1a1a1a",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "bold",
          zIndex: 2,
        }}
      >
        {tendencia}
      </div>

      <div
        style={{
          position: "relative",
          height: "200px",
          overflow: "hidden",
        }}
      >
        {image ? (
          <img
            src={image?.Value}
            // alt={`Post by ${post.username}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifySelf: "center",
            }}
            className="color-changing"
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              @{publication?.username}
            </span>
            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  style={{ color: "white", fontSize: "12px" }}
                />
                <span style={{ color: "white", fontSize: "12px" }}>
                  {publication?.likes}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FontAwesomeIcon
                  icon={faComment}
                  style={{ color: "white", fontSize: "12px" }}
                />
                <span style={{ color: "white", fontSize: "12px" }}>
                  {publication?.comments}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // handleLike(post.id);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: publication?.liked ? "#dc3545" : "#6c757d",
              fontSize: "16px",
            }}
          >
            <FontAwesomeIcon
              icon={publication?.liked ? faHeart : faHeartRegular}
            />
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6c757d",
              fontSize: "16px",
            }}
          >
            <FontAwesomeIcon icon={faComment} />
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // handleSave(post.id);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: true ? "#007bff" : "#6c757d",
            // color: post.isSaved ? "#007bff" : "#6c757d",
            fontSize: "16px",
          }}
        >
          <FontAwesomeIcon
            // icon={post.isSaved ? faBookmark : faBookmarkRegular}
            icon={true ? faBookmark : faBookmarkRegular}
          />
        </button>
      </div>
    </div>
  );
};

export default TendenciasCard;
