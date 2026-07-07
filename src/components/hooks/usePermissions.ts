import { useUserContext } from "../context/UserContext";
import {
  hasAllPermissions,
  hasAnyPermission,
  Permission,
} from "../constants/Permissions";

export const usePermissions = () => {
  const { userData } = useUserContext();
  const permissions = userData?.user?.permissions;

  return {
    permissions,
    can: (permission: Permission) => permissions?.includes(permission) || false,
    canAny: (...required: Permission[]) =>
      hasAnyPermission(permissions, required),
    canAll: (...required: Permission[]) =>
      hasAllPermissions(permissions, required),
  };
};
