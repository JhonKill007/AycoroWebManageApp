import { useEffect, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import {
  SessionLogModel,
  SessionLogResponse,
} from "../Models/SessionLog/SessionLogModel";
import { Pagination } from "../Modules/Common/Components/Pagination";
import sessionLogService from "../Services/SessionLog/SessionLogService";

const emptyResponse: SessionLogResponse = {
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
    totalSessions: 0,
    uniqueUsers: 0,
  },
  groups: {
    devices: [],
    countries: [],
  },
  filters: {
    deviceOS: [],
    countries: [],
    versions: [],
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

function SessionRow({
  log,
  c,
}: {
  log: SessionLogModel;
  c: any;
}) {
  const username = log.User?.Username || log.User?.Name;

  return (
    <div
      className="session-log-row"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(170px,1.2fr) 120px 120px 140px 130px 150px",
        gap: 12,
        alignItems: "center",
        padding: "13px 16px",
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
          {username ? `@${username}` : "Usuario sin resolver"}
        </div>
        <div style={{ color: c.textMuted, fontSize: 11, overflowWrap: "anywhere" }}>
          {log.IdUser}
        </div>
      </div>
      <div style={{ color: c.accent, fontSize: 12, fontWeight: 900 }}>
        {safe(log.DeviceOS)}
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, fontWeight: 800 }}>
        {safe(log.AppVersion)}
      </div>
      <div style={{ color: c.text, fontSize: 12, fontWeight: 800 }}>
        {safe(log.Country)}
        <div style={{ color: c.textMuted, fontSize: 11 }}>{safe(log.City)}</div>
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, overflowWrap: "anywhere" }}>
        {safe(log.Ip)}
      </div>
      <div style={{ color: c.textMuted, fontSize: 12, fontWeight: 700 }}>
        {formatDate(log.CreateDate)}
      </div>
    </div>
  );
}

function GroupList({ title, items, c }: any) {
  const max = Math.max(...items.map((item: any) => item.count), 1);
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: 18,
        padding: 16,
        minWidth: 0,
      }}
    >
      <h3 style={{ margin: "0 0 12px", color: c.text, fontSize: 14 }}>
        {title}
      </h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.length === 0 ? (
          <span style={{ color: c.textMuted, fontSize: 12 }}>Sin datos</span>
        ) : (
          items.map((item: any) => (
            <div key={item.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 5,
                }}
              >
                <span style={{ color: c.text, fontSize: 12, fontWeight: 800 }}>
                  {safe(item.key)}
                </span>
                <span style={{ color: c.accent, fontSize: 12, fontWeight: 900 }}>
                  {item.count}
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 999,
                  background: c.border,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.max(5, (item.count / max) * 100)}%`,
                    background: c.accent,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const SessionLogs = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [response, setResponse] = useState<SessionLogResponse>(emptyResponse);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deviceOS, setDeviceOS] = useState("todos");
  const [country, setCountry] = useState("todos");
  const [appVersion, setAppVersion] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [deviceOS, country, appVersion]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    sessionLogService
      .getAll({
        page,
        limit: 14,
        search: debouncedSearch,
        deviceOS,
        country,
        appVersion,
      })
      .then((data) => {
        if (alive) setResponse(data);
      })
      .catch(() => {
        if (!alive) return;
        setError("No se pudieron cargar los SessionLog.");
        setResponse(emptyResponse);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [page, debouncedSearch, deviceOS, country, appVersion]);

  return (
    <>
      <style>{`
        .session-log-search, .session-log-select {
          background:${c.inputBackground};
          border:1.5px solid ${c.inputBorder};
          color:${c.text};
          border-radius:12px;
          padding:10px 12px;
          min-height:42px;
          font:700 12px 'Plus Jakarta Sans', sans-serif;
          outline:none;
        }
        .session-log-search { min-width:280px; }
        .session-log-toolbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
        .session-log-table { overflow:auto; }
        .session-log-header {
          display:grid;
          grid-template-columns:minmax(170px,1.2fr) 120px 120px 140px 130px 150px;
          gap:12px;
          padding:10px 16px;
          border-bottom:1px solid ${c.border};
          color:${c.textMuted};
          font-size:10px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          min-width:830px;
        }
        .session-log-row { min-width:830px; }
        @media (max-width: 768px) {
          .session-log-toolbar { align-items:stretch; flex-direction:column; }
          .session-log-toolbar > * { width:100%; min-width:0; }
          .session-log-table { overflow:visible; }
          .session-log-header { display:none; }
          .session-log-row {
            min-width:0;
            display:grid !important;
            grid-template-columns:repeat(2,minmax(0,1fr)) !important;
            gap:12px !important;
            margin:0 0 10px;
            border:1px solid rgba(127,127,127,.2);
            border-radius:14px;
            background:${c.card};
          }
          .session-log-row > * { min-width:0; }
          .session-log-row > :first-child { grid-column:1 / -1; }
          .session-log-row > *::before {
            display:block;
            margin-bottom:5px;
            color:#8b8da9;
            font-size:8px;
            font-weight:900;
            letter-spacing:.07em;
            text-transform:uppercase;
          }
          .session-log-row > :nth-child(1)::before { content:"Usuario"; }
          .session-log-row > :nth-child(2)::before { content:"OS"; }
          .session-log-row > :nth-child(3)::before { content:"Version"; }
          .session-log-row > :nth-child(4)::before { content:"Ubicacion"; }
          .session-log-row > :nth-child(5)::before { content:"IP"; }
          .session-log-row > :nth-child(6)::before { content:"Fecha"; }
        }
        @media (max-width: 480px) {
          .session-log-row { grid-template-columns:minmax(0,1fr) !important; }
          .session-log-row > * { grid-column:1 / -1; }
        }
      `}</style>
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: 26,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <section
          className="responsive-page-banner"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#0f1520,#1a1a30)"
                : "linear-gradient(135deg,#f0f4ff,#ededff)",
            border: `1.5px solid ${c.accentMedium}`,
            borderRadius: 20,
            padding: "20px 24px",
          }}
        >
          <h2 style={{ margin: 0, color: c.text, fontSize: 20 }}>
            SessionLog
          </h2>
          <p style={{ margin: "6px 0 0", color: c.textMuted, fontSize: 13 }}>
            Entradas reales a la app por usuario, dispositivo, version, IP y ubicacion.
          </p>
        </section>

        <section
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: 12,
          }}
        >
          <StatCard
            label="Entradas"
            value={response.stats.totalSessions}
            color={c.accent}
            c={c}
          />
          <StatCard
            label="Usuarios unicos"
            value={response.stats.uniqueUsers}
            color={c.success}
            c={c}
          />
        </section>

        <section className="session-log-toolbar">
          <input
            className="session-log-search"
            placeholder="Buscar usuario, IP, pais, ciudad..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="session-log-select"
            value={deviceOS}
            onChange={(event) => setDeviceOS(event.target.value)}
          >
            <option value="todos">Todos los OS</option>
            {response.filters.deviceOS.filter(Boolean).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="session-log-select"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            <option value="todos">Todos los paises</option>
            {response.filters.countries.filter(Boolean).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="session-log-select"
            value={appVersion}
            onChange={(event) => setAppVersion(event.target.value)}
          >
            <option value="todos">Todas las versiones</option>
            {response.filters.versions.filter(Boolean).map((item) => (
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

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 300px",
            gap: 16,
          }}
          className="logs-responsive-layout"
        >
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 18,
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <div className="session-log-table">
              <div className="session-log-header">
                <span>Usuario</span>
                <span>OS</span>
                <span>Version</span>
                <span>Ubicacion</span>
                <span>IP</span>
                <span>Fecha</span>
              </div>
              {loading ? (
                <div style={{ padding: 44, textAlign: "center", color: c.textMuted, fontWeight: 800 }}>
                  Cargando SessionLog...
                </div>
              ) : response.data.length === 0 ? (
                <div style={{ padding: 44, textAlign: "center", color: c.textMuted, fontWeight: 800 }}>
                  No hay registros con esos filtros.
                </div>
              ) : (
                response.data.map((log) => <SessionRow key={log._id} log={log} c={c} />)
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

          <aside style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <GroupList title="Por dispositivo" items={response.groups.devices} c={c} />
            <GroupList title="Por pais" items={response.groups.countries} c={c} />
          </aside>
        </section>
      </main>
    </>
  );
};

export default SessionLogs;
