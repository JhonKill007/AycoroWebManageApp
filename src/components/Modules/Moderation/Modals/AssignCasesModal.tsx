// AssignCasesModal.tsx
import { useMemo, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";

// ─── Tipos ─────────────────────────────────────────────────────────────
interface Moderator {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "moderator";
  activeCases: number;
  totalResolved: number;
  avatar?: string;
  specialties: string[];
  status: "online" | "busy" | "away" | "offline";
}

interface Case {
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
}

// ─── Datos mock de moderadores ────────────────────────────────────────
const MODERATORS_DATA: Moderator[] = [
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

const PRIORITY_CONFIG: any = {
  critica: { label: "Crítica", color: "danger", dot: "🔴", weight: 0 },
  alta: { label: "Alta", color: "warning", dot: "🟠", weight: 1 },
  media: { label: "Media", color: "info", dot: "🔵", weight: 2 },
  baja: { label: "Baja", color: "success", dot: "🟢", weight: 3 },
};

const TYPE_CONFIG: any = {
  publicacion: { label: "Publicación", emoji: "📝" },
  mensaje: { label: "Mensaje", emoji: "💬" },
  perfil: { label: "Perfil", emoji: "👤" },
  conversacion: { label: "Conversación", emoji: "💬" },
};

const ROLE_CONFIG: any = {
  admin: { label: "Admin", color: "#f59e0b", bg: "#fef3c7" },
  supervisor: { label: "Supervisor", color: "#6366f1", bg: "#e0e7ff" },
  moderator: { label: "Moderador", color: "#10b981", bg: "#d1fae5" },
};

const STATUS_CONFIG: any = {
  online: { label: "En línea", dot: "🟢", color: "#10b981" },
  busy: { label: "Ocupado", dot: "🟡", color: "#f59e0b" },
  away: { label: "Ausente", dot: "🌙", color: "#6b7280" },
  offline: { label: "Desconectado", dot: "⚫", color: "#9ca3af" },
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

// ─── Componentes ───────────────────────────────────────────────────────
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

// ─── Modal principal de asignación ────────────────────────────────────
interface AssignCasesModalProps {
  cases: Case[];
  onClose: () => void;
  onAssign: (assignments: { caseId: string; moderatorId: string }[]) => void;
}

export const AssignCasesModal = ({ cases, onClose, onAssign }: AssignCasesModalProps) => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [selectedModerator, setSelectedModerator] = useState<string | null>(null);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [smartAssign, setSmartAssign] = useState(false);
  const [autoBalance, setAutoBalance] = useState(true);

  // Filtrar casos pendientes sin asignar
  const unassignedCases = useMemo(() => {
    return cases.filter((caseItem) => caseItem.status === "pendiente" && !caseItem.assignedTo);
  }, [cases]);

  // Ordenar moderadores por carga de trabajo
  const sortedModerators = useMemo(() => {
    return [...MODERATORS_DATA].sort((a, b) => {
      if (autoBalance) {
        return a.activeCases - b.activeCases;
      }
      return a.totalResolved - b.totalResolved;
    });
  }, [autoBalance]);

  // Algoritmo de asignación inteligente
  const getSuggestedModerator = (caseItem: Case): string => {
    const availableMods = MODERATORS_DATA.filter(
      (mod) => mod.status === "online" || (mod.status === "away" && mod.activeCases < 2)
    );

    // Priorizar por especialidad y carga
    const scored = availableMods.map((mod) => {
      let score = 0;
      // Especialidad coincide
      const hasSpecialty = caseItem.tags.some((tag) =>
        mod.specialties.some((spec) => spec.includes(tag))
      );
      if (hasSpecialty) score += 30;
      
      // Menor carga activa = mayor score
      score += (5 - mod.activeCases) * 10;
      
      // Mayor experiencia = mayor score
      score += Math.min(mod.totalResolved / 10, 20);
      
      // Prioridad del caso afecta la urgencia (no el score directo)
      return { mod, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.mod.id || availableMods[0]?.id || MODERATORS_DATA[0].id;
  };

  // Asignación automática
  const handleSmartAssign = () => {
    const newAssignments = new Set<string>();
    unassignedCases.forEach((caseItem) => {
      const suggested = getSuggestedModerator(caseItem);
      newAssignments.add(suggested);
    });
    // En una implementación real, aquí se asignarían los casos
    setSmartAssign(true);
  };

  const handleAssignSelected = () => {
    if (!selectedModerator && !smartAssign) return;

    const assignments = Array.from(selectedCases).map((caseId) => ({
      caseId,
      moderatorId: smartAssign ? getSuggestedModerator(unassignedCases.find(c => c.id === caseId)!) : selectedModerator!,
    }));
    onAssign(assignments);
    onClose();
  };

  const toggleCase = (caseId: string) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId);
    } else {
      newSelected.add(caseId);
    }
    setSelectedCases(newSelected);
  };

  const selectAll = () => {
    if (selectedCases.size === unassignedCases.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(unassignedCases.map(c => c.id)));
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: "24px",
          width: "100%",
          maxWidth: "1100px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 28px 90px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            background: theme === "dark" ? "linear-gradient(135deg,#1a1a30,#0f0f22)" : "linear-gradient(135deg,#f8f9ff,#ffffff)",
            borderBottom: `1.5px solid ${c.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: c.text }}>
                📋 Asignar casos
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: c.textMuted }}>
                {unassignedCases.length} casos pendientes sin asignar
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                border: `1.5px solid ${c.border}`,
                background: c.card,
                cursor: "pointer",
                fontSize: "14px",
                color: c.textMuted,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Opciones de asignación */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1px solid ${c.border}`,
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
              background: c.accentSoft + "33",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoBalance}
                onChange={(e) => setAutoBalance(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: "12px", fontWeight: "600", color: c.text }}>
                ⚖️ Balancear carga de trabajo
              </span>
            </label>
            
            <button
              onClick={handleSmartAssign}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                background: c.accent,
                color: "#fff",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🤖 Asignación inteligente
            </button>

            <button
              onClick={selectAll}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                background: "transparent",
                border: `1.5px solid ${c.border}`,
                color: c.textMuted,
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {selectedCases.size === unassignedCases.length ? "📄 Deseleccionar todos" : "✅ Seleccionar todos"}
            </button>

            <span style={{ fontSize: "11px", color: c.textMuted, marginLeft: "auto" }}>
              {selectedCases.size} casos seleccionados
            </span>
          </div>

          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Panel de casos */}
            <div
              style={{
                flex: 1.5,
                borderRight: `1.5px solid ${c.border}`,
                overflow: "auto",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "700", color: c.textMuted, marginBottom: "12px", textTransform: "uppercase" }}>
                📋 Casos pendientes
              </div>
              
              {unassignedCases.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: c.textMuted }}>
                  🎉 No hay casos pendientes
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {unassignedCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      onClick={() => toggleCase(caseItem.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: `1.5px solid ${selectedCases.has(caseItem.id) ? c.accent : c.border}`,
                        background: selectedCases.has(caseItem.id) ? c.accentSoft : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <input
                          type="checkbox"
                          checked={selectedCases.has(caseItem.id)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "12px", fontWeight: "700", color: c.text }}>
                          {TYPE_CONFIG[caseItem.type]?.emoji} {caseItem.title}
                        </span>
                        <PriorityBadge priority={caseItem.priority} c={c} />
                      </div>
                      <div style={{ fontSize: "11px", color: c.textMuted, marginLeft: "24px" }}>
                        #{caseItem.id} · {caseItem.reportes} reportes · @{caseItem.author}
                      </div>
                      <div style={{ fontSize: "10px", color: c.border, marginLeft: "24px", marginTop: "4px" }}>
                        {caseItem.tags.map(t => `#${t}`).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de moderadores */}
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: c.textMuted, marginBottom: "12px", textTransform: "uppercase" }}>
                👥 Equipo de moderación
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {sortedModerators.map((mod) => {
                  const statusCfg = STATUS_CONFIG[mod.status];
                  const roleCfg = ROLE_CONFIG[mod.role];
                  const isSelected = selectedModerator === mod.id && !smartAssign;
                  
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        setSelectedModerator(mod.id);
                        setSmartAssign(false);
                      }}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: `1.5px solid ${isSelected ? c.accent : c.border}`,
                        background: isSelected ? c.accentSoft : "transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <UserAvatar username={mod.name} size={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: "800", color: c.text }}>
                              @{mod.name}
                            </span>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                background: roleCfg.bg,
                                color: roleCfg.color,
                              }}
                            >
                              {roleCfg.label}
                            </span>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: "700",
                                padding: "2px 6px",
                                borderRadius: "12px",
                                background: `${statusCfg.color}22`,
                                color: statusCfg.color,
                              }}
                            >
                              {statusCfg.dot} {statusCfg.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: "11px", color: c.textMuted, marginLeft: "46px" }}>
                        📊 {mod.activeCases} casos activos · ✅ {mod.totalResolved} resueltos
                      </div>
                      
                      <div style={{ marginLeft: "46px", marginTop: "6px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {mod.specialties.slice(0, 3).map(spec => (
                          <span
                            key={spec}
                            style={{
                              fontSize: "8px",
                              fontWeight: "600",
                              padding: "2px 6px",
                              borderRadius: "8px",
                              background: c.accentSoft,
                              color: c.accent,
                            }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1.5px solid ${c.border}`,
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            background: c.card,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.textMuted,
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleAssignSelected}
            disabled={selectedCases.size === 0 || (!selectedModerator && !smartAssign)}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              background: selectedCases.size > 0 && (selectedModerator || smartAssign) ? c.accent : c.border,
              color: selectedCases.size > 0 && (selectedModerator || smartAssign) ? "#fff" : c.textMuted,
              border: "none",
              fontSize: "13px",
              fontWeight: "800",
              cursor: selectedCases.size > 0 && (selectedModerator || smartAssign) ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {smartAssign ? "🤖 Asignar automáticamente" : "📌 Asignar a moderador"}
            {selectedCases.size > 0 && ` (${selectedCases.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};