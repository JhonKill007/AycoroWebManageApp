import {
  isLikelyValidDomain,
  mapBlockedEmailDomainError,
} from "./blockedEmailDomainValidation";

describe("blockedEmailDomainValidation", () => {
  it("accepts valid domains", () => {
    expect(isLikelyValidDomain("example.com")).toBe(true);
    expect(isLikelyValidDomain("mail.example.org")).toBe(true);
  });

  it("rejects emails, urls and spaces", () => {
    expect(isLikelyValidDomain("user@example.com")).toBe(false);
    expect(isLikelyValidDomain("https://example.com")).toBe(false);
    expect(isLikelyValidDomain("exa mple.com")).toBe(false);
    expect(isLikelyValidDomain("")).toBe(false);
  });

  it("maps api errors for admins", () => {
    expect(
      mapBlockedEmailDomainError({ response: { status: 409, data: { message: "Domain already registered" } } }),
    ).toMatch(/ya está registrado/i);
    expect(
      mapBlockedEmailDomainError({ response: { status: 403 } }),
    ).toMatch(/permiso/i);
    expect(
      mapBlockedEmailDomainError({ response: { status: 401 } }),
    ).toMatch(/sesión/i);
    expect(mapBlockedEmailDomainError({})).toMatch(/conexión/i);
  });
});
