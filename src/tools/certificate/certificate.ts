export const MAX_CERTIFICATE_BYTES = 5 * 1024 * 1024;

export type CertificateValidity = "not-yet-valid" | "valid" | "expired";

export function validateCertificateBytes(bytes: Uint8Array) {
  if (!bytes.length) throw new Error("Certificate input is empty.");
  if (bytes.length > MAX_CERTIFICATE_BYTES) {
    throw new Error("Certificate must be 5 MB or smaller.");
  }
  return bytes;
}

export function certificateBytesFromPem(input: string) {
  if (/PRIVATE KEY/.test(input)) {
    throw new Error("Choose a CERTIFICATE block, not a private key.");
  }
  const matches = [
    ...input.matchAll(
      /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g,
    ),
  ];
  if (matches.length !== 1) {
    throw new Error("Enter exactly one PEM CERTIFICATE block.");
  }
  const base64 = matches[0][1].replace(/\s+/g, "");
  if (
    !base64 ||
    base64.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
  ) {
    throw new Error("Certificate PEM contains invalid Base64.");
  }
  try {
    const binary = atob(base64);
    return validateCertificateBytes(
      Uint8Array.from(binary, (character) => character.charCodeAt(0)),
    );
  } catch {
    throw new Error("Certificate PEM contains invalid Base64.");
  }
}

export function certificateValidityState(
  notBefore: Date,
  notAfter: Date,
  now = new Date(),
): CertificateValidity {
  if (now < notBefore) return "not-yet-valid";
  if (now > notAfter) return "expired";
  return "valid";
}

export function formatFingerprint(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join(":");
}

