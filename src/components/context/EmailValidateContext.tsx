import React, { createContext, ReactNode, useContext, useState } from "react";

interface EmailValidateContextProps {
  emailWarning: boolean;
  saveEmailWarning: (value: boolean) => void;
}

const EmailValidateContext = createContext<
  EmailValidateContextProps | undefined
>(undefined);

interface EmailValidateProviderProps {
  children: ReactNode;
}

export const EmailValidateProvider: React.FC<EmailValidateProviderProps> = ({
  children,
}) => {
  const [versionWarning, setVersionWarning] = useState<boolean>(false);
  const [emailWarning, setEmailWarning] = useState<boolean>(false);

  const saveEmailWarning = (value: boolean) => {
    setEmailWarning(value);
  };

  return (
    <EmailValidateContext.Provider
      value={{
        emailWarning,
        saveEmailWarning,
      }}
    >
      {children}
    </EmailValidateContext.Provider>
  );
};

export const useEmailValidateContext = (): EmailValidateContextProps => {
  const context = useContext(EmailValidateContext);
  if (!context) {
    throw new Error(
      "useEmailValidateContext debe ser utilizado dentro de un EmailValidateProvider"
    );
  }
  return context;
};
