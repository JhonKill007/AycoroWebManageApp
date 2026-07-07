export const Permissions = Object.freeze({
  VIEW_DASHBOARD: "p1",
  VIEW_ANALYTICS: "p2",
  VIEW_USERS: "p3",
  EDIT_USERS: "p4",
  SANCTION_USERS: "p5",
  DELETE_USERS: "p6",
  VIEW_POSTS: "p7",
  DELETE_POSTS: "p8",
  VIEW_MODERATION: "p9",
  MODERATE: "p10",
  VIEW_LOGS: "p11",
  MANAGE_SETTINGS: "p12",
  MANAGE_ADMINS: "p13",
  DANGER_ZONE: "p14",
  VIEW_ERROR_LOGS: "p15",
  VIEW_SESSION_LOGS: "p16",
});

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const hasAnyPermission = (
  granted: string[] | undefined,
  required: Permission[],
) => required.some((permission) => granted?.includes(permission));

export const hasAllPermissions = (
  granted: string[] | undefined,
  required: Permission[],
) => required.every((permission) => granted?.includes(permission));

export const getDefaultAllowedRoute = (granted: string[] | undefined) => {
  const routes: Array<[Permission, string]> = [
    [Permissions.VIEW_DASHBOARD, "/"],
    [Permissions.VIEW_ANALYTICS, "/analytics"],
    [Permissions.VIEW_MODERATION, "/reports"],
    [Permissions.VIEW_USERS, "/users"],
    [Permissions.VIEW_POSTS, "/publications"],
    [Permissions.MANAGE_SETTINGS, "/settings"],
    [Permissions.MANAGE_ADMINS, "/settings"],
    [Permissions.DANGER_ZONE, "/settings"],
    [Permissions.VIEW_ERROR_LOGS, "/logs"],
    [Permissions.VIEW_SESSION_LOGS, "/session-logs"],
  ];
  return routes.find(([permission]) => granted?.includes(permission))?.[1];
};
