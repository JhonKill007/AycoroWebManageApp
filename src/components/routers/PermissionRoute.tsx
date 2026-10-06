import { Navigate, Outlet } from "react-router-dom";
import { getDefaultAllowedRoute, Permission } from "../constants/Permissions";
import { usePermissions } from "../hooks/usePermissions";

export const PermissionRoute = ({
  anyOf,
  allowSuperAdmin = false,
}: {
  anyOf: Permission[];
  /** When true, Role.Type SUPERADMIN may enter even without listed permissions. */
  allowSuperAdmin?: boolean;
}) => {
  const { canAny, permissions, isSuperAdmin } = usePermissions();
  const fallback =
    getDefaultAllowedRoute(permissions) ||
    (isSuperAdmin ? "/settings" : "/unauthorized");
  const allowed = canAny(...anyOf) || (allowSuperAdmin && isSuperAdmin);
  return allowed ? <Outlet /> : <Navigate to={fallback} replace />;
};
