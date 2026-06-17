import { useEffect, useMemo, useRef, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";

// ─── Datos mock ───────────────────────────────────────────────────────
const generateLogs = () => {
  const entries = [
    // Sistema
    {
      id: "LOG-001",
      level: "info",
      category: "sistema",
      source: "api-gateway",
      message: "Servidor iniciado correctamente en puerto 3000",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:00:01",
      duration: null,
      code: 200,
    },
    {
      id: "LOG-002",
      level: "info",
      category: "sistema",
      source: "database",
      message: "Conexión a PostgreSQL establecida (pool: 20 conexiones)",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:00:03",
      duration: null,
      code: null,
    },
    {
      id: "LOG-003",
      level: "warning",
      category: "sistema",
      source: "memory-monitor",
      message:
        "Uso de memoria al 78% — por encima del umbral recomendado (70%)",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:04:22",
      duration: null,
      code: null,
    },
    {
      id: "LOG-004",
      level: "info",
      category: "sistema",
      source: "cache",
      message: "Redis cache inicializado — 0 claves precargadas",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:00:05",
      duration: null,
      code: null,
    },
    {
      id: "LOG-005",
      level: "error",
      category: "sistema",
      source: "cron-scheduler",
      message: "Job 'purge_deleted_posts' falló: timeout después de 30s",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:05:00",
      duration: "30s",
      code: 500,
    },

    // Autenticación
    {
      id: "LOG-006",
      level: "info",
      category: "auth",
      source: "auth-service",
      message: "Login exitoso",
      user: "lucia_v",
      ip: "187.33.12.45",
      date: "2025-02-26",
      time: "09:14:08",
      duration: "42ms",
      code: 200,
    },
    {
      id: "LOG-007",
      level: "warning",
      category: "auth",
      source: "auth-service",
      message: "Intento de login fallido (contraseña incorrecta)",
      user: "unknown",
      ip: "45.33.88.12",
      date: "2025-02-26",
      time: "09:14:55",
      duration: "18ms",
      code: 401,
    },
    {
      id: "LOG-008",
      level: "error",
      category: "auth",
      source: "auth-service",
      message: "Brute force detectado: 12 intentos fallidos en 2 minutos",
      user: "unknown",
      ip: "103.55.200.4",
      date: "2025-02-26",
      time: "09:16:01",
      duration: null,
      code: 429,
    },
    {
      id: "LOG-009",
      level: "info",
      category: "auth",
      source: "auth-service",
      message: "Login exitoso desde nuevo dispositivo — notificación enviada",
      user: "carlos_m",
      ip: "201.123.45.67",
      date: "2025-02-26",
      time: "09:20:14",
      duration: "55ms",
      code: 200,
    },
    {
      id: "LOG-010",
      level: "info",
      category: "auth",
      source: "auth-service",
      message: "Sesión cerrada correctamente",
      user: "sofia_r",
      ip: "189.45.67.89",
      date: "2025-02-26",
      time: "09:22:30",
      duration: "10ms",
      code: 200,
    },

    // API
    {
      id: "LOG-011",
      level: "info",
      category: "api",
      source: "api-gateway",
      message: "GET /api/v1/users — 1,247 registros devueltos",
      user: "lucia_v",
      ip: "187.33.12.45",
      date: "2025-02-26",
      time: "09:14:12",
      duration: "84ms",
      code: 200,
    },
    {
      id: "LOG-012",
      level: "info",
      category: "api",
      source: "api-gateway",
      message: "POST /api/v1/publications — publicación creada",
      user: "sofia_r",
      ip: "189.45.67.89",
      date: "2025-02-26",
      time: "09:15:44",
      duration: "120ms",
      code: 201,
    },
    {
      id: "LOG-013",
      level: "warning",
      category: "api",
      source: "api-gateway",
      message: "GET /api/v1/analytics — respuesta lenta (1,240ms > 1,000ms)",
      user: "lucia_v",
      ip: "187.33.12.45",
      date: "2025-02-26",
      time: "09:16:30",
      duration: "1240ms",
      code: 200,
    },
    {
      id: "LOG-014",
      level: "error",
      category: "api",
      source: "api-gateway",
      message: "POST /api/v1/upload — archivo supera límite de 10MB",
      user: "jorge_s",
      ip: "80.44.23.11",
      date: "2025-02-26",
      time: "09:18:05",
      duration: "22ms",
      code: 413,
    },
    {
      id: "LOG-015",
      level: "info",
      category: "api",
      source: "api-gateway",
      message: "DELETE /api/v1/publications/PUB-089 — contenido eliminado",
      user: "carlos_m",
      ip: "201.123.45.67",
      date: "2025-02-26",
      time: "09:20:55",
      duration: "67ms",
      code: 200,
    },
    {
      id: "LOG-016",
      level: "error",
      category: "api",
      source: "api-gateway",
      message: "GET /api/v1/admin/config — acceso no autorizado rechazado",
      user: "unknown",
      ip: "91.200.10.55",
      date: "2025-02-26",
      time: "09:24:11",
      duration: "5ms",
      code: 403,
    },

    // Base de datos
    {
      id: "LOG-017",
      level: "info",
      category: "database",
      source: "postgresql",
      message: "Query completada: SELECT users (847ms, 1,247 filas)",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:14:11",
      duration: "847ms",
      code: null,
    },
    {
      id: "LOG-018",
      level: "warning",
      category: "database",
      source: "postgresql",
      message: "Query lenta detectada (>500ms): JOIN en tabla messages",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:17:40",
      duration: "1,120ms",
      code: null,
    },
    {
      id: "LOG-019",
      level: "error",
      category: "database",
      source: "postgresql",
      message: "Deadlock detectado en transacción — reintentando (intento 2/3)",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:19:22",
      duration: null,
      code: null,
    },
    {
      id: "LOG-020",
      level: "info",
      category: "database",
      source: "redis",
      message: "Cache HIT: user:lucia_v:profile (ttl: 280s restantes)",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:14:14",
      duration: "1ms",
      code: null,
    },
    {
      id: "LOG-021",
      level: "warning",
      category: "database",
      source: "redis",
      message: "Cache MISS: analytics:weekly — recalculando...",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:16:32",
      duration: "890ms",
      code: null,
    },

    // Moderación
    {
      id: "LOG-022",
      level: "info",
      category: "moderacion",
      source: "mod-engine",
      message: "Publicación PUB-089 eliminada por moderador @carlos_m",
      user: "carlos_m",
      ip: "201.123.45.67",
      date: "2025-02-26",
      time: "09:20:56",
      duration: null,
      code: null,
    },
    {
      id: "LOG-023",
      level: "warning",
      category: "moderacion",
      source: "mod-engine",
      message: "Contenido flaggeado automáticamente (7 reportes): PUB-102",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:22:10",
      duration: null,
      code: null,
    },
    {
      id: "LOG-024",
      level: "error",
      category: "moderacion",
      source: "ai-filter",
      message: "Falso positivo en detección de spam — revertido manualmente",
      user: "lucia_v",
      ip: "187.33.12.45",
      date: "2025-02-26",
      time: "09:23:40",
      duration: null,
      code: null,
    },
    {
      id: "LOG-025",
      level: "info",
      category: "moderacion",
      source: "mod-engine",
      message: "Usuario @troll_2024 baneado definitivamente",
      user: "lucia_v",
      ip: "187.33.12.45",
      date: "2025-02-26",
      time: "09:25:00",
      duration: null,
      code: null,
    },

    // Notificaciones
    {
      id: "LOG-026",
      level: "info",
      category: "notificaciones",
      source: "notif-service",
      message: "Email enviado a lucia@aycoro.app — Reporte crítico MOD-001",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:14:20",
      duration: "310ms",
      code: 250,
    },
    {
      id: "LOG-027",
      level: "error",
      category: "notificaciones",
      source: "notif-service",
      message: "Fallo al enviar push notification — token expirado",
      user: "rosa_tt",
      ip: null,
      date: "2025-02-26",
      time: "09:18:45",
      duration: null,
      code: null,
    },
    {
      id: "LOG-028",
      level: "info",
      category: "notificaciones",
      source: "notif-service",
      message: "34 emails del digest semanal enviados correctamente",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "08:00:00",
      duration: "4.2s",
      code: null,
    },

    // Storage
    {
      id: "LOG-029",
      level: "info",
      category: "storage",
      source: "cloudinary",
      message: "Imagen subida: avatar_sofia_r_v2.jpg (840KB, optimizada 64%)",
      user: "sofia_r",
      ip: "189.45.67.89",
      date: "2025-02-26",
      time: "09:15:50",
      duration: "1.8s",
      code: 200,
    },
    {
      id: "LOG-030",
      level: "warning",
      category: "storage",
      source: "s3-bucket",
      message: "Espacio de almacenamiento al 82% — 18GB libres de 100GB",
      user: null,
      ip: null,
      date: "2025-02-26",
      time: "09:01:00",
      duration: null,
      code: null,
    },
  ];
  return entries;
};

const ALL_LOGS = generateLogs();

// ─── Configs ──────────────────────────────────────────────────────────
const LEVEL_CFG: any = {
  info: { label: "INFO", color: "info", dot: "🔵", bg: null },
  warning: { label: "WARN", color: "warning", dot: "🟡", bg: null },
  error: { label: "ERROR", color: "danger", dot: "🔴", bg: null },
  debug: { label: "DEBUG", color: "muted", dot: "⚫", bg: null },
};

const CAT_CFG: any = {
  sistema: { label: "Sistema", emoji: "⚙️", color: "accent" },
  auth: { label: "Auth", emoji: "🔐", color: "warning" },
  api: { label: "API", emoji: "🌐", color: "info" },
  database: { label: "DB", emoji: "🗄️", color: "accent" },
  moderacion: { label: "Moderación", emoji: "🛡️", color: "danger" },
  notificaciones: { label: "Notif.", emoji: "🔔", color: "success" },
  storage: { label: "Storage", emoji: "💾", color: "warning" },
};

const CODE_CFG: any = {
  200: { color: "success" },
  201: { color: "success" },
  250: { color: "success" },
  401: { color: "warning" },
  403: { color: "danger" },
  404: { color: "warning" },
  413: { color: "danger" },
  429: { color: "danger" },
  500: { color: "danger" },
};

const AVATAR_PAL = [
  "#7b83f5",
  "#f87171",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#a78bfa",
  "#fb923c",
  "#e879f9",
];
const getAC = (n = "") => AVATAR_PAL[n.charCodeAt(0) % AVATAR_PAL.length];

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
          style={{ fontSize: "11px", fontWeight: "600", color: c.textMuted }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function Avatar({ username, size = 24 }: any) {
  const bg = getAC(username);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${bg}22`,
        border: `1.5px solid ${bg}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: "800",
        color: bg,
        flexShrink: 0,
      }}
    >
      {(username || "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Log row ─────────────────────────────────────────────────────────
function LogRow({ log, c, theme, onClick, selected }: any) {
  const level: any = LEVEL_CFG[log.level] || LEVEL_CFG.info;
  const cat = CAT_CFG[log.category] || CAT_CFG.sistema;
  const colorMap: any = {
    success: c.success,
    warning: c.warning,
    danger: c.danger,
    info: c.info,
    accent: c.accent,
    muted: c.textMuted,
  };
  const levelColor = colorMap[level.color] || c.accent;

  const rowBg = selected
    ? theme === "dark"
      ? "rgba(123,131,245,0.10)"
      : "rgba(107,115,240,0.06)"
    : log.level === "error"
      ? theme === "dark"
        ? "rgba(248,113,113,0.04)"
        : "rgba(248,113,113,0.02)"
      : "transparent";

  return (
    <div
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "6px 56px 80px 110px 1fr 90px 60px",
        gap: "10px",
        padding: "9px 16px",
        borderBottom: `1px solid ${c.border}`,
        alignItems: "center",
        cursor: "pointer",
        background: rowBg,
        borderLeft: selected
          ? `3px solid ${c.accent}`
          : log.level === "error"
            ? `3px solid ${c.danger}`
            : log.level === "warning"
              ? `3px solid ${c.warning}`
              : "3px solid transparent",
        transition: "background 0.12s",
        fontFamily: "'DM Mono', monospace",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          e.currentTarget.style.background =
            theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = rowBg;
      }}
    >
      {/* Dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: levelColor,
          boxShadow: log.level === "error" ? `0 0 5px ${levelColor}88` : "none",
        }}
      />

      {/* Hora */}
      <div
        style={{
          fontSize: "10px",
          color: c.textMuted,
          letterSpacing: "-0.01em",
        }}
      >
        {log.time}
      </div>

      {/* Level badge */}
      <span
        style={{
          fontSize: "9px",
          fontWeight: "700",
          padding: "2px 7px",
          borderRadius: "6px",
          background: levelColor + "22",
          color: levelColor,
          letterSpacing: "0.08em",
          textAlign: "center",
          border: `1px solid ${levelColor}33`,
        }}
      >
        {level.label}
      </span>

      {/* Categoría */}
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ fontSize: "11px" }}>{cat.emoji}</span>
        <span
          style={{
            fontSize: "10px",
            color: c.textMuted,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {log.source}
        </span>
      </div>

      {/* Mensaje */}
      <div
        style={{
          fontSize: "11px",
          color:
            log.level === "error"
              ? c.danger
              : log.level === "warning"
                ? c.warning
                : c.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {log.message}
      </div>

      {/* Usuario */}
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {log.user && log.user !== "unknown" ? (
          <>
            <Avatar username={log.user} size={18} />
            <span
              style={{
                fontSize: "9px",
                color: c.textMuted,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              @{log.user.split("_")[0]}
            </span>
          </>
        ) : log.ip ? (
          <span style={{ fontSize: "9px", color: c.textMuted }}>
            {log.ip.split(".").slice(0, 2).join(".")}…
          </span>
        ) : (
          <span style={{ fontSize: "9px", color: c.border }}>—</span>
        )}
      </div>

      {/* Código HTTP */}
      <div>
        {log.code ? (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: colorMap[(CODE_CFG[log.code] || {}).color] || c.textMuted,
            }}
          >
            {log.code}
          </span>
        ) : log.duration ? (
          <span style={{ fontSize: "9px", color: c.textMuted }}>
            {log.duration}
          </span>
        ) : (
          <span style={{ fontSize: "9px", color: c.border }}>—</span>
        )}
      </div>
    </div>
  );
}

// ─── Panel de detalle ─────────────────────────────────────────────────
function LogDetail({ log, c, theme, onClose }: any) {
  if (!log)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "12px",
          opacity: 0.35,
        }}
      >
        <div style={{ fontSize: "40px" }}>📋</div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: c.textMuted,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Selecciona un log para ver el detalle
        </div>
      </div>
    );

  const level = LEVEL_CFG[log.level] || LEVEL_CFG.info;
  const cat = CAT_CFG[log.category] || CAT_CFG.sistema;
  const colorMap: any = {
    success: c.success,
    warning: c.warning,
    danger: c.danger,
    info: c.info,
    accent: c.accent,
    muted: c.textMuted,
  };
  const levelColor = colorMap[level.color] || c.accent;
  const catColor = colorMap[cat.color] || c.accent;

  const field = (label: any, value: any, mono = false) => (
    <div style={{ padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>
      <div
        style={{
          fontSize: "9px",
          fontWeight: "700",
          color: c.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: c.text,
          fontFamily: mono
            ? "'DM Mono',monospace"
            : "'Plus Jakarta Sans',sans-serif",
          lineHeight: 1.5,
          wordBreak: "break-all",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
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
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "6px",
                background: levelColor + "22",
                color: levelColor,
                border: `1px solid ${levelColor}33`,
                letterSpacing: "0.08em",
                fontFamily: "DM Mono,monospace",
              }}
            >
              {level.label}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 9px",
                borderRadius: "20px",
                background: catColor + "22",
                color: catColor,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
            >
              {cat.emoji} {cat.label}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 24,
              height: 24,
              borderRadius: "7px",
              border: `1.5px solid ${c.border}`,
              background: c.card,
              cursor: "pointer",
              fontSize: "11px",
              color: c.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: c.text,
            fontFamily: "DM Mono,monospace",
            lineHeight: 1.6,
            wordBreak: "break-word",
          }}
        >
          {log.message}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: c.textMuted,
            marginTop: "6px",
            fontFamily: "DM Mono,monospace",
          }}
        >
          {log.id} · {log.date} {log.time}
        </div>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 16px" }}>
        {field("Source / Servicio", log.source, true)}
        {field("Categoría", `${cat.emoji} ${cat.label}`)}
        {log.user && field("Usuario", log.user, true)}
        {log.ip && field("IP", log.ip, true)}
        {log.code && field("HTTP Code", String(log.code), true)}
        {log.duration && field("Duración", log.duration, true)}
        {field("Fecha", `${log.date} ${log.time}`, true)}
        {field("Log ID", log.id, true)}

        {/* Raw */}
        <div style={{ marginTop: "12px" }}>
          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              color: c.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}
          >
            Raw JSON
          </div>
          <div
            style={{
              background:
                theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.04)",
              border: `1.5px solid ${c.border}`,
              borderRadius: "10px",
              padding: "12px 14px",
              fontSize: "10px",
              color: theme === "dark" ? "#a0f0c0" : "#1a5c3a",
              fontFamily: "DM Mono,monospace",
              lineHeight: 1.8,
              overflowX: "auto",
              whiteSpace: "pre",
            }}
          >
            {JSON.stringify(
              {
                id: log.id,
                level: log.level,
                category: log.category,
                source: log.source,
                message: log.message,
                user: log.user,
                ip: log.ip,
                date: log.date,
                time: log.time,
                duration: log.duration,
                code: log.code,
              },
              null,
              2,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────
const Logs = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [logs] = useState(ALL_LOGS);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("todos");
  const [filterCat, setFilterCat] = useState("todos");
  const [liveTail, setLiveTail] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const tableRef: any = useRef(null);

  // Simular live tail
  useEffect(() => {
    if (!liveTail) return;
    const t = setInterval(
      () => setLiveCount((n) => n + Math.floor(Math.random() * 3)),
      2000,
    );
    return () => clearInterval(t);
  }, [liveTail]);

  // Auto-scroll live
  useEffect(() => {
    if (liveTail && tableRef.current) tableRef.current.scrollTop = 0;
  }, [liveCount, liveTail]);

  const stats = useMemo(
    () => ({
      total: logs.length,
      errors: logs.filter((l) => l.level === "error").length,
      warnings: logs.filter((l) => l.level === "warning").length,
      infos: logs.filter((l) => l.level === "info").length,
      apiCalls: logs.filter((l) => l.category === "api").length,
      slow: logs.filter((l) => l.duration && parseInt(l.duration) > 500).length,
    }),
    [logs],
  );

  const filtered = useMemo(() => {
    return logs
      .filter((l) => filterLevel === "todos" || l.level === filterLevel)
      .filter((l) => filterCat === "todos" || l.category === filterCat)
      .filter(
        (l) =>
          search === "" ||
          l.message.toLowerCase().includes(search.toLowerCase()) ||
          l.source.toLowerCase().includes(search.toLowerCase()) ||
          (l.user || "").toLowerCase().includes(search.toLowerCase()) ||
          (l.ip || "").includes(search) ||
          l.id.toLowerCase().includes(search.toLowerCase()),
      );
  }, [logs, filterLevel, filterCat, search]);

  const ChipFilter = ({ k, label, active, onClick }:any) => (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: "20px",
        border: `1.5px solid ${active ? c.accent + "44" : c.border}`,
        background: active ? c.accentMedium : "transparent",
        color: active ? c.accent : c.textMuted,
        fontSize: "11px",
        fontWeight: "700",
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }

        .pill-cta {
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 18px; border-radius:22px;
          background:${c.accent}; color:#fff; border:none;
          font-size:12px; font-weight:700; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif;
          box-shadow:0 4px 16px rgba(107,115,240,0.35);
          transition:opacity 0.15s,transform 0.15s;
        }
        .pill-cta:hover{opacity:0.9;transform:translateY(-1px);}

        .log-search {
          background:${c.inputBackground};
          border:1.5px solid ${c.inputBorder};
          border-radius:10px; padding:8px 14px 8px 36px;
          font-size:12px; color:${c.text};
          font-family:'DM Mono',monospace;
          outline:none; width:260px; transition:border-color 0.2s;
        }
        .log-search::placeholder{color:${c.textMuted};}
        .log-search:focus{border-color:${c.accent};}

        .select-f {
          background:${c.inputBackground};
          border:1.5px solid ${c.inputBorder};
          border-radius:9px; padding:6px 10px;
          font-size:11px; font-weight:600; color:${c.textMuted};
          font-family:'Plus Jakarta Sans',sans-serif;
          outline:none; cursor:pointer;
          transition:border-color 0.2s;
        }
        .select-f:focus{border-color:${c.accent};}

        @keyframes blink {
          0%,100%{opacity:1} 50%{opacity:0.3}
        }
        @keyframes slide-in {
          from{transform:translateX(20px);opacity:0}
          to{transform:translateX(0);opacity:1}
        }
      `}</style>

      <main
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "26px",
          gap: "16px",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        {/* ── Banner ── */}
        <div
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#0f1520,#1a1a30)"
                : "linear-gradient(135deg,#f0f4ff,#ededff)",
            border: `1.5px solid ${c.accentMedium}`,
            borderRadius: "20px",
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            boxShadow: "0 4px 24px rgba(107,115,240,0.09)",
            flexShrink: 0,
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
              📋 Sistema de Logs
            </div>
            <div
              style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}
            >
              <strong style={{ color: c.accent }}>
                {stats.total} entradas
              </strong>{" "}
              ·{" "}
              <strong style={{ color: c.danger }}>
                {stats.errors} errores
              </strong>{" "}
              ·{" "}
              <strong style={{ color: c.warning }}>
                {stats.warnings} avisos
              </strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Live tail toggle */}
            <button
              onClick={() => setLiveTail((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "20px",
                border: `1.5px solid ${liveTail ? c.danger + "44" : c.border}`,
                background: liveTail ? c.danger : "transparent",
                color: liveTail ? c.danger : c.textMuted,
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: liveTail ? c.danger : c.textMuted,
                  animation: liveTail ? "blink 1s infinite" : "none",
                }}
              />
              {liveTail ? `Live · +${liveCount}` : "Live tail"}
            </button>
            <button className="pill-cta">📤 Exportar logs</button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(145px,1fr))",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <KpiCard
            emoji="📋"
            label="Total entradas"
            value={stats.total}
            colorKey="accent"
            c={c}
          />
          <KpiCard
            emoji="🔴"
            label="Errores"
            value={stats.errors}
            colorKey="danger"
            c={c}
          />
          <KpiCard
            emoji="🟡"
            label="Avisos"
            value={stats.warnings}
            colorKey="warning"
            c={c}
          />
          <KpiCard
            emoji="🌐"
            label="Llamadas API"
            value={stats.apiCalls}
            colorKey="info"
            c={c}
          />
          <KpiCard
            emoji="🐢"
            label="Requests lentos"
            value={stats.slow}
            colorKey="warning"
            c={c}
          />
        </div>

        {/* ── Tabla + Detalle ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: selected && showDetail ? "1fr 340px" : "1fr",
            gap: "16px",
            minHeight: 0,
          }}
        >
          {/* Panel principal */}
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "18px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 20px rgba(107,115,240,0.06)",
            }}
          >
            {/* Toolbar */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: `1.5px solid ${c.border}`,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                flexShrink: 0,
              }}
            >
              {/* Search */}
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
                  className="log-search"
                  placeholder="Buscar mensaje, IP, source…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Level chips */}
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {[
                  { k: "todos", label: "Todo" },
                  { k: "error", label: "🔴 Error" },
                  { k: "warning", label: "🟡 Warn" },
                  { k: "info", label: "🔵 Info" },
                ].map((f) => (
                  <ChipFilter
                    key={f.k}
                    k={f.k}
                    label={f.label}
                    active={filterLevel === f.k}
                    onClick={() => setFilterLevel(f.k)}
                  />
                ))}
              </div>

              {/* Category select */}
              <select
                className="select-f"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                <option value="todos">🗂 Todas las categorías</option>
                {Object.entries(CAT_CFG).map(([k, v]:any) => (
                  <option key={k} value={k}>
                    {v.emoji} {v.label}
                  </option>
                ))}
              </select>

              {/* Count */}
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  color: c.textMuted,
                  fontFamily: "DM Mono,monospace",
                }}
              >
                <strong style={{ color: c.text }}>{filtered.length}</strong> /{" "}
                {logs.length}
              </div>
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "6px 56px 80px 110px 1fr 90px 60px",
                gap: "10px",
                padding: "7px 16px",
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.015)"
                    : "rgba(0,0,0,0.02)",
                borderBottom: `1px solid ${c.border}`,
                flexShrink: 0,
              }}
            >
              {[
                "",
                "Hora",
                "Nivel",
                "Source",
                "Mensaje",
                "Usuario",
                "Cód.",
              ].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: c.textMuted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div ref={tableRef} style={{ flex: 1, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "52px", textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      opacity: 0.2,
                      marginBottom: "10px",
                    }}
                  >
                    📭
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: c.textMuted,
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                    }}
                  >
                    Sin resultados
                  </div>
                </div>
              ) : (
                filtered.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    c={c}
                    theme={theme}
                    selected={selected?.id === log.id}
                    onClick={() => {
                      setSelected(log);
                      setShowDetail(true);
                    }}
                  />
                ))
              )}

              {/* Live tail indicator */}
              {liveTail && (
                <div
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    borderTop: `1px solid ${c.border}`,
                    background:
                      theme === "dark"
                        ? "rgba(248,113,113,0.04)"
                        : "rgba(248,113,113,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: c.danger,
                      animation: "blink 1s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: c.danger,
                      fontFamily: "DM Mono,monospace",
                    }}
                  >
                    LIVE · esperando nuevas entradas…
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: c.textMuted,
                      marginLeft: "auto",
                    }}
                  >
                    +{liveCount} desde inicio
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "10px 16px",
                borderTop: `1px solid ${c.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", gap: "14px" }}>
                {[
                  {
                    label: "Errores",
                    count: filtered.filter((l) => l.level === "error").length,
                    color: c.danger,
                  },
                  {
                    label: "Avisos",
                    count: filtered.filter((l) => l.level === "warning").length,
                    color: c.warning,
                  },
                  {
                    label: "Info",
                    count: filtered.filter((l) => l.level === "info").length,
                    color: c.primary,
                  },
                ].map((item) => (
                  <span
                    key={item.label}
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      color: item.color,
                      fontFamily: "DM Mono,monospace",
                    }}
                  >
                    {item.count} {item.label.toLowerCase()}
                  </span>
                ))}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: c.textMuted,
                  fontFamily: "DM Mono,monospace",
                }}
              >
                {selected
                  ? `Seleccionado: ${selected.id}`
                  : "Haz clic para ver detalle"}
              </span>
            </div>
          </div>

          {/* Panel de detalle */}
          {selected && showDetail && (
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 2px 20px rgba(107,115,240,0.06)",
                animation: "slide-in 0.2s ease",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <LogDetail
                log={selected}
                c={c}
                theme={theme}
                onClose={() => {
                  setShowDetail(false);
                  setSelected(null);
                }}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Logs;
