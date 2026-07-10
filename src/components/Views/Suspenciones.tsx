import { useEffect, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import {
  SuspencionModel,
  SuspencionResponse,
} from "../Models/Suspencion/SuspencionModel";
import { Pagination } from "../Modules/Common/Components/Pagination";
import suspencionService from "../Services/Suspencion/SuspencionService";

const emptyResponse: SuspencionResponse = {
  data: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 14,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  stats: {
    totalSuspensions: 0,
    activeSuspensions: 0,
  },
  groups: {
    reasons: [],
  },
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const safe = (value: unknown, fallback = "-") => {
  const text = String(value || "").trim();
  return text || fallback;
};

function StatCard({ label, value, color, c }: any) {
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
      }}
    >
      <div style={{ color, fontSize: 25, fontWeight: 900 }}>{value}</div>
      <div
        style={{
          color: c.textMuted,
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SuspencionRow({ item, c }: { item: SuspencionModel; c: any }) {
  const active = item.EndDate ? new Date(item.EndDate) >= new Date() : false;

  return (
    <div
      className="suspencion-row"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(170px,1fr) minmax(180px,1.3fr) 150px 150px 110px",
        gap: 12,
        alignItems: "center",
        padding: "14px 16px",
        borderBottom: `1px solid ${c.border}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: c.text,
            fontSize: 13,
            fontWeight: 900,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          @{safe(item.Username, "usuario")}
        </div>
        <div style={{ color: c.textMuted, fontSize: 11, overflowWrap: "anywhere" }}>
          {item.IdUser}
        </div>
      </div>
      <div style={{ color: c.text, fontSize: 12, fontWeight: 800 }}>
        {safe(item.Reason)}
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, fontWeight: 700 }}>
        {formatDate(item.SuspensionDate)}
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, fontWeight: 700 }}>
        {formatDate(item.EndDate)}
      </div>
      <span
        style={{
          justifySelf: "start",
          padding: "7px 11px",
          borderRadius: 999,
          background: active ? c.warning + "22" : c.success + "22",
          color: active ? c.warning : c.success,
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        {active ? "Activa" : "Finalizada"}
      </span>
    </div>
  );
}

const Suspenciones = () => {
  const { theme } = useThemeContext();
  const colors = Colors[theme];
  const c = colors.colors;
  const [response, setResponse] = useState<SuspencionResponse>(emptyResponse);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await suspencionService.getAll({
          page,
          limit: 14,
          search: debouncedSearch,
        });
        if (!cancelled) setResponse(data);
      } catch (err) {
        if (!cancelled) {
          setResponse(emptyResponse);
          setError("No se pudieron cargar las suspensiones.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <style>{`
        @media (max-width: 760px) {
          .suspencion-row {
            grid-template-columns: 1fr !important;
            align-items: start !important;
          }
          .suspencion-table-header {
            display: none !important;
          }
        }
      `}</style>

      <div>
        <h1 style={{ margin: 0, color: c.text, fontSize: 24, fontWeight: 900 }}>
          Suspensiones
        </h1>
        <p style={{ margin: "6px 0 0", color: c.textMuted, fontSize: 13 }}>
          Usuarios suspendidos por acumulacion de strikes.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
        }}
      >
        <StatCard
          label="Suspensiones totales"
          value={response.stats.totalSuspensions}
          color={c.accent}
          c={c}
        />
        <StatCard
          label="Activas"
          value={response.stats.activeSuspensions}
          color={c.warning}
          c={c}
        />
      </div>

      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 16,
            borderBottom: `1px solid ${c.border}`,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por usuario, id o motivo..."
            style={{
              flex: "1 1 260px",
              border: `1.5px solid ${c.border}`,
              borderRadius: 14,
              padding: "12px 14px",
              background: c.inputBackground,
              color: c.text,
              outline: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          />
          <span style={{ color: c.textMuted, fontSize: 12, fontWeight: 800 }}>
            {response.pagination.total} registros
          </span>
        </div>

        <div
          className="suspencion-table-header"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(170px,1fr) minmax(180px,1.3fr) 150px 150px 110px",
            gap: 12,
            padding: "12px 16px",
            color: c.textMuted,
            fontSize: 11,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <span>Usuario</span>
          <span>Motivo</span>
          <span>Suspension</span>
          <span>Hasta</span>
          <span>Estado</span>
        </div>

        {loading ? (
          <div style={{ padding: 28, color: c.textMuted, textAlign: "center" }}>
            Cargando suspensiones...
          </div>
        ) : error ? (
          <div style={{ padding: 28, color: c.danger, textAlign: "center" }}>
            {error}
          </div>
        ) : response.data.length === 0 ? (
          <div style={{ padding: 28, color: c.textMuted, textAlign: "center" }}>
            No hay suspensiones registradas.
          </div>
        ) : (
          response.data.map((item) => (
            <SuspencionRow key={item._id} item={item} c={c} />
          ))
        )}

        <Pagination
          page={response.pagination.page || page}
          totalPages={response.pagination.totalPages || 1}
          itemsPerPage={response.pagination.limit || 14}
          totalItems={response.pagination.total}
          search={debouncedSearch}
          setPage={setPage}
          c={c}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default Suspenciones;
