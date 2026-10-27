export type CompatibleEditorMode = "view" | "edit" | "saving";

export const readSavedCompatibleValues = (version: any): string[] => {
  if (Array.isArray(version?.CompatibleVersions)) {
    return version.CompatibleVersions.filter(Boolean);
  }

  if (Array.isArray(version?.compatibleVersions)) {
    return version.compatibleVersions
      .map((item: any) => item?.value)
      .filter(Boolean);
  }

  return [];
};

export const shouldShowManageButton = (mode: CompatibleEditorMode) =>
  mode === "view";

export const shouldShowSaveButton = (mode: CompatibleEditorMode) =>
  mode === "edit" || mode === "saving";

export const restoreCompatibleSelection = (saved: string[]) => [...saved];

export const mergeEditOptions = (
  eligible: string[],
  selected: string[],
): string[] => Array.from(new Set([...eligible, ...selected].filter(Boolean)));
