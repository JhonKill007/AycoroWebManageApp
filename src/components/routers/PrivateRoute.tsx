import { useAuthenticateContext } from "../context/AuthenticateContext";
import ScreenICon from "../Modules/ScreenICon/ScreenICon";
import Login from "../Views/Login";

export const PrivateRoute = () => {
  const token = localStorage.getItem("internalToken");
  const { Authenticate } = useAuthenticateContext();
  return Authenticate || token ? <ScreenICon /> : <Login />;
};
