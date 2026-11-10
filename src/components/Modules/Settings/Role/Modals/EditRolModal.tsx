import { useCallback, useEffect, useMemo, useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { RoleModel } from "../../../../Models/Role/RoleModel";
import { RoleParams } from "../../../../Models/Role/RoleParams";
import {
  ROLE_PERMISSIONS_CATALOG,
  countUniquePermissionIds,
  groupRolePermissionsByCategory,
  uniquePermissionPayload,
  type RolePermissionItem,
} from "../rolePermissionsCatalog";
import "../RoleModalLayout.css";

type RolePermissionsState = {
  [roleKey: string]: {
    [permissionId: string]: boolean;
  };
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
  const roleKey = roleData.Name || roleData._id || "role";
  const [permissions, setPermissions] = useState<RolePermissionsState>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [roleName, setRoleName] = useState(roleData?.Name || "");
  const [roleNameError, setRoleNameError] = useState("");
  const [description, setDescription] = useState(roleData?.Description || "");
  const [descriptionError, setDescriptionError] = useState("");
  const [isActive, setIsActive] = useState(roleData?.Status === "active");

  const groupedPermissions = useMemo(
    () => groupRolePermissionsByCategory(),
    [],
  );

  useEffect(() => {
    const key = roleData.Name || roleData._id || "role";
    const initial: RolePermissionsState = { [key]: {} };
    ROLE_PERMISSIONS_CATALOG.forEach((perm) => {
      initial[key][perm.id] = Boolean(
        roleData?.Permissions?.includes(perm.id),
      );
    });
    setPermissions(initial);
    setExpandedGroups(new Set(Object.keys(groupedPermissions)));
    setRoleName(roleData.Name || "");
    setDescription(roleData?.Description || "");
    setIsActive(roleData?.Status === "active");
    setRoleNameError("");
    setDescriptionError("");
    // Solo reinicializar al abrir otro rol; evita resetear checks mid-edit.
  }, [roleData._id, roleData.Name, roleData.Permissions, roleData.Status, roleData.Description, groupedPermissions]);

  const selectedIds = useMemo(
    () =>
      Object.entries(permissions[roleKey] || {})
        .filter(([, value]) => Boolean(value))
        .map(([id]) => id),
    [permissions, roleKey],
  );

  const selectedCount = countUniquePermissionIds(selectedIds);
  const selectedLabels = useMemo(
    () =>
      ROLE_PERMISSIONS_CATALOG.filter((perm) =>
        selectedIds.includes(perm.id),
      ),
    [selectedIds],
  );

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

  const validateDescription = (text: string) => {
    if (text.length > 200) {
      setDescriptionError("La descripción no puede exceder 200 caracteres");
      return false;
    }
    setDescriptionError("");
    return true;
  };

  const togglePermission = useCallback(
    (permissionId: string) => {
      setPermissions((prev) => ({
        ...prev,
        [roleKey]: {
          ...prev[roleKey],
          [permissionId]: !prev[roleKey]?.[permissionId],
        },
      }));
    },
    [roleKey],
  );

  const toggleGroupExpand = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  }, []);

  const toggleAllInGroup = useCallback(
    (permissionsList: RolePermissionItem[]) => {
      const allChecked = permissionsList.every(
        (perm) => permissions[roleKey]?.[perm.id],
      );
      setPermissions((prev) => ({
        ...prev,
        [roleKey]: {
          ...prev[roleKey],
          ...Object.fromEntries(
            permissionsList.map((perm) => [perm.id, !allChecked]),
          ),
        },
      }));
    },
    [permissions, roleKey],
  );

  const selectAll = useCallback(() => {
    const allChecked = ROLE_PERMISSIONS_CATALOG.every(
      (perm) => permissions[roleKey]?.[perm.id],
    );
    setPermissions((prev) => ({
      ...prev,
      [roleKey]: Object.fromEntries(
        ROLE_PERMISSIONS_CATALOG.map((perm) => [perm.id, !allChecked]),
      ),
    }));
  }, [permissions, roleKey]);

  const handleSave = useCallback(() => {
    if (!validateRoleName(roleName)) return;
    if (!validateDescription(description)) return;

    setIsLoading(true);
    try {
      const permissionsPayload = uniquePermissionPayload(selectedIds);
      onSave({
        _id: roleData._id,
        Name: roleName,
        Description: description,
        Permissions: permissionsPayload,
        Status: isActive ? "active" : "inactive",
      });
      onClose();
    } catch (error) {
      console.error("Error saving permissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    roleName,
    description,
    selectedIds,
    roleData._id,
    isActive,
    onSave,
    onClose,
  ]);

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

  const filterPermissions = (permissionsList: RolePermissionItem[]) => {
    if (!searchTerm) return permissionsList;
    const q = searchTerm.toLowerCase();
    return permissionsList.filter(
      (perm) =>
        perm.label.toLowerCase().includes(q) ||
        perm.group.toLowerCase().includes(q) ||
        perm.description?.toLowerCase().includes(q) ||
        perm.id.toLowerCase().includes(q),
    );
  };

  const getGroupCheckboxState = (permissionsList: RolePermissionItem[]) => {
    const filteredList = filterPermissions(permissionsList);
    if (filteredList.length === 0) return "empty";
    const checkedCount = filteredList.filter(
      (perm) => permissions[roleKey]?.[perm.id],
    ).length;
    if (checkedCount === 0) return "none";
    if (checkedCount === filteredList.length) return "all";
    return "partial";
  };

  const inputBg =
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <div
      className="role-modal-overlay"
      onClick={onClose}
      style={{
        background: theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="role-modal-shell"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1px solid ${c.border}`,
          ["--role-modal-border" as any]: c.border,
        }}
      >
        <div
          className="role-modal-header"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: c.text,
                margin: 0,
              }}
            >
              Editar rol
            </h2>
            <p
              style={{
                fontSize: 13,
                color: c.textMuted,
                margin: "4px 0 0",
              }}
            >
              Actualiza la información del rol y sus permisos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "transparent",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: c.textMuted,
              width: 36,
              height: 36,
              borderRadius: 12,
            }}
          >
            ×
          </button>
        </div>

        <div className="role-modal-body">
          <div
            className="role-modal-left"
            style={{ borderRight: `1px solid ${c.border}` }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.textMuted,
                  marginBottom: 6,
                  textTransform: "uppercase",
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
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: `2px solid ${roleNameError ? "#dc3545" : c.border}`,
                  background: c.inputBackground || inputBg,
                  color: c.text,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              {roleNameError ? (
                <div style={{ marginTop: 6, fontSize: 12, color: "#dc3545" }}>
                  ⚠️ {roleNameError}
                </div>
              ) : null}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.textMuted,
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 200);
                  setDescription(value);
                  validateDescription(value);
                }}
                rows={5}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${
                    descriptionError ? "#dc3545" : c.border
                  }`,
                  background: c.inputBackground || inputBg,
                  color: c.text,
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <div style={{ marginTop: 6, fontSize: 11, color: c.textMuted }}>
                {description.length}/200
              </div>
              {descriptionError ? (
                <div style={{ marginTop: 4, fontSize: 12, color: "#dc3545" }}>
                  {descriptionError}
                </div>
              ) : null}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.textMuted,
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Estado
              </label>
              <div style={{ display: "flex", gap: 14 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    color: c.text,
                    fontSize: 14,
                  }}
                >
                  <input
                    type="radio"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                  />
                  Activo
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    color: c.text,
                    fontSize: 14,
                  }}
                >
                  <input
                    type="radio"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                  />
                  Inactivo
                </label>
              </div>
            </div>

            <div
              className="role-summary-card"
              style={{
                background: c.accentSoft,
                border: `1px solid ${c.border}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted }}>
                RESUMEN DE PERMISOS
              </div>
              <div className="role-summary-count" style={{ color: c.accent }}>
                {selectedCount}
              </div>
              <div style={{ fontSize: 12, color: c.textMuted }}>
                de {ROLE_PERMISSIONS_CATALOG.length} disponibles
              </div>
              {selectedLabels.length > 0 ? (
                <div className="role-summary-list">
                  {selectedLabels.slice(0, 8).map((perm) => (
                    <div key={perm.id} style={{ fontSize: 11, color: c.text }}>
                      • {perm.label}
                      {perm.id === "p24" ? " (p24)" : ""}
                    </div>
                  ))}
                  {selectedLabels.length > 8 ? (
                    <div style={{ fontSize: 11, color: c.textMuted }}>
                      +{selectedLabels.length - 8} más
                    </div>
                  ) : null}
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 12, color: c.textMuted }}>
                  Ningún permiso seleccionado
                </div>
              )}
            </div>
          </div>

          <div className="role-modal-right">
            <div
              className="role-modal-perms-toolbar"
              style={{ borderBottom: `1px solid ${c.border}` }}
            >
              <div style={{ flex: 1, minWidth: 160 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: c.text,
                    marginBottom: 8,
                  }}
                >
                  Permisos
                </div>
                <input
                  type="text"
                  placeholder="Buscar permisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${c.border}`,
                    background: c.inputBackground || inputBg,
                    color: c.text,
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={selectAll}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${c.border}`,
                  background: "transparent",
                  color: c.text,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  alignSelf: "flex-end",
                }}
              >
                {ROLE_PERMISSIONS_CATALOG.every(
                  (perm) => permissions[roleKey]?.[perm.id],
                )
                  ? "Deseleccionar todos"
                  : "Seleccionar todos"}
              </button>
            </div>

            <div className="role-modal-perms-scroll">
              <div
                style={{
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {Object.entries(groupedPermissions).map(
                  ([groupName, perms]) => {
                    const filteredPerms = filterPermissions(perms);
                    if (filteredPerms.length === 0) return null;
                    const groupState = getGroupCheckboxState(perms);
                    const isExpanded = expandedGroups.has(groupName);

                    return (
                      <div key={groupName}>
                        <div
                          onClick={() => toggleGroupExpand(groupName)}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 72px",
                            padding: "10px 12px",
                            background: inputBg,
                            borderBottom: `1px solid ${c.border}`,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 11, color: c.textMuted }}>
                              {isExpanded ? "▼" : "▶"}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: c.text,
                              }}
                            >
                              {groupName}
                            </span>
                            <span style={{ fontSize: 11, color: c.textMuted }}>
                              (
                              {
                                filteredPerms.filter(
                                  (p) => permissions[roleKey]?.[p.id],
                                ).length
                              }
                              /{filteredPerms.length})
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={groupState === "all"}
                              indeterminate={groupState === "partial"}
                              onChange={() => toggleAllInGroup(filteredPerms)}
                              c={c}
                            />
                          </div>
                        </div>

                        {isExpanded
                          ? filteredPerms.map((perm) => (
                              <div
                                key={perm.id}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 72px",
                                  padding: "10px 12px 10px 28px",
                                  borderBottom: `1px solid ${c.border}`,
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: c.text,
                                    }}
                                  >
                                    {perm.label}
                                  </div>
                                  {perm.description ? (
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: c.textMuted,
                                        marginTop: 2,
                                      }}
                                    >
                                      {perm.description}
                                    </div>
                                  ) : null}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Checkbox
                                    checked={Boolean(
                                      permissions[roleKey]?.[perm.id],
                                    )}
                                    onChange={() => togglePermission(perm.id)}
                                    c={c}
                                  />
                                </div>
                              </div>
                            ))
                          : null}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="role-modal-footer"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          <div style={{ fontSize: 12, color: c.textMuted }}>
            <strong style={{ color: c.text }}>{selectedCount}</strong> permisos
            seleccionados
            {selectedIds.includes("p24") ? " · incluye p24" : ""}
          </div>
          <div className="role-modal-footer-actions">
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${c.border}`,
                background: "transparent",
                color: c.text,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: Colors.detailAppColor,
                color: "#fff",
                fontWeight: 700,
                cursor: isLoading ? "default" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkbox = ({
  checked,
  indeterminate,
  onChange,
  c,
}: {
  checked?: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  c: any;
}) => (
  <div
    onClick={onChange}
    style={{
      width: 20,
      height: 20,
      borderRadius: 5,
      background:
        checked || indeterminate ? Colors.detailAppColor : "transparent",
      border: `2px solid ${
        checked || indeterminate ? Colors.detailAppColor : c.border
      }`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
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

export default EditRolModal;
