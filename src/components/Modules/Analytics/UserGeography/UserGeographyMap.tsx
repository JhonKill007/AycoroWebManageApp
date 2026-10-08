import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CountryPoint } from "./GeographySummary";

const radiusFor = (count: number, max: number) => {
  const scale = Math.sqrt(count) / Math.sqrt(Math.max(max, 1));
  return 8 + scale * 28;
};

const FitView = ({
  points,
  focusKey,
  focus,
}: {
  points: [number, number][];
  focusKey: string;
  focus: [number, number] | null;
}) => {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo(focus, 6, { duration: 0.55 });
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 4);
      return;
    }
    if (points.length > 1) {
      map.fitBounds(points, { padding: [36, 36] });
    }
    // points is derived from focusKey; including the array would refit every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, map]);
  return null;
};

const UserGeographyMap = ({
  countries,
  selectedCountry,
  onSelect,
}: {
  countries: CountryPoint[];
  selectedCountry: string | null;
  onSelect: (country: string) => void;
}) => {
  const selected = countries.find((country) => country.country === selectedCountry) || null;
  const countryPoints = countries.filter(
    (country) => country.latitude != null && country.longitude != null,
  );
  const maxCountry = countryPoints[0]?.count || 1;
  const cityPoints = (selected?.cities || []).filter(
    (city) => city.latitude != null && city.longitude != null,
  );
  const maxCity = cityPoints[0]?.count || 1;
  const focus: [number, number] | null =
    selected?.latitude != null && selected.longitude != null
      ? [selected.latitude, selected.longitude]
      : null;
  const bounds = countryPoints.map(
    (country) => [country.latitude as number, country.longitude as number] as [number, number],
  );

  return (
    <MapContainer
      center={[18.7, -70.1]}
      zoom={3}
      style={{ width: "100%", height: "100%", background: "#0e1624" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitView
        points={bounds}
        focus={selected ? focus : null}
        focusKey={selected ? selected.country : "world"}
      />
      {!selected &&
        countryPoints.map((country) => (
          <CircleMarker
            key={country.country}
            center={[country.latitude as number, country.longitude as number]}
            radius={radiusFor(country.count, maxCountry)}
            pathOptions={{ color: "#4f46e5", fillColor: "#6b73f0", fillOpacity: 0.45, weight: 1 }}
            eventHandlers={{ click: () => onSelect(country.country) }}
          >
            <Tooltip>
              <div>
                <strong>{country.country}</strong>
                <div>{country.count.toLocaleString()} usuarios</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      {selected &&
        cityPoints.map((city) => (
          <CircleMarker
            key={city.city}
            center={[city.latitude as number, city.longitude as number]}
            radius={radiusFor(city.count, maxCity)}
            pathOptions={{ color: "#0f766e", fillColor: "#14b8a6", fillOpacity: 0.55, weight: 1 }}
          >
            <Tooltip>
              <div>
                <strong>{city.city}</strong>
                <div>{city.count.toLocaleString()} usuarios</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
    </MapContainer>
  );
};

export default UserGeographyMap;
