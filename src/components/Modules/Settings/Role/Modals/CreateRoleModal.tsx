import React, { useCallback, useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { RoleParams } from "../../../../Models/Role/RoleParams";

interface Permission {
  id: string;
  label: string;
  group: string;
  description?: string;
}

interface CreateRoleModalProps {
  c: any;
  theme: string;
  onClose: () => void;
  onSave: (model: RoleParams) => void;
}

// Lista de permisos disponibles
const AVAILABLE_PERMISSIONS: Permission[] = [
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
    label: "Ver ErrorLog",
    description: "Registros de errores capturados por la app",
  },
  {
    id: "p16",
    group: "Sistema",
    label: "Ver SessionLog",
    description: "Registros de entradas y sesiones de usuarios",
  },
];

// Agrupar permisos por categoría
const groupPermissionsByCategory = () => {
  const grouped: { [key: string]: Permission[] } = {};
  AVAILABLE_PERMISSIONS.forEach((perm) => {
    if (!grouped[perm.group]) {
      grouped[perm.group] = [];
    }
    grouped[perm.group].push(perm);
  });
  return grouped;
};

const CreateRoleModal = ({
  c,
  theme,
  onClose,
  onSave,
}: CreateRoleModalProps) => {
  const [roleName, setRoleName] = useState<string>("");
  const [roleNameError, setRoleNameError] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"info" | "permissions">(
    "info",
  );

  const groupedPermissions = groupPermissionsByCategory();

  // Expandir todos los grupos inicialmente
  React.useEffect(() => {
    const allGroups = new Set(Object.keys(groupedPermissions));
    setExpandedGroups(allGroups);
  }, []);

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
    if (name.length > 30) {
      setRoleNameError("El nombre no puede exceder 30 caracteres");
      return false;
    }
    if (!/^[a-zA-ZáéíóúñÑ0-9\s]+$/.test(name)) {
      setRoleNameError("Solo letras, números y espacios");
      return false;
    }
    setRoleNameError("");
    return true;
  };

  // Toggle permiso individual
  const togglePermission = useCallback((permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  }, []);

  // Toggle todos los permisos de un grupo
  const toggleGroup = useCallback(
    (groupName: string, permissionsList: Permission[]) => {
      const groupPermissionIds = permissionsList.map((p) => p.id);
      const allSelected = groupPermissionIds.every((id) =>
        selectedPermissions.has(id),
      );

      setSelectedPermissions((prev) => {
        const newSet = new Set(prev);
        if (allSelected) {
          groupPermissionIds.forEach((id) => newSet.delete(id));
        } else {
          groupPermissionIds.forEach((id) => newSet.add(id));
        }
        return newSet;
      });
    },
    [selectedPermissions],
  );

  // Toggle expansión de grupo
  const toggleGroupExpand = useCallback((groupName: string) => {
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

  // Seleccionar todos los permisos
  const selectAllPermissions = useCallback(() => {
    if (selectedPermissions.size === AVAILABLE_PERMISSIONS.length) {
      setSelectedPermissions(new Set());
    } else {
      setSelectedPermissions(new Set(AVAILABLE_PERMISSIONS.map((p) => p.id)));
    }
  }, [selectedPermissions]);

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

  // Obtener estado del checkbox de grupo
  const getGroupCheckboxState = (
    groupName: string,
    permissionsList: Permission[],
  ) => {
    const filteredList = filterPermissions(permissionsList);
    if (filteredList.length === 0) return "empty";

    const checkedCount = filteredList.filter((perm) =>
      selectedPermissions.has(perm.id),
    ).length;

    if (checkedCount === 0) return "none";
    if (checkedCount === filteredList.length) return "all";
    return "partial";
  };

  // Manejar siguiente paso
  const handleNext = () => {
    if (!validateRoleName(roleName)) return;
    setCurrentStep("permissions");
  };

  // Manejar guardado
  const handleSave = async () => {
    if (!validateRoleName(roleName)) {
      setCurrentStep("info");
      return;
    }

    setIsLoading(true);
    try {
      onSave({
        _id: undefined,
        Name: roleName.trim(),
        Description: description.trim(),
        Status: status,
        Permissions: Array.from(selectedPermissions),
      });
      onClose();
    } catch (error) {
      console.error("Error creating role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar tecla Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [handleKeyDown]);

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
          maxWidth: currentStep === "info" ? 520 : 900,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
          animation: "slideUp 0.25s ease",
          transition: "max-width 0.3s ease",
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
              {currentStep === "info"
                ? "Crear nuevo rol"
                : "Configurar permisos"}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: c.textMuted,
                marginTop: "2px",
              }}
            >
              {currentStep === "info"
                ? "Define la información básica del rol"
                : "Selecciona los permisos que tendrá este rol"}
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

        {/* Contenido */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          {currentStep === "info" ? (
            /* Paso 1: Información básica */
            <div>
              {/* Nombre del rol */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: c.textMuted,
                    marginBottom: "8px",
                  }}
                >
                  Nombre del rol <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    validateRoleName(e.target.value);
                  }}
                  autoFocus
                  placeholder="Ej: Administrador, Editor, Moderador..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `2px solid ${roleNameError ? "#dc3545" : c.border}`,
                    background: c.inputBackground,
                    color: c.text,
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s",
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
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: c.textMuted,
                    marginBottom: "8px",
                  }}
                >
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe las responsabilidades y alcance de este rol..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${c.border}`,
                    background: c.inputBackground,
                    color: c.text,
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = Colors.detailAppColor;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = c.border;
                  }}
                />
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: c.textMuted,
                  }}
                >
                  {description.length}/200 caracteres
                </div>
              </div>

              {/* Estado */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: c.textMuted,
                    marginBottom: "8px",
                  }}
                >
                  Estado inicial
                </label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      value="active"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ color: c.text, fontSize: "14px" }}>
                      Activo
                    </span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      value="inactive"
                      checked={status === "inactive"}
                      onChange={() => setStatus("inactive")}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ color: c.text, fontSize: "14px" }}>
                      Inactivo
                    </span>
                  </label>
                </div>
              </div>

              {/* Información adicional */}
              <div
                style={{
                  padding: "12px 16px",
                  background: c.warningSoft,
                  borderRadius: 12,
                  marginTop: 20,
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: c.warning,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <span>💡</span>
                  <span>
                    Los roles inactivos no podrán ser asignados a nuevos
                    usuarios, pero los usuarios existentes mantendrán sus
                    permisos.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Paso 2: Selección de permisos */
            <div>
              {/* Barra de búsqueda y acciones */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative", flex: 1 }}>
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
                      background: c.inputBackground,
                      color: c.text,
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  onClick={selectAllPermissions}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: "12px",
                    fontWeight: 500,
                    border: `1px solid ${c.border}`,
                    background: "transparent",
                    color: c.text,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedPermissions.size === AVAILABLE_PERMISSIONS.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              </div>

              {/* Lista de permisos agrupada */}
              <div
                style={{
                  border: `1px solid ${c.border}`,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                {Object.entries(groupedPermissions).map(
                  ([groupName, perms]) => {
                    const filteredPerms = filterPermissions(perms);
                    if (filteredPerms.length === 0) return null;

                    const groupState = getGroupCheckboxState(groupName, perms);
                    const isExpanded = expandedGroups.has(groupName);

                    return (
                      <div key={groupName}>
                        {/* Encabezado de grupo */}
                        <div
                          onClick={() => toggleGroupExpand(groupName)}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 40px",
                            gap: 12,
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
                            <span
                              style={{ fontSize: "12px", color: c.textMuted }}
                            >
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
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Checkbox
                              checked={groupState === "all"}
                              indeterminate={groupState === "partial"}
                              onChange={() => toggleGroup(groupName, perms)}
                              c={c}
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
                                gridTemplateColumns: "1fr 40px",
                                gap: 12,
                                borderBottom: `1px solid ${c.border}`,
                                padding: "10px 16px 10px 32px",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = c.accentSoft;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "transparent";
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: c.text,
                                    marginBottom: "2px",
                                  }}
                                >
                                  {perm.label}
                                </div>
                                {perm.description && (
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: c.textMuted,
                                    }}
                                  >
                                    {perm.description}
                                  </div>
                                )}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Checkbox
                                  checked={selectedPermissions.has(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  c={c}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    );
                  },
                )}
              </div>

              {/* Resumen de selección */}
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: `${Colors.detailAppColor}10`,
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: "13px", color: c.text }}>
                  Permisos seleccionados:
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: Colors.detailAppColor,
                  }}
                >
                  {selectedPermissions.size} / {AVAILABLE_PERMISSIONS.length}
                </span>
              </div>
            </div>
          )}
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
          >
            Cancelar
          </button>

          {currentStep === "info" ? (
            <button
              onClick={handleNext}
              style={{
                padding: "10px 24px",
                borderRadius: 40,
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                background: Colors.detailAppColor,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s",
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
              Siguiente →
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentStep("info")}
                style={{
                  padding: "10px 20px",
                  borderRadius: 40,
                  fontSize: "14px",
                  fontWeight: 500,
                  border: `1px solid ${c.border}`,
                  background: "transparent",
                  color: c.text,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                ← Volver
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  padding: "10px 24px",
                  borderRadius: 40,
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  background: isLoading ? "#999" : Colors.detailAppColor,
                  color: "white",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "all 0.2s",
                }}
              >
                {isLoading ? "Creando..." : "Crear rol"}
              </button>
            </>
          )}
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

// Componente Checkbox
const Checkbox = ({ checked, indeterminate, onChange, c }: any) => {
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

export default CreateRoleModal;
