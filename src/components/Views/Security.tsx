import { useMemo, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";

// ─── Datos mock ───────────────────────────────────────────────────────
const ACTIVE_SESSIONS:any = [
  { id: "SES-001", user: "lucia_v",  name: "Lucía Vega",     role: "admin",     device: "Chrome / macOS",    ip: "187.33.12.45",  location: "🇲🇽 CDMX",      lastActivity: "Ahora",      current: true  },
  { id: "SES-002", user: "carlos_m", name: "Carlos Mendoza", role: "moderador", device: "Firefox / Windows", ip: "201.123.45.67", location: "🇨🇴 Bogotá",    lastActivity: "Hace 8 min", current: false },
  { id: "SES-003", user: "lucia_v",  name: "Lucía Vega",     role: "admin",     device: "Safari / iPhone",   ip: "187.33.12.45",  location: "🇲🇽 CDMX",      lastActivity: "Hace 2h",    current: false },
  { id: "SES-004", user: "carlos_m", name: "Carlos Mendoza", role: "moderador", device: "Chrome / Android",  ip: "190.88.22.11",  location: "🇨🇴 Medellín",  lastActivity: "Hace 3h",    current: false },
];

const AUDIT_LOG:any = [
  { id: "LOG-001", user: "lucia_v",  action: "login",          detail: "Inicio de sesión exitoso",                           ip: "187.33.12.45",  date: "09:14", severity: "info"    },
  { id: "LOG-002", user: "carlos_m", action: "ban_user",       detail: "Baneó usuario @troll_2024",                          ip: "201.123.45.67", date: "08:55", severity: "warning" },
  { id: "LOG-003", user: "unknown",  action: "failed_login",   detail: "3 intentos fallidos desde IP 45.33.88.12",           ip: "45.33.88.12",   date: "08:30", severity: "danger"  },
  { id: "LOG-004", user: "lucia_v",  action: "config_change",  detail: "Cambió política de contraseñas a 'Fuerte'",          ip: "187.33.12.45",  date: "Ayer 17:20", severity: "warning" },
  { id: "LOG-005", user: "carlos_m", action: "delete_content", detail: "Eliminó publicación PUB-089 por desinformación",     ip: "201.123.45.67", date: "Ayer 11:15", severity: "info"    },
  { id: "LOG-006", user: "unknown",  action: "blocked_ip",     detail: "IP 192.168.99.1 bloqueada por actividad sospechosa", ip: "192.168.99.1",  date: "Ayer 09:00", severity: "danger"  },
  { id: "LOG-007", user: "lucia_v",  action: "export_data",    detail: "Exportó datos de usuarios (CSV, 1,247 registros)",   ip: "187.33.12.45",  date: "Hace 2d",    severity: "warning" },
  { id: "LOG-008", user: "unknown",  action: "brute_force",    detail: "Ataque de fuerza bruta detectado: 47 intentos",      ip: "103.55.200.4",  date: "Hace 2d",    severity: "danger"  },
  { id: "LOG-009", user: "lucia_v",  action: "2fa_enabled",    detail: "2FA activado para cuenta @carlos_m",                 ip: "187.33.12.45",  date: "Hace 3d",    severity: "info"    },
];

const BLOCKED_IPS_DATA:any = [
  { ip: "45.33.88.12",  reason: "Intentos de login fallidos (×12)",  date: "2025-02-26", permanent: false, country: "🇷🇺" },
  { ip: "103.55.200.4", reason: "Ataque de fuerza bruta detectado",   date: "2025-02-24", permanent: true,  country: "🇨🇳" },
  { ip: "192.168.99.1", reason: "Actividad sospechosa de scraping",   date: "2025-02-25", permanent: false, country: "🇧🇷" },
  { ip: "77.88.12.34",  reason: "Acceso a rutas de administración",   date: "2025-02-22", permanent: true,  country: "🇩🇪" },
];

const VULNS_DATA:any = [
  { id: "VUL-001", title: "Dependencias con CVEs conocidos",          severity: "critica", status: "abierta",     description: "2 paquetes npm tienen vulnerabilidades (lodash, axios)." },
  { id: "VUL-002", title: "Certificado SSL próximo a expirar",        severity: "alta",    status: "abierta",     description: "El certificado TLS expira en 14 días." },
  { id: "VUL-003", title: "Rate limiting sin configurar en API",      severity: "alta",    status: "en_progreso", description: "La API pública no tiene límite de peticiones por IP." },
  { id: "VUL-004", title: "Headers de seguridad faltantes",           severity: "media",   status: "abierta",     description: "Faltan headers CSP y X-Frame-Options en algunas rutas." },
  { id: "VUL-005", title: "Contraseñas débiles en cuentas antiguas",  severity: "media",   status: "resuelta",    description: "34 cuentas creadas antes de la nueva política." },
];

// ─── Configs ──────────────────────────────────────────────────────────
const SEVERITY_MAP:any = {
  critica:    { label: "Crítica",    dot: "🔴", color: "danger"  },
  alta:       { label: "Alta",       dot: "🟠", color: "warning" },
  media:      { label: "Media",      dot: "🔵", color: "info"    },
  baja:       { label: "Baja",       dot: "🟢", color: "success" },
};

const VSTATUS_MAP:any = {
  abierta:    { label: "Abierta",    dot: "🔴", color: "danger"  },
  en_progreso:{ label: "En progreso",dot: "🟡", color: "warning" },
  resuelta:   { label: "Resuelta",   dot: "🟢", color: "success" },
};

const LOG_MAP:any = {
  login:          { label: "Login",        emoji: "🔑" },
  failed_login:   { label: "Login fallido",emoji: "❌" },
  ban_user:       { label: "Ban usuario",  emoji: "🚫" },
  config_change:  { label: "Config",       emoji: "⚙️" },
  delete_content: { label: "Eliminación",  emoji: "🗑️" },
  blocked_ip:     { label: "IP bloqueada", emoji: "🛑" },
  export_data:    { label: "Exportación",  emoji: "📤" },
  brute_force:    { label: "Fuerza bruta", emoji: "💀" },
  "2fa_enabled":  { label: "2FA",          emoji: "🔐" },
};

const AVATAR_PAL = ["#7b83f5","#f87171","#34d399","#fbbf24","#60a5fa","#a78bfa","#fb923c","#e879f9"];
const getAC = (n = "") => AVATAR_PAL[n.charCodeAt(0) % AVATAR_PAL.length];

// ─── Sub-componentes ──────────────────────────────────────────────────
function KpiCard({ emoji, label, value, colorKey, c }:any) {
  const map:any = { success:{bg:c.successSoft,text:c.success}, warning:{bg:c.warningSoft,text:c.warning}, danger:{bg:c.dangerSoft,text:c.danger}, info:{bg:c.infoSoft,text:c.info}, accent:{bg:c.accentSoft,text:c.accent} };
  const col = map[colorKey] || map.accent;
  return (
    <div style={{ background:c.card, border:`1.5px solid ${c.border}`, borderRadius:"16px", padding:"18px 20px", display:"flex", alignItems:"center", gap:"14px", boxShadow:"0 2px 12px rgba(107,115,240,0.06)" }}>
      <div style={{ width:44, height:44, borderRadius:"12px", background:col.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>{emoji}</div>
      <div>
        <div style={{ fontSize:"22px", fontWeight:"800", color:col.text, letterSpacing:"-0.02em" }}>{value}</div>
        <div style={{ fontSize:"11px", fontWeight:"600", color:c.textMuted }}>{label}</div>
      </div>
    </div>
  );
}

function Avatar({ username, size=32 }:any) {
  const bg = getAC(username);
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${bg}22`, border:`2px solid ${bg}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.32, fontWeight:"800", color:bg, flexShrink:0 }}>
      {(username||"?").slice(0,2).toUpperCase()}
    </div>
  );
}

function Badge({ label, dot, colorKey, c }:any) {
  const map:any = { success:{bg:c.successSoft,text:c.success}, warning:{bg:c.warningSoft,text:c.warning}, danger:{bg:c.dangerSoft,text:c.danger}, info:{bg:c.infoSoft,text:c.info}, muted:{bg:c.accentSoft,text:c.textMuted} };
  const col = map[colorKey] || map.muted;
  return <span style={{ fontSize:"10px", fontWeight:"700", padding:"3px 9px", borderRadius:"20px", background:col.bg, color:col.text, display:"inline-flex", alignItems:"center", gap:"4px", whiteSpace:"nowrap" }}>{dot} {label}</span>;
}

function Toggle({ value, onChange, c }:any) {
  return (
    <div onClick={()=>onChange(!value)} style={{ width:44, height:24, borderRadius:12, background:value?c.accentMedium:c.border, border:`1.5px solid ${value?c.accent:c.border}`, position:"relative", cursor:"pointer", transition:"all 0.25s", flexShrink:0 }}>
      <div style={{ position:"absolute", width:18, height:18, borderRadius:"50%", background:value?c.accent:c.textMuted, top:1, left:value?21:1, transition:"left 0.25s, background 0.25s", boxShadow:"0 2px 6px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

function ScoreCircle({ score, c }:any) {
  const col = score>=80?c.success:score>=60?c.warning:c.danger;
  const label = score>=80?"Bueno":score>=60?"Mejorable":"En riesgo";
  const r = 52, circ = 2*Math.PI*r, dash=(score/100)*circ;
  return (
    <div style={{ position:"relative", width:120, height:120, flexShrink:0 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ filter:`drop-shadow(0 0 8px ${col}66)`, transition:"stroke-dasharray 0.8s ease" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:"26px", fontWeight:"800", color:col, letterSpacing:"-0.03em" }}>{score}</div>
        <div style={{ fontSize:"9px", fontWeight:"700", color:c.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────
const Security = () => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [sessions, setSessions]       = useState(ACTIVE_SESSIONS);
  const [blockedIPs, setBlockedIPs]   = useState(BLOCKED_IPS_DATA);
  const [vulns, setVulns]             = useState(VULNS_DATA);
  const [activeTab, setActiveTab]     = useState("sesiones");
  const [logFilter, setLogFilter]     = useState("todos");
  const [logSearch, setLogSearch]     = useState("");
  const [newIP, setNewIP]             = useState("");
  const [twoFA, setTwoFA]             = useState(true);
  const [autoBlock, setAutoBlock]     = useState(true);
  const [auditActive, setAuditActive] = useState(true);
  const [scanning, setScanning]       = useState(false);
  const [scanDone, setScanDone]       = useState(false);

  const stats = useMemo(() => ({
    sessions:   sessions.length,
    blocked:    blockedIPs.length,
    criticas:   vulns.filter((v:any)=>v.severity==="critica"&&v.status!=="resuelta").length,
    abiertas:   vulns.filter((v:any)=>v.status!=="resuelta").length,
    alertas:    AUDIT_LOG.filter((l:any)=>l.severity==="danger").length,
  }), [sessions, blockedIPs, vulns]);

  const filteredLog = useMemo(() => AUDIT_LOG
    .filter((l:any)=>logFilter==="todos"||l.severity===logFilter)
    .filter((l:any)=>logSearch===""||l.user.includes(logSearch)||l.detail.toLowerCase().includes(logSearch.toLowerCase())||l.ip.includes(logSearch)),
    [logFilter, logSearch]);

  const terminateSession = (id:any) => setSessions((p:any)=>p.filter((s:any)=>s.id!==id));
  const unblockIP = (ip:any) => setBlockedIPs((p:any)=>p.filter((b:any)=>b.ip!==ip));
  const addIP = () => {
    if(!newIP.trim()) return;
    setBlockedIPs((p:any)=>[...p,{ip:newIP.trim(),reason:"Bloqueado manualmente",date:"2025-02-26",permanent:false,country:"🌐"}]);
    setNewIP("");
  };
  const resolveVuln = (id:any) => setVulns((p:any)=>p.map((v:any)=>v.id===id?{...v,status:"resuelta"}:v));
  const runScan = () => { setScanning(true); setScanDone(false); setTimeout(()=>{setScanning(false);setScanDone(true);},2400); };

  const Tab = ({k,label}:any) => (
    <button onClick={()=>setActiveTab(k)} style={{
      padding:"8px 16px", borderRadius:"10px",
      border:`1.5px solid ${activeTab===k?c.accent+"44":c.border}`,
      background:activeTab===k?c.accentMedium:"transparent",
      color:activeTab===k?c.accent:c.textMuted,
      fontSize:"12px", fontWeight:"700", cursor:"pointer",
      fontFamily:"'Plus Jakarta Sans', sans-serif", transition:"all 0.15s",
    }}>{label}</button>
  );

  const ChipFilter = ({k,label}:any) => (
    <button onClick={()=>setLogFilter(k)} style={{
      padding:"5px 12px", borderRadius:"20px",
      border:`1.5px solid ${logFilter===k?c.accent+"44":c.border}`,
      background:logFilter===k?c.accentMedium:"transparent",
      color:logFilter===k?c.accent:c.textMuted,
      fontSize:"11px", fontWeight:"700", cursor:"pointer",
      fontFamily:"'Plus Jakarta Sans', sans-serif", transition:"all 0.15s", whiteSpace:"nowrap",
    }}>{label}</button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;}

        .pill-cta{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:22px;background:${c.accent};color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:0 4px 16px rgba(107,115,240,0.35);transition:opacity 0.15s,transform 0.15s;}
        .pill-cta:hover{opacity:0.9;transform:translateY(-1px);}

        .search-input{background:${c.inputBackground};border:1.5px solid ${c.inputBorder};border-radius:10px;padding:8px 14px 8px 36px;font-size:12px;color:${c.text};font-family:'Plus Jakarta Sans',sans-serif;outline:none;width:200px;transition:border-color 0.2s;}
        .search-input::placeholder{color:${c.textMuted};}
        .search-input:focus{border-color:${c.accent};}

        .ip-input{background:${c.inputBackground};border:1.5px solid ${c.inputBorder};border-radius:10px;padding:8px 14px;font-size:12px;color:${c.text};font-family:'DM Mono',monospace;outline:none;flex:1;transition:border-color 0.2s;}
        .ip-input::placeholder{color:${c.textMuted};}
        .ip-input:focus{border-color:${c.accent};}

        .row-hover{transition:background 0.15s;cursor:default;}
        .row-hover:hover{background:${c.accentSoft};}

        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <main style={{ flex:1, overflow:"auto", padding:"26px", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

        {/* ── Banner ── */}
        <div style={{
          background: theme==="dark"?"linear-gradient(135deg,#0f1a18,#0d1420)":"linear-gradient(135deg,#edfaf5,#edf5ff)",
          border:`1.5px solid ${c.success}44`,
          borderRadius:"20px", padding:"22px 28px", marginBottom:"22px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px",
          boxShadow:"0 4px 24px rgba(52,211,153,0.08)",
        }}>
          <div>
            <div style={{ fontSize:"18px", fontWeight:"800", color:c.text, marginBottom:"5px" }}>🔐 Centro de Seguridad</div>
            <div style={{ fontSize:"13px", color:c.textMuted, lineHeight:1.5 }}>
              <strong style={{color:c.success}}>{stats.sessions} sesiones</strong> activas ·{" "}
              <strong style={{color:stats.criticas>0?c.danger:c.success}}>{stats.criticas} vulnerabilidades críticas</strong> ·{" "}
              <strong style={{color:c.warning}}>{stats.blocked} IPs bloqueadas</strong>
            </div>
          </div>
          <button className="pill-cta" style={{ background:stats.criticas>0?c.danger:c.success, boxShadow:`0 4px 16px ${stats.criticas>0?"rgba(248,113,113,0.4)":"rgba(52,211,153,0.4)"}` }}>
            {stats.criticas>0?"🚨 Atender vulnerabilidades":"✅ Estado seguro"}
          </button>
        </div>

        {/* ── Score + Quick config ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"22px" }}>
          {/* Score */}
          <div style={{
            background: theme==="dark"?"linear-gradient(135deg,#1a1a30,#0f0f22)":"linear-gradient(135deg,#ededff,#f0f0ff)",
            border:`1.5px solid ${c.accentMedium}`,
            borderRadius:"20px", padding:"24px",
            display:"flex", alignItems:"center", gap:"22px",
            boxShadow:"0 4px 20px rgba(107,115,240,0.09)",
          }}>
            <ScoreCircle score={72} c={c} />
            <div>
              <div style={{ fontSize:"15px", fontWeight:"800", color:c.text, marginBottom:"5px" }}>Score de seguridad</div>
              <div style={{ fontSize:"12px", color:c.textMuted, lineHeight:1.6, marginBottom:"12px" }}>
                <strong style={{color:c.danger}}>{stats.criticas} vulns críticas</strong> y <strong style={{color:c.warning}}>{stats.abiertas-stats.criticas} altas</strong> abiertas reducen tu puntaje.
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                {[
                  {label:"2FA activo",   ok:true  },
                  {label:"Sin vulns críticas",ok:false},
                  {label:"Rate limit",   ok:false },
                  {label:"Logs activos", ok:true  },
                ].map(item=>(
                  <span key={item.label} style={{ fontSize:"11px", fontWeight:"600", color:item.ok?c.success:c.danger }}>
                    {item.ok?"✅":"❌"} {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick toggles */}
          <div style={{ background:c.card, border:`1.5px solid ${c.border}`, borderRadius:"20px", padding:"20px", boxShadow:"0 2px 12px rgba(107,115,240,0.06)", display:"flex", flexDirection:"column", gap:"0" }}>
            <div style={{ fontSize:"13px", fontWeight:"800", color:c.text, marginBottom:"14px" }}>⚡ Controles rápidos</div>
            {[
              {label:"Autenticación 2FA",      desc:"Requerido para administradores",   val:twoFA,       set:setTwoFA,       icon:"🔐", ok:twoFA       },
              {label:"Auto-bloqueo de IPs",    desc:"Ban automático por intentos fallidos",val:autoBlock, set:setAutoBlock,  icon:"🛑", ok:autoBlock   },
              {label:"Log de auditoría activo",desc:"Registrar todas las acciones",     val:auditActive, set:setAuditActive, icon:"📋", ok:auditActive },
            ].map((item,i)=>(
              <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 0", borderBottom:i<2?`1px solid ${c.border}`:"none" }}>
                <div style={{ width:36, height:36, borderRadius:"10px", background:item.ok?c.success:c.accentSoft, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"12px", fontWeight:"700", color:c.text }}>{item.label}</div>
                  <div style={{ fontSize:"10px", color:c.textMuted }}>{item.desc}</div>
                </div>
                <Toggle value={item.val} onChange={item.set} c={c} />
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:"14px", marginBottom:"22px" }}>
          <KpiCard emoji="💻" label="Sesiones activas" value={stats.sessions} colorKey="accent"  c={c} />
          <KpiCard emoji="🛑" label="IPs bloqueadas"   value={stats.blocked}  colorKey="danger"  c={c} />
          <KpiCard emoji="🔓" label="Vulns. abiertas"  value={stats.abiertas} colorKey="warning" c={c} />
          <KpiCard emoji="💀" label="Vulns. críticas"  value={stats.criticas} colorKey="danger"  c={c} />
          <KpiCard emoji="🚨" label="Alertas log"      value={stats.alertas}  colorKey="warning" c={c} />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
          <Tab k="sesiones" label="💻 Sesiones activas" />
          <Tab k="log"      label="📋 Log de auditoría" />
          <Tab k="ips"      label="🛑 IPs bloqueadas"   />
          <Tab k="vulns"    label="🔓 Vulnerabilidades" />
        </div>

        {/* ══ SESIONES ══ */}
        {activeTab==="sesiones" && (
          <div style={{ background:c.card, border:`1.5px solid ${c.border}`, borderRadius:"18px", overflow:"hidden", boxShadow:"0 2px 16px rgba(107,115,240,0.06)" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:"14px", fontWeight:"800", color:c.text }}>💻 Sesiones activas</div>
                <div style={{ fontSize:"11px", color:c.textMuted, marginTop:"2px" }}>{sessions.length} sesiones abiertas ahora mismo</div>
              </div>
              <button onClick={()=>setSessions((p:any)=>p.filter((s:any)=>s.current))} style={{ padding:"7px 14px", borderRadius:"10px", border:`1.5px solid ${c.danger}33`, background:c.danger, color:c.danger, fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                🔒 Cerrar otras sesiones
              </button>
            </div>

            {sessions.map((s:any)=>(
              <div key={s.id} className="row-hover" style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 20px", borderBottom:`1px solid ${c.border}` }}>
                <Avatar username={s.user} size={38} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"13px", fontWeight:"700", color:c.text }}>@{s.user}</span>
                    {s.current&&<span style={{ fontSize:"10px", fontWeight:"700", padding:"2px 8px", borderRadius:"20px", background:c.success, color:c.success }}>✅ Esta sesión</span>}
                    <span style={{ fontSize:"10px", fontWeight:"600", padding:"2px 8px", borderRadius:"20px", background:c.accentSoft, color:c.accent }}>{s.role}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"11px", color:c.textMuted }}>💻 {s.device}</span>
                    <span style={{ fontSize:"11px", color:c.accent, fontFamily:"DM Mono,monospace" }}>{s.ip}</span>
                    <span style={{ fontSize:"11px", color:c.textMuted }}>{s.location}</span>
                    <span style={{ fontSize:"11px", color:c.textMuted }}>🕐 {s.lastActivity}</span>
                  </div>
                </div>
                {!s.current&&(
                  <button onClick={()=>terminateSession(s.id)} style={{ padding:"6px 14px", borderRadius:"9px", border:`1.5px solid ${c.danger}33`, background:c.danger, color:c.danger, fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", flexShrink:0 }}>
                    Cerrar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ LOG ══ */}
        {activeTab==="log" && (
          <div style={{ background:c.card, border:`1.5px solid ${c.border}`, borderRadius:"18px", overflow:"hidden", boxShadow:"0 2px 16px rgba(107,115,240,0.06)" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:"14px", fontWeight:"800", color:c.text }}>📋 Log de auditoría</div>
                <div style={{ fontSize:"11px", color:c.textMuted, marginTop:"2px" }}>Registro completo de acciones administrativas</div>
              </div>
              <button style={{ padding:"7px 14px", borderRadius:"10px", border:`1.5px solid ${c.border}`, background:"transparent", color:c.textMuted, fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>📤 Exportar CSV</button>
            </div>

            {/* Filtros */}
            <div style={{ padding:"12px 20px", borderBottom:`1px solid ${c.border}`, display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", color:c.textMuted }}>🔍</span>
                <input className="search-input" placeholder="Usuario, IP, detalle..." value={logSearch} onChange={e=>setLogSearch(e.target.value)} />
              </div>
              <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                <ChipFilter k="todos"   label="Todos"       />
                <ChipFilter k="info"    label="🔵 Info"     />
                <ChipFilter k="warning" label="🟡 Aviso"    />
                <ChipFilter k="danger"  label="🔴 Alerta"   />
              </div>
            </div>

            {/* Header */}
            <div style={{ display:"grid", gridTemplateColumns:"10px 100px 120px 130px 1fr 120px 80px", gap:"12px", padding:"8px 20px", background:theme==="dark"?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)", borderBottom:`1px solid ${c.border}` }}>
              {["","Acción","Tipo","Usuario","Detalle","IP","Hora"].map(h=>(
                <div key={h} style={{ fontSize:"9px", fontWeight:"700", color:c.textMuted, letterSpacing:"0.1em", textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>

            {filteredLog.map((log:any)=>{
              const lc = LOG_MAP[log.action]||{label:log.action,emoji:"📌"};
              const dotColor = log.severity==="danger"?c.danger:log.severity==="warning"?c.warning:c.accent;
              return (
                <div key={log.id} className="row-hover" style={{ display:"grid", gridTemplateColumns:"10px 100px 120px 130px 1fr 120px 80px", gap:"12px", padding:"10px 20px", borderBottom:`1px solid ${c.border}`, alignItems:"center" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:dotColor, boxShadow:log.severity==="danger"?`0 0 6px ${dotColor}88`:"none" }} />
                  <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <span style={{ fontSize:"12px" }}>{lc.emoji}</span>
                    <span style={{ fontSize:"11px", fontWeight:"600", color:c.text, whiteSpace:"nowrap" }}>{lc.label}</span>
                  </div>
                  <span style={{ fontSize:"10px", color:c.textMuted }}>{log.action}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    {log.user!=="unknown"?(
                      <><Avatar username={log.user} size={20} /><span style={{ fontSize:"11px", color:c.textMuted }}>@{log.user}</span></>
                    ):(
                      <span style={{ fontSize:"11px", color:c.danger }}>⚠️ Desconocido</span>
                    )}
                  </div>
                  <div style={{ fontSize:"11px", color:c.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.detail}</div>
                  <div style={{ fontSize:"10px", color:c.accent, fontFamily:"DM Mono,monospace" }}>{log.ip}</div>
                  <div style={{ fontSize:"10px", color:c.textMuted }}>{log.date}</div>
                </div>
              );
            })}

            <div style={{ padding:"10px 20px", borderTop:`1px solid ${c.border}`, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:"11px", color:c.textMuted }}><strong style={{color:c.text}}>{filteredLog.length}</strong> entradas</span>
              <span style={{ fontSize:"11px", color:c.textMuted }}>Últimas 72 horas</span>
            </div>
          </div>
        )}

        {/* ══ IPs ══ */}
        {activeTab==="ips" && (
          <div style={{ background:c.card, border:`1.5px solid ${c.border}`, borderRadius:"18px", overflow:"hidden", boxShadow:"0 2px 16px rgba(107,115,240,0.06)" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${c.border}` }}>
              <div style={{ fontSize:"14px", fontWeight:"800", color:c.text }}>🛑 IPs bloqueadas</div>
              <div style={{ fontSize:"11px", color:c.textMuted, marginTop:"2px" }}>{blockedIPs.length} direcciones bloqueadas</div>
            </div>

            {/* Agregar IP */}
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${c.border}`, display:"flex", gap:"10px", alignItems:"center" }}>
              <input className="ip-input" placeholder="Ej: 192.168.1.100" value={newIP} onChange={e=>setNewIP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addIP()} />
              <button onClick={addIP} style={{ padding:"8px 18px", borderRadius:"10px", background:c.danger, color:"#fff", border:"none", fontSize:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 4px 14px rgba(248,113,113,0.35)", whiteSpace:"nowrap" }}>
                + Bloquear
              </button>
            </div>

            {blockedIPs.map((item:any)=>(
              <div key={item.ip} className="row-hover" style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 20px", borderBottom:`1px solid ${c.border}` }}>
                <div style={{ width:38, height:38, borderRadius:"10px", background:c.danger, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>🛑</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px" }}>
                    <span style={{ fontSize:"14px", fontWeight:"800", color:c.text, fontFamily:"DM Mono,monospace" }}>{item.ip}</span>
                    <span style={{ fontSize:"13px" }}>{item.country}</span>
                    {item.permanent&&<Badge label="Permanente" dot="" colorKey="danger" c={c} />}
                  </div>
                  <div style={{ display:"flex", gap:"12px" }}>
                    <span style={{ fontSize:"11px", color:c.textMuted }}>{item.reason}</span>
                    <span style={{ fontSize:"10px", color:c.border }}>📅 {item.date}</span>
                  </div>
                </div>
                <button onClick={()=>unblockIP(item.ip)} style={{ padding:"6px 14px", borderRadius:"9px", border:`1.5px solid ${c.success}33`, background:c.success, color:c.success, fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", flexShrink:0 }}>
                  Desbloquear
                </button>
              </div>
            ))}

            {blockedIPs.length===0&&(
              <div style={{ padding:"48px", textAlign:"center" }}>
                <div style={{ fontSize:"36px", opacity:0.25, marginBottom:"10px" }}>✅</div>
                <div style={{ fontSize:"13px", fontWeight:"700", color:c.textMuted }}>Sin IPs bloqueadas</div>
              </div>
            )}
          </div>
        )}

        {/* ══ VULNERABILIDADES ══ */}
        {activeTab==="vulns" && (
          <div style={{ background:c.card, border:`1.5px solid ${c.border}`, borderRadius:"18px", overflow:"hidden", boxShadow:"0 2px 16px rgba(107,115,240,0.06)" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:"14px", fontWeight:"800", color:c.text }}>🔓 Vulnerabilidades</div>
                <div style={{ fontSize:"11px", color:c.textMuted, marginTop:"2px" }}>Escaneo de seguridad de la plataforma</div>
              </div>
              <button onClick={runScan} disabled={scanning} style={{
                padding:"7px 16px", borderRadius:"10px",
                background:scanning?c.accentSoft:scanDone?c.success:c.accentMedium,
                border:`1.5px solid ${scanning?c.accent+"44":scanDone?c.success+"44":c.accent+"44"}`,
                color:scanning?c.accent:scanDone?c.success:c.accent,
                fontSize:"12px", fontWeight:"700", cursor:scanning?"wait":"pointer",
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                display:"flex", alignItems:"center", gap:"6px",
              }}>
                {scanning?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>Escaneando...</>:scanDone?"✅ Escaneo listo":"🔍 Escanear ahora"}
              </button>
            </div>

            {/* Resumen contadores */}
            <div style={{ display:"flex", gap:"10px", padding:"14px 20px", borderBottom:`1px solid ${c.border}`, flexWrap:"wrap" }}>
              {[
                {label:"Críticas",  count:vulns.filter((v:any)=>v.severity==="critica"&&v.status!=="resuelta").length, color:c.danger   },
                {label:"Altas",     count:vulns.filter((v:any)=>v.severity==="alta"   &&v.status!=="resuelta").length, color:c.warning  },
                {label:"Medias",    count:vulns.filter((v:any)=>v.severity==="media"  &&v.status!=="resuelta").length, color:c.text     },
                {label:"Resueltas", count:vulns.filter((v:any)=>v.status==="resuelta").length,                         color:c.success  },
              ].map(item=>(
                <div key={item.label} style={{ padding:"8px 16px", borderRadius:"12px", background:`${item.color}15`, border:`1.5px solid ${item.color}33`, display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"18px", fontWeight:"800", color:item.color }}>{item.count}</span>
                  <span style={{ fontSize:"11px", fontWeight:"600", color:c.textMuted }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:"10px" }}>
              {vulns.map((v:any)=>{
                const isResolved = v.status==="resuelta";
                const sev = SEVERITY_MAP[v.severity];
                const sts = VSTATUS_MAP[v.status];
                const sevColorMap:any = {danger:c.danger,warning:c.warning,info:c.text,success:c.success};
                const stsColorMap = {danger:c.danger,warning:c.warning,success:c.success};
                const sevColorKey = sev?.color||"accent";
                const stsColorKey = sts?.color||"muted";
                return (
                  <div key={v.id} style={{
                    borderRadius:"14px", border:`1.5px solid ${c.border}`,
                    padding:"16px 18px", background:c.card,
                    position:"relative", overflow:"hidden",
                    opacity:isResolved?0.65:1, transition:"all 0.15s",
                  }}>
                    {/* Barra lateral de severidad */}
                    <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:sevColorMap[sevColorKey]||c.accent, borderRadius:"14px 0 0 14px" }} />
                    <div style={{ paddingLeft:"10px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px", flexWrap:"wrap" }}>
                            <Badge label={sev?.label||""} dot={sev?.dot||""} colorKey={sevColorKey} c={c} />
                            <Badge label={sts?.label||""} dot={sts?.dot||""} colorKey={stsColorKey} c={c} />
                            <span style={{ fontSize:"10px", color:c.textMuted, fontFamily:"DM Mono,monospace" }}>{v.id}</span>
                          </div>
                          <div style={{ fontSize:"13px", fontWeight:"800", color:c.text, marginBottom:"5px" }}>{v.title}</div>
                          <div style={{ fontSize:"12px", color:c.textMuted, lineHeight:1.5 }}>{v.description}</div>
                        </div>
                        {!isResolved&&(
                          <button onClick={()=>resolveVuln(v.id)} style={{ padding:"7px 14px", borderRadius:"10px", border:`1.5px solid ${c.success}33`, background:c.success, color:c.success, fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", flexShrink:0 }}>
                            ✅ Resolver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Security;