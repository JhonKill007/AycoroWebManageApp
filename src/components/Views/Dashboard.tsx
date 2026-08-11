import { useEffect, useMemo, useState } from "react";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { useHubsContext } from "../context/HubsContext";
import { useThemeContext } from "../context/ThemeContext";
import { LiveActivity } from "../Models/Live/LiveActivity";
import StatCard from "../Modules/Card/StatCard";
import analyticsService from "../Services/Analytics/AnalyticsService";

type DashboardStats = {
  activeUsers: { value: number; trend: number | null };
  postsToday: { value: number; trend: number | null; previousValue?: number };
  interactionsToday: { value: number; trend: number | null; previousValue?: number };
  pendingReports: { value: number; trend: number | null };
  usersRegisteredToday: {
    value: number;
    trend: number | null;
    previousValue: number;
  };
};

const emptyStats: DashboardStats = {
  activeUsers: { value: 0, trend: null },
  postsToday: { value: 0, trend: null },
  interactionsToday: { value: 0, trend: null },
  pendingReports: { value: 0, trend: null },
  usersRegisteredToday: { value: 0, trend: null, previousValue: 0 },
};

const formatNumber = (value: number) => value.toLocaleString();

const formatActivityDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const avatarColor = (username: string) => {
  const colors = [
    "#11a96a",
    "#1976d2",
    "#46b7ff",
    "#d81b60",
    "#00acc1",
    "#455a64",
    "#c2185b",
    "#607d8b",
    "#536dfe",
    "#7cb342",
    "#7e57c2",
    "#0288d1",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i += 1) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function RealtimeActivityCard({
  c,
  theme,
  activities,
}: {
  c: any;
  theme: string;
  activities: LiveActivity[];
}) {
  return (
    <section
      style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 2px 14px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: c.text,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 0 4px rgba(34,197,94,0.18)",
              display: "inline-block",
            }}
          />
          <span>Live</span>
        </div>
        <button
          type="button"
          style={{
            width: 28,
            height: 28,
            border: "none",
            background: "transparent",
            color: c.textMuted,
            fontSize: 22,
            lineHeight: 1,
            cursor: "default",
          }}
        >
          ⋮
        </button>
      </div>

      <div
        style={{
          padding: "0 12px 10px",
          display: "grid",
          gap: 0,
          maxHeight: 430,
          overflow: "auto",
          background: theme === "dark" ? c.card : "#fff",
        }}
      >
        {activities.length === 0 ? (
          <div
            style={{
              padding: "28px 8px",
              textAlign: "center",
              color: c.textMuted,
              fontSize: 13,
            }}
          >
            Esperando actividad en tiempo real...
          </div>
        ) : (
          activities.map((activity) => {
            const initial = (activity.username || "?").charAt(0).toUpperCase();
            const color = avatarColor(activity.username || "user");
            const isUserTarget = activity.targetType === "user";
            const activityDate = formatActivityDate(activity.createDate);

            return (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  minHeight: 34,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    flex: "0 0 auto",
                    overflow: "hidden",
                    background: color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {activity.profilePhoto ? (
                    <img
                      src={activity.profilePhoto}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: c.text,
                      lineHeight: 1.25,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        color: c.textMuted,
                        fontWeight: 700,
                        marginRight: 7,
                      }}
                    >
                      {activity.username}
                    </span>
                    <span>{activity.message}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                      flex: "0 0 auto",
                    }}
                  >
                    {activityDate && (
                      <span
                        style={{
                          fontSize: 10,
                          color: c.textMuted,
                          whiteSpace: "nowrap",
                          lineHeight: 1.2,
                        }}
                      >
                        {activityDate}
                      </span>
                    )}
                    {(activity.targetImage || isUserTarget) && (
                      <img
                        src={activity.targetImage || UserProfile}
                        alt=""
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: isUserTarget ? "50%" : 4,
                          objectFit: "cover",
                          border: `1px solid ${c.border}`,
                          background: c.border,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = UserProfile;
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

const Dashboard = () => {
  const { theme } = useThemeContext();
  const { usersConnecting, liveActivities } = useHubsContext();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);

  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const { data } = await analyticsService.getDashboardStats();
        setStats({ ...emptyStats, ...data });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      }
    };

    loadDashboardStats();
  }, []);

  const quickStats = useMemo(
    () => [
      {
        label: "Usuarios activos",
        value: formatNumber(stats.activeUsers.value),
        trend: stats.activeUsers.trend,
        emoji: "👤",
      },
      {
        label: "Usuarios en linea",
        value: formatNumber(usersConnecting.length),
        trend: null,
        emoji: "🟢",
      },
      {
        label: "Registrados hoy",
        value: formatNumber(stats.usersRegisteredToday.value),
        trend: stats.usersRegisteredToday.trend,
        emoji: "👥",
      },
      {
        label: "Publicaciones hoy",
        value: formatNumber(stats.postsToday.value),
        trend: stats.postsToday.trend,
        emoji: "🖼️",
      },
      {
        label: "Interacciones hoy",
        value: formatNumber(stats.interactionsToday.value),
        trend: stats.interactionsToday.trend,
        emoji: "❤️",
      },
      {
        label: "Reportes pendientes",
        value: formatNumber(stats.pendingReports.value),
        trend: stats.pendingReports.trend,
        emoji: "⚠️",
      },
    ],
    [stats, usersConnecting.length],
  );

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
      `}</style>

      <main style={{ flex: 1, overflow: "auto", padding: "26px" }}>
        <div
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
            boxShadow: `0 4px 24px rgba(107,115,240,0.09)`,
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
              Buenos dias, Admin
            </div>
            <div
              style={{
                fontSize: "13px",
                color: c.textMuted,
                lineHeight: 1.5,
              }}
            >
              Tienes{" "}
              <strong style={{ color: c.accent }}>
                {stats.pendingReports.value} reportes
              </strong>{" "}
              pendientes y{" "}
              <strong style={{ color: c.warning }}>
                {usersConnecting.length} usuarios
              </strong>{" "}
              en linea.
            </div>
          </div>
          <button className="pill-cta">Ver reportes</button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          {quickStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} c={c} />
          ))}
        </div>

        <RealtimeActivityCard c={c} theme={theme} activities={liveActivities} />
      </main>
    </>
  );
};

export default Dashboard;
