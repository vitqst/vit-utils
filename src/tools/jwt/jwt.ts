import { decodeBase64Text } from "../base64/base64";

export type TimeClaimStatus = "expired" | "active" | "future" | "issued";

export interface DecodedTimeClaim {
  name: "exp" | "nbf" | "iat";
  value: number;
  date: Date;
  status: TimeClaimStatus;
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  signatureVerified: false;
  timeClaims: DecodedTimeClaim[];
}

function objectSection(value: string, label: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeBase64Text(value, true));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JWT ${label}: ${message}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`JWT ${label} must decode to a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

function timeClaims(
  payload: Record<string, unknown>,
  now: Date,
): DecodedTimeClaim[] {
  const nowSeconds = now.getTime() / 1000;
  return (["exp", "nbf", "iat"] as const).flatMap((name) => {
    const value = payload[name];
    if (typeof value !== "number" || !Number.isFinite(value)) return [];
    const date = new Date(value * 1000);
    if (Number.isNaN(date.getTime())) return [];

    let status: TimeClaimStatus;
    if (name === "exp") status = value <= nowSeconds ? "expired" : "active";
    else if (name === "nbf") status = value > nowSeconds ? "future" : "active";
    else status = "issued";
    return [{ name, value, date, status }];
  });
}

export function decodeJwt(
  token: string,
  now = new Date(),
): DecodedJwt {
  const segments = token.trim().split(".");
  if (segments.length !== 3) {
    throw new Error("A compact JWT must contain exactly three segments.");
  }
  const [headerSegment, payloadSegment, signature] = segments;
  if (!headerSegment || !payloadSegment) {
    throw new Error("JWT header and payload segments must not be empty.");
  }

  const header = objectSection(headerSegment, "header");
  const payload = objectSection(payloadSegment, "payload");
  return {
    header,
    payload,
    signature,
    signatureVerified: false,
    timeClaims: timeClaims(payload, now),
  };
}
