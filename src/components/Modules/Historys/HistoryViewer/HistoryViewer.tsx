import {
  faCaretLeft,
  faCaretRight,
  faEllipsisH,
  faEye,
  faHeart,
  faPaperPlane,
  faReply,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HistoryListItemModel } from "../../../Models/History/HistoryListItemModel";
import { HistoryModel } from "../../../Models/History/HistoryModel";
import { HistoryUserViewer } from "../../../Models/History/HistoryUserViewer";
import { ModalOptionModel } from "../../../Models/data/ModalOptionModel";
import History from "../../../Services/History/HistoryService";
import {
  default as Like,
  default as likeService,
} from "../../../Services/Like/LikeService";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { useUserContext } from "../../../context/UserContext";
import useHourHook from "../../../hooks/useHourHook";
import useLanguage from "../../../hooks/useLanguage";
import HistoryImageViewer from "./HistoryImageViewer/HistoryImageViewer";
import HistoryProgressBar from "./HistoryProgressBar/HistoryProgressBar";
import "./HistoryViewer.css";

interface IHistoryViewer {
  data: HistoryListItemModel[];
  userIndex: number;
  historyIndex: number;
  setViewHistoryViewer: Function;
  updateHistorys: Function;
  deleteHistory: Function;
}

const HistoryViewer = ({
  data,
  userIndex,
  historyIndex,
  setViewHistoryViewer,
  updateHistorys,
  deleteHistory,
}: IHistoryViewer) => {
  const navigate = useNavigate();
  const { getLabel } = useLanguage();
  const { userData } = useUserContext();
  const { getElapsedTime } = useHourHook();
  const [indexUser, setIndexUser] = useState<number>(userIndex!);
  const [indexHistory, setIndexHistory] = useState<number>(historyIndex!);
  const [running, setRunning] = useState<boolean>(true);
  const [load, setLoad] = useState<boolean>(false);
  const [isModalOptionsVisible, setModalOptionsVisible] =
    useState<boolean>(false);
  const [historyUserList, setHistoryUserList] = useState<boolean>(false);
  const [UsersViewers, setUsersViewers] = useState<HistoryUserViewer[]>();

  // useEffect(() => {
  //   if (data[indexUser].historysData![indexHistory] != undefined) {
  //     if (
  //       data[indexUser].historysData![indexHistory].idMediaData &&
  //       data[indexUser].historysData![indexHistory].mediaData == null
  //     ) {
  //       getHistory(data[indexUser].historysData![indexHistory].idMediaData!);
  //     }
  //     if (
  //       data[indexUser].idMediaDataProfile &&
  //       data[indexUser].profilePhoto == null
  //     ) {
  //       getProfile(data[indexUser].idMediaDataProfile!);
  //     }
  //   } else {
  //     setViewHistoryViewer(false);
  //   }
  // }, [data, indexHistory, indexUser]);

  useEffect(() => {
    if (data[indexUser].historysData![indexHistory] != undefined) {
      if (
        data[indexUser].historysData![indexHistory].mediaData &&
        !data[indexUser].historysData![indexHistory].seen &&
        data[indexUser].historysData![indexHistory].idUser !==
          userData?.user?.id
      ) {
        SetView(
          data[indexUser].historysData![indexHistory].id!,
          userData?.user?.id!
        );
      }
    } else {
      setViewHistoryViewer(false);
    }
  }, [data]);

  const SetView = (idhistory: string, iduser: string) => {
    setFillHistory(
      data[indexUser].historysData![indexHistory].id!,
      data[indexUser].historysData![indexHistory].amountOfLikes!,
      data[indexUser].historysData![indexHistory].liked!,
      true
    );
    History.SetViewHistory(idhistory)
      .then((e: any) => {})
      .catch((err: any) => {
        console.error(err);
      });
  };

  const NextHistory = () => {
    setLoad(false);
    if (data[indexUser].historysData?.length! > indexHistory + 1) {
      setIndexHistory(indexHistory + 1);
    } else {
      if (data?.length! > indexUser + 1) {
        setIndexUser(indexUser + 1);
        setIndexHistory(
          data[indexUser + 1].historysData?.indexOf(
            data[indexUser + 1].historysData?.find(
              (h: HistoryModel) => h.seen === false
            )!
          ) !== -1
            ? data[indexUser + 1].historysData?.indexOf(
                data[indexUser + 1].historysData?.find(
                  (h: HistoryModel) => h.seen === false
                )!
              )!
            : 0
        );
      } else {
        setViewHistoryViewer(false);
      }
    }
  };

  const setFillHistory = (
    id: string,
    amountOfLikes: number,
    liked: boolean,
    seen: boolean
  ) => {
    const historyArray = data[indexUser].historysData!.map(
      (h: HistoryModel) => {
        if (h.id === id) {
          return {
            ...h,
            liked: liked,
            amountOfLikes: amountOfLikes,
            seen: seen,
          };
        }
        return h;
      }
    );

    const historyUser = data.map((D: HistoryListItemModel) => {
      if (D.idUser === data[indexUser].idUser) {
        return {
          ...D,
          historysData: historyArray,
        };
      }
      return D;
    });

    updateHistorys(historyUser);

    liked ? likeService.setHistoryLike(id) : likeService.RemoveHistoryLike(id);
  };

  const ActionLike = (idhistory: string) => {
    data[indexUser].historysData![indexHistory].liked!
      ? Like.setHistoryLike(idhistory)
      : Like.RemoveHistoryLike(idhistory);
  };

  const GetUsersViewers = (id: string) => {
    History.GetUserHistorysViewers(id, 1)
      .then((e: any) => {
        setUsersViewers(e.data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const Delete = (id: string) => {
    History.Delete(id)
      .then((e: any) => {
        deleteHistory(data[indexUser].historysData![indexHistory].id!);
        setRunning(true);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const options: ModalOptionModel[] = [
    {
      name: "Eliminar",
      function: () => {
        Delete(data[indexUser].historysData![indexHistory].id!);
      },
      color: "red",
    },
  ];

  return (
    <>
      {data[indexUser].historysData![indexHistory] !== undefined && (
        <>
          {/* <div className="HYmodal_box">
            <div className="HYmodal_container">
              <div className="HYmodal_button">
                <div className="div_view_container">
                  <div className="chevron_box">
                    {indexHistory !== 0 ? (
                      <div
                        onClick={() => {
                          if (indexHistory > 0) {
                            setIndexHistory(indexHistory - 1);
                          }
                        }}
                      >
                        <FontAwesomeIcon
                          className="arrow_left_box"
                          icon={faChevronLeft}
                        />
                      </div>
                    ) : indexUser !== 0 ? (
                      <div
                        onClick={() => {
                          setIndexUser(indexUser - 1);
                          setIndexHistory(
                            data[indexUser - 1].historysData?.indexOf(
                              data[indexUser - 1].historysData?.find(
                                (h: HistoryModel) => h.seen === false
                              )!
                            ) !== -1
                              ? data[indexUser - 1].historysData?.indexOf(
                                  data[indexUser - 1].historysData?.find(
                                    (h: HistoryModel) => h.seen === false
                                  )!
                                )!
                              : 0
                          );
                        }}
                      >
                        <FontAwesomeIcon
                          className="arrow_left_box"
                          icon={faChevronLeft}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="ViewModalHY">
                    <div className="usersHyContainert">
                      {indexUser > 1 && (
                        <div
                          className="userHy"
                          onClick={() => {
                            setIndexUser(indexUser - 2);
                            setIndexHistory(
                              data[indexUser - 2].historysData?.indexOf(
                                data[indexUser - 2].historysData?.find(
                                  (h: HistoryModel) => h.seen === false
                                )!
                              ) !== -1
                                ? data[indexUser - 2].historysData?.indexOf(
                                    data[indexUser - 2].historysData?.find(
                                      (h: HistoryModel) => h.seen === false
                                    )!
                                  )!
                                : 0
                            );
                          }}
                        >
                          <img src={UserProfile} />
                          {data[indexUser - 2].profilePhoto ? (
                            <img src={data[indexUser - 2].profilePhoto} />
                          ) : (
                            <img src={UserProfile} />
                          )}
                        </div>
                      )}

                      {indexUser > 0 && (
                        <div
                          className="userHy"
                          onClick={() => {
                            setIndexUser(indexUser - 1);
                            setIndexHistory(
                              data[indexUser - 1].historysData?.indexOf(
                                data[indexUser - 1].historysData?.find(
                                  (h: HistoryModel) => h.seen === false
                                )!
                              ) !== -1
                                ? data[indexUser - 1].historysData?.indexOf(
                                    data[indexUser - 1].historysData?.find(
                                      (h: HistoryModel) => h.seen === false
                                    )!
                                  )!
                                : 0
                            );
                          }}
                        >
                          {data[indexUser - 1].profilePhoto ? (
                            <img src={data[indexUser - 1].profilePhoto} />
                          ) : (
                            <img src={UserProfile} />
                          )}
                        </div>
                      )}
                      {data[indexUser].profilePhoto ? (
                        data[indexUser].idUser === userData?.user?.id ? (
                          <div className="userHy center_user_hy">
                            <img src={userData?.profilePhoto} />
                          </div>
                        ) : (
                          <div className="userHy center_user_hy">
                            <img src={data[indexUser].profilePhoto} />
                          </div>
                        )
                      ) : (
                        <div className="userHy center_user_hy">
                          <img src={UserProfile} />
                        </div>
                      )}

                      {indexUser + 1 < data.length && (
                        <div
                          className="userHy"
                          onClick={() => {
                            setIndexUser(indexUser + 1);
                            setIndexHistory(
                              data[indexUser + 1].historysData?.indexOf(
                                data[indexUser + 1].historysData?.find(
                                  (h: HistoryModel) => h.seen === false
                                )!
                              ) !== -1
                                ? data[indexUser + 1].historysData?.indexOf(
                                    data[indexUser + 1].historysData?.find(
                                      (h: HistoryModel) => h.seen === false
                                    )!
                                  )!
                                : 0
                            );
                          }}
                        >
                          {data[indexUser + 1].profilePhoto ? (
                            <img src={data[indexUser + 1].profilePhoto} />
                          ) : (
                            <img src={UserProfile} />
                          )}
                        </div>
                      )}

                      {indexUser + 2 < data.length && (
                        <div
                          className="userHy"
                          onClick={() => {
                            setIndexUser(indexUser + 2);
                            setIndexHistory(
                              data[indexUser + 2].historysData?.indexOf(
                                data[indexUser + 2].historysData?.find(
                                  (h: HistoryModel) => h.seen === false
                                )!
                              ) !== -1
                                ? data[indexUser + 2].historysData?.indexOf(
                                    data[indexUser + 2].historysData?.find(
                                      (h: HistoryModel) => h.seen === false
                                    )!
                                  )!
                                : 0
                            );
                          }}
                        >
                          {data[indexUser + 2].profilePhoto ? (
                            <img src={data[indexUser + 2].profilePhoto} />
                          ) : (
                            <img src={UserProfile} />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="progresbar_mother_box">
                      {data[indexUser].historysData?.map(
                        (f: any, key: number) => (
                          <div key={key} className="container_progresbar_box">
                            <div className="progresbar_box_othersDiv"></div>
                            <div
                              className="progresbar_box"
                              style={{
                                backgroundColor: `${
                                  indexHistory > key ? "#a66cff" : "white"
                                }`,
                              }}
                            >
                              {indexHistory === key && (
                                <>
                                  {load && (
                                    <HistoryProgressBar
                                      indexUser={indexUser}
                                      indexMap={key}
                                      indexH={indexHistory}
                                      NextHistory={NextHistory}
                                      running={running}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                            <div className="progresbar_box_othersDiv"></div>
                          </div>
                        )
                      )}
                    </div>
                    <div className="ViewModalHYContainer">
                      {!historyUserList && (
                        <>
                          <div className="HyInterator">
                            {data[indexUser].idUser === userData?.user?.id ? (
                              <div className="ViewsDiv">
                                <span>
                                  <FontAwesomeIcon
                                    style={{ color: "white" }}
                                    icon={faEye}
                                  />{" "}
                                  {
                                    data[indexUser].historysData![indexHistory]
                                      .amountOfViews
                                  }
                                </span>
                              </div>
                            ) : (
                              <div
                                className="LikeIcon"
                                onClick={() => {
                                  if (
                                    data[indexUser].historysData![indexHistory]
                                      .mediaData
                                  ) {
                                    data[indexUser].historysData![indexHistory]
                                      .liked
                                      ? setFillHistory(
                                          data[indexUser].historysData![
                                            indexHistory
                                          ].id!,
                                          data[indexUser].historysData![
                                            indexHistory
                                          ].amountOfLikes! - 1,
                                          !data[indexUser].historysData![
                                            indexHistory
                                          ].liked!,
                                          data[indexUser].historysData![
                                            indexHistory
                                          ].seen!
                                        )
                                      : setFillHistory(
                                          data[indexUser].historysData![
                                            indexHistory
                                          ].id!,
                                          data[indexUser].historysData![
                                            indexHistory
                                          ].amountOfLikes! + 1,
                                          !data[indexUser].historysData![
                                            indexHistory
                                          ].liked!,
                                          data[indexUser].historysData![
                                            indexHistory
                                          ].seen!
                                        );

                                    ActionLike(
                                      data[indexUser].historysData![
                                        indexHistory
                                      ].id!
                                    );
                                  }
                                }}
                              >
                                {data[indexUser].historysData![indexHistory]
                                  .liked ? (
                                  <FontAwesomeIcon
                                    style={{ color: "red" }}
                                    className="icon"
                                    icon={faHeart}
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    style={{ color: "white" }}
                                    className="icon"
                                    icon={faHeart}
                                  />
                                )}
                              </div>
                            )}

                            <div className="nameHy">
                              <p
                                className="nameHyP"
                                onClick={() =>
                                  navigate(`/${data[indexUser].username}`, {
                                    replace: true,
                                  })
                                }
                              >
                                {data[indexUser].username}
                              </p>
                              <p className="DateHyP">
                                {
                                  data[indexUser].historysData![indexHistory]
                                    .createDate
                                }
                              </p>
                            </div>

                            <div
                              className="settingIcon"
                              onClick={() => {
                                if (
                                  data[indexUser].idUser === userData?.user?.id
                                ) {
                                  setModalOptionsVisible(true);
                                  setRunning(false);
                                }
                              }}
                            >
                              {data[indexUser].idUser ===
                                userData?.user?.id && (
                                <FontAwesomeIcon
                                  style={{ color: "white" }}
                                  className="icon"
                                  icon={faEllipsisVertical}
                                />
                              )}
                            </div>
                          </div>
                          {data[indexUser].idUser === userData?.user?.id && (
                            <div className="chevronup">
                              <div
                                className="chevronup-box"
                                onClick={() => {
                                  setHistoryUserList(true);
                                  setRunning(false);
                                  GetUsersViewers(
                                    data[indexUser].historysData![indexHistory]
                                      .id!
                                  );
                                }}
                              >
                                <FontAwesomeIcon
                                  style={{ color: "white" }}
                                  className="icon"
                                  icon={faChevronUp}
                                />
                              </div>
                            </div>
                          )}
                          <HistoryImageViewer
                            setRunning={setRunning}
                            data={data[indexUser].historysData![indexHistory]}
                            setLoad={setLoad}
                          />
                        </>
                      )}

                      {historyUserList && (
                        <>
                          <div className="chevrondown">
                            <div
                              className="chevronup-box"
                              onClick={() => {
                                setHistoryUserList(false);
                                setRunning(true);
                                setUsersViewers(undefined);
                              }}
                            >
                              <FontAwesomeIcon
                                style={{ color: "white" }}
                                className="icon"
                                icon={faChevronDown}
                              />
                            </div>
                          </div>
                          {UsersViewers !== undefined &&
                          data[indexUser].historysData![indexHistory]
                            .amountOfViews! > 0 ? (
                            <>
                              <div className="userhistoryconteiner">
                                <h6
                                  style={{
                                    color: "#e9ecef",
                                    marginLeft: "5px",
                                  }}
                                >
                                  Vista por
                                </h6>
                                {UsersViewers.map(
                                  (U: HistoryUserViewer, key: number) => (
                                    <div
                                      className="historyuserbox"
                                      key={key}
                                      onClick={() =>
                                        navigate(`/${U.user?.username}`, {
                                          replace: true,
                                        })
                                      }
                                    >
                                      <div className="historyuserProfile">
                                        {U.user?.profilePhoto ? (
                                          <img
                                            src={U.user.profilePhoto}
                                            alt=""
                                          />
                                        ) : (
                                          <img src={UserProfile} alt="" />
                                        )}
                                        {U.liked && (
                                          <div className="iconHy">
                                            <FontAwesomeIcon
                                              style={{ color: "red" }}
                                              icon={faHeart}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <div className="historyuserName">
                                        <b
                                          style={{
                                            color: "#e9ecef",
                                            marginLeft: "5px",
                                          }}
                                        >
                                          {U.user?.name}
                                        </b>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </>
                          ) : UsersViewers === undefined &&
                            data[indexUser].historysData![indexHistory]
                              .amountOfViews! > 0 ? (
                            <div className="spiner">
                              <ChargerSlice />
                            </div>
                          ) : (
                            <div className="lettle_HY">
                              <br />
                              <br />
                              <b style={{ color: "white" }}>
                                Aun no tiene visualizaciones.
                              </b>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="chevron_box">
                    {data[indexUser].historysData?.length! >
                    indexHistory + 1 ? (
                      <div
                        onClick={() => {
                          setIndexHistory(indexHistory + 1);
                        }}
                      >
                        <FontAwesomeIcon
                          className="arrow_left_box"
                          icon={faChevronRight}
                        />
                      </div>
                    ) : data.length > indexUser + 1 ? (
                      <div
                        onClick={() => {
                          setIndexUser(indexUser + 1);
                          setIndexHistory(
                            data[indexUser + 1].historysData?.indexOf(
                              data[indexUser + 1].historysData?.find(
                                (h: HistoryModel) => h.seen === false
                              )!
                            ) !== -1
                              ? data[indexUser + 1].historysData?.indexOf(
                                  data[indexUser + 1].historysData?.find(
                                    (h: HistoryModel) => h.seen === false
                                  )!
                                )!
                              : 0
                          );
                        }}
                      >
                        <FontAwesomeIcon
                          className="arrow_left_box"
                          icon={faChevronRight}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                onClick={() => {
                  setViewHistoryViewer(false);
                }}
              >
                <FontAwesomeIcon className="closeIcon" icon={faClose} />
              </div>
            </div>
          </div> */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Controles de navegación */}
            {indexHistory !== 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1002,
                }}
              >
                <button
                  onClick={() => {
                    if (indexHistory > 0) {
                      setIndexHistory(indexHistory - 1);
                    }
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                    fontSize: "20px",
                    backdropFilter: "blur(10px)",
                    // opacity: currentIndex === 0 ? 0.3 : 1,
                  }}
                  // disabled={currentIndex === 0}
                >
                  <FontAwesomeIcon icon={faCaretLeft} />
                </button>
              </div>
            ) : indexUser !== 0 ? (
              <div
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1002,
                }}
              >
                <button
                  onClick={() => {
                    setIndexUser(indexUser - 1);
                    setIndexHistory(
                      data[indexUser - 1].historysData?.indexOf(
                        data[indexUser - 1].historysData?.find(
                          (h: HistoryModel) => h.seen === false
                        )!
                      ) !== -1
                        ? data[indexUser - 1].historysData?.indexOf(
                            data[indexUser - 1].historysData?.find(
                              (h: HistoryModel) => h.seen === false
                            )!
                          )!
                        : 0
                    );
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                    fontSize: "20px",
                    backdropFilter: "blur(10px)",
                    // opacity: currentIndex === stories.length - 1 ? 0.3 : 1,
                  }}
                  // disabled={currentIndex === stories.length - 1}
                >
                  <FontAwesomeIcon icon={faCaretRight} />
                </button>
              </div>
            ) : (
              <></>
            )}

            {/* Header */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
                zIndex: 1001,
                opacity: 1,
                transition: "opacity 0.3s",
              }}
            >
              {/* Barras de progreso */}
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  marginBottom: "16px",
                }}
              >
                {data[indexUser].historysData?.map((f: any, key: number) => (
                  <div
                    key={key}
                    style={{
                      flex: 1,
                      height: "3px",
                      borderRadius: "2px",
                      overflow: "hidden",

                      backgroundColor: `${
                        indexHistory > key
                          ? Colors.detailAppColor
                          : "rgba(255, 255, 255, 0.4)"
                      }`,
                    }}
                  >
                    {/* <div
                      style={{
                        width:
                          index === currentIndex
                            ? `${progress}%`
                            : index < currentIndex
                            ? "100%"
                            : "0%",
                        height: "100%",
                        backgroundColor: "white",
                        transition:
                          index === currentIndex ? "width 0.1s linear" : "none",
                      }}
                    /> */}
                    {indexHistory === key && (
                      <>
                        {load && (
                          <HistoryProgressBar
                            indexUser={indexUser}
                            indexMap={key}
                            indexH={indexHistory}
                            NextHistory={NextHistory}
                            running={running}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Información del usuario */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {data[indexUser].profilePhoto ? (
                    data[indexUser].idUser === userData?.user?.id ? (
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          // border: "2px solid #0095f6",
                        }}
                      >
                        <img
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                          }}
                          src={userData?.profilePhoto}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          // border: "2px solid #0095f6",
                        }}
                      >
                        <img
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                          }}
                          src={data[indexUser].profilePhoto}
                        />
                      </div>
                    )
                  ) : (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        // border: "2px solid #0095f6",
                      }}
                    >
                      <img
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                        }}
                        src={UserProfile}
                      />
                    </div>
                  )}
                  {/* <img
                    src={currentStory.avatar}
                    alt={currentStory.username}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "2px solid #0095f6",
                    }}
                  /> */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontWeight: "600",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(`/${data[indexUser].username}`, {
                            replace: true,
                          })
                        }
                      >
                        {data[indexUser].username}
                      </span>
                      {/* {currentUser.isVerified && (
                        <span style={{ color: "#0095f6", fontSize: "12px" }}>
                          ✓
                        </span>
                      )} */}
                    </div>
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "12px",
                      }}
                    >
                      {getElapsedTime(
                        new Date(
                          data[indexUser].historysData![
                            indexHistory
                          ].createDate!
                        )
                      )}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {/* {currentStory.type === "video" && (
                    <button
                      onClick={togglePlayPause}
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                    </button>
                  )}

                  {currentStory.type === "video" && (
                    <button
                      onClick={toggleMute}
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={isMuted ? faVolumeMute : faVolumeUp}
                      />
                    </button>
                  )} */}

                  <button
                    onClick={() => {
                      setViewHistoryViewer(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido de la historia */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "400px",
                height: "80vh",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <HistoryImageViewer
                setRunning={setRunning}
                data={data[indexUser].historysData![indexHistory]}
                setLoad={setLoad}
              />
              {/* {currentStory.type === "image" ? (
                <img
                  src={currentStory.image}
                  alt={`Story by ${currentStory.username}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentStory.video}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  autoPlay
                  muted={isMuted}
                  playsInline
                />
              )} */}

              {/* Timeline para video */}
              {/* {currentStory.type === "video" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "80px",
                    left: "20px",
                    right: "20px",
                    zIndex: 1001,
                  }}
                >
                  <div
                    onClick={handleSeek}
                    style={{
                      width: "100%",
                      height: "3px",
                      backgroundColor: "rgba(255, 255, 255, 0.4)",
                      borderRadius: "2px",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        backgroundColor: "white",
                        borderRadius: "2px",
                        transition: "width 0.1s linear",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "8px",
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "12px",
                    }}
                  >
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentStory.duration)}</span>
                  </div>
                </div>
              )} */}
            </div>

            {/* Controles inferiores */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                zIndex: 1001,
                opacity: 1,
                transition: "opacity 0.3s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Input de respuesta */}
                <div
                  style={{
                    flex: 1,
                    marginRight: "16px",
                  }}
                >
                  <input
                    type="text"
                    // value={replyMessage}
                    // onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Envía un mensaje..."
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "24px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      outline: "none",
                      backdropFilter: "blur(10px)",
                    }}
                    // onKeyPress={(e) => {
                    //   if (e.key === "Enter") {
                    //     handleReply();
                    //   }
                    // }}
                  />
                </div>

                {/* Acciones */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => {
                      if (
                        data[indexUser].historysData![indexHistory].mediaData
                      ) {
                        data[indexUser].historysData![indexHistory].liked
                          ? setFillHistory(
                              data[indexUser].historysData![indexHistory].id!,
                              data[indexUser].historysData![indexHistory]
                                .amountOfLikes! - 1,
                              !data[indexUser].historysData![indexHistory]
                                .liked!,
                              data[indexUser].historysData![indexHistory].seen!
                            )
                          : setFillHistory(
                              data[indexUser].historysData![indexHistory].id!,
                              data[indexUser].historysData![indexHistory]
                                .amountOfLikes! + 1,
                              !data[indexUser].historysData![indexHistory]
                                .liked!,
                              data[indexUser].historysData![indexHistory].seen!
                            );

                        ActionLike(
                          data[indexUser].historysData![indexHistory].id!
                        );
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      // color: isLiked ? "#ff3040" : "white",
                      cursor: "pointer",
                      // fontSize: "20px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        data[indexUser].historysData![indexHistory].liked
                          ? faHeart
                          : faHeartRegular
                      }
                      size="lg"
                      color={
                        data[indexUser].historysData![indexHistory].liked
                          ? "#ed4956"
                          : "white"
                      }
                    />
                    {/* <FontAwesomeIcon icon={faHeart} /> */}
                  </button>

                  <button
                    // onClick={handleReply}
                    // disabled={!replyMessage.trim()}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0095f6",
                      // color: replyMessage.trim()
                      //   ? "#0095f6"
                      // : "rgba(255, 255, 255, 0.5)",
                      // cursor: replyMessage.trim() ? "pointer" : "not-allowed",
                      fontSize: "20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>

                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faReply} />
                  </button>

                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>
                </div>
              </div>
            </div>

            {/* Información de likes */}
            {/* {currentStory.likes > 0 && ( */}
            <div
              style={{
                position: "absolute",
                bottom: "120px",
                left: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                padding: "8px 12px",
                borderRadius: "16px",
                color: "white",
                fontSize: "12px",
                backdropFilter: "blur(10px)",
                opacity: 1,
                transition: "opacity 0.3s",
              }}
            >
              <FontAwesomeIcon style={{ color: "white" }} icon={faEye} />{" "}
              {data[indexUser].historysData![indexHistory].amountOfViews}
            </div>
            {/* )} */}

            {/* Indicador de siguiente/usuario */}
            {indexUser + 1 < data.length && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                  backdropFilter: "blur(10px)",
                  opacity: 1,
                  transition: "opacity 0.3s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={() => {
                  setIndexUser(indexUser + 1);
                  setIndexHistory(
                    data[indexUser + 1].historysData?.indexOf(
                      data[indexUser + 1].historysData?.find(
                        (h: HistoryModel) => h.seen === false
                      )!
                    ) !== -1
                      ? data[indexUser + 1].historysData?.indexOf(
                          data[indexUser + 1].historysData?.find(
                            (h: HistoryModel) => h.seen === false
                          )!
                        )!
                      : 0
                  );
                }}
              >
                <img
                  src={
                    data[indexUser + 1].profilePhoto
                      ? data[indexUser + 1].profilePhoto
                      : UserProfile
                  }
                  // alt="Siguiente"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                  }}
                />
                <span>{getLabel("siguiente")}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* {isModalOptionsVisible && (
        <ModalOptions
          setModalVisible={() => {
            setModalOptionsVisible(false);
            setRunning(true);
          }}
          isModalVisible={isModalOptionsVisible}
          options={options}
        />
      )} */}
    </>
  );
};

export default HistoryViewer;
