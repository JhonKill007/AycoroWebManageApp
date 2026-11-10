import React, { useCallback, useMemo, useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { RoleParams } from "../../../../Models/Role/RoleParams";
import {
  ROLE_PERMISSIONS_CATALOG,
  countUniquePermissionIds,
  groupRolePermissionsByCategory,
  uniquePermissionPayload,
  type RolePermissionItem,
} from "../rolePermissionsCatalog";
import "../RoleModalLayout.css";

interface CreateRoleModalProps {
  c: any;
  theme: string;
  onClose: () => void;
  onSave: (model: RoleParams) => void;
}

const CreateRoleModal = ({
  c,
  theme,
  onClose,
  onSave,
}: CreateRoleModalProps) => {
  const [roleName, setRoleName] = useState("");
  const [roleNameError, setRoleNameError] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const groupedPermissions = useMemo(
    () => groupRolePermissionsByCategory(),
    [],
  );

  React.useEffect(() => {
    setExpandedGroups(new Set(Object.keys(groupedPermissions)));
  }, [groupedPermissions]);

  const selectedCount = countUniquePermissionIds(selectedPermissions);
  const selectedLabels = useMemo(
    () =>
      ROLE_PERMISSIONS_CATALOG.filter((perm) =>
        selectedPermissions.has(perm.id),
      ),
    [selectedPermissions],
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

  const togglePermission = useCallback((permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  }, []);

  const toggleGroup = useCallback(
    (permissionsList: RolePermissionItem[]) => {
      const ids = permissionsList.map((p) => p.id);
      const allSelected = ids.every((id) => selectedPermissions.has(id));
      setSelectedPermissions((prev) => {
        const next = new Set(prev);
        if (allSelected) ids.forEach((id) => next.delete(id));
        else ids.forEach((id) => next.add(id));
        return next;
      });
    },
    [selectedPermissions],
  );

  const toggleGroupExpand = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  }, []);

  const selectAllPermissions = useCallback(() => {
    if (selectedPermissions.size === ROLE_PERMISSIONS_CATALOG.length) {
      setSelectedPermissions(new Set());
    } else {
      setSelectedPermissions(
        new Set(ROLE_PERMISSIONS_CATALOG.map((p) => p.id)),
      );
    }
  }, [selectedPermissions]);

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
    const checkedCount = filteredList.filter((perm) =>
      selectedPermissions.has(perm.id),
    ).length;
    if (checkedCount === 0) return "none";
    if (checkedCount === filteredList.length) return "all";
    return "partial";
  };

  const handleSave = async () => {
    if (!validateRoleName(roleName)) return;
    if (description.length > 200) return;

    setIsLoading(true);
    try {
      const permissionsPayload = uniquePermissionPayload(selectedPermissions);
      onSave({
        _id: undefined,
        Name: roleName.trim(),
        Description: description.trim(),
        Status: status,
        Permissions: permissionsPayload,
      });
      onClose();
    } catch (error) {
      console.error("Error creating role:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
              Crear rol
            </h2>
            <p
              style={{
                fontSize: 13,
                color: c.textMuted,
                margin: "4px 0 0",
              }}
            >
              Define la información del rol y asigna permisos en un solo paso
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
                autoFocus
                placeholder="Ej: Administrador, Editor..."
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
                <div
                  style={{ marginTop: 6, fontSize: 12, color: "#dc3545" }}
                >
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
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="Responsabilidades y alcance del rol..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${c.border}`,
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
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
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
                    checked={status === "inactive"}
                    onChange={() => setStatus("inactive")}
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
                    <div
                      key={perm.id}
                      style={{ fontSize: 11, color: c.text }}
                    >
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
                <div
                  style={{ marginTop: 8, fontSize: 12, color: c.textMuted }}
                >
                  Ningún permiso seleccionado
                </div>
              )}
            </div>
          </div>

          <div
            className="role-modal-right"
            style={{ borderLeft: `1px solid transparent` }}
          >
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
                onClick={selectAllPermissions}
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
                {selectedPermissions.size === ROLE_PERMISSIONS_CATALOG.length
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
                            <span
                              style={{ fontSize: 11, color: c.textMuted }}
                            >
                              (
                              {
                                filteredPerms.filter((p) =>
                                  selectedPermissions.has(p.id),
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
                              onChange={() => toggleGroup(filteredPerms)}
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
                                    checked={selectedPermissions.has(perm.id)}
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
            {selectedPermissions.has("p24") ? " · incluye p24" : ""}
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

export default CreateRoleModal;
