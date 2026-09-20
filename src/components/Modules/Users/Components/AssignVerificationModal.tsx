import { useState } from "react";
import { VerificationStatus } from "../../../constants/Status";
import {
  VerificationType,
  getVerificationColor,
} from "../../../constants/Types";
import VerifiedBadge from "../../Common/Components/VerifiedBadge";

export type VerificationOptionId =
  | (typeof VerificationType)[keyof typeof VerificationType]
  | "none";

const OPTIONS: Array<{
  id: (typeof VerificationType)[keyof typeof VerificationType];
  name: string;
  description: string;
}> = [
  {
    id: VerificationType.GREEN,
    name: "Verificación verde",
    description:
      "Para usuarios que quieren confirmar su identidad real. La cuenta pertenece a una persona cuya identidad fue verificada por Aycoro.",
  },
  {
    id: VerificationType.BLUE,
    name: "Verificación azul",
    description:
      "Para celebridades, artistas, deportistas, creadores y figuras reconocidas. La cuenta pertenece a una figura pública verificada por Aycoro.",
  },
  {
    id: VerificationType.GOLD,
    name: "Verificación dorada",
    description:
      "Para empresas, marcas, instituciones, medios, eventos y entidades oficiales. La cuenta representa a una organización verificada por Aycoro.",
  },
];

type AssignVerificationModalProps = {
  c: any;
  theme: string;
  username?: string;
  currentVerify?: number;
  currentVerifyType?: string;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (verifyType: VerificationOptionId) => void;
};

const AssignVerificationModal = ({
  c,
  theme,
  username,
  currentVerify,
  currentVerifyType,
  saving = false,
  onClose,
  onConfirm,
}: AssignVerificationModalProps) => {
  const currentType: VerificationOptionId | "" = (() => {
    if (currentVerify !== VerificationStatus.VERIFIED) return "";
    const type = `${currentVerifyType || ""}`.trim().toLowerCase();
    if (type === "verde" || type === VerificationType.GREEN) {
      return VerificationType.GREEN;
    }
    if (type === "azul" || type === VerificationType.BLUE) {
      return VerificationType.BLUE;
    }
    if (
      type === "dorado" ||
      type === "dorada" ||
      type === "golden" ||
      type === VerificationType.GOLD
    ) {
      return VerificationType.GOLD;
    }
    return "";
  })();
  const [selected, setSelected] = useState<VerificationOptionId | "">(
    currentType,
  );
  const [confirming, setConfirming] = useState(false);

  const selectedOption =
    selected === "none"
      ? {
          name: "Sin verificación",
          description: "Se quitará la insignia de verificación de esta cuenta.",
        }
      : OPTIONS.find((option) => option.id === selected);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.38)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          boxShadow: "0 22px 70px rgba(0,0,0,0.32)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            borderBottom: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>
              {confirming ? "Confirmar verificación" : "Asignar verificación"}
            </div>
            <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
              {confirming
                ? `Revisa el tipo elegido para @${username || "usuario"} antes de aplicarlo.`
                : "Elige un tipo de verificación. Se pedirá confirmación antes de aplicarlo."}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: c.card,
              color: c.textMuted,
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          {confirming && selectedOption ? (
            <div
              style={{
                border: `1.5px solid ${c.border}`,
                borderRadius: 14,
                padding: 14,
                background: c.inputBackground,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {selected !== "none" ? (
                  <VerifiedBadge
                    verify={VerificationStatus.VERIFIED}
                    verifyType={selected}
                    size={18}
                  />
                ) : null}
                <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>
                  {selectedOption.name}
                </div>
              </div>
              <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.55 }}>
                Vas a {selected === "none" ? "quitar" : "asignar"}{" "}
                {selectedOption.name.toLowerCase()} a @{username || "usuario"}.
                Esta acción se verá en el perfil del usuario dentro de la app.
              </div>
            </div>
          ) : (
            <>
              {OPTIONS.map((option) => {
                const active = selected === option.id;
                const color = getVerificationColor(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelected(option.id)}
                    style={{
                      textAlign: "left",
                      border: `1.5px solid ${active ? color : c.border}`,
                      background: active ? `${color}14` : "transparent",
                      borderRadius: 14,
                      padding: "12px 14px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <VerifiedBadge
                        verify={VerificationStatus.VERIFIED}
                        verifyType={option.id}
                        size={16}
                      />
                      <span
                        style={{ fontSize: 13, fontWeight: 800, color: c.text }}
                      >
                        {option.name}
                      </span>
                      {currentType === option.id ? (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color,
                            marginLeft: "auto",
                          }}
                        >
                          Actual
                        </span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: c.textMuted,
                        lineHeight: 1.5,
                      }}
                    >
                      {option.description}
                    </div>
                  </button>
                );
              })}
              {currentVerify === VerificationStatus.VERIFIED ? (
                <button
                  type="button"
                  onClick={() => setSelected("none")}
                  style={{
                    textAlign: "left",
                    border: `1.5px solid ${
                      selected === "none" ? c.danger : c.border
                    }`,
                    background:
                      selected === "none" ? `${c.danger}12` : "transparent",
                    borderRadius: 14,
                    padding: "12px 14px",
                    cursor: "pointer",
                    color: c.text,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  Quitar verificación
                </button>
              ) : null}
            </>
          )}
        </div>

        <div
          style={{
            padding: "12px 16px 16px",
            borderTop: `1px solid ${c.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {confirming ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirming(false)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${c.border}`,
                  background: "transparent",
                  color: c.text,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Volver
              </button>
              <button
                type="button"
                disabled={saving || !selected}
                onClick={() => selected && onConfirm(selected)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: c.accent,
                  color: "#fff",
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Aplicando..." : "Confirmar"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${c.border}`,
                  background: "transparent",
                  color: c.text,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selected}
                onClick={() => setConfirming(true)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: selected ? c.accent : c.border,
                  color: "#fff",
                  fontWeight: 800,
                  cursor: selected ? "pointer" : "not-allowed",
                }}
              >
                Continuar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignVerificationModal;
