import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { useHubsContext } from "../context/HubsContext";
import { useThemeContext } from "../context/ThemeContext";

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

const onlineName = (user: any) => {
  if (typeof user === "string") return user.trim();
  return String(user?.user || user?.User || user?.username || user?.Username || "").trim();
};

const OnlineUsers = () => {
  const { theme } = useThemeContext();
  const { usersConnecting } = useHubsContext();
  const navigate = useNavigate();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;

  const users = useMemo(() => {
    const names = usersConnecting
      .map(onlineName)
      .filter((name) => name.length > 0);
    return Array.from(new Set(names)).sort((a, b) =>
      a.localeCompare(b, "es"),
    );
  }, [usersConnecting]);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "26px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>
            Usuarios en línea
          </div>
          <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
            {users.length} conectados ahora
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: c.text,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 0 4px rgba(34,197,94,0.18)",
            }}
          />
          En vivo
        </span>
      </div>

      <section
        style={{
          background: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {users.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center", color: c.textMuted, fontSize: 13 }}>
            No hay usuarios conectados en este momento.
          </div>
        ) : (
          users.map((username) => (
            <button
              key={username}
              type="button"
              onClick={() => navigate(`/users/${username}`)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                border: "none",
                borderBottom: `1px solid ${c.border}`,
                background: "transparent",
                color: c.text,
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: avatarColor(username),
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  flex: "0 0 auto",
                }}
              >
                {username.charAt(0).toUpperCase()}
              </span>
              <span style={{ fontWeight: 700 }}>{username}</span>
            </button>
          ))
        )}
      </section>
    </main>
  );
};

export default OnlineUsers;
