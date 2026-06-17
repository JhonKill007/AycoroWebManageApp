// ─── Sub-componentes ──────────────────────────────────────────────────
export const KpiCard = ({ emoji, label, value, colorKey, c }: any) => {
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
          {value?.toLocaleString() || 0}
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: c.textMuted,
            marginTop: "1px",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
