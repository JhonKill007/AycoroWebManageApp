import { useNavigate } from "react-router-dom";
import useLanguage from "../../hooks/useLanguage";

const FooterBlog = () => {
  const navigate = useNavigate();
  const { getLabel } = useLanguage();
  return (
    <>
      <div
        style={{
          width: "430px",
          margin: "auto",
          textAlign: "center",
          marginTop: "60px",
        }}
      >
        <div
          style={{
            width: "430px",
            display: "flex",
            margin: "auto",
            justifyContent: "space-evenly",
          }}
        >
          {[
            { label: "Aycoro", link: "/" },
            { label: getLabel("ayuda"), link: "/comunity/help" },
            {
              label: getLabel("idioma_traduccion"),
              link: "/comunity/languages",
            },
            { label: getLabel("descargar"), link: "/comunity/download" },
            {
              label: getLabel("terminos_condiciones"),
              link: "/comunity/policy/terms",
            },
          ].map((item) => (
            <span
              style={{ fontSize: "12px", color: "#0d6efd", cursor: "pointer" }}
              onClick={() => navigate(item.link)}
            >
              {item.label}
            </span>
          ))}
        </div>
        <span style={{ color: "gray", fontSize: "12px" }}>
          ©Aycoro {new Date().getFullYear()}
        </span>
        <br />
        <br />
        <br />
      </div>
    </>
  );
};

export default FooterBlog;
