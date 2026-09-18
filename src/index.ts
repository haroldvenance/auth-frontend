/**
 * Point d'entrée public du package @haroldvenance/auth-frontend.
 */
export { AuthProvider, AuthContext } from "./AuthProvider";
export type { AuthProviderProps } from "./AuthProvider";
export { useAuth } from "./useAuth";
export { ProtectedRoute } from "./components/ProtectedRoute";
export type { ProtectedRouteProps } from "./components/ProtectedRoute";
export { createApiClient } from "./api/client";
export type { ApiClient, ApiClientHandlers } from "./api/client";

// Types
export type {
  AuthConfig,
  AuthContextValue,
  AuthUser,
  DocumentType,
  LoginRequest,
  OTPRequestPayload,
  OTPVerifyPayload,
  Passkey,
  RefreshResponse,
  RegisterRequest,
  TokenResponse,
  TOTPSetupResponse,
  TOTPStatusResponse,
  TOTPVerifyResponse,
  VerificationLatestInfo,
  VerificationRequestResponse,
  VerificationStatus,
} from "./types";
