/**
 * Formulaire de connexion (email + mot de passe).
 *
 * Utilisation :
 *   <LoginForm
 *     onSuccess={() => navigate("/dashboard")}
 *     onForgotPassword={() => navigate("/forgot-password")}
 *     onSignupClick={() => navigate("/register")}
 *   />
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { useAuth } from "../../useAuth";
import { loginSchema, type LoginFormData } from "../../lib/validation";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export interface LoginFormProps {
  /** Appelé après une connexion réussie */
  onSuccess?: () => void;

  /** Appelé si l'utilisateur clique sur "Mot de passe oublié" */
  onForgotPassword?: () => void;

  /** Appelé si l'utilisateur clique sur "Créer un compte" */
  onSignupClick?: () => void;

  /** Titre personnalisé */
  title?: string;

  /** Sous-titre personnalisé */
  subtitle?: string;
}

export function LoginForm({
  onSuccess,
  onForgotPassword,
  onSignupClick,
  title = "Connexion",
  subtitle = "Connectez-vous à votre compte",
}: LoginFormProps) {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    try {
      await login(data.email, data.password);
      toast.success("Connexion réussie");
      onSuccess?.();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Erreur de connexion"
        : "Erreur de connexion";
      setGlobalError(message);
      toast.error(message);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>

      {globalError && (
        <div className="auth-alert auth-alert--error" role="alert">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="vous@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          togglePassword
          error={errors.password?.message}
          {...register("password")}
        />

        {onForgotPassword && (
          <div className="auth-row" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="auth-button auth-button--ghost"
              onClick={onForgotPassword}
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}

        <Button type="submit" loading={isSubmitting}>
          Se connecter
        </Button>
      </form>

      {onSignupClick && (
        <div className="auth-footer">
          Pas encore de compte ?{" "}
          <span className="auth-link" onClick={onSignupClick} role="button">
            Créer un compte
          </span>
        </div>
      )}
    </div>
  );
}
