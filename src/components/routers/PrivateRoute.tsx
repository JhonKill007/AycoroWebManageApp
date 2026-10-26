import { hasValidManageSession } from "../auth/manageSession";
import { useAuthenticateContext } from "../context/AuthenticateContext";
import ScreenICon from "../Modules/ScreenICon/ScreenICon";
import Login from "../Views/Login";

export const PrivateRoute = () => {
  const { Authenticate } = useAuthenticateContext();
  const sessionValid = Authenticate && hasValidManageSession();
  return sessionValid ? <ScreenICon /> : <Login />;
};
