import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import "./InboxBox.css";
import Chat from "./InboxComponent/ChatComponents/Chat";
import InboxListUsersBox from "./InboxComponent/InboxListUsersComponents/InboxListUsersBox";

const InboxBox = () => {
  let { username } = useParams();
  const { theme } = useThemeContext();
  const [chatPlease, setchatPlease] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (username) {
      setchatPlease(true);
    } else {
      setchatPlease(false);
    }
  }, [username]);

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        height: "90vh",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        display: "flex",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {!isMobile && (
        <>
          <InboxListUsersBox />
          <Chat setchatPlease={setchatPlease} />
        </>
      )}

      {isMobile && (
        <>
          {chatPlease ? (
            <Chat setchatPlease={setchatPlease} />
          ) : (
            <InboxListUsersBox />
          )}
        </>
      )}
    </div>
  );
};

export default InboxBox;
