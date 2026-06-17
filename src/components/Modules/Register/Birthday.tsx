import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import useLanguage from "../../hooks/useLanguage";

export const Birthday = ({
  birthday,
  setBirthday,
  steps,
  setSteps,
  setValidateAge,
}: {
  birthday: Date;
  setBirthday: (birthday: Date) => void;
  steps: number;
  setSteps: (step: number) => void;
  setValidateAge: (value: boolean) => void;
}) => {
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!birthday) return;

    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    if (age < 13) {
      setValidateAge(false);
    } else {
      setValidateAge(true);
    }
  }, [birthday]);

  const getFieldColor = () =>
    theme === "light"
      ? Colors.light.colors.inputBorder
      : Colors.dark.colors.inputBorder;

  return (
    <div>
      <style>
        {`
            .date-input::-webkit-calendar-picker-indicator {
             filter: invert(58%) sepia(0%) saturate(0%) hue-rotate(178deg) brightness(92%) contrast(86%);
             cursor: pointer;
             opacity: 1;
            }
        `}
      </style>
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
            icon={faCalendarAlt}
            style={{ marginRight: "8px", color: "#8e8e8e" }}
          />
          {getLabel("fecha_nacimiento")}
        </label>

        <input
          type="date"
          value={birthday ? birthday.toISOString().substring(0, 10) : ""}
          max={new Date().toISOString().substring(0, 10)}
          onChange={(e) => {
            setTouched(true);
            setBirthday(new Date(e.target.value));
          }}
          onClick={(e: any) => {
            if (e.target.showPicker) e.target.showPicker();
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
            cursor: "pointer",
          }}
          className="date-input"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => setSteps(steps - 1)}
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
          }}
        >
          {getLabel("anterior")}
        </button>

        <button
          onClick={() => setSteps(steps + 1)}
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
          }}
        >
          {getLabel("siguiente")}
        </button>
      </div>
    </div>
  );
};
