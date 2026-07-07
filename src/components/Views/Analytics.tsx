import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import { SessionAccessAnalytics } from "../Models/SessionLog/SessionLogModel";
import UsersByCountryChart from "../Modules/Card/UsersByCountryChart";
import analyticsService from "../Services/Analytics/AnalyticsService";

// ─── Datos mock ───────────────────────────────────────────────────────

// const GROWTH_DATA = [
//   { mes: "Ago", usuarios: 520, publicaciones: 1200 },
//   { mes: "Sep", usuarios: 740, publicaciones: 1850 },
//   { mes: "Oct", usuarios: 930, publicaciones: 2100 },
//   { mes: "Nov", usuarios: 1080, publicaciones: 2640 },
//   { mes: "Dic", usuarios: 1190, publicaciones: 2980 },
//   { mes: "Ene", usuarios: 1247, publicaciones: 3410 },
//   { mes: "Feb", usuarios: 1390, publicaciones: 3870 },
// ];



const RETENTION_DATA = [
  { semana: "S1", retencion: 100 },
  { semana: "S2", retencion: 72 },
  { semana: "S3", retencion: 58 },
  { semana: "S4", retencion: 49 },
  { semana: "S5", retencion: 43 },
  { semana: "S6", retencion: 38 },
  { semana: "S7", retencion: 35 },
  { semana: "S8", retencion: 33 },
];

const TOP_USERS = [
  { user: "sofia_r", posts: 142, likes: 3420, followers: 891, verified: true },
  {
    user: "carlos_m",
    posts: 128,
    likes: 2870,
    followers: 754,
    verified: false,
  },
  {
    user: "ana_flores",
    posts: 97,
    likes: 2640,
    followers: 612,
    verified: true,
  },
  { user: "jorge_s", posts: 84, likes: 1980, followers: 540, verified: false },
  { user: "elena_rq", posts: 76, likes: 1720, followers: 489, verified: true },
];

type HeatMetric =
  | "total"
  | "registrations"
  | "likes"
  | "posts"
  | "stories"
  | "comments"
  | "chats";

type HeatmapCell = Record<HeatMetric, number> & {
  day: number;
  hour: number;
};

const HEAT_METRICS: { key: HeatMetric; label: string }[] = [
  { key: "total", label: "Toda" },
  { key: "registrations", label: "Registros" },
  { key: "likes", label: "Likes" },
  { key: "posts", label: "Publicaciones" },
  { key: "stories", label: "Historias" },
  { key: "comments", label: "Comentarios" },
  { key: "chats", label: "Chats" },
];

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_OPTIONS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ─── Helpers ──────────────────────────────────────────────────────────

function getAvatar(name: any) {
  const palette = [
    "#7b83f5",
    "#f87171",
    "#34d399",
    "#fbbf24",
    "#60a5fa",
    "#a78bfa",
    "#fb923c",
  ];
  return { bg: palette[name.charCodeAt(0) % palette.length] };
}

function heatColor(val: number, accent: string, max: number) {
  if (val === 0) return "transparent";
  const opacity = Math.min(0.15 + (val / Math.max(max, 1)) * 0.8, 0.95);
  return `${accent}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

// ─── Sub-componentes ──────────────────────────────────────────────────

function KpiCard({ emoji, label, value, sub, trend, colorKey, c }: any) {
  const colorMap: any = {
    accent: { bg: c.accentSoft, text: c.accent },
    success: { bg: c.successSoft, text: c.success },
    warning: { bg: c.warningSoft, text: c.warning },
    danger: { bg: c.dangerSoft, text: c.danger },
    info: { bg: c.infoSoft, text: c.info },
  };
  const col = colorMap[colorKey] || colorMap.accent;

  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: "18px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: col.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {emoji}
        </div>
        {trend !== null && trend !== undefined && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: trend >= 0 ? c.success : c.danger,
              background: trend >= 0 ? c.successSoft : c.dangerSoft,
              padding: "3px 9px",
              borderRadius: "20px",
            }}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div
          style={{
            fontSize: "26px",
            fontWeight: "800",
            color: col.text,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: c.text,
            marginTop: "4px",
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{ fontSize: "11px", color: c.textMuted, marginTop: "2px" }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, c, action }: any) {
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 2px 20px rgba(107,115,240,0.06)",
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: "14px", fontWeight: "800", color: c.text }}>
            {title}
          </div>
          {subtitle && (
            <div
              style={{ fontSize: "11px", color: c.textMuted, marginTop: "2px" }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {action}
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, c }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.accent}33`,
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        minWidth: "140px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: c.textMuted,
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      {payload.map((p: any) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "3px",
          }}
        >
          <span style={{ fontSize: "11px", color: p.color, fontWeight: "600" }}>
            {p.name}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "800", color: c.text }}>
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload, c }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${d.payload.color}44`,
        borderRadius: "10px",
        padding: "8px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontSize: "12px", fontWeight: "700", color: c.text }}>
        {d.name}
      </div>
      <div
        style={{ fontSize: "13px", fontWeight: "800", color: d.payload.color }}
      >
        {d.value.toLocaleString()}
      </div>
    </div>
  );
}

// ─── Tab chip ─────────────────────────────────────────────────────────
function GenderPieCard({ title, subtitle, data, c, theme }: any) {
  const total = data.reduce((sum: number, item: PieDatum) => sum + item.value, 0);

  return (
    <SectionCard title={title} subtitle={subtitle} c={c}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry: PieDatum, i: number) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip c={c} />} />
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {data.map((item: PieDatum) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
            return (
              <div key={item.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: c.text,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: item.color,
                        display: "inline-block",
                      }}
                    />
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: item.color,
                    }}
                  >
                    {item.value.toLocaleString()} · {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background:
                      theme === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: item.color,
                      borderRadius: 2,
                      transition: "width 0.6s",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

function TabChip({ label, active, onClick, c }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: "20px",
        border: `1.5px solid ${active ? c.accent + "44" : c.border}`,
        background: active ? c.accentMedium : "transparent",
        color: active ? c.accent : c.textMuted,
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

interface YearSelectBoxProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  c: any;
  startYear?: number;
  disabled?: boolean;
  label?: string;
  showLabel?: boolean;
}

const YearSelectBox = ({
  selectedYear,
  onYearChange,
  c,
  startYear = 2025,
  disabled = false,
  label = "Año",
  showLabel = true,
}: YearSelectBoxProps) => {
  // Generar años desde startYear hasta el año actual
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse(); // Orden descendente (año más reciente primero)
  }, [startYear]);

  // Si el año seleccionado no está disponible, seleccionar el año actual
  const validSelectedYear = availableYears.includes(selectedYear)
    ? selectedYear
    : availableYears[0] || new Date().getFullYear();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onYearChange(Number(e.target.value));
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {showLabel && (
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: c.textMuted,
            whiteSpace: "nowrap",
          }}
        >
          📅 {label}:
        </span>
      )}
      <select
        value={validSelectedYear}
        onChange={handleChange}
        disabled={disabled}
        style={{
          padding: "6px 32px 6px 12px",
          borderRadius: "10px",
          border: `1.5px solid ${c.border}`,
          background: disabled ? c.accentSoft : c.inputBackground,
          color: disabled ? c.textMuted : c.text,
          fontSize: "13px",
          fontWeight: "500",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: "all 0.2s",
          opacity: disabled ? 0.6 : 1,
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = c.accent;
            e.currentTarget.style.boxShadow = `0 0 0 2px ${c.accent}20`;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = c.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

type Device = {
  name: string;
  value: number;
  color: string;
};

type PieDatum = {
  name: string;
  value: number;
  color: string;
};

type MonthlyResume = {
  thisMonth: number;
  lastMonth: number;
  change: number;
};


type WeeklyResume = {
  dia: string;
  posts: number
  likes: number
  comentarios: number
  nuevos: number
};

const emptySessionAccess: SessionAccessAnalytics = {
  days: 30,
  totalSessions: 0,
  uniqueUsers: 0,
  averageSessionsPerUser: 0,
  series: [],
  topUsers: [],
};

// ─── Componente principal ─────────────────────────────────────────────
const Analytics = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [dataForMonth, setDataForMonth] = useState<[]>([]);

  const initialMonthlyResume: MonthlyResume = {
    thisMonth: 0,
    lastMonth: 0,
    change: 0
  };
  const [monthlyResume, setMonthlyResume] =
    useState<{
      chats: MonthlyResume;
      interactions: MonthlyResume;
      posts: MonthlyResume;
      users: MonthlyResume;
    }>({
      chats: initialMonthlyResume,
      interactions: initialMonthlyResume,
      posts: initialMonthlyResume,
      users: initialMonthlyResume,
    });

  const [weeklyActivityResume, setWeeklyActivityResume] =
    useState<{
      dia: string;
      posts: number
      likes: number
      comentarios: number
      nuevos: number
    }[]>([]);

  const [monthlyActivityResume, setMonthlyActivityResume] =
    useState<{
      dia: string;
      posts: number
      likes: number
      comentarios: number
      nuevos: number
    }[]>([]);


  const [growthMetric, setGrowthMetric] = useState("usuarios");
  const [growthPeriod, setGrowthPeriod] = useState<"year" | "month">("month");

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );

  const [activityPeriod, setActivityPeriod] = useState<string>("7d");
  const [newUsersPeriod, setNewUsersPeriod] = useState<string>("7d");
  const [sessionAccessPeriod, setSessionAccessPeriod] = useState<number>(7);
  const [sessionAccess, setSessionAccess] =
    useState<SessionAccessAnalytics>(emptySessionAccess);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [heatMetric, setHeatMetric] = useState<HeatMetric>("total");

  const [devices, setDevices] = useState<Device[]>([]);
  const [genderUsers, setGenderUsers] = useState<PieDatum[]>([]);
  const [genderPosts, setGenderPosts] = useState<PieDatum[]>([]);

  useEffect(() => {
    const getDeviceData = async () => {
      const { data } = await analyticsService.getDeviceData();
      setDevices([
        { name: "Android", value: data.android, color: "#34d399" },
        { name: "iOS", value: data.ios, color: "#7b83f5" },
        { name: "Others", value: data.others, color: "#2e88f7" },
      ]);
    };
    getDeviceData();
  }, []);

  useEffect(() => {
    const getGenderData = async () => {
      const { data } = await analyticsService.getGenderData();
      setGenderUsers(data.users || []);
      setGenderPosts(data.posts || []);
    };

    getGenderData();
  }, []);

  useEffect(() => {
    const getActivityResume = async () => {
      const { data } = await analyticsService.getActivityResume();
      setWeeklyActivityResume(data.weekly);
      setMonthlyActivityResume(data.monthly);
      setHeatmap(Array.isArray(data.heatmap) ? data.heatmap : []);
    };

    getActivityResume();
  }, []);

  useEffect(() => {
    const getSessionAccess = async () => {
      const { data } = await analyticsService.getSessionAccess(sessionAccessPeriod);
      setSessionAccess(data || emptySessionAccess);
    };

    getSessionAccess();
  }, [sessionAccessPeriod]);

  const heatmapMax = Math.max(
    1,
    ...heatmap.map((cell) => Number(cell[heatMetric]) || 0),
  );

  useEffect(() => {
    const getMonthlyData = async () => {
      const { data } = await analyticsService.getMonthlyData();
      setMonthlyResume(data);
    };

    getMonthlyData();
  }, []);

  useEffect(() => {
    const getGrowthData = async () => {
      const { data } =
        growthPeriod === "month"
          ? await analyticsService.getGrowthDataByMonth(
            selectedYear,
            selectedMonth,
          )
          : await analyticsService.getGrowthData(selectedYear);
      setDataForMonth(data);
    };

    getGrowthData();
  }, [growthPeriod, selectedMonth, selectedYear]);

  const gridColor =
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const tickColor = c.textMuted;
  const accentHex = theme === "dark" ? "#7b83f5" : "#6b73f0";

  const METRIC_CONFIG: any = {
    usuarios: {
      color: accentHex,
      label: "Usuarios",
      gradient: ["#7b83f533", "#7b83f500"],
    },
    publicaciones: {
      color: "#a78bfa",
      label: "Publicaciones",
      gradient: ["#a78bfa33", "#a78bfa00"],
    },
    // conversaciones: {
    //   color: "#60a5fa",
    //   label: "Conversaciones",
    //   gradient: ["#60a5fa33", "#60a5fa00"],
    // },
  };

  const activeMC = METRIC_CONFIG[growthMetric];

  // const PERIOD_DATA = {
  //   "7d": WEEKLY_ACTIVITY,
  //   "30d": [], //GROWTH_DATA ||
  // };

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

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .analytics-grid .span-2 { grid-column: span 2; }

        .select-control {
          padding: 6px 32px 6px 12px;
          border-radius: 10px;
          border: 1.5px solid ${c.border};
          background: ${c.inputBackground};
          color: ${c.text};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @media (max-width: 800px) {
          .analytics-grid { grid-template-columns: 1fr; }
          .analytics-grid .span-2 { grid-column: span 1; }
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
              📊 Analytics de Aycoro
            </div>
            <div
              style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}
            >
              Métricas de crecimiento, actividad y retención de tu comunidad.{" "}
              <strong style={{ color: c.accent }}>+18% usuarios</strong> este
              mes.
            </div>
          </div>
          <button className="pill-cta">Exportar datos →</button>
        </div>

        {/* ── KPI Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <KpiCard
            emoji="👥"
            label="Usuarios totales"
            value={monthlyResume.users.thisMonth}
            sub="este mes"
            trend={monthlyResume.users.change}
            colorKey="accent"
            c={c}
          />
          {/* <KpiCard
            emoji="🟢"
            label="Usuarios en línea"
            value="136"
            sub="en este momento"
            trend={+5}
            colorKey="success"
            c={c}
          /> */}
          <KpiCard
            emoji="📝"
            label="Publicaciones"
            value={monthlyResume.posts.thisMonth}
            sub="acumuladas"
            trend={monthlyResume.posts.change}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="💬"
            label="Conversaciones"
            value={monthlyResume.chats.thisMonth}
            sub="este mes"
            trend={monthlyResume.chats.change}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="❤️"
            label="Interacciones"
            value={monthlyResume.interactions.thisMonth}
            sub="últimos 30 días"
            trend={monthlyResume.interactions.change}
            colorKey="warning"
            c={c}
          />
          {/* <KpiCard
            emoji="📈"
            label="Retención 30d"
            value="33%"
            sub="usuarios activos"
            trend={-2}
            colorKey="danger"
            c={c}
          /> */}
        </div>

        {/* ── Grid de gráficos ── */}
        <div className="analytics-grid">

          {/* 1. Crecimiento (span 2) */}
          <div className="span-2">
            <SectionCard
              title="Crecimiento de la comunidad"
              subtitle="Evolución mensual de usuarios, publicaciones y conversaciones"
              c={c}
              action={
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <TabChip
                    label="Mes"
                    active={growthPeriod === "month"}
                    onClick={() => setGrowthPeriod("month")}
                    c={c}
                  />
                  <TabChip
                    label="Año"
                    active={growthPeriod === "year"}
                    onClick={() => setGrowthPeriod("year")}
                    c={c}
                  />
                  <span
                    style={{
                      width: 1,
                      background: c.border,
                      margin: "0 2px",
                    }}
                  />
                  {Object.keys(METRIC_CONFIG).map((k) => (
                    <TabChip
                      key={k}
                      label={METRIC_CONFIG[k].label}
                      active={growthMetric === k}
                      onClick={() => setGrowthMetric(k)}
                      c={c}
                    />
                  ))}
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={dataForMonth}
                  margin={{ top: 5, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={activeMC.color}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={activeMC.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey={growthPeriod === "month" ? "dia" : "mes"}
                    tick={{ fill: tickColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: tickColor, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                    }
                  />
                  <Tooltip content={<CustomTooltip c={c} />} />
                  <Area
                    type="monotone"
                    dataKey={growthMetric}
                    stroke={activeMC.color}
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={{ r: 4, fill: activeMC.color, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: activeMC.color }}
                    name={activeMC.label}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >
                <YearSelectBox
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                  c={c}
                />
                {growthPeriod === "month" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: c.textMuted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Mes:
                    </span>
                    <select
                      className="select-control"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {MONTH_OPTIONS.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="span-2">
            <SectionCard
              title="Entradas a la app"
              subtitle={`${sessionAccess.uniqueUsers.toLocaleString()} usuarios entraron ${sessionAccess.totalSessions.toLocaleString()} veces · promedio ${sessionAccess.averageSessionsPerUser} entradas por usuario`}
              c={c}
              action={
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {[7, 30, 90].map((days) => (
                    <TabChip
                      key={days}
                      label={`${days}d`}
                      active={sessionAccessPeriod === days}
                      onClick={() => setSessionAccessPeriod(days)}
                      c={c}
                    />
                  ))}
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart
                  data={sessionAccess.series}
                  margin={{ top: 5, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="sessionUsersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c.success} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={c.success} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sessionEntriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c.accent} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={c.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: tickColor, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: tickColor, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip c={c} />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Usuarios que entraron"
                    stroke={c.success}
                    strokeWidth={2.5}
                    fill="url(#sessionUsersGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: c.success }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Veces que entraron"
                    stroke={c.accent}
                    strokeWidth={2.5}
                    fill="url(#sessionEntriesGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: c.accent }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                {sessionAccess.topUsers.slice(0, 4).map((item) => (
                  <div
                    key={item.idUser}
                    style={{
                      border: `1px solid ${c.border}`,
                      borderRadius: 12,
                      padding: 10,
                      background: c.inputBackground,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: c.text,
                        fontSize: 12,
                        fontWeight: 900,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      @{item.user?.Username || item.user?.Name || item.idUser}
                    </div>
                    <div style={{ color: c.accent, fontSize: 12, fontWeight: 900 }}>
                      {item.sessions} entradas
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* 2. Actividad semanal */}
          <SectionCard
            title={activityPeriod === "7d" ? "Actividad semanal" : "Actividad Mensual"}
            subtitle="Posts, likes y comentarios por día"
            c={c}
            action={
              <div style={{ display: "flex", gap: "5px" }}>
                {["7d", "30d"].map((p) => (
                  <TabChip
                    key={p}
                    label={p}
                    active={activityPeriod === p}
                    onClick={() => setActivityPeriod(p)}
                    c={c}
                  />
                ))}
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={activityPeriod === "7d" ? weeklyActivityResume : monthlyActivityResume}
                margin={{ top: 0, right: 0, bottom: 0, left: -10 }}
                barGap={3}
              >
                <CartesianGrid stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="dia"
                  tick={{ fill: tickColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip c={c} />}
                  cursor={{ fill: c.accentSoft }}
                />
                <Bar
                  dataKey="posts"
                  fill={accentHex}
                  radius={[4, 4, 0, 0]}
                  name="Posts"
                  maxBarSize={18}
                />
                <Bar
                  dataKey="likes"
                  fill="#a78bfa"
                  radius={[4, 4, 0, 0]}
                  name="Likes"
                  maxBarSize={18}
                />
                <Bar
                  dataKey="comentarios"
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                  name="Comentarios"
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* 3. Tipos de contenido */}
          <SectionCard
            title="Tipos de dispositivos"
            subtitle="Tipos de dispositivos sessionando"
            c={c}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {devices.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip c={c} />} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {devices.map((ct) => {
                  const total = devices.reduce((s, x) => s + x.value, 0);
                  const pct = ((ct.value / total) * 100).toFixed(0);
                  return (
                    <div key={ct.name}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "3px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: c.text,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: ct.color,
                              display: "inline-block",
                            }}
                          />
                          {ct.name}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            color: ct.color,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background:
                            theme === "dark"
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.06)",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: ct.color,
                            borderRadius: 2,
                            transition: "width 0.6s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          <GenderPieCard
            title="Usuarios por género"
            subtitle="Hombres y mujeres registrados en la app"
            data={genderUsers}
            c={c}
            theme={theme}
          />

          <GenderPieCard
            title="Publicaciones por género"
            subtitle="Publicaciones agrupadas por género del autor"
            data={genderPosts}
            c={c}
            theme={theme}
          />

          {/* 4. Retención */}
          {/* <SectionCard
            title="Curva de retención"
            subtitle="% de usuarios activos semana a semana"
            c={c}
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={RETENTION_DATA}
                margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
              >
                <CartesianGrid stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="semana"
                  tick={{ fill: tickColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Retención"]}
                  contentStyle={{
                    background: c.card,
                    border: `1px solid ${c.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: c.textMuted }}
                  itemStyle={{ color: c.success, fontWeight: 700 }}
                />
                <Line
                  type="monotone"
                  dataKey="retencion"
                  stroke={c.success}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: c.success, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Retención"
                />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard> */}

          {/* 5. Heatmap de actividad por hora */}
          <SectionCard
            title="Mapa de calor — Actividad"
            subtitle="Eventos reales de los últimos 30 días por hora y día"
            c={c}
            action={
              <select
                value={heatMetric}
                onChange={(event) => setHeatMetric(event.target.value as HeatMetric)}
                style={{
                  border: `1.5px solid ${c.border}`,
                  background: c.inputBackground,
                  color: c.text,
                  borderRadius: 9,
                  padding: "6px 9px",
                  fontSize: 10,
                  fontWeight: 700,
                  outline: "none",
                }}
              >
                {HEAT_METRICS.map((metric) => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label}
                  </option>
                ))}
              </select>
            }
          >
            <div>
              {/* Header días */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px repeat(7, 1fr)",
                  gap: "4px",
                  marginBottom: "4px",
                }}
              >
                <div />
                {DAYS.map((d) => (
                  <div
                    key={d}
                    style={{
                      textAlign: "center",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: c.textMuted,
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {Array.from({ length: 8 }).map((_, hourIndex) => {
                const hour = hourIndex * 3;
                return (
                <div
                  key={hour}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px repeat(7, 1fr)",
                    gap: "4px",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      color: c.textMuted,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "monospace",
                    }}
                  >
                    {String(hour).padStart(2, "0")}h
                  </div>
                  {DAYS.map((d, dayIndex) => {
                    const cell = heatmap.find(
                      (item) => item.day === dayIndex + 1 && item.hour === hour,
                    );
                    const val = Number(cell?.[heatMetric]) || 0;
                    const detail = cell
                      ? `Total: ${cell.total}\nRegistros: ${cell.registrations}\nLikes: ${cell.likes}\nPublicaciones: ${cell.posts}\nHistorias: ${cell.stories}\nComentarios: ${cell.comments}\nChats: ${cell.chats}`
                      : "Sin actividad";
                    return (
                      <div
                        key={d}
                        title={`${DAYS[dayIndex]} ${String(hour).padStart(2, "0")}:00 · ${val} eventos\n${detail}`}
                        style={{
                          height: "22px",
                          borderRadius: "5px",
                          background: heatColor(val, accentHex, heatmapMax),
                          border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                          transition: "background 0.2s",
                          cursor: "help",
                        }}
                      />
                    );
                  })}
                </div>
                );
              })}
              {/* Leyenda */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <span style={{ fontSize: "9px", color: c.textMuted }}>
                  Menos
                </span>
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                  <div
                    key={op}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: `${accentHex}${Math.round(op * 255)
                        .toString(16)
                        .padStart(2, "0")}`,
                    }}
                  />
                ))}
                <span style={{ fontSize: "9px", color: c.textMuted }}>Más</span>
              </div>
            </div>
          </SectionCard>

          {/* 6. Nuevos usuarios diarios */}
          <SectionCard
            title="Nuevos usuarios diarios"
            subtitle="Registros por día esta semana"
            c={c}
            action={
              <div style={{ display: "flex", gap: "5px" }}>
                {["7d", "30d"].map((p) => (
                  <TabChip
                    key={p}
                    label={p}
                    active={newUsersPeriod === p}
                    onClick={() => setNewUsersPeriod(p)}
                    c={c}
                  />
                ))}
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={newUsersPeriod === "7d" ? weeklyActivityResume : monthlyActivityResume}
                margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
              >
                <CartesianGrid stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="dia"
                  tick={{ fill: tickColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip c={c} />}
                  cursor={{ fill: c.accentSoft }}
                />
                <Bar
                  dataKey="nuevos"
                  name="Nuevos usuarios"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                >
                  {weeklyActivityResume.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`${accentHex}${Math.round((0.4 + i * 0.09) * 255)
                        .toString(16)
                        .padStart(2, "0")}`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* 7. Top usuarios (span 2) */}
          <div style={{ display: 'none' }} className="span-2">
            <SectionCard
              title="🏆 Top usuarios"
              subtitle="Usuarios más activos de la comunidad este mes"
              c={c}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr 80px 80px 100px 80px",
                    gap: "12px",
                    padding: "6px 12px",
                    marginBottom: "4px",
                  }}
                >
                  {["#", "Usuario", "Posts", "Likes", "Seguidores", ""].map(
                    (h) => (
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
                    ),
                  )}
                </div>

                {TOP_USERS.map((u, i) => {
                  const { bg } = getAvatar(u.user);
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div
                      key={u.user}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "32px 1fr 80px 80px 100px 80px",
                        gap: "12px",
                        padding: "11px 12px",
                        borderRadius: "12px",
                        alignItems: "center",
                        transition: "background 0.15s",
                        cursor: "default",
                        background:
                          i === 0
                            ? theme === "dark"
                              ? "rgba(123,131,245,0.07)"
                              : "rgba(107,115,240,0.05)"
                            : "transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = c.accentSoft)
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        i === 0
                          ? theme === "dark"
                            ? "rgba(123,131,245,0.07)"
                            : "rgba(107,115,240,0.05)"
                          : "transparent")
                      }
                    >
                      {/* Rank */}
                      <div
                        style={{
                          fontSize: i < 3 ? "18px" : "13px",
                          fontWeight: "700",
                          color: c.textMuted,
                          textAlign: "center",
                        }}
                      >
                        {i < 3 ? medals[i] : i + 1}
                      </div>

                      {/* Usuario */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: `${bg}22`,
                            border: `2px solid ${bg}55`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: bg,
                            flexShrink: 0,
                          }}
                        >
                          {u.user.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: c.text,
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            @{u.user}
                            {u.verified && (
                              <span style={{ fontSize: "11px" }}>✅</span>
                            )}
                          </div>
                          <div style={{ fontSize: "10px", color: c.textMuted }}>
                            Miembro activo
                          </div>
                        </div>
                      </div>

                      {/* Posts */}
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: c.text,
                        }}
                      >
                        {u.posts}
                      </div>

                      {/* Likes */}
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: c.text,
                        }}
                      >
                        {u.likes.toLocaleString()}
                      </div>

                      {/* Seguidores */}
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: c.text,
                          }}
                        >
                          {u.followers}
                        </div>
                        <div
                          style={{
                            height: 3,
                            borderRadius: 2,
                            marginTop: 3,
                            background:
                              theme === "dark"
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(0,0,0,0.06)",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(u.followers / TOP_USERS[0].followers) * 100}%`,
                              background: accentHex,
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      </div>

                      {/* Badge */}
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "3px 9px",
                            borderRadius: "20px",
                            background: i === 0 ? c.accentMedium : c.accentSoft,
                            color: c.accent,
                          }}
                        >
                          {i === 0 ? "⭐ Top" : "Activo"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
          <div className="span-2">
            <UsersByCountryChart />
          </div>
        </div>
        {/* end analytics-grid */}
      </main>
    </>
  );
};

export default Analytics;
