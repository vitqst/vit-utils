/// <reference lib="webworker" />

import "reflect-metadata";
import { X509Certificate, cryptoProvider } from "@peculiar/x509";

import {
  certificateValidityState,
  formatFingerprint,
} from "./certificate";

type Request = { type: "decode"; id: number; bytes: ArrayBuffer };

cryptoProvider.set(self.crypto);

function algorithmDescription(algorithm: Algorithm & Record<string, unknown>) {
  const parts = [algorithm.name];
  const hash = algorithm.hash as Algorithm | undefined;
  if (hash?.name) parts.push(hash.name);
  if (typeof algorithm.modulusLength === "number") {
    parts.push(`${algorithm.modulusLength}-bit`);
  }
  if (typeof algorithm.namedCurve === "string") parts.push(algorithm.namedCurve);
  return parts.join(" / ");
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const { id, bytes } = event.data;
  try {
    const certificate = new X509Certificate(bytes);
    const fingerprint = formatFingerprint(
      new Uint8Array(await certificate.getThumbprint("SHA-256")),
    );
    self.postMessage({
      type: "result",
      id,
      certificate: {
        subject: certificate.subject,
        issuer: certificate.issuer,
        serialNumber: certificate.serialNumber,
        notBefore: certificate.notBefore.toISOString(),
        notAfter: certificate.notAfter.toISOString(),
        validity: certificateValidityState(
          certificate.notBefore,
          certificate.notAfter,
        ),
        signatureAlgorithm: algorithmDescription(
          certificate.signatureAlgorithm as unknown as Algorithm &
            Record<string, unknown>,
        ),
        publicKeyAlgorithm: algorithmDescription(
          certificate.publicKey.algorithm as Algorithm & Record<string, unknown>,
        ),
        fingerprint,
        selfSigned: await certificate.isSelfSigned(),
        extensions: certificate.extensions.map((extension) => ({
          oid: extension.type,
          critical: extension.critical,
        })),
      },
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
