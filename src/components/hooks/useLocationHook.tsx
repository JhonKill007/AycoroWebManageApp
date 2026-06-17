import { useEffect, useState } from "react";

export const useLocationHook = () => {
  const [location, setLocation] = useState<{
    lat: number | null;
    lng: number | null;
    accuracy?: number | null;
  }>({
    lat: null,
    lng: null,
    accuracy: null,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHighAccuracyLocation();
  }, []);

  // 1. Intento de obtener ubicación con la máxima precisión
  const getHighAccuracyLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        console.warn("High accuracy failed:", err);
        // fallback automático
        getFallbackLocation();
      },
      {
        enableHighAccuracy: true, // GPS si existe
        timeout: 5000, // esperar a que GPS responda
        maximumAge: 0, // evitar posiciones antiguas
      }
    );
  };

  // 2. Fallback: ubicación menos precisa (WiFi/IP)
  const getFallbackLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        console.warn("Fallback failed:", err);
        setError("No se pudo obtener la ubicación");
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 0,
      }
    );
  };

  return { location, error };
};
