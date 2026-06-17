import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Colors } from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import analyticsService from "../../Services/Analytics/AnalyticsService";

// // ─── Datos: usuarios por país ─────────────────────────────────────────
// const DATA = [
//   { country: "🇲🇽 México", code: "MX", users: 4320, growth: +18 },
//   { country: "🇺🇸 EE.UU.", code: "US", users: 3870, growth: +12 },
//   { country: "🇨🇴 Colombia", code: "CO", users: 2940, growth: +31 },
//   { country: "🇦🇷 Argentina", code: "AR", users: 2510, growth: +9 },
//   { country: "🇪🇸 España", code: "ES", users: 2100, growth: +7 },
//   { country: "🇨🇱 Chile", code: "CL", users: 1760, growth: +22 },
//   { country: "🇵🇪 Perú", code: "PE", users: 1430, growth: +15 },
//   { country: "🇻🇪 Venezuela", code: "VE", users: 1180, growth: +5 },
//   { country: "🇧🇷 Brasil", code: "BR", users: 960, growth: +44 },
//   { country: "🇩🇴 Rep. Dom.", code: "DO", users: 720, growth: +28 },
// ];

// const TOTAL = DATA.reduce((s, d) => s + d.users, 0);
let TOTAL = 0;

// Gradiente de color según ranking
const BAR_COLORS_DARK = [
  "#7b83f5",
  "#8b7cf8",
  "#9b74fa",
  "#a46ef7",
  "#af68f4",
  "#b862f1",
  "#c25cee",
  "#cc56eb",
  "#d650e8",
  "#e04ae5",
];
const BAR_COLORS_LIGHT = [
  "#6b73f0",
  "#7a6def",
  "#8a68ee",
  "#9962ed",
  "#a85cec",
  "#b756eb",
  "#c650ea",
  "#d54ae9",
  "#e444e8",
  "#f33ee7",
];

// ─── Tooltip personalizado ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, dark }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const c = dark ? Colors.dark.colors : Colors.light.colors;
  const pct = ((d.users / TOTAL) * 100).toFixed(1);

  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.accent}44`,
        borderRadius: "14px",
        padding: "12px 16px",
        boxShadow: `0 8px 30px rgba(107,115,240,0.18)`,
        minWidth: "160px",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "800",
          color: c.text,
          marginBottom: "8px",
        }}
      >
        {d.country}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Row
          label="Usuarios"
          value={d.users.toLocaleString()}
          color={c.accent}
        />
        <Row label="Del total" value={`${pct}%`} color={c.textMuted} />
        <Row
          label="Crecimiento"
          value={`+${d.growth}%`}
          color={
            d.growth >= 20
              ? c.success
              : d.growth >= 10
                ? c.warning
                : c.textMuted
          }
        />
      </div>
    </div>
  );
};

const Row = ({ label, value, color }: any) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        fontSize: "11px",
      }}
    >
      <span style={{ color: "#8888a8" }}>{label}</span>
      <span style={{ fontWeight: "700", color }}>{value}</span>
    </div>
  );
};

type CountryMetric = {
  country: string;
  users: number;
  growth: number;
};

const UsersByCountryChart = () => {
  const { theme } = useThemeContext();
  const [countries, setCountries] = useState<CountryMetric[]>([]);

  useEffect(() => {
    const getUsersByCountry = async () => {
      const { data } = await analyticsService.getUsersByCountry();
      setCountries(data);
    };

    getUsersByCountry();
  }, []);

  TOTAL = countries.reduce((s, d) => s + d.users, 0);

  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [view, setView] = useState("bar"); // "bar" | "list"
  const barColors = theme === "dark" ? BAR_COLORS_DARK : BAR_COLORS_LIGHT;
  const top = countries[0];
  return (
    <div
      style={{
        minHeight: "auto",
        padding: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "background 0.3s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .tab-btn {
          padding: 6px 16px; border-radius: 20px;
          border: 1.5px solid ${c.border};
          background: transparent; cursor: pointer;
          font-size: 12px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.18s;
          color: ${c.textMuted};
        }
        .tab-btn.active {
          background: ${c.accentMedium};
          border-color: ${c.accent}44;
          color: ${c.accent};
        }
        .tab-btn:not(.active):hover {
          border-color: ${c.accent}44;
          color: ${c.text};
        }

        .toggle-track {
          width: 40px; height: 22px; border-radius: 11px;
          background: ${theme === "dark" ? c.accentMedium : c.border};
          border: 1.5px solid ${theme === "dark" ? c.accent : c.border};
          position: relative; cursor: pointer; transition: all 0.3s;
          flex-shrink: 0;
        }
        .toggle-thumb {
          position: absolute; width: 16px; height: 16px; border-radius: 50%;
          background: ${theme === "dark" ? c.accent : "#bbb"};
          top: 1px; left: ${theme === "dark" ? "19px" : "1px"};
          transition: left 0.3s; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .rank-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 12px;
          transition: background 0.15s; cursor: default;
        }
        .rank-row:hover { background: ${c.accentSoft}; }

        .progress-bar {
          height: 6px; border-radius: 3px;
          background: ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
          overflow: hidden; flex: 1;
        }
      `}</style>

      {/* ── Card ── */}
      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: "22px",
          padding: "26px",
          // maxWidth: "980px",
          // margin: "0 auto",
          boxShadow: `0 4px 30px rgba(107,115,240,0.08)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "22px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: c.text,
                marginBottom: "3px",
              }}
            >
              🌎 Usuarios por País
            </div>
            <div style={{ fontSize: "12px", color: c.textMuted }}>
              {TOTAL.toLocaleString()} usuarios totales registrados
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {/* View tabs */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className={`tab-btn${view === "bar" ? " active" : ""}`}
                onClick={() => setView("bar")}
              >
                📊 Gráfico
              </button>
              <button
                className={`tab-btn${view === "list" ? " active" : ""}`}
                onClick={() => setView("list")}
              >
                📋 Lista
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 pills */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          {countries.slice(0, 3).map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "14px",
                background: i === 0 ? c.accentMedium : c.accentSoft,
                border: `1.5px solid ${i === 0 ? c.accent + "44" : c.border}`,
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: i === 0 ? c.accent : c.textMuted,
                }}
              >
                #{i + 1}
              </span>
              <span style={{ fontSize: "13px", color: "#fff" }}>
                {d.country}
              </span>
              <span
                style={{ fontSize: "12px", fontWeight: "700", color: c.accent }}
              >
                {d.users.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* ── BAR CHART VIEW ── */}
        {view === "bar" && (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
              data={countries}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                stroke={
                  theme === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)"
                }
              />
              <XAxis
                type="number"
                tick={{
                  fill: c.textMuted,
                  fontSize: 10,
                  fontFamily: "'Plus Jakarta Sans'",
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                }
              />
              <YAxis
                type="category"
                dataKey="country"
                width={110}
                tick={{
                  fill: c.text,
                  fontSize: 12,
                  fontFamily: "'Plus Jakarta Sans'",
                  fontWeight: 600,
                }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={
                  <CustomTooltip dark={theme === "dark" ? true : false} />
                }
                cursor={{ fill: "transparent" }}
              />
              <Bar dataKey="users" radius={[0, 8, 8, 0]} maxBarSize={28}>
                {countries.map((_, i) => (
                  <Cell key={i} fill={barColors[i]} fillOpacity={0.9} />
                ))}
                <LabelList
                  dataKey="users"
                  position="right"
                  formatter={(v: any) => v.toLocaleString()}
                  style={{
                    fill: c.textMuted,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans'",
                  }}
                />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {countries.map((d, i) => {
              const pct = (d.users / countries[0].users) * 100;
              const userPct = ((d.users / TOTAL) * 100).toFixed(1);
              return (
                <div key={i} className="rank-row">
                  {/* Rank */}
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "8px",
                      background: i < 3 ? c.accentMedium : c.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "800",
                      color: i < 3 ? c.accent : c.textMuted,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* País */}
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: c.text,
                      width: "130px",
                      flexShrink: 0,
                    }}
                  >
                    {d.country}
                  </span>

                  {/* Barra */}
                  <div className="progress-bar">
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: barColors[i],
                        borderRadius: "3px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>

                  {/* Usuarios */}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: c.text,
                      width: "52px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {d.users.toLocaleString()}
                  </span>

                  {/* % total */}
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      color: c.textMuted,
                      width: "38px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {userPct}%
                  </span>

                  {/* Growth */}
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color:
                        d.growth >= 20
                          ? c.success
                          : d.growth >= 10
                            ? c.warning
                            : c.textMuted,
                      background:
                        d.growth >= 20
                          ? "rgba(34,197,94,0.12)"
                          : d.growth >= 10
                            ? "rgba(245,158,11,0.12)"
                            : c.accentSoft,
                      padding: "2px 7px",
                      borderRadius: "20px",
                      flexShrink: 0,
                    }}
                  >
                    ↑ {d.growth}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "11px", color: c.textMuted }}>
            Actualizado hace 2 horas · 10 países
          </span>
          <div style={{ display: "flex", gap: "16px" }}>
            {[
              {
                label: "Mayor crecimiento",
                value: `🇧🇷 Brasil +44%`,
                color: c.success,
              },
              { label: "Líder", value: `🇲🇽 México`, color: c.accent },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "9px",
                    color: c.textMuted,
                    fontWeight: "600",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: item.color,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersByCountryChart;
