import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  hasValidManageSession,
  startManageSessionWatch,
  subscribeManageSession,
} from "../auth/manageSession";

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
  const [Authenticate, setAuthenticateProp] = useState<boolean>(() =>
    hasValidManageSession(),
  );

  useEffect(() => {
    startManageSessionWatch();
    return subscribeManageSession((authenticated) => {
      setAuthenticateProp(authenticated);
    });
  }, []);

  const setAuthenticate = () => {
    setAuthenticateProp(hasValidManageSession());
  };

  const clearAuthenticate = () => {
    setAuthenticateProp(false);
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
