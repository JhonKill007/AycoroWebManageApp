// components/Explorer.tsx
import {
  faBookmark as faBookmarkRegular,
  faHeart as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBookmark,
  faComment,
  faHeart,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useImageBankContext } from "../../context/ImageBankContext";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { PostModel } from "../../Models/Post/PostModel";

interface IMosaic {
  index: number;
  publication: PostModel;
  watchElement: Function;
}

const MosaicCard = ({ index, publication, watchElement }: IMosaic) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [image, setImage] = useState<MediaDataModel>();

  const { searchImage } = useImageBankContext();

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

  return (
    <div
      onClick={() => watchElement(index)}
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "transform 0.2s",
        gridRow: index % 3 === 0 ? "span 2" : "span 1",
        height: index % 3 === 0 ? "400px" : "250px",
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
          position: "relative",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {image ? (
          <img
            src={image?.Value}
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
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              @{publication.username}
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
                  {publication.likes}
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
                  {publication.comments}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
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
                  color: publication.liked ? "#dc3545" : "white",
                  fontSize: "16px",
                }}
              >
                <FontAwesomeIcon
                  icon={publication.liked ? faHeart : faHeartRegular}
                />
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: "16px",
                }}
              >
                <FontAwesomeIcon icon={faComment} />
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: "16px",
                }}
              >
                <FontAwesomeIcon icon={faShare} />
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isSaved ? "#007bff" : "white",
                fontSize: "16px",
              }}
            >
              <FontAwesomeIcon
                icon={isSaved ? faBookmark : faBookmarkRegular}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MosaicCard;
