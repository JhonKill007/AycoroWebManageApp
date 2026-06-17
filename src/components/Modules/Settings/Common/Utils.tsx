// Obtener color del estado
export const getStatusColor = (status: string) => {
  return status === "active" ? "#2ed573" : "#f59f00";
};

// Obtener texto del estado
export const getStatusText = (status: string) => {
  return status === "active" ? "Activo" : "Inactivo";
};

// Formatear fecha
export const formatDate = (dateString: string) => {
  if (!dateString) return "Fecha no disponible";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Fecha inválida";
  }
};
