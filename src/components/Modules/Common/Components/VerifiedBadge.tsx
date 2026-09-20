import { VerificationStatus } from "../../../constants/Status";
import { getVerificationColor } from "../../../constants/Types";

type VerifiedBadgeProps = {
  verify?: number;
  verifyType?: string;
  size?: number;
};

const VerifiedBadge = ({
  verify,
  verifyType,
  size = 16,
}: VerifiedBadgeProps) => {
  if (verify !== VerificationStatus.VERIFIED) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={getVerificationColor(verifyType)}
      aria-label="Cuenta verificada"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72 3.1 5.54l.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12m-13 5-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
};

export default VerifiedBadge;
