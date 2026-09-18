/**
 * Client API Axios avec intercepteurs.
 *
 * - Injecte automatiquement le Bearer token dans chaque requête
 * - Rafraîchit automatiquement l'access token en cas de 401
 * - Gère la file d'attente des requêtes pendant le refresh
 */
 
  
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type {
  AuthUser,
  OTPRequestPayload,
  OTPVerifyPayload,
  Passkey,
  RefreshResponse,
  RegisterRequest,
  TOTPSetupResponse,
  TOTPStatusResponse,
  TOTPVerifyResponse,
  TokenResponse,
  VerificationRequestResponse,
  VerificationStatus,
} from "../types";

export interface ApiClientHandlers {
  getAccessToken: () => string | null;
  onTokenRefresh: (token: string) => void;
  onLogout: () => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  clearRefreshToken: () => void;
}

export interface ApiClient {
  // Auth
  register: (data: RegisterRequest) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<TokenResponse>;
  logout: () => Promise<void>;
  getMe: () => Promise<AuthUser>;

  // OTP
  requestOTP: (payload: OTPRequestPayload) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (payload: OTPVerifyPayload) => Promise<{ success: boolean; message: string }>;

  // TOTP
  setupTOTP: () => Promise<TOTPSetupResponse>;
  verifyTOTP: (code: string) => Promise<TOTPVerifyResponse>;
  disableTOTP: (code: string) => Promise<void>;
  getTOTPStatus: () => Promise<TOTPStatusResponse>;

  // Passkeys
  listPasskeys: () => Promise<Passkey[]>;
  beginPasskeyRegistration: () => Promise<{ options: Record<string, unknown> }>;
  finishPasskeyRegistration: (
    credential: Record<string, unknown>,
    deviceName?: string,
  ) => Promise<Passkey>;
  beginPasskeyAuthentication: (email?: string) => Promise<{ options: Record<string, unknown> }>;
  finishPasskeyAuthentication: (
    credential: Record<string, unknown>,
  ) => Promise<TokenResponse & { user: AuthUser }>;
  deletePasskey: (id: string) => Promise<void>;
  renamePasskey: (id: string, deviceName: string) => Promise<Passkey>;

  // Vérification d'identité
  getVerificationStatus: () => Promise<VerificationStatus>;
  submitVerification: (formData: FormData) => Promise<VerificationRequestResponse>;
  resubmitVerification: (formData: FormData) => Promise<VerificationRequestResponse>;
}

export function createApiClient(
  baseUrl: string,
  handlers: ApiClientHandlers,
): ApiClient {
  const client: AxiosInstance = axios.create({
    baseURL: baseUrl,
    headers: { "Content-Type": "application/json" },
  });

  // === Intercepteur de requête : injecte le Bearer token ===
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = handlers.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // === Intercepteur de réponse : refresh automatique sur 401 ===
  let isRefreshing = false;
  let pendingQueue: Array<(token: string | null) => void> = [];

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Ne pas tenter le refresh pour les endpoints d'auth eux-mêmes
      const skipRefresh =
        originalRequest.url?.includes("/token") ||
        originalRequest.url?.includes("/refresh") ||
        originalRequest.url?.includes("/register");

      if (error.response?.status === 401 && !originalRequest._retry && !skipRefresh) {
        if (isRefreshing) {
          // File d'attente : attendre le refresh en cours
          return new Promise((resolve, reject) => {
            pendingQueue.push((token) => {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(client(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = handlers.getRefreshToken();
          if (!refreshToken) throw new Error("Pas de refresh token");

          const { data } = await axios.post<RefreshResponse>(
            `${baseUrl}/refresh`,
            { refresh_token: refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );

          handlers.onTokenRefresh(data.access_token);

          // Vider la file d'attente
          pendingQueue.forEach((cb) => cb(data.access_token));
          pendingQueue = [];

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return client(originalRequest);
        } catch (refreshError) {
          pendingQueue.forEach((cb) => cb(null));
          pendingQueue = [];
          handlers.onLogout();
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      throw error;
    },
  );

  return {
    // === Auth ===
    register: (data: RegisterRequest) =>
      client.post<AuthUser>("/register", data).then((r) => r.data),

    login: (email: string, password: string) => {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      return client
        .post<TokenResponse>("/token", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then((r) => r.data);
    },

    logout: () => {
      const refreshToken = handlers.getRefreshToken();
      if (!refreshToken) return Promise.resolve();
      return client
        .post("/logout", { refresh_token: refreshToken })
        .then(() => undefined);
    },

    getMe: () => client.get<AuthUser>("/me").then((r) => r.data),

    // === OTP ===
    requestOTP: (payload: OTPRequestPayload) =>
      client.post("/otp/request", payload).then((r) => r.data),

    verifyOTP: (payload: OTPVerifyPayload) =>
      client.post("/otp/verify", payload).then((r) => r.data),

    // === TOTP ===
    setupTOTP: () => client.post<TOTPSetupResponse>("/totp/setup").then((r) => r.data),

    verifyTOTP: (code: string) =>
      client.post<TOTPVerifyResponse>("/totp/verify", { code }).then((r) => r.data),

    disableTOTP: (code: string) =>
      client.post("/totp/disable", { code }).then(() => undefined),

    getTOTPStatus: () => client.get<TOTPStatusResponse>("/totp/status").then((r) => r.data),

    // === Passkeys ===
    listPasskeys: () => client.get<Passkey[]>("/passkeys").then((r) => r.data),

    beginPasskeyRegistration: () =>
      client.post("/passkeys/register/begin").then((r) => r.data),

    finishPasskeyRegistration: (credential, deviceName) =>
      client
        .post<Passkey>("/passkeys/register/finish", {
          credential,
          device_name: deviceName,
        })
        .then((r) => r.data),

    beginPasskeyAuthentication: (email?: string) =>
      client.post("/passkeys/authenticate/begin", { email }).then((r) => r.data),

    finishPasskeyAuthentication: (credential) =>
      client
        .post<TokenResponse & { user: AuthUser }>(
          "/passkeys/authenticate/finish",
          { credential },
        )
        .then((r) => r.data),

    deletePasskey: (id: string) =>
      client.delete(`/passkeys/${id}`).then(() => undefined),

    renamePasskey: (id: string, deviceName: string) =>
      client
        .patch<Passkey>(`/passkeys/${id}`, { device_name: deviceName })
        .then((r) => r.data),

    // === Vérification d'identité ===
    getVerificationStatus: () =>
      client.get<VerificationStatus>("/verification/status").then((r) => r.data),

    submitVerification: (formData: FormData) =>
      client
        .post<VerificationRequestResponse>("/verification/submit", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),

    resubmitVerification: (formData: FormData) =>
      client
        .post<VerificationRequestResponse>("/verification/resubmit", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
  };
}
