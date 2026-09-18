/**
 * Affichage des codes de secours après l'activation du TOTP.
 *
 * Important : les codes ne sont affichés qu'UNE SEULE FOIS.
 * L'utilisateur doit les copier ou les télécharger maintenant.
 */
import { useState } from "react";
import { toast } from "sonner";
import { FiCopy, FiDownload, FiCheck } from "react-icons/fi";

import { Button } from "../ui/Button";
import { copyToClipboard, downloadRecoveryCodes } from "../../lib/totp";

export interface RecoveryCodesProps {
  codes: string[];
  onContinue?: () => void;
}

export function RecoveryCodes({ codes, onContinue }: RecoveryCodesProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(codes.join("\n"));
    if (ok) {
      setCopied(true);
      toast.success("Codes copiés");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Impossible de copier");
    }
  };

  const handleDownload = () => {
    downloadRecoveryCodes(codes);
    toast.success("Fichier téléchargé");
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Codes de secours</h1>
      <p className="auth-subtitle">
        Conservez ces codes en lieu sûr. Ils vous permettront de récupérer
        l'accès à votre compte si vous perdez votre téléphone.
      </p>

      <div className="auth-alert auth-alert--error" role="alert">
        <strong>⚠️ Ces codes ne seront plus jamais affichés.</strong>
        <br />
        Copiez-les ou téléchargez-les maintenant.
      </div>

      <div className="auth-recovery-grid">
        {codes.map((code, i) => (
          <div key={i} className="auth-recovery-code">
            <span className="auth-recovery-index">{i + 1}.</span>
            <code>{code}</code>
          </div>
        ))}
      </div>

      <div className="auth-row" style={{ gap: 8, marginTop: 16 }}>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? <FiCheck /> : <FiCopy />}
          {copied ? "Copié !" : "Copier"}
        </Button>
        <Button variant="secondary" onClick={handleDownload}>
          <FiDownload />
          Télécharger
        </Button>
      </div>

      <div style={{ marginTop: 24 }}>
        <label className="auth-checkbox-row">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span>
            J'ai conservé mes codes de secours en lieu sûr et je comprends
            qu'ils ne seront plus affichés.
          </span>
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <Button
          onClick={onContinue}
          disabled={!confirmed}
        >
          J'ai terminé
        </Button>
      </div>
    </div>
  );
}
