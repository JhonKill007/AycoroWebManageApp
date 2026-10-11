import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { CommentStatus } from "../constants/Status";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import adminComentService from "../Services/Coments/AdminComentService";
import postService from "../Services/Post/PostService";

type PublicUser = {
  id: string;
  name?: string;
  username?: string;
  profilePhoto?: string | null;
};

type CommentItem = {
  id: string;
  text?: string;
  likes: number;
  status?: number | string;
  createDate?: string;
  user?: PublicUser | null;
};

const isDeletedComment = (status: unknown) => Number(status) === CommentStatus.DELETED;

const isVideo = (post: any) => {
  const mime = String(post?.MediaMimeType || "").toLowerCase();
  const type = String(post?.MediaType || "").toLowerCase();
  const url = String(post?.MediaData || "").toLowerCase();
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

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;
  const canModerateComments = can(Permissions.DELETE_POSTS);
  const [post, setPost] = useState<any | null>(null);
  const [likers, setLikers] = useState<PublicUser[]>([]);
  const [likesTotal, setLikesTotal] = useState(0);
  const [likesPage, setLikesPage] = useState(1);
  const [likesHasMore, setLikesHasMore] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentLikes, setCommentLikes] = useState<Record<string, PublicUser[]>>({});
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [postRes, likesRes, commentsRes] = await Promise.all([
          postService.GetById(id),
          postService.GetLikes(id, 1),
          postService.GetComments(id),
        ]);
        if (cancelled) return;
        setPost(postRes.data);
        setLikers(likesRes.data?.users || []);
        setLikesTotal(likesRes.data?.total || 0);
        setLikesPage(1);
        setLikesHasMore(Boolean(likesRes.data?.hasMore));
        setComments(commentsRes.data?.comments || []);
        setCommentsTotal(commentsRes.data?.total || 0);
      } catch {
        if (!cancelled) {
          showToast({
            type: "error",
            title: "Error",
            description: "No se pudo cargar la publicación",
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

  const loadMoreLikes = async () => {
    if (!id) return;
    const nextPage = likesPage + 1;
    const result = await postService.GetLikes(id, nextPage);
    setLikers((current) => [...current, ...(result.data?.users || [])]);
    setLikesPage(nextPage);
    setLikesHasMore(Boolean(result.data?.hasMore));
  };

  const changeCommentStatus = async (comment: CommentItem) => {
    const deleted = isDeletedComment(comment.status);
    const nextStatus = deleted ? CommentStatus.PUBLISHED : CommentStatus.DELETED;
    setUpdatingCommentId(comment.id);
    try {
      await adminComentService.UpdateStatus(comment.id, nextStatus);
      setComments((current) =>
        current.map((item) =>
          item.id === comment.id ? { ...item, status: nextStatus } : item,
        ),
      );
      showToast({
        type: "success",
        title: deleted ? "Comentario publicado" : "Comentario eliminado",
        description: deleted
          ? "El comentario volvió a estar publicado"
          : "El comentario quedó marcado como eliminado",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        description: error?.response?.data?.message || "No se pudo actualizar el comentario",
      });
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const toggleCommentLikes = async (commentId: string) => {
    if (openComment === commentId) {
      setOpenComment(null);
      return;
    }
    setOpenComment(commentId);
    if (commentLikes[commentId]) return;
    const result = await adminComentService.GetLikes(commentId);
    setCommentLikes((current) => ({
      ...current,
      [commentId]: result.data?.users || [],
    }));
  };

  if (loading) {
    return <main style={{ padding: 26, color: c.textMuted }}>Cargando publicación...</main>;
  }

  if (!post) {
    return <main style={{ padding: 26, color: c.textMuted }}>Publicación no encontrada.</main>;
  }

  return (
    <main style={{ flex: 1, overflow: "auto", padding: 26 }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
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
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
        }}
      >
        <span aria-hidden="true">←</span>
        Volver
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 460px) minmax(280px, 1fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <section
          style={{
            background: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {isVideo(post) ? (
            <video src={post.MediaData} controls style={{ width: "100%", maxHeight: 640, background: "#111" }} />
          ) : (
            <img src={post.MediaData} alt="" style={{ width: "100%", display: "block" }} />
          )}
          <div style={{ padding: 16 }}>
            <button
              type="button"
              onClick={() => post.Username && openProfile(post.Username)}
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
              @{post.Username}
            </button>
            {post.Description ? (
              <div style={{ marginTop: 8, color: c.text, fontSize: 14 }}>{post.Description}</div>
            ) : null}
          </div>
        </section>

        <div style={{ display: "grid", gap: 18 }}>
          <section style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 800, color: c.text, marginBottom: 8 }}>
              {likesTotal} likes
            </div>
            {likers.map((person) => (
              <PersonRow key={person.id} person={person} c={c} onOpen={openProfile} />
            ))}
            {likesHasMore ? (
              <button type="button" onClick={() => void loadMoreLikes()} style={{ marginTop: 8 }}>
                Ver más
              </button>
            ) : null}
          </section>

          <section style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 800, color: c.text, marginBottom: 8 }}>
              {commentsTotal} comentarios
            </div>
            {comments.map((comment) => (
              <div key={comment.id} style={{ padding: "10px 0", borderTop: `1px solid ${c.border}` }}>
                {comment.user ? (
                  <PersonRow person={comment.user} c={c} onOpen={openProfile} />
                ) : null}
                {isDeletedComment(comment.status) ? (
                  <div style={{ color: c.danger, fontSize: 12, fontWeight: 800, marginTop: 4 }}>
                    Este comentario fue eliminado
                  </div>
                ) : null}
                <div style={{ color: c.text, fontSize: 14, margin: "4px 0 8px" }}>{comment.text}</div>
                {canModerateComments ? (
                  <button
                    type="button"
                    disabled={updatingCommentId === comment.id}
                    onClick={() => void changeCommentStatus(comment)}
                    style={{
                      marginRight: 12,
                      border: `1px solid ${c.danger}55`,
                      background: "transparent",
                      color: isDeletedComment(comment.status) ? c.accent : c.danger,
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: updatingCommentId === comment.id ? "not-allowed" : "pointer",
                      opacity: updatingCommentId === comment.id ? 0.6 : 1,
                    }}
                  >
                    {isDeletedComment(comment.status) ? "Publicar" : "Eliminar"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void toggleCommentLikes(comment.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: c.accent,
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {comment.likes} likes
                </button>
                {openComment === comment.id ? (
                  <div style={{ marginLeft: 12 }}>
                    {(commentLikes[comment.id] || []).map((person) => (
                      <PersonRow key={person.id} person={person} c={c} onOpen={openProfile} />
                    ))}
                    {commentLikes[comment.id]?.length === 0 ? (
                      <div style={{ fontSize: 12, color: c.textMuted }}>Nadie ha dado like.</div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
};

export default PublicationDetail;
