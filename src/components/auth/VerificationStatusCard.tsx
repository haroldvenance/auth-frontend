/**
 * Carte de statut de vérification d'identité.
 */
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { FiAlertCircle, FiCheckCircle, FiClock, FiLoader, FiXCircle } from "react-icons/fi";

import { useAuth } from "../../useAuth";
import type { VerificationStatus } from "../../types";
import {
  formatVerificationStatus,
  REJECTION_REASON_LABELS,
} from "../../lib/verification";
import { Button } from "../ui/Button";

export interface VerificationStatusCardProps {
  onStartVerification?: () => void;
  onResubmit?: () => void;
  /** Rafraîchir le statut après une action */
  refreshKey?: number;
}

const ICONS = {
  neutral: FiAlertCircle,
  info: FiClock,
  success: FiCheckCircle,
  danger: FiXCircle,
};

export function VerificationStatusCard({
  onStartVerification,
  onResubmit,
  refreshKey = 0,
}: VerificationStatusCardProps) {
  const { api } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getVerificationStatus();
        if (!cancelled) setStatus(data);
      } catch (error) {
        if (cancelled) return;
        if (isAxiosError(error)) {
          console.error("Erreur chargement statut vérification :", error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="auth-status-card">
        <FiLoader style={{ animation: "auth-spin 1s linear infinite" }} />
        <span style={{ marginLeft: 8 }}>Chargement…</span>
      </div>
    );
  }

  if (!status) return null;

  const formatted = formatVerificationStatus(status.status);
  const Icon = ICONS[formatted.tone];
  const rejectionReason = status.latest_request?.rejection_reason;
  const attemptsLeft = status.max_attempts - status.attempts;

  return (
    <div className="auth-status-card">
      <div className={`auth-status-icon auth-status-icon--${formatted.tone}`}>
        <Icon size={28} />
      </div>
      <div className="auth-status-content">
        <div className="auth-status-title">Vérification d'identité</div>
        <div className="auth-status-subtitle">{formatted.label}</div>

        {status.status === "pending" && status.latest_request && (
          <div className="auth-status-meta">
            Soumis le{" "}
            {new Date(status.latest_request.created_at).toLocaleDateString()}
          </div>
        )}

        {status.status === "rejected" && rejectionReason && (
          <div className="auth-status-meta auth-status-meta--danger">
            Motif :{" "}
            {REJECTION_REASON_LABELS[rejectionReason] ?? rejectionReason}
          </div>
        )}

        {status.status === "rejected" && attemptsLeft > 0 && (
          <div className="auth-status-meta">
            {attemptsLeft} tentative(s) restante(s)
          </div>
        )}

        {status.status === "rejected" && attemptsLeft === 0 && (
          <div className="auth-status-meta auth-status-meta--danger">
            Nombre maximum de tentatives atteint
          </div>
        )}
      </div>

      {status.status === "unverified" && onStartVerification && (
        <div className="auth-status-action">
          <Button onClick={onStartVerification}>Vérifier</Button>
        </div>
      )}

      {status.status === "rejected" && attemptsLeft > 0 && onResubmit && (
        <div className="auth-status-action">
          <Button onClick={onResubmit}>Resoumettre</Button>
        </div>
      )}
    </div>
  );
}
