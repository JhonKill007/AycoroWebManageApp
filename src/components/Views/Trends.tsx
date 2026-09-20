import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { PostStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { PostModel } from "../Models/Post/PostModel";
import { KpiCard } from "../Modules/Common/Components/bfdhjhg";
import VerifiedBadge from "../Modules/Common/Components/VerifiedBadge";
import postService from "../Services/Post/PostService";
import trendsService from "../Services/Trends/TrendsService";
import { PublicationModal } from "./Publications";

type TabKey = "posts" | "followers" | "streaks";

const isVideo = (item: any) => {
  const mediaType = `${item?.MediaType || ""}`.toLowerCase();
  const mimeType = `${item?.MediaMimeType || ""}`.toLowerCase();
  const url = `${item?.MediaData || ""}`.toLowerCase();
  return (
    mediaType.includes("video") ||
    mimeType.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)
  );
};

const Trends = () => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;

  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [trendDays, setTrendDays] = useState(3);
  const [selectedPost, setSelectedPost] = useState<PostModel | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, followersRes, streaksRes] = await Promise.all([
        trendsService.GetTrendingPosts(),
        trendsService.GetTopFollowers(),
        trendsService.GetTopStreaks(),
      ]);

      const postsPayload = postsRes.data?.data || postsRes.data || [];
      const followersPayload =
        followersRes.data?.data || followersRes.data || [];
      const streaksPayload = streaksRes.data?.data || streaksRes.data || [];

      setPosts(Array.isArray(postsPayload) ? postsPayload : []);
      setFollowers(Array.isArray(followersPayload) ? followersPayload : []);
      setStreaks(Array.isArray(streaksPayload) ? streaksPayload : []);
      setTrendDays(postsRes.data?.meta?.days || 3);
    } catch {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron cargar las tendencias",
        duration: 4000,
      });
      setPosts([]);
      setFollowers([]);
      setStreaks([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = useCallback(
    async (id: string, newStatus: number) => {
      setPosts((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, Status: newStatus } : item,
        ),
      );

      try {
        await postService.UpdateStatus(id, newStatus);
        if (newStatus === PostStatus.DELETED) {
          setPosts((prev) => prev.filter((item) => item._id !== id));
        }
        showToast({
          type: "success",
          title: "Estado actualizado",
          description: "La publicación se actualizó correctamente.",
          duration: 3000,
        });
      } catch {
        await loadData();
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo actualizar el estado",
          duration: 4000,
        });
      }
    },
    [loadData, showToast],
  );

  const tabs: Array<{ id: TabKey; label: string }> = [
    { id: "posts", label: "Publicaciones" },
    { id: "followers", label: "Seguidores" },
    { id: "streaks", label: "Rachas" },
  ];

  return (
    <main
      style={{
        flex: 1,
        overflow: "auto",
        padding: 26,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minWidth: 0,
      }}
    >
      <div
        className="responsive-page-banner"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #1a1a30, #0f0f22)"
              : "linear-gradient(135deg, #ededff, #f5f0ff)",
          border: `1.5px solid ${c.accentMedium}`,
          borderRadius: 20,
          padding: "22px 28px",
          marginBottom: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>
            Tendencias
          </div>
          <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
            Publicaciones en tendencia, ranking de seguidores y las rachas más
            grandes.
          </div>
        </div>
        <button
          onClick={loadData}
          style={{
            padding: "8px 14px",
            borderRadius: 12,
            border: `1.5px solid ${c.border}`,
            background: c.accentSoft,
            color: c.accent,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </div>

      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <KpiCard
          emoji="🔥"
          label="Posts en tendencia"
          value={posts.length}
          colorKey="warning"
          c={c}
        />
        <KpiCard
          emoji="👥"
          label="Top seguidores"
          value={followers.length}
          colorKey="accent"
          c={c}
        />
        <KpiCard
          emoji="⚡"
          label="Top rachas"
          value={streaks.length}
          colorKey="success"
          c={c}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              border: `1.5px solid ${c.border}`,
              background:
                activeTab === tab.id ? c.accentMedium : "transparent",
              color: activeTab === tab.id ? c.accent : c.textMuted,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: c.textMuted }}>
          Cargando tendencias...
        </div>
      ) : null}

      {!loading && activeTab === "posts" && (
        <>
          <div
            style={{
              marginBottom: 12,
              fontSize: 12,
              color: c.textMuted,
              fontWeight: 600,
            }}
          >
            Basado en likes + comentarios de los últimos {trendDays} días
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {posts.length === 0 ? (
              <div style={{ color: c.textMuted, padding: 24 }}>
                No hay publicaciones en tendencia.
              </div>
            ) : (
              posts.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedPost(item)}
                  style={{
                    background: c.card,
                    border: `1.5px solid ${c.border}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative", height: 200, background: "#111" }}>
                    {item.MediaData ? (
                      isVideo(item) ? (
                        <video
                          src={item.MediaData}
                          muted
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <img
                          src={item.MediaData}
                          alt={item.Username || "post"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )
                    ) : null}
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: c.warningSoft,
                        color: c.warning,
                        fontWeight: 900,
                        fontSize: 12,
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      #{item.Rank}
                    </span>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: c.text,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      @{item.Username || "usuario"}
                      <VerifiedBadge
                        verify={item.Verify}
                        verifyType={item.VerifyType}
                        size={14}
                      />
                    </div>
                    <div
                      style={{
                        color: c.textMuted,
                        fontSize: 12,
                        marginTop: 6,
                        minHeight: 36,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.Description || "Sin descripción"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        color: c.textMuted,
                      }}
                    >
                      <span>🔥 {item.Score}</span>
                      <span>❤️ {item.Likes ?? 0}</span>
                      <span>💬 {item.Comments ?? 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {!loading && activeTab === "followers" && (
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {followers.length === 0 ? (
            <div style={{ padding: 24, color: c.textMuted }}>
              No hay ranking de seguidores.
            </div>
          ) : (
            followers.map((item, index) => (
              <button
                key={item.IdUser}
                onClick={() =>
                  item.Username && navigate(`/users/${item.Username}`)
                }
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "56px 48px minmax(0, 1fr) auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 16px",
                  border: 0,
                  borderTop: index === 0 ? "none" : `1px solid ${c.border}`,
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: c.accentSoft,
                    color: c.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                  }}
                >
                  #{item.Rank}
                </div>
                {item.ProfilePhoto ? (
                  <img
                    src={item.ProfilePhoto}
                    alt={item.Username}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: c.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: c.accent,
                      fontSize: 11,
                    }}
                  >
                    {(item.Username || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: c.text,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    @{item.Username}
                    <VerifiedBadge
                      verify={item.Verify}
                      verifyType={item.VerifyType}
                      size={14}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: c.textMuted }}>
                    {item.Name || "—"}
                  </div>
                </div>
                <div style={{ fontWeight: 900, color: c.accent }}>
                  {Number(item.Followers || 0).toLocaleString()} seguidores
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {!loading && activeTab === "streaks" && (
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {streaks.length === 0 ? (
            <div style={{ padding: 24, color: c.textMuted }}>
              No hay rachas para mostrar.
            </div>
          ) : (
            streaks.map((item, index) => (
              <button
                key={item.IdUser}
                onClick={() =>
                  item.Username && navigate(`/users/${item.Username}`)
                }
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "56px 48px minmax(0, 1fr) auto auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 16px",
                  border: 0,
                  borderTop: index === 0 ? "none" : `1px solid ${c.border}`,
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: c.successSoft,
                    color: c.success,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                  }}
                >
                  #{item.Rank}
                </div>
                {item.ProfilePhoto ? (
                  <img
                    src={item.ProfilePhoto}
                    alt={item.Username}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: c.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: c.accent,
                      fontSize: 11,
                    }}
                  >
                    {(item.Username || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: c.text,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    @{item.Username}
                    <VerifiedBadge
                      verify={item.Verify}
                      verifyType={item.VerifyType}
                      size={14}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: c.textMuted }}>
                    {item.ActiveDays || 0} días activos registrados
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700 }}>
                    Mejor
                  </div>
                  <div style={{ fontWeight: 900, color: c.success, fontSize: 16 }}>
                    {item.BestStreak}🔥
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700 }}>
                    Actual
                  </div>
                  <div style={{ fontWeight: 900, color: c.warning, fontSize: 16 }}>
                    {item.CurrentStreak}
                  </div>
                </div>
              </button>
            ))
        )}
      </div>
      )}

      <PublicationModal
        pub={selectedPost}
        c={c}
        theme={theme}
        onClose={() => setSelectedPost(null)}
        onAction={handleStatusChange}
      />
    </main>
  );
};

export default Trends;
