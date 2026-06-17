import React, { createContext, ReactNode, useContext } from "react";
import useLocalStorage from "use-local-storage";

interface ThemeContextProps {
  theme: ThemeType;
  setThemes: (theme: ThemeType) => void;
}

type ThemeType = "light" | "dark";

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const defaultDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, SetThemeProp] = useLocalStorage<ThemeType>(
    "theme",
    defaultDark ? "dark" : "light"
  );

  const setThemes = (theme: ThemeType) => {
    SetThemeProp(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useThemeContext debe ser utilizado dentro de un ThemeProvider"
    );
  }
  return context;
};
