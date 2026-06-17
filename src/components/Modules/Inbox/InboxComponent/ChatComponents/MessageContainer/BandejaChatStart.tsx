import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Colors } from "../../../../../constants/Colors";
import { useThemeContext } from "../../../../../context/ThemeContext";
import useLanguage from "../../../../../hooks/useLanguage";
import "./MessageContainer.css";

const BandejaChatStart = () => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        color: "#8e8e8e",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "96px",
          height: "96px",
          backgroundColor:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <FontAwesomeIcon
          icon={faPaperPlane}
          style={{ fontSize: "36px", color: "#bdbdbd" }}
        />
      </div>
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "300",
          margin: "0 0 12px 0",
          color: "#666",
        }}
      >
        {getLabel("tus_mensajes")}
      </h2>
      <p
        style={{
          fontSize: "16px",
          margin: "0 0 24px 0",
          maxWidth: "400px",
          lineHeight: "1.5",
        }}
      >
        {getLabel("envia_fotos_mesages")}
      </p>
      {/* <button
        style={{
          background: "#0095f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#007acc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#0095f6";
        }}
      >
        Enviar mensaje
      </button> */}
    </div>
  );
};

export default BandejaChatStart;
