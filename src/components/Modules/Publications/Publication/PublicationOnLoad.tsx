import {
  faBookmark as faBookmarkRegular,
  faComment as faCommentRegular,
  faHeart as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faArrowsRotate,
  faArrowTurnDown,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PostParams } from "../../../Models/Post/PostParams";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import useHourHook from "../../../hooks/useHourHook";

const PublicationOnLoad = ({ publication }: { publication: PostParams }) => {
  const mentionRegex = /(@[^\s]+)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const { getElapsedTime } = useHourHook();

  const combinedRegex = new RegExp(
    `${urlRegex.source}|${mentionRegex.source}`,
    "g"
  );

  const stringDescription =
    publication?.description && publication?.description.trim() !== ""
      ? publication!.description!.split(combinedRegex)
      : "ghost description".split(combinedRegex);

  return (
    // <div className="container disable-div">
    //   <div className="row">
    //     <div className="col-md-8 publication">
    //       <div className="_progressBar"></div>
    //       <div className="ImageBox">
    //         <img src={props.publication.photo} />
    //       </div>
    //       <div className="InteratorPost">
    //         <div className="LikeComentIcon">
    //           <div className="LikeIcon">
    //             <FontAwesomeIcon className="icon" icon={faHeart} />
    //           </div>
    //           <div className="ComentnIcon">
    //             <FontAwesomeIcon className="icon" icon={faComment} />
    //           </div>
    //         </div>
    //         <div className="settingIcon">
    //           <FontAwesomeIcon className="icon" icon={faEllipsisVertical} />
    //         </div>
    //       </div>
    //       <div className="statePublication"></div>
    //       <div className="statePublication">
    //         <span>{props.publication.description}</span>
    //       </div>
    //       <div className="statePublication">
    //         <strong className="userPublication">
    //           {Auth._User?.user?.username}
    //         </strong>
    //       </div>
    //     </div>
    //   </div>
    //   <br />
    //   <br />
    // </div>
    <div>
      <div className="_progressBar"></div>
      <div
        style={{
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
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflow: "hidden",
          pointerEvents: "none",
          position: "relative",
          opacity: 0.4,
        }}
      >
        {/* Encabezado de la publicación */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #e1306c",
                // cursor: "pointer",
              }}
              // onClick={() => {
              //   navigate(`/${publication.username}`);
              // }}
            >
              <img
                src={
                  userData?.profilePhoto ? userData?.profilePhoto : UserProfile
                }
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                {userData?.user?.username}
              </div>
              {/* {post.location && ( */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#8e8e8e",
                  cursor: "pointer",
                }}
              >
                {/* {post.location} */}
                San Juan, Chile
              </div>
              {/* )} */}
            </div>
          </div>
          <button
            style={{
              background: "none",
              border: "none",
              color:
                theme === "light"
                  ? Colors.light.colors.primary
                  : Colors.dark.colors.primary,
              padding: "8px",
            }}
          >
            <FontAwesomeIcon icon={faEllipsisH} />
          </button>
        </div>

        {/* Imagen de la publicación */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
          }}
        >
          {publication.photo ? (
            <img
              src={publication.photo}
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
        </div>

        {/* Acciones de la publicación */}
        <div
          style={{
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: "30px",
              marginTop: "-430px",
              zIndex: 0,
              position: "relative",
            }}
          >
            <div>
              <div style={{ marginBottom: 30 }}>
                <button
                  style={{
                    width: 50,
                    height: 50,
                    background:
                      theme === "light"
                        ? Colors.light.colors.background
                        : Colors.dark.colors.background,
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHeartRegular}
                    size="lg"
                    color={
                      theme === "light"
                        ? Colors.light.colors.primary
                        : Colors.dark.colors.primary
                    }
                  />
                </button>
              </div>

              <div style={{ marginBottom: 30 }}>
                <button
                  style={{
                    width: 50,
                    height: 50,
                    background:
                      theme === "light"
                        ? Colors.light.colors.background
                        : Colors.dark.colors.background,
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
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
                </button>
              </div>

              <div style={{ marginBottom: 30 }}>
                <button
                  style={{
                    width: 50,
                    height: 50,
                    background:
                      theme === "light"
                        ? Colors.light.colors.background
                        : Colors.dark.colors.background,
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faArrowTurnDown}
                    size="lg"
                    style={{
                      transform: "rotate(-90deg)",
                    }}
                    color={
                      theme === "light"
                        ? Colors.light.colors.primary
                        : Colors.dark.colors.primary
                    }
                  />
                </button>
              </div>

              <div style={{ marginBottom: 30 }}>
                <button
                  style={{
                    width: 50,
                    height: 50,
                    background:
                      theme === "light"
                        ? Colors.light.colors.background
                        : Colors.dark.colors.background,
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faArrowsRotate}
                    size="lg"
                    color={
                      theme === "light"
                        ? Colors.light.colors.primary
                        : Colors.dark.colors.primary
                    }
                  />
                </button>
              </div>

              <div style={{ marginBottom: 30 }}>
                <button
                  style={{
                    width: 50,
                    height: 50,
                    background:
                      theme === "light"
                        ? Colors.light.colors.background
                        : Colors.dark.colors.background,
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBookmarkRegular}
                    size="lg"
                    color={
                      theme === "light"
                        ? Colors.light.colors.primary
                        : Colors.dark.colors.primary
                    }
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Información de likes */}
          <div
            style={{
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
              color:
                theme === "light"
                  ? Colors.light.colors.primary
                  : Colors.dark.colors.primary,
            }}
          ></div>

          {/* Pie de foto */}
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            <span
              style={{
                fontWeight: "600",
                marginRight: "4px",
                color:
                  theme === "light"
                    ? Colors.light.colors.primary
                    : Colors.dark.colors.primary,
              }}
            >
              {userData?.user?.username}
            </span>
            <span
              style={{
                color:
                  theme === "light"
                    ? Colors.light.colors.primary
                    : Colors.dark.colors.primary,
              }}
            >
              {publication.description &&
                publication.description.trim() !== "" &&
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

          {/* Tiempo de publicación */}
          <div
            style={{
              color: "#8e8e8e",
              fontSize: "10px",
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            {getElapsedTime(new Date())}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationOnLoad;
