/**
 * Wrapper qui n'affiche ses enfants que si l'utilisateur est vérifié.
 * Sinon, affiche un message d'invitation à se vérifier.
 *
 * Utilisation :
 *   <VerificationGate onVerifyClick={() => navigate("/verification")}>
 *     <PublishButton />
 *   </VerificationGate>
 */
import type { ReactNode } from "react";
import { FiLock } from "react-icons/fi";

import { useAuth } from "../../useAuth";
import { Button } from "../ui/Button";

export interface VerificationGateProps {
  children: ReactNode;
  /** Callback quand l'utilisateur clique sur "Vérifier mon compte" */
  onVerifyClick?: () => void;
  /** Titre personnalisé */
  title?: string;
  /** Message personnalisé */
  message?: string;
}

export function VerificationGate({
  children,
  onVerifyClick,
  title = "Fonctionnalité réservée",
  message = "Cette fonctionnalité est réservée aux comptes vérifiés. Vérifiez votre identité pour y accéder.",
}: VerificationGateProps) {
  const { isVerified, loading } = useAuth();

  if (loading) {
    return <div className="auth-status-card">Chargement…</div>;
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="auth-gate">
      <div className="auth-gate-icon">
        <FiLock size={28} />
      </div>
      <h2 className="auth-gate-title">{title}</h2>
      <p className="auth-gate-message">{message}</p>
      {onVerifyClick && (
        <Button onClick={onVerifyClick}>Vérifier mon compte</Button>
      )}
    </div>
  );
}
