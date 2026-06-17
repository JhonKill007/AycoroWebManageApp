import { useState } from "react";

export const useAlertConfirmation = () => {
  const [alertState, setAlertState] = useState<any>({
    isOpen: false,
    type: "",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "default" | "danger" | "warning" | "success",
    title: string,
    message: string
  ) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const handleClose = () => {
    setAlertState((prev: any) => ({ ...prev, isOpen: false }));
  };
  return {
    alertState,
    showAlert,
    handleClose,
  };
};
