import { useState } from "react";
import UserProfile from "../assets/UserProfile.jpeg";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import { useUserContext } from "../context/UserContext";
import { Badge } from "../Modules/Settings/Common/Badge";
import { SectionTitle } from "../Modules/Settings/Common/SectionTitle";

// ─── Datos mock ────────────────────────────────────────────────────────
const INITIAL_TEAM = [
  {
    id: 1,
    name: "Admin Principal",
    username: "admin",
    email: "admin@aycoro.app",
    role: "super_admin",
    status: "activo",
    avatar: "AD",
    color: "#6b73f0",
    joined: "2024-01-01",
    lastSeen: "Ahora",
    twoFA: true,
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    username: "carlos_m",
    email: "carlos@aycoro.app",
    role: "admin",
    status: "activo",
    avatar: "CM",
    color: "#7b83f5",
    joined: "2024-03-15",
    lastSeen: "Hace 8 min",
    twoFA: true,
  },
  {
    id: 3,
    name: "Lucía Vega",
    username: "lucia_v",
    email: "lucia@aycoro.app",
    role: "moderador",
    status: "activo",
    avatar: "LV",
    color: "#34d399",
    joined: "2024-05-20",
    lastSeen: "Hace 2h",
    twoFA: false,
  },
  {
    id: 4,
    name: "Pedro López",
    username: "pedro_lm",
    email: "pedro@aycoro.app",
    role: "moderador",
    status: "suspendido",
    avatar: "PL",
    color: "#fbbf24",
    joined: "2024-07-10",
    lastSeen: "Hace 3 días",
    twoFA: false,
  },
  {
    id: 5,
    name: "Ana Flores",
    username: "ana_f",
    email: "ana@aycoro.app",
    role: "soporte",
    status: "activo",
    avatar: "AF",
    color: "#f87171",
    joined: "2024-09-01",
    lastSeen: "Ayer",
    twoFA: true,
  },
];

const ROLES: any = {
  super_admin: {
    label: "Super Admin",
    emoji: "👑",
    color: "#6b73f0",
    desc: "Acceso total. Sin restricciones.",
  },
  admin: {
    label: "Admin",
    emoji: "⚡",
    color: "#7b83f5",
    desc: "Gestiona usuarios, contenido y configs.",
  },
  moderador: {
    label: "Moderador",
    emoji: "🛡️",
    color: "#34d399",
    desc: "Revisa reportes y modera contenido.",
  },
  soporte: {
    label: "Soporte",
    emoji: "🎧",
    color: "#fbbf24",
    desc: "Atiende usuarios. Sin acceso admin.",
  },
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
const getAC = (s = "") => AVATAR_PAL[s.charCodeAt(0) % AVATAR_PAL.length];

// ─── Tipos ─────────────────────────────────────────────────────────────
type TeamMember = (typeof INITIAL_TEAM)[0];
type RoleKey = keyof typeof ROLES;

function Avatar({
  initials,
  color,
  size = 36,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}22`,
        border: `2px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.3,
        fontWeight: 800,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Toggle({
  value,
  onChange,
  c,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  c: any;
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? c.accentMedium : c.border,
        border: `1.5px solid ${value ? c.accent : c.border}`,
        position: "relative",
        cursor: "pointer",
        transition: "all 0.25s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: value ? c.accent : c.textMuted,
          top: 1,
          left: value ? 21 : 1,
          transition: "left 0.25s, background 0.25s",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

function Checkbox({ checked, c }: { checked: boolean; c: any }) {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        background: checked ? c.accent : "transparent",
        border: `1.5px solid ${checked ? c.accent : c.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {checked && (
        <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>✓</span>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", c }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: c.inputBackground,
        border: `1.5px solid ${c.inputBorder}`,
        borderRadius: 10,
        padding: "9px 14px",
        fontSize: 12,
        color: c.text,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        outline: "none",
        width: "100%",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = c.accent)}
      onBlur={(e) => (e.target.style.borderColor = c.inputBorder)}
    />
  );
}

// ─── Modal invitar usuario ─────────────────────────────────────────────
// ─── Mock de usuarios buscables ───────────────────────────────────────
const SEARCHABLE_USERS = [
  {
    id: "USR-001",
    name: "María González",
    username: "maria_g",
    email: "maria@aycoro.app",
    avatar: "MG",
    color: "#7b83f5",
  },
  {
    id: "USR-002",
    name: "Pedro Ramírez",
    username: "pedro_r",
    email: "pedro@aycoro.app",
    avatar: "PR",
    color: "#34d399",
  },
  {
    id: "USR-003",
    name: "Lucía Fernández",
    username: "lucia_f",
    email: "lucia@aycoro.app",
    avatar: "LF",
    color: "#fbbf24",
  },
  {
    id: "USR-004",
    name: "Andrés Torres",
    username: "andres_t",
    email: "andres@aycoro.app",
    avatar: "AT",
    color: "#f87171",
  },
  {
    id: "USR-005",
    name: "Sofía Mendoza",
    username: "sofia_m",
    email: "sofia@aycoro.app",
    avatar: "SM",
    color: "#a78bfa",
  },
  {
    id: "USR-006",
    name: "Carlos Díaz",
    username: "carlos_d",
    email: "carlos@aycoro.app",
    avatar: "CD",
    color: "#60a5fa",
  },
  {
    id: "USR-007",
    name: "Valeria Ruiz",
    username: "vale_r",
    email: "valeria@aycoro.app",
    avatar: "VR",
    color: "#fb923c",
  },
];

// ─── Modal editar miembro ──────────────────────────────────────────────

// ─── Tab: Mi perfil ────────────────────────────────────────────────────
function ProfileTab({ c, theme }: { c: any; theme: string }) {
  const [saved, setSaved] = useState(false);
  const { userData } = useUserContext();

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle
        title="Mi perfil"
        sub="Información de tu cuenta de administrador."
        c={c}
      />

      {/* Avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "20px 24px",
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              boxShadow: "0 6px 20px rgba(107,115,240,0.4)",
            }}
          >
            <img
              src={
                userData?.profilePhoto ? userData?.profilePhoto : UserProfile
              }
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                objectFit: "cover",
                border: userData?.profilePhoto
                  ? `2px solid ${Colors.detailAppColor}`
                  : undefined,
              }}
            />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>
            {userData?.user?.name}
          </div>
          <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 6 }}>
            {userData?.user?.email}
          </div>
          <Badge idRole={userData?.user?.role!} />
        </div>
      </div>

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: 16,
          padding: "4px 20px",
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Nombre completo",
            val: userData?.user?.name,
          },
          {
            label: "Nombre de usuario",
            val: userData?.user?.username,
          },
          {
            label: "Email",
            val: userData?.user?.email,
          },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              padding: "14px 0",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                {f.label}
              </div>
            </div>
            <div style={{ width: 260 }}>
              <text style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                {f.val}
              </text>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        style={{
          padding: "9px 22px",
          borderRadius: 12,
          background: saved ? c.successSoft : c.accent,
          color: saved ? c.success : "#fff",
          border: saved ? `1.5px solid ${c.success}44` : "none",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          boxShadow: saved ? "none" : "0 4px 16px rgba(107,115,240,0.35)",
          transition: "all 0.2s",
        }}
      >
        {saved ? "✅ Guardado" : "💾 Guardar cambios"}
      </button>
    </div>
  );
}

// ─── Tab: Contraseña ───────────────────────────────────────────────────
function PasswordTab({ c, theme }: { c: any; theme: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const strength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const s = strength(next);
  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][s];
  const strengthColor = [c.border, c.danger, c.warning, c.info, c.success][s];

  const handle = () => {
    setError("");
    if (!current) return setError("Ingresa tu contraseña actual.");
    if (next.length < 8)
      return setError("La nueva contraseña debe tener al menos 8 caracteres.");
    if (next !== confirm) return setError("Las contraseñas no coinciden.");
    if (s < 2)
      return setError(
        "La contraseña es muy débil. Agrega mayúsculas, números o símbolos.",
      );
    setOk(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    setTimeout(() => setOk(false), 3000);
  };

  return (
    <div>
      <SectionTitle
        title="Cambiar contraseña"
        sub="Elige una contraseña segura y no la compartas con nadie."
        c={c}
      />

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 480,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: c.textMuted,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Contraseña actual
          </div>
          <TextInput
            value={current}
            onChange={setCurrent}
            placeholder="••••••••"
            type="password"
            c={c}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: c.textMuted,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Nueva contraseña
          </div>
          <TextInput
            value={next}
            onChange={setNext}
            placeholder="••••••••"
            type="password"
            c={c}
          />
          {next && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 3,
                      background: i <= s ? strengthColor : c.border,
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
              <div
                style={{ fontSize: 10, fontWeight: 600, color: strengthColor }}
              >
                {strengthLabel}
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {[
              { label: "Al menos 8 caracteres", ok: next.length >= 8 },
              { label: "Una letra mayúscula", ok: /[A-Z]/.test(next) },
              { label: "Un número", ok: /[0-9]/.test(next) },
              { label: "Un símbolo especial", ok: /[^A-Za-z0-9]/.test(next) },
            ].map((req) => (
              <div
                key={req.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  color: req.ok ? c.success : c.textMuted,
                }}
              >
                <span>{req.ok ? "✅" : "○"}</span> {req.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: c.textMuted,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Confirmar contraseña
          </div>
          <TextInput
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            type="password"
            c={c}
          />
          {confirm && next !== confirm && (
            <div style={{ fontSize: 10, color: c.danger, marginTop: 4 }}>
              ⚠️ Las contraseñas no coinciden
            </div>
          )}
          {confirm && next === confirm && next && (
            <div style={{ fontSize: 10, color: c.success, marginTop: 4 }}>
              ✅ Las contraseñas coinciden
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: c.dangerSoft,
              border: `1px solid ${c.danger}33`,
              fontSize: 12,
              color: c.danger,
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {ok && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: c.successSoft,
              border: `1px solid ${c.success}33`,
              fontSize: 12,
              color: c.success,
            }}
          >
            ✅ Contraseña actualizada correctamente.
          </div>
        )}
      </div>

      <button
        onClick={handle}
        style={{
          padding: "9px 22px",
          borderRadius: 12,
          background: c.accent,
          color: "#fff",
          border: "none",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          boxShadow: "0 4px 16px rgba(107,115,240,0.35)",
        }}
      >
        🔑 Actualizar contraseña
      </button>
    </div>
  );
}

// ─── Tab: Roles y permisos ─────────────────────────────────────────────

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────
const AccountAdmin = () => {
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;

  const [tab, setTab] = useState<"perfil" | "password" | "equipo" | "roles">(
    "perfil",
  );

  const TABS = [
    { id: "perfil", label: "👤 Mi perfil" },
    // { id: "password", label: "🔑 Contraseña" },
    // { id: "equipo", label: "👥 Equipo" },
    // { id: "roles", label: "🛡️ Roles y permisos" },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "26px",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        {/* Banner */}
        <div
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg,#1a1a30,#0f0f22)"
                : "linear-gradient(135deg,#ededff,#f5f0ff)",
            border: `1.5px solid ${c.accentMedium}`,
            borderRadius: 20,
            padding: "22px 28px",
            marginBottom: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            boxShadow: "0 4px 24px rgba(107,115,240,0.09)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6b73f0,#a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                boxShadow: "0 6px 20px rgba(107,115,240,0.4)",
              }}
            >
              <img
                src={
                  userData?.profilePhoto ? userData?.profilePhoto : UserProfile
                }
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: userData?.profilePhoto
                    ? `2px solid ${Colors.detailAppColor}`
                    : undefined,
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: c.text,
                  marginBottom: 4,
                }}
              >
                👤 Mi cuenta
              </div>
              <div style={{ fontSize: 13, color: c.textMuted }}>
                Gestiona tu perfil, contraseña,{" "}
                <strong style={{ color: c.accent }}>equipo</strong> y roles de
                acceso.
              </div>
            </div>
          </div>
          <Badge idRole={userData?.user?.role!} />
        </div>

        {/* Layout: tabs laterales + contenido */}
        <div
          style={{
            // display: "grid",
            // gridTemplateColumns: "200px 1fr",
            // gap: 20,
            alignItems: "start",
          }}
        >
          {/* Nav */}
          {/* <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 18,
              padding: 10,
              boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
              position: "sticky",
              top: 0,
            }}
          >
            {TABS.map((t) => (
              <div
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: tab === t.id ? c.accentMedium : "transparent",
                  border: `1.5px solid ${tab === t.id ? c.accent + "33" : "transparent"}`,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: tab === t.id ? 700 : 500,
                  color: tab === t.id ? c.accent : c.text,
                  transition: "all 0.15s",
                  marginBottom: 2,
                }}
              >
                {t.label}
              </div>
            ))}
          </div> */}

          {/* Panel */}
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: 18,
              padding: 28,
              boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
              minHeight: 500,
            }}
          >
            {tab === "perfil" && <ProfileTab c={c} theme={theme} />}
            {tab === "password" && <PasswordTab c={c} theme={theme} />}
          </div>
        </div>
      </main>
    </>
  );
};

export default AccountAdmin;
