/**
 * Champ de saisie stylé avec label, erreur, et bouton de visibilité optionnel.
 */
import React, { forwardRef, useId, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Affiche un bouton pour basculer entre text et password */
  togglePassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, togglePassword, type = "text", id, className = "", ...rest },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  // Génère un id unique si aucun id ni name n'est fourni
  const generatedId = useId();
  const inputId = id ?? rest.name ?? generatedId;
  const actualType = togglePassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="auth-field">
      {label && (
        <label htmlFor={inputId} className="auth-label">
          {label}
        </label>
      )}
      <div className="auth-input-wrapper">
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type={actualType}
          className={`auth-input ${error ? "auth-input--error" : ""} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
        />
        {togglePassword && (
          <button
            type="button"
            className="auth-input-icon-right"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Masquer" : "Afficher"}
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div id={`${inputId}-error`} className="auth-error-text" role="alert">
          {error}
        </div>
      )}
      {hint && !error && (
        <div id={`${inputId}-hint`} className="auth-hint-text">
          {hint}
        </div>
      )}
    </div>
  );
});