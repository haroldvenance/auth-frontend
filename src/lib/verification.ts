/**
 * Constantes et utilitaires pour la vérification d'identité.
 */
import type { DocumentType } from "../types";

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  description: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    value: "cni",
    label: "Carte Nationale d'Identité",
    description: "Recto et verso visibles",
  },
  {
    value: "passport",
    label: "Passeport",
    description: "Page avec photo et numéro",
  },
  {
    value: "student_card",
    label: "Carte d'étudiant",
    description: "Valide pour l'année en cours",
  },
  {
    value: "school_card",
    label: "Carte scolaire",
    description: "Pour les élèves du secondaire",
  },
  {
    value: "livret",
    label: "Livret scolaire",
    description: "Page avec identité et photo",
  },
  {
    value: "driver_license",
    label: "Permis de conduire",
    description: "Recto et verso visibles",
  },
  {
    value: "other",
    label: "Autre document",
    description: "Avec photo, nom et numéro",
  },
];

/** Retourne le libellé français d'un type de document. */
export function getDocumentLabel(type: DocumentType): string {
  return DOCUMENT_TYPES.find((d) => d.value === type)?.label ?? type;
}

/** Motifs de rejet prédéfinis (utiles pour l'affichage côté utilisateur). */
export const REJECTION_REASON_LABELS: Record<string, string> = {
  "Document illisible": "Le document n'est pas lisible",
  "Photo floue": "La photo est trop floue",
  "Document expiré": "Le document est expiré",
  "Informations incohérentes": "Les informations ne correspondent pas",
  "Selfie ne correspond pas au document":
    "Le selfie ne correspond pas à la photo du document",
  "Document non accepté": "Ce type de document n'est pas accepté",
};

/** Formate un statut en français lisible. */
export function formatVerificationStatus(
  status: string,
): { label: string; tone: "neutral" | "info" | "success" | "danger" } {
  switch (status) {
    case "unverified":
      return { label: "Non vérifié", tone: "neutral" };
    case "pending":
      return { label: "En cours de vérification", tone: "info" };
    case "verified":
      return { label: "Vérifié", tone: "success" };
    case "rejected":
      return { label: "Rejeté", tone: "danger" };
    default:
      return { label: status, tone: "neutral" };
  }
}

/** Convertit des octets en chaîne lisible (Ko, Mo). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
