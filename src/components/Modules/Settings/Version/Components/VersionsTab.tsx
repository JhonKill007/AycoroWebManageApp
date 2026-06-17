// VersionsTab.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { useToast } from "../../../../context/ToastContext";
import { VersionModel } from "../../../../Models/Version/VerisonModel";
import { VersionParams } from "../../../../Models/Version/VersionParams";
import versionService from "../../../../Services/Version/VersionService";
import { Pagination } from "../../../Common/Components/Pagination";
import { formatDate } from "../../Common/Utils";
import AddVersionModal from "../Modals/AddVersionModal";

// ─── Configuraciones ───────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  High: { label: "Alta", color: "#dc2626", bg: "#fee2e2", icon: "🔴" },
  Medium: { label: "Media", color: "#ea580c", bg: "#fed7aa", icon: "🟠" },
  Low: { label: "Baja", color: "#2563eb", bg: "#dbeafe", icon: "🔵" },
};

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  ios: {
    // value: "ios",
    label: "iOS",
    icon: "🍎",
    color: "#8b5cf6",
    bg: "#ede9fe",
  },
  android: {
    // value: "android",
    label: "Android",
    icon: "🤖",
    color: "#10b981",
    bg: "#d1fae5",
  },
};

const STATUS_CONFIG: Record<
  number,
  { label: string; color: string; bg: string; dot: string }
> = {
  0: { label: "Pendiente", color: "#6b7280", bg: "#f3f4f6", dot: "🕒" },
  1: { label: "Publicada", color: "#10b981", bg: "#d1fae5", dot: "✅" },
};

// ─── Componente de skeleton loading ───────────────────────────────────
const TableSkeleton = ({ rows = 5, c }: { rows?: number; c: any }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 120px 100px 100px 120px 100px",
            gap: 12,
            padding: "14px 20px",
            borderBottom: `1px solid ${c.border}`,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "16px",
              background: c.accentSoft,
              borderRadius: "4px",
            }}
          />
          <div>
            <div
              style={{
                width: "70%",
                height: "16px",
                background: c.accentSoft,
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "90%",
                height: "12px",
                background: c.accentSoft,
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{
              width: "70px",
              height: "24px",
              background: c.accentSoft,
              borderRadius: "12px",
            }}
          />
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
              width: "40px",
              height: "24px",
              background: c.accentSoft,
              borderRadius: "12px",
            }}
          />
          <div
            style={{
              width: "80px",
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

// ─── Componente principal ─────────────────────────────────────────────
const VersionsTab = ({ c, theme }: { c: any; theme: string }) => {
  const { showToast } = useToast();
  const [versions, setVersions] = useState<VersionModel[]>([]);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [editingVersion, setEditingVersion] = useState<VersionModel | null>(
    null,
  );
  const [search, setSearch] = useState<string>("");
  const [searchDebounced, setSearchDebounced] = useState<string>("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteAlert, setDeleteAlert] = useState<{
    visible: boolean;
    versionId: string;
    versionValue: string;
  }>({
    visible: false,
    versionId: "",
    versionValue: "",
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [publishingVersionId, setPublishingVersionId] = useState<string | null>(
    null,
  );

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

  // Cargar versiones
  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await versionService.getAll(page, searchDebounced);
      console.log(response.data.data);

      let versionsData: VersionModel[] = [];
      let totalItemsCount = 0;
      let totalPagesCount = 1;

      if (response.data && Array.isArray(response.data.data)) {
        versionsData = response.data.data;
        totalItemsCount =
          response.data.pagination?.total || response.data.data.length;
        totalPagesCount =
          response.data.pagination?.totalPages ||
          Math.ceil(totalItemsCount / itemsPerPage);
      } else if (Array.isArray(response.data)) {
        versionsData = response.data;
        totalItemsCount = response.data.length;
        totalPagesCount = Math.ceil(totalItemsCount / itemsPerPage);
      } else {
        versionsData = [];
        totalItemsCount = 0;
      }

      setVersions(versionsData);
      setTotalPages(totalPagesCount);
      setTotalItems(totalItemsCount);
    } catch (error) {
      console.error("Error loading versions:", error);
      setVersions([]);
      setTotalPages(1);
      setTotalItems(0);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar las versiones",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, itemsPerPage, searchDebounced, showToast]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // Estadísticas
  const stats = useMemo(() => {
    const versionsArray = Array.isArray(versions) ? versions : [];
    return {
      total: totalItems,
      published: versionsArray.filter((v) => v.Status === 1).length,
      draft: versionsArray.filter((v) => v.Status === 0).length,
      High: versionsArray.filter((v) => v.Severity === "High").length,
    };
  }, [versions, totalItems]);

  // Filtrar versiones
  const filteredVersions = useMemo(() => {
    let filtered = Array.isArray(versions) ? [...versions] : [];

    if (filterSeverity !== "all") {
      filtered = filtered.filter((v) => v.Severity === filterSeverity);
    }
    if (filterType !== "all") {
      filtered = filtered.filter((v) => v.Type === filterType);
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((v) => v.Status === parseInt(filterStatus));
    }

    return filtered;
  }, [versions, filterSeverity, filterType, filterStatus]);

  // Cambiar estado de la versión
  const toggleVersionStatus = useCallback(
    async (versionId: string, currentStatus: number) => {
      const newStatus = currentStatus === 1 ? 2 : 1; // Publicada -> Archivada, Borrador -> Publicada

      setVersions((prev) =>
        prev.map((v) =>
          v._id === versionId ? { ...v, Status: newStatus } : v,
        ),
      );

      try {
        // await versionService.updateStatus(versionId, newStatus);
        showToast({
          type: "success",
          title: "Estado actualizado",
          description: `La versión ahora está ${newStatus === 1 ? "publicada" : "pendiente"}`,
          duration: 3000,
        });
        await loadVersions();
      } catch (error) {
        setVersions((prev) =>
          prev.map((v) =>
            v._id === versionId ? { ...v, Status: currentStatus } : v,
          ),
        );
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el estado de la versión",
          duration: 4000,
        });
      }
    },
    [loadVersions, showToast],
  );

  // Crear versión
  const createVersion = useCallback(
    async (model: VersionParams) => {
      setIsLoading(true);
      try {
        await versionService.create(model);
        showToast({
          type: "success",
          title: "Versión creada",
          description: `La versión "${model.Value}" ha sido creada correctamente`,
          duration: 3000,
        });
        setPage(1);
        setSearch("");
        setSearchDebounced("");
        await loadVersions();
        setShowCreateVersion(false);
      } catch (error) {
        console.error("Error creating version:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo crear la versión",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadVersions, showToast],
  );

  // Eliminar versión
  const publishVersion = useCallback(
    async (versionId: string, versionValue?: string) => {
      setPublishingVersionId(versionId);
      try {
        await versionService.publish(versionId);
        showToast({
          type: "success",
          title: "Version publicada",
          description: `La version "${versionValue || versionId}" fue publicada correctamente`,
          duration: 3000,
        });
        await loadVersions();
      } catch (error) {
        console.error("Error publishing version:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo publicar la version",
          duration: 4000,
        });
      } finally {
        setPublishingVersionId(null);
      }
    },
    [loadVersions, showToast],
  );

  const deleteVersion = useCallback(
    (versionId: string, versionValue: string) => {
      setDeleteAlert({
        visible: true,
        versionId,
        versionValue,
      });
    },
    [],
  );

  // Resetear filtros
  const clearFilters = useCallback(() => {
    setSearch("");
    setSearchDebounced("");
    setFilterSeverity("all");
    setFilterType("all");
    setFilterStatus("all");
    setPage(1);
  }, []);

  const safeVersions = Array.isArray(filteredVersions) ? filteredVersions : [];

  // Componente de filtro chip
  const FilterChip = ({ label, active, onClick, color }: any) => (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        border: `1.5px solid ${active ? color || Colors.detailAppColor : c.border}`,
        background: active
          ? `${color || Colors.detailAppColor}15`
          : "transparent",
        color: active ? color || Colors.detailAppColor : c.textMuted,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

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
          📦 Gestión de versiones
        </h2>
        <p style={{ fontSize: "13px", color: c.textMuted }}>
          Administra las versiones del sistema, novedades y cambios importantes.
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
            Total versiones
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
            Publicadas
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: c.success }}>
            {stats.published}
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
            Pendiente
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: c.warning }}>
            {stats.draft}
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
            Highs
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: c.danger }}>
            {stats.High}
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
            placeholder="Buscar por versión o descripción..."
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
              onClick={clearFilters}
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.inputBackground,
              color: c.text,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">🔘 Todas las severidades</option>
            {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.icon} {cfg.label}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.inputBackground,
              color: c.text,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">📋 Todos los tipos</option>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.icon} {cfg.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.inputBackground,
              color: c.text,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">📄 Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.dot} {cfg.label}
              </option>
            ))}
          </select>

          {(filterSeverity !== "all" ||
            filterType !== "all" ||
            filterStatus !== "all") && (
            <button
              onClick={clearFilters}
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                border: `1.5px solid ${c.border}`,
                background: "transparent",
                color: c.textMuted,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <button
          onClick={() => setShowCreateVersion(true)}
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
          + Nueva versión
        </button>
      </div>

      {/* Filtros rápidos (chips) */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <FilterChip
          label="🕒 Pendiente"
          active={filterStatus === "0"}
          onClick={() => setFilterStatus(filterStatus === "0" ? "all" : "0")}
          color={STATUS_CONFIG[0].color}
        />
        <FilterChip
          label="✅ Publicada"
          active={filterStatus === "1"}
          onClick={() => setFilterStatus(filterStatus === "1" ? "all" : "1")}
          color={STATUS_CONFIG[1].color}
        />
        <FilterChip
          label="🔴 High"
          active={filterSeverity === "High"}
          onClick={() =>
            setFilterSeverity(filterSeverity === "High" ? "all" : "High")
          }
          color={SEVERITY_CONFIG.High.color}
        />
        <FilterChip
          label="🍎 iOS"
          active={filterType === "ios"}
          onClick={() => setFilterType(filterType === "ios" ? "all" : "ios")}
          color={TYPE_CONFIG.ios.color}
        />
        <FilterChip
          label="🤖 Android"
          active={filterType === "android"}
          onClick={() =>
            setFilterType(filterType === "android" ? "all" : "android")
          }
          color={TYPE_CONFIG.android.color}
        />
      </div>

      {/* Tabla de versiones */}
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
            gridTemplateColumns: "100px 1fr 120px 100px 100px 120px 100px",
            gap: 12,
            padding: "14px 20px",
            background:
              theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          {[
            "Versión",
            "Descripción",
            "Tipo",
            "Severidad",
            "Estado",
            "Creado",
            "Accion",
          ].map((header) => (
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
        {isLoading && safeVersions.length === 0 ? (
          <TableSkeleton rows={5} c={c} />
        ) : safeVersions.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              color: c.textMuted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              No se encontraron versiones
            </div>
            <div style={{ fontSize: 12 }}>
              {search ||
              filterSeverity !== "all" ||
              filterType !== "all" ||
              filterStatus !== "all"
                ? "Intenta con otros filtros de búsqueda"
                : "Crea tu primera versión para comenzar"}
            </div>
          </div>
        ) : (
          safeVersions.map((version) => {
            const severity = version.Severity || "Medium";
            const type = version.Type || "ios";
            const status = Number(version.Status ?? 0);

            const severityCfg =
              SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;

            const typeCfg = TYPE_CONFIG[type] || TYPE_CONFIG.ios;

            const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG[0];

            return (
              <div
                key={version._id || Math.random()}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "100px 1fr 120px 100px 100px 120px 100px",
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
                {/* Versión */}
                <div>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: c.text,
                      fontFamily: "monospace",
                    }}
                  >
                    {version.Value || "v1.0.0"}
                  </span>
                  {version.Link && (
                    <a
                      href={version.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        fontSize: 10,
                        color: Colors.detailAppColor,
                        textDecoration: "none",
                        marginTop: 4,
                      }}
                    >
                      🔗 Ver release
                    </a>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: c.text,
                      lineHeight: 1.4,
                    }}
                  >
                    {version.Description || "Sin descripción"}
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: typeCfg.bg,
                      color: typeCfg.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {typeCfg.icon} {typeCfg.label}
                  </span>
                </div>

                {/* Severidad */}
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: severityCfg.bg,
                      color: severityCfg.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {severityCfg.icon} {severityCfg.label}
                  </span>
                </div>

                {/* Estado */}
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: statusCfg.bg,
                      color: statusCfg.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {statusCfg.dot} {statusCfg.label}
                  </span>
                </div>

                {/* Creado */}
                <div style={{ fontSize: 11, color: c.textMuted }}>
                  {formatDate(
                    version.CreateDate?.toString() || new Date().toString(),
                  )}
                  {/* {version.CreateBy && ( */}
                  <div style={{ fontSize: 10, marginTop: 2 }}>
                    por {version.CreateBy}
                  </div>
                  {/* )} */}
                </div>

                {/* Accion */}
                <div>
                  <button
                    type="button"
                    disabled={status === 1 || publishingVersionId === version._id}
                    onClick={() =>
                      version._id && publishVersion(version._id, version.Value)
                    }
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: 10,
                      border: `1.5px solid ${
                        status === 1 ? c.border : Colors.detailAppColor
                      }`,
                      background:
                        status === 1
                          ? c.accentSoft
                          : `${Colors.detailAppColor}15`,
                      color: status === 1 ? c.textMuted : Colors.detailAppColor,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor:
                        status === 1 || publishingVersionId === version._id
                          ? "not-allowed"
                          : "pointer",
                      opacity: publishingVersionId === version._id ? 0.7 : 1,
                    }}
                  >
                    {status === 1
                      ? "Publicada"
                      : publishingVersionId === version._id
                        ? "Publicando..."
                        : "Publicar"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Leyenda */}
      <div
        style={{
          marginTop: 16,
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
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: cfg.color,
                }}
              />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Paginación */}
      <Pagination
        page={page}
        totalPages={totalPages}
        itemsPerPage={safeVersions.length}
        totalItems={totalItems}
        search={search}
        setPage={setPage}
        c={c}
        theme={theme}
      />

      {/* Modales */}
      {showCreateVersion && (
        <AddVersionModal
          c={c}
          theme={theme}
          onSave={createVersion}
          onClose={() => setShowCreateVersion(false)}
        />
      )}

      {/* {editingVersion && (
        <EditVersionModal
          versionData={editingVersion}
          c={c}
          theme={theme}
          onSave={updateVersion}
          onClose={() => setEditingVersion(null)}
        />
      )} */}

      {/* Alert de eliminación */}
      {/* <ActionAlert
        visible={deleteAlert.visible}
        title="Eliminar versión"
        description={`¿Estás seguro de que deseas eliminar la versión "${deleteAlert.versionValue}"? Esta acción es irreversible.`}
        actionText="Eliminar"
        actionColor="#dc3545"
        icon="🗑️"
        onAction={confirmDelete}
        onCancel={() => setDeleteAlert((prev) => ({ ...prev, visible: false }))}
        theme={theme}
        c={c}
        isLoading={isDeleting}
      /> */}
    </div>
  );
};

export default VersionsTab;
