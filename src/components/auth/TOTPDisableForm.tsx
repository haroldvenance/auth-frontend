/**
 * Formulaire de désactivation du TOTP.
 * Nécessite un code TOTP valide pour confirmer.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { useAuth } from "../../useAuth";
import { otpVerifySchema, type OTPVerifyData } from "../../lib/validation";
import { Button } from "../ui/Button";

export interface TOTPDisableFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TOTPDisableForm({ onSuccess, onCancel }: TOTPDisableFormProps) {
  const { api } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OTPVerifyData>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: OTPVerifyData) => {
    setGlobalError(null);
    try {
      await api.disableTOTP(data.code);
      toast.success("TOTP désactivé");
      onSuccess?.();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Code invalide"
        : "Code invalide";
      setGlobalError(message);
      toast.error(message);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Désactiver le TOTP</h1>
      <p className="auth-subtitle">
        Entrez un code valide de votre application d'authentification pour
        confirmer la désactivation.
      </p>

      {globalError && (
        <div className="auth-alert auth-alert--error" role="alert">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="auth-field">
          <label htmlFor="totp-disable-code" className="auth-label">
            Code à 6 chiffres
          </label>
          <input
            id="totp-disable-code"
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

        <Button
          type="submit"
          variant="danger"
          loading={isSubmitting}
        >
          Désactiver le TOTP
        </Button>
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
