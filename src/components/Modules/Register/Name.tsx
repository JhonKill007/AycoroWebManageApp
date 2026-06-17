import { faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";

export const Name = ({
  name,
  setName,
  steps,
  setSteps,
}: {
  name: string;
  setName: (name: string) => void;
  steps: number;
  setSteps: (step: number) => void;
}) => {
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();

  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<boolean>(false);

  useEffect(() => {
    validateName();
  }, [name, touched]);

  const validateName = () => {
    if (!touched) return false;
    const value = name?.trim?.() ?? "";
    if (!value) {
      setError(getLabel("completar_nombre"));
      return false;
    }

    if (value.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
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
      <>
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
            {getLabel("nombre")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.length > 3) {
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
            placeholder={getLabel("ingresa_nombre")}
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
          {getLabel("usa_el_nombre")}
        </label>
        <button
          onClick={() => {
            setTouched(true);
            if (validateName()) {
              setSteps(steps + 1);
            }
          }}
          style={{
            width: "100%",
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
      </>
    </div>
  );
};
