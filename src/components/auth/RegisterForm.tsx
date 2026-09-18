/**
 * Formulaire d'inscription.
 *
 * Utilisation :
 *   <RegisterForm
 *     onSuccess={() => navigate("/dashboard")}
 *     onLoginClick={() => navigate("/login")}
 *   />
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { useAuth } from "../../useAuth";
import { registerSchema, type RegisterFormData } from "../../lib/validation";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
  title?: string;
  subtitle?: string;
}

export function RegisterForm({
  onSuccess,
  onLoginClick,
  title = "Créer un compte",
  subtitle = "Rejoignez-nous en quelques secondes",
}: RegisterFormProps) {
  const { register: registerUser } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      display_name: "",
      password: "",
      password_confirm: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setGlobalError(null);
    try {
      await registerUser({
        email: data.email,
        display_name: data.display_name,
        password: data.password,
      });
      toast.success("Compte créé avec succès");
      onSuccess?.();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Erreur lors de l'inscription"
        : "Erreur lors de l'inscription";
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
          label="Nom affiché"
          type="text"
          autoComplete="name"
          placeholder="Jean Dupont"
          error={errors.display_name?.message}
          {...register("display_name")}
        />

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
          autoComplete="new-password"
          placeholder="••••••••"
          togglePassword
          hint="Au moins 8 caractères, 1 majuscule, 1 chiffre"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          togglePassword
          error={errors.password_confirm?.message}
          {...register("password_confirm")}
        />

        <Button type="submit" loading={isSubmitting}>
          Créer mon compte
        </Button>
      </form>

      {onLoginClick && (
        <div className="auth-footer">
          Déjà un compte ?{" "}
          <span className="auth-link" onClick={onLoginClick} role="button">
            Se connecter
          </span>
        </div>
      )}
    </div>
  );
}
