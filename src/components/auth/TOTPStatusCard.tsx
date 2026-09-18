/**
 * Carte de statut du TOTP avec actions contextuelles.
 *
 * Utilisation :
 *   <TOTPStatusCard
 *     onEnable={() => navigate("/settings/totp/setup")}
 *     onDisable={() => navigate("/settings/totp/disable")}
 *   />
 */
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { FiShield, FiShieldOff, FiLoader } from "react-icons/fi";

import { useAuth } from "../../useAuth";
import type { TOTPStatusResponse } from "../../types";
import { Button } from "../ui/Button";

export interface TOTPStatusCardProps {
  onEnable?: () => void;
  onDisable?: () => void;
  /** Callback appelé quand le statut est chargé */
  onStatusLoaded?: (status: TOTPStatusResponse) => void;
}

export function TOTPStatusCard({
  onEnable,
  onDisable,
  onStatusLoaded,
}: TOTPStatusCardProps) {
  const { api } = useAuth();
  const [status, setStatus] = useState<TOTPStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getTOTPStatus();
        if (cancelled) return;
        setStatus(data);
        onStatusLoaded?.(data);
      } catch (error) {
        if (cancelled) return;
        if (isAxiosError(error)) {
          console.error("Erreur chargement statut TOTP :", error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="auth-status-card">
        <FiLoader
          style={{ animation: "auth-spin 1s linear infinite" }}
        />
        <span style={{ marginLeft: 8 }}>Chargement…</span>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="auth-status-card">
      <div className="auth-status-icon">
        {status.enabled ? (
          <FiShield size={28} style={{ color: "var(--auth-success)" }} />
        ) : (
          <FiShieldOff size={28} style={{ color: "var(--auth-text-muted)" }} />
        )}
      </div>
      <div className="auth-status-content">
        <div className="auth-status-title">
          Double authentification (TOTP)
        </div>
        <div className="auth-status-subtitle">
          {status.enabled
            ? `Activée · ${status.recovery_codes_remaining} code(s) de secours restant(s)`
            : status.setup_in_progress
              ? "Enrôlement en cours…"
              : "Non activée"}
        </div>
      </div>
      <div className="auth-status-action">
        {status.enabled ? (
          <Button variant="secondary" onClick={onDisable}>
            Désactiver
          </Button>
        ) : (
          <Button onClick={onEnable}>Activer</Button>
        )}
      </div>
    </div>
  );
}
