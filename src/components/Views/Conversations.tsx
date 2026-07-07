import { useMemo, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";

// ─── Datos mock ───────────────────────────────────────────────────────
const CONVERSATIONS_DATA = [
  {
    id: "CNV-001",
    type: "grupo",
    name: "Builders de Aycoro 🚀",
    participants: ["lucia_v", "carlos_m", "sofia_r", "martin_d", "jorge_s"],
    lastMessage: {
      author: "carlos_m",
      text: "¿Alguien probó la nueva API de notificaciones? Tiene un bug raro con los tokens.",
      time: "Hace 3 min",
    },
    messages: 1240,
    unread: 12,
    active: true,
    status: "activo",
    reportes: 0,
    created: "2024-08-15",
    lastActivity: "2025-02-26",
    pinned: true,
    preview: [
      {
        author: "lucia_v",
        text: "Buenos días equipo 👋 Tenemos call en 30 min",
        time: "09:02",
      },
      {
        author: "sofia_r",
        text: "Ya estoy conectada, compartí el link por favor 🙏",
        time: "09:05",
      },
      {
        author: "carlos_m",
        text: "¿Alguien probó la nueva API de notificaciones? Bug raro.",
        time: "09:18",
      },
      {
        author: "martin_d",
        text: "Sí, lo vi. El token expira antes de lo esperado.",
        time: "09:20",
      },
    ],
  },
  {
    id: "CNV-002",
    type: "directa",
    name: "sofia_r ↔ ana_flores",
    participants: ["sofia_r", "ana_flores"],
    lastMessage: {
      author: "ana_flores",
      text: "¡Me encantó tu post sobre el setup! ¿Qué tablet usas para los sketches?",
      time: "Hace 15 min",
    },
    messages: 87,
    unread: 3,
    active: true,
    status: "activo",
    reportes: 0,
    created: "2024-11-20",
    lastActivity: "2025-02-26",
    pinned: false,
    preview: [
      {
        author: "sofia_r",
        text: "Hola Ana! Vi tu reseña del libro, qué buena 🤩",
        time: "08:30",
      },
      {
        author: "ana_flores",
        text: "Gracias!! Lo terminé en dos días, no podía parar jaja",
        time: "08:35",
      },
      {
        author: "ana_flores",
        text: "¡Me encantó tu post! ¿Qué tablet usas para los sketches?",
        time: "08:41",
      },
    ],
  },
  {
    id: "CNV-003",
    type: "grupo",
    name: "Fotógrafos Urbanos 📸",
    participants: ["jorge_s", "elena_rq", "pablo_n", "rosa_tt"],
    lastMessage: {
      author: "jorge_s",
      text: "Quedamos el sábado a las 10 en Retiro. Traigan sus equipos.",
      time: "Hace 1h",
    },
    messages: 432,
    unread: 0,
    active: true,
    status: "activo",
    reportes: 0,
    created: "2024-10-01",
    lastActivity: "2025-02-26",
    pinned: false,
    preview: [
      {
        author: "elena_rq",
        text: "¿Vieron el cielo de hoy? Luz perfecta para disparar 🌤",
        time: "07:10",
      },
      {
        author: "pablo_n",
        text: "Salí temprano y saqué unas de Malasaña increíbles",
        time: "07:45",
      },
      {
        author: "jorge_s",
        text: "Quedamos el sábado a las 10 en Retiro.",
        time: "08:12",
      },
    ],
  },
  {
    id: "CNV-004",
    type: "directa",
    name: "lucia_v ↔ pedro_lm",
    participants: ["lucia_v", "pedro_lm"],
    lastMessage: {
      author: "pedro_lm",
      text: "Necesito que revisen mi cuenta, creo que fue bloqueada sin razón.",
      time: "Hace 2h",
    },
    messages: 14,
    unread: 1,
    active: false,
    status: "reportada",
    reportes: 2,
    created: "2025-02-10",
    lastActivity: "2025-02-26",
    pinned: false,
    preview: [
      { author: "pedro_lm", text: "Hola, ¿eres admin?", time: "14:00" },
      { author: "lucia_v", text: "Sí, cuéntame qué pasó.", time: "14:05" },
      {
        author: "pedro_lm",
        text: "Mi cuenta fue bloqueada sin razón, necesito ayuda.",
        time: "14:08",
      },
    ],
  },
  {
    id: "CNV-005",
    type: "grupo",
    name: "Bookclub Aycoro 📚",
    participants: [
      "ana_flores",
      "rosa_tt",
      "elena_rq",
      "lucia_v",
      "sofia_r",
      "martin_d",
    ],
    lastMessage: {
      author: "rosa_tt",
      text: "El próximo libro es 'Cien años de soledad'. ¡Por fin lo leeré!",
      time: "Hace 3h",
    },
    messages: 298,
    unread: 7,
    active: true,
    status: "activo",
    reportes: 0,
    created: "2024-09-05",
    lastActivity: "2025-02-25",
    pinned: false,
    preview: [
      {
        author: "ana_flores",
        text: "Terminé 'La Promesa del Amanecer', qué final tan hermoso 😭",
        time: "11:00",
      },
      {
        author: "elena_rq",
        text: "Lo tengo pendiente! Lo empiezo esta semana",
        time: "11:20",
      },
      {
        author: "rosa_tt",
        text: "El próximo es 'Cien años de soledad'. ¡Por fin lo leeré!",
        time: "12:10",
      },
    ],
  },
  {
    id: "CNV-006",
    type: "directa",
    name: "alex_k ↔ sofia_r",
    participants: ["alex_k", "sofia_r"],
    lastMessage: {
      author: "alex_k",
      text: "Oye, si no me contestas voy a publicar tus fotos.",
      time: "Hace 5h",
    },
    messages: 23,
    unread: 0,
    active: false,
    status: "suspendida",
    reportes: 5,
    created: "2025-02-15",
    lastActivity: "2025-02-25",
    pinned: false,
    preview: [
      {
        author: "alex_k",
        text: "Hola, vi tu perfil y me parece interesante.",
        time: "10:00",
      },
      { author: "sofia_r", text: "Hola, gracias.", time: "10:30" },
      {
        author: "alex_k",
        text: "Oye, si no me contestas voy a publicar tus fotos.",
        time: "11:00",
      },
    ],
  },
  {
    id: "CNV-007",
    type: "grupo",
    name: "Devs & Tech Talk 💻",
    participants: ["carlos_m", "martin_d", "lucia_v"],
    lastMessage: {
      author: "martin_d",
      text: "React 20 ya tiene fecha de release confirmada. Noviembre.",
      time: "Hace 6h",
    },
    messages: 876,
    unread: 0,
    active: true,
    status: "activo",
    reportes: 0,
    created: "2024-08-20",
    lastActivity: "2025-02-25",
    pinned: false,
    preview: [
      {
        author: "carlos_m",
        text: "¿Alguien migró ya a Next 15?",
        time: "09:00",
      },
      {
        author: "lucia_v",
        text: "Sí, el App Router es mucho más limpio ahora",
        time: "09:15",
      },
      {
        author: "martin_d",
        text: "React 20 ya tiene fecha confirmada. Noviembre.",
        time: "09:30",
      },
    ],
  },
  {
    id: "CNV-008",
    type: "directa",
    name: "pablo_n ↔ elena_rq",
    participants: ["pablo_n", "elena_rq"],
    lastMessage: {
      author: "pablo_n",
      text: "¿Quieres colaborar en una canción? Tengo una idea con beats orgánicos.",
      time: "Hace 1 día",
    },
    messages: 41,
    unread: 0,
    active: false,
    status: "activo",
    reportes: 0,
    created: "2025-01-12",
    lastActivity: "2025-02-25",
    pinned: false,
    preview: [
      {
        author: "elena_rq",
        text: "Vi tu EP, me encantó el track 3 🎵",
        time: "Ayer 18:00",
      },
      {
        author: "pablo_n",
        text: "¡Gracias! Ese fue el más difícil de producir",
        time: "Ayer 18:30",
      },
      {
        author: "pablo_n",
        text: "¿Quieres colaborar? Tengo una idea con beats orgánicos.",
        time: "Ayer 19:00",
      },
    ],
  },
];

// ─── Configs ──────────────────────────────────────────────────────────
const TYPE_CONFIG: any = {
  grupo: { label: "Grupo", emoji: "👥", color: "accent" },
  directa: { label: "Directa", emoji: "💬", color: "info" },
};

const STATUS_CONFIG: any = {
  activo: { label: "Activa", dot: "🟢", color: "success" },
  reportada: { label: "Reportada", dot: "🟡", color: "warning" },
  suspendida: { label: "Suspendida", dot: "🔴", color: "danger" },
  archivada: { label: "Archivada", dot: "⚫", color: "muted" },
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
  "#4ade80",
  "#f472b6",
];
const getAvatarColor = (name: string) =>
  AVATAR_PALETTE[(name || "").charCodeAt(0) % AVATAR_PALETTE.length];

// ─── Sub-componentes ──────────────────────────────────────────────────
function KpiCard({ emoji, label, value, colorKey, c }: any) {
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
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: c.textMuted,
            marginTop: "1px",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ username, size = 32 }: any) {
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

function AvatarStack({ participants, max = 4, size = 28 }: any) {
  const shown = participants.slice(0, max);
  const extra = participants.length - max;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((p: any, i: any) => (
        <div
          key={p}
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }}
        >
          <UserAvatar username={p} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "rgba(123,131,245,0.15)",
            border: "2px solid rgba(123,131,245,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.28,
            fontWeight: "800",
            color: "#7b83f5",
            marginLeft: -8,
            zIndex: 0,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, c }: any) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.archivada;
  const map: any = {
    success: { bg: c.successSoft, text: c.success },
    warning: { bg: c.warningSoft, text: c.warning },
    danger: { bg: c.dangerSoft, text: c.danger },
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

function TypeBadge({ type, c }: any) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.directa;
  const map: any = {
    accent: { bg: c.accentSoft, text: c.accent },
    info: { bg: c.infoSoft, text: c.info },
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
      {cfg.emoji} {cfg.label}
    </span>
  );
}

// ─── Panel de detalle de conversación ────────────────────────────────
function ConversationDetail({ conv, c, theme, onClose, onAction }: any) {
  if (!conv) return null;

  const ACTIONS = [
    {
      key: "suspendida",
      label: "🔴 Suspender",
      color: c.danger,
      bg: c.dangerSoft,
      show: conv.status === "activo" || conv.status === "reportada",
    },
    {
      key: "activo",
      label: "✅ Reactivar",
      color: c.success,
      bg: c.successSoft,
      show: conv.status !== "activo",
    },
    {
      key: "archivada",
      label: "📦 Archivar",
      color: c.textMuted,
      bg: c.accentSoft,
      show: conv.status !== "archivada",
    },
  ];

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
          maxWidth: "560px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1a1a30, #0f0f22)"
                : "linear-gradient(135deg, #ededff, #f5f0ff)",
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <TypeBadge type={conv.type} c={c} />
                <StatusBadge status={conv.status} c={c} />
                {conv.pinned && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "3px 9px",
                      borderRadius: "20px",
                      background: c.warningSoft,
                      color: c.warning,
                    }}
                  >
                    📌 Fijada
                  </span>
                )}
                {conv.reportes > 0 && (
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
                    ⚠️ {conv.reportes} reportes
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "800",
                  color: c.text,
                  marginBottom: "4px",
                }}
              >
                {conv.name}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: c.accent,
                  fontFamily: "monospace",
                }}
              >
                {conv.id}
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

          {/* Participantes */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "12px",
            }}
          >
            <AvatarStack participants={conv.participants} max={5} size={30} />
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: "700", color: c.text }}
              >
                {conv.participants.length} participantes
              </div>
              <div style={{ fontSize: "10px", color: c.textMuted }}>
                {conv.participants.map((p: any) => `@${p}`).join(", ")}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: c.border,
            flexShrink: 0,
          }}
        >
          {[
            {
              icon: "💬",
              label: "Mensajes",
              value: conv.messages.toLocaleString(),
            },
            { icon: "👥", label: "Miembros", value: conv.participants.length },
            { icon: "📅", label: "Creada", value: conv.created },
            { icon: "🕐", label: "Actividad", value: conv.lastActivity },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: c.card,
                padding: "14px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "11px", marginBottom: "3px" }}>
                {s.icon}
              </div>
              <div
                style={{ fontSize: "14px", fontWeight: "800", color: c.text }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "600",
                  color: c.textMuted,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Preview mensajes */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: c.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Últimos mensajes
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {conv.preview.map((msg: any, i: any) => {
              const bg = getAvatarColor(msg.author);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <UserAvatar username={msg.author} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "7px",
                        marginBottom: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: bg,
                        }}
                      >
                        @{msg.author}
                      </span>
                      <span style={{ fontSize: "9px", color: c.textMuted }}>
                        {msg.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: c.text,
                        lineHeight: 1.5,
                        background:
                          theme === "dark"
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.03)",
                        padding: "8px 12px",
                        borderRadius: "0 12px 12px 12px",
                        border: `1px solid ${c.border}`,
                        display: "inline-block",
                        maxWidth: "100%",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alerta reportes */}
          {conv.reportes > 0 && (
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: c.dangerSoft,
                border: `1.5px solid ${c.danger}33`,
              }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: c.danger,
                  }}
                >
                  {conv.reportes} reporte{conv.reportes > 1 ? "s" : ""} recibido
                  {conv.reportes > 1 ? "s" : ""}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: c.textMuted,
                    marginTop: "2px",
                  }}
                >
                  Esta conversación ha sido marcada por usuarios de la
                  comunidad. Revisa el contenido antes de tomar acción.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div
          style={{
            padding: "14px 20px 18px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {ACTIONS.filter((a) => a.show).map((a) => (
            <button
              key={a.key}
              onClick={() => {
                onAction(conv.id, a.key);
                onClose();
              }}
              style={{
                flex: 1,
                minWidth: "110px",
                padding: "9px 14px",
                borderRadius: "12px",
                border: `1.5px solid ${a.color}33`,
                background: a.bg,
                color: a.color,
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "opacity 0.15s",
              }}
            >
              {a.label}
            </button>
          ))}
          <button
            style={{
              flex: 1,
              minWidth: "110px",
              padding: "9px 14px",
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
            📋 Ver completa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────
const Conversations = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [convs, setConvs] = useState(CONVERSATIONS_DATA);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [sortBy, setSortBy] = useState("activity");

  const stats = useMemo(
    () => ({
      total: convs.length,
      activas: convs.filter((c) => c.status === "activo").length,
      grupos: convs.filter((c) => c.type === "grupo").length,
      directas: convs.filter((c) => c.type === "directa").length,
      reportadas: convs.filter((c) => c.reportes > 0).length,
      mensajes: convs.reduce((s, c) => s + c.messages, 0),
    }),
    [convs],
  );

  const filtered = useMemo(() => {
    return convs
      .filter((c) => filterStatus === "todos" || c.status === filterStatus)
      .filter((c) => filterType === "todos" || c.type === filterType)
      .filter(
        (c) =>
          search === "" ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.participants.some((p) =>
            p.toLowerCase().includes(search.toLowerCase()),
          ) ||
          c.lastMessage.text.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => {
        // if (sortBy === "activity")  return new Date(b.lastActivity) - new Date(a.lastActivity);
        if (sortBy === "messages") return b.messages - a.messages;
        if (sortBy === "reportes") return b.reportes - a.reportes;
        if (sortBy === "members")
          return b.participants.length - a.participants.length;
        return 0;
      });
  }, [convs, filterStatus, filterType, search, sortBy]);

  const handleAction = (id: any, action: any) => {
    setConvs((prev) =>
      prev.map((c) => (c.id !== id ? c : { ...c, status: action })),
    );
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
          outline: none; width: 240px;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: ${c.textMuted}; }
        .search-input:focus { border-color: ${c.accent}; }

        .select-filter {
          background: ${c.inputBackground};
          border: 1.5px solid ${c.inputBorder};
          border-radius: 9px;
          padding: 6px 10px;
          font-size: 11px; font-weight: 600; color: ${c.textMuted};
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }
        .select-filter:focus { border-color: ${c.accent}; }

        .conv-item {
          display: flex;
          align-items: stretch;
          gap: 0;
          border-bottom: 1px solid ${c.border};
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .conv-item:last-child { border-bottom: none; }
        .conv-item:hover { background: ${c.accentSoft}; }
        .conv-item.active-indicator { border-left: 3px solid ${c.accent}; }

        .unread-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${c.accent};
          box-shadow: 0 0 6px ${c.accent}88;
          flex-shrink: 0;
        }
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
            boxShadow: "0 4px 24px rgba(107,115,240,0.09)",
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
              💬 Conversaciones
            </div>
            <div
              style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}
            >
              <strong style={{ color: c.accent }}>
                {stats.activas} activas
              </strong>{" "}
              · <strong style={{ color: c.text }}>{stats.grupos} grupos</strong>{" "}
              ·{" "}
              <strong style={{ color: c.danger }}>
                {stats.reportadas} reportadas
              </strong>
            </div>
          </div>
          <button className="pill-cta">Exportar →</button>
        </div>

        {/* ── KPI Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <KpiCard
            emoji="💬"
            label="Total"
            value={stats.total}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="🟢"
            label="Activas"
            value={stats.activas}
            colorKey="success"
            c={c}
          />
          <KpiCard
            emoji="👥"
            label="Grupos"
            value={stats.grupos}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="📨"
            label="Directas"
            value={stats.directas}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="🗨️"
            label="Mensajes total"
            value={stats.mensajes.toLocaleString()}
            colorKey="warning"
            c={c}
          />
          <KpiCard
            emoji="⚠️"
            label="Reportadas"
            value={stats.reportadas}
            colorKey="danger"
            c={c}
          />
        </div>

        {/* ── Lista ── */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.border}`,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 20px rgba(107,115,240,0.06)",
          }}
        >
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
                placeholder="Buscar conversación, usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {["todos", "activo", "reportada", "suspendida"].map((s) => (
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

            <div style={{ display: "flex", gap: "5px" }}>
              {["todos", "grupo", "directa"].map((t) => (
                <TabChip
                  key={t}
                  label={
                    t === "todos"
                      ? "Todos"
                      : `${TYPE_CONFIG[t].emoji} ${TYPE_CONFIG[t].label}`
                  }
                  active={filterType === t}
                  onClick={() => setFilterType(t)}
                />
              ))}
            </div>

            <select
              className="select-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ marginLeft: "auto" }}
            >
              <option value="activity">🕐 Más recientes</option>
              <option value="messages">💬 Más activas</option>
              <option value="members">👥 Más miembros</option>
              <option value="reportes">⚠️ Más reportadas</option>
            </select>
          </div>

          {/* Columnas header */}
          <div
            className="conversations-table-header"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 100px 90px 110px 110px",
              gap: "12px",
              padding: "9px 22px",
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            {[
              "Conversación",
              "Participantes",
              "Mensajes",
              "Tipo",
              "Estado",
              "Actividad",
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

          {/* Items */}
          {filtered.length === 0 ? (
            <div style={{ padding: "52px", textAlign: "center" }}>
              <div
                style={{ fontSize: "36px", opacity: 0.2, marginBottom: "10px" }}
              >
                💬
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: c.textMuted,
                }}
              >
                Sin conversaciones
              </div>
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                className={`conv-item${conv.unread > 0 ? " active-indicator" : ""}`}
                onClick={() => setSelected(conv)}
                style={{
                  borderLeft:
                    conv.unread > 0
                      ? `3px solid ${c.accent}`
                      : "3px solid transparent",
                }}
              >
                <div
                  className="conversation-row-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 100px 90px 110px 110px",
                    gap: "12px",
                    padding: "14px 22px",
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  {/* Nombre + último mensaje */}
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        marginBottom: "4px",
                      }}
                    >
                      {conv.pinned && (
                        <span style={{ fontSize: "11px" }}>📌</span>
                      )}
                      {conv.unread > 0 && <div className="unread-dot" />}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: conv.unread > 0 ? "800" : "600",
                          color: c.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {conv.name}
                      </span>
                      {conv.reportes > 0 && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "800",
                            color: c.danger,
                            background: c.danger,
                            padding: "1px 6px",
                            borderRadius: "8px",
                            flexShrink: 0,
                          }}
                        >
                          ⚠️{conv.reportes}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: getAvatarColor(conv.lastMessage.author),
                        }}
                      >
                        @{conv.lastMessage.author}:
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: c.textMuted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {conv.lastMessage.text}
                      </span>
                    </div>
                  </div>

                  {/* Participantes */}
                  <div>
                    <AvatarStack
                      participants={conv.participants}
                      max={3}
                      size={24}
                    />
                    <div
                      style={{
                        fontSize: "9px",
                        color: c.textMuted,
                        marginTop: "3px",
                      }}
                    >
                      {conv.participants.length} miembros
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: c.text,
                      }}
                    >
                      {conv.messages.toLocaleString()}
                    </div>
                    {conv.unread > 0 && (
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "700",
                          color: c.accent,
                          background: c.accentSoft,
                          padding: "1px 6px",
                          borderRadius: "8px",
                          display: "inline-block",
                          marginTop: "2px",
                        }}
                      >
                        {conv.unread} nuevos
                      </div>
                    )}
                  </div>

                  {/* Tipo */}
                  <TypeBadge type={conv.type} c={c} />

                  {/* Estado */}
                  <StatusBadge status={conv.status} c={c} />

                  {/* Actividad */}
                  <div>
                    <div style={{ fontSize: "11px", color: c.textMuted }}>
                      {conv.lastMessage.time}
                    </div>
                    <div style={{ fontSize: "9px", color: c.border }}>
                      {conv.lastActivity}
                    </div>
                  </div>
                </div>
              </div>
            ))
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
              Mostrando{" "}
              <strong style={{ color: c.text }}>{filtered.length}</strong> de{" "}
              <strong style={{ color: c.text }}>{convs.length}</strong>{" "}
              conversaciones
            </span>
            <span style={{ fontSize: "11px", color: c.textMuted }}>
              Haz clic para ver el detalle
            </span>
          </div>
        </div>
      </main>

      <ConversationDetail
        conv={selected}
        c={c}
        theme={theme}
        onClose={() => setSelected(null)}
        onAction={handleAction}
      />
    </>
  );
};

export default Conversations;
