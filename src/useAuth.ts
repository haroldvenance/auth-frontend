/**
 * Hook principal pour consommer le contexte d'authentification.
 *
 * Utilisation :
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un <AuthProvider>.",
    );
  }
  return context;
}
