import { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";

export const Space = () => {
  const { theme } = useThemeContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // if (!mobile) {
      //   setShowMobileMenu(false);
      // }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        height: isMobile ? "50px" : "60px",
      }}
    />
  );
};
