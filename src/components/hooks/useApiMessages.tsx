import { ApiCodes } from "../constants/ApiCodes";
import useLanguage from "./useLanguage";

const useApiMessages = () => {
  const { getLabel } = useLanguage();
  const getMessageByCode = (code: number, param?: any) => {
    switch (code) {
      case ApiCodes.UserNotFound:
        return getLabel("usuario_no_encontrado");

      case ApiCodes.InvalidCode:
        return getLabel("codigo_invalido");

      case ApiCodes.UsuarPassIncorrect:
        return getLabel("usuario_contracena_incorrecta");

      case ApiCodes.AccountBlocked:
        return getLabel("cuenta_bloqueada");

      case ApiCodes.AccountSuspended:
        return getLabel("cuenta_suspendida");

      case ApiCodes.AttemptsPassed:
        return getLabel("intentos_enviar_correo", {
          param: `${param}`,
        });
      case ApiCodes.Attempts:
        if (param > 1) {
          return getLabel("intentos", { param: `${param}` });
        }
        return getLabel("intento", { param: `${param}` });
    }
  };
  return { getMessageByCode };
};

export default useApiMessages;
