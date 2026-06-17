// pages/CaseDetailsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import useLanguage from "../hooks/useLanguage";

// ─── Tipos ─────────────────────────────────────────────────────────────
interface CaseComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: "internal" | "public";
}

interface CaseAttachment {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  url: string;
  size: string;
}

interface CaseTimelineEvent {
  id: string;
  action: string;
  moderator: string;
  timestamp: string;
  details: string;
  icon: string;
}

interface CaseData {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  author: string;
  target: string | null;
  reportes: number;
  status: string;
  assignedTo: string | null;
  tags: string[];
  evidence: string;
  date: string;
  lastUpdated: string;
  affectedUsers?: string[];
  attachments?: CaseAttachment[];
  comments?: CaseComment[];
  timeline?: CaseTimelineEvent[];
  relatedCases?: string[];
  automodScore?: number;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
}

// ─── Datos mock ─────────────────────────────────────────────────────────
const MOCK_CASE: CaseData = {
  id: "MOD-001",
  type: "publicacion",
  priority: "critica",
  title: "Contenido de acoso coordinado",
  description: "Múltiples usuarios reportaron esta publicación por contener llamadas directas a hostigar a un usuario específico de la comunidad. El contenido incluye instrucciones explícitas para acosar, compartir información personal y coordinar ataques masivos contra la víctima.",
  author: "troll_2024",
  target: "sofia_r",
  reportes: 12,
  status: "pendiente",
  assignedTo: null,
  tags: ["acoso", "coordinado", "hostigamiento", "violencia psicológica"],
  evidence: "El post contiene el usuario objetivo, instrucciones explícitas y fue compartido en 3 grupos. Se adjuntan capturas de pantalla y logs del servidor.",
  date: "2025-02-26 09:14",
  lastUpdated: "2025-02-26 09:14",
  affectedUsers: ["sofia_r", "maria_g", "juan_p"],
  automodScore: 94,
  ipAddress: "189.123.45.67",
  location: "Buenos Aires, Argentina",
  deviceInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
  attachments: [
    { id: "att-001", name: "captura_post.png", type: "image", url: "/mock/post.png", size: "2.3 MB" },
    { id: "att-002", name: "logs_chat.txt", type: "document", url: "/mock/logs.txt", size: "45 KB" },
  ],
  comments: [
    {
      id: "com-001",
      author: "lucia_v",
      content: "He verificado los enlaces, efectivamente hay coordinación en 3 grupos diferentes. El usuario ya tiene antecedentes por comportamiento similar.",
      timestamp: "2025-02-26 10:30",
      type: "internal",
    },
  ],
  timeline: [
    {
      id: "tim-001",
      action: "reporte_inicial",
      moderator: "system",
      timestamp: "2025-02-26 09:14",
      details: "Caso creado automáticamente por sistema de detección",
      icon: "🤖",
    },
    {
      id: "tim-002",
      action: "reporte_usuario",
      moderator: "sofia_r",
      timestamp: "2025-02-26 09:20",
      details: "Usuario afectado reporta contenido como acoso",
      icon: "👤",
    },
  ],
  relatedCases: ["MOD-002", "MOD-005"],
};

// ─── Configuraciones ───────────────────────────────────────────────────
const PRIORITY_CONFIG: any = {
  critica: { label: "Crítica", color: "#dc2626", bg: "#fee2e2", dot: "🔴" },
  alta: { label: "Alta", color: "#ea580c", bg: "#fed7aa", dot: "🟠" },
  media: { label: "Media", color: "#2563eb", bg: "#dbeafe", dot: "🔵" },
  baja: { label: "Baja", color: "#059669", bg: "#d1fae5", dot: "🟢" },
};

const STATUS_CONFIG: any = {
  pendiente: { label: "Pendiente", color: "#ea580c", bg: "#fed7aa", dot: "⏳" },
  en_revision: { label: "En revisión", color: "#2563eb", bg: "#dbeafe", dot: "🔍" },
  resuelto: { label: "Resuelto", color: "#059669", bg: "#d1fae5", dot: "✅" },
  descartado: { label: "Descartado", color: "#6b7280", bg: "#e5e7eb", dot: "❌" },
};

const TYPE_CONFIG: any = {
  publicacion: { label: "Publicación", emoji: "📝", icon: "📝" },
  mensaje: { label: "Mensaje", emoji: "💬", icon: "💬" },
  perfil: { label: "Perfil", emoji: "👤", icon: "👤" },
  conversacion: { label: "Conversación", emoji: "💬", icon: "💬" },
};

const CASE_TABS = [
  { id: "details", label: "Detalles del caso", emoji: "📋" },
  { id: "timeline", label: "Línea de tiempo", emoji: "⏱️" },
  { id: "evidence", label: "Evidencias", emoji: "🔍" },
  { id: "actions", label: "Tomar acción", emoji: "⚡" },
] as const;

type CaseTabId = typeof CASE_TABS[number]["id"];

const AVATAR_PALETTE = [
  "#7b83f5", "#f87171", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#fb923c", "#e879f9",
];
const getAvatarColor = (n = "") => AVATAR_PALETTE[n.charCodeAt(0) % AVATAR_PALETTE.length];

const fmtNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ─── Componentes UI ────────────────────────────────────────────────────
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

// ─── Componente principal ──────────────────────────────────────────────
const CaseDetails = () => {
  const { id } = useParams();
  const { getLabel } = useLanguage();
  const { theme } = useThemeContext();
  const navigate = useNavigate();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [activeTab, setActiveTab] = useState<CaseTabId>("details");
  const [actionNote, setActionNote] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCaseData(MOCK_CASE);
      setLoading(false);
    }, 500);
  }, [id]);

  const priorityCfg = caseData ? PRIORITY_CONFIG[caseData.priority] : null;
  const statusCfg = caseData ? STATUS_CONFIG[caseData.status] : null;
  const typeCfg = caseData ? TYPE_CONFIG[caseData.type] : null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return c.danger;
    if (score >= 70) return c.warning;
    if (score >= 50) return c.success;
    return c.success;
  };

  const ACTIONS = [
    { id: "ban", label: "Banear usuario", icon: "🚫", color: c.danger, confirm: true },
    { id: "suspend", label: "Suspender (7 días)", icon: "⏸️", color: c.warning, confirm: true },
    { id: "warn", label: "Enviar advertencia", icon: "⚠️", color: c.warning, confirm: false },
    { id: "delete", label: "Eliminar contenido", icon: "🗑️", color: c.danger, confirm: true },
    { id: "resolve", label: "Resolver caso", icon: "✅", color: c.success, confirm: false },
    { id: "reject", label: "Descartar reporte", icon: "❌", color: c.textMuted, confirm: true },
  ];

  const executeAction = () => {
    console.log(`Ejecutando ${selectedAction} en caso ${caseData?.id}`, { note: actionNote });
    setSelectedAction(null);
    setActionNote("");
    setConfirmAction(false);
    navigate("/moderation");
  };

  if (loading) {
    return (
      <main style={{ flex: 1, overflow: "auto", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚖️</div>
          <div style={{ fontSize: "14px", color: c.textMuted }}>Cargando detalles del caso...</div>
        </div>
      </main>
    );
  }

  if (!caseData) {
    return (
      <main style={{ flex: 1, overflow: "auto", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: c.textMuted, marginBottom: "12px" }}>
            Caso no encontrado
          </div>
          <button
            onClick={() => navigate("/moderation")}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: c.accent,
              color: "#fff",
              border: "none",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Volver a moderación
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 4px; }

        .case-tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 22px;
          border: 1.5px solid ${c.border}; background: transparent;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: ${c.textMuted}; transition: all 0.15s; white-space: nowrap;
        }
        .case-tab-btn:hover { border-color: ${c.accent}44; color: ${c.accent}; background: ${c.accentSoft}; }
        .case-tab-btn.active { background: ${c.accentMedium}; border-color: ${c.accent}44; color: ${c.accent}; box-shadow: 0 3px 12px rgba(107,115,240,0.2); }

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

        .status-chip {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px 14px; border-radius: 14px;
          border: 1.5px solid; cursor: pointer; flex: 1;
          font-size: 12px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.17s; position: relative; white-space: nowrap;
        }
        .status-chip:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }

        .info-col {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 22px 16px; cursor: default; transition: background 0.15s;
        }
        .info-col:hover { background: rgba(107,115,240,0.04); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.28s ease; }
      `}</style>

      <main style={{ flex: 1, overflow: "auto", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* ══════════════════════════════════════════
            HEADER CON NAVEGACIÓN
        ══════════════════════════════════════════ */}
        <div style={{ position: "relative", height: 60, flexShrink: 0 }}>
          <button
            onClick={() => navigate("/moderation")}
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
              zIndex: 10,
            }}
          >
            ← Volver
          </button>

          <div style={{ position: "absolute", top: 16, right: 22, display: "flex", gap: 8, zIndex: 10 }}>
            <button className="action-btn" style={{ background: c.card, backdropFilter: "blur(8px)" }}>
              📤 Exportar
            </button>
            <button className="action-btn danger" style={{ background: c.card, backdropFilter: "blur(8px)" }}>
              🗑️ Eliminar caso
            </button>
          </div>
        </div>

        <div style={{ padding: "0 28px 40px" }}>
          {/* ══════════════════════════════════════════
              BLOQUE 1 — Estado y prioridad (horizontal)
          ══════════════════════════════════════════ */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]: any) => (
              <button
                key={key}
                className="status-chip"
                style={{
                  borderColor: caseData.priority === key ? cfg.color + "77" : c.border,
                  background: caseData.priority === key ? cfg.bg : c.card,
                  color: caseData.priority === key ? cfg.color : c.textMuted,
                  flex: "0 1 auto",
                  minWidth: 100,
                }}
              >
                <span style={{ fontSize: 16 }}>{cfg.dot}</span>
                <span>{cfg.label}</span>
                {caseData.priority === key && (
                  <span style={{ position: "absolute", top: -6, right: -4, fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 8, background: cfg.color, color: "#fff" }}>
                    ACTUAL
                  </span>
                )}
              </button>
            ))}
            {Object.entries(STATUS_CONFIG).map(([key, cfg]: any) => (
              <button
                key={key}
                className="status-chip"
                style={{
                  borderColor: caseData.status === key ? cfg.color + "77" : c.border,
                  background: caseData.status === key ? cfg.bg : c.card,
                  color: caseData.status === key ? cfg.color : c.textMuted,
                  flex: "0 1 auto",
                  minWidth: 100,
                }}
              >
                <span style={{ fontSize: 16 }}>{cfg.dot}</span>
                <span>{cfg.label}</span>
                {caseData.status === key && (
                  <span style={{ position: "absolute", top: -6, right: -4, fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 8, background: cfg.color, color: "#fff" }}>
                    ACTUAL
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 2 — Info principal + métricas (side by side)
          ══════════════════════════════════════════ */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "stretch" }}>
            {/* ── Tarjeta izquierda: Tipo y título ── */}
            <div
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
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "30px",
                  background: priorityCfg?.bg || c.accentSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                  fontWeight: 900,
                  color: priorityCfg?.color || c.accent,
                  boxShadow: `0 0 0 6px ${priorityCfg?.color || c.accent}12, 0 12px 40px rgba(0,0,0,0.18)`,
                }}
              >
                {typeCfg?.emoji}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 2 }}>
                  {typeCfg?.label}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>
                  {caseData.id}
                </div>
              </div>
            </div>

            {/* ── Tarjeta derecha: Métricas + descripción ── */}
            <div
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
                <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: c.textMuted, letterSpacing: "0.06em" }}>
                  INFORMACIÓN DEL CASO
                </span>
                {caseData.automodScore && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: `${getScoreColor(caseData.automodScore)}22`,
                      color: getScoreColor(caseData.automodScore),
                    }}
                  >
                    🤖 Score IA: {caseData.automodScore}%
                  </span>
                )}
              </div>

              {/* Tres columnas de métricas */}
              <div style={{ display: "flex" }}>
                {[
                  { label: "Reportes", value: caseData.reportes, color: c.danger },
                  { label: "Tags", value: caseData.tags.length, color: c.accent },
                  { label: "Adjuntos", value: caseData.attachments?.length || 0, color: c.warning },
                ].map((metric, i) => (
                  <div
                    key={metric.label}
                    className="info-col"
                    style={{
                      borderRight: i < 2 ? `1px solid ${c.border}` : "none",
                      padding: "14px 10px",
                      gap: 3,
                    }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 900, color: metric.color, letterSpacing: "-0.04em", lineHeight: 1 }}>
                      {fmtNumber(metric.value)}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted }}>{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Título y descripción */}
              <div style={{ borderTop: `1px solid ${c.border}`, padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Título del caso
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{caseData.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    Descripción
                  </div>
                  <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.6 }}>{caseData.description}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 3 — Usuarios involucrados + Info técnica
          ══════════════════════════════════════════ */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            {/* Usuarios involucrados */}
            <div
              style={{
                flex: 1,
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 18px", borderBottom: `1px solid ${c.border}`, background: c.accentSoft + "33" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>👥 Usuarios involucrados</span>
              </div>
              <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 10 }}>👤 Autor denunciado</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <UserAvatar username={caseData.author} size={44} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>@{caseData.author}</div>
                      <div style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>IP: {caseData.ipAddress}</div>
                    </div>
                  </div>
                </div>
                {caseData.target && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 10 }}>🎯 Usuario afectado</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <UserAvatar username={caseData.target} size={44} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>@{caseData.target}</div>
                        <div style={{ fontSize: 11, color: c.textMuted }}>Víctima reportada</div>
                      </div>
                    </div>
                  </div>
                )}
                {caseData.affectedUsers && caseData.affectedUsers.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 10 }}>👥 Otros afectados</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {caseData.affectedUsers.map(user => (
                        <div key={user} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <UserAvatar username={user} size={28} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>@{user}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info técnica */}
            <div
              style={{
                flex: 1,
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 18px", borderBottom: `1px solid ${c.border}`, background: c.accentSoft + "33" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>🔧 Información técnica</span>
              </div>
              <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>📍 Ubicación</div>
                  <div style={{ fontSize: 13, color: c.text }}>{caseData.location || "No disponible"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>💻 Dispositivo</div>
                  <div style={{ fontSize: 11, color: c.textMuted, wordBreak: "break-all" }}>{caseData.deviceInfo || "No disponible"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>📅 Fecha del reporte</div>
                  <div style={{ fontSize: 13, color: c.text }}>{caseData.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, marginBottom: 4 }}>🔄 Última actualización</div>
                  <div style={{ fontSize: 13, color: c.text }}>{caseData.lastUpdated}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 4 — Tags + Comentarios
          ══════════════════════════════════════════ */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div
              style={{
                flex: 1,
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 18px", borderBottom: `1px solid ${c.border}`, background: c.accentSoft + "33" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>🏷️ Etiquetas</span>
              </div>
              <div style={{ padding: "18px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                {caseData.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      background: c.accentSoft,
                      color: c.accent,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {caseData.comments && caseData.comments.length > 0 && (
              <div
                style={{
                  flex: 1,
                  background: c.card,
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "12px 18px", borderBottom: `1px solid ${c.border}`, background: c.accentSoft + "33" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>💬 Comentarios internos</span>
                </div>
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 16, maxHeight: 200, overflow: "auto" }}>
                  {caseData.comments.map(comment => (
                    <div key={comment.id} style={{ borderLeft: `3px solid ${c.accent}`, paddingLeft: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <UserAvatar username={comment.author} size={24} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>@{comment.author}</span>
                        <span style={{ fontSize: 10, color: c.textMuted }}>{comment.timestamp}</span>
                      </div>
                      <p style={{ fontSize: 12, color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════
              BLOQUE 5 — Tabs + Contenido dinámico
          ══════════════════════════════════════════ */}
          <div id="case-content-section">
            {/* Toolbar de tabs */}
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {CASE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`case-tab-btn${activeTab === tab.id ? " active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
                {caseData.assignedTo && (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: c.textMuted }}>Asignado a:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <UserAvatar username={caseData.assignedTo} size={24} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.accent }}>@{caseData.assignedTo}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido dinámico por tab */}
            <div className="fade-up" key={activeTab}>
              {/* Tab: Detalles */}
              {activeTab === "details" && (
                <div
                  style={{
                    background: c.card,
                    border: `1.5px solid ${c.border}`,
                    borderRadius: 20,
                    padding: "24px",
                  }}
                >
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.accent, marginBottom: 12 }}>📝 Evidencia principal</div>
                    <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.6 }}>{caseData.evidence}</div>
                  </div>
                  {caseData.relatedCases && caseData.relatedCases.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.accent, marginBottom: 12 }}>🔗 Casos relacionados</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {caseData.relatedCases.map(relatedId => (
                          <button
                            key={relatedId}
                            onClick={() => navigate(`/case/${relatedId}`)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 10,
                              background: c.accentSoft,
                              color: c.accent,
                              fontSize: 12,
                              fontWeight: 600,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            #{relatedId}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Línea de tiempo */}
              {activeTab === "timeline" && (
                <div
                  style={{
                    background: c.card,
                    border: `1.5px solid ${c.border}`,
                    borderRadius: 20,
                    padding: "24px",
                  }}
                >
                  <div style={{ position: "relative", paddingLeft: 40 }}>
                    <div style={{ position: "absolute", left: 16, top: 8, bottom: 8, width: 2, background: c.border }} />
                    {caseData.timeline?.map((event) => (
                      <div key={event.id} style={{ position: "relative", marginBottom: 28 }}>
                        <div
                          style={{
                            position: "absolute",
                            left: -40,
                            top: 0,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: c.accent,
                            border: `3px solid ${c.card}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          {event.icon}
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: c.text, textTransform: "capitalize" }}>
                            {event.action.replace("_", " ")}
                          </span>
                          <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 12 }}>{event.timestamp}</span>
                        </div>
                        <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>
                          por <strong style={{ color: c.accent }}>@{event.moderator}</strong>
                        </div>
                        <div style={{ fontSize: 12, color: c.text, lineHeight: 1.5 }}>{event.details}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Evidencias */}
              {activeTab === "evidence" && (
                <div
                  style={{
                    background: c.card,
                    border: `1.5px solid ${c.border}`,
                    borderRadius: 20,
                    padding: "24px",
                  }}
                >
                  {caseData.attachments && caseData.attachments.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {caseData.attachments.map(att => (
                        <div
                          key={att.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: 16,
                            background: c.accentSoft + "22",
                            borderRadius: 12,
                            border: `1px solid ${c.border}`,
                          }}
                        >
                          <span style={{ fontSize: 28 }}>{att.type === "image" ? "🖼️" : att.type === "video" ? "🎥" : "📄"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{att.name}</div>
                            <div style={{ fontSize: 11, color: c.textMuted }}>{att.size}</div>
                          </div>
                          <button
                            style={{
                              padding: "8px 16px",
                              borderRadius: 10,
                              background: c.accent,
                              color: "#fff",
                              border: "none",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Descargar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: 40, color: c.textMuted }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📎</div>
                      No hay archivos adjuntos
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Acciones */}
              {activeTab === "actions" && (
                <div
                  style={{
                    background: c.card,
                    border: `1.5px solid ${c.border}`,
                    borderRadius: 20,
                    padding: "24px",
                  }}
                >
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 16 }}>Selecciona una acción:</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                      {ACTIONS.map(action => (
                        <button
                          key={action.id}
                          onClick={() => setSelectedAction(action.id)}
                          style={{
                            padding: "14px",
                            borderRadius: 12,
                            border: `2px solid ${selectedAction === action.id ? action.color : c.border}`,
                            background: selectedAction === action.id ? `${action.color}11` : "transparent",
                            color: selectedAction === action.id ? action.color : c.text,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 10 }}>Nota interna (opcional)</div>
                    <textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="Agrega una nota explicativa sobre la acción tomada..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 12,
                        border: `1.5px solid ${c.border}`,
                        background: c.inputBackground,
                        color: c.text,
                        fontSize: 12,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        resize: "vertical",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setSelectedAction(null); setActionNote(""); }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 12,
                        border: `1.5px solid ${c.border}`,
                        background: "transparent",
                        color: c.textMuted,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={() => selectedAction && setConfirmAction(true)}
                      disabled={!selectedAction}
                      style={{
                        padding: "10px 24px",
                        borderRadius: 12,
                        background: selectedAction ? c.accent : c.border,
                        color: selectedAction ? "#fff" : c.textMuted,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: selectedAction ? "pointer" : "not-allowed",
                      }}
                    >
                      Confirmar acción
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de confirmación */}
      {confirmAction && selectedAction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setConfirmAction(false)}
        >
          <div
            style={{
              background: c.card,
              borderRadius: 20,
              padding: 28,
              maxWidth: 400,
              width: "90%",
              border: `1.5px solid ${c.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>⚠️</div>
            <h3 style={{ textAlign: "center", margin: "0 0 12px", color: c.text }}>Confirmar acción</h3>
            <p style={{ textAlign: "center", color: c.textMuted, fontSize: 13, marginBottom: 24 }}>
              ¿Estás seguro de que deseas ejecutar esta acción?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setConfirmAction(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: `1.5px solid ${c.border}`,
                  background: "transparent",
                  color: c.textMuted,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  background: c.danger,
                  color: "#fff",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CaseDetails;