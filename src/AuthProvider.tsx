/**
 * AuthProvider — Contexte React global pour l'authentification.
 *
 * Utilisation :
 *   <AuthProvider config={{ baseUrl: "http://localhost:8000/api/v1/auth" }}>
 *     <App />
 *   </AuthProvider>
 */
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createApiClient, type ApiClient } from "./api/client";
import type {
  AuthConfig,
  AuthContextValue,
  AuthUser,
  RegisterRequest,
} from "./types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_STORAGE_KEY = "auth_refresh_token";

export interface AuthProviderProps {
  children: React.ReactNode;
  config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const storageKey = config.storageKey ?? DEFAULT_STORAGE_KEY;

  // === Helpers de stockage ===
  const getRefreshToken = useCallback(
    () => localStorage.getItem(storageKey),
    [storageKey],
  );
  const setRefreshToken = useCallback(
    (token: string) => localStorage.setItem(storageKey, token),
    [storageKey],
  );
  const clearRefreshToken = useCallback(
    () => localStorage.removeItem(storageKey),
    [storageKey],
  );

  // === Client API (créé une seule fois, handlers stables via useRef) ===
  const handlersRef = useRef({
    getAccessToken: () => accessToken,
    onTokenRefresh: (token: string) => setAccessToken(token),
    onLogout: () => {
      setUser(null);
      setAccessToken(null);
      clearRefreshToken();
      config.onLogout?.();
    },
    getRefreshToken,
    setRefreshToken,
    clearRefreshToken,
  });

  // Mise à jour des handlers à chaque render (pour capturer le bon accessToken)
  handlersRef.current.getAccessToken = () => accessToken;

  const api: ApiClient = useMemo(
    () =>
      createApiClient(config.baseUrl, {
        getAccessToken: () => handlersRef.current.getAccessToken(),
        onTokenRefresh: (token) => handlersRef.current.onTokenRefresh(token),
        onLogout: () => handlersRef.current.onLogout(),
        getRefreshToken: () => handlersRef.current.getRefreshToken(),
        setRefreshToken: (token) => handlersRef.current.setRefreshToken(token),
        clearRefreshToken: () => handlersRef.current.clearRefreshToken(),
      }),
    [config.baseUrl],
  );

  // === Restauration de session au montage ===
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await fetch(`${config.baseUrl}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }).then(async (r) => {
          if (!r.ok) throw new Error("Refresh échoué");
          return { data: await r.json() };
        });

        if (cancelled) return;
        setAccessToken(data.access_token);

        // Récupérer le profil avec le nouveau token
        const meRes = await fetch(`${config.baseUrl}/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        if (!meRes.ok) throw new Error("Fetch profil échoué");
        const me = (await meRes.json()) as AuthUser;

        if (cancelled) return;
        setUser(me);
      } catch {
        clearRefreshToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Actions ===
  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const tokens = await api.login(email, password);
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);

      const me = await api.getMe();
      setUser(me);
      config.onLogin?.(me);
      return me;
    },
    [api, config, setRefreshToken],
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<AuthUser> => {
      const newUser = await api.register(data);
      // Connexion automatique après inscription
      await login(data.email ?? "", data.password);
      return newUser;
    },
    [api, login],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore les erreurs de logout
    } finally {
      setUser(null);
      setAccessToken(null);
      clearRefreshToken();
      config.onLogout?.();
    }
  }, [api, clearRefreshToken, config]);

  // === Valeur du contexte ===
  const value: AuthContextValue = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isVerified: user?.is_verified ?? false,
      login,
      register,
      logout,
      api,
    }),
    [user, loading, login, register, logout, api],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
