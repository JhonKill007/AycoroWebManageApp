import { useCallback, useEffect, useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { RoleModel } from "../../../../Models/Role/RoleModel";
import { RoleParams } from "../../../../Models/Role/RoleParams";

interface Permission {
  id: string;
  label: string;
  group: string;
  description?: string;
}

interface RolePermissions {
  [roleId: string]: {
    [permissionId: string]: boolean;
  };
}

const PERMS_MATRIX: Permission[] = [
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
    id: "p11",
    group: "Sistema",
    label: "Ver logs",
    description: "Registros del sistema",
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
];

// Agrupar permisos por categoría
const groupPermissionsByCategory = () => {
  const grouped: { [key: string]: Permission[] } = {};
  PERMS_MATRIX.forEach((perm) => {
    if (!grouped[perm.group]) {
      grouped[perm.group] = [];
    }
    grouped[perm.group].push(perm);
  });
  return grouped;
};

const EditRolModal = ({
  roleData,
  c,
  theme,
  onSave,
  onClose,
}: {
  roleData: RoleModel;
  c: any;
  theme: any;
  onSave: (model: RoleParams) => void;
  onClose: () => void;
}) => {
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [roleName, setRoleName] = useState(roleData?.Name || "");
  const [isEditingRoleName, setIsEditingRoleName] = useState(false);
  const [roleNameError, setRoleNameError] = useState("");
  const [description, setDescription] = useState(roleData?.Description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [isActive, setIsActive] = useState(roleData?.Status === "active");

  const groupedPermissions = groupPermissionsByCategory();

  // Validar nombre del rol
  const validateRoleName = (name: string) => {
    if (!name.trim()) {
      setRoleNameError("El nombre del rol es requerido");
      return false;
    }
    if (name.length < 3) {
      setRoleNameError("El nombre debe tener al menos 3 caracteres");
      return false;
    }
    if (name.length > 50) {
      setRoleNameError("El nombre no puede exceder 50 caracteres");
      return false;
    }
    if (!/^[a-zA-ZáéíóúñÑ0-9\s]+$/.test(name)) {
      setRoleNameError("Solo letras, números y espacios");
      return false;
    }
    setRoleNameError("");
    return true;
  };

  // Validar descripción
  const validateDescription = (text: string) => {
    if (text.length > 200) {
      setDescriptionError("La descripción no puede exceder 200 caracteres");
      return false;
    }
    setDescriptionError("");
    return true;
  };

  // Inicializar permisos desde roleData o por defecto
  useEffect(() => {
    const initialPerms: RolePermissions = {};
    PERMS_MATRIX.forEach((perm) => {
      if (!initialPerms[roleData.Name!]) {
        initialPerms[roleData.Name!] = {};
      }
      const hasPermission = roleData?.Permissions?.includes(perm.id);
      initialPerms[roleData.Name!][perm.id] = hasPermission || false;
    });
    setPermissions(initialPerms);

    const allGroups = new Set(Object.keys(groupedPermissions));
    setExpandedGroups(allGroups);
    setRoleName(roleData.Name || "");
    setDescription(roleData?.Description || "");
    setIsActive(roleData?.Status === "active");
  }, [roleData.Name, roleData]);

  const togglePermission = useCallback(
    (permissionId: string) => {
      setPermissions((prev) => ({
        ...prev,
        [roleData.Name!]: {
          ...prev[roleData.Name!],
          [permissionId]: !prev[roleData.Name!]?.[permissionId],
        },
      }));
    },
    [roleData],
  );

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

  const toggleAllInGroup = useCallback(
    (groupName: string, permissionsList: Permission[]) => {
      const allChecked = permissionsList.every(
        (perm) => permissions[roleData.Name!]?.[perm.id],
      );

      setPermissions((prev) => ({
        ...prev,
        [roleData.Name!]: {
          ...prev[roleData.Name!],
          ...Object.fromEntries(
            permissionsList.map((perm) => [perm.id, !allChecked]),
          ),
        },
      }));
    },
    [roleData.Name, permissions],
  );

  const selectAll = useCallback(() => {
    const allChecked = PERMS_MATRIX.every(
      (perm) => permissions[roleData.Name!]?.[perm.id],
    );

    setPermissions((prev) => ({
      ...prev,
      [roleData.Name!]: Object.fromEntries(
        PERMS_MATRIX.map((perm) => [perm.id, !allChecked]),
      ),
    }));
  }, [roleData.Name!, permissions]);

  const handleSave = useCallback(async () => {
    if (!validateRoleName(roleName)) {
      return;
    }

    if (!validateDescription(description)) {
      setIsEditingDescription(true);
      return;
    }

    setIsLoading(true);
    try {
      const selectedPermissions = Object.entries(
        permissions[roleData.Name!] || {},
      )
        .filter(([_, value]) => value)
        .map(([key]) => key);

      onSave({
        _id: roleData._id,
        Name: roleName,
        Description: description,
        Permissions: selectedPermissions,
        Status: isActive ? "active" : "inactive",
      });
      onClose();
    } catch (error) {
      console.error("Error saving permissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [permissions, roleData.Name!, roleName, description, isActive, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [handleKeyDown]);

  // Filtrar permisos por búsqueda
  const filterPermissions = (permissionsList: Permission[]) => {
    if (!searchTerm) return permissionsList;
    return permissionsList.filter(
      (perm) =>
        perm.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const getGroupCheckboxState = (
    groupName: string,
    permissionsList: Permission[],
  ) => {
    const filteredList = filterPermissions(permissionsList);
    if (filteredList.length === 0) return "empty";

    const checkedCount = filteredList.filter(
      (perm) => permissions[roleData.Name!]?.[perm.id],
    ).length;

    if (checkedCount === 0) return "none";
    if (checkedCount === filteredList.length) return "all";
    return "partial";
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          borderRadius: 28,
          width: "100%",
          maxWidth: 800,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px",
            borderBottom: `1px solid ${c.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                color: c.text,
                marginBottom: "4px",
              }}
            >
              Editar permisos de rol
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: c.textMuted,
                marginTop: "2px",
              }}
            >
              Configura los permisos, nombre y descripción del rol
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: c.textMuted,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = c.accentSoft;
              e.currentTarget.style.color = c.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = c.textMuted;
            }}
          >
            ×
          </button>
        </div>

        {/* Editor de nombre del rol, descripción y estado */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: `1px solid ${c.border}`,
            background:
              theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          }}
        >
          {/* Fila 1: Nombre y Estado */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "flex-start",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {/* Nombre del rol */}
            <div style={{ flex: 2 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: c.textMuted,
                  marginBottom: "8px",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                }}
              >
                Nombre del rol <span style={{ color: "#dc3545" }}>*</span>
              </label>

              {isEditingRoleName ? (
                <div>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => {
                      setRoleName(e.target.value);
                      validateRoleName(e.target.value);
                    }}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: `2px solid ${roleNameError ? "#dc3545" : c.border}`,
                      background:
                        theme === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.03)",
                      color: c.text,
                      fontSize: "15px",
                      fontWeight: 500,
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (!roleNameError && roleName.trim()) {
                          setIsEditingRoleName(false);
                        }
                      }
                      if (e.key === "Escape") {
                        setRoleName(roleData.Name! || "");
                        setRoleNameError("");
                        setIsEditingRoleName(false);
                      }
                    }}
                    onBlur={() => {
                      if (!roleNameError && roleName.trim()) {
                        setIsEditingRoleName(false);
                      }
                    }}
                  />
                  {roleNameError && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        color: "#dc3545",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>⚠️</span> {roleNameError}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "11px",
                      color: c.textMuted,
                      display: "flex",
                      gap: "12px",
                    }}
                  >
                    <span>↵ Enter para guardar</span>
                    <span>⎋ Escape para cancelar</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingRoleName(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background:
                      theme === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                    borderRadius: 12,
                    border: `1px solid ${c.border}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = Colors.detailAppColor;
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = c.border;
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)";
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: c.text,
                    }}
                  >
                    {roleName || "Sin nombre"}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: c.textMuted,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ✏️ Editar
                  </span>
                </div>
              )}
            </div>

            {/* Switch de estado */}
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: c.textMuted,
                  marginBottom: "8px",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                }}
              >
                Estado del rol
              </label>

              <div
                onClick={() => setIsActive(!isActive)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "28px",
                    borderRadius: "28px",
                    background: isActive ? Colors.detailAppColor : c.border,
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: isActive
                      ? `0 0 0 3px ${Colors.detailAppColor}20`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "24px",
                      background: "white",
                      transform: isActive
                        ? "translateX(24px)"
                        : "translateX(0)",
                      transition: "transform 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: isActive ? Colors.detailAppColor : c.textMuted,
                    }}
                  >
                    {isActive ? "Activo" : "Inactivo"}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: c.textMuted,
                      marginTop: "2px",
                    }}
                  >
                    {isActive
                      ? "Los usuarios pueden usar este rol"
                      : "Este rol no está disponible para asignar"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: c.textMuted,
                marginBottom: "8px",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
              }}
            >
              Descripción
            </label>

            {isEditingDescription ? (
              <div>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    validateDescription(e.target.value);
                  }}
                  placeholder="Describe las responsabilidades y alcance de este rol..."
                  rows={3}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `2px solid ${descriptionError ? "#dc3545" : c.border}`,
                    background:
                      theme === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                    color: c.text,
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setDescription(roleData?.Description || "");
                      setDescriptionError("");
                      setIsEditingDescription(false);
                    }
                  }}
                />
                {descriptionError && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#dc3545",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>⚠️</span> {descriptionError}
                  </div>
                )}
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "11px",
                    color: c.textMuted,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <span>✓ Click fuera para guardar</span>
                    <span>⎋ Escape para cancelar</span>
                  </div>
                  <span
                    style={{
                      color:
                        description.length > 180
                          ? description.length > 200
                            ? "#dc3545"
                            : Colors.detailAppColor
                          : c.textMuted,
                    }}
                  >
                    {description.length}/200
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDescription(true)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background:
                    theme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                  borderRadius: 12,
                  border: `1px solid ${c.border}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minHeight: "60px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = Colors.detailAppColor;
                  e.currentTarget.style.background =
                    theme === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.background =
                    theme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)";
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: description ? c.text : c.textMuted,
                    fontStyle: description ? "normal" : "italic",
                    flex: 1,
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {description || "Sin descripción. Haz clic para añadir..."}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: c.textMuted,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginLeft: "12px",
                    flexShrink: 0,
                  }}
                >
                  ✏️ Editar
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de búsqueda y acciones rápidas */}
        <div
          style={{
            padding: "16px 28px",
            borderBottom: `1px solid ${c.border}`,
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Buscar permisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                color: c.text,
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = Colors.detailAppColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${Colors.detailAppColor}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            onClick={selectAll}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: "13px",
              fontWeight: 500,
              border: `1px solid ${c.border}`,
              background: "transparent",
              color: c.text,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = c.accentSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {PERMS_MATRIX.every(
              (perm) => permissions[roleData.Name!]?.[perm.id],
            )
              ? "Deseleccionar todos"
              : "Seleccionar todos"}
          </button>
        </div>

        {/* Tabla de permisos agrupada */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 28px" }}>
          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${c.border}`,
              overflow: "hidden",
              margin: "20px 0",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px",
                gap: 0,
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                borderBottom: `1px solid ${c.border}`,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: c.textMuted,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Permiso
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: c.textMuted,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Activo
              </div>
            </div>

            {/* Permisos agrupados por categoría */}
            {Object.entries(groupedPermissions).map(([groupName, perms]) => {
              const filteredPerms = filterPermissions(perms);
              if (filteredPerms.length === 0) return null;

              const groupState = getGroupCheckboxState(groupName, perms);
              const isExpanded = expandedGroups.has(groupName);

              return (
                <div key={groupName}>
                  {/* Encabezado de grupo */}
                  <div
                    onClick={() => toggleGroup(groupName)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px",
                      gap: 0,
                      background:
                        theme === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.01)",
                      borderBottom: `1px solid ${c.border}`,
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = c.accentSoft;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        theme === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.01)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: c.textMuted }}>
                        {isExpanded ? "▼" : "▶"}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: c.text,
                        }}
                      >
                        {groupName}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: c.textMuted,
                          background:
                            theme === "dark"
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)",
                          padding: "2px 8px",
                          borderRadius: 12,
                        }}
                      >
                        {filteredPerms.length}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Checkbox
                        checked={groupState === "all"}
                        indeterminate={groupState === "partial"}
                        onChange={() => toggleAllInGroup(groupName, perms)}
                        c={c}
                        theme={theme}
                      />
                    </div>
                  </div>

                  {/* Permisos del grupo */}
                  {isExpanded &&
                    filteredPerms.map((perm) => (
                      <div
                        key={perm.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 80px",
                          gap: 0,
                          borderBottom: `1px solid ${c.border}`,
                          transition: "background 0.15s",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = c.accentSoft;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px 12px 32px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: c.text,
                            }}
                          >
                            {perm.label}
                          </span>
                          {perm.description && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: c.textMuted,
                              }}
                            >
                              {perm.description}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Checkbox
                            checked={
                              permissions[roleData.Name!]?.[perm.id] || false
                            }
                            onChange={() => togglePermission(perm.id)}
                            c={c}
                            theme={theme}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px 28px",
            borderTop: `1px solid ${c.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            background:
              theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              borderRadius: 40,
              fontSize: "14px",
              fontWeight: 500,
              border: `1px solid ${c.border}`,
              background: "transparent",
              color: c.text,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = c.accentSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !!roleNameError}
            style={{
              padding: "10px 24px",
              borderRadius: 40,
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              background:
                isLoading || roleNameError ? "#999" : Colors.detailAppColor,
              color: "white",
              cursor: isLoading || roleNameError ? "not-allowed" : "pointer",
              opacity: isLoading || roleNameError ? 0.7 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !roleNameError) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(0.98)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Checkbox con soporte para estado indeterminado
const Checkbox = ({ checked, indeterminate, onChange, c, theme }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onChange}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        background:
          checked || indeterminate ? Colors.detailAppColor : "transparent",
        border: `2px solid ${checked || indeterminate ? Colors.detailAppColor : c.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s",
        transform:
          isHovered && !checked && !indeterminate ? "scale(1.05)" : "scale(1)",
        boxShadow: isHovered ? `0 0 0 3px ${Colors.detailAppColor}20` : "none",
      }}
    >
      {indeterminate ? (
        <div
          style={{
            width: 10,
            height: 2,
            background: "white",
            borderRadius: 1,
          }}
        />
      ) : checked ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : null}
    </div>
  );
};

export default EditRolModal;
