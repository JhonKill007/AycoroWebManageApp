import {
  faClose,
  faMicrophone,
  faPaperclip,
  faPaperPlane,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import imageCompression from "browser-image-compression";
import React, { useRef, useState } from "react";
import { MediaDataParams } from "../../../../../Models/MediaData/MediaDataParams";
import { MessageParams } from "../../../../../Models/Message/MessageParams";
import { UserPerfilModel } from "../../../../../Models/User/UserPerfilModel";
import Chat_S from "../../../../../Services/Chat/ChatService";
import mediaDataService from "../../../../../Services/MediaData/MediaDataService";
import { Colors } from "../../../../../constants/Colors";
import {
  ChatType,
  MediaType,
  MessageType,
} from "../../../../../constants/Types";
import { useThemeContext } from "../../../../../context/ThemeContext";
import { useUserContext } from "../../../../../context/UserContext";
import useEncryptHook from "../../../../../hooks/useEncryptHook";
import useLanguage from "../../../../../hooks/useLanguage";
import "./SendMessageForm.css";

interface ISendMessageForm {
  user: UserPerfilModel | undefined;
  idChat: string | undefined;
  encryptKey: string;
}

const SendMessageForm = ({ user, idChat, encryptKey }: ISendMessageForm) => {
  const { userData } = useUserContext();
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const [message, setMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMediaData, setAudioMediaData] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [seconds, setSeconds] = useState<number>(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { Encrypt } = useEncryptHook();

  const startRecording = async (): Promise<void> => {
    try {
      setSeconds(0); // Reinicia el contador a 0
      recordingIntervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000); // Incrementa cada segundo

      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent): void => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async (): Promise<void> => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(audioBlob));
        audioChunks.current = [];
        const audioBase64 = await convertAudioToBase64(audioBlob);
        setAudioMediaData(audioBase64);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleSendAudio = async () => {
    if (audioUrl) {
      if (audioMediaData) {
        const mediaData: MediaDataParams = {
          Id: "",
          Value: audioMediaData,
          Type: MediaType.AUDIO,
        };

        await saveMediaData(mediaData, (seconds * 1000).toString());
      }
    }
  };

  const convertAudioToBase64 = (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(audioBlob);
    });
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current); // Detiene el temporizador
        recordingIntervalRef.current = null;
      }
    }
  };

  const deleteRecored = (): void => {
    setAudioUrl(null);
    setAudioMediaData(null);
  };

  const saveMessage = (m: MessageParams) => {
    Chat_S.Save(m).catch((e: any) => console.error(e));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (image) {
      const compressedImage = await compressImage(image);
      if (compressedImage) {
        const mediaData: MediaDataParams = {
          Id: undefined,
          Value: compressedImage,
          Type: MediaType.IMAGE,
        };
        await saveMediaData(mediaData, message);
      }
    } else {
      handleSend(MessageType.TEXT, message, undefined);
    }
  };

  const saveMediaData = async (media: MediaDataParams, message: string) => {
    const mediaResult = await mediaDataService.Create(media);
    handleSend(media.Type!, message, mediaResult.data.id);
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return await imageCompression.getDataUrlFromFile(compressedFile);
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      return undefined;
    }
  };

  const resetForm = () => {
    setMessage("");
    setImage(null);
    setPreview(null);
    deleteRecored();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const img = e.target.files[0];
      setImage(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  const handleSend = (
    type: string,
    message: string | undefined,
    idMedia: string | undefined,
  ) => {
    if (!idChat) return;
    let encryptMessage = Encrypt(message!, encryptKey, type);
    const messageObj: MessageParams = {
      idChat: idChat,
      idUserSender: userData?.user?.id!,
      idMediaDataProfileSender: userData?.user?.perfilData?.idMediaDataProfile,
      idUserReceiver: user?.User?._id,
      idMediaDataProfileReceiver: user?.User?.PerfilData?.IdMediaDataProfile,
      messageValue: encryptMessage,
      usernameReceiver: user?.User?.Username,
      verifyUserReceiver: user?.User?.Verify,
      usernameSender: userData?.user?.username!,
      verifyUserSender: userData?.user?.verify,
      nameReceiver: user?.User?.Name,
      nameSender: userData?.user?.name,
      nameGroup: "",
      type: type,
      idMedia: idMedia,
      conversationType: ChatType.DIRECT,
      createDate: `${new Date(Date.now())}`,
    };

    saveMessage(messageObj);
    resetForm();
  };

  return (
    <div>
      {preview && (
        <div style={{ display: "flex" }}>
          <div
            style={{
              marginTop: "-310px",
              marginLeft: "15px",
              cursor: "pointer",
            }}
            onClick={resetForm}
          >
            <FontAwesomeIcon icon={faClose} />
          </div>
          <div
            style={{
              width: "300px",
              height: "300px",
              marginTop: "-300px",
              position: "absolute",
              marginLeft: "30px",
            }}
          >
            <img
              style={{
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
              }}
              src={preview}
              alt="Selected"
            />
          </div>
        </div>
      )}
      <div>
        {isRecording || audioUrl ? (
          isRecording ? (
            <div
              style={{
                padding: "20px 24px",
                borderTop: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background,
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8e8e8e",
                  fontSize: "20px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
              >
                <span>00:{String(seconds).padStart(2, "0")}</span>
              </div>

              <div style={{ flex: 1, position: "relative" }}>
                <div
                  style={{
                    // width: "83%",
                    height: "7px",
                    borderRadius: "20px",
                    backgroundColor: Colors.detailAppColor,
                    marginBottom: "-5px",
                  }}
                />
              </div>

              <button
                onClick={stopRecording}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                  marginTop: "5px",
                }}
              >
                <FontAwesomeIcon
                  icon={faStopCircle}
                  style={{ fontSize: "35px", color: "red" }}
                />
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: "20px 24px",
                borderTop: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background,
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                onClick={deleteRecored}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8e8e8e",
                  fontSize: "20px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
              >
                <FontAwesomeIcon
                  style={{ marginTop: "6px", fontSize: "25px", color: "red" }}
                  icon={faClose}
                />
              </div>

              <div style={{ flex: 1, position: "relative" }}>
                <div
                  style={{
                    width: "97%",
                    marginBottom: "-20px",
                    marginLeft: "-5px",
                  }}
                >
                  {audioUrl && (
                    <audio
                      style={{
                        width: "100%",
                        marginLeft: "20px",
                        marginTop: "-10px",
                        color: Colors.detailAppColor,
                      }}
                      controls
                      src={audioUrl}
                    />
                  )}
                </div>
              </div>

              <button
                onClick={handleSendAudio}
                style={{
                  background: Colors.detailAppColor,
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "18px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffffff";
                  e.currentTarget.style.color = Colors.detailAppColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = Colors.detailAppColor;
                  e.currentTarget.style.color = "white";
                }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          )
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            <div
              style={{
                padding: "20px 24px",
                borderTop: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background,
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <button
                onClick={() => imageInputRef.current?.click()}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8e8e8e",
                  fontSize: "20px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </button>

              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  placeholder={getLabel("escribe_un_mensaje")}
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  disabled={!idChat}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: "24px",
                    fontSize: "15px",
                    outline: "none",
                    border: `1px solid ${
                      theme === "light"
                        ? Colors.light.colors.border
                        : Colors.dark.colors.border
                    }`,
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.inputBackground
                        : Colors.dark.colors.inputBackground,
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor =
                      theme === "light"
                        ? Colors.light.colors.inputActiveBackground
                        : Colors.dark.colors.inputActiveBackground;
                    e.target.style.borderColor = Colors.detailAppColor;
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor =
                      theme === "light"
                        ? Colors.light.colors.inputBackground
                        : Colors.dark.colors.inputBackground;
                    e.target.style.borderColor =
                      theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder;
                  }}
                />
              </div>

              {message.trim() ? (
                <button
                  onClick={handleSave}
                  style={{
                    background: Colors.detailAppColor,
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "18px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffffff";
                    e.currentTarget.style.color = Colors.detailAppColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      Colors.detailAppColor;
                    e.currentTarget.style.color = "white";
                  }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8e8e8e",
                    fontSize: "20px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "background-color 0.2s",
                  }}
                >
                  <FontAwesomeIcon icon={faMicrophone} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SendMessageForm;
