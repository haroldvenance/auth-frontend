/**
 * Formulaire de vérification d'identité en 3 étapes.
 *
 * Étape 1 : Informations personnelles
 * Étape 2 : Selfie (upload — idéalement capturé en direct)
 * Étape 3 : Document d'identité (recto + verso optionnel)
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useDropzone, type FileRejection } from "react-dropzone";
import { z } from "zod";
import {
  FiArrowLeft,
  FiCheck,
  FiFile,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../useAuth";
import {
  DOCUMENT_TYPES,
  formatFileSize,
  getDocumentLabel,
} from "../../lib/verification";
import type { DocumentType } from "../../types";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

const infoSchema = z.object({
  full_name: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(150, "Maximum 150 caractères"),
  date_of_birth: z.string().optional(),
  document_type: z.string().min(1, "Choisissez un type de document"),
  document_number: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(100, "Maximum 100 caractères"),
});

type InfoForm = z.infer<typeof infoSchema>;

type Step = "info" | "selfie" | "document" | "success";

export interface VerificationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VerificationForm({
  onSuccess,
  onCancel,
}: VerificationFormProps) {
  const { api } = useAuth();
  const [step, setStep] = useState<Step>("info");
  const [info, setInfo] = useState<InfoForm | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfoForm>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      document_type: "",
      document_number: "",
    },
  });

  const onInfoSubmit = (data: InfoForm) => {
    setInfo(data);
    setStep("selfie");
  };

  const handleSubmitAll = async () => {
    if (!info || !selfieFile || !frontFile) {
      toast.error("Tous les fichiers requis ne sont pas fournis");
      return;
    }

    setSubmitting(true);
    setGlobalError(null);

    try {
      const formData = new FormData();
      formData.append("full_name", info.full_name);
      if (info.date_of_birth) {
        formData.append("date_of_birth", info.date_of_birth);
      }
      formData.append("document_type", info.document_type);
      formData.append("document_number", info.document_number);
      formData.append("selfie", selfieFile);
      formData.append("document_front", frontFile);
      if (backFile) {
        formData.append("document_back", backFile);
      }

      await api.submitVerification(formData);
      toast.success("Demande envoyée !");
      setStep("success");
      onSuccess?.();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Échec de l'envoi"
        : "Échec de l'envoi";
      setGlobalError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // === Rendu : succès ===
  if (step === "success") {
    return (
      <div className="auth-container">
        <div className="auth-success-icon">
          <FiCheck size={40} />
        </div>
        <h1 className="auth-title" style={{ textAlign: "center" }}>
          Demande envoyée
        </h1>
        <p className="auth-subtitle" style={{ textAlign: "center" }}>
          Votre demande est en cours d'examen. Vous recevrez une réponse
          sous 24h maximum.
        </p>
        <Button onClick={onSuccess}>Terminer</Button>
      </div>
    );
  }

  // === Étape 1 : informations ===
  if (step === "info") {
    return (
      <div className="auth-container">
        <StepIndicator current={1} total={3} />
        <h1 className="auth-title">Informations personnelles</h1>
        <p className="auth-subtitle">
          Renseignez les informations telles qu'elles apparaissent sur votre
          document.
        </p>

        <form onSubmit={handleSubmit(onInfoSubmit)} noValidate>
          <Input
            label="Nom complet"
            type="text"
            placeholder="Jean Dupont"
            error={errors.full_name?.message}
            {...register("full_name")}
          />

          <div className="auth-field">
            <label htmlFor="date_of_birth" className="auth-label">
              Date de naissance (optionnel)
            </label>
            <input
              id="date_of_birth"
              type="date"
              className="auth-input"
              {...register("date_of_birth")}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="document_type" className="auth-label">
              Type de document
            </label>
            <select
              id="document_type"
              className={`auth-input ${errors.document_type ? "auth-input--error" : ""}`}
              {...register("document_type")}
            >
              <option value="">— Choisir —</option>
              {DOCUMENT_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
            {errors.document_type && (
              <div className="auth-error-text" role="alert">
                {errors.document_type.message}
              </div>
            )}
          </div>

          <Input
            label="Numéro du document"
            type="text"
            placeholder="Ex: 1234567890"
            hint="Visible sur le document (numéro de série)"
            error={errors.document_number?.message}
            {...register("document_number")}
          />

          <Button type="submit">Continuer</Button>
        </form>

        {onCancel && (
          <div className="auth-footer">
            <span className="auth-link" onClick={onCancel} role="button">
              Annuler
            </span>
          </div>
        )}
      </div>
    );
  }

  // === Étape 2 : selfie ===
  if (step === "selfie") {
    return (
      <div className="auth-container">
        <StepIndicator current={2} total={3} />
        <h1 className="auth-title">Prenez un selfie</h1>
        <p className="auth-subtitle">
          Une photo claire de votre visage, sans chapeau ni masque.
          Idéalement, prenez-la maintenant.
        </p>

        <FileDropzone
          file={selfieFile}
          onFile={setSelfieFile}
          label="Glissez votre selfie ou cliquez"
          hint="JPG, PNG ou WebP — max 5 Mo"
        />

        <div style={{ marginTop: 16 }}>
          <Button
            onClick={() => setStep("document")}
            disabled={!selfieFile}
          >
            Continuer
          </Button>
        </div>

        <div className="auth-footer">
          <span
            className="auth-link"
            onClick={() => setStep("info")}
            role="button"
          >
            <FiArrowLeft size={14} style={{ marginRight: 4 }} />
            Retour
          </span>
        </div>
      </div>
    );
  }

  // === Étape 3 : document ===
  return (
    <div className="auth-container">
      <StepIndicator current={3} total={3} />
      <h1 className="auth-title">Document d'identité</h1>
      <p className="auth-subtitle">
        Photo du {info && getDocumentLabel(info.document_type as DocumentType)}.
        Assurez-vous que le document est bien lisible.
      </p>

      {globalError && (
        <div className="auth-alert auth-alert--error" role="alert">
          {globalError}
        </div>
      )}

      <div className="auth-field">
        <label className="auth-label">Recto (obligatoire)</label>
        <FileDropzone
          file={frontFile}
          onFile={setFrontFile}
          label="Face avant du document"
          hint="JPG, PNG ou WebP — max 5 Mo"
        />
      </div>

      <div className="auth-field">
        <label className="auth-label">Verso (si applicable)</label>
        <FileDropzone
          file={backFile}
          onFile={setBackFile}
          label="Face arrière du document"
          hint="Optionnel — uniquement si le document a un verso"
        />
      </div>

      <Button
        onClick={handleSubmitAll}
        loading={submitting}
        disabled={!frontFile}
      >
        Envoyer la demande
      </Button>

      <div className="auth-footer">
        <span
          className="auth-link"
          onClick={() => setStep("selfie")}
          role="button"
        >
          <FiArrowLeft size={14} style={{ marginRight: 4 }} />
          Retour
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Sous-composants
// ============================================================
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="auth-steps">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "idle";
        return (
          <div key={n} className={`auth-step auth-step--${state}`}>
            <div className="auth-step-dot">
              {state === "done" ? <FiCheck size={12} /> : n}
            </div>
            {n < total && <div className="auth-step-line" />}
          </div>
        );
      })}
    </div>
  );
}

interface FileDropzoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
  label: string;
  hint?: string;
}

function FileDropzone({ file, onFile, label, hint }: FileDropzoneProps) {
  const onDrop = (accepted: File[], rejections: FileRejection[]) => {
    if (rejections.length > 0) {
      toast.error("Fichier refusé (type ou taille invalide)");
      return;
    }
    if (accepted[0]) onFile(accepted[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  if (file) {
    return (
      <div className="auth-file-preview">
        <FiFile size={20} />
        <div className="auth-file-info">
          <div className="auth-file-name">{file.name}</div>
          <div className="auth-file-size">{formatFileSize(file.size)}</div>
        </div>
        <button
          type="button"
          className="auth-button auth-button--ghost"
          onClick={() => onFile(null)}
          aria-label="Retirer"
        >
          <FiX />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`auth-dropzone ${isDragActive ? "auth-dropzone--active" : ""}`}
    >
      <input {...getInputProps()} />
      <FiUploadCloud size={28} className="auth-dropzone-icon" />
      <div className="auth-dropzone-label">{label}</div>
      {hint && <div className="auth-dropzone-hint">{hint}</div>}
    </div>
  );
}
