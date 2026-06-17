import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";
import validateService from "../../Services/Validate/ValidateService";

export const Username = ({
  username,
  setUsername,
  steps,
  setSteps,
}: {
  username: string;
  setUsername: (name: string) => void;
  steps: number;
  setSteps: (step: number) => void;
}) => {
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<boolean>(false);

  useEffect(() => {
    validateUsername();
  }, [username, touched]);

  const validateUsername = async () => {
    if (!touched) return false;

    const value = username?.trim?.() ?? "";
    if (value.length < 7 || value.length > 30) {
      setError(getLabel("usuario_maximo_30"));
      return false;
    }

    if (/^\d+$/.test(value)) {
      setError(getLabel("usuario_solo_numeros"));
      return false;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
      setError(getLabel("usuario_no_caracteres_especiales"));
      return false;
    }

    const isValidUsername = await VerifyUsername();
    if (!isValidUsername) {
      setError(getLabel("usuario_no_disponible"));
      return false;
    }

    setError(undefined);
    return true;
  };

  const VerifyUsername = async (): Promise<boolean> => {
    const u = username?.trim().toLowerCase();
    if (!u) return false;

    try {
      const res = await validateService.validateUsername(u);
      return !!res.data;
    } catch (error) {
      console.error("Error verificando el nombre de usuario:", error);
      return false;
    }
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
            icon={faUser}
            style={{ marginRight: "8px", color: "#8e8e8e" }}
          />
          {getLabel("usuario")}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (e.target.value.length > 5) {
              setTouched(true);
            }
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor =
              theme === "light"
                ? Colors.light.colors.inputActiveBackground
                : Colors.dark.colors.inputActiveBackground;

            e.target.style.borderColor = "#667eea";
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
          placeholder={getLabel("elige_usuario")}
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
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "12px",
          fontWeight: "600",
          color: "#8e8e8e",
        }}
      >
        {getLabel("usuario_maximo_30")}
      </label>
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
            const isValid = await validateUsername();
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
