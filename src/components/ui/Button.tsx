/**
 * Bouton stylé avec états de chargement.
 */
import React from "react";
import { FiLoader } from "react-icons/fi";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? ""
      : variant === "secondary"
        ? "auth-button--secondary"
        : variant === "danger"
          ? "auth-button--danger"
          : "auth-button--ghost";

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`auth-button ${variantClass} ${className}`.trim()}
    >
      {loading && (
        <FiLoader
          style={{ animation: "auth-spin 1s linear infinite" }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

// Injection de l'animation de spinner (une seule fois)
if (typeof document !== "undefined" && !document.getElementById("auth-spin-style")) {
  const style = document.createElement("style");
  style.id = "auth-spin-style";
  style.textContent = `@keyframes auth-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}
