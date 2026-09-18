/**
 * Utilitaires pour les passkeys (WebAuthn).
 */
import {
  startAuthentication,
  startRegistration,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";

/** Détecte si le navigateur supporte WebAuthn. */
export function isWebAuthnSupported(): boolean {
  return typeof window !== "undefined" && browserSupportsWebAuthn();
}

/** Détecte si un authentificateur de plateforme (Touch ID, Windows Hello…) est disponible. */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
}

/** Enregistre une nouvelle passkey. */
export async function registerPasskey(
  options: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  // Le cast est nécessaire car les types de @simplewebauthn sont stricts
  const response = await startRegistration({
    optionsJSON: options as never,
  });
  return response as unknown as Record<string, unknown>;
}

/** Authentifie avec une passkey. */
export async function authenticateWithPasskey(
  options: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await startAuthentication({
    optionsJSON: options as never,
  });
  return response as unknown as Record<string, unknown>;
}

/** Formate une date ISO en date lisible. */
export function formatPasskeyDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
