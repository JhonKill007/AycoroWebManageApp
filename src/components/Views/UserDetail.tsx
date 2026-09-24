import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { PostStatus, UserStatus, VerificationStatus, HistoryStatus, ReportStatus } from "../constants/Status";
import { getContentDeletedMessage } from "../constants/SystemMessages";
import {
  MessageType,
  VerificationType,
  getVerificationColor,
} from "../constants/Types";
import { getReasonById } from "../constants/ReportsReason";
import { useImageBankContext } from "../context/ImageBankContext";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useUserContext } from "../context/UserContext";
import useLanguage from "../hooks/useLanguage";
import { usePermissions } from "../hooks/usePermissions";
import { PostModel } from "../Models/Post/PostModel";
import { UserPerfilModel } from "../Models/User/UserPerfilModel";
import PubCard from "../Modules/Users/Components/PubCard";
import AssignVerificationModal from "../Modules/Users/Components/AssignVerificationModal";
import VerifiedBadge from "../Modules/Common/Components/VerifiedBadge";
import postService from "../Services/Post/PostService";
import systemMessageService from "../Services/SystemMessage/SystemMessageService";
import userService from "../Services/User/UserService";
import adminHistoryService from "../Services/History/AdminHistoryService";
import reportService from "../Services/Report/ReportService";

const AVATAR_COLOR = "#34d399";
const STATUS_CFG = {
  activo: {
    label: "Activo",
    emoji: "✅",
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.28)",
  },
  suspendido: {
    label: "Suspendido",
    emoji: "⏸️",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.28)",
  },
  baneado: {
    label: "Baneado",
    emoji: "🚫",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.28)",
  },
};

const getVerificationLabel = (verifyType?: string) => {
  const type = `${verifyType ?? ""}`.trim().toLowerCase();
  if (type === VerificationType.GREEN || type === "verde") {
    return "Verificación verde";
  }
  if (type === VerificationType.BLUE || type === "azul") {
    return "Verificación azul";
  }
  if (
    type === VerificationType.GOLD ||
    type === "golden" ||
    type === "dorado" ||
    type === "dorada"
  ) {
    return "Verificación dorada";
  }
  if (
    type === VerificationType.PURPLE ||
    type === "morado" ||
    type === "morada" ||
    type === "creators" ||
    type === "creator"
  ) {
    return "Verificación Creators";
  }
  return "Verificación";
};

const TYPE_CFG = {
  texto: { emoji: "📝", color: "#6b73f0" },
  imagen: { emoji: "🖼️", color: "#34d399" },
  video: { emoji: "🎬", color: "#f87171" },
  encuesta: { emoji: "📊", color: "#fbbf24" },
};

const PUB_TABS = [
  { id: "todas", label: "Todas", emoji: "\uD83D\uDCDA", statuses: [] },
  {
    id: "activas",
    label: "Activas",
    emoji: "\uD83D\uDCE2",
    statuses: [PostStatus.PUBLISHED, PostStatus.EDITED],
  },
  {
    id: "revision",
    label: "En revision",
    emoji: "\uD83D\uDD0D",
    statuses: [PostStatus.UNDER_REVIEW],
  },
  {
    id: "reportadas",
    label: "Reportadas",
    emoji: "\u26A0\uFE0F",
    statuses: [PostStatus.REPORTED],
  },
  {
    id: "archivadas",
    label: "Archivadas",
    emoji: "\uD83D\uDCE6",
    statuses: [PostStatus.ARCHIVED],
  },
  {
    id: "eliminadas",
    label: "Eliminadas",
    emoji: "\uD83D\uDDD1\uFE0F",
    statuses: [PostStatus.DELETED],
  },
] as const;
type PubTabId = (typeof PUB_TABS)[number]["id"];

type ContentSectionId =
  | "publicaciones"
  | "historias"
  | "reportes"
  | "historial";

const CONTENT_SECTIONS: Array<{
  id: ContentSectionId;
  label: string;
  emoji: string;
}> = [
  { id: "publicaciones", label: "Publicaciones", emoji: "📰" },
  { id: "historias", label: "Historias", emoji: "⏱️" },
  { id: "reportes", label: "Reportes", emoji: "📋" },
  { id: "historial", label: "Historial", emoji: "📝" },
];

const STORY_STATUS: Record<number, { label: string; color: string; bg: string }> = {
  [HistoryStatus.PUBLISHED]: { label: "Publicada", color: "#059669", bg: "#d1fae5" },
  [HistoryStatus.FLAGGED]: { label: "Marcada", color: "#2563eb", bg: "#dbeafe" },
  [HistoryStatus.REPORTED]: { label: "Reportada", color: "#dc2626", bg: "#fee2e2" },
  [HistoryStatus.UNDER_REVIEW]: { label: "En revisión", color: "#d97706", bg: "#fed7aa" },
  [HistoryStatus.DELETED]: { label: "Eliminada", color: "#dc2626", bg: "#fee2e2" },
};

const REPORT_STATUS_CFG: Record<number, { label: string; color: string }> = {
  [ReportStatus.PENDING]: { label: "Pendiente", color: "#f87171" },
  [ReportStatus.IN_REVIEW]: { label: "En revisión", color: "#fbbf24" },
  [ReportStatus.RESOLVED]: { label: "Resuelto", color: "#34d399" },
  [ReportStatus.DISMISSED]: { label: "Descartado", color: "#94a3b8" },
};

const PROFILE_EDIT_LABELS: Record<string, string> = {
  Name: "Nombre",
  Username: "Usuario",
  Email: "Email",
  Phone: "Teléfono",
  Password: "Contraseña",
  CoverPhoto: "Foto de portada",
  ProfilePhoto: "Foto de perfil",
  Presentation: "Bio",
};

const isStoryVideo = (item: any) => {
  const mediaType = `${item?.MediaType || ""}`.toLowerCase();
  const mimeType = `${item?.MediaMimeType || ""}`.toLowerCase();
  const url = `${item?.MediaData || ""}`.toLowerCase();
  return (
    mediaType.includes("video") ||
    mimeType.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)
  );
};

const fmt = (n: number = 0) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const isVideoPublication = (publication?: PostModel | null) => {
  const mediaType = publication?.MediaType?.toLowerCase() || "";
  const mimeType = publication?.MediaMimeType?.toLowerCase() || "";
  const mediaUrl = publication?.MediaData?.toLowerCase() || "";

  return (
    mediaType.includes("video") ||
    mimeType.startsWith("video/") ||
    /\.(mp4|mov|m4v|webm|ogg)(\?|#|$)/i.test(mediaUrl)
  );
};

const getUserStatusKey = (status?: number) => {
  if (status === UserStatus.SUSPENDED) return "suspendido";
  if (status === UserStatus.BANNED) return "baneado";
  return "activo";
};

const getUserStatusCode = (status: keyof typeof STATUS_CFG) => {
  if (status === "suspendido") return UserStatus.SUSPENDED;
  if (status === "baneado") return UserStatus.BANNED;
  return UserStatus.ACTIVE;
};

const formatBirthDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getAgeLabel = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }
  return `${age} años`;
};

function UserPublicationModal({
  pub,
  c,
  theme,
  onClose,
  onDelete,
  isDeleting,
}: any) {
  const { can } = usePermissions();
  const navigate = useNavigate();

  if (!pub) return null;

  const isVideo = isVideoPublication(pub);
  const canDelete =
    can(Permissions.DELETE_POSTS) && pub.Status !== PostStatus.DELETED;

  const formatDate = (date?: Date) => {
    if (!date) return "Fecha desconocida";
    return new Date(date).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusLabel =
    pub.Status === PostStatus.PUBLISHED
      ? "Publicada"
      : pub.Status === PostStatus.EDITED
        ? "Editada"
        : pub.Status === PostStatus.UNDER_REVIEW
          ? "En revision"
          : pub.Status === PostStatus.REPORTED
            ? "Reportada"
            : pub.Status === PostStatus.ARCHIVED
              ? "Archivada"
              : pub.Status === PostStatus.DELETED
                ? "Eliminada"
                : "Publicacion";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.42)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 22,
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1.5px solid ${c.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
              Detalle de publicacion
            </div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
              {statusLabel} · ID: {pub._id?.slice(-8)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: c.card,
              color: c.textMuted,
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>

        <div style={{ padding: 22, display: "grid", gap: 16 }}>
          {pub.MediaData && (
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                overflow: "hidden",
                background: c.accentSoft,
              }}
            >
              {isVideo ? (
                <video
                  src={pub.MediaData}
                  controls
                  playsInline
                  preload="metadata"
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    display: "block",
                    objectFit: "contain",
                    background: "#000",
                  }}
                />
              ) : (
                <img
                  src={pub.MediaData}
                  alt="Post"
                  style={{ width: "100%", display: "block", objectFit: "cover" }}
                />
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={pub.ProfilePhoto || UserProfile}
              alt=""
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${c.accent}44`,
              }}
            />
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/users/${pub.Username}`);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 900,
                    color: c.text,
                    cursor: "pointer",
                  }}
                >
                  @{pub.Username}
                </button>
                <VerifiedBadge
                  verify={pub.Verify}
                  verifyType={pub.VerifyType}
                  size={14}
                />
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                {formatDate(pub.CreateDate)}
              </div>
            </div>
          </div>

          {pub.Description && (
            <div
              style={{
                border: `1px solid ${c.border}`,
                borderRadius: 14,
                padding: 14,
                fontSize: 13,
                color: c.text,
                lineHeight: 1.7,
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
              }}
            >
              {pub.Description}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {[
              { label: "Likes", value: pub.Likes ?? 0, icon: "\u2764\uFE0F" },
              {
                label: "Comentarios",
                value: pub.Comments ?? 0,
                icon: "\uD83D\uDCAC",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  padding: 14,
                  textAlign: "center",
                  background: c.inputBackground,
                }}
              >
                <div style={{ fontSize: 16 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: c.text,
                    marginTop: 4,
                  }}
                >
                  {fmt(item.value)}
                </div>
                <div style={{ fontSize: 10, color: c.textMuted }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {canDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete?.(pub)}
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 14,
                border: `1.5px solid ${c.danger}33`,
                background: c.dangerSoft,
                color: c.danger,
                fontSize: 13,
                fontWeight: 800,
                cursor: isDeleting ? "not-allowed" : "pointer",
                opacity: isDeleting ? 0.68 : 1,
              }}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PubCard ───────────────────────────────────────────────────────────

// ─── Componente principal ──────────────────────────────────────────────
const UserDetail = () => {
  const { username } = useParams();
  const { getLabel } = useLanguage();
  const { userData, updateUser } = useUserContext();
  const { searchImage } = useImageBankContext();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const [perfilUser, setPerfilUser] = useState<UserPerfilModel | undefined>();
  const [perfilPost, setPerfilPost] = useState<PostModel[]>([]);
  const [selectedPublication, setSelectedPublication] =
    useState<PostModel | null>(null);
  const [isDeletingPublication, setIsDeletingPublication] = useState(false);
  const [archivedPost, setArchivedPost] = useState<PostModel[]>([]);
  const [userPostSection, setUserPostSection] = useState(1);
  const { theme } = useThemeContext();
  const navigate = useNavigate();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [user, setUser] = useState<{ status: "activo" | "suspendido" | "baneado" }>({
    status: "activo",
  });
  const [pubTab, setPubTab] = useState<PubTabId>("activas");
  const [searchPub, setSearch] = useState("");
  const [confirmBan, setConfirmBan] = useState(false);
  const [statusSaved, setStatusSaved] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<typeof user.status>(
    user.status,
  );
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [contentSection, setContentSection] =
    useState<ContentSectionId>("publicaciones");
  const [userStories, setUserStories] = useState<any[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [profileEdits, setProfileEdits] = useState<any[]>([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  const [loadingData, setLoadingData] = useState({
    user: true,
    posts: true,
  });

  const userId = perfilUser?.User?._id;

  useEffect(() => {
    if (username) {
      loadData();
    }
  }, [username]);

  const loadData = useCallback(async () => {
    setLoadingData({ user: true, posts: true });
    setUserPostSection(1);
    setPerfilPost([]);
    setUserStories([]);
    setUserReports([]);
    setProfileEdits([]);
    setContentSection("publicaciones");
    setSelectedStory(null);

    try {
      const [userResponse, postResponse] = await Promise.all([
        userService.GetUserByUsername(username!),
        postService.GetForUser(username!, 1),
        // postService.GetArchivedPost(1),
      ]);


      setPerfilUser(userResponse.data);
      const userStatus = getUserStatusKey(userResponse.data?.User?.Status);
      setUser((current) => ({ ...current, status: userStatus }));
      setPendingStatus(userStatus);

      setPerfilPost(postResponse.data);
      // postResponse.data.forEach((post: any) => savePost(post));

      // setArchivedPost(archivedPost.data);
      // archivedPost.data.forEach((post: any) => savePost(post));
    } catch (error) {
      console.error("Error loading data:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo cargar el usuario.",
      });
    } finally {
      setLoadingData({ user: false, posts: false });
      // setRefreshing(false);
    }
  }, [username, userData, searchImage]);

  useEffect(() => {
    if (!userId || contentSection === "publicaciones") return;

    let cancelled = false;

    const loadSection = async () => {
      setSectionLoading(true);
      try {
        if (contentSection === "historias") {
          const response = await adminHistoryService.GetAll(
            1,
            "",
            undefined,
            userId,
          );
          if (!cancelled) {
            const payload = response?.data?.data || response?.data;
            setUserStories(
              Array.isArray(payload?.Histories) ? payload.Histories : [],
            );
          }
        } else if (contentSection === "reportes") {
          const response = await reportService.getAll(1, "", {
            idUserReported: userId,
          });
          if (!cancelled) {
            const reportsData = Array.isArray(response?.data?.data)
              ? response.data.data
              : Array.isArray(response?.data)
                ? response.data
                : [];
            setUserReports(reportsData);
          }
        } else if (contentSection === "historial") {
          const response = await userService.GetProfileEdits(userId, 1);
          if (!cancelled) {
            const edits = Array.isArray(response?.data?.data)
              ? response.data.data
              : Array.isArray(response?.data)
                ? response.data
                : [];
            setProfileEdits(edits);
          }
        }
      } catch (error) {
        console.error("Error loading section:", error);
        if (!cancelled) {
          showToast({
            type: "error",
            title: "Error",
            description: "No se pudo cargar esta sección.",
          });
        }
      } finally {
        if (!cancelled) setSectionLoading(false);
      }
    };

    void loadSection();
    return () => {
      cancelled = true;
    };
  }, [contentSection, userId, showToast]);

  const pubs = useMemo(() => {
    const selectedTab = PUB_TABS.find((tab) => tab.id === pubTab);
    const tabStatuses = (selectedTab?.statuses || []) as readonly number[];
    const list =
      tabStatuses.length === 0
        ? perfilPost
        : perfilPost.filter((post) =>
            tabStatuses.includes(post.Status as any),
          );

    if (!searchPub.trim()) return list;
    const q = searchPub.toLowerCase();
    return list.filter(
      (p) =>
        p.Description?.toLowerCase().includes(q) ||
        p.Username?.toLowerCase().includes(q),
    );
  }, [perfilPost, pubTab, searchPub]);

  const getTabCount = (tab: (typeof PUB_TABS)[number]) => {
    if (tab.statuses.length === 0) return perfilPost.length;
    const tabStatuses = tab.statuses as readonly number[];
    return perfilPost.filter((post) => tabStatuses.includes(post.Status as any))
      .length;
  };

  const handleDeletePublication = useCallback(
    async (publication: PostModel) => {
      if (!publication._id) return;

      setIsDeletingPublication(true);

      try {
        const response = await postService.UpdateStatus(
          publication._id,
          PostStatus.DELETED,
        );
        const strikes =
          typeof response?.data?.strike === "number"
            ? response.data.strike
            : undefined;
        const suspended = Boolean(response?.data?.suspended);

        if (typeof strikes === "number" || suspended) {
          setPerfilUser((current: any) =>
            current?.User
              ? {
                  ...current,
                  User: {
                    ...current.User,
                    ...(typeof strikes === "number" ? { Strike: strikes } : {}),
                    ...(suspended ? { Status: UserStatus.SUSPENDED } : {}),
                  },
                }
              : current,
          );
          if (suspended) {
            setUser((current) => ({ ...current, status: "suspendido" }));
            setPendingStatus("suspendido");
          }
        }

        const deletedPost = {
          ...publication,
          Status: PostStatus.DELETED,
        };

        setPerfilPost((prev) =>
          prev.map((post) => (post._id === publication._id ? deletedPost : post)),
        );
        setSelectedPublication(deletedPost);

        let messageSent = true;

        try {
          await systemMessageService.sendUserMessage(
            {
              _id: publication.IdUser,
              Username: publication.Username,
              Verify: publication.Verify,
              PerfilData: {
                IdMediaDataProfile: publication.IdMediaDataProfile,
              },
              ProfilePhoto: publication.ProfilePhoto,
            },
            getContentDeletedMessage(strikes, suspended),
            {
              type: MessageType.PUBLICATION,
              idMedia: publication._id,
            },
          );
        } catch (error) {
          messageSent = false;
          console.error("Error sending deleted content message:", error);
        }

        showToast({
          type: messageSent ? "success" : "error",
          title: "Publicacion eliminada",
          description: messageSent
            ? "Se elimino la publicacion, se sumo un strike y se envio el mensaje al usuario."
            : "Se elimino la publicacion y se sumo un strike, pero no se pudo enviar el mensaje.",
          duration: messageSent ? 3500 : 5500,
        });
      } catch (error) {
        console.error("Error deleting publication:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo eliminar la publicacion.",
          duration: 4000,
        });
      } finally {
        setIsDeletingPublication(false);
      }
    },
    [showToast],
  );

  const handleAssignVerification = useCallback(
    async (verifyType: string) => {
      const userId = perfilUser?.User?._id;
      if (!userId) return;

      setVerificationSaving(true);
      try {
        const response = await userService.AssignVerification(userId, verifyType);
        const updated = response?.data || response;
        setPerfilUser((current) =>
          current?.User
            ? {
                ...current,
                User: {
                  ...current.User,
                  Verify: updated?.Verify,
                  VerifyType:
                    verifyType === "none" ? undefined : updated?.VerifyType,
                },
              }
            : current,
        );
        setVerificationModalOpen(false);
        showToast({
          type: "success",
          title: "Verificación actualizada",
          description:
            verifyType === "none"
              ? "Se quitó la verificación de la cuenta."
              : "La verificación se asignó correctamente.",
          duration: 3500,
        });
      } catch (error) {
        console.error("Error assigning verification:", error);
        showToast({
          type: "error",
          title: "Error",
          description: "No se pudo asignar la verificación.",
          duration: 4000,
        });
      } finally {
        setVerificationSaving(false);
      }
    },
    [perfilUser?.User?._id, showToast],
  );

  const applyStatus = async () => {
    if (!perfilUser?.User?._id) return;

    setStatusSaving(true);
    try {
      if (pendingStatus === "baneado") {
        await userService.BannedUser(perfilUser.User._id);
      } else if (pendingStatus === "suspendido") {
        await userService.SuspendUser(perfilUser.User._id);
      } else if (user.status === "baneado") {
        await userService.UnBannedUser(perfilUser.User._id);
      } else {
        await userService.ReactiveUser(perfilUser.User._id);
      }

      const nextStatusCode = getUserStatusCode(pendingStatus);
      setPerfilUser((current) =>
        current?.User
          ? {
              ...current,
              User: {
                ...current.User,
                Status: nextStatusCode,
              },
            }
          : current,
      );
      setUser((u) => ({ ...u, status: pendingStatus }));
      setStatusSaved(true);
      setStatusModalOpen(false);
      setConfirmStatusOpen(false);
      showToast({
        type: "success",
        title: "Estado actualizado",
        description: "El estado del usuario se guardó correctamente.",
      });
      setTimeout(() => setStatusSaved(false), 2200);
    } catch (error) {
      console.error("Error updating user status:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar el estado del usuario.",
      });
    } finally {
      setStatusSaving(false);
    }
  };

  const sc = STATUS_CFG[user.status];
  const isVerified =
    perfilUser?.User?.Verify === VerificationStatus.VERIFIED;
  const verificationLabel = isVerified
    ? getVerificationLabel(perfilUser?.User?.VerifyType)
    : "";
  const verificationColor = isVerified
    ? getVerificationColor(perfilUser?.User?.VerifyType)
    : c.accent;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 4px; }

        .status-chip {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px 14px; border-radius: 14px;
          border: 1.5px solid; cursor: pointer; flex: 1;
          font-size: 12px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.17s; position: relative; white-space: nowrap;
        }
        .status-chip:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }

        .action-btn {
          padding: 8px 16px; border-radius: 12px;
          border: 1.5px solid ${c.border}; background: transparent;
          color: ${c.textMuted}; font-size: 11px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s; white-space: nowrap;
        }
        .action-btn:hover { border-color: ${c.accent}44; color: ${c.accent}; background: ${c.accentSoft}; }
        .action-btn.danger { color: #f87171; border-color: rgba(248,113,113,0.3); }
        .action-btn.danger:hover { border-color: rgba(248,113,113,0.5); background: rgba(248,113,113,0.08); }

        .pub-tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 22px;
          border: 1.5px solid ${c.border}; background: transparent;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: ${c.textMuted}; transition: all 0.15s; white-space: nowrap;
        }
        .pub-tab-btn:hover { border-color: ${c.accent}44; color: ${c.accent}; background: ${c.accentSoft}; }
        .pub-tab-btn.active { background: ${c.accentMedium}; border-color: ${c.accent}44; color: ${c.accent}; box-shadow: 0 3px 12px rgba(107,115,240,0.2); }

        .pub-search {
          background: ${c.inputBackground}; border: 1.5px solid ${c.inputBorder};
          border-radius: 10px; padding: 8px 14px 8px 36px;
          font-size: 12px; color: ${c.text};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; width: 220px; transition: border-color 0.2s;
        }
        .pub-search::placeholder { color: ${c.textMuted}; }
        .pub-search:focus { border-color: ${c.accent}; }

        .social-col {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 22px 16px; cursor: default; transition: background 0.15s;
        }
        .social-col:hover { background: rgba(107,115,240,0.04); }

        .content-stat-cell {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 5px; padding: 20px 12px; cursor: pointer;
          transition: all 0.15s; position: relative;
        }
        .content-stat-cell:hover { transform: translateY(-2px); }

        @media (max-width: 768px) {
          .user-detail-content { padding: 0 14px 28px !important; }
          .user-detail-status {
            flex-direction: column !important;
          }
          .user-detail-status-panel {
            width: 100% !important;
          }
          .user-detail-status .action-btn { width: 100%; min-height: 42px; }
          .user-detail-overview {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
          }
          .user-detail-profile-card {
            width: 100% !important;
            min-height: 280px;
            padding: 24px 18px !important;
          }
          .user-detail-info-card { width: 100%; min-width: 0; }
          .user-detail-info-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px !important;
          }
          .user-detail-info-grid > div {
            align-items: flex-start;
            flex-direction: column !important;
            gap: 3px !important;
            padding-bottom: 8px;
            border-bottom: 1px solid ${c.border};
          }
          .user-detail-info-value {
            width: 100%;
            overflow: visible !important;
            text-overflow: clip !important;
            white-space: normal !important;
            overflow-wrap: anywhere;
          }
          .user-detail-actions {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px !important;
          }
          .user-detail-actions .action-btn {
            min-height: 44px;
            white-space: normal;
          }
        }

        @media (max-width: 440px) {
          .user-detail-content { padding-inline: 10px !important; }
          .user-detail-stats { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .user-detail-stats .social-col { min-width: 0; padding: 14px 5px !important; }
          .user-detail-stats .social-col > div:first-child { font-size: 20px !important; }
          .user-detail-stats .social-col > div:last-child { font-size: 9px !important; overflow-wrap: anywhere; }
          .user-detail-actions { grid-template-columns: minmax(0, 1fr); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.28s ease; }
      `}</style>

      <main
        style={{
          flex: 1,
          overflow: "auto",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* ══════════════════════════════════════════
            COVER
        ══════════════════════════════════════════ */}
        <div
          style={{
            position: "relative",
            height: 60,
            flexShrink: 0,
          }}
        >
          <div style={{ position: "absolute" }} />
          {/* Degradado hacia abajo para suavizar el corte */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
            }}
          />

          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: 16,
              left: 22,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.card,
              color: c.text,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backdropFilter: "blur(8px)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                `${c.card}000`)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = c.card)
            }
          >
            ← Volver
          </button>

          <div
            style={{
              position: "absolute",
              top: 16,
              right: 22,
              display: "flex",
              gap: 8,
            }}
          >
            <button
              className="action-btn"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(perfilUser || {}, null, 2)],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${perfilUser?.User?.Username || "usuario"}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
                color: c.text,
                backdropFilter: "blur(8px)",
              }}
            >
              📤 Exportar
            </button>
          </div>
        </div>

        <div className="user-detail-content" style={{ padding: "0 28px 40px" }}>
          {/* ══════════════════════════════════════════
              BLOQUE 1 — Control de estado HORIZONTAL
          ══════════════════════════════════════════ */}

          <div
            className="user-detail-status"
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 16,
              padding: "10px 12px",
              marginBottom: 12,
              display: "flex",
              alignItems: "stretch",
              gap: 10,
            }}
          >
            {/* Estado del usuario */}
            <div
              className="user-detail-status-panel"
              style={{
                flex: 1,
                minWidth: 0,
                border: `1.5px solid ${sc.border}`,
                background: sc.bg,
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 16 }}>{sc.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: sc.color,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Estado del usuario: {sc.label}
                  </div>
                  {statusSaved && (
                    <div style={{ fontSize: 10, color: c.success, marginTop: 2 }}>
                      Estado actualizado correctamente
                    </div>
                  )}
                </div>
              </div>
              {can(Permissions.SANCTION_USERS) && (
                <button
                  className="action-btn"
                  onClick={() => {
                    setPendingStatus(user.status);
                    setStatusModalOpen(true);
                  }}
                  style={{
                    flexShrink: 0,
                    background: "transparent",
                    borderColor: sc.color,
                    color: sc.color,
                  }}
                >
                  Cambiar estado
                </button>
              )}
            </div>

            {/* Verificación */}
            {can(Permissions.ASSIGN_VERIFICATION) && (
              <div
                className="user-detail-status-panel"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: `1.5px solid ${
                    isVerified ? `${verificationColor}55` : `${verificationColor}66`
                  }`,
                  background: isVerified
                    ? `${verificationColor}14`
                    : "transparent",
                  borderRadius: 14,
                  padding: isVerified ? "12px 14px" : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  overflow: "hidden",
                }}
              >
                {isVerified ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <VerifiedBadge
                        verify={VerificationStatus.VERIFIED}
                        verifyType={perfilUser?.User?.VerifyType}
                        size={18}
                      />
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: verificationColor,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {verificationLabel}
                      </div>
                    </div>
                    <button
                      className="action-btn"
                      onClick={() => setVerificationModalOpen(true)}
                      style={{
                        flexShrink: 0,
                        background: "transparent",
                        borderColor: verificationColor,
                        color: verificationColor,
                      }}
                    >
                      Cambiar / Quitar
                    </button>
                  </>
                ) : (
                  <button
                    className="action-btn"
                    onClick={() => setVerificationModalOpen(true)}
                    style={{
                      width: "100%",
                      minHeight: 46,
                      border: "none",
                      borderRadius: 14,
                      background: "transparent",
                      color: verificationColor,
                      fontSize: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    🛡️ Asignar verificación
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 2 — Foto de perfil (izq) + Red social (der)
              Alineados de forma PARALELA / side by side
          ══════════════════════════════════════════ */}
          <div
            className="user-detail-overview"
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 20,
              alignItems: "stretch",
            }}
          >
            {/* ── Foto de perfil grande ── */}
            <div
              className="user-detail-profile-card"
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                flexShrink: 0,
                width: 220,
              }}
            >
              {/* Avatar con ring de estado */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `${AVATAR_COLOR}20`,
                    border: `3px solid ${AVATAR_COLOR}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 42,
                    fontWeight: 900,
                    color: AVATAR_COLOR,
                    boxShadow: `0 0 0 6px ${AVATAR_COLOR}12, 0 12px 40px rgba(0,0,0,0.18)`,
                  }}
                >
                  <img
                    src={
                      perfilUser?.ProfilePhoto
                        ? perfilUser?.ProfilePhoto
                        : UserProfile
                    }
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: perfilUser?.ProfilePhoto
                        ? `2px solid ${Colors.detailAppColor}`
                        : undefined,
                    }}
                  />
                </div>
                {/* Anillo de estado */}
                <div
                  style={{
                    position: "absolute",
                    inset: -6,
                    borderRadius: "50%",
                    border: `2.5px solid ${sc.color}55`,
                    boxShadow: `0 0 18px ${sc.color}44`,
                    pointerEvents: "none",
                  }}
                />
                {/* Dot */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: sc.color,
                    border: `3px solid ${c.card}`,
                    boxShadow: `0 0 14px ${sc.color}bb`,
                  }}
                />
              </div>

              {/* Nombre + username */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: c.text,
                    marginBottom: 2,
                  }}
                >
                  {perfilUser?.User?.Name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: c.textMuted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  @{perfilUser?.User?.Username}
                  <VerifiedBadge
                    verify={perfilUser?.User?.Verify}
                    verifyType={perfilUser?.User?.VerifyType}
                    size={15}
                  />
                </div>
              </div>
            </div>

            {/* ── Red social: seguidores, seguidos, bloqueados + bio ── */}
            <div
              className="user-detail-info-card"
              style={{
                flex: 1,
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "10px 18px",
                  borderBottom: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Mono', monospace",
                    color: c.textMuted,
                    letterSpacing: "0.06em",
                  }}
                >
                  ESTADÍSTICAS
                </span>
              </div>

              {/* Tres columnas de stats — más compactas */}
              <div className="user-detail-stats" style={{ display: "flex" }}>
                {[
                  {
                    label: "Seguidores",
                    value: perfilUser?.Followers ?? 0,
                    color: c.accent,
                  },
                  {
                    label: "Seguidos",
                    value: perfilUser?.Followings ?? 0,
                    color: c.accent,
                  },
                  {
                    label: "Publicaciones",
                    value: perfilUser?.Posts ?? (perfilUser as any)?.Post ?? 0,
                    color: c.warning,
                  },
                  {
                    label: "Reportes",
                    value: perfilUser?.Reports ?? 0,
                    color: c.danger,
                  },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="social-col"
                    style={{
                      borderRight: i < 3 ? `1px solid ${c.border}` : "none",
                      padding: "14px 10px",
                      gap: 3,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        `${s.color}08`)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                  >
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: s.color,
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                      }}
                    >
                      {fmt(s.value)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: c.textMuted,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bio + Info del usuario */}
              <div
                style={{
                  borderTop: `1px solid ${c.border}`,
                  padding: "12px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                }}
              >
                {/* Grid de info */}
                <div
                  className="user-detail-info-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px 14px",
                  }}
                >
                  {[
                    {
                      label: "Email",
                      value: perfilUser?.User?.Email,
                      extra: perfilUser?.User?.Validate ? (
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: "rgba(52,211,153,0.12)",
                            color: c.success,
                            border: "1px solid rgba(52,211,153,0.25)",
                            marginLeft: 4,
                          }}
                        >
                          ✓ validado
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 6,
                            background: "rgba(248,113,113,0.10)",
                            color: c.danger,
                            border: "1px solid rgba(248,113,113,0.2)",
                            marginLeft: 4,
                          }}
                        >
                          ✕ no validado
                        </span>
                      ),
                    },
                    {
                      label: "Teléfono",
                      value: perfilUser?.User?.Phone || "—",
                    },
                    {
                      label: "Fecha de nacimiento",
                      value: formatBirthDate(perfilUser?.User?.Birthday),
                    },
                    {
                      label: "Género",
                      value: perfilUser?.User?.Gender || "—",
                    },
                    {
                      label: "Edad",
                      value: getAgeLabel(perfilUser?.User?.Birthday),
                    },                    {
                      label: "Ciudad",
                      value: perfilUser?.User?.City || "-",
                    },
                    {
                      label: "Pais",
                      value: perfilUser?.User?.Country || "-",
                    },
                    {
                      label: "Strikes",
                      value: perfilUser?.User?.Strike ?? 0,
                      color:
                        (perfilUser?.User?.Strike ?? 0) > 0
                          ? c.danger
                          : c.text,
                    },                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                      }}
                    >
                      <div
                        className="user-detail-info-value"
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: c.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {item.label}:
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color:
                            item.color ||
                            (item.value && item.value !== "-"
                              ? c.text
                              : c.border),
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.value}
                        {"extra" in item && item.extra}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: c.border }} />

                {/* Bio */}
                {perfilUser?.User?.PerfilData?.Presentation && (
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: c.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 4,
                      }}
                    >
                      Bio
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: c.textMuted,
                        lineHeight: 1.6,
                      }}
                    >
                      {perfilUser?.User?.PerfilData?.Presentation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 3 — Tabs de contenido
          ══════════════════════════════════════════ */}
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
              marginBottom: 16,
            }}
          >
            <div
              className="user-detail-actions"
              style={{
                padding: "10px 12px",
                display: "flex",
                flexDirection: "row",
                gap: 5,
              }}
            >
              {CONTENT_SECTIONS.map((section) => {
                const active = contentSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`action-btn${active ? " active" : ""}`}
                    onClick={() => setContentSection(section.id)}
                    style={{
                      width: "100%",
                      textAlign: "center",
                      color: active ? c.accent : c.textMuted,
                      borderColor: active ? `${c.accent}66` : c.border,
                      background: active ? c.accentSoft : "transparent",
                    }}
                  >
                    {section.emoji} {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 4 — Contenido de la sección
          ══════════════════════════════════════════ */}
          <div id="pub-section">
            {contentSection === "publicaciones" && (
              <>
                <div
                  style={{
                    background: c.card,
                    border: `1.5px solid ${c.border}`,
                    borderRadius: 20,
                    padding: "16px 20px",
                    marginBottom: 16,
                    boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {PUB_TABS.map((t) => (
                      <button
                        key={t.id}
                        className={`pub-tab-btn${pubTab === t.id ? " active" : ""}`}
                        onClick={() => {
                          setPubTab(t.id);
                          setSearch("");
                        }}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            padding: "1px 6px",
                            borderRadius: 8,
                            background:
                              pubTab === t.id ? c.accent + "33" : c.accentSoft,
                            color: pubTab === t.id ? c.accent : c.textMuted,
                          }}
                        >
                          {getTabCount(t)}
                        </span>
                      </button>
                    ))}
                    <div style={{ marginLeft: "auto", position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 12,
                          color: c.textMuted,
                          pointerEvents: "none",
                        }}
                      >
                        🔍
                      </span>
                      <input
                        className="pub-search"
                        placeholder="Buscar publicación…"
                        value={searchPub}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="fade-up"
                  key={pubTab}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                    gap: 14,
                  }}
                >
                  {pubs.length === 0 ? (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        padding: 52,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 36, opacity: 0.2, marginBottom: 10 }}>
                        📭
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: c.textMuted,
                        }}
                      >
                        {searchPub
                          ? `Sin resultados para "${searchPub}"`
                          : "Sin publicaciones"}
                      </div>
                    </div>
                  ) : (
                    pubs.map((pub) => (
                      <div
                        key={pub._id}
                        onClick={() => setSelectedPublication(pub)}
                        style={{ cursor: "pointer" }}
                      >
                        <PubCard publication={pub} />
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {contentSection === "historias" && (
              <div
                style={{
                  background: c.card,
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 20,
                  padding: 16,
                  boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                }}
              >
                {sectionLoading ? (
                  <div style={{ padding: 40, textAlign: "center", color: c.textMuted }}>
                    Cargando historias…
                  </div>
                ) : userStories.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: c.textMuted }}>
                    Sin historias publicadas
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: 14,
                    }}
                  >
                    {userStories.map((item) => {
                      const status =
                        STORY_STATUS[item.Status] ||
                        STORY_STATUS[HistoryStatus.PUBLISHED];
                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => setSelectedStory(item)}
                          style={{
                            border: `1.5px solid ${c.border}`,
                            borderRadius: 18,
                            overflow: "hidden",
                            background: c.inputBackground,
                            textAlign: "left",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              height: 220,
                              background: "#111",
                            }}
                          >
                            {item.MediaData ? (
                              isStoryVideo(item) ? (
                                <video
                                  src={item.MediaData}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  muted
                                />
                              ) : (
                                <img
                                  src={item.MediaData}
                                  alt="historia"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              )
                            ) : (
                              <div
                                style={{
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: c.textMuted,
                                }}
                              >
                                Sin media
                              </div>
                            )}
                            <span
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                background: status.bg,
                                color: status.color,
                                fontSize: 10,
                                fontWeight: 800,
                                padding: "4px 8px",
                                borderRadius: 999,
                              }}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div style={{ padding: 12 }}>
                            <div
                              style={{
                                color: c.textMuted,
                                fontSize: 11,
                              }}
                            >
                              {item.CreateDate
                                ? new Date(item.CreateDate).toLocaleString()
                                : "—"}
                            </div>
                            {item.OverlayText ? (
                              <div
                                style={{
                                  color: c.text,
                                  fontSize: 12,
                                  marginTop: 4,
                                  fontWeight: 600,
                                }}
                              >
                                {item.OverlayText}
                              </div>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {contentSection === "reportes" && (
              <div
                style={{
                  background: c.card,
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 20,
                  padding: 16,
                  boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                  display: "grid",
                  gap: 10,
                }}
              >
                {sectionLoading ? (
                  <div style={{ padding: 40, textAlign: "center", color: c.textMuted }}>
                    Cargando reportes…
                  </div>
                ) : userReports.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: c.textMuted }}>
                    Sin reportes contra este usuario
                  </div>
                ) : (
                  userReports.map((report) => {
                    const reason = getReasonById(report.Type);
                    const status =
                      REPORT_STATUS_CFG[Number(report.Status)] ||
                      REPORT_STATUS_CFG[ReportStatus.PENDING];
                    return (
                      <button
                        key={report._id}
                        type="button"
                        onClick={() => navigate(`/moderation/${report._id}`)}
                        style={{
                          textAlign: "left",
                          border: `1.5px solid ${c.border}`,
                          borderRadius: 14,
                          padding: "12px 14px",
                          background: c.inputBackground,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: c.text,
                            }}
                          >
                            {reason?.icon || "📋"}{" "}
                            {reason?.label || report.Type || "Reporte"}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: c.textMuted,
                              marginTop: 4,
                            }}
                          >
                            {report.Category || "contenido"}
                            {report.ReporterUser?.Username
                              ? ` · por @${report.ReporterUser.Username}`
                              : ""}
                            {report.CreateDate
                              ? ` · ${new Date(report.CreateDate).toLocaleString()}`
                              : ""}
                          </div>
                        </div>
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 10,
                            fontWeight: 800,
                            color: status.color,
                            background: `${status.color}18`,
                            padding: "4px 8px",
                            borderRadius: 999,
                          }}
                        >
                          {status.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {contentSection === "historial" && (
              <div
                style={{
                  background: c.card,
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 20,
                  padding: 16,
                  boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
                  display: "grid",
                  gap: 10,
                }}
              >
                {sectionLoading ? (
                  <div style={{ padding: 40, textAlign: "center", color: c.textMuted }}>
                    Cargando historial…
                  </div>
                ) : profileEdits.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: c.textMuted }}>
                    Sin cambios de información registrados
                  </div>
                ) : (
                  profileEdits.map((edit) => (
                    <div
                      key={edit._id || `${edit.Item}-${edit.CreateDate}`}
                      style={{
                        border: `1.5px solid ${c.border}`,
                        borderRadius: 14,
                        padding: "12px 14px",
                        background: c.inputBackground,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: c.text,
                          }}
                        >
                          {PROFILE_EDIT_LABELS[edit.Item] || edit.Item}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: c.textMuted,
                            flexShrink: 0,
                          }}
                        >
                          {edit.CreateDate
                            ? new Date(edit.CreateDate).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: c.textMuted,
                              textTransform: "uppercase",
                              marginBottom: 2,
                            }}
                          >
                            Anterior
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: c.text,
                              wordBreak: "break-word",
                            }}
                          >
                            {edit.OldItem || "—"}
                          </div>
                        </div>
                        <div style={{ color: c.accent, fontWeight: 800 }}>→</div>
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: c.textMuted,
                              textTransform: "uppercase",
                              marginBottom: 2,
                            }}
                          >
                            Nuevo
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: c.text,
                              wordBreak: "break-word",
                            }}
                          >
                            {edit.NewItem || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedStory && (
        <div
          onClick={() => setSelectedStory(null)}
          style={{
            position: "fixed",
            inset: 0,
            background:
              theme === "dark" ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.45)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: c.card,
              borderRadius: 18,
              overflow: "hidden",
              border: `1.5px solid ${c.border}`,
            }}
          >
            <div style={{ height: 480, background: "#111" }}>
              {selectedStory.MediaData ? (
                isStoryVideo(selectedStory) ? (
                  <video
                    src={selectedStory.MediaData}
                    controls
                    autoPlay
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src={selectedStory.MediaData}
                    alt="historia"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )
              ) : null}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: c.textMuted }}>
                {selectedStory.CreateDate
                  ? new Date(selectedStory.CreateDate).toLocaleString()
                  : "—"}
              </div>
              {selectedStory.OverlayText ? (
                <div style={{ marginTop: 6, color: c.text, fontWeight: 700 }}>
                  {selectedStory.OverlayText}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <UserPublicationModal
        pub={selectedPublication}
        c={c}
        theme={theme}
        onClose={() => setSelectedPublication(null)}
        onDelete={handleDeletePublication}
        isDeleting={isDeletingPublication}
      />

      {verificationModalOpen && (
        <AssignVerificationModal
          c={c}
          theme={theme}
          username={perfilUser?.User?.Username}
          currentVerify={perfilUser?.User?.Verify}
          currentVerifyType={perfilUser?.User?.VerifyType}
          saving={verificationSaving}
          onClose={() => {
            if (!verificationSaving) setVerificationModalOpen(false);
          }}
          onConfirm={handleAssignVerification}
        />
      )}

      {statusModalOpen && (
        <div
          onClick={() => setStatusModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background:
              theme === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.38)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 18,
              boxShadow: "0 22px 70px rgba(0,0,0,0.32)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: `1px solid ${c.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
                  Cambiar estado del usuario
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                  Selecciona el nuevo estado antes de confirmar.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.card,
                  color: c.textMuted,
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>

            <div style={{ padding: 16, display: "grid", gap: 10 }}>
              {(
                Object.entries(STATUS_CFG) as [
                  typeof user.status,
                  (typeof STATUS_CFG)[keyof typeof STATUS_CFG],
                ][]
              ).map(([k, v]) => (
                <button
                  key={k}
                  className="status-chip"
                  type="button"
                  onClick={() => setPendingStatus(k)}
                  style={{
                    borderColor: pendingStatus === k ? v.color + "77" : c.border,
                    background: pendingStatus === k ? v.bg : c.card,
                    color: pendingStatus === k ? v.color : c.textMuted,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{v.emoji}</span>
                  <span>{v.label}</span>
                  {user.status === k && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 9,
                        fontWeight: 900,
                        color: v.color,
                      }}
                    >
                      ACTUAL
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderTop: `1px solid ${c.border}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="action-btn"
                disabled={pendingStatus === user.status}
                onClick={() => setConfirmStatusOpen(true)}
                style={{
                  background:
                    pendingStatus === user.status ? c.accentSoft : c.accent,
                  color: pendingStatus === user.status ? c.textMuted : "#fff",
                  borderColor:
                    pendingStatus === user.status ? c.border : c.accent,
                  opacity: pendingStatus === user.status ? 0.7 : 1,
                  cursor:
                    pendingStatus === user.status ? "not-allowed" : "pointer",
                }}
              >
                Guardar cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmStatusOpen && (
        <div
          onClick={() => setConfirmStatusOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "rgba(0,0,0,0.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
              Confirmar cambio
            </div>
            <div
              style={{
                fontSize: 12,
                color: c.textMuted,
                lineHeight: 1.6,
                marginTop: 8,
              }}
            >
              Vas a cambiar el estado de @{perfilUser?.User?.Username} a{" "}
              <strong style={{ color: STATUS_CFG[pendingStatus].color }}>
                {STATUS_CFG[pendingStatus].label}
              </strong>
              . Esta accion actualizara tambien la disponibilidad de sus
              publicaciones segun corresponda.
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={() => setConfirmStatusOpen(false)}
                disabled={statusSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={applyStatus}
                disabled={statusSaving}
                style={{
                  background: STATUS_CFG[pendingStatus].color,
                  borderColor: STATUS_CFG[pendingStatus].color,
                  color: "#fff",
                  opacity: statusSaving ? 0.7 : 1,
                }}
              >
                {statusSaving ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetail;
