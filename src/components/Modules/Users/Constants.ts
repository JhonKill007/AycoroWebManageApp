export interface IUserStatus {
  id: number;
  label: string;
  dot: string;
  color: string;
}

export const getUserStatusById = (id: number) => {
  return Object.values(STATUS_CONFIG).find((status) => status.id === id);
};

export const STATUS_CONFIG = Object.freeze({
  ACTIVE: {
    id: 1,
    label: "activo",
    dot: "🟢",
    color: "success",
  } as IUserStatus,
  DELETED: {
    id: 2,
    label: "eliminado",
    dot: "🟤",
    color: "muted",
  } as IUserStatus,
  INACTIVE: {
    id: 3,
    label: "inactivo",
    dot: "⚫",
    color: "muted",
  } as IUserStatus,
  SUSPENDED: {
    id: 4,
    label: "Suspendido",
    dot: "🟡",
    color: "warning",
  } as IUserStatus,
  BANNED: {
    id: 5,
    label: "Baneado",
    dot: "🔴",
    color: "danger",
  } as IUserStatus,
});
