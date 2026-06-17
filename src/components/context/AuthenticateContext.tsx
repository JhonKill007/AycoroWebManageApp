import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthenticateContextProps {
  Authenticate: boolean;
  setAuthenticate: () => void;
  clearAuthenticate: () => void;
}

const AuthenticateContext = createContext<AuthenticateContextProps | undefined>(
  undefined
);

interface AuthenticateProviderProps {
  children: ReactNode;
}

export const AuthenticateProvider: React.FC<AuthenticateProviderProps> = ({
  children,
}) => {
  const [Authenticate, setAuthenticateProp] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedtoken = localStorage.getItem("Us-Ac");
      if (storedtoken) {
        setAuthenticateProp(true);
      }
    } catch (err) {
      console.error("Error al obtener Token de localStorage:", err);
    }
  }, []);

  const setAuthenticate = () => {
    setAuthenticateProp(true);
  };

  const clearAuthenticate = () => {
    setAuthenticateProp(true);
  };

  return (
    <AuthenticateContext.Provider
      value={{ Authenticate, setAuthenticate, clearAuthenticate }}
    >
      {children}
    </AuthenticateContext.Provider>
  );
};

export const useAuthenticateContext = (): AuthenticateContextProps => {
  const context = useContext(AuthenticateContext);
  if (!context) {
    throw new Error(
      "useAuthenticateContext debe ser utilizado dentro de un AuthenticateProvider"
    );
  }
  return context;
};
