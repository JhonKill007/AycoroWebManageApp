import { faComment, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useImageBankContext } from "../../context/ImageBankContext";
import { MediaDataModel } from "../../Models/MediaData/MediaDataModel";
import { PostModel } from "../../Models/Post/PostModel";
import { PostViewerModal } from "../Common/Components/PostViewerModal";

interface IPostGridCard {
  index: number;
  publication: PostModel;
  publications: PostModel[];
}

export const PostGridCard = ({
  index,
  publication,
  publications,
}: IPostGridCard) => {
  const { searchImage } = useImageBankContext();
  const [imagePost, setImagePost] = useState<MediaDataModel>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    const fetchImages = async () => {
      if (publication.idMediaData) {
        try {
          const [postImage] = await Promise.all([
            searchImage(publication.idMediaData!),
          ]);
          setImagePost(postImage!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [publication, searchImage]);

  // Función para formatear números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          backgroundColor: "#fafafa",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <img
          src={imagePost?.Value}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Overlay con estadísticas - Solo en desktop */}
        {!isMobile && (
          <div
            className="post-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FontAwesomeIcon icon={faHeart} />
                <span style={{ fontWeight: "600", fontSize: "16px" }}>
                  {formatNumber(publication.likes!)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FontAwesomeIcon icon={faComment} />
                <span style={{ fontWeight: "600", fontSize: "16px" }}>
                  {formatNumber(publication.comments!)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Indicadores de tipo de contenido */}
        {/* {post.isVideo && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? "8px" : "12px",
            right: isMobile ? "8px" : "12px",
            color: "white",
            fontSize: isMobile ? "14px" : "16px",
          }}
        >
          <FontAwesomeIcon icon={faPlay} />
        </div>
      )} */}

        {/* Post Type: video, image, carrucel */}
        {/* {post.type === "carousel" && (
            <div
              style={{
                position: "absolute",
                top: isMobile ? "8px" : "12px",
                right: isMobile ? "8px" : "12px",
                color: "white",
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              <FontAwesomeIcon icon={faImages} />
            </div>
          )} */}
      </div>
      {isModalOpen && (
        <PostViewerModal
          publications={publications}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          index={index}
        />
      )}
    </>
  );
};
