/**
 * Liste des passkeys enregistrées avec actions (renommer, supprimer).
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  FiEdit2,
  FiLoader,
  FiSmartphone,
  FiTrash2,
  FiCheck,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../useAuth";
import type { Passkey } from "../../types";
import { formatPasskeyDate } from "../../lib/passkeys";

export interface PasskeyListProps {
  /** Callback quand la liste change (après suppression) */
  onChanged?: () => void;
}

export function PasskeyList({ onChanged }: PasskeyListProps) {
  const { api } = useAuth();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listPasskeys();
      setPasskeys(list);
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Impossible de charger les passkeys"
        : "Impossible de charger les passkeys";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette passkey ? Cette action est irréversible.")) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deletePasskey(id);
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
      toast.success("Passkey supprimée");
      onChanged?.();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Échec de la suppression"
        : "Échec de la suppression";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (pk: Passkey) => {
    setEditingId(pk.id);
    setEditValue(pk.device_name ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (id: string) => {
    const name = editValue.trim();
    if (!name) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }
    setSavingId(id);
    try {
      const updated = await api.renamePasskey(id, name);
      setPasskeys((prev) =>
        prev.map((p) => (p.id === id ? { ...p, device_name: updated.device_name } : p)),
      );
      toast.success("Passkey renommée");
      cancelEdit();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.detail ?? "Échec du renommage"
        : "Échec du renommage";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: "center", color: "var(--auth-text-muted)" }}>
        <FiLoader style={{ animation: "auth-spin 1s linear infinite" }} />
        <span style={{ marginLeft: 8 }}>Chargement…</span>
      </div>
    );
  }

  if (passkeys.length === 0) {
    return (
      <div className="auth-empty-state">
        <FiSmartphone size={32} style={{ color: "var(--auth-text-muted)" }} />
        <p>Aucune passkey enregistrée.</p>
        <p className="auth-hint-text">
          Ajoutez-en une pour vous connecter sans mot de passe.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-passkey-list">
      {passkeys.map((pk) => (
        <div key={pk.id} className="auth-passkey-item">
          <div className="auth-passkey-icon">
            <FiSmartphone size={20} />
          </div>

          <div className="auth-passkey-content">
            {editingId === pk.id ? (
              <input
                type="text"
                className="auth-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                maxLength={100}
              />
            ) : (
              <>
                <div className="auth-passkey-name">
                  {pk.device_name ?? "Passkey sans nom"}
                </div>
                <div className="auth-passkey-meta">
                  Créée le {formatPasskeyDate(pk.created_at)}
                  {pk.last_used_at &&
                    ` · Dernière utilisation : ${formatPasskeyDate(pk.last_used_at)}`}
                </div>
              </>
            )}
          </div>

          <div className="auth-passkey-actions">
            {editingId === pk.id ? (
              <>
                <button
                  type="button"
                  className="auth-button auth-button--ghost"
                  onClick={() => saveEdit(pk.id)}
                  disabled={savingId === pk.id}
                  aria-label="Valider"
                >
                  {savingId === pk.id ? (
                    <FiLoader style={{ animation: "auth-spin 1s linear infinite" }} />
                  ) : (
                    <FiCheck />
                  )}
                </button>
                <button
                  type="button"
                  className="auth-button auth-button--ghost"
                  onClick={cancelEdit}
                  aria-label="Annuler"
                >
                  <FiX />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="auth-button auth-button--ghost"
                  onClick={() => startEdit(pk)}
                  aria-label="Renommer"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  className="auth-button auth-button--ghost"
                  onClick={() => handleDelete(pk.id)}
                  disabled={deletingId === pk.id}
                  aria-label="Supprimer"
                >
                  {deletingId === pk.id ? (
                    <FiLoader style={{ animation: "auth-spin 1s linear infinite" }} />
                  ) : (
                    <FiTrash2 />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
