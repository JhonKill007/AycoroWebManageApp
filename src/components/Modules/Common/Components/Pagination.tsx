
export const Pagination = ({
  page,
  totalPages,
  itemsPerPage,
  totalItems,
  search,
  setPage,
  c,
  theme,
}: {
  page: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  search: string;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  c: any;
  theme: string;
}) => {
  return (
    <div
      style={{
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      {/* Info */}
      <span style={{ fontSize: "11px", color: c.textMuted }}>
        Mostrando <strong style={{ color: c.text }}>{itemsPerPage * page}</strong>{" "}
        de <strong style={{ color: c.text }}>{totalItems}</strong> registros
        {search && ` (filtrados por "${search}")`}
      </span>

      {/* Controles de página */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Anterior */}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: `1.5px solid ${page === 1 ? c.border : c.border}`,
            background: "transparent",
            color: page === 1 ? c.border : c.textMuted,
            fontSize: "14px",
            cursor: page === 1 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            if (page > 1) e.currentTarget.style.borderColor = c.accent;
            e.currentTarget.style.color = page > 1 ? c.accent : c.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = c.border;
            e.currentTarget.style.color = page === 1 ? c.border : c.textMuted;
          }}
        >
          ‹
        </button>

        {/* Números de página */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                style={{
                  fontSize: "11px",
                  color: c.border,
                  padding: "0 2px",
                }}
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                style={{
                  minWidth: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  border: `1.5px solid ${page === p ? c.accent + "44" : c.border}`,
                  background: page === p ? c.accentMedium : "transparent",
                  color: page === p ? c.accent : c.textMuted,
                  fontSize: "11px",
                  fontWeight: page === p ? "800" : "600",
                  cursor: "pointer",
                  padding: "0 6px",
                  transition: "all 0.15s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (page !== p) {
                    e.currentTarget.style.borderColor = c.accent + "44";
                    e.currentTarget.style.color = c.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== p) {
                    e.currentTarget.style.borderColor = c.border;
                    e.currentTarget.style.color = c.textMuted;
                  }
                }}
              >
                {p}
              </button>
            ),
          )}

        {/* Siguiente */}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: `1.5px solid ${page === totalPages ? c.border : c.border}`,
            background: "transparent",
            color: page === totalPages ? c.border : c.textMuted,
            fontSize: "14px",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            if (page < totalPages) e.currentTarget.style.borderColor = c.accent;
            e.currentTarget.style.color =
              page < totalPages ? c.accent : c.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = c.border;
            e.currentTarget.style.color =
              page === totalPages ? c.border : c.textMuted;
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
};
