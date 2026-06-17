import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";

const ChargerSlice = () => {
  const { theme } = useThemeContext();
  return (
    <>
      <style>
        {`
          @keyframes girar {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div
        style={{
          backgroundColor:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          transition: "all 1s ease",
          WebkitTransition: "all 1s ease",
          MozTransition: "all 1s ease",
          OTransition: "all 1s ease",
          zIndex: 10000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            borderTop: `5px groove ${Colors.detailAppColor}`,
            height: "70px",
            width: "70px",
            borderRadius: "50%",
            animation: "girar 0.5s linear infinite",
            WebkitAnimation: "girar 0.5s linear infinite",
            MozAnimation: "girar 0.5s linear infinite",
            OAnimation: "girar 0.5s linear infinite",
          }}
        ></div>
      </div>
    </>
  );
};

export default ChargerSlice;
