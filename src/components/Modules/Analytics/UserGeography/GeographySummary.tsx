export type CityPoint = {
  city: string;
  count: number;
  latitude: number | null;
  longitude: number | null;
};

export type CountryPoint = {
  country: string;
  count: number;
  latitude: number | null;
  longitude: number | null;
  cities: CityPoint[];
  unspecifiedCity: number;
  otherCities: number;
};

export type GeographyPayload = {
  summary: { users: number; countries: number; cities: number };
  period: string;
  countries: CountryPoint[];
};

type Colors = {
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentSoft: string;
  card: string;
};

const GeographySummary = ({
  data,
  selected,
  onSelect,
  c,
}: {
  data: GeographyPayload;
  selected: CountryPoint | null;
  onSelect: (country: CountryPoint | null) => void;
  c: Colors;
}) => {
  const total = data.summary.users || 1;
  const rows = selected ? selected.cities : data.countries;

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          ["Con ubicación", data.summary.users],
          ["Países", data.summary.countries],
          ["Ciudades", data.summary.cities],
        ].map(([label, value]) => (
          <div key={String(label)} style={{ background: c.accentSoft, border: `1px solid ${c.border}`, borderRadius: 12, padding: "10px 8px" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>{Number(value).toLocaleString()}</div>
            <div style={{ fontSize: 9, color: c.textMuted, fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: c.text }}>
          {selected ? "Principales ciudades" : "Principales países"}
        </div>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            style={{ border: 0, background: "transparent", color: c.accent, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
          >
            Ver países
          </button>
        )}
      </div>

      {selected && (
        <div style={{ fontSize: 11, color: c.textMuted, lineHeight: 1.45 }}>
          <strong style={{ color: c.text }}>{selected.country}</strong>
          <div>{selected.count.toLocaleString()} usuarios · {Math.round((selected.count / total) * 100)}% de los registros con ubicación</div>
        </div>
      )}

      <div style={{ overflowY: "auto", maxHeight: 360, display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.length === 0 && (
          <div style={{ fontSize: 12, color: c.textMuted }}>Sin ciudades con suficientes registros.</div>
        )}
        {rows.map((item, index) => {
          const name = "country" in item ? item.country : item.city;
          const active = selected?.country === name;
          return (
            <button
              key={name}
              onClick={() => {
                if ("country" in item) onSelect(active ? null : item);
              }}
              style={{
                textAlign: "left",
                border: `1px solid ${active ? c.accent : c.border}`,
                background: active ? c.accentSoft : "transparent",
                borderRadius: 10,
                padding: "8px 10px",
                cursor: "country" in item ? "pointer" : "default",
                color: c.text,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, fontWeight: 700 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {index + 1}. {name}
                </span>
                <span>{item.count.toLocaleString()}</span>
              </div>
            </button>
          );
        })}
        {selected && selected.otherCities > 0 && (
          <div style={{ fontSize: 11, color: c.textMuted, padding: "4px 2px" }}>
            Otras ciudades — {selected.otherCities.toLocaleString()}
          </div>
        )}
      </div>
    </aside>
  );
};

export default GeographySummary;
