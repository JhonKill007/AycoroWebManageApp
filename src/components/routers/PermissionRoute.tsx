import { Navigate, Outlet } from "react-router-dom";
import { getDefaultAllowedRoute, Permission } from "../constants/Permissions";
import { usePermissions } from "../hooks/usePermissions";

export const PermissionRoute = ({ anyOf }: { anyOf: Permission[] }) => {
  const { canAny, permissions } = usePermissions();
  const fallback = getDefaultAllowedRoute(permissions) || "/unauthorized";
  return canAny(...anyOf) ? <Outlet /> : <Navigate to={fallback} replace />;
};
