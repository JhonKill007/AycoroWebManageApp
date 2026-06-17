import { useMemo, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import { AssignCasesModal } from "../Modules/Moderation/Modals/AssignCasesModal";

// ─── Datos mock ───────────────────────────────────────────────────────
const QUEUE_DATA: any = [
  {
    id: "MOD-001",
    type: "publicacion",
    priority: "critica",
    title: "Contenido de acoso coordinado",
    description:
      "Múltiples usuarios reportaron esta publicación por contener llamadas directas a hostigar a un usuario específico de la comunidad.",
    author: "troll_2024",
    target: "sofia_r",
    reportes: 12,
    status: "pendiente",
    date: "2025-02-26 09:14",
    assignedTo: null,
    tags: ["acoso", "coordinado"],
    evidence:
      "El post contiene el usuario objetivo, instrucciones explícitas y fue compartido en 3 grupos.",
  },
  {
    id: "MOD-002",
    type: "mensaje",
    priority: "critica",
    title: "Amenaza directa en conversación privada",
    description:
      "Usuario envió mensajes amenazantes con contenido violento a otro miembro. La víctima adjuntó capturas de pantalla.",
    author: "alex_k",
    target: "sofia_r",
    reportes: 5,
    status: "en_revision",
    date: "2025-02-26 08:55",
    assignedTo: "carlos_m",
    tags: ["amenaza", "violencia"],
    evidence:
      "3 capturas de pantalla adjuntas por la víctima. Mensajes confirmados en logs del sistema.",
  },
  {
    id: "MOD-003",
    type: "perfil",
    priority: "alta",
    title: "Suplantación de identidad de marca",
    description:
      "Cuenta creada para hacerse pasar por una empresa conocida. Está recopilando información de usuarios bajo pretextos falsos.",
    author: "fake_acc",
    target: null,
    reportes: 7,
    status: "pendiente",
    date: "2025-02-26 07:30",
    assignedTo: null,
    tags: ["fraude", "suplantación"],
    evidence:
      "Logo copiado, descripción idéntica a la marca original. 4 usuarios reportaron haber sido contactados.",
  },
  {
    id: "MOD-004",
    type: "publicacion",
    priority: "alta",
    title: "Desinformación médica peligrosa",
    description:
      "Publicación que desaconseja tratamientos médicos verificados y promueve remedios sin respaldo científico para enfermedades graves.",
    author: "newuser99",
    target: null,
    reportes: 9,
    status: "pendiente",
    date: "2025-02-25 22:10",
    assignedTo: null,
    tags: ["desinformación", "salud"],
    evidence:
      "Contenido revisado por sistema automático. Marcado por 9 usuarios. Sin fuentes citadas.",
  },
  {
    id: "MOD-005",
    type: "conversacion",
    priority: "media",
    title: "Spam masivo en grupo",
    description:
      "Bot automatizado enviando links de productos no solicitados en múltiples grupos de la comunidad.",
    author: "bot_acc1",
    target: null,
    reportes: 3,
    status: "pendiente",
    date: "2025-02-25 18:40",
    assignedTo: null,
    tags: ["spam", "bot"],
    evidence:
      "Patrón detectado: 47 mensajes idénticos en 6 grupos diferentes en menos de 2 horas.",
  },
  {
    id: "MOD-006",
    type: "publicacion",
    priority: "media",
    title: "Imagen sin advertencia de contenido sensible",
    description:
      "Publicación con imagen perturbadora sin etiqueta de contenido sensible. Varios usuarios menores de edad podrían verla.",
    author: "dark_usr",
    target: null,
    reportes: 4,
    status: "en_revision",
    date: "2025-02-25 15:20",
    assignedTo: "carlos_m",
    tags: ["contenido", "sensible"],
    evidence:
      "Imagen identificada. No hay etiqueta CW. La publicación es pública y accesible sin restricciones.",
  },
  {
    id: "MOD-007",
    type: "perfil",
    priority: "baja",
    title: "Nombre de usuario ofensivo",
    description:
      "El nombre de usuario elegido contiene lenguaje ofensivo que viola las normas de la comunidad.",
    author: "hacker_0x",
    target: null,
    reportes: 2,
    status: "pendiente",
    date: "2025-02-25 12:05",
    assignedTo: null,
    tags: ["nombre", "normas"],
    evidence:
      "Username documentado. Primer incidente del usuario en la plataforma.",
  },
  {
    id: "MOD-008",
    type: "mensaje",
    priority: "alta",
    title: "Phishing: links falsos de login",
    description:
      "Usuario distribuyendo links de sitios falsos que imitan el login de Aycoro para robar credenciales.",
    author: "hacker_0x",
    target: null,
    reportes: 6,
    status: "pendiente",
    date: "2025-02-25 10:30",
    assignedTo: null,
    tags: ["phishing", "fraude"],
    evidence:
      "URL analizada: dominio sospechoso registrado hace 3 días. Patrón de distribución masiva.",
  },
];

const MODERATORS_DATA: any[] = [
  {
    id: "mod-001",
    name: "carlos_m",
    email: "carlos@aycoro.com",
    role: "supervisor",
    activeCases: 2,
    totalResolved: 147,
    specialties: ["acoso", "amenazas", "contenido sensible"],
    status: "online",
  },
  {
    id: "mod-002",
    name: "lucia_v",
    email: "lucia@aycoro.com",
    role: "admin",
    activeCases: 1,
    totalResolved: 203,
    specialties: ["fraude", "suplantación", "phishing"],
    status: "online",
  },
  {
    id: "mod-003",
    name: "andres_g",
    email: "andres@aycoro.com",
    role: "moderator",
    activeCases: 3,
    totalResolved: 89,
    specialties: ["spam", "desinformación"],
    status: "busy",
  },
  {
    id: "mod-004",
    name: "maria_f",
    email: "maria@aycoro.com",
    role: "moderator",
    activeCases: 1,
    totalResolved: 56,
    specialties: ["contenido sensible", "normas", "spam"],
    status: "away",
  },
  {
    id: "mod-005",
    name: "javier_rod",
    email: "javier@aycoro.com",
    role: "supervisor",
    activeCases: 2,
    totalResolved: 178,
    specialties: ["acoso", "fraude", "phishing"],
    status: "online",
  },
  {
    id: "mod-006",
    name: "sofia_p",
    email: "sofia@aycoro.com",
    role: "moderator",
    activeCases: 0,
    totalResolved: 34,
    specialties: ["spam", "normas", "contenido sensible"],
    status: "online",
  },
];

const HISTORY_DATA: any = [
  {
    id: "ACT-001",
    action: "ban",
    moderator: "lucia_v",
    target: "troll_2023",
    type: "usuario",
    date: "2025-02-24 14:30",
    reason: "Acoso reiterado tras segunda advertencia.",
  },
  {
    id: "ACT-002",
    action: "eliminar",
    moderator: "carlos_m",
    target: "PUB-089",
    type: "publicacion",
    date: "2025-02-24 11:15",
    reason: "Desinformación sobre tratamientos médicos.",
  },
  {
    id: "ACT-003",
    action: "advertir",
    moderator: "lucia_v",
    target: "newuser88",
    type: "usuario",
    date: "2025-02-23 16:45",
    reason: "Primer aviso por spam en grupos.",
  },
  {
    id: "ACT-004",
    action: "suspender",
    moderator: "carlos_m",
    target: "pedro_lm",
    type: "usuario",
    date: "2025-02-23 09:20",
    reason: "Contenido inapropiado repetido. Suspensión 7 días.",
  },
  {
    id: "ACT-005",
    action: "eliminar",
    moderator: "lucia_v",
    target: "CNV-034",
    type: "conversacion",
    date: "2025-02-22 18:00",
    reason: "Conversación usada para coordinar acoso.",
  },
  {
    id: "ACT-006",
    action: "resolver",
    moderator: "carlos_m",
    target: "PUB-076",
    type: "publicacion",
    date: "2025-02-22 13:30",
    reason: "Reporte falso. Contenido revisado y aprobado.",
  },
];

// ─── Configs ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG: any = {
  critica: { label: "Crítica", color: "danger", dot: "🔴" },
  alta: { label: "Alta", color: "warning", dot: "🟠" },
  media: { label: "Media", color: "info", dot: "🔵" },
  baja: { label: "Baja", color: "success", dot: "🟢" },
};

const STATUS_CONFIG: any = {
  pendiente: { label: "Pendiente", dot: "⏳", color: "warning" },
  en_revision: { label: "En revisión", dot: "🔍", color: "info" },
  resuelto: { label: "Resuelto", dot: "✅", color: "success" },
  descartado: { label: "Descartado", dot: "❌", color: "muted" },
};

const TYPE_CONFIG: any = {
  publicacion: { label: "Publicación", emoji: "📝" },
  mensaje: { label: "Mensaje", emoji: "💬" },
  perfil: { label: "Perfil", emoji: "👤" },
  conversacion: { label: "Conversación", emoji: "💬" },
};

const ACTION_CONFIG: any = {
  ban: { label: "Ban", emoji: "🚫", color: "danger" },
  eliminar: { label: "Eliminado", emoji: "🗑️", color: "danger" },
  advertir: { label: "Advertencia", emoji: "⚠️", color: "warning" },
  suspender: { label: "Suspensión", emoji: "⏸️", color: "warning" },
  resolver: { label: "Resuelto", emoji: "✅", color: "success" },
};

const AVATAR_PALETTE = [
  "#7b83f5",
  "#f87171",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#a78bfa",
  "#fb923c",
  "#e879f9",
];
const getAvatarColor = (n = "") =>
  AVATAR_PALETTE[n.charCodeAt(0) % AVATAR_PALETTE.length];

// ─── Sub-componentes ──────────────────────────────────────────────────
function KpiCard({ emoji, label, value, sub, colorKey, c }: any) {
  const map: any = {
    success: { bg: c.successSoft, text: c.success },
    warning: { bg: c.warningSoft, text: c.warning },
    danger: { bg: c.dangerSoft, text: c.danger },
    info: { bg: c.infoSoft, text: c.info },
    accent: { bg: c.accentSoft, text: c.accent },
  };
  const col = map[colorKey] || map.accent;
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: "16px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 2px 12px rgba(107,115,240,0.06)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
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
      <div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: col.text,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        <div
          style={{ fontSize: "11px", fontWeight: "600", color: c.textMuted }}
        >
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: "10px", color: c.border, marginTop: "1px" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function UserAvatar({ username, size = 30 }: any) {
  const bg = getAvatarColor(username);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${bg}22`,
        border: `2px solid ${bg}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: "800",
        color: bg,
        flexShrink: 0,
      }}
    >
      {(username || "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

function PriorityBadge({ priority, c }: any) {
  const cfg = PRIORITY_CONFIG[priority];
  const map: any = {
    danger: { bg: c.dangerSoft, text: c.danger },
    warning: { bg: c.warningSoft, text: c.warning },
    info: { bg: c.infoSoft, text: c.info },
    success: { bg: c.successSoft, text: c.success },
  };
  const col = map[cfg.color];
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: "700",
        padding: "3px 9px",
        borderRadius: "20px",
        background: col.bg,
        color: col.text,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.dot} {cfg.label}
    </span>
  );
}

function StatusBadge({ status, c }: any) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  const map: any = {
    success: { bg: c.successSoft, text: c.success },
    warning: { bg: c.warningSoft, text: c.warning },
    info: { bg: c.infoSoft, text: c.info },
    muted: { bg: c.accentSoft, text: c.textMuted },
  };
  const col = map[cfg.color];
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: "700",
        padding: "3px 9px",
        borderRadius: "20px",
        background: col.bg,
        color: col.text,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.dot} {cfg.label}
    </span>
  );
}

// ─── Modal de caso ────────────────────────────────────────────────────
function CaseModal({ item, c, theme, onClose, onResolve }: any) {
  const [action, setAction] = useState(null);
  const [note, setNote] = useState("");
  if (!item) return null;

  const ACTIONS_LIST = [
    {
      key: "ban",
      label: "🚫 Banear usuario",
      color: c.danger,
      bg: c.dangerSoft,
    },
    {
      key: "suspender",
      label: "⏸️ Suspender 7 días",
      color: c.warning,
      bg: c.warningSoft,
    },
    {
      key: "advertir",
      label: "⚠️ Enviar advertencia",
      color: c.warning,
      bg: c.warningSoft,
    },
    {
      key: "eliminar",
      label: "🗑️ Eliminar contenido",
      color: c.danger,
      bg: c.dangerSoft,
    },
    {
      key: "resolver",
      label: "✅ Resolver sin acción",
      color: c.success,
      bg: c.successSoft,
    },
    {
      key: "descartar",
      label: "❌ Descartar reporte",
      color: c.textMuted,
      bg: c.accentSoft,
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.80)" : "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: "24px",
          width: "100%",
          maxWidth: "580px",
          overflow: "hidden",
          boxShadow: "0 28px 90px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#1a1a30,#0f0f22)"
                : "linear-gradient(135deg,#ededff,#f5f0ff)",
            borderBottom: `1.5px solid ${c.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "14px" }}>
                  {TYPE_CONFIG[item.type]?.emoji}
                </span>
                <PriorityBadge priority={item.priority} c={c} />
                <StatusBadge status={item.status} c={c} />
                {item.reportes > 0 && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "3px 9px",
                      borderRadius: "20px",
                      background: c.dangerSoft,
                      color: c.danger,
                    }}
                  >
                    ⚠️ {item.reportes} reportes
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "800",
                  color: c.text,
                  marginBottom: "3px",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: c.accent,
                  fontFamily: "monospace",
                }}
              >
                {item.id}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                border: `1.5px solid ${c.border}`,
                background: c.card,
                cursor: "pointer",
                fontSize: "13px",
                color: c.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Descripción */}
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: c.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Descripción del caso
            </div>
            <div
              style={{
                fontSize: "13px",
                color: c.text,
                lineHeight: 1.6,
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                border: `1.5px solid ${c.border}`,
                borderRadius: "12px",
                padding: "14px 16px",
              }}
            >
              {item.description}
            </div>
          </div>

          {/* Partes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: item.target ? "1fr 1fr" : "1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.02)",
                border: `1.5px solid ${c.border}`,
                borderRadius: "12px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  color: c.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                👤 Autor denunciado
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <UserAvatar username={item.author} size={30} />
                <span
                  style={{ fontSize: "13px", fontWeight: "700", color: c.text }}
                >
                  @{item.author}
                </span>
              </div>
            </div>
            {item.target && (
              <div
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.02)",
                  border: `1.5px solid ${c.border}`,
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: c.textMuted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  🎯 Usuario afectado
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <UserAvatar username={item.target} size={30} />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: c.text,
                    }}
                  >
                    @{item.target}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Evidencia */}
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: c.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              🔎 Evidencia
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                background: c.infoSoft,
                border: `1.5px solid ${c.info}33`,
                borderRadius: "12px",
                padding: "12px 14px",
              }}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>📋</span>
              <span
                style={{ fontSize: "12px", color: c.text, lineHeight: 1.6 }}
              >
                {item.evidence}
              </span>
            </div>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {item.tags.map((t: any) => (
                <span
                  key={t}
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: c.accentSoft,
                    color: c.accent,
                    border: `1px solid ${c.accentMedium}`,
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Asignado */}
          {item.assignedTo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: c.accentSoft,
                border: `1px solid ${c.accentMedium}`,
              }}
            >
              <UserAvatar username={item.assignedTo} size={24} />
              <span
                style={{ fontSize: "12px", fontWeight: "600", color: c.text }}
              >
                Asignado a{" "}
                <strong style={{ color: c.accent }}>@{item.assignedTo}</strong>
              </span>
            </div>
          )}

          {/* Selector de acción */}
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: c.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Selecciona una acción
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {ACTIONS_LIST.map((a: any) => (
                <button
                  key={a.key}
                  onClick={() => setAction(a.key)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: `1.5px solid ${action === a.key ? a.color : c.border}`,
                    background: action === a.key ? a.bg : "transparent",
                    color: action === a.key ? a.color : c.textMuted,
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: c.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Nota interna{" "}
              <span
                style={{
                  color: c.border,
                  fontWeight: "400",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (opcional)
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agrega contexto o razón de la decisión..."
              rows={3}
              style={{
                width: "100%",
                background: c.inputBackground,
                border: `1.5px solid ${c.inputBorder}`,
                borderRadius: "12px",
                padding: "12px 14px",
                fontSize: "12px",
                color: c.text,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                outline: "none",
                resize: "vertical",
                transition: "border-color 0.2s",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px 20px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              if (action) {
                onResolve(item.id, action, note);
                onClose();
              }
            }}
            disabled={!action}
            style={{
              flex: 2,
              padding: "10px 18px",
              borderRadius: "12px",
              background: action ? c.accent : c.border,
              color: action ? "#fff" : c.textMuted,
              border: "none",
              fontSize: "13px",
              fontWeight: "800",
              cursor: action ? "pointer" : "not-allowed",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: action ? "0 4px 16px rgba(107,115,240,0.35)" : "none",
              transition: "all 0.15s",
            }}
          >
            {action
              ? `Ejecutar: ${ACTIONS_LIST.find((a) => a.key === action)?.label}`
              : "Selecciona una acción"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "12px",
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.textMuted,
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────
const Moderation = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [queue, setQueue] = useState(QUEUE_DATA);
  const [history] = useState(HISTORY_DATA);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("cola");
  const [filterPriority, setFilterPriority] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");

  const [showAssignModal, setShowAssignModal] = useState(false);

  const stats = useMemo(
    () => ({
      total: queue.length,
      pendientes: queue.filter((i: any) => i.status === "pendiente").length,
      revision: queue.filter((i: any) => i.status === "en_revision").length,
      criticos: queue.filter((i: any) => i.priority === "critica").length,
      resueltos: history.length,
    }),
    [queue, history],
  );

  const filteredQueue = useMemo(() => {
    return queue
      .filter(
        (i: any) => filterPriority === "todos" || i.priority === filterPriority,
      )
      .filter((i: any) => filterType === "todos" || i.type === filterType)
      .filter((i: any) => filterStatus === "todos" || i.status === filterStatus)
      .filter(
        (i: any) =>
          search === "" ||
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.author.toLowerCase().includes(search.toLowerCase()) ||
          i.tags.some((t: any) => t.includes(search.toLowerCase())),
      )
      .sort((a: any, b: any) => {
        const ord: any = { critica: 0, alta: 1, media: 2, baja: 3 };
        return ord[a.priority] - ord[b.priority];
      });
  }, [queue, filterPriority, filterType, filterStatus, search]);

  const handleResolve = (id: any, action: any, note: any) => {
    setQueue((prev: any) =>
      prev.map((i: any) =>
        i.id !== id
          ? i
          : {
              ...i,
              status:
                action === "resolver" || action === "descartar"
                  ? action
                  : "resuelto",
            },
      ),
    );
  };

  const priorityColors: any = {
    critica: c.danger,
    alta: c.warning,
    media: c.text,
    baja: c.success,
  };

  const handleAssignCases = (
    assignments: { caseId: string; moderatorId: string }[],
  ) => {
    setQueue((prev: any) =>
      prev.map((item: any) => {
        const assignment = assignments.find((a) => a.caseId === item.id);
        if (assignment) {
          const moderator = MODERATORS_DATA.find(
            (m) => m.id === assignment.moderatorId,
          );
          return {
            ...item,
            assignedTo: moderator?.name || null,
            status: "en_revision",
          };
        }
        return item;
      }),
    );
    setShowAssignModal(false);
  };

  const TabChip = ({ label, active, onClick }: any) => (
    <button
      onClick={onClick}
      style={{
        padding: "5px 13px",
        borderRadius: "20px",
        border: `1.5px solid ${active ? c.accent + "44" : c.border}`,
        background: active ? c.accentMedium : "transparent",
        color: active ? c.accent : c.textMuted,
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
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

        .search-input {
          background: ${c.inputBackground};
          border: 1.5px solid ${c.inputBorder};
          border-radius: 10px;
          padding: 8px 14px 8px 36px;
          font-size: 12px; color: ${c.text};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; width: 220px;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: ${c.textMuted}; }
        .search-input:focus { border-color: ${c.accent}; }

        .select-filter {
          background: ${c.inputBackground};
          border: 1.5px solid ${c.inputBorder};
          border-radius: 9px; padding: 6px 10px;
          font-size: 11px; font-weight: 600; color: ${c.textMuted};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }
        .select-filter:focus { border-color: ${c.accent}; }

        .queue-card {
          background: ${c.card};
          border: 1.5px solid ${c.border};
          border-radius: 16px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.18s;
          position: relative;
          overflow: hidden;
        }
        .queue-card:hover {
          border-color: ${c.accent}44;
          box-shadow: 0 4px 20px rgba(107,115,240,0.12);
          transform: translateY(-1px);
        }

        .main-tab {
          padding: 8px 18px;
          border-radius: 12px 12px 0 0;
          border: 1.5px solid transparent;
          background: transparent;
          cursor: pointer;
          font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s;
          border-bottom: none;
        }
        .main-tab.active {
          background: ${c.card};
          border-color: ${c.border};
          border-bottom-color: ${c.card};
          color: ${c.text};
          margin-bottom: -1px;
          position: relative; z-index: 1;
        }
        .main-tab:not(.active) {
          color: ${c.textMuted};
        }
        .main-tab:not(.active):hover { color: ${c.text}; }

        .history-row {
          display: grid;
          grid-template-columns: 90px 100px 100px 90px 1fr 90px;
          gap: 12px; padding: 12px 18px;
          border-bottom: 1px solid ${c.border};
          align-items: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.15s;
        }
        .history-row:last-child { border-bottom: none; }
        .history-row:hover { background: ${c.accentSoft}; }

        .textarea-note {
          transition: border-color 0.2s;
        }
        .textarea-note:focus { border-color: ${c.accent} !important; }
      `}</style>

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "26px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* ── Banner ── */}
        <div
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1f1020, #0f0f22)"
                : "linear-gradient(135deg, #fff0f0, #f5f0ff)",
            border: `1.5px solid ${c.danger}33`,
            borderRadius: "20px",
            padding: "22px 28px",
            marginBottom: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            boxShadow: "0 4px 24px rgba(248,113,113,0.08)",
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
              🛡️ Centro de Moderación
            </div>
            <div
              style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}
            >
              <strong style={{ color: c.danger }}>
                {stats.criticos} casos críticos
              </strong>{" "}
              requieren atención inmediata ·{" "}
              <strong style={{ color: c.warning }}>
                {stats.pendientes} pendientes
              </strong>{" "}
              en la cola
            </div>
          </div>
          <button
            onClick={() => setShowAssignModal(true)} // ← Agrega esto
            className="pill-cta"
            style={{
              background: c.danger,
              boxShadow: "0 4px 16px rgba(248,113,113,0.4)",
            }}
          >
            📋 Asignar casos →
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <KpiCard
            emoji="📋"
            label="En cola"
            value={stats.total}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="⏳"
            label="Pendientes"
            value={stats.pendientes}
            colorKey="warning"
            c={c}
          />
          <KpiCard
            emoji="🔍"
            label="En revisión"
            value={stats.revision}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="🔴"
            label="Críticos"
            value={stats.criticos}
            colorKey="danger"
            c={c}
          />
          <KpiCard
            emoji="✅"
            label="Resueltos hoy"
            value={stats.resueltos}
            colorKey="success"
            c={c}
          />
        </div>

        {/* ── Main tabs ── */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "-1px",
            paddingLeft: "2px",
          }}
        >
          {[
            { key: "cola", label: `⏳ Cola (${filteredQueue.length})` },
            { key: "historial", label: `✅ Historial (${history.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`main-tab${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Panel ── */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: "0 16px 16px 16px",
            overflow: "hidden",
            boxShadow: "0 2px 20px rgba(107,115,240,0.06)",
          }}
        >
          {/* ══ COLA ══ */}
          {activeTab === "cola" && (
            <>
              {/* Toolbar */}
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: `1.5px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "11px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      color: c.textMuted,
                    }}
                  >
                    🔍
                  </span>
                  <input
                    className="search-input"
                    placeholder="Buscar caso, usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {["todos", "pendiente", "en_revision"].map((s) => (
                    <TabChip
                      key={s}
                      label={
                        s === "todos"
                          ? "🔘 Todos"
                          : `${STATUS_CONFIG[s].dot} ${STATUS_CONFIG[s].label}`
                      }
                      active={filterStatus === s}
                      onClick={() => setFilterStatus(s)}
                    />
                  ))}
                </div>

                <select
                  className="select-filter"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="todos">🎯 Todas las prioridades</option>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]: any) => (
                    <option key={k} value={k}>
                      {v.dot} {v.label}
                    </option>
                  ))}
                </select>

                <select
                  className="select-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="todos">📄 Todos los tipos</option>
                  {Object.entries(TYPE_CONFIG).map(([k, v]: any) => (
                    <option key={k} value={k}>
                      {v.emoji} {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cards de cola */}
              {filteredQueue.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "42px",
                      opacity: 0.2,
                      marginBottom: "12px",
                    }}
                  >
                    🛡️
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: c.textMuted,
                    }}
                  >
                    Cola vacía
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: c.border,
                      marginTop: "4px",
                    }}
                  >
                    No hay casos que coincidan con los filtros
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {filteredQueue.map((item: any) => (
                    <div
                      key={item.id}
                      className="queue-card"
                      onClick={() => setSelected(item)}
                    >
                      {/* Barra de prioridad lateral */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          background: priorityColors[item.priority],
                          borderRadius: "16px 0 0 16px",
                        }}
                      />

                      <div style={{ paddingLeft: "10px" }}>
                        {/* Header row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "12px",
                            marginBottom: "10px",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                                marginBottom: "5px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span style={{ fontSize: "14px" }}>
                                {TYPE_CONFIG[item.type]?.emoji}
                              </span>
                              <PriorityBadge priority={item.priority} c={c} />
                              <StatusBadge status={item.status} c={c} />
                              {item.reportes > 0 && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    padding: "3px 8px",
                                    borderRadius: "20px",
                                    background: c.danger,
                                    color: c.danger,
                                  }}
                                >
                                  ⚠️ {item.reportes}
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: c.textMuted,
                                  marginLeft: "auto",
                                }}
                              >
                                {item.date}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "800",
                                color: c.text,
                                marginBottom: "4px",
                              }}
                            >
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: c.textMuted,
                                lineHeight: 1.5,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.description}
                            </div>
                          </div>
                        </div>

                        {/* Footer row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                            }}
                          >
                            {/* Autor */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <UserAvatar username={item.author} size={22} />
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: c.textMuted,
                                }}
                              >
                                @{item.author}
                              </span>
                            </div>
                            {item.target && (
                              <>
                                <span
                                  style={{ fontSize: "10px", color: c.border }}
                                >
                                  →
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <UserAvatar
                                    username={item.target}
                                    size={22}
                                  />
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      color: c.textMuted,
                                    }}
                                  >
                                    @{item.target}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            {/* Tags */}
                            {item.tags.slice(0, 2).map((t: any) => (
                              <span
                                key={t}
                                style={{
                                  fontSize: "9px",
                                  fontWeight: "700",
                                  padding: "2px 7px",
                                  borderRadius: "10px",
                                  background: c.accentSoft,
                                  color: c.accent,
                                  border: `1px solid ${c.accentMedium}`,
                                }}
                              >
                                #{t}
                              </span>
                            ))}
                            {/* Asignado */}
                            {item.assignedTo ? (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 9px",
                                  borderRadius: "20px",
                                  background: c.text,
                                  border: `1px solid ${c.text}33`,
                                }}
                              >
                                <UserAvatar
                                  username={item.assignedTo}
                                  size={16}
                                />
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    color: c.text,
                                  }}
                                >
                                  @{item.assignedTo}
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  color: c.textMuted,
                                  padding: "3px 9px",
                                  borderRadius: "20px",
                                  background: c.accentSoft,
                                }}
                              >
                                Sin asignar
                              </span>
                            )}
                            {/* Botón acción */}
                            <div
                              style={{
                                padding: "5px 14px",
                                borderRadius: "10px",
                                background: c.accent,
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: "700",
                              }}
                            >
                              Revisar →
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  padding: "12px 18px",
                  borderTop: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "11px", color: c.textMuted }}>
                  <strong style={{ color: c.text }}>
                    {filteredQueue.length}
                  </strong>{" "}
                  casos en cola · Ordenados por prioridad
                </span>
                <span style={{ fontSize: "11px", color: c.textMuted }}>
                  Haz clic para gestionar
                </span>
              </div>
            </>
          )}

          {/* ══ HISTORIAL ══ */}
          {activeTab === "historial" && (
            <>
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 100px 100px 90px 1fr 90px",
                  gap: "12px",
                  padding: "9px 18px",
                  background:
                    theme === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.02)",
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                {[
                  "ID",
                  "Acción",
                  "Moderador",
                  "Objetivo",
                  "Razón",
                  "Fecha",
                ].map((h) => (
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
                ))}
              </div>

              {history.map((item: any) => {
                const actionCfg = ACTION_CONFIG[item.action];
                const map: any = {
                  danger: { bg: c.danger, text: c.danger },
                  warning: { bg: c.warning, text: c.warning },
                  success: { bg: c.success, text: c.success },
                };
                const acol = map[actionCfg.color] || {
                  bg: c.accentSoft,
                  text: c.accent,
                };
                return (
                  <div key={item.id} className="history-row">
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: c.accent,
                        fontFamily: "monospace",
                      }}
                    >
                      {item.id}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        background: acol.bg,
                        color: acol.text,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {actionCfg.emoji} {actionCfg.label}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <UserAvatar username={item.moderator} size={22} />
                      <span
                        style={{
                          fontSize: "11px",
                          color: c.text,
                          fontWeight: "600",
                        }}
                      >
                        @{item.moderator}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: c.textMuted,
                        }}
                      >
                        {item.type}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: c.text,
                        }}
                      >
                        {item.target}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: c.textMuted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.reason}
                    </div>
                    <div style={{ fontSize: "10px", color: c.textMuted }}>
                      {item.date}
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  padding: "12px 18px",
                  borderTop: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "11px", color: c.textMuted }}>
                  <strong style={{ color: c.text }}>{history.length}</strong>{" "}
                  acciones registradas
                </span>
                <span style={{ fontSize: "11px", color: c.textMuted }}>
                  Auditoría completa disponible
                </span>
              </div>
            </>
          )}
        </div>
      </main>

      <CaseModal
        item={selected}
        c={c}
        theme={theme}
        onClose={() => setSelected(null)}
        onResolve={handleResolve}
      />

      {showAssignModal && (
        <AssignCasesModal
          cases={queue}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignCases}
        />
      )}
    </>
  );
};

export default Moderation;
