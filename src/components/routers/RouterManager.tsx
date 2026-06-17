import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import DashboardRoutes from "./DashboardRoutes";

export default function RouterManager() {
  const { theme } = useThemeContext();

  // useEffect(() => {
  //   if (isMobile || isTablet) {
  //     window.location.href = "https://mobile.aycoro.com";
  //   } else if (isDesktop) {
  //   }
  // }, []);

  return (
    <div
      className="App"
      data-theme={theme}
      id="app_contain"
      style={{
        background:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<DashboardRoutes />} />
            <Route path="/*" element={<DashboardRoutes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
