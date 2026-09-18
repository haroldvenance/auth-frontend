/**
 * Vue complète pour gérer les passkeys : liste + ajout.
 *
 * Utilisation dans une page de paramètres :
 *   <PasskeyManager />
 */
import { useState } from "react";

import { PasskeyButton } from "./PasskeyButton";
import { PasskeyList } from "./PasskeyList";

export interface PasskeyManagerProps {
  title?: string;
  subtitle?: string;
}

export function PasskeyManager({
  title = "Passkeys",
  subtitle = "Connectez-vous sans mot de passe grâce à la biométrie ou à une clé de sécurité.",
}: PasskeyManagerProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="auth-container" style={{ maxWidth: 560 }}>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>

      <div style={{ marginBottom: 20 }}>
        <PasskeyButton
          mode="register"
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <PasskeyList key={refreshKey} onChanged={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
