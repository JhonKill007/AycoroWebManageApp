import { faEnvelope, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";

export const Email = ({
  email,
  setEmail,
  steps,
  setSteps,
}: {
  email: string;
  setEmail: (email: string) => void;
  steps: number;
  setSteps: (step: number) => void;
}) => {
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<boolean>(false);

  useEffect(() => {
    validateEmail();
  }, [email, touched]);

  const validateEmail = () => {
    const value = email?.trim?.() ?? "";
    if (!touched) return false;
    if (!value) {
      setError("El correo electrónico es requerido");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un correo electrónico válido");
      return false;
    }

    setError(undefined);
    return true;
  };

  const getFieldColor = () => {
    if (!touched)
      return theme === "light"
        ? Colors.light.colors.inputBorder
        : Colors.dark.colors.inputBorder;
    return error ? "#dc2626" : "#16a34a";
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#8e8e8e",
          }}
        >
          <FontAwesomeIcon
            icon={faEnvelope}
            style={{ marginRight: "8px", color: "#8e8e8e" }}
          />
          {getLabel("correo_electronico")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => {
            e.target.style.backgroundColor =
              theme === "light"
                ? Colors.light.colors.inputActiveBackground
                : Colors.dark.colors.inputActiveBackground;

            e.target.style.borderColor = "#667eea";
          }}
          onBlur={(e) => {
            setTouched(true);
            e.target.style.backgroundColor =
              theme === "light"
                ? Colors.light.colors.inputBackground
                : Colors.dark.colors.inputBackground;
            e.target.style.borderColor =
              theme === "light"
                ? Colors.light.colors.inputBorder
                : Colors.dark.colors.inputBorder;
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: `2px solid ${getFieldColor()}`,
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s",
            backgroundColor:
              theme === "light"
                ? Colors.light.colors.inputBackground
                : Colors.dark.colors.inputBackground,
            color:
              theme === "light"
                ? Colors.light.colors.inputColor
                : Colors.dark.colors.inputColor,
          }}
          placeholder={getLabel("correo_ejemplo")}
        />
        {error && (
          <div
            style={{
              color: "#dc2626",
              fontSize: "12px",
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
            {error}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => {
            setSteps(steps - 1);
          }}
          style={{
            width: "45%",
            padding: "14px 20px",
            backgroundColor: "#8e8e8e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s",
            marginBottom: "20px",
          }}
        >
          {getLabel("anterior")}
        </button>
        <button
          onClick={async () => {
            setTouched(true);
            const isValid = await validateEmail();
            if (isValid) {
              setSteps(steps + 1);
            }
          }}
          style={{
            width: "45%",
            padding: "14px 20px",
            backgroundColor: "#0095f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s",
            marginBottom: "20px",
          }}
        >
          {getLabel("siguiente")}
        </button>
      </div>
    </div>
  );
};
