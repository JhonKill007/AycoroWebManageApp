import { useCallback, useEffect, useState } from "react";
import UserProfile from "../../../../assets/UserProfile.jpeg";
import { Colors } from "../../../../constants/Colors";
import { useThemeContext } from "../../../../context/ThemeContext";
import { useToast } from "../../../../context/ToastContext";
import { useUserContext } from "../../../../context/UserContext";
import { ManagerParams } from "../../../../Models/Manager/ManagerParams";
import { RoleModel } from "../../../../Models/Role/RoleModel";
import { UserModel } from "../../../../Models/User/UserModel";
import roleService from "../../../../Services/Role/RoleService";
import userService from "../../../../Services/User/UserService";
import AddUserCard from "../Card/AddUserCard";

// Componente Stepper
const Stepper = ({
  steps,
  currentStep,
  c,
}: {
  steps: string[];
  currentStep: number;
  c: any;
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((label, i) => {
        const stepNumber = i + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < steps.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: isCompleted
                    ? c.success
                    : isActive
                      ? c.accent
                      : "transparent",
                  border: `2px solid ${isCompleted ? c.success : isActive ? c.accent : c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: isCompleted || isActive ? "#fff" : c.textMuted,
                  transition: "all 0.25s",
                }}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: isActive
                    ? c.accent
                    : isCompleted
                      ? c.success
                      : c.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 14,
                  marginLeft: 4,
                  marginRight: 4,
                  background: currentStep > stepNumber ? c.success : c.border,
                  transition: "background 0.3s",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Componente UserSelectedCard
const UserSelectedCard = ({ user, c }: { user: UserModel; c: any }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      borderRadius: 14,
      background: c.accentSoft,
      border: `1.5px solid ${c.accentMedium}`,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
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
        src={user.ProfilePhoto || UserProfile}
        alt={user.Name}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
        {user.Name}
      </div>
      <div style={{ fontSize: 10, color: c.textMuted }}>@{user.Username}</div>
    </div>
    <span
      style={{
        marginLeft: "auto",
        fontSize: 10,
        fontWeight: 700,
        color: c.accent,
      }}
    >
      ✓ Seleccionado
    </span>
  </div>
);

// Componente RoleCard
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

// Componente SummaryCard
const SummaryCard = ({
  user,
  role,
  c,
  theme,
}: {
  user: UserModel;
  role: RoleModel;
  c: any;
  theme: string;
}) => (
  <div
    style={{
      background:
        theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
      border: `1.5px solid ${c.border}`,
      borderRadius: 16,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 20px",
        borderBottom: `1px solid ${c.border}`,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
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
          src={user.ProfilePhoto || UserProfile}
          alt={user.Name}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>
          {user.Name}
        </div>
        <div style={{ fontSize: 11, color: c.textMuted }}>
          @{user.Username} · {user.Email}
        </div>
      </div>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 20px",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: c.textMuted }}>
        Rol asignado
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          padding: "4px 12px",
          borderRadius: 20,
          background: "#6b73f018",
          color: "#6b73f0",
          border: `1px solid #6b73f033`,
        }}
      >
        {role?.Name}
      </span>
    </div>
  </div>
);

// Hook para debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

const AddManagerModal = ({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (m: ManagerParams) => void;
}) => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { userData } = useUserContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState<string>("");
  const [roleSearch, setRoleSearch] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserModel | undefined>(
    undefined,
  );
  const [selectedRole, setSelectedRole] = useState<RoleModel | undefined>(
    undefined,
  );
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<RoleModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedRoleSearch = useDebounce(roleSearch, 300);
  const STEP_LABELS = ["Buscar usuario", "Asignar rol", "Confirmar"];

  // Buscar usuarios con debounce
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchUsers(debouncedSearch);
    } else {
      setUsers([]);
    }
  }, [debouncedSearch]);

  // Cargar roles
  const loadRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const response = await roleService.getAll(1, roleSearch);
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
      setFilteredRoles(rolesData);
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([]);
      setFilteredRoles([]);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los roles",
        duration: 4000,
      });
    } finally {
      setIsLoadingRoles(false);
    }
  }, [debouncedRoleSearch, showToast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const searchUsers = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await userService.SearchUser(query, 1);
      const usersData = result?.data || result?.users || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = useCallback(() => {
    if (!selectedUser || !selectedRole) return;

    onSave({
      _id: undefined,
      IdUser: selectedUser._id,
      Status: "active",
      Name: selectedUser.Name,
      Username: selectedUser.Username,
      Email: selectedUser.Email,
      Role: selectedRole._id,
    });

    onClose();
  }, [selectedUser, selectedRole, onSave, onClose]);

  const handleSelectUser = useCallback((user: UserModel) => {
    setSelectedUser(user);
    setStep(2);
  }, []);

  const handleSelectRole = useCallback((role: RoleModel) => {
    setSelectedRole(role);
  }, []);

  const goToNextStep = useCallback(() => {
    if (step === 1 && selectedUser) setStep(2);
    if (step === 2 && selectedRole) setStep(3);
  }, [step, selectedUser, selectedRole]);

  const goToPrevStep = useCallback(() => {
    setStep((prev) => (prev - 1) as 1 | 2 | 3);
  }, []);

  const clearRoleSearch = useCallback(() => {
    setRoleSearch("");
    setFilteredRoles(roles);
  }, [roles]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.42)",
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
          borderRadius: 22,
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
          boxShadow: "0 28px 90px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 26px 16px",
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#1a1a30,#0f0f22)"
                : "linear-gradient(135deg,#ededff,#f5f0ff)",
            borderBottom: `1.5px solid ${c.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>
              👥 Agregar administrador
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: `1.5px solid ${c.border}`,
                background: c.card,
                cursor: "pointer",
                fontSize: 12,
                color: c.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
          <Stepper steps={STEP_LABELS} currentStep={step} c={c} />
        </div>

        {/* STEP 1: Buscar usuario */}
        {step === 1 && (
          <div
            style={{
              padding: "20px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  color: c.textMuted,
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, usuario o email..."
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
                onFocus={(e) => (e.target.style.borderColor = c.accent)}
                onBlur={(e) => (e.target.style.borderColor = c.inputBorder)}
              />
            </div>

            <div
              style={{
                maxHeight: 280,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    padding: "28px 0",
                    textAlign: "center",
                    fontSize: 12,
                    color: c.textMuted,
                  }}
                >
                  ⏳ Buscando usuarios...
                </div>
              ) : users.length === 0 && debouncedSearch ? (
                <div
                  style={{
                    padding: "28px 0",
                    textAlign: "center",
                    fontSize: 12,
                    color: c.textMuted,
                  }}
                >
                  😕 Sin resultados para "{debouncedSearch}"
                </div>
              ) : (
                users.map((user) => (
                  <AddUserCard
                    key={user._id}
                    user={user}
                    selected={selectedUser!}
                    setSelected={handleSelectUser}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Asignar rol */}
        {step === 2 && selectedUser && (
          <div
            style={{
              padding: "20px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <UserSelectedCard user={selectedUser} c={c} />

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: c.textMuted,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Asignar rol
              </div>

              {/* Input de búsqueda de roles */}
              <div style={{ position: "relative", marginBottom: 12 }}>
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
                    borderRadius: 10,
                    padding: "8px 12px 8px 34px",
                    fontSize: 12,
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
                      fontSize: 12,
                      padding: 0,
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
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {isLoadingRoles ? (
                  <div
                    style={{
                      gridColumn: "span 2",
                      padding: "28px 0",
                      textAlign: "center",
                      fontSize: 12,
                      color: c.textMuted,
                    }}
                  >
                    ⏳ Cargando roles...
                  </div>
                ) : filteredRoles.length === 0 && roleSearch ? (
                  <div
                    style={{
                      gridColumn: "span 2",
                      padding: "28px 0",
                      textAlign: "center",
                      fontSize: 12,
                      color: c.textMuted,
                    }}
                  >
                    😕 No se encontraron roles para "{roleSearch}"
                  </div>
                ) : filteredRoles.length === 0 ? (
                  <div
                    style={{
                      gridColumn: "span 2",
                      padding: "28px 0",
                      textAlign: "center",
                      fontSize: 12,
                      color: c.textMuted,
                    }}
                  >
                    🎭 No hay roles disponibles
                  </div>
                ) : (
                  filteredRoles.map((role) => (
                    <RoleCard
                      key={role._id}
                      role={role}
                      isSelected={selectedRole?._id === role._id}
                      onSelect={() => handleSelectRole(role)}
                      c={c}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmar */}
        {step === 3 && selectedUser && (
          <div
            style={{
              padding: "24px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: c.textMuted,
                textAlign: "center",
              }}
            >
              Revisa el resumen antes de confirmar
            </div>
            <SummaryCard
              user={selectedUser}
              role={selectedRole!}
              c={c}
              theme={theme}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
                fontSize: 11,
                color: c.textMuted,
              }}
            >
              <span>⚠️</span>
              <span>
                Se le notificará a{" "}
                <strong style={{ color: c.text }}>{selectedUser.Name}</strong>{" "}
                por correo que tiene acceso al panel de administración.
              </span>
            </div>
          </div>
        )}

        {/* Footer de navegación */}

        <div
          style={{
            padding: "14px 26px 22px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            gap: 10,
          }}
        >
          {step > 1 && (
            <button
              onClick={goToPrevStep}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 12,
                border: `1.5px solid ${c.border}`,
                background: "transparent",
                color: c.textMuted,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← Atrás
            </button>
          )}

          {(step === 1 || step === 2) && (
            <button
              onClick={goToNextStep}
              disabled={step === 1 ? !selectedUser : !selectedRole}
              style={{
                flex: 2,
                padding: "10px 18px",
                borderRadius: 12,
                background: (step === 1 ? selectedUser : selectedRole)
                  ? c.accent
                  : c.border,
                color: (step === 1 ? selectedUser : selectedRole)
                  ? "#fff"
                  : c.textMuted,
                border: "none",
                fontSize: 13,
                fontWeight: 800,
                cursor: (step === 1 ? selectedUser : selectedRole)
                  ? "pointer"
                  : "default",
                boxShadow: (step === 1 ? selectedUser : selectedRole)
                  ? "0 4px 16px rgba(107,115,240,0.35)"
                  : "none",
                transition: "all 0.2s",
              }}
            >
              Continuar →
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleConfirm}
              style={{
                flex: 2,
                padding: "10px 18px",
                borderRadius: 12,
                background: c.success,
                color: "#fff",
                border: "none",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(52,211,153,0.35)",
              }}
            >
              ✅ Confirmar y agregar
            </button>
          )}

          {step === 1 && (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 12,
                border: `1.5px solid ${c.border}`,
                background: "transparent",
                color: c.textMuted,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddManagerModal;
