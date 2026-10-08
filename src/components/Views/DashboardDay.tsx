import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import analyticsService from "../Services/Analytics/AnalyticsService";

type Kind = "registered" | "posts" | "interactions";

type Row = {
  id: string;
  title: string;
  subtitle: string;
  photo?: string | null;
  time?: string;
  href?: string;
};

const TITLES: Record<Kind, { title: string; empty: string }> = {
  registered: {
    title: "Registrados hoy",
    empty: "No hay usuarios registrados hoy.",
  },
  posts: {
    title: "Publicaciones hoy",
    empty: "No hay publicaciones de hoy.",
  },
  interactions: {
    title: "Interacciones hoy",
    empty: "No hay interacciones hoy.",
  },
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
};

const interactionLabel = (item: any) => {
  if (item.kind === "comment") return "comentó una publicación";
  if (item.target === "HISTORY") return "le dio me gusta a una historia";
  if (item.target === "COMENT") return "le dio me gusta a un comentario";
  if (item.target === "PUBLICATION") return "le dio me gusta a una publicación";
  return "interactuó";
};

const DashboardDay = ({ kind }: { kind: Kind }) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const copy = TITLES[kind];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const request =
      kind === "registered"
        ? analyticsService.getUsersRegisteredToday()
        : kind === "posts"
          ? analyticsService.getPostsToday()
          : analyticsService.getInteractionsToday();

    request
      .then((response) => {
        if (!active) return;
        const data = response.data || {};
        if (kind === "registered") {
          setRows(
            (data.users || []).map((user: any) => ({
              id: user.id,
              title: user.username || user.name || "Usuario",
              subtitle: user.name && user.username ? user.name : "Se registró hoy",
              photo: user.profilePhoto,
              time: formatTime(user.createDate),
              href: user.username ? `/users/${user.username}` : undefined,
            })),
          );
        } else if (kind === "posts") {
          setRows(
            (data.posts || []).map((post: any) => ({
              id: post.id,
              title: post.username || post.name || "Publicación",
              subtitle: post.description || "Sin descripción",
              photo: post.mediaUrl || post.profilePhoto,
              time: formatTime(post.createDate),
              href: `/publications/${post.id}`,
            })),
          );
        } else {
          setRows(
            (data.interactions || []).map((item: any) => ({
              id: `${item.kind}-${item.id}`,
              title: item.username || item.name || "Usuario",
              subtitle: [
                interactionLabel(item),
                item.text ? `"${item.text}"` : "",
                item.postDescription ? `Publicación: ${item.postDescription}` : item.postId ? "Publicación" : "",
              ].filter(Boolean).join(" · "),
              photo: item.profilePhoto,
              time: formatTime(item.createDate),
              href: item.postId
                ? `/publications/${item.postId}`
                : item.storyId
                  ? `/stories/${item.storyId}`
                  : item.username
                    ? `/users/${item.username}`
                    : undefined,
            })),
          );
        }
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setRows([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [kind]);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: 26 }}>
      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          padding: "8px 14px",
          borderRadius: 12,
          border: `1px solid ${c.border}`,
          background: c.card,
          color: c.text,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>
      <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>{copy.title}</div>
      <div style={{ fontSize: 13, color: c.textMuted, margin: "4px 0 18px" }}>
        {loading ? "Cargando..." : `${rows.length} en el día de hoy`}
      </div>
      <section style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, overflow: "hidden" }}>
        {error ? (
          <div style={{ padding: 28, textAlign: "center", color: c.textMuted, fontSize: 13 }}>
            No se pudo cargar el listado.
          </div>
        ) : !loading && rows.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center", color: c.textMuted, fontSize: 13 }}>
            {copy.empty}
          </div>
        ) : (
          rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => row.href && navigate(row.href)}
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
                cursor: row.href ? "pointer" : "default",
                textAlign: "left",
                font: "inherit",
              }}
            >
              <img
                src={row.photo || UserProfile}
                alt=""
                style={{ width: 36, height: 36, borderRadius: row.photo && kind === "posts" ? 8 : "50%", objectFit: "cover", flex: "0 0 auto" }}
                onError={(event) => {
                  (event.target as HTMLImageElement).src = UserProfile;
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block" }}>{row.title}</strong>
                <span style={{ display: "block", color: c.textMuted, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.subtitle}
                </span>
              </span>
              <span style={{ color: c.textMuted, fontSize: 12, flex: "0 0 auto" }}>{row.time}</span>
            </button>
          ))
        )}
      </section>
    </main>
  );
};

export default DashboardDay;
