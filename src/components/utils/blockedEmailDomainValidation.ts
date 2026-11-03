/** UX-only checks. AycoroWebApi (AT-81) remains the authority. */
export const isLikelyValidDomain = (raw: string): boolean => {
  const value = String(raw || "").trim().toLowerCase();
  if (
    !value ||
    value.includes("@") ||
    value.includes(" ") ||
    value.includes("/") ||
    value.includes(":")
  ) {
    return false;
  }
  if (
    value.startsWith("-") ||
    value.endsWith("-") ||
    value.startsWith(".") ||
    value.endsWith(".")
  ) {
    return false;
  }
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
    value,
  );
};

export const mapBlockedEmailDomainError = (error: any): string => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message || error?.response?.data?.Message || "",
  ).toLowerCase();

  if (status === 401) {
    return "Tu sesión ha expirado. Vuelve a iniciar sesión.";
  }
  if (status === 403) {
    return "No tienes permiso para administrar dominios bloqueados.";
  }
  if (status === 404) {
    return "La regla no existe o ya fue eliminada.";
  }
  if (status === 409 || message.includes("already registered")) {
    return "Ese dominio ya está registrado en la lista.";
  }
  if (status === 400 || message.includes("invalid domain")) {
    return "El formato del dominio no es válido.";
  }
  if (!error?.response) {
    return "No hay conexión con el servidor. Inténtalo de nuevo.";
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
};
