import {
    faEye,
    faEyeSlash,
    faLock,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";

export const Password = ({
  password,
  setPassword,
  replayPassword,
  setReplayPassword,
  steps,
  setSteps,
}: {
  password: string;
  setPassword: (password: string) => void;
  replayPassword: string;
  setReplayPassword: (password: string) => void;
  steps: number;
  setSteps: (step: number) => void;
}) => {
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();
  const [error, setError] = useState<string | undefined>(undefined);
  const [errorReplay, setErrorReplay] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<boolean>(false);
  const [touchedReplay, setTouchedReplay] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordReplay, setShowPasswordReplay] = useState<boolean>(false);

  useEffect(() => {
    validatePassword();
  }, [password, touched]);

  const validatePassword = () => {
    const value = password?.trim?.() ?? "";
    const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!$@%])[0-9a-zA-Z!$@%]+$/;

    if (!touched) return false;

    if (!value) {
      setError(getLabel("debes_completar_contrasena"));
      return false;
    }

    if (value.length < 6) {
      setError(getLabel("contrasena_minimo_6"));
      return false;
    }

    if (!regex.test(value)) {
      setError(getLabel("contrasena_compleja"));
      return false;
    }

    setError(undefined);
    return true;
  };

  const validatePasswordReplay = () => {
    const value = replayPassword?.trim?.() ?? "";
    const original = password?.trim?.() ?? "";

    if (!touchedReplay) return false;

    if (!value) {
      setErrorReplay(getLabel("debes_completar_contrasena"));
      return false;
    }

    if (value !== original) {
      setErrorReplay(getLabel("contrasena_no_coincide"));
      return false;
    }

    setErrorReplay(undefined);
    return true;
  };

  const getFieldColor = () => {
    if (!touched)
      return theme === "light"
        ? Colors.light.colors.inputBorder
        : Colors.dark.colors.inputBorder;
    return error ? "#dc2626" : "#16a34a";
  };

  const getFieldColorReplay = () => {
    if (!touchedReplay)
      return theme === "light"
        ? Colors.light.colors.inputBorder
        : Colors.dark.colors.inputBorder;
    return errorReplay ? "#dc2626" : "#16a34a";
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
            icon={faLock}
            style={{ marginRight: "8px", color: "#8e8e8e" }}
          />
          {getLabel("contrasena")}
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => {
              e.target.style.backgroundColor =
                theme === "light"
                  ? Colors.light.colors.inputActiveBackground
                  : Colors.dark.colors.inputActiveBackground;

              e.target.style.borderColor = "#667eea";
            }}
            onBlur={(e) => {
              setTouched(true);
              validatePassword();
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

              paddingRight: "50px",
              backgroundColor:
                theme === "light"
                  ? Colors.light.colors.inputBackground
                  : Colors.dark.colors.inputBackground,
              color:
                theme === "light"
                  ? Colors.light.colors.inputColor
                  : Colors.dark.colors.inputColor,
            }}
            placeholder="Crea una contraseña segura"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8e8e8e",
              fontSize: "16px",
            }}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
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
      <div style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative" }}>
          <input
            type={showPasswordReplay ? "text" : "password"}
            value={replayPassword}
            onChange={(e) => setReplayPassword(e.target.value)}
            onFocus={(e) => {
              e.target.style.backgroundColor =
                theme === "light"
                  ? Colors.light.colors.inputActiveBackground
                  : Colors.dark.colors.inputActiveBackground;

              e.target.style.borderColor = "#667eea";
            }}
            onBlur={(e) => {
              validatePasswordReplay();
              setTouchedReplay(true);
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
              border: `2px solid ${getFieldColorReplay()}`,
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
              paddingRight: "50px",
              backgroundColor:
                theme === "light"
                  ? Colors.light.colors.inputBackground
                  : Colors.dark.colors.inputBackground,
              color:
                theme === "light"
                  ? Colors.light.colors.inputColor
                  : Colors.dark.colors.inputColor,
            }}
            placeholder={getLabel("repite_contrasena")}
          />
          <button
            type="button"
            onClick={() => setShowPasswordReplay(!showPasswordReplay)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8e8e8e",
              fontSize: "16px",
            }}
          >
            <FontAwesomeIcon icon={showPasswordReplay ? faEyeSlash : faEye} />
          </button>
        </div>
        {errorReplay && (
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
            {errorReplay}
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
        {getLabel("contrasena_minumo_6")}
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
            const isValid = await validatePassword();
            const isValidReplay = await validatePasswordReplay();
            if (isValid) {
              setTouchedReplay(true);
            }
            if (isValid && isValidReplay) {
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
