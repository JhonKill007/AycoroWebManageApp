import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { faEllipsisH, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import useHourHook from "../../../hooks/useHourHook";
import useLanguage from "../../../hooks/useLanguage";
import { ComentModel } from "../../../Models/Coment/ComentModel";
import { ComentParams } from "../../../Models/Coment/ComentParams";
import { ModalOptionModel } from "../../../Models/data/ModalOptionModel";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import comentService from "../../../Services/Coments/ComentService";
import likeService from "../../../Services/Like/LikeService";
import EditModal from "../../Common/Modal/EditModal";
import OptionsModal from "../../Common/Modal/OptionsModal";

export const CommetHomeCard = ({
  coment,
  handleComentChange,
  onDelete,
}: {
  coment: ComentModel;
  handleComentChange: (coment: ComentModel) => void;
  onDelete: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const { searchImage } = useImageBankContext();
  const { getElapsedTime } = useHourHook();
  const [likes, setLikes] = useState<number>(0);
  const [image, setImage] = useState<MediaDataModel>();
  const [liked, setLiked] = useState<boolean>(false);
  const [optionsModalVisible, setOptionsModalVisible] =
    useState<boolean>(false);
  const [isModalEditVisible, setModalEditVisible] = useState<boolean>(false);

  useEffect(() => {
    setLiked(coment.liked!);
    setLikes(coment.likes!);
  }, [coment]);

  useEffect(() => {
    const fetchImages = async () => {
      if (coment.idMediaDataProfile) {
        try {
          const [postImage] = await Promise.all([
            searchImage(coment.idMediaDataProfile!),
          ]);
          setImage(postImage!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [coment, searchImage]);

  const ActionLike = (idComent: string) => {
    liked
      ? likeService
          .RemoveLikeComent(idComent)
          .then((e: any) => {})
          .catch((err: any) => {
            console.log(err);
          })
      : likeService
          .setLikeComent(idComent)
          .then((e: any) => {})
          .catch((err: any) => {
            console.log(err);
          });
  };

  const options: ModalOptionModel[] = [
    {
      name: getLabel("eliminar"),
      function: async () => {
        await comentService.Delete(coment.id!);
        onDelete(coment.id!);
      },
      color: "red",
    },
    // {
    //   name: getLabel("editar"),
    //   function: () => setModalEditVisible(true),
    //   color: "",
    // },
  ];

  const updateComent = async (value: string) => {
    console.log("Comentario:",coment);
    
    const model: ComentParams = {
      idcoment: undefined,
      iditem: coment.id,
      type: undefined,
      iduser: undefined,
      coment: value,
    };

    // console.log(model);
    
    await comentService.Update(model);

    const updatedComent: ComentModel = {
      ...coment,
      coment: value,
    };

    // console.log(updatedComent);
    handleComentChange(updatedComent);
  };

  return (
    <div
      style={{
        padding: 15,
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        borderRadius: "12px",
        border: `1px solid ${
          theme === "light"
            ? Colors.light.colors.border
            : Colors.dark.colors.border
        }`,
        marginBottom: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          // marginBottom: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              //   background: "#0095f6",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: "8px",
            }}
          >
            <img
              style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              src={image ? image.Value : UserProfile}
              alt=""
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
                marginBottom: "2px",
              }}
            >
              {coment.username}
            </div>
          </div>
        </div>

        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={() => {
            setOptionsModalVisible(true);
          }}
        >
          <FontAwesomeIcon
            icon={faEllipsisH}
            color={
              theme === "light"
                ? Colors.light.colors.primary
                : Colors.dark.colors.primary
            }
          />
        </button>
      </div>

      <div
        style={{
          fontSize: "14px",
          marginLeft: "40px",
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <span
            style={{
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
            }}
          >
            {coment.coment}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: 5 }}>
              <button
                onClick={() => {
                  setLiked(!liked);
                  liked === true
                    ? likes === 1
                      ? setLikes(0)
                      : likes === 0
                      ? setLikes(0)
                      : setLikes(likes - 1)
                    : likes === 0
                    ? setLikes(1)
                    : setLikes(likes + 1);
                  ActionLike(coment.id!);
                }}
                style={{
                  border: "none",
                  cursor: "pointer",
                  background: "none",
                }}
              >
                <FontAwesomeIcon
                  icon={liked ? faHeart : faHeartRegular}
                  size="lg"
                  color={
                    liked
                      ? "#ed4956"
                      : theme === "light"
                      ? Colors.light.colors.primary
                      : Colors.dark.colors.primary
                  }
                />
              </button>
            </div>
            {likes !== 0 && (
              <div style={{ marginRight: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                  }}
                >
                  {likes === 1
                    ? getLabel("me_gusta", { param: `${likes}` })
                    : getLabel("me_gustas", { param: `${likes}` })}
                </span>
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#8e8e8e",
              marginTop: 2,
              alignContent: "flex-end",
            }}
          >
            {getElapsedTime(new Date(coment.createDate!))}
          </div>
        </div>
      </div>

      <OptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        options={options}
      />

      <EditModal
        isOpen={isModalEditVisible}
        onClose={() => setModalEditVisible(false)}
        onSave={updateComent}
        item={coment.coment!}
        title={getLabel("editar")}
        maxLength={2200}
      />
    </div>
  );
};
