import { useCallback, useEffect, useMemo, useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { useToast } from "../../../../context/ToastContext";
import { RoleModel } from "../../../../Models/Role/RoleModel";
import { RoleParams } from "../../../../Models/Role/RoleParams";
import roleService from "../../../../Services/Role/RoleService";
import { Pagination } from "../../../Common/Components/Pagination";
import ActionAlert from "../../../Common/Modal/ActionAlert";
import { formatDate, getStatusColor, getStatusText } from "../../Common/Utils";
import CreateRoleModal from "../Modals/CreateRoleModal";
import EditRolModal from "../Modals/EditRolModal";

// Componente de skeleton loading
const TableSkeleton = ({ rows = 5, c }: { rows?: number; c: any }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 80px 100px 80px",
            gap: 12,
            padding: "14px 20px",
            borderBottom: `1px solid ${c.border}`,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                width: "60%",
                height: "16px",
                background: c.accentSoft,
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "80%",
                height: "12px",
                background: c.accentSoft,
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              width: "60px",
              height: "24px",
              background: c.accentSoft,
              borderRadius: "12px",
            }}
          />
          <div
            style={{
              width: "50px",
              height: "24px",
              background: c.accentSoft,
              borderRadius: "12px",
            }}
          />
          <div
            style={{
              width: "70px",
              height: "12px",
              background: c.accentSoft,
              borderRadius: "4px",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                width: "60px",
                height: "28px",
                background: c.accentSoft,
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                width: "32px",
                height: "28px",
                background: c.accentSoft,
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

const RolesTab = ({ c, theme }: { c: any; theme: string }) => {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleModel | null>(null);
  const [search, setSearch] = useState<string>("");
  const [searchDebounced, setSearchDebounced] = useState<string>("");
  const [deleteAlert, setDeleteAlert] = useState<{
    visible: boolean;
    roleId: string;
    roleName: string;
  }>({
    visible: false,
    roleId: "",
    roleName: "",
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Paginación
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Cargar roles con paginación y búsqueda
  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      // itemsPerPage,
      const response = await roleService.getAll(page, searchDebounced);

      // CORRECCIÓN: Verificar la estructura de la respuesta
      // Si response.data es un array, usarlo directamente
      // Si response.data tiene una propiedad 'data' que es el array, usarlo
      // Si no, inicializar como array vacío
      let rolesData: RoleModel[] = [];
      let totalItemsCount = 0;
      let totalPagesCount = 1;

      if (response.data && Array.isArray(response.data.data)) {
        rolesData = response.data.data;
        totalItemsCount =
          response.data.pagination.total || response.data.data.length;
        totalPagesCount =
          response.data.pagination.totalPages ||
          Math.ceil(totalItemsCount / itemsPerPage);
      } else {
        // Si la estructura es diferente, intentar extraer de la respuesta

        showToast({
          type: "warning",
          title: "Datos no sincronizados",
          description: `Estructura de respuesta inesperada.`,
          duration: 5000,
        });
        rolesData = [];
        totalItemsCount = 0;
      }

      setRoles(rolesData);
      setTotalPages(totalPagesCount);
      setTotalItems(totalItemsCount);
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([]);
      setTotalPages(1);
      setTotalItems(0);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los roles",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, itemsPerPage, searchDebounced, showToast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Estadísticas (ahora usando totalItems de la API)
  const stats = useMemo(() => {
    // Asegurar que roles es un array antes de usar filter
    const rolesArray = Array.isArray(roles) ? roles : [];
    return {
      total: totalItems,
      active: rolesArray.filter((r) => r?.Status === "active").length,
      inactive: rolesArray.filter((r) => r?.Status === "inactive").length,
      totalMembers: rolesArray.reduce(
        (sum, r) => sum + (r?.MemberCount || 0),
        0,
      ),
    };
  }, [roles, totalItems]);

  // Cambiar estado del rol
  const toggleRoleStatus = useCallback(
    async (roleId: string, currentStatus: "active" | "inactive") => {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // Verificar que roles es un array
      if (!Array.isArray(roles)) {
        await loadRoles();
        return;
      }

      // Optimistic update
      setRoles((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((r) =>
          r._id === roleId ? { ...r, Status: newStatus } : r,
        );
      });

      try {
        await roleService.updateStatus({
          _id: roleId,
          Name: undefined,
          Description: undefined,
          Status: newStatus,
          Permissions: undefined,
        });
        showToast({
          type: "success",
          title: "Estado actualizado",
          description: `El rol ahora está ${newStatus === "active" ? "activo" : "inactivo"}`,
          duration: 3000,
        });
      } catch (error) {
        // Revertir en caso de error
        setRoles((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.map((r) =>
            r._id === roleId ? { ...r, Status: currentStatus } : r,
          );
        });
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el estado del rol",
          duration: 4000,
        });
      }
    },
    [roles, loadRoles, showToast],
  );

  // Crear rol
  const createRole = useCallback(
    async (model: RoleParams) => {
      setIsLoading(true);
      try {
        await roleService.create(model);
        showToast({
          type: "success",
          title: "Rol creado",
          description: `El rol "${model.Name}" ha sido creado correctamente`,
          duration: 3000,
        });
        setPage(1);
        setSearch("");
        setSearchDebounced("");
        await loadRoles();
        setShowCreateRole(false);
      } catch (error) {
        console.error("Error creating role:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo crear el rol",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadRoles, showToast],
  );

  // Actualizar rol
  const updateRole = useCallback(
    async (model: RoleParams) => {
      setIsLoading(true);
      try {
        await roleService.update(model);
        showToast({
          type: "success",
          title: "Rol actualizado",
          description: `El rol "${model.Name}" ha sido actualizado correctamente`,
          duration: 3000,
        });
        await loadRoles();
        setEditingRole(null);
      } catch (error) {
        console.error("Error updating role:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el rol",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadRoles, showToast],
  );

  // Eliminar rol
  const deleteRole = useCallback(
    (roleId: string, roleName: string, memberCount: number) => {
      if (memberCount > 0) {
        showToast({
          type: "error",
          title: "No se puede eliminar",
          description: `El rol "${roleName}" tiene ${memberCount} ${memberCount === 1 ? "miembro asignado" : "miembros asignados"}. Reasigna o elimina los miembros primero.`,
          duration: 4000,
        });
        return;
      }

      setDeleteAlert({
        visible: true,
        roleId,
        roleName,
      });
    },
    [showToast],
  );

  // Confirmar eliminación
  const confirmDelete = useCallback(async () => {
    const { roleId, roleName } = deleteAlert;
    setIsDeleting(true);

    try {
      await roleService.delete(roleId);
      showToast({
        type: "success",
        title: "Rol eliminado",
        description: `El rol "${roleName}" ha sido eliminado correctamente`,
        duration: 3000,
      });

      const currentRoles = Array.isArray(roles) ? roles : [];
      if (currentRoles.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadRoles();
      }

      setDeleteAlert((prev) => ({ ...prev, visible: false }));
    } catch (error) {
      console.error("Error deleting role:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo eliminar el rol",
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAlert, loadRoles, page, roles, showToast]);

  // Resetear búsqueda
  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchDebounced("");
    setPage(1);
  }, []);

  
 
  // Asegurar que roles es un array para el renderizado
  const safeRoles = Array.isArray(roles) ? roles : [];

  return (
    <div>
      {/* Título de sección */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: c.text,
            marginBottom: 6,
          }}
        >
          Roles y permisos
        </h2>
        <p style={{ fontSize: "13px", color: c.textMuted }}>
          Gestiona los roles del sistema y sus permisos asociados.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            padding: "14px 16px",
          }}
        >
          <div
            style={{ fontSize: "11px", color: c.textMuted, marginBottom: 4 }}
          >
            Total roles
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: c.text }}>
            {stats.total}
          </div>
        </div>
        <div
          style={{
            background: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            padding: "14px 16px",
          }}
        >
          <div
            style={{ fontSize: "11px", color: c.textMuted, marginBottom: 4 }}
          >
            Roles activos
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: c.success }}>
            {stats.active}
          </div>
        </div>
        <div
          style={{
            background: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 14,
            padding: "14px 16px",
          }}
        >
          <div
            style={{ fontSize: "11px", color: c.textMuted, marginBottom: 4 }}
          >
            Usuarios asignados
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: Colors.detailAppColor,
            }}
          >
            {stats.totalMembers}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: c.textMuted,
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            style={{
              width: "100%",
              background: c.inputBackground,
              border: `1.5px solid ${c.inputBorder}`,
              borderRadius: 12,
              padding: "10px 14px 10px 38px",
              fontSize: 13,
              color: c.text,
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = Colors.detailAppColor;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${Colors.detailAppColor}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = c.inputBorder;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {search && (
            <button
              onClick={clearSearch}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: c.textMuted,
                fontSize: 14,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setShowCreateRole(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            borderRadius: 24,
            background: Colors.detailAppColor,
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: `0 4px 12px ${Colors.detailAppColor}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          + Crear rol
        </button>
      </div>

      {/* Tabla de roles */}
      <div
        style={{
          background: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 80px 100px 80px",
            gap: 12,
            padding: "14px 20px",
            background:
              theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          {["Rol", "Miembros", "Estado", "Creado", "Acciones"].map((header) => (
            <div
              key={header}
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: c.textMuted,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Filas con skeleton o datos */}
        {isLoading && safeRoles.length === 0 ? (
          <TableSkeleton rows={5} c={c} />
        ) : safeRoles.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              color: c.textMuted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              No se encontraron roles
            </div>
            <div style={{ fontSize: 12 }}>
              {search
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primer rol para comenzar"}
            </div>
          </div>
        ) : (
          safeRoles.map((role) => {
            const statusColor = getStatusColor(role?.Status || "inactive");
            const isSystemRole =
              role?.Name === "Admin" || role?.Name === "Administrador";

            return (
              <div
                key={role?._id || Math.random()}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 80px 100px 80px",
                  gap: 12,
                  padding: "14px 20px",
                  borderBottom: `1px solid ${c.border}`,
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = c.accentSoft;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Información del rol */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{ fontSize: 14, fontWeight: 600, color: c.text }}
                    >
                      {role?.Name || "Sin nombre"}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        background: `${Colors.detailAppColor}15`,
                        color: Colors.detailAppColor,
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}
                    >
                      {role?.Permissions?.length || 0} permisos
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}
                  >
                    {role?.Description || "Sin descripción"}
                  </div>
                </div>

                {/* Miembros */}
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${Colors.detailAppColor}10`,
                      color: Colors.detailAppColor,
                    }}
                  >
                    {role?.MemberCount || 0}{" "}
                    {role?.MemberCount === 1 ? "usuario" : "usuarios"}
                  </span>
                </div>

                {/* Estado */}
                <div
                  onClick={() =>
                    toggleRoleStatus(
                      role?._id!,
                      role?.Status as "active" | "inactive",
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: `${statusColor}15`,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: statusColor,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: statusColor,
                        textTransform: "capitalize",
                      }}
                    >
                      {getStatusText(role?.Status || "inactive")}
                    </span>
                  </div>
                </div>

                {/* Creado */}
                <div style={{ fontSize: 11, color: c.textMuted }}>
                  {formatDate(`${role?.CreateDate}`)}
                  {role?.CreateBy && (
                    <div style={{ fontSize: 10, marginTop: 2 }}>
                      por {role.CreateBy}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setEditingRole(role)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 10,
                      border: `1px solid ${c.border}`,
                      background: "transparent",
                      color: c.text,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = c.accentSoft;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Editar
                  </button>
                  {!isSystemRole && (
                    <button
                      onClick={() =>
                        deleteRole(role?._id!, role?.Name!, role?.MemberCount!)
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        border: `1px solid ${c.danger}33`,
                        background: `${c.danger}10`,
                        color: c.danger,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${c.danger}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${c.danger}10`;
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pie de tabla */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: c.textMuted,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div></div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: c.success,
              }}
            />
            <span>Activo</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: c.warning,
              }}
            />
            <span>Inactivo</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: Colors.detailAppColor,
              }}
            />
            <span>Editar permisos</span>
          </div>
        </div>
      </div>

      {/* Footer de tabla */}
      {/* ── Footer con paginación ── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        itemsPerPage={safeRoles.length}
        totalItems={totalItems}
        search={search}
        setPage={setPage}
        c={c}
        theme={theme}
      />

      {/* Modales */}
      {showCreateRole && (
        <CreateRoleModal
          c={c}
          theme={theme}
          onSave={createRole}
          onClose={() => setShowCreateRole(false)}
        />
      )}

      {editingRole && (
        <EditRolModal
          roleData={editingRole}
          c={c}
          theme={theme}
          onSave={updateRole}
          onClose={() => setEditingRole(null)}
        />
      )}

      {/* Alert de eliminación */}
      <ActionAlert
        visible={deleteAlert.visible}
        title="Eliminar rol"
        description={`¿Estás seguro de que deseas eliminar el rol "${deleteAlert.roleName}"? Esta acción es irreversible.`}
        actionText="Eliminar"
        actionColor="#dc3545"
        icon="🗑️"
        onAction={confirmDelete}
        onCancel={() => setDeleteAlert((prev) => ({ ...prev, visible: false }))}
        theme={theme}
        c={c}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RolesTab;
