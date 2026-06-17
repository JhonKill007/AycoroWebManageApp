import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import UserProfile from "../../assets/UserProfile.jpeg";
import { Colors } from "../../constants/Colors";
import { aspectRatioType } from "../../constants/Types";
import { useHistoryContext } from "../../context/HistoryContext";
import { useThemeContext } from "../../context/ThemeContext";
import { useUserContext } from "../../context/UserContext";
import useLanguage from "../../hooks/useLanguage";
import { HistoryListItemModel } from "../../Models/History/HistoryListItemModel";
import { HistoryModel } from "../../Models/History/HistoryModel";
import { HistoryCharger } from "../Charger/HistoryCharger/HistoryCharger";

import HistoryViewer from "./HistoryViewer/HistoryViewer";

const HistoryComponet = () => {
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const {
    myHistorys,
    historys,
    updateHistorys,
    deleteHistory,
    chargingMyHistorys,
    chargingHistorys,
  } = useHistoryContext();
  const [inputValue, setInputValue] = useState<string>("");
  const ImageRef = React.createRef<HTMLInputElement>();
  const [image, setImage] = useState<any>(null);
  const [viewHistoryBox, setViewHistoryBox] = useState<boolean>(false);
  const [viewMyHistoryBox, setViewMyHistoryBox] = useState<boolean>(false);
  const [indexUser, setIndexUser] = useState<number>();
  const [indexHistory, setIndexHistory] = useState<number>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (myHistorys.length != 0) {
      if (myHistorys![0].historysData![0] === undefined) {
        setViewMyHistoryBox(false);
      }
    }
  }, [myHistorys]);

  useEffect(() => {
    var back = document.getElementById("caja_de_historias");
    document
      .querySelector(".back_buton_history")
      ?.addEventListener("click", () => {
        back!.scrollLeft -= 100;
      });
    document
      .querySelector(".come_buton_history")
      ?.addEventListener("click", () => {
        back!.scrollLeft += 100;
      });
  });

  const OnImageChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setInputValue(e.target.value);
      var img = e.target.files[0];
      setImage(img);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setSelectedFile(null);
    setIsEditorOpen(false);
  };

  return (
    <>
      {/* <div className="container col-md-12">
        <div className="containHistory">
          <div>
            <div className="iconarrowsbox">
              <FontAwesomeIcon
                className="icon back_buton_history"
                icon={faChevronLeft}
              />
            </div>
          </div>
          {chargingMyHistorys || chargingHistorys ? (
            <HistoryCharger />
          ) : (
            <div className="bodyHistory" id="caja_de_historias">
              {myHistorys.length != 0 &&
              myHistorys[0].historysData?.length! < 1 ? (
                <div
                  className="boxHistoryUser"
                  onClick={() => {
                    ImageRef.current?.click();
                  }}
                >
                  <div className="imgHistoryBox">
                    {userData?.profilePhoto ? (
                      <img src={userData?.profilePhoto} alt="" />
                    ) : (
                      <img src={UserProfile} alt="" />
                    )}
                    <strong className="YourHistoryText">
                      {getLabel("tu_historia")}
                    </strong>
                  </div>
                  <div className="iconPlusHystoryBox">
                    <FontAwesomeIcon
                      className="iconHistoryPlus"
                      icon={faPlus}
                    />
                    <input
                      type="file"
                      name="Post"
                      id="PostId"
                      accept="image/*"
                      style={{ display: "none" }}
                      ref={ImageRef}
                      value={inputValue}
                      onChange={(e) => {
                        OnImageChange(e);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="boxHistoryUser"
                  onClick={() => setViewMyHistoryBox(true)}
                >
                  <div
                    className="imgHistoryBoxFull"
                    style={{
                      background:
                        "linear-gradient(to bottom left,rgb(202, 5, 13),rgb(66, 73, 174))",
                    }}
                  >
                    {userData?.profilePhoto ? (
                      <img src={userData?.profilePhoto} alt="" />
                    ) : (
                      <img src={UserProfile} alt="" />
                    )}
                    <strong className="YourHistoryText">
                      {getLabel("tu_historia")}
                    </strong>
                  </div>
                </div>
              )}

              {historys &&
                historys.length > 0 &&
                historys.map((h: HistoryListItemModel, key: number) => (
                  <div
                    key={key}
                    className="boxHistoryUser"
                    onClick={() => {
                      setIndexUser(key);
                      setIndexHistory(
                        h.historysData?.indexOf(
                          h.historysData?.find(
                            (his: HistoryModel) => his.seen === false
                          )!
                        ) !== -1
                          ? h.historysData?.indexOf(
                              h.historysData?.find(
                                (his: HistoryModel) => his.seen === false
                              )!
                            )!
                          : 0
                      );
                      setViewHistoryBox(true);
                    }}
                  >
                    <div
                      className="imgHistoryBoxFull"
                      style={
                        h.historysData![h.historysData!.length - 1].seen
                          ? { background: "grey" }
                          : {
                              background:
                                "linear-gradient(to bottom left,rgb(202, 5, 13),rgb(66, 73, 174))",
                            }
                      }
                    >
                      {h.profilePhoto ? (
                        <img src={h.profilePhoto} alt="" />
                      ) : (
                        <img src={UserProfile} alt="" />
                      )}
                      <strong className="YourHistoryText">
                        {h.username!.length > 11
                          ? h.username?.substr(0, 8) + "..."
                          : h.username}
                      </strong>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {viewHistoryBox && historys.length > 0 && (
            <HistoryViewer
              data={historys}
              userIndex={indexUser!}
              historyIndex={indexHistory!}
              setViewHistoryViewer={setViewHistoryBox}
              updateHistorys={historys ? updateHistorys : () => {}}
              deleteHistory={() => {}}
            />
          )}

          {viewMyHistoryBox &&
            myHistorys &&
            myHistorys.length > 0 &&
            myHistorys[0]!.historysData!.length > 0 && (
              <HistoryViewer
                data={myHistorys}
                userIndex={0}
                historyIndex={0}
                setViewHistoryViewer={setViewMyHistoryBox}
                updateHistorys={() => {}}
                deleteHistory={deleteHistory}
              />
            )}

          <div>
            <div className="iconarrowsbox">
              <FontAwesomeIcon
                className="icon come_buton_history"
                icon={faChevronRight}
              />
            </div>
          </div>
        </div>
      </div> */}

      {/* Sección de Historias */}
      <style>
        {`.story-list::-webkit-scrollbar-track {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 3px;
          }

          .story-list::-webkit-scrollbar-thumb {
            background: ${Colors.detailAppColor};
            border-radius: 3px;
          }

          .story-list::-webkit-scrollbar-thumb:hover {
            background: ${Colors.detailAppColor};
          }`}
      </style>
      <section
        className="story-list"
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
          padding: "16px 0",
          marginBottom: "24px",
          overflowX: "auto",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {chargingMyHistorys || chargingHistorys ? (
          <HistoryCharger />
        ) : (
          <div
            style={{
              display: "flex",
              gap: "20px",
              padding: "0 20px",
              minWidth: "min-content",
            }}
          >
            {myHistorys.length != 0 &&
            myHistorys[0].historysData?.length! < 1 ? (
              <div
                //   key={story.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={() => {
                  // ImageRef.current?.click();
                  fileInputRef.current?.click();
                  setAspectRatio(aspectRatioType.HISTORY);
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  // accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                />
                <div
                  style={{
                    position: "relative",
                    width: "65px",
                    height: "65px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {userData?.profilePhoto ? (
                    <img
                      src={userData?.profilePhoto}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <img
                      src={UserProfile}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  {/* activar cuando no tenga storys */}
                  {/* {story.isOwnStory && ( */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      backgroundColor: "#0095f6",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid white",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ color: "white", fontSize: "10px" }}
                    />
                  </div>
                  {/* )} */}
                </div>
                {/* </div> */}
                <span
                  style={{
                    fontSize: "12px",
                    marginTop: "8px",
                    color: "gray",
                    //   color: theme === "light" ? "#262626" : "gray",
                    maxWidth: "74px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getLabel("tu_historia")}
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={() => setViewMyHistoryBox(true)}
              >
                {/* <div
                  style={{
                    position: "relative",
                    width: "66px",
                    height: "66px",
                    borderRadius: "50%",
                    // padding: "2px",
                    background:
                      //   story.isOwnStory
                      Colors.detailAppColor,
                    // "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                    // : story.isSeen
                    // ? "linear-gradient(45deg, #c7c7c7, #8a8a8a)"
                    // : "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                    // display: "flex",
                    // alignItems: "center",
                    // justifyContent: "center",
                  }}
                > */}
                <div
                  style={{
                    width: "67px",
                    height: "67px",
                    borderRadius: "50%",
                    // border: `3px solid ${
                    //   theme === "light"
                    //     ? Colors.light.colors.background
                    //     : Colors.dark.colors.background
                    // }`,
                    // overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: Colors.detailAppColor,
                  }}
                >
                  {userData?.profilePhoto ? (
                    <img
                      src={userData?.profilePhoto}
                      style={{
                        width: "62px",
                        height: "62px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: `3px solid ${
                          theme === "light"
                            ? Colors.light.colors.background
                            : Colors.dark.colors.background
                        }`,
                      }}
                    />
                  ) : (
                    <img
                      src={UserProfile}
                      style={{
                        width: "62px",
                        height: "62px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: `3px solid ${
                          theme === "light"
                            ? Colors.light.colors.background
                            : Colors.dark.colors.background
                        }`,
                      }}
                    />
                  )}
                </div>
                {/* </div> */}
                <span
                  style={{
                    fontSize: "12px",
                    color: "gray",
                    maxWidth: "74px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getLabel("tu_historia")}
                </span>
              </div>
            )}
            {historys &&
              historys.length > 0 &&
              historys.map((h: HistoryListItemModel, key: number) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    setIndexUser(key);
                    setIndexHistory(
                      h.historysData?.indexOf(
                        h.historysData?.find(
                          (his: HistoryModel) => his.seen === false
                        )!
                      ) !== -1
                        ? h.historysData?.indexOf(
                            h.historysData?.find(
                              (his: HistoryModel) => his.seen === false
                            )!
                          )!
                        : 0
                    );
                    setViewHistoryBox(true);
                  }}
                  // onClick={() => {
                  //   setCurrentStoryIndex(index);
                  //   setStoriesOpen(true);
                  // }}
                >
                  {/* <div
                    style={{
                      position: "relative",
                      width: "66px",
                      height: "66px",
                      borderRadius: "50%",
                      // padding: "2px",
                      // background: h.historysData![h.historysData!.length - 1]
                      //   .seen
                      //   ? "linear-gradient(45deg, #c7c7c7, #8a8a8a)"
                      //   : "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                      // display: "flex",
                      // alignItems: "center",
                      // justifyContent: "center",
                    }}
                  > */}
                  <div
                    style={{
                      width: "67px",
                      height: "67px",
                      borderRadius: "50%",
                      // padding: "2px",
                      // overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: h.historysData![h.historysData!.length - 1]
                        .seen
                        ? "linear-gradient(45deg, #c7c7c7, #8a8a8a)"
                        : "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                    }}
                  >
                    <img
                      src={h.profilePhoto ? h.profilePhoto : UserProfile}
                      style={{
                        width: "62px",
                        height: "62px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: `3px solid ${
                          theme === "light"
                            ? Colors.light.colors.background
                            : Colors.dark.colors.background
                        }`,
                      }}
                    />
                  </div>
                  {/* </div> */}
                  <span
                    style={{
                      fontSize: "12px",
                      marginTop: "8px",
                      color: "gray",
                      maxWidth: "74px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.username!.length > 11
                      ? h.username?.substr(0, 8) + "..."
                      : h.username}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>

      {viewHistoryBox && historys.length > 0 && (
        <HistoryViewer
          data={historys}
          userIndex={indexUser!}
          historyIndex={indexHistory!}
          setViewHistoryViewer={setViewHistoryBox}
          updateHistorys={historys ? updateHistorys : () => {}}
          deleteHistory={() => {}}
        />
      )}

      {viewMyHistoryBox &&
        myHistorys &&
        myHistorys.length > 0 &&
        myHistorys[0]!.historysData!.length > 0 && (
          <HistoryViewer
            data={myHistorys}
            userIndex={0}
            historyIndex={0}
            setViewHistoryViewer={setViewMyHistoryBox}
            updateHistorys={() => {}}
            deleteHistory={deleteHistory}
          />
        )}

  

  
    </>
  );
};

export default HistoryComponet;
