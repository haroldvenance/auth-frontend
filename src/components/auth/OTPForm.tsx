/**
 * Formulaire OTP en deux étapes :
 *   1. Demande d'envoi du code à un email
 *   2. Saisie du code reçu
 *
 * Utilisation :
 *   <OTPForm
 *     onSuccess={() => navigate("/dashboard")}
 *     onBackToLogin={() => navigate("/login")}
 *   />
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { useAuth } from "../../useAuth";
import {
  otpRequestSchema,
  otpVerifySchema,
  type OTPRequestData,
  type OTPVerifyData,
} from "../../lib/validation";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

type Step = "request" | "verify";

export interface OTPFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  /** Email pré-rempli */
  defaultEmail?: string;
  title?: string;
}

export function OTPForm({
  onSuccess,
  onBackToLogin,
  defaultEmail = "",
  title = "Connexion par code",
}: OTPFormProps) {
  const { api } = useAuth();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState(defaultEmail);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // === Étape 1 : demander l'OTP ===
  const requestForm = useForm<OTPRequestData>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: defaultEmail },
  });

  const onRequestSubmit = async (data: OTPRequestData) => {
    setGlobalError(null);
    try {
      await api.requestOTP({ email: data.email, purpose: "login" });
      setEmail(data.email);
      setStep("verify");
      toast.success("Un code vous a été envoyé par email");
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Impossible d'envoyer le code"
        : "Impossible d'envoyer le code";
      setGlobalError(message);
      toast.error(message);
    }
  };

  // === Étape 2 : vérifier l'OTP ===
  const verifyForm = useForm<OTPVerifyData>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: "" },
  });

  const onVerifySubmit = async (data: OTPVerifyData) => {
    setGlobalError(null);
    try {
      await api.verifyOTP({ email, code: data.code, purpose: "login" });
      toast.success("Code vérifié");
      onSuccess?.();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Code incorrect"
        : "Code incorrect";
      setGlobalError(message);
      toast.error(message);
    }
  };

  const handleResend = async () => {
    try {
      await api.requestOTP({ email, purpose: "login" });
      toast.success("Nouveau code envoyé");
    } catch {
      toast.error("Impossible de renvoyer le code");
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">
        {step === "request"
          ? "Recevez un code à usage unique par email"
          : `Entrez le code envoyé à ${email}`}
      </p>

      {globalError && (
        <div className="auth-alert auth-alert--error" role="alert">
          {globalError}
        </div>
      )}

      {step === "request" && (
        <form
          onSubmit={requestForm.handleSubmit(onRequestSubmit)}
          noValidate
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="vous@example.com"
            error={requestForm.formState.errors.email?.message}
            {...requestForm.register("email")}
          />

          <Button
            type="submit"
            loading={requestForm.formState.isSubmitting}
          >
            Recevoir un code
          </Button>
        </form>
      )}

      {step === "verify" && (
        <form
          onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
          noValidate
        >
          <div className="auth-field">
            <label htmlFor="otp-code" className="auth-label">
              Code à 6 chiffres
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className={`auth-otp-input ${
                verifyForm.formState.errors.code ? "auth-input--error" : ""
              }`}
              {...verifyForm.register("code")}
            />
            {verifyForm.formState.errors.code && (
              <div className="auth-error-text" role="alert">
                {verifyForm.formState.errors.code.message}
              </div>
            )}
          </div>

          <Button
            type="submit"
            loading={verifyForm.formState.isSubmitting}
          >
            Vérifier
          </Button>

          <div className="auth-otp-resend">
            <button
              type="button"
              className="auth-button auth-button--ghost"
              onClick={handleResend}
            >
              Renvoyer le code
            </button>
          </div>
        </form>
      )}

      {onBackToLogin && (
        <div className="auth-footer">
          <span
            className="auth-link"
            onClick={onBackToLogin}
            role="button"
          >
            ← Retour à la connexion
          </span>
        </div>
      )}
    </div>
  );
}
