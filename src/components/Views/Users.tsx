// Users.tsx (optimizado - sin roles y con búsqueda en API)
import { useCallback, useEffect, useState } from "react";
import { Colors } from "../constants/Colors";
import { UserStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { UserPerfilModel } from "../Models/User/UserPerfilModel";
import { KpiCard } from "../Modules/Common/Components/bfdhjhg";
import { TabChip } from "../Modules/Common/Components/gffsag";
import { Pagination } from "../Modules/Common/Components/Pagination";
import UserListItem from "../Modules/Users/Components/UserListItem";
import userService from "../Services/User/UserService";

// ─── Configs ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  number,
  { label: string; emoji: string; color: string }
> = {
  [UserStatus.ACTIVE]: { label: "Activo", emoji: "🟢", color: "success" },
  [UserStatus.INACTIVE]: { label: "Inactivo", emoji: "⚫", color: "muted" },
  [UserStatus.SUSPENDED]: {
    label: "Suspendido",
    emoji: "🟡",
    color: "warning",
  },
  [UserStatus.BANNED]: { label: "Baneado", emoji: "🔴", color: "danger" },
  [UserStatus.DELETED]: { label: "Eliminado", emoji: "🗑️", color: "muted" },
};

// ─── Debounce helper ───────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ─── Componente principal ─────────────────────────────────────────────
const Users = () => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c: any = colors.colors;

  // Estados
  const [users, setUsers] = useState<UserPerfilModel[]>([]);
  const [counters, setCounters] = useState({
    Users: 0,
    Verified: 0,
    Active: 0,
    Deleted: 0,
    Inactive: 0,
    Suspended: 0,
    Banned: 0,
  });
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<number | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 10;

  // Debounce para búsqueda
  const debouncedSearch = useDebounce(search, 500);

  // Cargar usuarios desde la API
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await userService.GetUser(
        page,
        debouncedSearch,
        filterStatus!,
      );

      // Estructura de datos según el formato proporcionado
      const usersData = result.data?.data?.Users || result.data?.Users || [];
      const countersData =
        result.data?.data?.Counters || result.data?.Counters || {};
      const paginationData = result.data?.pagination || result.pagination || {};

      setUsers(usersData);
      setCounters({
        Users: countersData.Users || 0,
        Verified: countersData.Verified || 0,
        Active: countersData.Active || 0,
        Deleted: countersData.Deleted || 0,
        Inactive: countersData.Inactive || 0,
        Suspended: countersData.Suspended || 0,
        Banned: countersData.Banned || 0,
      });
      setTotalItems(paginationData.total || usersData.length || 0);
      setTotalPages(
        paginationData.totalPages ||
          Math.ceil((paginationData.total || 0) / itemsPerPage) ||
          1,
      );
    } catch (error) {
      console.error("Error loading users:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        duration: 4000,
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, filterStatus, itemsPerPage, showToast]);

  // Resetear página cuando cambia la búsqueda o el filtro de estado
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus]);

  // Cargar usuarios cuando cambia página, búsqueda o filtro de estado
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Cambiar estado del usuario
  const changeUserStatus = useCallback(
    async (id: string, status: number) => {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.User?._id === id
            ? {
                ...u,
                User: {
                  ...u.User,
                  Status: status,
                },
              }
            : u,
        ),
      );

      try {
        switch (status) {
          case UserStatus.ACTIVE:
            await userService.ReactiveUser(id);
            showToast({
              type: "success",
              title: "Usuario reactivado",
              description: "El usuario ha sido reactivado exitosamente",
              duration: 3000,
            });
            break;
          case UserStatus.SUSPENDED:
            await userService.SuspendUser(id);
            showToast({
              type: "success",
              title: "Usuario suspendido",
              description: "El usuario ha sido suspendido exitosamente",
              duration: 3000,
            });
            break;
          case UserStatus.BANNED:
            await userService.BannedUser(id);
            showToast({
              type: "success",
              title: "Usuario baneado",
              description: "El usuario ha sido baneado exitosamente",
              duration: 3000,
            });
            break;
          case UserStatus.INACTIVE:
          case UserStatus.DELETED:
            // Lógica para inactivar/eliminar si es necesario
            break;
        }
        await loadUsers(); // Recargar para sincronizar estadísticas
      } catch (error) {
        // Revertir en caso de error
        await loadUsers(); // Recargar datos frescos
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el estado del usuario",
          duration: 4000,
        });
      }
    },
    [loadUsers, showToast],
  );

  // Resetear filtros
  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterStatus(undefined);
    setPage(1);
  }, []);

  // Skeleton loader
  const SkeletonRow = () => (
    <div
      className="users-skeleton-row"
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr 100px 200px 80px 72px 80px 90px 100px",
        gap: "12px",
        padding: "12px 18px",
        borderBottom: `1px solid ${c.border}`,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: c.accentSoft,
        }}
      />
      <div>
        <div
          style={{
            width: "60%",
            height: 14,
            background: c.accentSoft,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <div
          style={{
            width: "40%",
            height: 10,
            background: c.accentSoft,
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          width: 80,
          height: 12,
          background: c.accentSoft,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          width: 100,
          height: 12,
          background: c.accentSoft,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          width: 40,
          height: 12,
          background: c.accentSoft,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          width: 50,
          height: 12,
          background: c.accentSoft,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          width: 60,
          height: 12,
          background: c.accentSoft,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          width: 50,
          height: 12,
          background: c.accentSoft,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          width: 70,
          height: 24,
          background: c.accentSoft,
          borderRadius: 12,
        }}
      />
    </div>
  );

  const statusOptions = [
    { value: UserStatus.ACTIVE, label: "🟢 Activos", color: "success" },
    { value: UserStatus.INACTIVE, label: "⚫ Inactivos", color: "muted" },
    { value: UserStatus.SUSPENDED, label: "🟡 Suspendidos", color: "warning" },
    { value: UserStatus.BANNED, label: "🔴 Baneados", color: "danger" },
    { value: UserStatus.DELETED, label: "🗑️ Eliminados", color: "muted" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .pill-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 22px;
          background: ${c.accent}; color: #fff; border: none;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(107,115,240,0.35);
          transition: opacity 0.15s, transform 0.15s;
        }
        .pill-cta:hover { opacity: 0.9; transform: translateY(-1px); }

        .search-input {
          background: ${c.inputBackground};
          border: 1.5px solid ${c.inputBorder};
          border-radius: 10px;
          padding: 8px 14px 8px 36px;
          font-size: 12px; color: ${c.text};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; width: 260px;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: ${c.textMuted}; }
        .search-input:focus { border-color: ${c.accent}; }

        .user-row {
          display: grid;
          grid-template-columns: 44px 1fr 100px 200px 80px 72px 80px 90px 100px;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid ${c.border};
          cursor: pointer;
          transition: background 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .user-row:last-child { border-bottom: none; }
        .user-row:hover { background: ${c.accentSoft}; }

        .select-filter {
          background: ${c.inputBackground};
          border: 1.5px solid ${c.inputBorder};
          border-radius: 9px;
          padding: 6px 10px;
          font-size: 11px; font-weight: 600; color: ${c.textMuted};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }
        .select-filter:focus { border-color: ${c.accent}; }
      `}</style>

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "26px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* ── Header banner ── */}
        <div
          className="responsive-page-banner"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1a1a30, #0f0f22)"
                : "linear-gradient(135deg, #ededff, #f5f0ff)",
            border: `1.5px solid ${c.accentMedium}`,
            borderRadius: "20px",
            padding: "22px 28px",
            marginBottom: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            boxShadow: "0 4px 24px rgba(107,115,240,0.09)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: c.text,
                marginBottom: "5px",
              }}
            >
              👥 Gestión de Usuarios
            </div>
            <div
              style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}
            >
              <strong style={{ color: c.accent }}>
                {counters.Users.toLocaleString()} usuarios
              </strong>{" "}
              registrados ·{" "}
              <strong style={{ color: c.success }}>
                {counters.Active.toLocaleString()} activos
              </strong>{" "}
              ·{" "}
              <strong style={{ color: c.danger }}>
                {counters.Banned.toLocaleString()} baneados
              </strong>
            </div>
          </div>
          <button
            className="pill-cta"
            onClick={() => window.open("/users/export", "_blank")}
          >
            Exportar usuarios →
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <KpiCard
            emoji="👥"
            label="Total usuarios"
            value={counters.Users}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="🟢"
            label="Activos"
            value={counters.Active}
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="✅"
            label="Verificados"
            value={counters.Verified}
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="🟡"
            label="Suspendidos"
            value={counters.Suspended}
            colorKey="warning"
            c={c}
          />
          <KpiCard
            emoji="🚫"
            label="Baneados"
            value={counters.Banned}
            colorKey="danger"
            c={c}
          />
          <KpiCard
            emoji="🗑️"
            label="Eliminados"
            value={counters.Deleted}
            colorKey="danger"
            c={c}
          />
        </div>

        {/* ── Tabla ── */}
        <div
          className="responsive-table-card users-table"
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 20px rgba(107,115,240,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1.5px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "13px",
                  color: c.textMuted,
                }}
              >
                🔍
              </span>
              <input
                className="search-input"
                placeholder="Buscar por nombre, email o ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: c.textMuted,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status filters */}
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {statusOptions.map((s) => (
                <TabChip
                  key={String(s.value)}
                  label={s.label}
                  active={filterStatus === s.value}
                  onClick={() => setFilterStatus(s.value as any)}
                  color={s.color}
                  c={c}
                />
              ))}
            </div>

            {/* Clear filters button */}
            {(search || filterStatus !== undefined) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: `1.5px solid ${c.danger}33`,
                  background: c.dangerSoft,
                  color: c.danger,
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {/* Table header */}
          <div
            className="users-table-header"
            style={{
              display: "grid",
              gridTemplateColumns:
                "44px 1fr 100px 200px 80px 72px 80px 90px 100px",
              gap: "12px",
              padding: "9px 18px",
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            {[
              "",
              "Usuario",
              "IP",
              "País",
              "Posts",
              "Seg.",
              "Creado",
              "Reportes",
              "Estado",
            ].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <>
              {[...Array(8)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </>
          )}

          {/* Data rows */}
          {!isLoading && users.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div
                style={{ fontSize: "36px", opacity: 0.3, marginBottom: "12px" }}
              >
                👤
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: c.textMuted,
                }}
              >
                {search
                  ? "No se encontraron usuarios con esa búsqueda"
                  : "No hay usuarios para mostrar"}
              </div>
              {search && (
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: "12px",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    background: c.accent,
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            !isLoading &&
            users.map((user: UserPerfilModel) => (
              <UserListItem
                key={user.User?._id}
                user={user}
                updateUser={changeUserStatus}
              />
            ))
          )}

          {/* Footer con paginación */}
          <div
            style={{ padding: "12px 18px", borderTop: `1px solid ${c.border}` }}
          >
            <Pagination
              page={page}
              totalPages={totalPages}
              itemsPerPage={users.length}
              totalItems={totalItems}
              search={search}
              setPage={setPage}
              c={c}
              theme={theme}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default Users;
