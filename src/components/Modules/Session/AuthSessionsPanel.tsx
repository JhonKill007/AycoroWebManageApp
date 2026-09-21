import { useEffect, useState } from "react";
import { Pagination } from "../Common/Components/Pagination";
import { AuthSessionModel } from "../../Models/Session/AuthSessionModel";
import authSessionService from "../../Services/Session/AuthSessionService";
import AuthSessionDetailModal from "./AuthSessionDetailModal";

const emptyResponse = {
  data: [] as AuthSessionModel[],
  pagination: {
    total: 0,
    page: 1,
    limit: 14,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  stats: { active: 0, filtered: 0 },
  filters: { deviceOS: [] as string[], countries: [] as string[] },
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

function AuthSessionRow({
  session,
  c,
  onClick,
}: {
  session: AuthSessionModel;
  c: any;
  onClick: () => void;
}) {
  const username = session.User?.Username || session.User?.Name;

  return (
    <button
      className="auth-session-row"
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(170px,1.2fr) 150px 90px 140px 130px 150px 90px",
        gap: 12,
        alignItems: "center",
        padding: "13px 16px",
        border: "none",
        borderBottom: `1px solid ${c.border}`,
        background: "transparent",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
          {username ? `@${username}` : "Usuario sin resolver"}
        </div>
        <div style={{ color: c.textMuted, fontSize: 11, overflowWrap: "anywhere" }}>
          {session.UserId}
        </div>
      </div>
      <div style={{ color: c.text, fontSize: 12, fontWeight: 800, minWidth: 0 }}>
        {safe(session.DeviceModel)}
        <div style={{ color: c.textMuted, fontSize: 11 }}>{safe(session.DeviceOS)}</div>
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, fontWeight: 800 }}>
        {safe(session.AppVersion)}
      </div>
      <div style={{ color: c.text, fontSize: 12, fontWeight: 800 }}>
        {safe(session.Country)}
        <div style={{ color: c.textMuted, fontSize: 11 }}>{safe(session.City)}</div>
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, overflowWrap: "anywhere" }}>
        {safe(session.Ip)}
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, fontWeight: 700 }}>
        {formatDate(session.CreatedAt)}
      </div>
      <div>
        <span
          style={{
            background: session.IsActive ? c.successSoft : c.dangerSoft,
            color: session.IsActive ? c.success : c.danger,
            borderRadius: 999,
            padding: "4px 8px",
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {session.IsActive ? "Activa" : session.IsRevoked ? "Revocada" : "Expirada"}
        </span>
      </div>
    </button>
  );
}

type AuthSessionsPanelProps = {
  c: any;
  theme: string;
};

const AuthSessionsPanel = ({ c, theme }: AuthSessionsPanelProps) => {
  const [response, setResponse] = useState(emptyResponse);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deviceOS, setDeviceOS] = useState("todos");
  const [country, setCountry] = useState("todos");
  const [status, setStatus] = useState<"active" | "revoked" | "expired" | "all">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AuthSessionModel | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [deviceOS, country, status]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    authSessionService
      .getAll({
        page,
        limit: 14,
        search: debouncedSearch,
        deviceOS,
        country,
        status,
      })
      .then((data) => {
        if (!alive) return;
        setResponse(data);
      })
      .catch(() => {
        if (!alive) return;
        setError("No se pudieron cargar las AuthSession.");
        setResponse(emptyResponse);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [page, debouncedSearch, deviceOS, country, status]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError("");
      return;
    }

    let alive = true;
    setDetailLoading(true);
    setDetailError("");

    authSessionService
      .getById(selectedId)
      .then((data) => {
        if (alive) setDetail(data);
      })
      .catch(() => {
        if (!alive) return;
        setDetailError("No se pudo cargar el detalle de esta sesion.");
        setDetail(null);
      })
      .finally(() => {
        if (alive) setDetailLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedId]);

  const handleActivate = async () => {
    if (!selectedId) return;
    setActivating(true);
    setDetailError("");
    try {
      const updated = await authSessionService.activateNotificationSession(selectedId);
      setDetail(updated);
    } catch {
      setDetailError("No se pudo activar la sesion de notificaciones.");
    } finally {
      setActivating(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-session-search, .auth-session-select {
          background:${c.inputBackground};
          border:1.5px solid ${c.inputBorder};
          color:${c.text};
          border-radius:12px;
          padding:10px 12px;
          min-height:42px;
          font:700 12px 'Plus Jakarta Sans', sans-serif;
          outline:none;
        }
        .auth-session-search { min-width:280px; }
        .auth-session-toolbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
        .auth-session-table { overflow:auto; }
        .auth-session-header {
          display:grid;
          grid-template-columns:minmax(170px,1.2fr) 150px 90px 140px 130px 150px 90px;
          gap:12px;
          padding:10px 16px;
          border-bottom:1px solid ${c.border};
          color:${c.textMuted};
          font-size:10px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          min-width:920px;
        }
        .auth-session-row { min-width:920px; }
        .auth-session-row:hover { background:${c.accentSoft}; }
        @media (max-width: 768px) {
          .auth-session-toolbar { align-items:stretch; flex-direction:column; }
          .auth-session-toolbar > * { width:100%; min-width:0; }
          .auth-session-table { overflow:visible; }
          .auth-session-header { display:none; }
          .auth-session-row {
            min-width:0;
            display:grid !important;
            grid-template-columns:repeat(2,minmax(0,1fr)) !important;
            gap:12px !important;
            margin:0 0 10px;
            border:1px solid rgba(127,127,127,.2) !important;
            border-radius:14px;
            background:${c.card};
          }
          .auth-session-row > * { min-width:0; }
          .auth-session-row > :first-child { grid-column:1 / -1; }
        }
      `}</style>

      <section className="auth-session-toolbar">
        <input
          className="auth-session-search"
          placeholder="Buscar usuario, IP, dispositivo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="auth-session-select"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "active" | "revoked" | "expired" | "all")
          }
        >
          <option value="active">Activas</option>
          <option value="revoked">Revocadas</option>
          <option value="expired">Expiradas</option>
          <option value="all">Todas</option>
        </select>
        <select
          className="auth-session-select"
          value={deviceOS}
          onChange={(event) => setDeviceOS(event.target.value)}
        >
          <option value="todos">Todos los OS</option>
          {response.filters.deviceOS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="auth-session-select"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
        >
          <option value="todos">Todos los paises</option>
          {response.filters.countries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <div
          style={{
            color: c.danger,
            background: `${c.danger}12`,
            border: `1px solid ${c.danger}33`,
            borderRadius: 14,
            padding: 12,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <div className="auth-session-table">
          <div className="auth-session-header">
            <span>Usuario</span>
            <span>Dispositivo</span>
            <span>Version</span>
            <span>Ubicacion</span>
            <span>IP</span>
            <span>Inicio</span>
            <span>Estado</span>
          </div>
          {loading ? (
            <div style={{ padding: 44, textAlign: "center", color: c.textMuted, fontWeight: 800 }}>
              Cargando AuthSession...
            </div>
          ) : response.data.length === 0 ? (
            <div style={{ padding: 44, textAlign: "center", color: c.textMuted, fontWeight: 800 }}>
              No hay AuthSession con esos filtros.
            </div>
          ) : (
            response.data.map((session) => (
              <AuthSessionRow
                key={session._id}
                session={session}
                c={c}
                onClick={() => setSelectedId(session._id)}
              />
            ))
          )}
        </div>
        <div style={{ borderTop: `1px solid ${c.border}` }}>
          <Pagination
            page={page}
            totalPages={Math.max(response.pagination.totalPages, 1)}
            itemsPerPage={response.pagination.limit}
            totalItems={response.pagination.total}
            search={search}
            setPage={setPage}
            c={c}
            theme={theme}
          />
        </div>
      </div>

      {selectedId && (
        <AuthSessionDetailModal
          c={c}
          theme={theme}
          session={detail}
          loading={detailLoading}
          activating={activating}
          error={detailError}
          onClose={() => setSelectedId(null)}
          onActivate={handleActivate}
        />
      )}
    </>
  );
};

export default AuthSessionsPanel;
