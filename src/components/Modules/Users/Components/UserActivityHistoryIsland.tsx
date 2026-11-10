import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import type {
  ActivityPreview,
  UserActivityItem,
} from "../../../Models/User/UserActivityHistory";
import userService from "../../../Services/User/UserService";
import "./UserActivityHistoryIsland.css";

type ThemeColors = (typeof Colors.dark)["colors"];

type Props = {
  userId: string;
  colors: ThemeColors;
  style?: CSSProperties;
};

const ACTION_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Todas las actividades" },
  { value: "ACCOUNT_CREATED", label: "Cuenta creada" },
  { value: "POST_CREATED", label: "Publicaciones" },
  { value: "REPOST_CREATED", label: "Republicaciones" },
  { value: "COMMENT_CREATED", label: "Comentarios" },
  { value: "LIKE_CREATED", label: "Me gusta" },
  { value: "FOLLOW_CREATED", label: "Seguimientos" },
  { value: "FOLLOW_REQUEST_CREATED", label: "Solicitudes" },
  { value: "STORY_CREATED", label: "Historias" },
  { value: "POST_SAVED", label: "Guardados" },
  { value: "PROFILE_PHOTO_UPDATED", label: "Foto de perfil" },
  { value: "NAME_UPDATED", label: "Cambios de nombre" },
  { value: "USERNAME_UPDATED", label: "Cambios de usuario" },
  { value: "PASSWORD_CHANGED", label: "Contraseña" },
  { value: "USER_BLOCKED", label: "Bloqueos" },
  { value: "VERIFICATION_REQUEST_CREATED", label: "Verificación" },
  { value: "CREATORS_PROGRAM_APPLIED", label: "Programa de creadores" },
];

type IconStyle = { emoji: string; color: string; bg: string };

const iconForAction = (action: string): IconStyle => {
  const key = String(action || "").toUpperCase();
  if (key.startsWith("POST_") || key.startsWith("REPOST_")) {
    return { emoji: "📰", color: "#60a5fa", bg: "rgba(96,165,250,0.14)" };
  }
  if (key.startsWith("COMMENT_")) {
    return { emoji: "💬", color: "#a78bfa", bg: "rgba(167,139,250,0.14)" };
  }
  if (key.startsWith("LIKE_")) {
    return { emoji: "❤️", color: "#f87171", bg: "rgba(248,113,113,0.14)" };
  }
  if (key.startsWith("FOLLOW_")) {
    return { emoji: "👤", color: "#34d399", bg: "rgba(52,211,153,0.14)" };
  }
  if (key.startsWith("STORY_")) {
    return { emoji: "⏱️", color: "#fbbf24", bg: "rgba(251,191,36,0.14)" };
  }
  if (key.includes("PHOTO") || key.includes("MEDIA")) {
    return { emoji: "🖼️", color: "#22d3ee", bg: "rgba(34,211,238,0.14)" };
  }
  if (
    key.includes("NAME") ||
    key.includes("USERNAME") ||
    key.includes("EMAIL") ||
    key.includes("PHONE") ||
    key.includes("PRESENTATION") ||
    key.includes("PASSWORD")
  ) {
    return { emoji: "✏️", color: "#818cf8", bg: "rgba(129,140,248,0.14)" };
  }
  if (key.includes("BLOCK")) {
    return { emoji: "🚫", color: "#fb7185", bg: "rgba(251,113,133,0.14)" };
  }
  if (key.includes("SAVE")) {
    return { emoji: "🔖", color: "#f59e0b", bg: "rgba(245,158,11,0.14)" };
  }
  if (key.includes("CREATORS") || key.includes("VERIFICATION")) {
    return { emoji: "✨", color: "#c084fc", bg: "rgba(192,132,252,0.14)" };
  }
  if (key.includes("ACCOUNT")) {
    return { emoji: "🎉", color: "#34d399", bg: "rgba(52,211,153,0.14)" };
  }
  return { emoji: "•", color: "#94a3b8", bg: "rgba(148,163,184,0.14)" };
};

const formatActivityDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const mediaUrlFromPreview = (preview?: ActivityPreview | null) => {
  const data = preview?.data;
  if (!data) return null;
  if (preview.type === "MEDIA") {
    return data.thumbnailUrl || data.url || null;
  }
  if (preview.type === "POST") {
    return data.media?.thumbnailUrl || data.media?.url || null;
  }
  if (preview.type === "COMMENT") {
    return (
      data.post?.media?.thumbnailUrl ||
      data.post?.media?.url ||
      null
    );
  }
  return null;
};

const ActivityPreviewBlock = ({
  preview,
}: {
  preview?: ActivityPreview | null;
}) => {
  if (!preview) return null;

  if (!preview.available) {
    return (
      <div className="uah-preview">
        <div className="uah-preview-unavailable">
          {preview.reason || "Contenido no disponible"}
        </div>
      </div>
    );
  }

  const data = preview.data || {};

  if (preview.type === "USER") {
    const label =
      data.Username || data.username
        ? `@${data.Username || data.username}`
        : data.Name || data.name || "Usuario";
    const photo =
      data.ProfilePhoto ||
      data.profilePhoto ||
      data.PerfilData?.ProfilePhoto ||
      null;
    return (
      <div className="uah-preview">
        <div className="uah-preview-user">
          {photo ? (
            <img className="uah-preview-avatar" src={photo} alt="" />
          ) : (
            <div className="uah-preview-avatar" />
          )}
          <div className="uah-preview-user-text">{label}</div>
        </div>
      </div>
    );
  }

  if (preview.type === "PROFILE_CHANGE") {
    const oldValue = data.oldValue ?? "—";
    const newValue = data.newValue ?? "—";
    return (
      <div className="uah-preview">
        <div className="uah-preview-diff">
          {String(oldValue)} → {String(newValue)}
        </div>
      </div>
    );
  }

  if (preview.type === "ACCOUNT" && data.passwordChanged) {
    return (
      <div className="uah-preview">
        <div className="uah-preview-text">Cambio de contraseña registrado</div>
      </div>
    );
  }

  if (preview.type === "COMMENT") {
    const text = data.commentValue || data.text || "";
    const media = mediaUrlFromPreview(preview);
    return (
      <div className="uah-preview">
        {text ? <div className="uah-preview-text">{text}</div> : null}
        {media ? (
          <img
            className="uah-preview-media"
            src={media}
            alt=""
            style={{ marginTop: text ? 6 : 0 }}
          />
        ) : null}
      </div>
    );
  }

  const media = mediaUrlFromPreview(preview);
  if (media) {
    return (
      <div className="uah-preview">
        <img className="uah-preview-media" src={media} alt="" />
      </div>
    );
  }

  if (preview.type === "POST" && data.description) {
    return (
      <div className="uah-preview">
        <div className="uah-preview-text">{data.description}</div>
      </div>
    );
  }

  return null;
};

/** Stable chronological order for presentation (oldest → newest). */
const activitySortKey = (item: UserActivityItem) => {
  const t = new Date(item.createDate).getTime();
  return Number.isFinite(t) ? t : 0;
};

const mergeActivityPages = (
  prev: UserActivityItem[],
  pageItems: UserActivityItem[],
  append: boolean,
) => {
  if (!append) return pageItems;
  if (!pageItems.length) return prev;
  const seen = new Set(prev.map((item) => item.id));
  const unique = pageItems.filter((item) => item.id && !seen.has(item.id));
  if (!unique.length) return prev;
  // API returns CreateDate DESC; older pages append after newer ones.
  return [...prev, ...unique];
};

const UserActivityHistoryIsland = ({ userId, colors, style }: Props) => {
  const { theme } = useThemeContext();
  const [items, setItems] = useState<UserActivityItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const fetchInFlightRef = useRef(false);
  const requestSeqRef = useRef(0);
  const stickToBottomRef = useRef(true);
  const pendingScrollRestoreRef = useRef<{
    prevHeight: number;
    prevTop: number;
  } | null>(null);

  const cssVars = useMemo(
    () =>
      ({
        "--uah-border": colors.border,
        "--uah-text": colors.text,
        "--uah-muted": colors.textMuted,
        "--uah-card": colors.card,
        "--uah-input-bg": colors.inputBackground,
        "--uah-input-border": colors.inputBorder,
        "--uah-input-color": colors.inputColor,
        "--uah-accent": colors.accent,
        "--uah-accent-soft": colors.accentSoft,
        "--uah-line":
          theme === "dark"
            ? "rgba(90,90,122,0.55)"
            : "rgba(136,136,168,0.45)",
      }) as CSSProperties,
    [colors, theme],
  );

  // API order: newest → oldest. Presentation: oldest → newest (no column-reverse).
  const displayItems = useMemo(() => {
    if (items.length <= 1) return items;
    return [...items].sort((a, b) => {
      const dt = activitySortKey(a) - activitySortKey(b);
      if (dt !== 0) return dt;
      return String(a.id).localeCompare(String(b.id));
    });
  }, [items]);

  const fetchPage = useCallback(
    async (cursor?: string | null, append = false) => {
      if (!userId) return;
      if (fetchInFlightRef.current) return;
      fetchInFlightRef.current = true;

      const seq = ++requestSeqRef.current;
      if (append) {
        const el = bodyRef.current;
        pendingScrollRestoreRef.current = el
          ? { prevHeight: el.scrollHeight, prevTop: el.scrollTop }
          : null;
        stickToBottomRef.current = false;
        setLoadingMore(true);
      } else {
        stickToBottomRef.current = true;
        pendingScrollRestoreRef.current = null;
        setLoading(true);
        setError(null);
      }

      try {
        const response = await userService.GetActivityHistory(userId, {
          action: action || undefined,
          dateFrom: dateFrom
            ? new Date(`${dateFrom}T00:00:00.000Z`).toISOString()
            : undefined,
          dateTo: dateTo
            ? new Date(`${dateTo}T23:59:59.999Z`).toISOString()
            : undefined,
          cursor: cursor || undefined,
          limit: 30,
        });

        if (seq !== requestSeqRef.current) return;

        const payload = response?.data ?? response;
        const pageItems: UserActivityItem[] = Array.isArray(payload?.data)
          ? payload.data
          : [];
        const pagination = payload?.pagination || {};

        setItems((prev) => mergeActivityPages(prev, pageItems, append));
        setNextCursor(pagination.nextCursor || null);
        setHasMore(Boolean(pagination.hasMore));
      } catch (err: any) {
        if (seq !== requestSeqRef.current) return;
        const status = err?.response?.status;
        if (status === 403) {
          setError("No tienes permiso para ver el historial de actividad.");
        } else {
          setError("No se pudo cargar el historial de actividad.");
        }
        if (!append) {
          setItems([]);
          setHasMore(false);
          setNextCursor(null);
        }
        pendingScrollRestoreRef.current = null;
      } finally {
        if (seq === requestSeqRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
        fetchInFlightRef.current = false;
      }
    },
    [userId, action, dateFrom, dateTo],
  );

  useEffect(() => {
    requestSeqRef.current += 1;
    fetchInFlightRef.current = false;
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    setError(null);
    stickToBottomRef.current = true;
    pendingScrollRestoreRef.current = null;
    void fetchPage(null, false);
  }, [fetchPage]);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const restore = pendingScrollRestoreRef.current;
    if (restore) {
      const delta = el.scrollHeight - restore.prevHeight;
      el.scrollTop = restore.prevTop + delta;
      pendingScrollRestoreRef.current = null;
      return;
    }

    if (stickToBottomRef.current && !loading) {
      el.scrollTop = el.scrollHeight;
    }
  }, [displayItems, loading, loadingMore, error]);

  const onLoadOlder = () => {
    if (!hasMore || loadingMore || loading || fetchInFlightRef.current) return;
    void fetchPage(nextCursor, true);
  };

  return (
    <div
      className="uah-island user-detail-activity-card"
      style={{
        ...cssVars,
        background: colors.card,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 20,
        boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
        ...style,
      }}
    >
      <div className="uah-header">
        <div className="uah-title">Historial de actividad</div>
        <div className="uah-filters">
          <select
            aria-label="Filtro por actividad"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTION_FILTERS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Filtro por fecha desde"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            aria-label="Filtro por fecha hasta"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="uah-body" ref={bodyRef}>
        {loading ? (
          <div className="uah-loading">Cargando actividades…</div>
        ) : error ? (
          <div className="uah-error">{error}</div>
        ) : items.length === 0 ? (
          <div className="uah-empty">Sin actividades registradas</div>
        ) : (
          <div className="uah-column">
            {(hasMore || loadingMore) && (
              <div className="uah-load-older">
                {loadingMore ? (
                  <div className="uah-loading-inline">
                    Cargando actividades anteriores…
                  </div>
                ) : (
                  <button
                    type="button"
                    className="uah-load-more"
                    disabled={loadingMore}
                    onClick={onLoadOlder}
                  >
                    Cargar actividades anteriores
                  </button>
                )}
              </div>
            )}

            <div className="uah-list">
              {displayItems.map((item) => {
                const icon = iconForAction(item.action);
                return (
                  <div className="uah-item" key={item.id}>
                    <div className="uah-rail">
                      <div className="uah-rail-line" aria-hidden />
                      <div
                        className="uah-icon"
                        style={{ color: icon.color, background: icon.bg }}
                        title={item.action}
                      >
                        {icon.emoji}
                      </div>
                    </div>
                    <div className="uah-content">
                      <div className="uah-description">
                        {item.description || item.action}
                      </div>
                      <div className="uah-date">
                        {formatActivityDate(item.createDate)}
                      </div>
                      <ActivityPreviewBlock preview={item.preview} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityHistoryIsland;
