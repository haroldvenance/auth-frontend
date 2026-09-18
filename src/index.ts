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


export { TOTPForm } from "./components/auth/TOTPForm";
export type { TOTPFormProps } from "./components/auth/TOTPForm";
export { RecoveryCodes } from "./components/auth/RecoveryCodes";
export type { RecoveryCodesProps } from "./components/auth/RecoveryCodes";
export { TOTPDisableForm } from "./components/auth/TOTPDisableForm";
export type { TOTPDisableFormProps } from "./components/auth/TOTPDisableForm";
export { TOTPStatusCard } from "./components/auth/TOTPStatusCard";
export type { TOTPStatusCardProps } from "./components/auth/TOTPStatusCard";


export { PasskeyButton } from "./components/auth/PasskeyButton";
export type { PasskeyButtonProps } from "./components/auth/PasskeyButton";
export { PasskeyList } from "./components/auth/PasskeyList";
export type { PasskeyListProps } from "./components/auth/PasskeyList";
export { PasskeyManager } from "./components/auth/PasskeyManager";
export type { PasskeyManagerProps } from "./components/auth/PasskeyManager";



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

export {
  formatRecoveryCode,
  copyToClipboard,
  downloadRecoveryCodes,
} from "./lib/totp";

export {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerPasskey,
  authenticateWithPasskey,
  formatPasskeyDate,
} from "./lib/passkeys";


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



