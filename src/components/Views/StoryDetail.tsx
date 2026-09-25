import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { HistoryStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import adminHistoryService from "../Services/History/AdminHistoryService";

type PublicUser = {
  id: string;
  name?: string;
  username?: string;
  profilePhoto?: string | null;
};

const isVideo = (story: any) => {
  const mime = String(story?.MediaMimeType || "").toLowerCase();
  const type = String(story?.MediaType || "").toLowerCase();
  const url = String(story?.MediaData || "").toLowerCase();
  return mime.startsWith("video/") || type.includes("video") || /\.(mp4|mov|m4v|webm)(\?|#|$)/i.test(url);
};

const PersonRow = ({
  person,
  c,
  onOpen,
}: {
  person: PublicUser;
  c: any;
  onOpen: (username: string) => void;
}) => (
  <button
    type="button"
    onClick={() => person.username && onOpen(person.username)}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 0",
      border: "none",
      background: "transparent",
      color: c.text,
      cursor: person.username ? "pointer" : "default",
      textAlign: "left",
      font: "inherit",
    }}
  >
    <img
      src={person.profilePhoto || UserProfile}
      alt=""
      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
      onError={(event) => {
        (event.target as HTMLImageElement).src = UserProfile;
      }}
    />
    <span>
      <strong style={{ display: "block", fontSize: 13 }}>{person.name || person.username}</strong>
      <span style={{ fontSize: 12, color: c.textMuted }}>@{person.username}</span>
    </span>
  </button>
);

const PeoplePanel = ({
  title,
  total,
  people,
  hasMore,
  onMore,
  c,
  onOpen,
}: {
  title: string;
  total: number;
  people: PublicUser[];
  hasMore: boolean;
  onMore: () => void;
  c: any;
  onOpen: (username: string) => void;
}) => (
  <section style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16 }}>
    <div style={{ fontWeight: 800, color: c.text, marginBottom: 8 }}>
      {total} {title}
    </div>
    {people.length === 0 ? (
      <div style={{ color: c.textMuted, fontSize: 13 }}>Nadie todavía.</div>
    ) : (
      people.map((person) => (
        <PersonRow key={person.id} person={person} c={c} onOpen={onOpen} />
      ))
    )}
    {hasMore ? (
      <button type="button" onClick={onMore} style={{ marginTop: 8 }}>
        Ver más
      </button>
    ) : null}
  </section>
);

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;
  const [story, setStory] = useState<any | null>(null);
  const [viewers, setViewers] = useState<PublicUser[]>([]);
  const [viewsTotal, setViewsTotal] = useState(0);
  const [viewsPage, setViewsPage] = useState(1);
  const [viewsHasMore, setViewsHasMore] = useState(false);
  const [likers, setLikers] = useState<PublicUser[]>([]);
  const [likesTotal, setLikesTotal] = useState(0);
  const [likesPage, setLikesPage] = useState(1);
  const [likesHasMore, setLikesHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [storyRes, viewsRes, likesRes] = await Promise.all([
          adminHistoryService.GetById(id),
          adminHistoryService.GetViews(id, 1),
          adminHistoryService.GetLikes(id, 1),
        ]);
        if (cancelled) return;
        setStory(storyRes.data);
        setViewers(viewsRes.data?.users || []);
        setViewsTotal(viewsRes.data?.total || 0);
        setViewsPage(1);
        setViewsHasMore(Boolean(viewsRes.data?.hasMore));
        setLikers(likesRes.data?.users || []);
        setLikesTotal(likesRes.data?.total || 0);
        setLikesPage(1);
        setLikesHasMore(Boolean(likesRes.data?.hasMore));
      } catch {
        if (!cancelled) {
          showToast({
            type: "error",
            title: "Error",
            description: "No se pudo cargar la historia",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const openProfile = (username: string) => navigate(`/users/${username}`);

  const loadMore = async (kind: "views" | "likes") => {
    if (!id) return;
    if (kind === "views") {
      const nextPage = viewsPage + 1;
      const result = await adminHistoryService.GetViews(id, nextPage);
      setViewers((current) => [...current, ...(result.data?.users || [])]);
      setViewsPage(nextPage);
      setViewsHasMore(Boolean(result.data?.hasMore));
      return;
    }
    const nextPage = likesPage + 1;
    const result = await adminHistoryService.GetLikes(id, nextPage);
    setLikers((current) => [...current, ...(result.data?.users || [])]);
    setLikesPage(nextPage);
    setLikesHasMore(Boolean(result.data?.hasMore));
  };

  const changeStatus = async (status: number) => {
    if (!story?._id) return;
    try {
      await adminHistoryService.UpdateStatus(story._id, status);
      setStory((current: any) => ({ ...current, Status: status }));
      showToast({
        type: "success",
        title: "Estado actualizado",
        description: status === HistoryStatus.DELETED ? "Historia eliminada" : "Historia en revisión",
      });
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar la historia",
      });
    }
  };

  if (loading) {
    return <main style={{ padding: 26, color: c.textMuted }}>Cargando historia...</main>;
  }

  if (!story) {
    return <main style={{ padding: 26, color: c.textMuted }}>Historia no encontrada.</main>;
  }

  return (
    <main style={{ flex: 1, overflow: "auto", padding: 26 }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 16,
          border: "none",
          background: "transparent",
          color: c.textMuted,
          cursor: "pointer",
          font: "inherit",
        }}
      >
        Volver
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 420px) minmax(280px, 1fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <section style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ height: 520, background: "#111" }}>
            {isVideo(story) ? (
              <video src={story.MediaData} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <img src={story.MediaData} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            )}
          </div>
          <div style={{ padding: 16 }}>
            <button
              type="button"
              onClick={() => story.Username && openProfile(story.Username)}
              style={{
                border: "none",
                background: "transparent",
                color: c.text,
                fontWeight: 800,
                cursor: "pointer",
                padding: 0,
                font: "inherit",
              }}
            >
              @{story.Username}
            </button>
            {story.OverlayText ? (
              <div style={{ marginTop: 8, color: c.textMuted, fontSize: 13 }}>{story.OverlayText}</div>
            ) : null}
            {can(Permissions.DELETE_POSTS) && (
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => void changeStatus(HistoryStatus.UNDER_REVIEW)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1.5px solid ${c.border}`,
                    background: c.warningSoft,
                    color: c.warning,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  En revisión
                </button>
                <button
                  type="button"
                  onClick={() => void changeStatus(HistoryStatus.DELETED)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1.5px solid ${c.border}`,
                    background: c.dangerSoft,
                    color: c.danger,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </section>
        <div style={{ display: "grid", gap: 18 }}>
          <PeoplePanel
            title="vistas"
            total={viewsTotal}
            people={viewers}
            hasMore={viewsHasMore}
            onMore={() => void loadMore("views")}
            c={c}
            onOpen={openProfile}
          />
          <PeoplePanel
            title="likes"
            total={likesTotal}
            people={likers}
            hasMore={likesHasMore}
            onMore={() => void loadMore("likes")}
            c={c}
            onOpen={openProfile}
          />
        </div>
      </div>
    </main>
  );
};

export default StoryDetail;
