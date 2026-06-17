import { useEffect, useMemo, useState } from "react";
import PostA from "../assets/comunity_image/POST_A.jpeg";
import PostB from "../assets/comunity_image/POST_B.jpeg";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { useHubsContext } from "../context/HubsContext";
import { useThemeContext } from "../context/ThemeContext";
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

const liveComments = [
  {
    user: "jhondavidrd",
    message: "subio una nueva publicacion",
    avatar: UserProfile,
    targetImage: PostA,
    targetType: "post",
    color: "#11a96a",
  },
  {
    user: "lucia_v",
    message: "le dio like a una publicacion",
    initial: "A",
    targetImage: PostB,
    targetType: "post",
    color: "#1976d2",
  },
  {
    user: "carlos_m",
    message: "comento: excelente lugar, recomendado",
    avatar: PostA,
    targetImage: PostA,
    targetType: "post",
    color: "#46b7ff",
  },
  {
    user: "maria_dev",
    message: "guardo una publicacion para verla luego",
    avatar: PostB,
    targetImage: PostB,
    targetType: "post",
    color: "#d81b60",
  },
  {
    user: "ana_flores",
    message: "comenzo a seguir a sofia_r",
    avatar: UserProfile,
    targetImage: PostA,
    targetType: "user",
    color: "#00acc1",
  },
  {
    user: "jorge_s",
    message: "compartio una publicacion",
    avatar: PostA,
    targetImage: PostB,
    targetType: "post",
    color: "#455a64",
  },
  {
    user: "Fadop3",
    message: "reporto una publicacion",
    initial: "F",
    targetImage: PostA,
    targetType: "post",
    color: "#c2185b",
  },
  {
    user: "barracuda40",
    message: "actualizo su foto de perfil",
    initial: "B",
    targetImage: UserProfile,
    targetType: "user",
    color: "#607d8b",
  },
  {
    user: "Web Application Guide",
    message: "respondio un comentario en una publicacion",
    initial: "W",
    targetImage: PostB,
    targetType: "post",
    color: "#536dfe",
  },
  {
    user: "Secret Sensei",
    message: "comenzo a seguir a jhondavidrd",
    avatar: PostB,
    targetImage: UserProfile,
    targetType: "user",
    color: "#7cb342",
  },
  {
    user: "Chimezie Uche",
    message: "solicito verificacion de perfil",
    initial: "C",
    targetImage: UserProfile,
    targetType: "user",
    color: "#7e57c2",
  },
  {
    user: "Daniel Kiptoo",
    message: "marco una publicacion como favorita",
    initial: "D",
    targetImage: PostA,
    targetType: "post",
    color: "#0288d1",
  },
];

function RealtimeActivityCard({ c, theme }: { c: any; theme: string }) {
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
          <span>Top chat replay</span>
          <span style={{ fontSize: 16, color: c.text }}>⌄</span>
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
        {liveComments.map((comment) => (
          <div
            key={`${comment.user}-${comment.message}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 0",
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
                background: comment.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {comment.avatar ? (
                <img
                  src={comment.avatar}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                comment.initial
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
                  {comment.user}
                </span>
                <span>{comment.message}</span>
              </div>
              <img
                src={comment.targetImage}
                alt=""
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: comment.targetType === "user" ? "50%" : 4,
                  objectFit: "cover",
                  border: `1px solid ${c.border}`,
                  flex: "0 0 auto",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const Dashboard = () => {
  const { theme } = useThemeContext();
  const { usersConnecting } = useHubsContext();
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

        <RealtimeActivityCard c={c} theme={theme} />
      </main>
    </>
  );
};

export default Dashboard;
