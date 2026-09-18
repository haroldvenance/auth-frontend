/**
 * Bandeau d'avertissement pour comptes non vérifiés.
 * À placer en haut d'une page ou d'une mise en page.
 */
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";

import { useAuth } from "../../useAuth";

export interface VerificationBannerProps {
  /** Callback quand l'utilisateur clique sur "Vérifier" */
  onVerifyClick?: () => void;

  /** Masquer si l'utilisateur est vérifié ou en attente (par défaut : true) */
  hideWhenPending?: boolean;

  /** Message personnalisé */
  message?: string;
}

export function VerificationBanner({
  onVerifyClick,
  hideWhenPending = true,
  message,
}: VerificationBannerProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading || !isAuthenticated || !user) return null;
  if (user.is_verified) return null;
  if (hideWhenPending && user.verification_status === "pending") return null;

  const defaultMessage =
    user.verification_status === "rejected"
      ? "Votre dernière demande de vérification a été rejetée."
      : "Votre compte n'est pas encore vérifié. Certaines fonctionnalités sont limitées.";

  return (
    <div className="auth-banner" role="alert">
      <div className="auth-banner-icon">
        <FiAlertCircle size={20} />
      </div>
      <div className="auth-banner-content">
        <div className="auth-banner-title">
          {user.verification_status === "rejected"
            ? "Vérification échouée"
            : "Compte non vérifié"}
        </div>
        <div className="auth-banner-message">{message ?? defaultMessage}</div>
      </div>
      {onVerifyClick && (
        <button
          type="button"
          className="auth-banner-action"
          onClick={onVerifyClick}
        >
          {user.verification_status === "rejected" ? "Resoumettre" : "Vérifier"}
          <FiArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
