import { useEffect, useState } from "react";

import { Colors } from "../../../../constants/Colors";
import { useHubsContext } from "../../../../context/HubsContext";
import { useThemeContext } from "../../../../context/ThemeContext";
import useLanguage from "../../../../hooks/useLanguage";
import { CurrencyConversation } from "../../../../Models/Message/CurrencyConversation";
import "./InboxListUsersBox.css";
import InboxUser from "./InboxUser/InboxUser";

const InboxListUsersBox = () => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const {
    currencyConversations,
    updateCurrencyConversations,
    GetCurrencyConversation,
  } = useHubsContext();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // if (!mobile) {
      //   setShowMobileMenu(false);
      // }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    GetCurrencyConversation(1);
  }, []);

  return (
    <div
      style={{
        width: isMobile ? "100%" : "400px",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${
          theme === "light"
            ? Colors.light.colors.border
            : Colors.dark.colors.border
        }`,
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
      }}
    >
      {/* Header del panel de conversaciones */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${
            theme === "light"
              ? Colors.light.colors.border
              : Colors.dark.colors.border
          }`,
          backgroundColor:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "700",
            color: "gray",
          }}
        >
          {getLabel("mensajes")}
        </h1>
        {/* <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "gray",
              fontSize: "18px",
              padding: "8px",
              borderRadius: "50%",
              transition: "background-color 0.2s",
            }}
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
        </div> */}
      </div>

      {/* Barra de búsqueda */}
      {/* <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${
            theme === "light"
              ? Colors.light.colors.border
              : Colors.dark.colors.border
          }`,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FontAwesomeIcon
            icon={faSearch}
            style={{
              position: "absolute",
              left: "16px",
              color: "#8e8e8e",
              fontSize: "14px",
            }}
          />
          <input
            type="text"
            placeholder={getLabel("buscar_conversaciones")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              border: `1px solid ${
                theme === "light"
                  ? Colors.light.colors.inputBorder
                  : Colors.dark.colors.inputBorder
              }`,
              backgroundColor:
                theme === "light"
                  ? Colors.light.colors.inputBackground
                  : Colors.dark.colors.inputBackground,
              color:
                theme === "light"
                  ? Colors.light.colors.inputColor
                  : Colors.dark.colors.inputColor,
              borderRadius: "24px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = Colors.detailAppColor;
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                theme === "light"
                  ? Colors.light.colors.inputBorder
                  : Colors.dark.colors.inputBorder;
            }}
          />
        </div>
      </div> */}

      {/* Lista de conversaciones */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
        }}
      >
        {currencyConversations.map((e: CurrencyConversation, index: number) => (
          <InboxUser
            key={index}
            conversation={e}
            setRead={updateCurrencyConversations}
          />
        ))}
      </div>
    </div>
  );
};

export default InboxListUsersBox;
