import { useState } from "react";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { useThemeContext } from "../context/ThemeContext";
import { usePermissions } from "../hooks/usePermissions";
import RolesTab from "../Modules/Settings/Role/Components/RolesTab";
import { ManagersTab } from "../Modules/Settings/Team/Components/ManagersTab";
import VersionsTab from "../Modules/Settings/Version/Components/VersionsTab";

// ─── Secciones de configuración ───────────────────────────────────────
const SECTIONS = [
  { id: "general", label: "General", emoji: "⚙️", permission: Permissions.MANAGE_SETTINGS },
  { id: "apariencia", label: "Apariencia", emoji: "🎨", permission: Permissions.MANAGE_SETTINGS },
  { id: "comunidad", label: "Comunidad", emoji: "👥", permission: Permissions.MANAGE_SETTINGS },
  { id: "moderacion", label: "Moderación", emoji: "🛡️", permission: Permissions.MANAGE_SETTINGS },
  { id: "notificaciones", label: "Notificaciones", emoji: "🔔", permission: Permissions.MANAGE_SETTINGS },
  { id: "seguridad", label: "Seguridad", emoji: "🔐", permission: Permissions.MANAGE_SETTINGS },
  { id: "manager", label: "Manager", emoji: "👮", permission: Permissions.MANAGE_ADMINS },
  { id: "roles", label: "Roles", emoji: "🎭", permission: Permissions.MANAGE_ADMINS },
  { id: "versiones", label: "Versiones", emoji: "🚀", permission: Permissions.MANAGE_SETTINGS },
  { id: "peligro", label: "Zona de peligro", emoji: "⚠️", permission: Permissions.DANGER_ZONE },
];

// ─── Sub-componentes base ─────────────────────────────────────────────

function SectionTitle({ title, sub, c }: any) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <div style={{ fontSize: "16px", fontWeight: "800", color: c.text }}>
        {title}
      </div>
      {sub && (
        <div style={{ fontSize: "12px", color: c.textMuted, marginTop: "3px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, description, children, c }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "16px 0",
        borderBottom: `1px solid ${c.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: c.text }}>
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: "11px",
              color: c.textMuted,
              marginTop: "2px",
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, c }: any) {
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

function TextInput({ value, onChange, placeholder, c, type = "text" }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: c.inputBackground,
        border: `1.5px solid ${c.inputBorder}`,
        borderRadius: "10px",
        padding: "8px 14px",
        fontSize: "12px",
        color: c.text,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        outline: "none",
        width: "240px",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = c.accent)}
      onBlur={(e) => (e.target.style.borderColor = c.inputBorder)}
    />
  );
}

function SelectInput({ value, onChange, options, c }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: c.inputBackground,
        border: `1.5px solid ${c.inputBorder}`,
        borderRadius: "10px",
        padding: "8px 14px",
        fontSize: "12px",
        fontWeight: "600",
        color: c.text,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        outline: "none",
        cursor: "pointer",
        minWidth: "180px",
        transition: "border-color 0.2s",
      }}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SaveButton({ onClick, saved, c }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 22px",
        borderRadius: "12px",
        background: saved ? c.successSoft : c.accent,
        color: saved ? c.success : "#fff",
        border: saved ? `1.5px solid ${c.success}44` : "none",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        boxShadow: saved ? "none" : "0 4px 16px rgba(107,115,240,0.35)",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {saved ? "✅ Guardado" : "💾 Guardar cambios"}
    </button>
  );
}

function DangerButton({ label, description, btnLabel, onClick, c }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        padding: "16px",
        borderRadius: "14px",
        border: `1.5px solid ${c.danger}33`,
        background: c.dangerSoft,
      }}
    >
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: c.text }}>
          {label}
        </div>
        <div style={{ fontSize: "11px", color: c.textMuted, marginTop: "2px" }}>
          {description}
        </div>
      </div>
      <button
        onClick={onClick}
        style={{
          padding: "8px 16px",
          borderRadius: "10px",
          background: "transparent",
          border: `1.5px solid ${c.danger}`,
          color: c.danger,
          fontSize: "12px",
          fontWeight: "700",
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          whiteSpace: "nowrap",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e: any) => {
          e.target.style.background = c.danger;
          e.target.style.color = "#fff";
        }}
        onMouseLeave={(e: any) => {
          e.target.style.background = "transparent";
          e.target.style.color = c.danger;
        }}
      >
        {btnLabel}
      </button>
    </div>
  );
}

function ColorSwatch({ color, active, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: color,
        cursor: "pointer",
        border: active ? "3px solid white" : "3px solid transparent",
        outline: active ? `3px solid ${color}` : "3px solid transparent",
        transition: "all 0.15s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    />
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  c,
  theme,
}: any) {
  if (!title) return null;
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.42)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: "20px",
          padding: "28px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            textAlign: "center",
            marginBottom: "12px",
          }}
        >
          ⚠️
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "800",
            color: c.text,
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: c.textMuted,
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: "22px",
          }}
        >
          {message}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "12px",
              border: `1.5px solid ${c.border}`,
              background: "transparent",
              color: c.textMuted,
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "12px",
              border: "none",
              background: c.danger,
              color: "#fff",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: "0 4px 14px rgba(248,113,113,0.4)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Paneles de sección ───────────────────────────────────────────────

function GeneralPanel({ c, theme }: any) {
  const [appName, setAppName] = useState("Aycoro");
  const [appDesc, setAppDesc] = useState(
    "La comunidad que conecta personas reales.",
  );
  const [supportEmail, setSupportEmail] = useState("soporte@aycoro.app");
  const [timezone, setTimezone] = useState("America/Mexico_City");
  const [language, setLanguage] = useState("es");
  const [maintenance, setMaintenance] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle
        title="Configuración general"
        sub="Información básica de la plataforma Aycoro."
        c={c}
      />

      {/* App info */}
      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <SettingRow
          label="Nombre de la app"
          description="Nombre visible en toda la plataforma."
          c={c}
        >
          <TextInput
            value={appName}
            onChange={setAppName}
            placeholder="Aycoro"
            c={c}
          />
        </SettingRow>
        <SettingRow
          label="Descripción"
          description="Descripción corta de la comunidad."
          c={c}
        >
          <TextInput
            value={appDesc}
            onChange={setAppDesc}
            placeholder="Descripción..."
            c={c}
          />
        </SettingRow>
        <SettingRow
          label="Email de soporte"
          description="Dirección de contacto para usuarios."
          c={c}
        >
          <TextInput
            value={supportEmail}
            onChange={setSupportEmail}
            placeholder="soporte@..."
            c={c}
            type="email"
          />
        </SettingRow>
      </div>

      {/* Localización */}
      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <SettingRow
          label="Zona horaria"
          description="Usada para logs y notificaciones programadas."
          c={c}
        >
          <SelectInput
            value={timezone}
            onChange={setTimezone}
            c={c}
            options={[
              { value: "America/Mexico_City", label: "🇲🇽 CDMX (UTC-6)" },
              { value: "America/Bogota", label: "🇨🇴 Bogotá (UTC-5)" },
              { value: "America/Santiago", label: "🇨🇱 Santiago (UTC-4)" },
              { value: "Europe/Madrid", label: "🇪🇸 Madrid (UTC+1)" },
              { value: "America/New_York", label: "🇺🇸 New York (UTC-5)" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Idioma del panel"
          description="Idioma de la interfaz administrativa."
          c={c}
        >
          <SelectInput
            value={language}
            onChange={setLanguage}
            c={c}
            options={[
              { value: "es", label: "🇪🇸 Español" },
              { value: "en", label: "🇺🇸 English" },
              { value: "pt", label: "🇧🇷 Português" },
            ]}
          />
        </SettingRow>
      </div>

      {/* Estado */}
      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "24px",
        }}
      >
        <SettingRow
          label="Registro abierto"
          description="Permitir que nuevos usuarios se registren."
          c={c}
        >
          <Toggle
            value={registrationOpen}
            onChange={setRegistrationOpen}
            c={c}
          />
        </SettingRow>
        <SettingRow
          label="Modo mantenimiento"
          description="Muestra una página de mantenimiento a los usuarios."
          c={c}
        >
          <Toggle value={maintenance} onChange={setMaintenance} c={c} />
        </SettingRow>
      </div>

      {maintenance && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: c.warningSoft,
            border: `1.5px solid ${c.warning}33`,
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <div
            style={{ fontSize: "12px", color: c.warning, fontWeight: "600" }}
          >
            El modo mantenimiento está activo. Los usuarios no pueden acceder a
            la plataforma.
          </div>
        </div>
      )}

      <SaveButton onClick={handleSave} saved={saved} c={c} />
    </div>
  );
}

function AparienciaPanel({ c, theme }: any) {
  const accentColors = [
    "#6b73f0",
    "#f04f6b",
    "#34d399",
    "#fbbf24",
    "#60a5fa",
    "#a78bfa",
    "#fb923c",
    "#e879f9",
  ];
  const [accentColor, setAccentColor] = useState("#6b73f0");
  const [borderRadius, setBorderRadius] = useState("16");
  const [density, setDensity] = useState("normal");
  const [fontScale, setFontScale] = useState("base");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle
        title="Apariencia"
        sub="Personaliza el aspecto visual del panel de administración."
        c={c}
      />

      {/* Color de acento */}
      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: c.text,
            marginBottom: "4px",
          }}
        >
          Color de acento
        </div>
        <div
          style={{ fontSize: "11px", color: c.textMuted, marginBottom: "14px" }}
        >
          Color principal del panel de administración.
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {accentColors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              active={accentColor === color}
              onClick={() => setAccentColor(color)}
            />
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "8px",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: accentColor,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: c.accent,
                fontFamily: "monospace",
              }}
            >
              {accentColor}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <SettingRow
          label="Radio de bordes"
          description="Qué tan redondeados son los elementos."
          c={c}
        >
          <SelectInput
            value={borderRadius}
            onChange={setBorderRadius}
            c={c}
            options={[
              { value: "8", label: "Cuadrado (8px)" },
              { value: "12", label: "Suave (12px)" },
              { value: "16", label: "Redondeado (16px)" },
              { value: "24", label: "Muy redondo (24px)" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Densidad de interfaz"
          description="Controla el espacio entre elementos."
          c={c}
        >
          <SelectInput
            value={density}
            onChange={setDensity}
            c={c}
            options={[
              { value: "compact", label: "Compacto" },
              { value: "normal", label: "Normal" },
              { value: "spacious", label: "Espacioso" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Tamaño de fuente"
          description="Escala base de tipografía."
          c={c}
        >
          <SelectInput
            value={fontScale}
            onChange={setFontScale}
            c={c}
            options={[
              { value: "sm", label: "Pequeño (13px)" },
              { value: "base", label: "Normal (14px)" },
              { value: "lg", label: "Grande (16px)" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Sidebar colapsado por defecto"
          description="El menú lateral inicia cerrado."
          c={c}
        >
          <Toggle
            value={sidebarCollapsed}
            onChange={setSidebarCollapsed}
            c={c}
          />
        </SettingRow>
        <SettingRow
          label="Animaciones"
          description="Transiciones y efectos visuales en la interfaz."
          c={c}
        >
          <Toggle value={animations} onChange={setAnimations} c={c} />
        </SettingRow>
      </div>

      <SaveButton onClick={handleSave} saved={saved} c={c} />
    </div>
  );
}

function ComunidadPanel({ c, theme }: any) {
  const [maxPostLength, setMaxPostLength] = useState("2000");
  const [maxBioLength, setMaxBioLength] = useState("160");
  const [allowImages, setAllowImages] = useState(true);
  const [allowVideos, setAllowVideos] = useState(true);
  const [allowPolls, setAllowPolls] = useState(true);
  const [requireVerify, setRequireVerify] = useState(false);
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [spamDetection, setSpamDetection] = useState(true);
  const [guestView, setGuestView] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle
        title="Configuración de comunidad"
        sub="Controla qué puede hacer tu comunidad en Aycoro."
        c={c}
      />

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <SettingRow
          label="Longitud máxima de publicación"
          description="Caracteres permitidos por publicación."
          c={c}
        >
          <SelectInput
            value={maxPostLength}
            onChange={setMaxPostLength}
            c={c}
            options={[
              { value: "500", label: "500 caracteres" },
              { value: "1000", label: "1,000 caracteres" },
              { value: "2000", label: "2,000 caracteres" },
              { value: "5000", label: "5,000 caracteres" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Longitud máxima de bio"
          description="Caracteres en el perfil de usuario."
          c={c}
        >
          <SelectInput
            value={maxBioLength}
            onChange={setMaxBioLength}
            c={c}
            options={[
              { value: "80", label: "80 caracteres" },
              { value: "160", label: "160 caracteres" },
              { value: "280", label: "280 caracteres" },
            ]}
          />
        </SettingRow>
      </div>

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <SettingRow
          label="Publicar imágenes"
          description="Los usuarios pueden adjuntar imágenes."
          c={c}
        >
          <Toggle value={allowImages} onChange={setAllowImages} c={c} />
        </SettingRow>
        <SettingRow
          label="Publicar videos"
          description="Los usuarios pueden subir y compartir videos."
          c={c}
        >
          <Toggle value={allowVideos} onChange={setAllowVideos} c={c} />
        </SettingRow>
        <SettingRow
          label="Crear encuestas"
          description="Los usuarios pueden crear encuestas en sus posts."
          c={c}
        >
          <Toggle value={allowPolls} onChange={setAllowPolls} c={c} />
        </SettingRow>
        <SettingRow
          label="Requerir verificación de email"
          description="Los nuevos usuarios deben verificar su correo."
          c={c}
        >
          <Toggle value={requireVerify} onChange={setRequireVerify} c={c} />
        </SettingRow>
        <SettingRow
          label="Vista de invitados"
          description="Personas sin cuenta pueden ver publicaciones públicas."
          c={c}
        >
          <Toggle value={guestView} onChange={setGuestView} c={c} />
        </SettingRow>
      </div>

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "24px",
        }}
      >
        <SettingRow
          label="Filtro de lenguaje"
          description="Detecta y oculta automáticamente lenguaje ofensivo."
          c={c}
        >
          <Toggle value={profanityFilter} onChange={setProfanityFilter} c={c} />
        </SettingRow>
        <SettingRow
          label="Detección de spam"
          description="Bloquea automáticamente contenido spam mediante IA."
          c={c}
        >
          <Toggle value={spamDetection} onChange={setSpamDetection} c={c} />
        </SettingRow>
      </div>

      <SaveButton onClick={handleSave} saved={saved} c={c} />
    </div>
  );
}

function ModeracionPanel({ c, theme }: any) {
  const [autoFlagReports, setAutoFlagReports] = useState("3");
  const [autoBanReports, setAutoBanReports] = useState("10");
  const [reviewQueue, setReviewQueue] = useState(true);
  const [autoReview, setAutoReview] = useState(false);
  const [notifyMods, setNotifyMods] = useState(true);
  const [strikePolicy, setStrikePolicy] = useState("3");
  const [appealWindow, setAppealWindow] = useState("7");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle
        title="Reglas de moderación"
        sub="Define los umbrales y políticas automáticas de moderación."
        c={c}
      />

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <SettingRow
          label="Reportes para bandera automática"
          description="Con cuántos reportes se envía un contenido a revisión."
          c={c}
        >
          <SelectInput
            value={autoFlagReports}
            onChange={setAutoFlagReports}
            c={c}
            options={[
              { value: "1", label: "1 reporte" },
              { value: "3", label: "3 reportes" },
              { value: "5", label: "5 reportes" },
              { value: "10", label: "10 reportes" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Reportes para ban automático"
          description="Umbral para ban automático pendiente de revisión."
          c={c}
        >
          <SelectInput
            value={autoBanReports}
            onChange={setAutoBanReports}
            c={c}
            options={[
              { value: "5", label: "5 reportes" },
              { value: "10", label: "10 reportes" },
              { value: "20", label: "20 reportes" },
              { value: "0", label: "Desactivado" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Política de strikes"
          description="Cuántas advertencias antes de suspensión automática."
          c={c}
        >
          <SelectInput
            value={strikePolicy}
            onChange={setStrikePolicy}
            c={c}
            options={[
              { value: "1", label: "1 strike → suspensión" },
              { value: "3", label: "3 strikes → suspensión" },
              { value: "5", label: "5 strikes → suspensión" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Ventana de apelación (días)"
          description="Días que tiene un usuario para apelar una sanción."
          c={c}
        >
          <SelectInput
            value={appealWindow}
            onChange={setAppealWindow}
            c={c}
            options={[
              { value: "3", label: "3 días" },
              { value: "7", label: "7 días" },
              { value: "14", label: "14 días" },
              { value: "30", label: "30 días" },
            ]}
          />
        </SettingRow>
      </div>

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "24px",
        }}
      >
        <SettingRow
          label="Cola de revisión manual"
          description="Los reportes van a una cola antes de procesarse."
          c={c}
        >
          <Toggle value={reviewQueue} onChange={setReviewQueue} c={c} />
        </SettingRow>
        <SettingRow
          label="Moderación automática por IA"
          description="Permite que la IA tome decisiones sin revisión humana."
          c={c}
        >
          <Toggle value={autoReview} onChange={setAutoReview} c={c} />
        </SettingRow>
        <SettingRow
          label="Notificar a moderadores"
          description="Alertar al equipo cuando hay nuevos casos críticos."
          c={c}
        >
          <Toggle value={notifyMods} onChange={setNotifyMods} c={c} />
        </SettingRow>
      </div>

      <SaveButton onClick={handleSave} saved={saved} c={c} />
    </div>
  );
}

function NotificacionesPanel({ c, theme }: any) {
  const [emailReports, setEmailReports] = useState(true);
  const [emailNewUsers, setEmailNewUsers] = useState(false);
  const [emailWeekly, setEmailWeekly] = useState(true);
  const [pushCritical, setPushCritical] = useState(true);
  const [pushReviews, setPushReviews] = useState(true);
  const [pushMarketing, setPushMarketing] = useState(false);
  const [digestFreq, setDigestFreq] = useState("daily");
  const [adminEmail, setAdminEmail] = useState("admin@aycoro.app");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle
        title="Notificaciones"
        sub="Configura cuándo y cómo se te notifica como administrador."
        c={c}
      />

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "14px 0 10px",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: c.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            📧 Email
          </div>
        </div>
        <SettingRow
          label="Email de administración"
          description="Dirección donde se envían las notificaciones."
          c={c}
        >
          <TextInput
            value={adminEmail}
            onChange={setAdminEmail}
            placeholder="admin@..."
            c={c}
            type="email"
          />
        </SettingRow>
        <SettingRow
          label="Reportes críticos"
          description="Recibir email cuando hay reportes de prioridad crítica."
          c={c}
        >
          <Toggle value={emailReports} onChange={setEmailReports} c={c} />
        </SettingRow>
        <SettingRow
          label="Nuevos registros"
          description="Notificación cuando se registra un nuevo usuario."
          c={c}
        >
          <Toggle value={emailNewUsers} onChange={setEmailNewUsers} c={c} />
        </SettingRow>
        <SettingRow
          label="Resumen semanal"
          description="Reporte semanal de métricas y actividad."
          c={c}
        >
          <Toggle value={emailWeekly} onChange={setEmailWeekly} c={c} />
        </SettingRow>
        <SettingRow
          label="Frecuencia del digest"
          description="Con qué frecuencia recibir el resumen de actividad."
          c={c}
        >
          <SelectInput
            value={digestFreq}
            onChange={setDigestFreq}
            c={c}
            options={[
              { value: "realtime", label: "En tiempo real" },
              { value: "hourly", label: "Cada hora" },
              { value: "daily", label: "Diario" },
              { value: "weekly", label: "Semanal" },
            ]}
          />
        </SettingRow>
      </div>

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "14px 0 10px",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: c.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            🔔 Push
          </div>
        </div>
        <SettingRow
          label="Casos críticos"
          description="Notificación push para reportes de prioridad crítica."
          c={c}
        >
          <Toggle value={pushCritical} onChange={setPushCritical} c={c} />
        </SettingRow>
        <SettingRow
          label="Solicitudes de revisión"
          description="Cuando un contenido entra a revisión manual."
          c={c}
        >
          <Toggle value={pushReviews} onChange={setPushReviews} c={c} />
        </SettingRow>
        <SettingRow
          label="Actualizaciones del producto"
          description="Novedades y mejoras de la plataforma."
          c={c}
        >
          <Toggle value={pushMarketing} onChange={setPushMarketing} c={c} />
        </SettingRow>
      </div>

      <SaveButton onClick={handleSave} saved={saved} c={c} />
    </div>
  );
}

function SeguridadPanel({ c, theme }: any) {
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("8");
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [auditLog, setAuditLog] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState("5");
  const [passwordPolicy, setPasswordPolicy] = useState("strong");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle
        title="Seguridad"
        sub="Configura las medidas de seguridad del panel de administración."
        c={c}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderRadius: "12px",
          background: c.successSoft,
          border: `1.5px solid ${c.success}33`,
          marginBottom: "20px",
        }}
      >
        <span style={{ fontSize: "18px" }}>🔒</span>
        <div style={{ fontSize: "12px", color: c.success, fontWeight: "600" }}>
          Tu panel está protegido. Todas las configuraciones críticas de
          seguridad están activas.
        </div>
      </div>

      <div
        style={{
          background:
            theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "16px",
          padding: "4px 20px",
          marginBottom: "20px",
        }}
      >
        <SettingRow
          label="Autenticación de dos factores"
          description="Requerido para todos los administradores."
          c={c}
        >
          <Toggle value={twoFactor} onChange={setTwoFactor} c={c} />
        </SettingRow>
        <SettingRow
          label="Tiempo de sesión (horas)"
          description="Sesiones inactivas se cierran automáticamente."
          c={c}
        >
          <SelectInput
            value={sessionTimeout}
            onChange={setSessionTimeout}
            c={c}
            options={[
              { value: "1", label: "1 hora" },
              { value: "4", label: "4 horas" },
              { value: "8", label: "8 horas" },
              { value: "24", label: "24 horas" },
              { value: "0", label: "Nunca" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Intentos de login máximos"
          description="Bloquea IP tras N intentos fallidos."
          c={c}
        >
          <SelectInput
            value={loginAttempts}
            onChange={setLoginAttempts}
            c={c}
            options={[
              { value: "3", label: "3 intentos" },
              { value: "5", label: "5 intentos" },
              { value: "10", label: "10 intentos" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Política de contraseñas"
          description="Nivel de complejidad requerido."
          c={c}
        >
          <SelectInput
            value={passwordPolicy}
            onChange={setPasswordPolicy}
            c={c}
            options={[
              { value: "basic", label: "Básica (8 chars)" },
              { value: "medium", label: "Media (mayús + números)" },
              { value: "strong", label: "Fuerte (+ símbolos)" },
            ]}
          />
        </SettingRow>
        <SettingRow
          label="Whitelist de IPs"
          description="Solo permitir acceso desde IPs aprobadas."
          c={c}
        >
          <Toggle value={ipWhitelist} onChange={setIpWhitelist} c={c} />
        </SettingRow>
        <SettingRow
          label="Log de auditoría"
          description="Registrar todas las acciones administrativas."
          c={c}
        >
          <Toggle value={auditLog} onChange={setAuditLog} c={c} />
        </SettingRow>
      </div>

      <SaveButton onClick={handleSave} saved={saved} c={c} />
    </div>
  );
}

function IntegracionesPanel({ c, theme }: any) {
  const integrations = [
    {
      id: "slack",
      name: "Slack",
      desc: "Recibe alertas de moderación en Slack.",
      emoji: "💬",
      connected: true,
      color: "#4A154B",
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      desc: "Envío de emails transaccionales.",
      emoji: "📧",
      connected: true,
      color: "#1A82E2",
    },
    {
      id: "analytics",
      name: "GA4",
      desc: "Google Analytics 4 para métricas de usuario.",
      emoji: "📊",
      connected: false,
      color: "#E37400",
    },
    {
      id: "sentry",
      name: "Sentry",
      desc: "Monitoreo de errores en tiempo real.",
      emoji: "🐛",
      connected: false,
      color: "#F55138",
    },
    {
      id: "stripe",
      name: "Stripe",
      desc: "Pagos y suscripciones premium.",
      emoji: "💳",
      connected: false,
      color: "#6772E5",
    },
    {
      id: "cloudinary",
      name: "Cloudinary",
      desc: "CDN y optimización de imágenes y videos.",
      emoji: "🖼️",
      connected: true,
      color: "#3448C5",
    },
  ];

  const [states, setStates] = useState<any>(
    integrations.reduce((acc, i) => ({ ...acc, [i.id]: i.connected }), {}),
  );

  return (
    <div>
      <SectionTitle
        title="Integraciones"
        sub="Conecta servicios externos con tu panel de Aycoro."
        c={c}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "14px",
        }}
      >
        {integrations.map((intg: any) => (
          <div
            key={intg.id}
            style={{
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
              border: `1.5px solid ${states[intg.id] ? intg.color + "44" : c.border}`,
              borderRadius: "16px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              transition: "border-color 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    background: `${intg.color}22`,
                    border: `1.5px solid ${intg.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  {intg.emoji}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "800",
                      color: c.text,
                    }}
                  >
                    {intg.name}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: states[intg.id] ? intg.color : c.textMuted,
                      fontWeight: "600",
                    }}
                  >
                    {states[intg.id] ? "✅ Conectado" : "⚪ Sin conectar"}
                  </div>
                </div>
              </div>
              <Toggle
                value={states[intg.id]}
                onChange={(v: any) =>
                  setStates((prev: any) => ({ ...prev, [intg.id]: v }))
                }
                c={c}
              />
            </div>
            <div
              style={{ fontSize: "11px", color: c.textMuted, lineHeight: 1.5 }}
            >
              {intg.desc}
            </div>
            {states[intg.id] && (
              <button
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: `1.5px solid ${c.border}`,
                  color: c.textMuted,
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                ⚙️ Configurar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PeligroPanel({ c, theme, onDangerAction }: any) {
  return (
    <div>
      <SectionTitle
        title="Zona de peligro"
        sub="Estas acciones son irreversibles. Procede con extrema precaución."
        c={c}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <DangerButton
          label="Resetear todas las estadísticas"
          description="Borra todos los contadores y métricas acumuladas. No elimina usuarios ni contenido."
          btnLabel="Resetear stats"
          onClick={() => onDangerAction("stats")}
          c={c}
        />
        <DangerButton
          label="Purgar contenido eliminado"
          description="Elimina permanentemente los posts y mensajes marcados como 'eliminados'. Esta acción no se puede deshacer."
          btnLabel="Purgar ahora"
          onClick={() => onDangerAction("purge")}
          c={c}
        />
        <DangerButton
          label="Exportar todos los datos"
          description="Descarga un archivo con todos los datos de usuarios, publicaciones y conversaciones en formato JSON."
          btnLabel="Exportar datos"
          onClick={() => onDangerAction("export")}
          c={c}
        />
        <DangerButton
          label="Suspender la comunidad"
          description="Cierra temporalmente el acceso a todos los usuarios excepto administradores."
          btnLabel="Suspender app"
          onClick={() => onDangerAction("suspend")}
          c={c}
        />
        <DangerButton
          label="Eliminar toda la comunidad"
          description="Elimina permanentemente todos los datos, usuarios y contenido. Esta acción es completamente irreversible."
          btnLabel="Eliminar todo"
          onClick={() => onDangerAction("delete")}
          c={c}
        />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────
const Settings = () => {
  const { theme } = useThemeContext();
  const { can } = usePermissions();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const visibleSections = SECTIONS.filter((section) => can(section.permission));

  const [activeSection, setActiveSection] = useState(
    () => visibleSections[0]?.id || "general",
  );
  const [confirmModal, setConfirmModal] = useState(null);

  const dangerMessages: any = {
    stats: {
      title: "¿Resetear estadísticas?",
      message:
        "Se borrarán todos los contadores y métricas. Esta acción no puede deshacerse.",
      confirmLabel: "Sí, resetear",
    },
    purge: {
      title: "¿Purgar contenido eliminado?",
      message:
        "Se eliminarán permanentemente todos los posts marcados como eliminados. Sin posibilidad de recuperación.",
      confirmLabel: "Purgar ahora",
    },
    export: {
      title: "¿Exportar todos los datos?",
      message:
        "Se generará un archivo con todos los datos de la plataforma. Puede tomar varios minutos.",
      confirmLabel: "Exportar",
    },
    suspend: {
      title: "¿Suspender la comunidad?",
      message:
        "Los usuarios no podrán acceder hasta que reactives la plataforma manualmente.",
      confirmLabel: "Suspender",
    },
    delete: {
      title: "⚠️ ¿Eliminar TODA la comunidad?",
      message:
        "Esta acción borrará PERMANENTEMENTE todos los usuarios, publicaciones y conversaciones. NO HAY VUELTA ATRÁS.",
      confirmLabel: "Eliminar todo",
    },
  };

  const handleDangerAction = (key: any) => setConfirmModal(key);

  const renderPanel = () => {
    switch (activeSection) {
      case "general":
        return <GeneralPanel c={c} theme={theme} />;
      case "apariencia":
        return <AparienciaPanel c={c} theme={theme} />;
      case "comunidad":
        return <ComunidadPanel c={c} theme={theme} />;
      case "moderacion":
        return <ModeracionPanel c={c} theme={theme} />;
      case "notificaciones":
        return <NotificacionesPanel c={c} theme={theme} />;
      case "seguridad":
        return <SeguridadPanel c={c} theme={theme} />;
      case "integraciones":
        return <IntegracionesPanel c={c} theme={theme} />;
      case "manager":
        return <ManagersTab c={c} theme={theme} />;
      case "roles":
        return <RolesTab c={c} theme={theme} />;
      case "versiones":
        return <VersionsTab c={c} theme={theme} />;
      case "peligro":
        return (
          <PeligroPanel
            c={c}
            theme={theme}
            onDangerAction={handleDangerAction}
          />
        );
      default:
        return null;
    }
  };

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

        .section-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 12px;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          border: 1.5px solid transparent;
          user-select: none;
        }
        .section-nav-item:hover { background: ${c.accentSoft}; }
        .section-nav-item.active {
          background: ${c.accentMedium};
          border-color: ${c.accent}33;
        }
        .section-nav-item.danger { color: ${c.danger}; }
        .section-nav-item.danger:hover { background: ${c.danger}; }
        .section-nav-item.danger.active { background: ${c.danger}; border-color: ${c.danger}33; }
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
          className="responsive-page-banner"
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
              ⚙️ Configuración
            </div>
            <div
              style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}
            >
              Administra todas las configuraciones de{" "}
              <strong style={{ color: c.accent }}>Aycoro</strong>. Los cambios
              se aplican inmediatamente.
            </div>
          </div>
          <button className="pill-cta">📤 Exportar config</button>
        </div>

        {/* ── Layout: Sidebar + Panel ── */}
        <div
          className="settings-responsive-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Nav de secciones */}
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "18px",
              padding: "10px",
              boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
              position: "sticky",
              top: "0",
            }}
          >
            {visibleSections.map((s, i) => {
              const isDanger = s.id === "peligro";
              const isActive = activeSection === s.id;
              return (
                <div key={s.id}>
                  {i === visibleSections.length - 1 && (
                    <div
                      className="settings-nav-divider"
                      style={{
                        height: "1px",
                        background: c.border,
                        margin: "8px 4px",
                      }}
                    />
                  )}
                  <div
                    className={`section-nav-item${isActive ? " active" : ""}${isDanger ? " danger" : ""}`}
                    onClick={() => setActiveSection(s.id)}
                  >
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>
                      {s.emoji}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: isActive ? "700" : "500",
                        color: isDanger
                          ? isActive
                            ? c.danger
                            : c.danger + "aa"
                          : isActive
                            ? c.accent
                            : c.text,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel de contenido */}
          <div
            style={{
              background: c.card,
              border: `1.5px solid ${c.border}`,
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 2px 16px rgba(107,115,240,0.06)",
              minHeight: "500px",
            }}
          >
            {renderPanel()}
          </div>
        </div>
      </main>

      {/* Modal de confirmación */}
      {confirmModal && (
        <ConfirmModal
          {...dangerMessages[confirmModal]}
          c={c}
          theme={theme}
          onConfirm={() => setConfirmModal(null)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </>
  );
};

export default Settings;
