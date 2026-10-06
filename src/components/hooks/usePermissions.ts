import { Permission } from "../constants/Permissions";
import { useUserContext } from "../context/UserContext";
import {
  hasAllPermissions,
  hasAnyPermission,
} from "../constants/Permissions";

export const usePermissions = () => {
  const { userData } = useUserContext();
  const permissions = userData?.user?.permissions;
  const roleType = String(userData?.user?.roleType || "NORMAL")
    .trim()
    .toUpperCase();
  const isSuperAdmin = roleType === "SUPERADMIN";

  return {
    permissions,
    roleType,
    isSuperAdmin,
    can: (permission: Permission) => permissions?.includes(permission) || false,
    canAny: (...required: Permission[]) =>
      hasAnyPermission(permissions, required),
    canAll: (...required: Permission[]) =>
      hasAllPermissions(permissions, required),
  };
};
