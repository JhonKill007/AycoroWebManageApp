export type RolePermissionItem = {
  id: string;
  label: string;
  group: string;
  description?: string;
};

/** Catálogo UI de permisos asignables. Los ids deben coincidir con Permissions.ts del API. */
export const ROLE_PERMISSIONS_CATALOG: RolePermissionItem[] = [
  {
    id: "p1",
    group: "Dashboard",
    label: "Ver dashboard",
    description: "Acceso al panel principal",
  },
  {
    id: "p2",
    group: "Dashboard",
    label: "Ver analytics",
    description: "Estadísticas y métricas",
  },
  {
    id: "p3",
    group: "Usuarios",
    label: "Ver usuarios",
    description: "Lista de usuarios registrados",
  },
  {
    id: "p24",
    group: "Usuarios",
    label: "Ver historial de actividad",
    description: "Consultar UserActivityLog de un usuario (isla de historial)",
  },
  {
    id: "p4",
    group: "Usuarios",
    label: "Editar usuarios",
    description: "Modificar datos de usuarios",
  },
  {
    id: "p5",
    group: "Usuarios",
    label: "Banear / suspender",
    description: "Restringir acceso de usuarios",
  },
  {
    id: "p6",
    group: "Usuarios",
    label: "Eliminar cuentas",
    description: "Borrar cuentas permanentemente",
  },
  {
    id: "p21",
    group: "Usuarios",
    label: "Asignar verificación",
    description: "Otorgar, cambiar o quitar la verificación de una cuenta",
  },
  {
    id: "p7",
    group: "Contenido",
    label: "Ver publicaciones",
    description: "Visualizar todo el contenido",
  },
  {
    id: "p8",
    group: "Contenido",
    label: "Eliminar publicaciones",
    description: "Borrar contenido inapropiado",
  },
  {
    id: "p17",
    group: "Contenido",
    label: "Ver historias",
    description: "Acceso a la sección de historias",
  },
  {
    id: "p18",
    group: "Contenido",
    label: "Ver audios",
    description: "Acceso a la sección de audios",
  },
  {
    id: "p19",
    group: "Contenido",
    label: "Ver comentarios",
    description: "Acceso a la sección de comentarios",
  },
  {
    id: "p20",
    group: "Contenido",
    label: "Ver tendencias",
    description: "Acceso a la sección de tendencias",
  },
  {
    id: "p9",
    group: "Moderación",
    label: "Ver cola de moderación",
    description: "Contenido pendiente de revisión",
  },
  {
    id: "p10",
    group: "Moderación",
    label: "Tomar acciones moderación",
    description: "Aprobar/rechazar contenido",
  },
  {
    id: "p12",
    group: "Sistema",
    label: "Cambiar configuración",
    description: "Ajustes globales",
  },
  {
    id: "p13",
    group: "Sistema",
    label: "Gestionar equipo admin",
    description: "Administrar admins",
  },
  {
    id: "p14",
    group: "Sistema",
    label: "Zona de peligro",
    description: "Acciones críticas del sistema",
  },
  {
    id: "p15",
    group: "Sistema",
    label: "Ver logs y auditoría",
    description: "Errores de la app y acciones de administradores",
  },
  {
    id: "p16",
    group: "Sistema",
    label: "Ver SessionLog",
    description: "Registros de entradas y sesiones de usuarios",
  },
  {
    id: "p22",
    group: "Vault / Secretos",
    label: "Acceder a secretos",
    description: "Entrar a la sección Secretos y listar secretos permitidos",
  },
  {
    id: "p23",
    group: "Vault / Secretos",
    label: "Crear secretos",
    description:
      "Crear nuevos secretos (requiere también Acceder a secretos en la UI)",
  },
];

export const groupRolePermissionsByCategory = (
  catalog: RolePermissionItem[] = ROLE_PERMISSIONS_CATALOG,
) => {
  const grouped: { [key: string]: RolePermissionItem[] } = {};
  catalog.forEach((perm) => {
    if (!grouped[perm.group]) grouped[perm.group] = [];
    grouped[perm.group].push(perm);
  });
  return grouped;
};

/** Contador a partir de IDs únicos seleccionados. */
export const countUniquePermissionIds = (ids: Iterable<string>) =>
  new Set(
    Array.from(ids)
      .map((id) => String(id || "").trim())
      .filter(Boolean),
  ).size;

export const uniquePermissionPayload = (ids: Iterable<string>) =>
  Array.from(
    new Set(
      Array.from(ids)
        .map((id) => String(id || "").trim())
        .filter(Boolean),
    ),
  );
