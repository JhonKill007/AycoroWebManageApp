import { useState } from "react";
import { Colors } from "../constants/Colors";
import { Permissions } from "../constants/Permissions";
import { useThemeContext } from "../context/ThemeContext";
import { usePermissions } from "../hooks/usePermissions";
import RolesTab from "../Modules/Settings/Role/Components/RolesTab";
import { ManagersTab } from "../Modules/Settings/Team/Components/ManagersTab";
import VersionsTab from "../Modules/Settings/Version/Components/VersionsTab";

const SECTIONS = [
  { id: "manager", label: "Manager", emoji: "👮", permission: Permissions.MANAGE_ADMINS },
  { id: "roles", label: "Roles", emoji: "🎭", permission: Permissions.MANAGE_ADMINS },
  { id: "versiones", label: "Versiones", emoji: "🚀", permission: Permissions.MANAGE_SETTINGS },
];

const Settings = () => {
  const { theme } = useThemeContext();
  const { can } = usePermissions();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const visibleSections = SECTIONS.filter((section) => can(section.permission));
  const [activeSection, setActiveSection] = useState(
    () => visibleSections[0]?.id || "versiones",
  );

  const renderPanel = () => {
    switch (activeSection) {
      case "manager":
        return <ManagersTab c={c} theme={theme} />;
      case "roles":
        return <RolesTab c={c} theme={theme} />;
      case "versiones":
        return <VersionsTab c={c} theme={theme} />;
      default:
        return (
          <div style={{ color: c.textMuted, fontSize: 13 }}>
            No tienes secciones de configuración disponibles.
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
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
      `}</style>
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "26px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
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
            boxShadow: "0 4px 24px rgba(107,115,240,0.09)",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: "800", color: c.text, marginBottom: "5px" }}>
            ⚙️ Configuración
          </div>
          <div style={{ fontSize: "13px", color: c.textMuted, lineHeight: 1.5 }}>
            Solo se muestran ajustes que el panel puede guardar: managers, roles y versiones.
          </div>
        </div>
        <div
          className="settings-responsive-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
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
            {visibleSections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <div
                  key={section.id}
                  className={`section-nav-item${isActive ? " active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span style={{ fontSize: "16px" }}>{section.emoji}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? c.accent : c.text,
                    }}
                  >
                    {section.label}
                  </span>
                </div>
              );
            })}
          </div>
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
    </>
  );
};

export default Settings;
