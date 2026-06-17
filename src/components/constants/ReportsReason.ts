// constants/ReportReasons.ts

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

export const REPORT_REASONS: ReasonsType[] = [
  {
    id: "illegal_activity",
    icon: "⚖️",
    label: "Actividad ilegal",
    description: "Contenido que promueve o facilita actividades ilegales",
    longDescription: "Este reporte se refiere a contenido que promueve, facilita o incita a realizar actividades consideradas ilegales según las leyes aplicables, como venta de sustancias controladas, instrucciones para cometer delitos, o material de explotación.",
    color: "#dc3545",
    defaultPriority: ReportSeverityType.CRITICAL,
  },
  {
    id: "threats",
    icon: "⚠️",
    label: "Amenazas o violencia",
    description: "Amenazas directas o incitación a la violencia",
    longDescription: "Contenido que contiene amenazas de daño físico, psicológico o emocional hacia una persona o grupo, así como incitación explícita a actos violentos contra terceros.",
    color: "#fa5252",
    defaultPriority: ReportSeverityType.CRITICAL,
  },
  {
    id: "fraud",
    icon: "💀",
    label: "Fraude o estafa",
    description: "Intentos de engañar para obtener beneficios ilegítimos",
    longDescription: "Contenido que busca engañar a usuarios para obtener dinero, información personal o beneficios mediante falsas promesas, esquemas piramidales, loterías falsas, o suplantación de servicios legítimos.",
    color: "#ff6b6b",
    defaultPriority: ReportSeverityType.HIGH,
  },
  {
    id: "impersonation",
    icon: "🎭",
    label: "Suplantación de identidad",
    description: "Fingir ser otra persona o entidad",
    longDescription: "Cuentas o perfiles que se hacen pasar por otra persona real, marca comercial, organización o figura pública sin autorización, con el objetivo de engañar o difamar.",
    color: "#f59f00",
    defaultPriority: ReportSeverityType.HIGH,
  },
  {
    id: "spam",
    icon: "📧",
    label: "Spam",
    description: "Contenido repetitivo no solicitado",
    longDescription: "Publicaciones, mensajes o comentarios repetitivos, no solicitados o irrelevantes enviados con fines promocionales, engañosos o maliciosos. Incluye enlaces sospechosos y publicidad no deseada.",
    color: "#7950f2",
    defaultPriority: ReportSeverityType.LOW,
  },
  {
    id: "harassment",
    icon: "😤",
    label: "Acoso",
    description: "Comportamiento hostil repetido contra un usuario",
    longDescription: "Comportamiento repetido y hostil dirigido a una persona específica, incluyendo insultos persistentes, burlas, difamación, o cualquier acción que cree un ambiente intimidatorio u ofensivo.",
    color: "#e8590c",
    defaultPriority: ReportSeverityType.HIGH,
  },
  {
    id: "hate_speech",
    icon: "💢",
    label: "Discurso de odio",
    description: "Ataques basados en identidad o creencias",
    longDescription: "Contenido que promueve violencia, odio o discriminación contra personas o grupos basándose en raza, etnia, nacionalidad, religión, orientación sexual, género, identidad de género, discapacidad u otras características protegidas.",
    color: "#c92a2a",
    defaultPriority: ReportSeverityType.CRITICAL,
  },
  {
    id: "inappropriate_content",
    icon: "🔞",
    label: "Contenido inapropiado",
    description: "Material no apto para la comunidad",
    longDescription: "Contenido que viola las normas de la comunidad por ser sexualmente explícito, gráficamente violento, perturbador, o que carece de advertencia de contenido sensible apropiada.",
    color: "#d6336c",
    defaultPriority: ReportSeverityType.MEDIUM,
  },
  {
    id: "misinformation",
    icon: "📢",
    label: "Desinformación",
    description: "Información falsa o engañosa",
    longDescription: "Contenido que difunde información verificablemente falsa o engañosa, especialmente en temas de salud pública, seguridad, eventos actuales o procesos democráticos, que podría causar daño si se actúa según ella.",
    color: "#fd7e14",
    defaultPriority: ReportSeverityType.MEDIUM,
  },
  {
    id: "privacy_violation",
    icon: "🔒",
    label: "Violación de privacidad",
    description: "Exposición de información personal sin consentimiento",
    longDescription: "Publicación de información privada o personal de un individuo sin su consentimiento expreso, incluyendo direcciones, números de teléfono, correos electrónicos, documentos de identidad, o imágenes íntimas.",
    color: "#4dabf7",
    defaultPriority: ReportSeverityType.HIGH,
  },
  {
    id: "intellectual_property",
    icon: "©️",
    label: "Propiedad intelectual",
    description: "Infracción de derechos de autor o marcas",
    longDescription: "Contenido que infringe derechos de autor, marcas registradas, patentes u otros derechos de propiedad intelectual sin la debida atribución o autorización del propietario legítimo.",
    color: "#5f3dc4",
    defaultPriority: ReportSeverityType.MEDIUM,
  },
  {
    id: "self_harm",
    icon: "🆘",
    label: "Autolesión o suicidio",
    description: "Contenido relacionado con autolesión o ideación suicida",
    longDescription: "Contenido que glorifica, promueve o proporciona instrucciones sobre autolesión o suicidio. Se debe priorizar la intervención y apoyo a usuarios en crisis.",
    color: "#e64980",
    defaultPriority: ReportSeverityType.CRITICAL,
  },
  {
    id: "terrorism",
    icon: "💣",
    label: "Terrorismo o extremismo",
    description: "Apoyo a organizaciones terroristas o actos extremistas",
    longDescription: "Contenido que apoya, promueve o facilita actividades de organizaciones designadas como terroristas, o que incita a cometer actos de terrorismo o violencia extremista.",
    color: "#c92a2a",
    defaultPriority: ReportSeverityType.CRITICAL,
  },
  {
    id: "other",
    icon: "❓",
    label: "Otro",
    description: "Otra razón no especificada",
    longDescription: "Reportes que no encajan en ninguna categoría específica. Por favor proporciona detalles adicionales en la descripción del reporte para una mejor evaluación.",
    color: "#868e96",
    defaultPriority: ReportSeverityType.MEDIUM,
  },
];

// Helper para obtener una razón por ID
export const getReasonById = (id: string): ReasonsType | undefined => {
  return REPORT_REASONS.find(reason => reason.id === id);
};

// Helper para obtener el color de una razón
export const getReasonColor = (id: string): string => {
  const reason = getReasonById(id);
  return reason?.color || "#868e96";
};

// Helper para obtener el icono de una razón
export const getReasonIcon = (id: string): string => {
  const reason = getReasonById(id);
  return reason?.icon || "📋";
};

// Helper para obtener la prioridad por defecto
export const getDefaultPriority = (id: string): string => {
  const reason = getReasonById(id);
  return reason?.defaultPriority || ReportSeverityType.MEDIUM;
};