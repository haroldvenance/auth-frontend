/**
 * Formulaire d'enrôlement TOTP en deux étapes :
 *   1. Affichage du QR code à scanner + champ de vérification
 *   2. Affichage des codes de secours
 *
 * Utilisation :
 *   <TOTPForm
 *     onSuccess={() => navigate("/settings")}
 *     onCancel={() => navigate("/settings")}
 *   />
 */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { FiLoader } from "react-icons/fi";

import { useAuth } from "../../useAuth";
import { otpVerifySchema, type OTPVerifyData } from "../../lib/validation";
import { Button } from "../ui/Button";
import { RecoveryCodes } from "./RecoveryCodes";

type Step = "setup" | "verify" | "recovery";

export interface TOTPFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TOTPForm({ onSuccess, onCancel }: TOTPFormProps) {
  const { api } = useAuth();
  const [step, setStep] = useState<Step>("setup");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // === Charger le QR code au montage ===
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.setupTOTP();
        if (cancelled) return;
        setQrCode(data.qr_code_data_url);
        setSecret(data.secret);
      } catch (error) {
        if (cancelled) return;
        const message = isAxiosError(error)
          ? error.response?.data?.detail ?? "Impossible de démarrer l'enrôlement"
          : "Impossible de démarrer l'enrôlement";
        setGlobalError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Étape 2 : vérification du premier code ===
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OTPVerifyData>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: "" },
  });

  const onVerify = async (data: OTPVerifyData) => {
    setGlobalError(null);
    try {
      const result = await api.verifyTOTP(data.code);
      if (result.recovery_codes && result.recovery_codes.length > 0) {
        setRecoveryCodes(result.recovery_codes);
        setStep("recovery");
        toast.success("TOTP activé");
      } else {
        toast.success("TOTP activé");
        onSuccess?.();
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Code invalide"
        : "Code invalide";
      setGlobalError(message);
      toast.error(message);
      reset();
    }
  };

  // === Rendu ===
  if (loading) {
    return (
      <div className="auth-container">
        <div style={{ textAlign: "center", padding: 32 }}>
          <FiLoader
            size={24}
            style={{ animation: "auth-spin 1s linear infinite" }}
          />
          <p style={{ color: "var(--auth-text-muted)", marginTop: 12 }}>
            Génération du QR code…
          </p>
        </div>
      </div>
    );
  }

  // Étape 1 : scan du QR code + vérification
  if (step === "setup" || step === "verify") {
    return (
      <div className="auth-container">
        <h1 className="auth-title">Activer la double authentification</h1>
        <p className="auth-subtitle">
          Scannez le QR code avec Google Authenticator, Authy ou toute
          application compatible TOTP.
        </p>

        {globalError && (
          <div className="auth-alert auth-alert--error" role="alert">
            {globalError}
          </div>
        )}

        {qrCode && (
          <div className="auth-qr-container">
            <img
              src={qrCode}
              alt="QR code TOTP à scanner"
              className="auth-qr-image"
            />
          </div>
        )}

        {secret && (
          <div style={{ marginBottom: 20 }}>
            <p className="auth-hint-text" style={{ marginBottom: 6 }}>
              Impossible de scanner ? Entrez ce code manuellement :
            </p>
            <div className="auth-secret-box">
              <code className="auth-secret-code">
                {showSecret ? secret : "•".repeat(secret.length)}
              </code>
              <button
                type="button"
                className="auth-button auth-button--ghost"
                onClick={() => setShowSecret((s) => !s)}
              >
                {showSecret ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onVerify)} noValidate>
          <div className="auth-field">
            <label htmlFor="totp-code" className="auth-label">
              Code de vérification à 6 chiffres
            </label>
            <input
              id="totp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className={`auth-otp-input ${
                errors.code ? "auth-input--error" : ""
              }`}
              {...register("code")}
            />
            {errors.code && (
              <div className="auth-error-text" role="alert">
                {errors.code.message}
              </div>
            )}
          </div>

          <Button type="submit" loading={isSubmitting}>
            Activer le TOTP
          </Button>
        </form>

        {onCancel && (
          <div className="auth-footer">
            <span
              className="auth-link"
              onClick={onCancel}
              role="button"
            >
              Annuler
            </span>
          </div>
        )}
      </div>
    );
  }

  // Étape 3 : affichage des codes de secours
  if (step === "recovery" && recoveryCodes) {
    return (
      <RecoveryCodes
        codes={recoveryCodes}
        onContinue={() => onSuccess?.()}
      />
    );
  }

  return null;
}
