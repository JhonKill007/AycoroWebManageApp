export const TabChip = ({ label, active, onClick, color, c }: any) => {
  const getColorStyles = () => {
    if (color === "success") return { bg: c.successSoft, text: c.success };
    if (color === "warning") return { bg: c.warningSoft, text: c.warning };
    if (color === "danger") return { bg: c.dangerSoft, text: c.danger };
    if (color === "info") return { bg: c.infoSoft, text: c.info };
    return { bg: c.accentMedium, text: c.accent };
  };

  const activeStyles = getColorStyles();

  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 13px",
        borderRadius: "20px",
        border: `1.5px solid ${active ? (color ? getColorStyles().text : c.accent + "44") : c.border}`,
        background: active
          ? color
            ? activeStyles.bg
            : c.accentMedium
          : "transparent",
        color: active ? (color ? activeStyles.text : c.accent) : c.textMuted,
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
};
