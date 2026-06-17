export const UserStatus = Object.freeze({
  ACTIVE: 1,
  DELETED: 2,
  INACTIVE: 3,
  SUSPENDED: 4,
  BANNED: 5,
});

export const PostStatus = Object.freeze({
  DRAFT: 1,
  PUBLISHED: 2,
  HIDDEN: 3,
  FLAGGED: 4,
  REPORTED: 5,
  UNDER_REVIEW: 6,
  ARCHIVED: 7,
  DELETED: 8,
  EDITED: 9,
});

export const CommentStatus = Object.freeze({
  PUBLISHED: 1,
  FLAGGED: 2,
  REPORTED: 3,
  UNDER_REVIEW: 4,
  DELETED: 5,
  EDITED: 6,
});

export const HistoryStatus = Object.freeze({
  PUBLISHED: 1,
  FLAGGED: 2,
  REPORTED: 3,
  UNDER_REVIEW: 4,
  DELETED: 5,
});

export const MessageStatus = Object.freeze({
  SENT: 1,
  READ: 2,
  UNREAD: 3,
  DELETED_FOR_ME: 4,
  DELETED_FOR_ALL: 5,
  DRAFT: 6,
});

export const VerificationStatus = Object.freeze({
  NOT_VERIFIED: 1,
  VERIFIED: 2,
  PENDING_VERIFICATION: 3,
});

export const Mobile_App_Link =
  "https://expo.dev/artifacts/eas/udKsxvhXhrayQ3FSRZoCSR.apk";
