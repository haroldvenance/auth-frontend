/**
 * Schémas de validation Zod réutilisables.
 */
import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Email invalide");

export const passwordSchema = z
  .string()
  .min(8, "Au moins 8 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

export const displayNameSchema = z
  .string()
  .min(2, "Au moins 2 caractères")
  .max(100, "Maximum 100 caractères");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    display_name: displayNameSchema,
    password: passwordSchema,
    password_confirm: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirm"],
  });

export const otpRequestSchema = z.object({
  email: emailSchema,
});

export const otpVerifySchema = z.object({
  code: z
    .string()
    .min(6, "Le code doit contenir 6 chiffres")
    .max(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code doit contenir uniquement des chiffres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OTPRequestData = z.infer<typeof otpRequestSchema>;
export type OTPVerifyData = z.infer<typeof otpVerifySchema>;
