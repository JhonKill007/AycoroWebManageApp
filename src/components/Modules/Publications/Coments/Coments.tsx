import { faEllipsisVertical, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../../assets/img/UserProfile.jpg";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { ComentModel } from "../../../Models/Coment/ComentModel";
import { ModalOptionModel } from "../../../Models/data/ModalOptionModel";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import Coment from "../../../Services/Coments/ComentService";
import Like from "../../../Services/Like/LikeService";
import EditModal from "../../Modals/EditModal";
import "./Coments.css";

interface IComents {
  coment: ComentModel;
  handleComentChange: Function;
  onDelete: Function;
}

const Coments = ({ coment, handleComentChange, onDelete }: IComents) => {
  const navigate = useNavigate();
  const { searchImage } = useImageBankContext();
  const [likes, setLikes] = useState<number>(0);
  const [image, setImage] = useState<MediaDataModel>();
  const [liked, setLiked] = useState<boolean>(false);
  const [isModalOptionsVisible, setModalOptionsVisible] =
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
      ? Like.RemoveLikeComent(idComent)
          .then((e: any) => {})
          .catch((err: any) => {
            console.log(err);
          })
      : Like.setLikeComent(idComent)
          .then((e: any) => {})
          .catch((err: any) => {
            console.log(err);
          });
  };

  const Delete = (id: string) => {
    Coment.Delete(id)
      .then((e: any) => {
        onDelete();
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const options: ModalOptionModel[] = [
    {
      name: "Eliminar",
      function: () => {
        Delete(coment.id!);
      },
      color: "red",
    },
  ];

  const Updatecoments = (text: string) => {
    // const C: ComentParams = {
    //   idcoment: coment.id,
    //   idpost: coment.idPost,
    //   iduser: Auth._User?.user?.id,
    //   coment: text,
    //   createDate_Js: Data._Today.toISOString(),
    // };
    // const model: ComentModel = {
    //   id: coment.id,
    //   idPost: coment.idPost,
    //   idUser: coment.idUser,
    //   coment: text,
    //   status: coment.status,
    //   name: coment.name,
    //   username: coment.username,
    //   idMediaDataProfile: "",
    //   profilePhoto: coment.profilePhoto,
    //   likes: coment.likes,
    //   liked: coment.liked,
    //   createDate: coment.createDate,
    // };
    // Coment.Update(C)
    //   .then((e: any) => {
    //     handleComentChange(model);
    //   })
    //   .catch((err: any) => {
    //     console.log(err);
    //   });
  };

  return (
    <>
      <div className="Coment">
        <div className="headComent">
          <div className="coment_container">
            <div className="PerfilComent">
              {image ? (
                <img src={image.Value} alt="" />
              ) : (
                <img src={UserProfile} alt="" />
              )}
            </div>
            <div className="CometBody">
              <div className="nameAndBodyOfComent">
                <strong
                  style={{ cursor: "pointer", color: "black" }}
                  onClick={() => {
                    navigate(`/${coment.username}`, { replace: true });
                  }}
                >
                  {coment.username}{" "}
                </strong>
                <span style={{ color: "black" }}> {coment.coment}</span>
              </div>
            </div>
          </div>
            <div
              className="coment_options"
              onClick={() => setModalOptionsVisible(true)}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </div>
        </div>
        <div className="likeContainer">
          <div className="likesComents">
            <div
              className="LikeComent"
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
            >
              {liked && (
                <FontAwesomeIcon
                  className="iconLikeComent"
                  style={{ color: "red" }}
                  icon={faHeart}
                />
              )}
              {!liked && (
                <FontAwesomeIcon
                  className="iconLikeComent"
                  style={{ color: "grey" }}
                  icon={faHeart}
                />
              )}
            </div>
          </div>
          {likes !== 0 && (
            <div className="lettle-like">
              <span className="CantOfLikesComents">
                {likes.toString() === "1" ? `${likes} Like` : `${likes} Likes`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* {isModalOptionsVisible && (
        <ModalOptions
          setModalVisible={setModalOptionsVisible}
          isModalVisible={isModalOptionsVisible}
          options={options}
        />
      )} */}
      {isModalEditVisible && (
        <EditModal
          setModalVisible={setModalEditVisible}
          isModalVisible={isModalEditVisible}
          text={coment.coment!}
          saveFunction={Updatecoments}
        />
      )}
    </>
  );
};

export default Coments;
