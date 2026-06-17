import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import { getUserStatusById } from "../Constants";

const UserStatusBadge = ({ status }: { status: number }) => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const cfg = getUserStatusById(status!);

  const map: any = {
    success: { bg: c.success, text: c.text },
    warning: { bg: c.warning, text: c.text },
    danger: { bg: c.danger, text: c.text },
    muted: { bg: c.accentSoft, text: c.textMuted },
  };

  const col = map[cfg?.color!];
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
      {cfg?.dot!} {cfg?.label!}
    </span>
  );
};

export default UserStatusBadge;
