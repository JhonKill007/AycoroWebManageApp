export const getContentDeletedMessage = (
  strikes?: number,
  suspended = false,
) => {
  const strikeText =
    typeof strikes === "number"
      ? `Actualmente tu cuenta acumula ${strikes} strike${strikes === 1 ? "" : "s"} a la fecha.`
      : "Actualmente tu cuenta registra un nuevo strike por esta accion.";

  const suspensionText = suspended
    ? "\n\nTu cuenta ha llegado a 3 strikes, por lo que queda suspendida por 1 mes."
    : "";

  return `**Contenido eliminado**

Hemos eliminado una de tus publicaciones porque, tras ser revisada, determinamos que incumple nuestras Politicas de la Comunidad y los Terminos del Servicio de Aycoro.

${strikeText} Al llegar a 3 strikes, la cuenta quedara suspendida por 1 mes.${suspensionText}

Nuestro objetivo es mantener un espacio seguro y respetuoso para todos los usuarios. Si consideras que esta decision fue un error, puedes ponerte en contacto con nuestro equipo de soporte para solicitar una revision.

Gracias por ayudarnos a construir una mejor comunidad.`;
};
