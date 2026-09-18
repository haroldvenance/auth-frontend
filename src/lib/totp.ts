/**
 * Fonctions utilitaires pour le TOTP.
 */

/** Groupe un code de secours XXXX-XXXX-XXXX pour l'affichage. */
export function formatRecoveryCode(code: string): string {
  return code.toUpperCase();
}

/** Copie du texte dans le presse-papier avec fallback. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback pour les navigateurs anciens
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** Télécharge un fichier texte avec les codes de secours. */
export function downloadRecoveryCodes(
  codes: string[],
  filename = "auth-recovery-codes.txt",
): void {
  const content = [
    "═══════════════════════════════════════════════════",
    "  CODES DE SECOURS — À CONSERVER EN LIEU SÛR",
    "═══════════════════════════════════════════════════",
    "",
    "Ces codes permettent de récupérer l'accès à votre compte",
    "si vous perdez votre application d'authentification.",
    "",
    "Chaque code ne peut être utilisé qu'une seule fois.",
    "",
    ...codes.map((code, i) => `  ${String(i + 1).padStart(2, "0")}. ${code}`),
    "",
    "═══════════════════════════════════════════════════",
    `  Généré le ${new Date().toLocaleString()}`,
    "═══════════════════════════════════════════════════",
    "",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
