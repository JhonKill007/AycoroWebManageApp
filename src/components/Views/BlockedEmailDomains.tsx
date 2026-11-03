import { useCallback, useEffect, useMemo, useState } from "react";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import { BlockedEmailDomainModel } from "../Models/Security/BlockedEmailDomainModel";
import { Pagination } from "../Modules/Common/Components/Pagination";
import { formatDate } from "../Modules/Settings/Common/Utils";
import BlockedEmailDomainFormModal from "../Modules/Security/BlockedEmailDomains/Modals/BlockedEmailDomainFormModal";
import blockedEmailDomainService from "../Services/Security/BlockedEmailDomainService";
import { mapBlockedEmailDomainError } from "../utils/blockedEmailDomainValidation";

const PAGE_SIZE = 10;

const BlockedEmailDomains = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const { showToast } = useToast();
  const { can } = usePermissions();
  const canManage = can(Permissions.MANAGE_SETTINGS);

  const [rows, setRows] = useState<BlockedEmailDomainModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlockedEmailDomainModel | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search.trim().toLowerCase());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blockedEmailDomainService.list(false);
      setRows(data);
    } catch (error) {
      setRows([]);
      showToast({
        type: "error",
        title: "Error",
        description: mapBlockedEmailDomainError(error),
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (statusFilter === "active") list = list.filter((r) => r.isActive);
    if (statusFilter === "inactive") list = list.filter((r) => !r.isActive);
    if (searchDebounced) {
      list = list.filter(
        (r) =>
          r.domain.toLowerCase().includes(searchDebounced) ||
          r.reason.toLowerCase().includes(searchDebounced),
      );
    }
    return list;
  }, [rows, statusFilter, searchDebounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE,
  );

  const openCreate = () => {
    if (!canManage) return;
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (row: BlockedEmailDomainModel) => {
    if (!canManage) return;
    setEditing(row);
    setShowForm(true);
  };

  const handleSave = async (values: {
    domain: string;
    reason: string;
    includeSubdomains: boolean;
    isActive: boolean;
  }) => {
    try {
      if (editing) {
        await blockedEmailDomainService.update(editing.id, values);
        showToast({
          type: "success",
          title: "Regla actualizada",
          description: `Se guardaron los cambios de ${values.domain}`,
          duration: 3000,
        });
      } else {
        await blockedEmailDomainService.create(values);
        showToast({
          type: "success",
          title: "Dominio agregado",
          description: `${values.domain} se añadió a la lista`,
          duration: 3000,
        });
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (error) {
      const message = mapBlockedEmailDomainError(error);
      showToast({
        type: "error",
        title: "No se pudo guardar",
        description: message,
        duration: 4000,
      });
      throw new Error(message);
    }
  };

  const toggleActive = async (row: BlockedEmailDomainModel) => {
    if (!canManage || busyId) return;
    const nextActive = !row.isActive;
    const confirmed = window.confirm(
      nextActive
        ? `¿Bloquear el dominio ${row.domain}? No podrá usarse en nuevos registros ni cambios de correo.`
        : `¿Desactivar el bloqueo de ${row.domain}? El historial se conserva.`,
    );
    if (!confirmed) return;

    setBusyId(row.id);
    try {
      const updated = nextActive
        ? await blockedEmailDomainService.activate(row.id)
        : await blockedEmailDomainService.deactivate(row.id);
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      showToast({
        type: "success",
        title: nextActive ? "Dominio bloqueado" : "Bloqueo desactivado",
        description: nextActive
          ? "El dominio se ha bloqueado correctamente."
          : "El dominio ya no está bloqueado.",
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: mapBlockedEmailDomainError(error),
        duration: 4000,
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .bed-row:hover { background: ${c.accentSoft}; }
        @media (max-width: 900px) {
          .bed-grid { grid-template-columns: 1fr !important; }
          .bed-table-head { display: none !important; }
          .bed-row {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
        }
      `}</style>
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "26px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          className="responsive-page-banner"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)"
                : "linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%)",
            borderRadius: 20,
            padding: "22px 24px",
            border: `1.5px solid ${c.border}`,
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: c.text }}>
            Dominios bloqueados
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: c.textMuted,
              maxWidth: 720,
              lineHeight: 1.5,
            }}
          >
            Administra los dominios de correo que no pueden utilizarse para
            registrar cuentas o cambiar direcciones de correo en Aycoro.
          </div>
        </div>

        <div
          style={{
            background: c.accentSoft,
            border: `1.5px solid ${c.border}`,
            borderRadius: 14,
            padding: "12px 14px",
            fontSize: 12,
            color: c.textMuted,
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          Los dominios bloqueados no podrán utilizarse en nuevos registros ni
          cambios de correo. Las cuentas existentes no serán suspendidas
          automáticamente. Los subdominios solo se bloquean cuando la regla lo
          indica de forma explícita.
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 14,
            alignItems: "center",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar dominio o motivo…"
            style={{
              flex: "1 1 220px",
              minWidth: 180,
              borderRadius: 12,
              border: `1.5px solid ${c.border}`,
              background: c.card,
              color: c.text,
              padding: "10px 12px",
              fontSize: 13,
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            style={{
              borderRadius: 12,
              border: `1.5px solid ${c.border}`,
              background: c.card,
              color: c.text,
              padding: "10px 12px",
              fontSize: 13,
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button
            type="button"
            onClick={openCreate}
            disabled={!canManage}
            style={{
              borderRadius: 12,
              border: "none",
              background: canManage ? c.accent : c.border,
              color: "#fff",
              padding: "10px 16px",
              fontWeight: 700,
              cursor: canManage ? "pointer" : "not-allowed",
              opacity: canManage ? 1 : 0.6,
            }}
          >
            + Agregar dominio
          </button>
        </div>

        <div
          style={{
            background: c.card,
            borderRadius: 16,
            border: `1.5px solid ${c.border}`,
            overflow: "hidden",
          }}
        >
          <div
            className="bed-table-head"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.7fr 0.9fr 1.4fr 0.9fr 0.9fr 1fr",
              gap: 10,
              padding: "12px 18px",
              borderBottom: `1px solid ${c.border}`,
              fontSize: 11,
              fontWeight: 700,
              color: c.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            <span>Dominio</span>
            <span>Estado</span>
            <span>Subdominios</span>
            <span>Motivo</span>
            <span>Creado</span>
            <span>Responsable</span>
            <span>Acciones</span>
          </div>

          {loading && (
            <div style={{ padding: 28, color: c.textMuted, fontSize: 13 }}>
              Cargando dominios…
            </div>
          )}

          {!loading && pageRows.length === 0 && (
            <div style={{ padding: 36, textAlign: "center", color: c.textMuted }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              <div style={{ fontWeight: 700, color: c.text, marginBottom: 4 }}>
                No hay dominios
              </div>
              <div style={{ fontSize: 13 }}>
                {searchDebounced || statusFilter !== "all"
                  ? "Ninguna regla coincide con los filtros."
                  : "Agrega el primer dominio bloqueado para empezar."}
              </div>
            </div>
          )}

          {!loading &&
            pageRows.map((row) => (
              <div
                key={row.id}
                className="bed-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.7fr 0.9fr 1.4fr 0.9fr 0.9fr 1fr",
                  gap: 10,
                  padding: "14px 18px",
                  borderBottom: `1px solid ${c.border}`,
                  alignItems: "center",
                  fontSize: 13,
                  color: c.text,
                }}
              >
                <div style={{ fontWeight: 700 }}>{row.domain}</div>
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      background: row.isActive ? "#d1fae5" : "#f3f4f6",
                      color: row.isActive ? "#047857" : "#6b7280",
                    }}
                  >
                    {row.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div style={{ color: c.textMuted, fontSize: 12 }}>
                  {row.includeSubdomains ? "Incluidos" : "No incluidos"}
                </div>
                <div
                  style={{
                    color: c.textMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={row.reason}
                >
                  {row.reason || "—"}
                </div>
                <div style={{ color: c.textMuted, fontSize: 12 }}>
                  {row.createDate ? formatDate(row.createDate) : "—"}
                </div>
                <div
                  style={{
                    color: c.textMuted,
                    fontSize: 11,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={row.updatedBy || row.createdBy || ""}
                >
                  {row.updatedBy || row.createdBy || "—"}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    disabled={!canManage}
                    style={{
                      borderRadius: 8,
                      border: `1.5px solid ${c.border}`,
                      background: "transparent",
                      color: c.text,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: canManage ? "pointer" : "not-allowed",
                      opacity: canManage ? 1 : 0.5,
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(row)}
                    disabled={!canManage || busyId === row.id}
                    style={{
                      borderRadius: 8,
                      border: "none",
                      background: row.isActive ? "#fee2e2" : "#d1fae5",
                      color: row.isActive ? "#b91c1c" : "#047857",
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: canManage ? "pointer" : "not-allowed",
                      opacity: canManage ? 1 : 0.5,
                    }}
                  >
                    {busyId === row.id
                      ? "…"
                      : row.isActive
                        ? "Desactivar"
                        : "Activar"}
                  </button>
                </div>
              </div>
            ))}

          {!loading && filtered.length > 0 && (
            <Pagination
              page={pageSafe}
              totalPages={totalPages}
              itemsPerPage={PAGE_SIZE}
              totalItems={filtered.length}
              search={searchDebounced}
              setPage={setPage}
              c={c}
              theme={theme}
            />
          )}
        </div>
      </main>

      {showForm && canManage && (
        <BlockedEmailDomainFormModal
          c={c}
          theme={theme}
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default BlockedEmailDomains;
