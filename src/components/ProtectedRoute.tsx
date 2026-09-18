/**
 * ProtectedRoute — Protège une route en exigeant une authentification,
 * et optionnellement un compte vérifié.
 *
 * Utilisation :
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute requireVerified redirectTo="/verification">
 *     <PublishPage />
 *   </ProtectedRoute>
 */
import React from "react";
import { useAuth } from "../useAuth";

export interface ProtectedRouteProps {
  children: React.ReactNode;

  /** Redirige vers cette URL si non authentifié (par défaut : /login) */
  redirectTo?: string;

  /** Redirige vers cette URL si non vérifié */
  requireVerified?: boolean;

  /** Redirige vers cette URL si non vérifié (par défaut : /verification) */
  verificationRedirectTo?: string;

  /** Composant de chargement pendant la restauration de session */
  fallback?: React.ReactNode;

  /** Callback de redirection (par défaut : window.location.href = url) */
  onRedirect?: (url: string) => void;
}

export function ProtectedRoute({
  children,
  redirectTo = "/login",
  requireVerified = false,
  verificationRedirectTo = "/verification",
  fallback,
  onRedirect,
}: ProtectedRouteProps) {
  const { isAuthenticated, isVerified, loading } = useAuth();

  const redirect = (url: string) => {
    if (onRedirect) onRedirect(url);
    else if (typeof window !== "undefined") window.location.href = url;
  };

  // En cours de restauration
  if (loading) {
    return (
      <>
        {fallback ?? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              fontFamily: "system-ui, sans-serif",
              color: "#666",
            }}
          >
            Chargement…
          </div>
        )}
      </>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    redirect(redirectTo);
    return null;
  }

  // Non vérifié alors que requis
  if (requireVerified && !isVerified) {
    redirect(verificationRedirectTo);
    return null;
  }

  return <>{children}</>;
}
