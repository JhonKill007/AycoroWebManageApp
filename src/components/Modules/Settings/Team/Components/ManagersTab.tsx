import { useCallback, useEffect, useState } from "react";
import { ManagerModel } from "../../../../Models/Manager/ManagerModel";
import { ManagerParams } from "../../../../Models/Manager/ManagerParams";
import managerService from "../../../../Services/Manager/ManagerService";
import UserProfile from "../../../../assets/UserProfile.jpeg";
import { Colors } from "../../../../constants/Colors";
import { useToast } from "../../../../context/ToastContext";
import { useUserContext } from "../../../../context/UserContext";
import { Pagination } from "../../../Common/Components/Pagination";
import ActionAlert from "../../../Common/Modal/ActionAlert";
import { Badge } from "../../Common/Badge";
import { SectionTitle } from "../../Common/SectionTitle";
import { formatDate, getStatusColor, getStatusText } from "../../Common/Utils";
import AddManagerModal from "../Modals/AddManagerModal";
import EditManagerModal from "../Modals/EditManagerModal";

// ─── Tab: Equipo ───────────────────────────────────────────────────────
export const ManagersTab = ({ c, theme }: { c: any; theme: string }) => {
  const [showInvite, setShowInvite] = useState(false);

  const { showToast } = useToast();
  const { userData } = useUserContext();
  const [managers, setManagers] = useState<ManagerModel[]>([]);
  const [editing, setEditing] = useState<ManagerModel | null>(null);
  const [search, setSearch] = useState<string>("");
  const [searchDebounced, setSearchDebounced] = useState<string>("");
  const [deleteAlert, setDeleteAlert] = useState<{
    visible: boolean;
    managerId: string;
    managerName: string;
  }>({
    visible: false,
    managerId: "",
    managerName: "",
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

  // Cargar Managers con paginación y búsqueda
  const loadManagers = useCallback(async () => {
    setIsLoading(true);
    try {
      // itemsPerPage,
      const response = await managerService.getAll(page, searchDebounced);

      // CORRECCIÓN: Verificar la estructura de la respuesta
      // Si response.data es un array, usarlo directamente
      // Si response.data tiene una propiedad 'data' que es el array, usarlo
      // Si no, inicializar como array vacío
      let ManagersData: ManagerModel[] = [];
      let totalItemsCount = 0;
      let totalPagesCount = 1;

      if (response.data && Array.isArray(response.data.data)) {
        ManagersData = response.data.data;
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
        ManagersData = [];
        totalItemsCount = 0;
      }

      setManagers(ManagersData);
      setTotalPages(totalPagesCount);
      setTotalItems(totalItemsCount);
    } catch (error) {
      console.error("Error loading Managers:", error);
      setManagers([]);
      setTotalPages(1);
      setTotalItems(0);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los Managers",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, itemsPerPage, searchDebounced, showToast]);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  const toggleManagerStatus = useCallback(
    async (managersId: string, currentStatus: "active" | "inactive") => {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      // Verificar que roles es un array
      if (!Array.isArray(managers)) {
        await loadManagers();
        return;
      }

      // Optimistic update
      setManagers((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((r) =>
          r._id === managersId ? { ...r, Status: newStatus } : r,
        );
      });

      try {
        await managerService.updateStatus({
          _id: managersId,
          Name: undefined,
          Description: undefined,
          Status: newStatus,
          Permissions: undefined,
        });
        showToast({
          type: "success",
          title: "Estado actualizado",
          description: `El managers ahora está ${newStatus === "active" ? "activo" : "inactivo"}`,
          duration: 3000,
        });
      } catch (error) {
        // Revertir en caso de error
        setManagers((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.map((r) =>
            r._id === managersId ? { ...r, Status: currentStatus } : r,
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
    [managers, loadManagers, showToast],
  );

  // Crear manager
  const createManager = useCallback(
    async (model: ManagerParams) => {
      setIsLoading(true);
      try {
        await managerService.create(model);
        showToast({
          type: "success",
          title: "Mananger creado",
          description: `El manager "${model.Name}" ha sido creado correctamente`,
          duration: 3000,
        });
        setPage(1);
        setSearch("");
        setSearchDebounced("");
        await loadManagers();
      } catch (error) {
        console.error("Error creating manager:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo crear el manager",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadManagers, showToast],
  );

  // Actualizar rol
  const updateManager = useCallback(
    async (model: ManagerParams) => {
      setIsLoading(true);
      try {
        await managerService.update(model);
        showToast({
          type: "success",
          title: "Manager actualizado",
          description: `El manager "${model.Name}" ha sido actualizado correctamente`,
          duration: 3000,
        });
        await loadManagers();
      } catch (error) {
        console.error("Error updating managers:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el manager",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadManagers, showToast],
  );

  // Eliminar rol
  const deleteManager = useCallback(
    (managerId: string, managerName: string) => {
      setDeleteAlert({
        visible: true,
        managerId,
        managerName,
      });
    },
    [showToast],
  );

  // Confirmar eliminación
  const confirmDelete = useCallback(async () => {
    const { managerId, managerName } = deleteAlert;
    setIsDeleting(true);

    try {
      await managerService.delete(managerId);
      showToast({
        type: "success",
        title: "Rol eliminado",
        description: `El manager "${managerName}" ha sido eliminado correctamente`,
        duration: 3000,
      });

      const currentManager = Array.isArray(managers) ? managers : [];
      if (currentManager.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadManagers();
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
  }, [deleteAlert, loadManagers, page, managers, showToast]);

  const safemanagers = Array.isArray(managers) ? managers : [];

  return (
    <div>
      <SectionTitle
        title="Equipo de administración"
        sub="Gestiona quién tiene acceso al panel de Aycoro."
        c={c}
      />

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <span
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: c.textMuted,
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email..."
            style={{
              width: "100%",
              background: c.inputBackground,
              border: `1.5px solid ${c.inputBorder}`,
              borderRadius: 10,
              padding: "8px 14px 8px 36px",
              fontSize: 12,
              color: c.text,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 22,
            background: c.accent,
            color: "#fff",
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: "0 4px 16px rgba(107,115,240,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          ✉️ Agregar Manager
        </button>
      </div>

      {/* Lista */}
      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {/* Header tabla */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 110px 80px 90px",
            gap: 12,
            padding: "9px 20px",
            background:
              theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          {["Miembro", "Rol", "Estado", "Creado", "Acciones"].map((h) => (
            <div
              key={h}
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: c.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {managers.map((m) => {
          // const role = Managers[m.role as RoleKey] || Managers.soporte;

          const statusColor = getStatusColor(m?.Status || "inactive");
          // const isSelf = m.username === "admin";
          return (
            <div
              key={m._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 110px 80px 90px",
                gap: 12,
                padding: "12px 20px",
                borderBottom: `1px solid ${c.border}`,
                alignItems: "center",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = c.accentSoft)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* Miembro */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#fff",
                    boxShadow: "0 6px 20px rgba(107,115,240,0.4)",
                  }}
                >
                  <img
                    src={m.ProfilePhoto ? m.ProfilePhoto : UserProfile}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: m.ProfilePhoto
                        ? `2px solid ${Colors.detailAppColor}`
                        : undefined,
                    }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{ fontSize: 13, fontWeight: 700, color: c.text }}
                    >
                      {m.Name}
                    </span>
                    {userData?.user?.id === m.IdUser && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 10,
                          background: c.accentSoft,
                          color: c.accent,
                        }}
                      >
                        Tú
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: c.textMuted,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    @{m.Username} · {m.CreateDate}
                  </div>
                </div>
              </div>

              {/* Rol */}
              <Badge idRole={m.Role!} />

              {/* Estado */}
              <div
                onClick={() =>
                  toggleManagerStatus(
                    m?._id!,
                    m?.Status as "active" | "inactive",
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
                    {getStatusText(m.Status || "inactive")}
                  </span>
                </div>
              </div>
              
                {/* Creado */}
                <div style={{ fontSize: 11, color: c.textMuted }}>
                  {formatDate(`${m?.CreateDate}`)}
                  {m?.CreateBy && (
                    <div style={{ fontSize: 10, marginTop: 2 }}>
                      por {m.CreateBy}
                    </div>
                  )}
                </div>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={() => setEditing(m)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: `1.5px solid ${c.border}`,
                    background: "transparent",
                    color: c.textMuted,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  Editar
                </button>
                {userData?.user?.id !== m.IdUser &&
                  m.IdUser != "69791bd87914311820773ff6" && (
                    <button
                      onClick={() => deleteManager(m._id!, m.Name!)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: `1.5px solid ${c.danger}33`,
                        background: c.dangerSoft,
                        color: c.danger,
                        fontSize: 11,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer de tabla */}
      {/* ── Footer con paginación ── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        itemsPerPage={safemanagers.length}
        totalItems={totalItems}
        search={search}
        setPage={setPage}
        c={c}
        theme={theme}
      />

      {showInvite && (
        <AddManagerModal
          onClose={() => setShowInvite(false)}
          onSave={(m) => createManager(m)}
        />
      )}
      {editing && (
        <EditManagerModal
          manager={editing}
          onClose={() => setEditing(null)}
          onSave={(m) => updateManager(m)}
        />
      )}

      {/* Alert de eliminación */}
      <ActionAlert
        visible={deleteAlert.visible}
        title="Eliminar administrador"
        description={`¿Estás seguro de que deseas remover a "${deleteAlert.managerName}" como administrador el rol ?`}
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
