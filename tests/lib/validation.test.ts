import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  displayNameSchema,
  loginSchema,
  registerSchema,
  otpVerifySchema,
} from "../../src/lib/validation";

describe("emailSchema", () => {
  it("accepte un email valide", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejette un email vide", () => {
    const result = emailSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejette un email invalide", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepte un mot de passe fort", () => {
    expect(passwordSchema.safeParse("MotDePasse123").success).toBe(true);
  });

  it("rejette un mot de passe trop court", () => {
    expect(passwordSchema.safeParse("Aa1").success).toBe(false);
  });

  it("rejette sans majuscule", () => {
    expect(passwordSchema.safeParse("motdepasse123").success).toBe(false);
  });

  it("rejette sans chiffre", () => {
    expect(passwordSchema.safeParse("MotDePasse").success).toBe(false);
  });
});

describe("displayNameSchema", () => {
  it("accepte un nom valide", () => {
    expect(displayNameSchema.safeParse("Jean Dupont").success).toBe(true);
  });

  it("rejette un nom trop court", () => {
    expect(displayNameSchema.safeParse("J").success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepte des données valides", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "any-password",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un mot de passe vide", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepte des données valides", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      display_name: "Jean Dupont",
      password: "MotDePasse123",
      password_confirm: "MotDePasse123",
    });
    expect(result.success).toBe(true);
  });

  it("rejette si les mots de passe ne correspondent pas", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      display_name: "Jean Dupont",
      password: "MotDePasse123",
      password_confirm: "DifferentPassword123",
    });
    expect(result.success).toBe(false);
  });
});

describe("otpVerifySchema", () => {
  it("accepte un code à 6 chiffres", () => {
    expect(otpVerifySchema.safeParse({ code: "123456" }).success).toBe(true);
  });

  it("rejette un code trop court", () => {
    expect(otpVerifySchema.safeParse({ code: "123" }).success).toBe(false);
  });

  it("rejette des lettres", () => {
    expect(otpVerifySchema.safeParse({ code: "abcdef" }).success).toBe(false);
  });
});
