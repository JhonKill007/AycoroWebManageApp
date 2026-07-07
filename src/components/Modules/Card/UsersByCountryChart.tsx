import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import analyticsService from "../../Services/Analytics/AnalyticsService";

type CountryMetric = {
  country: string;
  users: number;
  growth: number;
  currentMonthUsers: number;
  previousMonthUsers: number;
};

const CHART_COLORS = [
  "#6b73f0",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ec4899",
  "#64748b",
];

const formatCountry = (country?: string) =>
  !country || country === "N/A" ? "Sin especificar" : country;

const UsersByCountryChart = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const [countries, setCountries] = useState<CountryMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const { data } = await analyticsService.getUsersByCountry();
        setCountries(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    loadCountries();
  }, []);

  const total = useMemo(
    () => countries.reduce((sum, item) => sum + item.users, 0),
    [countries],
  );
  const leader = countries[0];
  const growthLeader = useMemo(
    () =>
      countries
        .filter((item) => item.currentMonthUsers > 0)
        .reduce<CountryMetric | undefined>(
          (best, item) => (!best || item.growth > best.growth ? item : best),
          undefined,
        ),
    [countries],
  );
  const chartData = useMemo(() => {
    const visible = countries.slice(0, 7).map((item) => ({
      ...item,
      country: formatCountry(item.country),
    }));
    const remaining = countries.slice(7).reduce((sum, item) => sum + item.users, 0);
    return remaining > 0
      ? [...visible, { country: "Otros", users: remaining, growth: 0, currentMonthUsers: 0, previousMonthUsers: 0 }]
      : visible;
  }, [countries]);

  return (
    <>
      <style>{`
        @media (max-width: 760px) {
          .country-chart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <section
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 20,
          padding: 22,
          boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>Usuarios por país</div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
              Distribución geográfica de {total.toLocaleString()} usuarios
            </div>
          </div>
          <button
            onClick={() => setShowAll(true)}
            disabled={countries.length === 0}
            style={{
              border: `1.5px solid ${c.accent}44`,
              background: c.accentSoft,
              color: c.accent,
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 11,
              fontWeight: 800,
              cursor: countries.length ? "pointer" : "default",
            }}
          >
            Ver todos los países
          </button>
        </div>

        {loading ? (
          <div style={{ height: 310, display: "grid", placeItems: "center", color: c.textMuted }}>Cargando distribución...</div>
        ) : countries.length === 0 ? (
          <div style={{ height: 310, display: "grid", placeItems: "center", color: c.textMuted }}>No hay datos de países disponibles.</div>
        ) : (
          <div className="country-chart-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1.2fr) minmax(230px, .8fr)", gap: 18, alignItems: "center" }}>
            <div style={{ height: 310, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="users" nameKey="country" innerRadius={78} outerRadius={122} paddingAngle={2} stroke="none">
                    {chartData.map((entry, index) => (
                      <Cell key={`${entry.country}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString()} usuarios`, "Registros"]}
                    contentStyle={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, color: c.text }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center", pointerEvents: "none", textAlign: "center" }}>
                <strong style={{ fontSize: 24, color: c.text }}>{total.toLocaleString()}</strong>
                <span style={{ fontSize: 10, color: c.textMuted }}>usuarios</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <MetricCard title="País líder" value={formatCountry(leader?.country)} detail={`${leader?.users.toLocaleString() || 0} registros`} color={c.accent} c={c} />
              <MetricCard
                title="Mayor crecimiento"
                value={growthLeader ? formatCountry(growthLeader.country) : "Sin crecimiento"}
                detail={growthLeader ? `${growthLeader.growth >= 0 ? "+" : ""}${growthLeader.growth}% · ${growthLeader.currentMonthUsers} altas este mes` : "No hay altas este mes"}
                color={c.success}
                c={c}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {chartData.slice(0, 6).map((item, index) => (
                  <div key={item.country} style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: CHART_COLORS[index], flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {showAll && (
        <div
          onClick={() => setShowAll(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(2,6,23,.72)", backdropFilter: "blur(7px)", display: "grid", placeItems: "center", padding: 20 }}
        >
          <div onClick={(event) => event.stopPropagation()} style={{ width: "min(760px, 100%)", maxHeight: "82vh", background: c.card, border: `1.5px solid ${c.border}`, borderRadius: 22, overflow: "auto", boxShadow: "0 28px 80px rgba(0,0,0,.35)" }}>
            <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}` }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Todos los países</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>{countries.length} países con usuarios registrados</div>
              </div>
              <button onClick={() => setShowAll(false)} style={{ border: 0, background: c.accentSoft, color: c.text, width: 34, height: 34, borderRadius: 10, cursor: "pointer" }}>✕</button>
            </div>
            <div className="countries-table-header" style={{ display: "grid", minWidth: 650, gridTemplateColumns: "54px 1fr 120px 120px 120px", gap: 10, padding: "10px 22px", background: c.accentSoft, color: c.textMuted, fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>
              <span>#</span><span>País</span><span>Usuarios</span><span>Este mes</span><span>Crecimiento</span>
            </div>
            <div style={{ maxHeight: "58vh", overflowY: "auto" }}>
              {countries.map((item, index) => (
                <div className="country-row" key={`${item.country}-${index}`} style={{ display: "grid", minWidth: 650, gridTemplateColumns: "54px 1fr 120px 120px 120px", gap: 10, padding: "12px 22px", borderBottom: `1px solid ${c.border}`, alignItems: "center" }}>
                  <strong style={{ color: index === 0 ? c.accent : c.textMuted, fontSize: 11 }}>#{index + 1}</strong>
                  <span style={{ color: c.text, fontSize: 12, fontWeight: 700 }}>{formatCountry(item.country)} {index === 0 && "· Líder"}</span>
                  <span style={{ color: c.text, fontSize: 12, fontWeight: 800 }}>{item.users.toLocaleString()}</span>
                  <span style={{ color: c.textMuted, fontSize: 11 }}>{item.currentMonthUsers.toLocaleString()}</span>
                  <span style={{ color: item.growth > 0 ? c.success : item.growth < 0 ? c.danger : c.textMuted, fontSize: 11, fontWeight: 800 }}>
                    {item.growth > 0 ? "+" : ""}{item.growth}% {growthLeader?.country === item.country && "· Mayor"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MetricCard = ({ title, value, detail, color, c }: any) => (
  <div style={{ border: `1px solid ${c.border}`, borderRadius: 14, padding: "13px 15px", background: c.accentSoft }}>
    <div style={{ color: c.textMuted, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</div>
    <div style={{ color, fontSize: 14, fontWeight: 800, marginTop: 5 }}>{value}</div>
    <div style={{ color: c.textMuted, fontSize: 10, marginTop: 2 }}>{detail}</div>
  </div>
);

export default UsersByCountryChart;
