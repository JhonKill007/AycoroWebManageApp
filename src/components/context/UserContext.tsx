import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AycoroAuthUserPerfilModel } from "../Models/User/AycoroAuthUserPerfilModel";
import { useAuthenticateContext } from "./AuthenticateContext";

interface UserContextProps {
  userData: AycoroAuthUserPerfilModel | undefined;
  setToken: (
    internalToken: string,
    refreshToken: string,
    aycoroAuthToken: string,
  ) => void;
  saveUser: (newData: AycoroAuthUserPerfilModel) => void;
  updateUser: (newData: AycoroAuthUserPerfilModel) => void;
  removeUser: () => void;
  language: string | undefined;
  changeLanguage: (len: string | undefined) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<
    AycoroAuthUserPerfilModel | undefined
  >(undefined);
  const { setAuthenticate } = useAuthenticateContext();

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("Language");
      if (storedLang) {
        setLanguage(storedLang);
      }
    } catch (err) {
      console.error("Error al obtener Language de localStorage:", err);
    }
  }, []);

  const saveUser = useCallback((newData: AycoroAuthUserPerfilModel) => {
    setUserData(newData);
  }, []);

  const setToken = (
    internalToken: string,
    refreshToken: string,
    aycoroAuthToken: string,
  ) => {
    try {
      localStorage.setItem("internalToken", internalToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("aycoroAuthToken", aycoroAuthToken);
      setAuthenticate();
    } catch (err) {
      console.error("Error guardando token:", err);
    }
  };

  const updateUser = useCallback((newData: AycoroAuthUserPerfilModel) => {
    setUserData(newData);
  }, []);

  const removeUser = useCallback(() => {
    try {
      localStorage.removeItem("internalToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("aycoroAuthToken");
      setUserData(undefined);
      window.location.href = "/login";
    } catch (err) {
      console.error("Error eliminando user:", err);
    }
  }, []);

  const changeLanguage = useCallback((len: string | undefined) => {
    try {
      if (len) {
        localStorage.setItem("Language", len);
        setLanguage(len);
      } else {
        localStorage.removeItem("Language");
        setLanguage(undefined);
      }
    } catch (err) {
      console.error("Error guardando Language:", err);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        setToken,
        saveUser,
        updateUser,
        removeUser,
        language,
        changeLanguage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUserContext debe ser utilizado dentro de un UserProvider",
    );
  }
  return context;
};
