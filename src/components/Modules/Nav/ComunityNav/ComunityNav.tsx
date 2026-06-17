import { Link } from "react-router-dom";
import IconLogo from "../../../assets/icon.png";
import { Colors } from "../../../constants/Colors";
import { useAuthenticateContext } from "../../../context/AuthenticateContext";
import useLanguage from "../../../hooks/useLanguage";

const ComunityNav = () => {
  const { getLabel } = useLanguage();
  const token = localStorage.getItem("Us-Ac");
  const { Authenticate } = useAuthenticateContext();

  return (
    <header
      style={{
        top: 0,
        width: "100%",
        zIndex: 1000,
        background: "linear-gradient(45deg, #677ee9, #6f64c5)",
        backdropFilter: "blur(10px)",
        padding: "15px 0",
        borderBottom: `1px solid ${Colors.detailAppColor}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <Link
          style={{
            textDecoration: "none",
            transition: "color 0.3s ease",
          }}
          to="/"
        >
          <div
            style={{ display: "flex", alignItems: "center" }}
            className="magnetic"
          >
            <img
              src={IconLogo}
              alt="Aycoro Logo"
              style={{ width: "40px", marginRight: "10px" }}
            />
            <span
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              Aycoro
            </span>
          </div>
        </Link>
        {token || Authenticate ? null : (
          <nav style={{ display: "flex", gap: "30px" }}>
            <Link
              style={{
                color: "white",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              to="/register"
              className="magnetic"
            >
              {getLabel("crear_cuenta")}
            </Link>
            <Link
              style={{
                color: "white",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
              to="/login"
              className="magnetic"
            >
              {getLabel("iniciar_sesion")}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default ComunityNav;
