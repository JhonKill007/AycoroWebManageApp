import { Colors } from "./Colors";

export const MessageType = Object.freeze({
  TEXT: "TEXT",
  AUDIO: "AUDIO",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  PUBLICATION: "PUBLICATION",
  SERVICE: "SERVICE",
  STORY: "STORY",
  USER: "USER",
});

export const NotifyType = Object.freeze({
  PUBLICATION_LIKE: "PUBLICATION_LIKE",
  HISTORY_LIKE: "HISTORY_LIKE",
  COMENT_LIKE: "COMENT_LIKE",
  COMENT: "COMENT",
  PUBLICATION_MENTION: "PUBLICATION_MENTION",
  HISTORY_MENTION: "HISTORY_MENTION",
  COMENT_MENTION: "COMENT_MENTION",
  FOLLOW: "FOLLOW",
  MESSAGE: "MESSAGE",
});

export const MediaType = Object.freeze({
  IMAGE: "IMAGE",
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
});

export const CommentType = Object.freeze({
  PUBLICATION: "PUBLICATION",
  SERVICE: "SERVICE",
});

export const SearchType = Object.freeze({
  USER: "USER",
  SERVICE: "SERVICE",
});

export const NotificationItemType = Object.freeze({
  PUBLICATION: "PUBLICATION",
  SERVICE: "SERVICE",
  PERFIL: "PERFIL",
  CHAT: "CHAT",
  HISTORY: "HISTORY",
});

export const aspectRatioType = Object.freeze({
  PUBLICATION: 1,
  HISTORY: 0.6,
});

export const ChatType = Object.freeze({
  DIRECT: "DIRECT",
  GROUP: "GROUP",
  SELF: "SELF",
});

export const VerificationType = Object.freeze({
  GREEN: "green",
  BLUE: "blue",
  GOLD: "gold",
  PURPLE: "purple",
});

export const getVerificationColor = (verifyType?: string) => {
  const normalizedType = `${verifyType ?? ""}`.trim().toLowerCase();

  switch (normalizedType) {
    case VerificationType.GREEN:
    case "verde":
      return "#22c55e";
    case VerificationType.BLUE:
    case "azul":
      return "#0562f7";
    case VerificationType.GOLD:
    case "golden":
    case "dorado":
    case "dorada":
      return "#f5b301";
    case VerificationType.PURPLE:
    case "morado":
    case "morada":
    case "creators":
    case "creator":
      return Colors.detailAppColor;
    default:
      return "#22c55e";
  }
};

