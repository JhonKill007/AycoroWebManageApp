import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { MessageAnalytics, MessageAnalyticsPeriod } from "../Models/Analytics/MessageAnalyticsModel";
import { UsageTimeAnalytics, UsageTimePeriod } from "../Models/Analytics/UsageTimeAnalyticsModel";
import { SessionAccessAnalytics } from "../Models/SessionLog/SessionLogModel";
import UsersByCountryChart from "../Modules/Card/UsersByCountryChart";
import analyticsService from "../Services/Analytics/AnalyticsService";
import ExportAnalyticsModal from "../Modules/Analytics/ExportAnalyticsModal";
import UserProfile from "../assets/UserProfile.jpeg";

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



const emptyBusiness = {
  retention: {
    d1: { cohort: 0, returned: 0, rate: 0 },
    d7: { cohort: 0, returned: 0, rate: 0 },
    d15: { cohort: 0, returned: 0, rate: 0 },
    d30: { cohort: 0, returned: 0, rate: 0 },
    weekly: [] as Array<{ semana: string; retencion: number; cohort: number }>,
  },
  funnel: {
    registered: 0,
    eligible: 0,
    validated: 0,
    posted: 0,
    returnedD1: 0,
  },
  activeUsers: {
    dau: 0,
    mau: 0,
    source: "SessionLog",
  },
  topUsers: [] as Array<{
    user: string;
    name: string;
    profilePhoto?: string | null;
    posts: number;
    likes: number;
    followers: number;
    verified: boolean;
  }>,
  topUsersMeta: {
    ranking: "",
    period: { label: "Mes actual" },
    followNote: "",
  },
  loadError: false,
};

type DailyActivePoint = {
  dateKey: string;
  dia: string;
  dau: number;
  nuevosActivos: number;
  recurrentes: number;
};

type GlobalPeriodPreset =
  | "this_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year";

const GLOBAL_PERIOD_OPTIONS: Array<{ value: GlobalPeriodPreset; label: string }> = [
  { value: "this_month", label: "Este mes" },
  { value: "last_3_months", label: "Últimos 3 meses" },
  { value: "last_6_months", label: "Últimos 6 meses" },
  { value: "this_year", label: "Este año" },
];

const emptyPeriodOverview = {
  period: {
    preset: "this_month" as GlobalPeriodPreset,
    label: "Este mes",
    shortLabel: "Este mes",
    granularity: "day" as "day" | "month",
    comparisonNote: "",
    elapsedDays: 0,
  },
  flow: {
    users: { current: 0, previous: 0, change: null as number | null, shareOfHistorical: 0 },
    posts: { current: 0, previous: 0, change: null as number | null },
    chats: { current: 0, previous: 0, change: null as number | null },
    interactions: { current: 0, previous: 0, change: null as number | null },
    newEligibleInPeriod: 0,
  },
  snapshots: {
    eligibleCurrent: 0,
    activeStatus: 0,
    historicalUsers: 0,
    historicalPosts: 0,
    historicalChats: 0,
    historicalInteractions: 0,
    livePosts: 0,
    note: "",
  },
  funnel: {
    registered: 0,
    eligible: 0,
    validated: 0,
    posted: 0,
  },
  activeUsers: {
    dauAverage: 0,
    dauToday: 0,
    mau: 0,
    uniqueActiveInPeriod: 0,
    activeAuthorsInPeriod: 0,
    dauAverageNote: "",
    mauNote: "",
    uniqueActiveNote: "",
    activeAuthorsNote: "",
  },
  retention: {
    d1: { cohort: 0, returned: 0, rate: 0, insufficient: true },
    d7: { cohort: 0, returned: 0, rate: 0, insufficient: true },
    d15: { cohort: 0, returned: 0, rate: 0, insufficient: true },
    d30: { cohort: 0, returned: 0, rate: 0, insufficient: true },
    note: "",
  },
  growth: {
    granularity: "day" as "day" | "month",
    xKey: "dia",
    series: [] as any[],
    summary: {
      totalUsers: 0,
      totalPosts: 0,
      avgUsersPerDay: 0,
      avgPostsPerDay: 0,
      usersChange: null as number | null,
      postsChange: null as number | null,
      bestMonth: null as null | { label: string; usuarios: number },
    },
  },
};

const formatTrend = (change: number | null | undefined) =>
  change === null || change === undefined ? "N/D" : change;

const retentionValue = (row?: {
  rate?: number;
  insufficient?: boolean;
}) => (row?.insufficient ? "Sin datos" : `${row?.rate ?? 0}%`);

const retentionSub = (
  row: { returned?: number; cohort?: number; insufficient?: boolean } | undefined,
  suffix: string,
) =>
  row?.insufficient
    ? "Sin datos suficientes (cohortes inmaduras)"
    : `${row?.returned ?? 0}/${row?.cohort ?? 0} ${suffix}`;

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
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div
      className="analytics-kpi-card"
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: "18px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          minWidth: 0,
        }}
      >
        <div
          className="analytics-kpi-icon"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: col.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          {emoji}
        </div>
        {trend !== null && trend !== undefined && (
          <span
            className="analytics-kpi-trend"
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color:
                trend === "N/D"
                  ? c.textMuted
                  : trend >= 0
                    ? c.success
                    : c.danger,
              background:
                trend === "N/D"
                  ? c.border
                  : trend >= 0
                    ? c.successSoft
                    : c.dangerSoft,
              padding: "3px 9px",
              borderRadius: "20px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {trend === "N/D"
              ? "N/D"
              : `${trend >= 0 ? "↑" : "↓"} ${Math.abs(Number(trend))}%`}
          </span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          className="analytics-kpi-value"
          style={{
            fontSize: "26px",
            fontWeight: "800",
            color: col.text,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {displayValue}
        </div>
        <div
          className="analytics-kpi-label"
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: c.text,
            marginTop: "6px",
            lineHeight: 1.35,
            overflowWrap: "anywhere",
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            className="analytics-kpi-sub"
            style={{
              fontSize: "11px",
              color: c.textMuted,
              marginTop: "2px",
              lineHeight: 1.35,
              overflowWrap: "anywhere",
            }}
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
        minWidth: 0,
      }}
    >
      <div
        className="analytics-section-header"
        style={{
          padding: "18px 22px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 180px" }}>
          <div style={{ fontSize: "14px", fontWeight: "800", color: c.text }}>
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: "11px",
                color: c.textMuted,
                marginTop: "2px",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {action && (
          <div
            className="analytics-section-actions"
            style={{ flex: "1 1 220px", minWidth: 0 }}
          >
            {action}
          </div>
        )}
      </div>
      <div className="analytics-section-body" style={{ padding: "20px 22px" }}>
        {children}
      </div>
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
  total: number;
  change: number;
  historicalTotal?: number;
  shareOfHistorical?: number;
  growthMom?: number;
  eligibleCurrent?: number;
  activeStatus?: number;
  liveCurrent?: number;
};


type WeeklyResume = {
  dia: string;
  posts: number
  likes: number
  comentarios: number
  nuevos: number
};

const emptyUsageTime: UsageTimeAnalytics = {
  periodDays: 7,
  averageUsageSeconds: 0,
  activeUsers: 0,
  activeUserDays: 0,
  totalUsageSeconds: 0,
  completedSessions: 0,
  authenticatedUsageSessions: 0,
  legacyUsageSessions: 0,
  daily: [],
};

const USAGE_PERIODS: Array<{ value: UsageTimePeriod; label: string }> = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
];

function formatUsageDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes <= 0) return `${remainder} s`;
  if (remainder === 0) return `${minutes} min`;
  return `${minutes} min ${remainder} s`;
}

const emptySessionAccess: SessionAccessAnalytics = {
  days: 30,
  totalSessions: 0,
  uniqueUsers: 0,
  averageSessionsPerUser: 0,
  averageSessionsPerDay: 0,
  averageUniqueUsersPerDay: 0,
  averagesNote: "",
  includesPartialToday: true,
  series: [],
  topUsers: [],
};

const emptyMessageAnalytics: MessageAnalytics = {
  period: 30,
  granularity: "day",
  totalMessages: 0,
  uniqueUsers: 0,
  averageMessagesPerUser: 0,
  averageMessagesPerDay: 0,
  averageUniqueSendersPerDay: 0,
  averagesNote: "",
  includesPartialToday: true,
  averageDays: 0,
  series: [],
  topUsers: [],
};

const MESSAGE_PERIODS: Array<{ value: MessageAnalyticsPeriod; label: string }> = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
  { value: "all", label: "Todo" },
];

// ─── Componente principal ─────────────────────────────────────────────
const Analytics = () => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [dataForMonth, setDataForMonth] = useState<any[]>([]);
  const [growthSelectedMonthData, setGrowthSelectedMonthData] = useState<any[]>([]);
  const [growthPreviousMonthData, setGrowthPreviousMonthData] = useState<any[]>([]);
  const [growthYearData, setGrowthYearData] = useState<any[]>([]);
  const [growthPreviousYearData, setGrowthPreviousYearData] = useState<any[]>([]);
  const [growthYearsCatalog, setGrowthYearsCatalog] = useState<
    Array<{ year: number; data: any[] }>
  >([]);

  const initialMonthlyResume: MonthlyResume = {
    thisMonth: 0,
    lastMonth: 0,
    total: 0,
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
  const [globalPeriod, setGlobalPeriod] =
    useState<GlobalPeriodPreset>("this_month");
  const [periodOverview, setPeriodOverview] = useState(emptyPeriodOverview);
  const [periodLoading, setPeriodLoading] = useState(true);
  const [periodError, setPeriodError] = useState(false);

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );

  const [activityPeriod, setActivityPeriod] = useState<string>("7d");
  const [newUsersPeriod, setNewUsersPeriod] = useState<string>("7d");
  const [dailyActivePeriod, setDailyActivePeriod] = useState<string>("7d");
  const [dailyActive, setDailyActive] = useState<{
    days7: DailyActivePoint[];
    days30: DailyActivePoint[];
  }>({ days7: [], days30: [] });
  const [dailyActiveLoading, setDailyActiveLoading] = useState(false);
  const [dailyActiveError, setDailyActiveError] = useState(false);
  const [sessionAccessPeriod, setSessionAccessPeriod] = useState<number>(7);
  const [sessionAccess, setSessionAccess] =
    useState<SessionAccessAnalytics>(emptySessionAccess);
  const [usagePeriod, setUsagePeriod] = useState<UsageTimePeriod>(7);
  const [usageTime, setUsageTime] = useState<UsageTimeAnalytics>(emptyUsageTime);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState(false);
  const [messagePeriod, setMessagePeriod] =
    useState<MessageAnalyticsPeriod>(7);
  const [messageAnalytics, setMessageAnalytics] =
    useState<MessageAnalytics>(emptyMessageAnalytics);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [heatMetric, setHeatMetric] = useState<HeatMetric>("total");

  const [devices, setDevices] = useState<Device[]>([]);
  const [genderUsers, setGenderUsers] = useState<PieDatum[]>([]);
  const [genderPosts, setGenderPosts] = useState<PieDatum[]>([]);
  const [business, setBusiness] = useState(emptyBusiness);
  const [exportOpen, setExportOpen] = useState(false);
  const [monthlyLoadError, setMonthlyLoadError] = useState(false);

  useEffect(() => {
    const getDeviceData = async () => {
      const { data } = await analyticsService.getDeviceData(sessionAccessPeriod);
      setDevices([
        { name: "Android", value: data?.android || 0, color: "#34d399" },
        { name: "iOS", value: data?.ios || 0, color: "#7b83f5" },
        { name: "Web", value: data?.web || 0, color: "#38bdf8" },
        { name: "Otros", value: data?.others || 0, color: "#94a3b8" },
      ]);
    };
    getDeviceData();
  }, [sessionAccessPeriod]);

  useEffect(() => {
    const getGenderData = async () => {
      const { data } = await analyticsService.getGenderData();
      setGenderUsers(data.users || []);
      setGenderPosts(data.posts || []);
    };

    getGenderData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const getActivityResume = async () => {
      setDailyActiveLoading(true);
      setDailyActiveError(false);
      try {
        const { data } = await analyticsService.getActivityResume();
        if (cancelled) return;
        setWeeklyActivityResume(data.weekly);
        setMonthlyActivityResume(data.monthly);
        setHeatmap(Array.isArray(data.heatmap) ? data.heatmap : []);
        setDailyActive({
          days7: Array.isArray(data?.dailyActive?.days7)
            ? data.dailyActive.days7
            : [],
          days30: Array.isArray(data?.dailyActive?.days30)
            ? data.dailyActive.days30
            : [],
        });
      } catch {
        if (!cancelled) setDailyActiveError(true);
      } finally {
        if (!cancelled) setDailyActiveLoading(false);
      }
    };

    getActivityResume();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const getSessionAccess = async () => {
      try {
        const { data } = await analyticsService.getSessionAccess(
          sessionAccessPeriod,
        );
        if (cancelled) return;
        setSessionAccess({
          ...emptySessionAccess,
          ...(data || {}),
          series: Array.isArray(data?.series) ? data.series : [],
          topUsers: Array.isArray(data?.topUsers) ? data.topUsers : [],
        });
      } catch {
        if (!cancelled) setSessionAccess(emptySessionAccess);
      }
    };

    getSessionAccess();
    return () => {
      cancelled = true;
    };
  }, [sessionAccessPeriod]);

  useEffect(() => {
    let cancelled = false;
    const getUsageTime = async () => {
      setUsageLoading(true);
      setUsageError(false);
      try {
        const { data } = await analyticsService.getUsageTime(usagePeriod);
        if (!cancelled) setUsageTime(data || emptyUsageTime);
      } catch {
        if (!cancelled) {
          setUsageTime(emptyUsageTime);
          setUsageError(true);
        }
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    };

    getUsageTime();
    return () => {
      cancelled = true;
    };
  }, [usagePeriod]);

  useEffect(() => {
    let cancelled = false;
    const getMessageAnalytics = async () => {
      // Clear previous period so KPIs/cards never mix while loading.
      setMessageAnalytics({
        ...emptyMessageAnalytics,
        period: messagePeriod,
      });
      try {
        const { data } = await analyticsService.getMessageAnalytics(messagePeriod);
        if (cancelled) return;
        setMessageAnalytics({
          ...emptyMessageAnalytics,
          ...(data || {}),
          period: data?.period ?? messagePeriod,
          series: Array.isArray(data?.series) ? data.series : [],
          topUsers: Array.isArray(data?.topUsers) ? data.topUsers : [],
        });
      } catch {
        if (!cancelled) {
          setMessageAnalytics({
            ...emptyMessageAnalytics,
            period: messagePeriod,
          });
        }
      }
    };

    getMessageAnalytics();
    return () => {
      cancelled = true;
    };
  }, [messagePeriod]);

  const heatmapMax = Math.max(
    1,
    ...heatmap.map((cell) => Number(cell[heatMetric]) || 0),
  );

  const usersMomGrowth = formatTrend(periodOverview.flow.users.change);
  const registrationsShareThisMonth = Number(
    periodOverview.flow.users.shareOfHistorical || 0,
  );

  useEffect(() => {
    const getMonthlyData = async () => {
      try {
        const { data } = await analyticsService.getMonthlyData();
        setMonthlyResume(data);
        setMonthlyLoadError(false);
      } catch {
        setMonthlyLoadError(true);
      }
    };
    getMonthlyData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadPeriod = async () => {
      setPeriodLoading(true);
      setPeriodError(false);
      try {
        const { data } = await analyticsService.getPeriodOverview(globalPeriod);
        if (cancelled) return;
        setPeriodOverview({
          ...emptyPeriodOverview,
          ...data,
          period: { ...emptyPeriodOverview.period, ...(data?.period || {}) },
          flow: {
            ...emptyPeriodOverview.flow,
            ...(data?.flow || {}),
            users: {
              ...emptyPeriodOverview.flow.users,
              ...(data?.flow?.users || {}),
            },
            posts: {
              ...emptyPeriodOverview.flow.posts,
              ...(data?.flow?.posts || {}),
            },
            chats: {
              ...emptyPeriodOverview.flow.chats,
              ...(data?.flow?.chats || {}),
            },
            interactions: {
              ...emptyPeriodOverview.flow.interactions,
              ...(data?.flow?.interactions || {}),
            },
          },
          snapshots: {
            ...emptyPeriodOverview.snapshots,
            ...(data?.snapshots || {}),
          },
          funnel: { ...emptyPeriodOverview.funnel, ...(data?.funnel || {}) },
          activeUsers: {
            ...emptyPeriodOverview.activeUsers,
            ...(data?.activeUsers || {}),
          },
          retention: {
            ...emptyPeriodOverview.retention,
            ...(data?.retention || {}),
            d1: {
              ...emptyPeriodOverview.retention.d1,
              ...(data?.retention?.d1 || {}),
            },
            d7: {
              ...emptyPeriodOverview.retention.d7,
              ...(data?.retention?.d7 || {}),
            },
            d15: {
              ...emptyPeriodOverview.retention.d15,
              ...(data?.retention?.d15 || {}),
            },
            d30: {
              ...emptyPeriodOverview.retention.d30,
              ...(data?.retention?.d30 || {}),
            },
          },
          growth: {
            ...emptyPeriodOverview.growth,
            ...(data?.growth || {}),
            summary: {
              ...emptyPeriodOverview.growth.summary,
              ...(data?.growth?.summary || {}),
            },
          },
        });
      } catch {
        if (!cancelled) {
          setPeriodError(true);
          setPeriodOverview(emptyPeriodOverview);
          showToast({
            type: "error",
            title: "Error de Analytics",
            description:
              "No se pudieron cargar las métricas del período seleccionado.",
          });
        }
      } finally {
        if (!cancelled) setPeriodLoading(false);
      }
    };
    loadPeriod();
    return () => {
      cancelled = true;
    };
  }, [globalPeriod, showToast]);

  useEffect(() => {
    const getGrowthData = async () => {
      try {
        const { data } =
          growthPeriod === "month"
            ? await analyticsService.getGrowthDataByMonth(
                selectedYear,
                selectedMonth,
              )
            : await analyticsService.getGrowthData(selectedYear);
        setDataForMonth(data || []);
      } catch {
        setDataForMonth([]);
      }
    };
    getGrowthData();
  }, [growthPeriod, selectedMonth, selectedYear]);

  useEffect(() => {
    const getGrowthYearComparison = async () => {
      try {
        const [currentYearResponse, previousYearResponse] = await Promise.all([
          analyticsService.getGrowthData(selectedYear),
          analyticsService.getGrowthData(selectedYear - 1),
        ]);
        setGrowthYearData(currentYearResponse.data || []);
        setGrowthPreviousYearData(previousYearResponse.data || []);
      } catch {
        setGrowthYearData([]);
        setGrowthPreviousYearData([]);
      }
    };
    getGrowthYearComparison();
  }, [selectedYear]);

  useEffect(() => {
    const getGrowthYearsCatalog = async () => {
      const startYear = 2025;
      const catalogCurrentYear = new Date().getFullYear();
      const years = Array.from(
        { length: Math.max(1, catalogCurrentYear - startYear + 1) },
        (_, index) => startYear + index,
      );
      try {
        const responses = await Promise.all(
          years.map(async (year) => {
            const { data } = await analyticsService.getGrowthData(year);
            return { year, data: data || [] };
          }),
        );
        setGrowthYearsCatalog(responses);
      } catch {
        setGrowthYearsCatalog([]);
      }
    };
    getGrowthYearsCatalog();
  }, []);

  useEffect(() => {
    const getGrowthMonthComparison = async () => {
      const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const previousMonthYear =
        selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      try {
        const [currentMonthResponse, previousMonthResponse] = await Promise.all([
          analyticsService.getGrowthDataByMonth(selectedYear, selectedMonth),
          analyticsService.getGrowthDataByMonth(
            previousMonthYear,
            previousMonth,
          ),
        ]);
        setGrowthSelectedMonthData(currentMonthResponse.data || []);
        setGrowthPreviousMonthData(previousMonthResponse.data || []);
      } catch {
        setGrowthSelectedMonthData([]);
        setGrowthPreviousMonthData([]);
      }
    };
    getGrowthMonthComparison();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const getBusiness = async () => {
      try {
        const { data } = await analyticsService.getBusinessAnalytics();
        setBusiness({
          retention: {
            ...emptyBusiness.retention,
            ...(data?.retention || {}),
            d15: data?.retention?.d15 || emptyBusiness.retention.d15,
          },
          funnel: {
            ...emptyBusiness.funnel,
            ...(data?.funnel || {}),
          },
          activeUsers: {
            ...emptyBusiness.activeUsers,
            ...(data?.activeUsers || {}),
          },
          topUsers: data?.topUsers || [],
          topUsersMeta: {
            ...emptyBusiness.topUsersMeta,
            ...(data?.topUsersMeta || {}),
          },
          loadError: false,
        });
      } catch {
        setBusiness({ ...emptyBusiness, loadError: true });
        showToast({
          type: "error",
          title: "Error de Analytics",
          description:
            "No se pudieron cargar top usuarios u otras métricas de negocio.",
        });
      }
    };
    getBusiness();
  }, [showToast]);

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

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / 86400000);
  };
  const isLeapYear = (year: number) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonth,
    0,
  ).getDate();
  const getGrowthTotal = (items: any[]) =>
    items.reduce(
      (sum: number, item: any) => sum + (Number(item?.[growthMetric]) || 0),
      0,
    );
  const getGrowthActiveDays = (items: any[]) =>
    items.filter((item: any) => (Number(item?.[growthMetric]) || 0) > 0)
      .length;
  const getPercentChange = (current: number, previous: number) => {
    if (!previous) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  const growthSelectedMonthTotal = getGrowthTotal(growthSelectedMonthData);
  const growthPreviousMonthTotal = getGrowthTotal(growthPreviousMonthData);
  const growthYearTotal = getGrowthTotal(growthYearData);
  const growthPreviousYearTotal = getGrowthTotal(growthPreviousYearData);
  const growthMetricTotal =
    growthPeriod === "month" ? growthSelectedMonthTotal : growthYearTotal;
  const growthActiveDays =
    growthPeriod === "month"
      ? getGrowthActiveDays(growthSelectedMonthData)
      : getGrowthActiveDays(growthYearData);
  const growthAverageDays =
    growthPeriod === "month"
      ? growthActiveDays
      : selectedYear === currentYear
        ? getDayOfYear(currentDate)
        : isLeapYear(selectedYear)
          ? 366
          : 365;
  const growthMonthChange = getPercentChange(
    growthSelectedMonthTotal,
    growthPreviousMonthTotal,
  );
  const growthYearChange = getPercentChange(
    growthYearTotal,
    growthPreviousYearTotal,
  );
  const growthFullPeriodDays =
    growthPeriod === "month"
      ? daysInSelectedMonth
      : isLeapYear(selectedYear)
        ? 366
        : 365;
  const growthDailyAverage =
    growthAverageDays > 0 ? growthMetricTotal / growthAverageDays : 0;
  const growthFullPeriodAverage =
    growthFullPeriodDays > 0 ? growthMetricTotal / growthFullPeriodDays : 0;
  const growthUnit =
    growthMetric === "publicaciones" ? "publicaciones/dia" : "registros/dia";
  const growthTotalUnit =
    growthMetric === "publicaciones" ? "publicaciones" : "registros";
  const growthDailyAverageLabel = `${growthDailyAverage.toLocaleString("es-DO", {
    maximumFractionDigits: 1,
  })} ${growthUnit}`;
  const growthFullPeriodAverageLabel = `${growthFullPeriodAverage.toLocaleString("es-DO", {
    maximumFractionDigits: 1,
  })} ${growthUnit}`;
  const growthFullPeriodLabel =
    growthPeriod === "month" ? "Promedio mes completo" : "Promedio ano completo";
  const monthLabels = MONTH_OPTIONS.map((month) => month.slice(0, 3));
  const bestGrowthMonth = growthYearData.reduce(
    (best, item, index) => {
      const total = Number(item?.[growthMetric]) || 0;
      const monthIndex = index;
      const days = new Date(selectedYear, monthIndex + 1, 0).getDate();
      const average = days > 0 ? total / days : 0;

      return average > best.average
        ? {
            label: item?.mes || monthLabels[monthIndex] || `Mes ${monthIndex + 1}`,
            total,
            average,
            period: String(selectedYear),
          }
        : best;
    },
    {
      label: "-",
      total: 0,
      average: 0,
      period: String(selectedYear),
    },
  );
  const bestGrowthYear = growthYearsCatalog.reduce(
    (best, item) => {
      const total = getGrowthTotal(item.data);
      const days = isLeapYear(item.year) ? 366 : 365;
      const average = days > 0 ? total / days : 0;

      return average > best.average
        ? {
            label: String(item.year),
            total,
            average,
            period: String(item.year),
          }
        : best;
    },
    {
      label: "-",
      total: 0,
      average: 0,
      period: "-",
    },
  );
  const bestGrowthPeriod =
    growthPeriod === "month" ? bestGrowthMonth : bestGrowthYear;
  const formatGrowthNumber = (value: number, decimals = 0) =>
    value.toLocaleString("es-DO", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  const renderGrowthMetric = ({
    label,
    value,
    sub,
    trend,
    accent = activeMC.color,
  }: {
    label: string;
    value: string;
    sub?: string;
    trend?: number;
    accent?: string;
  }) => {
    const hasTrend = typeof trend === "number";
    const trendColor = hasTrend && trend >= 0 ? c.success : c.danger;

    return (
      <div
        style={{
          minWidth: 180,
          flex: "1 1 180px",
          padding: "12px 14px",
          borderRadius: 16,
          border: `1px solid ${c.border}`,
          background: c.inputBackground,
        }}
      >
        <div
          style={{
            color: c.textMuted,
            fontSize: 10,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 5,
          }}
        >
          {label}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span style={{ color: accent, fontSize: 18, fontWeight: 900 }}>
            {value}
          </span>
          {hasTrend && (
            <span
              style={{
                color: trendColor,
                background: `${trendColor}1f`,
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 11,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(2)}%
            </span>
          )}
        </div>
        {sub && (
          <div style={{ color: c.textMuted, fontSize: 11, marginTop: 5 }}>
            {sub}
          </div>
        )}
      </div>
    );
  };

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
          min-width: 0;
        }
        .analytics-grid .span-2 { grid-column: span 2; min-width: 0; }

        .analytics-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          width: 100%;
          margin-bottom: 22px;
          min-width: 0;
        }

        .analytics-section-actions > div {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

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

        @media (max-width: 1100px) {
          .analytics-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 800px) {
          .analytics-grid { grid-template-columns: 1fr; }
          .analytics-grid .span-2 { grid-column: span 1; }
          .analytics-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .analytics-section-actions > div { justify-content: flex-start; }
          .analytics-kpi-card { padding: 16px !important; }
          .analytics-kpi-value { font-size: 22px !important; }
        }

        @media (max-width: 520px) {
          .analytics-kpi-grid { grid-template-columns: 1fr; gap: 10px; }
          .session-daily-averages { grid-template-columns: 1fr !important; }
          .analytics-kpi-card { padding: 14px !important; gap: 8px !important; }
          .analytics-kpi-icon { width: 36px !important; height: 36px !important; font-size: 17px !important; }
          .analytics-kpi-value { font-size: 24px !important; }
          .analytics-section-body { padding: 16px !important; }
        }
      `}</style>

      <main
        className="analytics-page"
        style={{
          flex: 1,
          overflow: "auto",
          padding: "26px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          minWidth: 0,
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
              Variación vs período comparable:{" "}
              <strong style={{ color: c.accent }}>
                {usersMomGrowth === "N/D" ? "N/D" : `${usersMomGrowth}%`}
              </strong>
              {" · "}
              Participación sobre histórico:{" "}
              <strong style={{ color: c.accent }}>
                {registrationsShareThisMonth}%
              </strong>
              {" · "}
              {periodOverview.period.label}
              {periodLoading
                ? " · Cargando…"
                : periodError || business.loadError
                  ? " · Algunas métricas no pudieron cargarse."
                  : ""}
            </div>
          </div>
          <button className="pill-cta" onClick={() => setExportOpen(true)}>
            Exportar →
          </button>
        </div>

        {exportOpen && (
          <ExportAnalyticsModal
            c={c}
            theme={theme === "dark" ? "dark" : "light"}
            initialPeriod={globalPeriod}
            onClose={() => setExportOpen(false)}
            onError={(description) =>
              showToast({ type: "error", title: "Exportación", description })
            }
            onSuccess={(description) =>
              showToast({ type: "success", title: "Exportación", description })
            }
          />
        )}

        {/* ── Global period selector ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              gap: 4,
              padding: 4,
              borderRadius: 14,
              border: `1.5px solid ${c.border}`,
              background: theme === "dark" ? "rgba(255,255,255,0.03)" : c.card,
            }}
            role="tablist"
            aria-label="Período de Analytics"
          >
            {GLOBAL_PERIOD_OPTIONS.map((opt) => {
              const active = globalPeriod === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setGlobalPeriod(opt.value)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    color: active ? "#fff" : c.textMuted,
                    background: active ? c.accent : "transparent",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: c.textMuted }}>
            {periodLoading
              ? "Actualizando métricas…"
              : periodOverview.period.label}
          </div>
        </div>

        {/* ── KPI Cards (global period) ── */}
        <div
          className="analytics-kpi-grid"
          style={{ opacity: periodLoading ? 0.55 : 1, transition: "opacity 0.2s" }}
        >
          <KpiCard
            emoji="👥"
            label={`Nuevos registros · ${periodOverview.period.shortLabel}`}
            value={periodLoading ? "…" : periodOverview.flow.users.current}
            sub="cuentas creadas en el período"
            trend={periodLoading ? undefined : formatTrend(periodOverview.flow.users.change)}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="✅"
            label="Usuarios válidos"
            value={periodLoading ? "…" : periodOverview.snapshots.eligibleCurrent}
            sub="Snapshot a hoy · ACTIVE+INACTIVE+SUSPENDED"
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="🌱"
            label="Nuevos válidos del período"
            value={periodLoading ? "…" : periodOverview.flow.newEligibleInPeriod}
            sub="registros del período que siguen elegibles"
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="🟢"
            label="DAU promedio"
            value={periodLoading ? "…" : periodOverview.activeUsers.dauAverage}
            sub={periodOverview.activeUsers.dauAverageNote || "promedio diario SessionLog"}
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="📆"
            label="MAU (snapshot 30d)"
            value={periodLoading ? "…" : periodOverview.activeUsers.mau}
            sub={periodOverview.activeUsers.mauNote || "ventana móvil 30d actual"}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="📝"
            label={`Publicaciones · ${periodOverview.period.shortLabel}`}
            value={periodLoading ? "…" : periodOverview.flow.posts.current}
            sub="creadas en el período"
            trend={periodLoading ? undefined : formatTrend(periodOverview.flow.posts.change)}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="💬"
            label={`Conversaciones · ${periodOverview.period.shortLabel}`}
            value={periodLoading ? "…" : periodOverview.flow.chats.current}
            sub="chats creados en el período"
            trend={periodLoading ? undefined : formatTrend(periodOverview.flow.chats.change)}
            colorKey="accent"
            c={c}
          />
        </div>

        {/* Fila puente: asegura que retención ocupe la siguiente fila completa */}
        <div
          className="analytics-kpi-grid"
          style={{ opacity: periodLoading ? 0.55 : 1, transition: "opacity 0.2s" }}
        >
          <KpiCard
            emoji="❤️"
            label={`Interacciones · ${periodOverview.period.shortLabel}`}
            value={periodLoading ? "…" : periodOverview.flow.interactions.current}
            sub="likes + comentarios en el período"
            trend={
              periodLoading
                ? undefined
                : formatTrend(periodOverview.flow.interactions.change)
            }
            colorKey="warning"
            c={c}
          />
          <KpiCard
            emoji="🆕"
            label="% del histórico"
            value={periodLoading ? "…" : `${registrationsShareThisMonth}%`}
            sub={`${periodOverview.flow.users.current.toLocaleString()} de ${periodOverview.snapshots.historicalUsers.toLocaleString()} registros históricos`}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="👤"
            label={`Usuarios activos · ${periodOverview.period.shortLabel}`}
            value={
              periodLoading
                ? "…"
                : periodOverview.activeUsers.uniqueActiveInPeriod
            }
            sub={
              periodOverview.activeUsers.uniqueActiveNote ||
              "únicos con SessionLog en el período"
            }
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="✍️"
            label={`Autores activos · ${periodOverview.period.shortLabel}`}
            value={
              periodLoading
                ? "…"
                : periodOverview.activeUsers.activeAuthorsInPeriod
            }
            sub={
              periodOverview.activeUsers.activeAuthorsNote ||
              "elegibles con ≥1 post LIVE en el período"
            }
            colorKey="accent"
            c={c}
          />
        </div>

        {/* Retención: fila completa de 4 columnas en escritorio */}
        <div
          className="analytics-kpi-grid analytics-retention-row"
          style={{ opacity: periodLoading ? 0.55 : 1, transition: "opacity 0.2s" }}
        >
          <KpiCard
            emoji="📈"
            label="Retención D1"
            value={periodLoading ? "…" : retentionValue(periodOverview.retention.d1)}
            sub={retentionSub(periodOverview.retention.d1, "· cohortes del período")}
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="📅"
            label="Retención D7"
            value={periodLoading ? "…" : retentionValue(periodOverview.retention.d7)}
            sub={retentionSub(periodOverview.retention.d7, "· cohortes del período")}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="🗓️"
            label="Retención D15"
            value={periodLoading ? "…" : retentionValue(periodOverview.retention.d15)}
            sub={retentionSub(periodOverview.retention.d15, "· cohortes del período")}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="⏳"
            label="Retención D30"
            value={periodLoading ? "…" : retentionValue(periodOverview.retention.d30)}
            sub={retentionSub(periodOverview.retention.d30, "· cohortes del período")}
            colorKey="warning"
            c={c}
          />
        </div>

        {/* ── Snapshots de referencia (no filtrados por período) ── */}
        <div className="analytics-kpi-grid">
          <KpiCard
            emoji="👥"
            label="Registros históricos"
            value={periodOverview.snapshots.historicalUsers}
            sub="referencia · no filtrado por período"
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="📝"
            label="Publicaciones históricas"
            value={periodOverview.snapshots.historicalPosts}
            sub={`LIVE ahora: ${periodOverview.snapshots.livePosts ?? "—"}`}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="💬"
            label="Conversaciones históricas"
            value={periodOverview.snapshots.historicalChats}
            sub="referencia · todos los tiempos"
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="❤️"
            label="Interacciones históricas"
            value={periodOverview.snapshots.historicalInteractions}
            sub="referencia · likes + comentarios"
            colorKey="warning"
            c={c}
          />
        </div>

        <div className="analytics-kpi-grid">
          <KpiCard
            emoji="🧾"
            label="Funnel · Registrados"
            value={periodOverview.funnel.registered}
            sub="snapshot histórico"
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="✔️"
            label="Funnel · Válidos"
            value={periodOverview.funnel.eligible ?? 0}
            sub="snapshot a hoy"
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="📧"
            label="Funnel · Validados"
            value={periodOverview.funnel.validated}
            sub="IsValidated = true · snapshot"
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="📤"
            label="Funnel · Con publicación"
            value={periodOverview.funnel.posted}
            sub="al menos 1 post LIVE · snapshot"
            colorKey="warning"
            c={c}
          />
        </div>

        <div className="analytics-grid">

          {/* 1. Crecimiento (span 2) — independiente del filtro global */}
          <div className="span-2">
            <SectionCard
              title="Crecimiento de la comunidad"
              subtitle="Evolución de usuarios y publicaciones · filtros propios del gráfico"
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
                    name={growthMetric === "usuarios" ? "Registros" : activeMC.label}
                  />
                  {growthMetric === "usuarios" && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="activos"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="transparent"
                        dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
                        name="Activos"
                      />
                      <Area
                        type="monotone"
                        dataKey="inactivos"
                        stroke="#f87171"
                        strokeWidth={2}
                        fill="transparent"
                        dot={{ r: 3, fill: "#f87171", strokeWidth: 0 }}
                        name="Eliminados o baneados"
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
              {growthMetric === "usuarios" && (
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
                  {[
                    { label: "Registros", color: activeMC.color },
                    { label: "Activos", color: "#22c55e" },
                    { label: "Eliminados o baneados", color: "#f87171" },
                  ].map((item) => (
                    <span key={item.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.textMuted, fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
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
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "12px",
                }}
              >
                {renderGrowthMetric({
                  label: "Promedio actual",
                  value: growthDailyAverageLabel,
                  sub:
                    growthPeriod === "month"
                      ? "Según los días con registros del período"
                      : "Según los días cursados del año",
                })}
                {renderGrowthMetric({
                  label: growthFullPeriodLabel,
                  value: growthFullPeriodAverageLabel,
                  sub:
                    growthPeriod === "month"
                      ? "Divide entre todos los días del mes"
                      : "Divide entre todos los días del año",
                  accent: c.text,
                })}
                {renderGrowthMetric({
                  label: "Total mes seleccionado",
                  value: formatGrowthNumber(growthSelectedMonthTotal),
                  sub: "Comparado con el mes anterior",
                  trend: growthMonthChange,
                })}
                {renderGrowthMetric({
                  label: "Total año seleccionado",
                  value: formatGrowthNumber(growthYearTotal),
                  sub: "Comparado con el año anterior",
                  trend: growthYearChange,
                })}
                {renderGrowthMetric({
                  label:
                    growthPeriod === "month"
                      ? "Mejor promedio mensual"
                      : "Mejor promedio anual",
                  value: `${formatGrowthNumber(bestGrowthPeriod.average, 1)} ${growthUnit}`,
                  sub:
                    growthPeriod === "month"
                      ? `${bestGrowthPeriod.label} ${bestGrowthPeriod.period} · Total ${formatGrowthNumber(bestGrowthPeriod.total)} ${growthTotalUnit}`
                      : `Año ${bestGrowthPeriod.period} · Total ${formatGrowthNumber(bestGrowthPeriod.total)} ${growthTotalUnit}`,
                  accent: c.success,
                })}
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
                  {(sessionAccess.averageUniqueUsersPerDay ?? 0) > 0 && (
                    <ReferenceLine
                      y={sessionAccess.averageUniqueUsersPerDay}
                      stroke={c.success}
                      strokeDasharray="4 4"
                      strokeOpacity={0.55}
                    />
                  )}
                  {(sessionAccess.averageSessionsPerDay ?? 0) > 0 && (
                    <ReferenceLine
                      y={sessionAccess.averageSessionsPerDay}
                      stroke={c.accent}
                      strokeDasharray="4 4"
                      strokeOpacity={0.45}
                    />
                  )}
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
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 12,
                }}
                className="session-daily-averages"
              >
                <div
                  style={{
                    border: `1px solid ${c.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: c.inputBackground,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>📱</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: c.textMuted,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Promedio de entradas / día
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: c.accent,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {(sessionAccess.averageSessionsPerDay ?? 0).toLocaleString(
                      "es-DO",
                      { maximumFractionDigits: 1, minimumFractionDigits: 1 },
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
                    Últimos {sessionAccess.days || sessionAccessPeriod} días
                    {sessionAccess.includesPartialToday
                      ? " · incluye hoy (parcial)"
                      : ""}
                  </div>
                </div>
                <div
                  style={{
                    border: `1px solid ${c.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: c.inputBackground,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>👥</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: c.textMuted,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Promedio de usuarios / día
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: c.success,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {(
                      sessionAccess.averageUniqueUsersPerDay ?? 0
                    ).toLocaleString("es-DO", {
                      maximumFractionDigits: 1,
                      minimumFractionDigits: 1,
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
                    Únicos diarios ÷ {sessionAccess.days || sessionAccessPeriod}{" "}
                    días
                    {sessionAccess.includesPartialToday
                      ? " · incluye hoy (parcial)"
                      : ""}
                  </div>
                </div>
              </div>

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

          <div className="span-2">
            <SectionCard
              title="Tiempo promedio de uso"
              subtitle="Promedio diario por usuario activo, estimado por tiempo de conexión."
              c={c}
              action={
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {USAGE_PERIODS.map((item) => (
                    <TabChip
                      key={item.value}
                      label={item.label}
                      active={usagePeriod === item.value}
                      onClick={() => setUsagePeriod(item.value)}
                      c={c}
                    />
                  ))}
                </div>
              }
            >
              {usageLoading ? (
                <div style={{ color: c.textMuted, fontSize: 13, fontWeight: 700 }}>
                  Cargando tiempo de uso...
                </div>
              ) : usageError ? (
                <div style={{ color: c.danger, fontSize: 13, fontWeight: 700 }}>
                  No se pudo cargar el tiempo de uso.
                </div>
              ) : usageTime.completedSessions <= 0 ? (
                <div style={{ color: c.textMuted, fontSize: 13, fontWeight: 700 }}>
                  Sin datos suficientes para este período
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: c.accent,
                      lineHeight: 1.1,
                    }}
                  >
                    {formatUsageDuration(usageTime.averageUsageSeconds)}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: c.textMuted,
                      lineHeight: 1.4,
                    }}
                  >
                    Promedio diario por usuario activo, estimado por tiempo de conexión.
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div style={{ color: c.textMuted, fontSize: 12 }}>
                      <div style={{ fontWeight: 800, color: c.text }}>
                        {usageTime.activeUsers.toLocaleString()}
                      </div>
                      usuarios activos
                    </div>
                    <div style={{ color: c.textMuted, fontSize: 12 }}>
                      <div style={{ fontWeight: 800, color: c.text }}>
                        {usageTime.completedSessions.toLocaleString()}
                      </div>
                      sesiones completadas
                    </div>
                    <div style={{ color: c.textMuted, fontSize: 12 }}>
                      <div style={{ fontWeight: 800, color: c.text }}>
                        {formatUsageDuration(usageTime.totalUsageSeconds)}
                      </div>
                      tiempo total
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={230}>
                    <AreaChart
                      data={usageTime.daily.map((day) => ({
                        ...day,
                        minutos: Number((day.averageUsageSeconds / 60).toFixed(1)),
                      }))}
                      margin={{ top: 16, right: 10, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="usageMinutesGrad" x1="0" y1="0" x2="0" y2="1">
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
                        dataKey="minutos"
                        name="Minutos promedio"
                        stroke={c.accent}
                        strokeWidth={2.5}
                        fill="url(#usageMinutesGrad)"
                        dot={false}
                        activeDot={{ r: 5, fill: c.accent }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}
            </SectionCard>
          </div>

          <div className="span-2">
            <SectionCard
              title="Envío de mensajes"
              subtitle={`${messageAnalytics.uniqueUsers.toLocaleString()} usuarios enviaron ${messageAnalytics.totalMessages.toLocaleString()} mensajes · promedio ${messageAnalytics.averageMessagesPerUser} mensajes por usuario${
                messagePeriod === "all" ? " · todo el historial" : ""
              }`}
              c={c}
              action={
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {MESSAGE_PERIODS.map((item) => (
                    <TabChip
                      key={item.label}
                      label={item.label}
                      active={messagePeriod === item.value}
                      onClick={() => setMessagePeriod(item.value)}
                      c={c}
                    />
                  ))}
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart
                  data={messageAnalytics.series}
                  margin={{ top: 5, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="messageUsersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c.success} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={c.success} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="messageCountGrad" x1="0" y1="0" x2="0" y2="1">
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
                    minTickGap={messageAnalytics.granularity === "month" ? 18 : 10}
                  />
                  <YAxis
                    tick={{ fill: tickColor, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip c={c} />} />
                  {(messageAnalytics.averageUniqueSendersPerDay ?? 0) > 0 && (
                    <ReferenceLine
                      y={messageAnalytics.averageUniqueSendersPerDay}
                      stroke={c.success}
                      strokeDasharray="4 4"
                      strokeOpacity={0.55}
                    />
                  )}
                  {(messageAnalytics.averageMessagesPerDay ?? 0) > 0 && (
                    <ReferenceLine
                      y={messageAnalytics.averageMessagesPerDay}
                      stroke={c.accent}
                      strokeDasharray="4 4"
                      strokeOpacity={0.45}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Usuarios que enviaron"
                    stroke={c.success}
                    strokeWidth={2.5}
                    fill="url(#messageUsersGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: c.success }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    name="Mensajes enviados"
                    stroke={c.accent}
                    strokeWidth={2.5}
                    fill="url(#messageCountGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: c.accent }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div
                className="session-daily-averages"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    border: `1px solid ${c.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: c.inputBackground,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>💬</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: c.textMuted,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Promedio de mensajes / día
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: c.accent,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {(messageAnalytics.averageMessagesPerDay ?? 0).toLocaleString(
                      "es-DO",
                      { maximumFractionDigits: 1, minimumFractionDigits: 1 },
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
                    {messagePeriod === "all"
                      ? `Histórico · ${messageAnalytics.averageDays || "—"} días`
                      : `Últimos ${messageAnalytics.averageDays || messagePeriod} días`}
                    {messageAnalytics.includesPartialToday
                      ? " · incluye hoy (parcial)"
                      : ""}
                  </div>
                </div>
                <div
                  style={{
                    border: `1px solid ${c.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: c.inputBackground,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>👥</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: c.textMuted,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Promedio de usuarios / día
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: c.success,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {(
                      messageAnalytics.averageUniqueSendersPerDay ?? 0
                    ).toLocaleString("es-DO", {
                      maximumFractionDigits: 1,
                      minimumFractionDigits: 1,
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
                    Remitentes únicos diarios ÷{" "}
                    {messageAnalytics.averageDays ||
                      (messagePeriod === "all" ? "días" : messagePeriod)}
                    {messageAnalytics.includesPartialToday
                      ? " · incluye hoy (parcial)"
                      : ""}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                {messageAnalytics.topUsers.slice(0, 4).map((item) => (
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
                      {item.messages} mensajes
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
            subtitle={`Dispositivos de entradas a la app · últimos ${sessionAccessPeriod} días`}
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
                  const pct = total > 0 ? ((ct.value / total) * 100).toFixed(0) : "0";
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
          <SectionCard
            title="Curva de retención"
            subtitle="% de usuarios de cada cohorte semanal que volvieron a entrar"
            c={c}
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={business.retention.weekly}
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
          </SectionCard>

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

          {/* 6. Nuevos usuarios diarios + Usuarios activos diarios */}
          <SectionCard
            title="Nuevos usuarios diarios"
            subtitle="Registros por día (no confundir con nuevos activos del DAU)"
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
                  {(newUsersPeriod === "7d"
                    ? weeklyActivityResume
                    : monthlyActivityResume
                  ).map((_, i) => (
                    <Cell
                      key={i}
                      fill={`${accentHex}${Math.round((0.4 + (i % 7) * 0.09) * 255)
                        .toString(16)
                        .padStart(2, "0")}`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title="Usuarios activos diarios"
            subtitle="SessionLog · nuevos activos vs recurrentes"
            c={c}
            action={
              <div style={{ display: "flex", gap: "5px" }}>
                {["7d", "30d"].map((p) => (
                  <TabChip
                    key={p}
                    label={p}
                    active={dailyActivePeriod === p}
                    onClick={() => setDailyActivePeriod(p)}
                    c={c}
                  />
                ))}
              </div>
            }
          >
            {dailyActiveLoading ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.textMuted,
                  fontSize: 13,
                }}
              >
                Cargando actividad diaria…
              </div>
            ) : dailyActiveError ? (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.textMuted,
                  fontSize: 13,
                }}
              >
                No se pudo cargar el DAU diario.
              </div>
            ) : (
              (() => {
                const series =
                  dailyActivePeriod === "7d"
                    ? dailyActive.days7
                    : dailyActive.days30;
                const hasData = series.some((d) => d.dau > 0);
                if (!hasData) {
                  return (
                    <div
                      style={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: c.textMuted,
                        fontSize: 13,
                      }}
                    >
                      Sin actividad de SessionLog en el período.
                    </div>
                  );
                }
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={series}
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
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                        iconType="square"
                      />
                      <Bar
                        dataKey="nuevosActivos"
                        name="Nuevos activos"
                        stackId="dau"
                        fill="#7c3aed"
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="recurrentes"
                        name="Recurrentes"
                        stackId="dau"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()
            )}
          </SectionCard>

          {/* 7. Top usuarios (span 2) */}
          <div className="span-2">
            <SectionCard
              title="🏆 Top usuarios"
              subtitle={`${business.topUsersMeta?.period?.label || "Mes actual"} · posts / likes / nuevos seguidores del mes · solo ACTIVE`}
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
                  {["#", "Usuario", "Posts mes", "Likes mes", "Seguidores mes", ""].map(
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

                {business.topUsers.map((u, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const maxFollowers = Math.max(
                    1,
                    ...business.topUsers.map((item) => item.followers || 0),
                  );
                  const profilePath = u.user ? `/users/${u.user}` : "";
                  return (
                    <div
                      key={u.user}
                      role={profilePath ? "link" : undefined}
                      onClick={() => {
                        if (profilePath) navigate(profilePath);
                      }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "32px 1fr 80px 80px 100px 80px",
                        gap: "12px",
                        padding: "11px 12px",
                        borderRadius: "12px",
                        alignItems: "center",
                        transition: "background 0.15s",
                        cursor: profilePath ? "pointer" : "default",
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
                        <img
                          src={u.profilePhoto || UserProfile}
                          alt=""
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                          onError={(event) => {
                            (event.target as HTMLImageElement).src = UserProfile;
                          }}
                        />
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
                            {u.name?.trim() || u.user}
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
                        {(u.likes || 0).toLocaleString()}
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
                              width: `${((u.followers || 0) / maxFollowers) * 100}%`,
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
