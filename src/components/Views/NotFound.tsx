import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../assets/icon.png";
import Logo from "../assets/logo_cap.png";
import { Colors } from "../constants/Colors";
import { AppContext } from "../context/AppContext";
import { useThemeContext } from "../context/ThemeContext";
import useLanguage from "../hooks/useLanguage";

const NotFound = () => {
  const { isOnline } = useContext(AppContext) || {};
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();

  useEffect(() => {
    document.title = `${process.env.REACT_APP_TITTLE_BASE} • ${getLabel(
      "pagina_no_encontrada",
    )}`;
    return () => {
      document.title = `${process.env.REACT_APP_TITTLE_BASE}`;
    };
  }, [getLabel]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
      }}
    >
      {/* Logo Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "40px",
          animation: "fadeIn 0.6s ease",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
            padding: "20px",
          }}
        >
          <img
            src={Icon}
            alt="Icon"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "contain",
            }}
          />
        </div>

        <img
          src={Logo}
          alt="Logo"
          style={{
            width: "200px",
            maxWidth: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
        />
      </div>

      {/* Message Container */}
      <div
        style={{
          textAlign: "center",
          maxWidth: "500px",
          animation: "slideUp 0.5s ease 0.2s both",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "16px",
            color: "#6c757d",
            lineHeight: 1,
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "16px",
            color: "#343a40",
            lineHeight: 1.2,
          }}
        >
          {getLabel("pagina_no_encontrada")}
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#6c757d",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          {getLabel("pagina_eliminada")}
        </p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: 600,
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(0, 123, 255, 0.2)",
            border: "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0056b3";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(0, 123, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#007bff";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0, 123, 255, 0.2)";
          }}
        >
          {getLabel("volver_aycoro")}
        </Link>
      </div>

      {/* Animation styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 768px) {
            h1 { font-size: 24px !important; }
            p { font-size: 16px !important; }
            .logo-container { margin-bottom: 30px !important; }
          }
        `}
      </style>
    </div>
  );
};

export default NotFound;
