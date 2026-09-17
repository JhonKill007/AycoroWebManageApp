export const ReportSeverityType = Object.freeze({
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
});

export interface ReasonsType {
  id: string;
  icon: string;
  label: string;
  description: string;
  longDescription: string;
  color: string;
  defaultPriority: string;
}

/** Same reason ids stored by the mobile/web report modal (`type` on Report). */
export const REPORT_REASONS: ReasonsType[] = [
  {
    id: "illegal_activity",
    icon: "🚫",
    label: "Actividad ilegal",
    description: "Contenido que viola leyes o promueve actividades ilegales",
    longDescription:
      "Este reporte se utiliza para contenido que promueve, facilita o participa en actividades que violan las leyes locales, nacionales o internacionales.",
    color: "#dc3545",
    defaultPriority: ReportSeverityType.CRITICAL,
  },
  {
    id: "threats",
    icon: "⛔",
    label: "Amenazas o violencia",
    description: "Contenido amenazante, acoso o incitación a la violencia",
    longDescription:
      "Selecciona esta opción si encuentras contenido que incita a la violencia, contiene amenazas directas o promueve acoso.",
    color: "#fa5252",
    defaultPriority: ReportSeverityType.CRITICAL,
  },
  {
    id: "fraud",
    icon: "⚠️",
    label: "Fraude / estafa",
    description: "Intentos de estafa, engaños o prácticas fraudulentas",
    longDescription:
      "Selecciona esta opción si el contenido intenta engañar a usuarios para obtener dinero, datos personales o acceso a cuentas.",
    color: "#ff6b6b",
    defaultPriority: ReportSeverityType.HIGH,
  },
  {
    id: "impersonation",
    icon: "🎭",
    label: "Suplantación de identidad",
    description: "Alguien haciéndose pasar por otra persona o entidad",
    longDescription:
      "Reporta cuentas o contenido que imitan a una persona, marca o entidad legítima sin autorización.",
    color: "#f59f00",
    defaultPriority: ReportSeverityType.HIGH,
  },
  {
    id: "spam",
    icon: "📨",
    label: "Spam",
    description: "Publicidad no deseada o contenido repetitivo",
    longDescription:
      "Reporta contenido repetitivo, publicidad no solicitada, enlaces engañosos o promoción masiva que afecta la experiencia.",
    color: "#7950f2",
    defaultPriority: ReportSeverityType.LOW,
  },
  {
    id: "other",
    icon: "❔",
    label: "Otro",
    description: "Algo que no encaja en las categorías anteriores",
    longDescription:
      "Usa esta opción si el problema no encaja en otra categoría. Agrega detalles para que podamos revisarlo mejor.",
    color: "#868e96",
    defaultPriority: ReportSeverityType.MEDIUM,
  },
];

export const getReasonById = (id: string): ReasonsType | undefined => {
  return REPORT_REASONS.find((reason) => reason.id === id);
};

export const getReasonColor = (id: string): string => {
  const reason = getReasonById(id);
  return reason?.color || "#868e96";
};

export const getReasonIcon = (id: string): string => {
  const reason = getReasonById(id);
  return reason?.icon || "📋";
};

export const getDefaultPriority = (id: string): string => {
  const reason = getReasonById(id);
  return reason?.defaultPriority || ReportSeverityType.MEDIUM;
};
