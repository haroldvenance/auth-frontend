/**
 * Bouton d'enregistrement ou de connexion par passkey.
 *
 * Mode "register" : enregistre une nouvelle passkey (utilisateur connecté).
 * Mode "authenticate" : connecte l'utilisateur sans mot de passe.
 *
 * Utilisation :
 *   <PasskeyButton mode="register" onSuccess={(p) => console.log(p)} />
 *   <PasskeyButton mode="authenticate" onSuccess={(tokens) => …} />
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { FiKey } from "react-icons/fi";

import { useAuth } from "../../useAuth";
import {
  authenticateWithPasskey,
  isWebAuthnSupported,
  registerPasskey,
} from "../../lib/passkeys";
import { Button } from "../ui/Button";

export interface PasskeyButtonProps {
  /** "register" pour créer une passkey, "authenticate" pour se connecter */
  mode: "register" | "authenticate";

  /** Email optionnel pour restreindre les passkeys autorisées (mode authenticate) */
  email?: string;

  /** Nom de l'appareil (mode register) */
  deviceName?: string;

  /** Callback de succès */
  onSuccess?: (result: unknown) => void;

  /** Texte personnalisé */
  label?: string;
}

export function PasskeyButton({
  mode,
  email,
  deviceName,
  onSuccess,
  label,
}: PasskeyButtonProps) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isWebAuthnSupported());
  }, []);

  const defaultLabel =
    mode === "register" ? "Ajouter une passkey" : "Se connecter avec une passkey";

  if (!supported) {
    return null;
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      if (mode === "register") {
        // 1. Demander les options au serveur
        const { options } = await api.beginPasskeyRegistration();

        // 2. Lancer l'enregistrement dans le navigateur
        const credential = await registerPasskey(options);

        // 3. Finaliser côté serveur
        const passkey = await api.finishPasskeyRegistration(
          credential,
          deviceName,
        );
        toast.success("Passkey enregistrée");
        onSuccess?.(passkey);
      } else {
        // 1. Demander les options
        const { options } = await api.beginPasskeyAuthentication(email);

        // 2. Lancer l'authentification
        const credential = await authenticateWithPasskey(options);

        // 3. Finaliser côté serveur → tokens
        const result = await api.finishPasskeyAuthentication(credential);
        toast.success("Connecté par passkey");
        onSuccess?.(result);
      }
    } catch (error) {
      // L'utilisateur a annulé ou le navigateur a échoué
      const name = (error as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "AbortError") {
        toast.info("Opération annulée");
      } else {
        const message = isAxiosError(error)
          ? error.response?.data?.detail ?? "Échec de l'opération"
          : "Échec de l'opération";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={mode === "authenticate" ? "secondary" : "primary"}
      onClick={handleClick}
      loading={loading}
      type="button"
    >
      {!loading && <FiKey />}
      {label ?? defaultLabel}
    </Button>
  );
}
