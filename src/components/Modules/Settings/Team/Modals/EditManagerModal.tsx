import { useCallback, useEffect, useState } from "react";
import UserProfile from "../../../../assets/UserProfile.jpeg";
import { Colors } from "../../../../constants/Colors";
import { useThemeContext } from "../../../../context/ThemeContext";
import { useToast } from "../../../../context/ToastContext";
import { ManagerModel } from "../../../../Models/Manager/ManagerModel";
import { ManagerParams } from "../../../../Models/Manager/ManagerParams";
import { RoleModel } from "../../../../Models/Role/RoleModel";
import roleService from "../../../../Services/Role/RoleService";

// Hook para debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// Componente RoleCard para selección
const RoleCard = ({
  role,
  isSelected,
  onSelect,
  c,
}: {
  role: RoleModel;
  isSelected: boolean;
  onSelect: () => void;
  c: any;
}) => (
  <div
    onClick={onSelect}
    style={{
      padding: "12px 14px",
      borderRadius: 12,
      cursor: "pointer",
      border: `1.5px solid ${isSelected ? "#6b73f066" : c.border}`,
      background: isSelected ? "#6b73f015" : "transparent",
      transition: "all 0.15s",
    }}
  >
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: isSelected ? "#6b73f0" : c.text,
        }}
      >
        {role.Name}
      </span>
      {isSelected && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 9,
            fontWeight: 800,
            color: "#6b73f0",
          }}
        >
          ✓
        </span>
      )}
    </div>
    <div style={{ fontSize: 10, color: c.textMuted, lineHeight: 1.4 }}>
      {role.Description}
    </div>
  </div>
);

const EditManagerModal = ({
  manager,
  onClose,
  onSave,
}: {
  manager: ManagerModel;
  onClose: () => void;
  onSave: (model: ManagerParams) => void;
}) => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [selectedRole, setSelectedRole] = useState<RoleModel | undefined>();
  const [isActive, setIsActive] = useState<boolean>(
    manager?.Status === "active",
  );
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [roleSearch, setRoleSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedRoleSearch = useDebounce(roleSearch, 300);

  // Cargar roles
  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await roleService.getAll(1, debouncedRoleSearch);
      let rolesData: RoleModel[] = [];

      if (response.data && Array.isArray(response.data.data)) {
        rolesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (response.data && Array.isArray(response.data.roles)) {
        rolesData = response.data.roles;
      } else {
        rolesData = [];
      }

      setRoles(rolesData);
      const result = rolesData.find((x) => x._id === manager.Role);
      setSelectedRole(result);
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([]);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los roles",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedRoleSearch, manager.Role, showToast]);

  useEffect(() => {
    loadRoles();
    setIsActive(manager?.Status === "active");
    setRoleSearch("");
  }, [loadRoles, manager]);

  const handleSave = useCallback(async () => {
    if (!manager || !selectedRole) {
      showToast({
        type: "warning",
        title: "Datos incompletos",
        description: "Selecciona un rol para continuar",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      onSave({
        _id: manager._id,
        IdUser: manager.IdUser,
        Name: manager.Name,
        Username: manager.Username,
        Email: manager.Email,
        Status: isActive ? "active" : "inactive",
        Role: selectedRole._id,
      });
      onClose();
    } catch (error) {
      console.error("Error saving manager:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron guardar los cambios",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [manager, selectedRole, isActive, onSave, onClose, showToast]);

  const clearRoleSearch = useCallback(() => {
    setRoleSearch("");
  }, [roles]);

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
        backdropFilter: "blur(6px)",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
          boxShadow: "0 28px 90px rgba(0,0,0,0.35)",
          animation: "scaleIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#1a1a30,#0f0f22)"
                : "linear-gradient(135deg,#ededff,#f5f0ff)",
            borderBottom: `1.5px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.text }}>
              ✏️ Editar administrador
            </div>
            <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
              {manager?.Name} · @{manager?.Username}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.card,
              cursor: "pointer",
              fontSize: 14,
              color: c.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = c.accentSoft;
              e.currentTarget.style.color = c.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = c.card;
              e.currentTarget.style.color = c.textMuted;
            }}
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: "24px" }}>
          {/* Información del usuario */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px",
              borderRadius: 16,
              background: c.accentSoft,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: `${Colors.detailAppColor}22`,
                border: `2px solid ${Colors.detailAppColor}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              <img
                src={manager?.ProfilePhoto || UserProfile}
                alt={manager?.Name}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>
                {manager?.Name}
              </div>
              <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                @{manager?.Username} · {manager?.Email}
              </div>
            </div>
          </div>

          {/* Switch de estado - Activo/Inactivo */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.textMuted,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Estado de administrador
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                borderRadius: 16,
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                border: `1px solid ${c.border}`,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>
                  {isActive ? "Activo" : "Inactivo"}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                  {isActive
                    ? "El usuario tiene acceso al panel de administración"
                    : "El usuario no podrá acceder al panel de administración"}
                </div>
              </div>

              {/* Switch personalizado */}
              <div
                onClick={() => setIsActive(!isActive)}
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
                    transform: isActive ? "translateX(24px)" : "translateX(0)",
                    transition: "transform 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Selector de rol */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.textMuted,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Rol asignado
            </div>

            {/* Búsqueda de roles */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  color: c.textMuted,
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Buscar rol por nombre..."
                style={{
                  width: "100%",
                  background: c.inputBackground,
                  border: `1.5px solid ${c.inputBorder}`,
                  borderRadius: 12,
                  padding: "10px 12px 10px 34px",
                  fontSize: 13,
                  color: c.text,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = c.accent)}
                onBlur={(e) => (e.target.style.borderColor = c.inputBorder)}
              />
              {roleSearch && (
                <button
                  onClick={clearRoleSearch}
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

            {/* Lista de roles */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                maxHeight: 280,
                overflowY: "auto",
                padding: "2px",
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    gridColumn: "span 2",
                    padding: "40px 0",
                    textAlign: "center",
                    fontSize: 12,
                    color: c.textMuted,
                  }}
                >
                  ⏳ Cargando roles...
                </div>
              ) : roles.length === 0 && roleSearch ? (
                <div
                  style={{
                    gridColumn: "span 2",
                    padding: "40px 0",
                    textAlign: "center",
                    fontSize: 12,
                    color: c.textMuted,
                  }}
                >
                  😕 No se encontraron roles para "{roleSearch}"
                </div>
              ) : roles.length === 0 ? (
                <div
                  style={{
                    gridColumn: "span 2",
                    padding: "40px 0",
                    textAlign: "center",
                    fontSize: 12,
                    color: c.textMuted,
                  }}
                >
                  🎭 No hay roles disponibles
                </div>
              ) : (
                roles.map((role) => (
                  <RoleCard
                    key={role._id}
                    role={role}
                    isSelected={selectedRole?._id === role._id}
                    onSelect={() => setSelectedRole(role)}
                    c={c}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            background:
              theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
          }}
        >
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: "10px 20px",
              borderRadius: 40,
              fontSize: 13,
              fontWeight: 600,
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.text,
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.background = c.accentSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedRole}
            style={{
              padding: "10px 24px",
              borderRadius: 40,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background:
                !selectedRole || isSaving ? "#999" : Colors.detailAppColor,
              color: "white",
              cursor: !selectedRole || isSaving ? "not-allowed" : "pointer",
              opacity: !selectedRole || isSaving ? 0.6 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              if (!isSaving && selectedRole) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "scale(0.98)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isSaving ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Guardando...
              </>
            ) : (
              "💾 Guardar cambios"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default EditManagerModal;
