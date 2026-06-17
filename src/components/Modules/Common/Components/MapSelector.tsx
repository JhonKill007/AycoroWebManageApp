// components/ServiceFormEnhanced.tsx
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export const MapSelector = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}: any) => {
  const { theme } = useThemeContext();
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 0,
    lng: 0,
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    setSelectedLocation({
      lat: initialLocation.lat,
      lng: initialLocation.lng,
    });
    setMapCenter([initialLocation.lat, initialLocation.lng]);
  }, [initialLocation.lat, initialLocation.lng]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Componente para eventos del mapa
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
      },
    });
    return null;
  };

  const RecenterMap = ({ lat, lng }: any) => {
    const map = useMap();

    useEffect(() => {
      map.setView([lat, lng]);
    }, [lat, lng, map]);

    return null;
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.84)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
          border: `1px solid ${
            theme === "light"
              ? Colors.light.colors.border
              : Colors.dark.colors.border
          }`,
          borderRadius: "12px",
          padding: "24px",
          width: "90%",
          maxWidth: "900px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
            }}
          >
            Seleccionar ubicación
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
              padding: "0",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "500",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
            }}
          >
            Haz clic en el mapa para seleccionar la ubicación
          </label>
          {initialLocation.lat && initialLocation.lng ? (
            <div
              style={{
                height: "470px",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                />
                <MapClickHandler />
                <RecenterMap
                  lat={selectedLocation.lat}
                  lng={selectedLocation.lng}
                />
              </MapContainer>
            </div>
          ) : (
            <div
              style={{
                height: "470px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center", // centro vertical
                justifyContent: "center", // centro horizontal
              }}
            >
              <h3
                style={{
                  fontWeight: "500",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                  textAlign: "center",
                }}
              >
                Error al cargar la localización, intente luego.
              </h3>
            </div>
          )}
        </div>
        {initialLocation.lat && initialLocation.lng && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              paddingTop: "16px",
            }}
          >
            <button
              onClick={handleCancel}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background,
                border: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
                transition: "all 0.2s ease",
              }}
              // onMouseOver={(e: any) =>
              //   (e.target.style.backgroundColor = "#e0e0e0")
              // }
              // onMouseOut={(e: any) =>
              //   (e.target.style.backgroundColor = "#f5f5f5")
              // }
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "white",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e: any) =>
                (e.target.style.backgroundColor = "#0056b3")
              }
              onMouseOut={(e: any) =>
                (e.target.style.backgroundColor = "#007bff")
              }
            >
              Confirmar ubicación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
