import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import { useUserContext } from "../context/UserContext";

const AccountAdmin = () => {
  const { theme } = useThemeContext();
  const { userData } = useUserContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const user = userData?.user;

  return (
    <main style={{ flex: 1, overflow: "auto", padding: 26, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 20,
          padding: 28,
          maxWidth: 560,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 6 }}>
          Mi cuenta
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 20 }}>
          Datos del manager con el que iniciaste sesión. El 2FA del login vive en AuthSystem, no en este panel.
        </div>
        {[
          ["Nombre", user?.name || "—"],
          ["Usuario", user?.username || "—"],
          ["Email", user?.email || "—"],
          ["Rol", user?.roleName || "Manager"],
          ["Permisos", `${user?.permissions?.length || 0} asignados`],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 0",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            <span style={{ fontSize: 12, color: c.textMuted }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{value}</span>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AccountAdmin;
