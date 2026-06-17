import { NotifyType } from "../constants/Types";

const getNotifyMessageHook = () => {
  function getDescriptionNotify(type: string, descripcion: string) {
    switch (type) {
      case NotifyType.PUBLICATION_LIKE:
        return "ha indicado que le gusta tu publicación.";

      case NotifyType.HISTORY_LIKE:
        return "ha indicado que le gusta tu historia.";

      case NotifyType.COMENT_LIKE:
        return "ha indicado que le gusta tu comentario.";

      case NotifyType.FOLLOW:
        return "ha comenzado a seguirte.";

      case NotifyType.COMENT:
        return "ha comentado en tu publicación.";

      case NotifyType.PUBLICATION_MENTION:
        return "te ha mencionado en su publicación.";

      case NotifyType.HISTORY_MENTION:
        return "te ha mencionado en su historia.";

      case NotifyType.COMENT_MENTION:
        return "te ha mencionado en un comentario.";

      case NotifyType.MESSAGE:
        return descripcion;

      default:
        return "Tienes una nueva notificación.";
    }
  }

  function getNotify(user: string, type: string, descripcion: string) {
    switch (type) {
      case NotifyType.PUBLICATION_LIKE:
        return (
          <span>
            A <b style={{ fontWeight: "bold" }}>{user}</b> le gusto tu
            publicación.
          </span>
        );

      case NotifyType.HISTORY_LIKE:
        return (
          <span>
            A <b style={{ fontWeight: "bold" }}>{user}</b> le gusto tu historia.
          </span>
        );

      case NotifyType.COMENT_LIKE:
        return (
          <span>
            A <b style={{ fontWeight: "bold" }}>{user}</b> le gusto tu
            comentario.
          </span>
        );

      case NotifyType.FOLLOW:
        return (
          <span>
            <b style={{ fontWeight: "bold" }}>{user}</b> ha comenzado a
            seguirte.
          </span>
        );

      case NotifyType.COMENT:
        return (
          <span>
            <b style={{ fontWeight: "bold" }}>{user}</b> ha comentado tu
            publicación.
          </span>
        );

      case NotifyType.PUBLICATION_MENTION:
        return (
          <span>
            <b style={{ fontWeight: "bold" }}>{user}</b> te menciono en un
            publicación.
          </span>
        );

      case NotifyType.HISTORY_MENTION:
        return (
          <span>
            <b style={{ fontWeight: "bold" }}>{user}</b> te menciono en un
            historia.
          </span>
        );

      case NotifyType.COMENT_MENTION:
        return (
          <span>
            <b style={{ fontWeight: "bold" }}>{user}</b> te menciono en un
            comentario.
          </span>
        );
    }
  }

  return { getDescriptionNotify, getNotify };
};

export default getNotifyMessageHook;
