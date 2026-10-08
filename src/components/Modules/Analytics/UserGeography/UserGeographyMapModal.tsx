import { useEffect, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import analyticsService from "../../../Services/Analytics/AnalyticsService";
import GeographySummary, { CountryPoint, GeographyPayload } from "./GeographySummary";
import UserGeographyMap from "./UserGeographyMap";

const PERIODS: { value: "all" | 7 | 30 | 90; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

const UserGeographyMapModal = ({ onClose }: { onClose: () => void }) => {
  const { theme } = useThemeContext();
  const c = (theme === "dark" ? Colors.dark : Colors.light).colors;
  const [period, setPeriod] = useState<"all" | 7 | 30 | 90>("all");
  const [data, setData] = useState<GeographyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setSelected(null);
    analyticsService
      .getUserGeography(period)
      .then((response) => {
        if (!active) return;
        setData(response.data);
      })
      .catch(() => {
        if (!active) return;
        setData(null);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  const selectedCountry =
    data?.countries.find((country) => country.country === selected) || null;

  const choose = (country: CountryPoint | null) => {
    setSelected(country?.country || null);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(2,6,23,.72)",
        backdropFilter: "blur(7px)",
        display: "grid",
        placeItems: "center",
        padding: fullscreen ? 0 : 16,
      }}
    >
      <style>{`
        @media (max-width: 860px) {
          .geo-layout { grid-template-columns: 1fr !important; }
          .geo-map { min-height: 320px !important; }
        }
      `}</style>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: fullscreen ? "100%" : "min(1180px, 100%)",
          height: fullscreen ? "100%" : "min(86vh, 860px)",
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: fullscreen ? 0 : 22,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Distribución geográfica de usuarios</div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4, maxWidth: 640 }}>
              Distribución de los registros de Aycoro según el país y la ciudad almacenados durante el registro.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {PERIODS.map((item) => (
              <button
                key={item.label}
                onClick={() => setPeriod(item.value)}
                style={{
                  border: `1px solid ${period === item.value ? c.accent : c.border}`,
                  background: period === item.value ? c.accentSoft : "transparent",
                  color: period === item.value ? c.accent : c.textMuted,
                  borderRadius: 10,
                  padding: "7px 10px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => setFullscreen((value) => !value)} style={{ border: `1px solid ${c.border}`, background: "transparent", color: c.text, borderRadius: 10, padding: "7px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
              {fullscreen ? "Salir" : "Pantalla completa"}
            </button>
            <button onClick={onClose} style={{ border: 0, background: c.accentSoft, color: c.text, width: 34, height: 34, borderRadius: 10, cursor: "pointer" }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, padding: 14 }}>
          {loading && (
            <div style={{ height: "100%", display: "grid", placeItems: "center", color: c.textMuted }}>
              Cargando distribución geográfica...
            </div>
          )}
          {!loading && error && (
            <div style={{ height: "100%", display: "grid", placeItems: "center", color: c.textMuted }}>
              No se pudo cargar la distribución geográfica.
            </div>
          )}
          {!loading && !error && data && data.summary.users === 0 && (
            <div style={{ height: "100%", display: "grid", placeItems: "center", color: c.textMuted }}>
              No hay suficientes datos geográficos para este período.
            </div>
          )}
          {!loading && !error && data && data.summary.users > 0 && (
            <div className="geo-layout" style={{ height: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 14 }}>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="geo-map" style={{ flex: 1, minHeight: 420, borderRadius: 16, overflow: "hidden", border: `1px solid ${c.border}` }}>
                  <UserGeographyMap
                    countries={data.countries}
                    selectedCountry={selected}
                    onSelect={setSelected}
                  />
                </div>
                <div style={{ fontSize: 10, color: c.textMuted }}>Tamaño del punto = cantidad de registros</div>
              </div>
              <GeographySummary
                data={data}
                selected={selectedCountry}
                onSelect={choose}
                c={c}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserGeographyMapModal;
