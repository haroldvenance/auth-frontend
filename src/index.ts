/**
 * Point d'entrée public du package @haroldvenance/auth-frontend.
 */

// === Provider et hook ===
export { AuthProvider, AuthContext } from "./AuthProvider";
export type { AuthProviderProps } from "./AuthProvider";
export { useAuth } from "./useAuth";

// === Protection de routes ===
export { ProtectedRoute } from "./components/ProtectedRoute";
export type { ProtectedRouteProps } from "./components/ProtectedRoute";

// === Composants d'authentification ===
export { LoginForm } from "./components/auth/LoginForm";
export type { LoginFormProps } from "./components/auth/LoginForm";
export { RegisterForm } from "./components/auth/RegisterForm";
export type { RegisterFormProps } from "./components/auth/RegisterForm";
export { OTPForm } from "./components/auth/OTPForm";
export type { OTPFormProps } from "./components/auth/OTPForm";

// === Composants UI ===
export { Button } from "./components/ui/Button";
export type { ButtonProps, ButtonVariant } from "./components/ui/Button";
export { Input } from "./components/ui/Input";
export type { InputProps } from "./components/ui/Input";

// === Client API ===
export { createApiClient } from "./api/client";
export type { ApiClient, ApiClientHandlers } from "./api/client";

// === Schémas Zod ===
export {
  emailSchema,
  passwordSchema,
  displayNameSchema,
  loginSchema,
  registerSchema,
  otpRequestSchema,
  otpVerifySchema,
} from "./lib/validation";
export type {
  LoginFormData,
  RegisterFormData,
  OTPRequestData,
  OTPVerifyData,
} from "./lib/validation";

// === Types ===
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