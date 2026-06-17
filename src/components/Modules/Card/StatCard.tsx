
const StatCard = ({ stat, c }: any) => {
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.border}`,
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        boxShadow: `0 2px 16px rgba(107,115,240,0.07)`,
        transition: "transform 0.15s",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: "22px" }}>{stat.emoji}</div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: "800",
          color: c.text,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        {stat.value}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
        }}
      >
        <span
          style={{ fontSize: "11px", color: c.textMuted, fontWeight: "500" }}
        >
          {stat.label}
        </span>
        {stat.trend !== null && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: stat.trend > 0 ? c.success : c.danger,
              background:
                stat.trend > 0
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(240,79,107,0.12)",
              padding: "2px 7px",
              borderRadius: "20px",
            }}
          >
            {stat.trend > 0 ? "↑" : "↓"} {Math.abs(stat.trend)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
