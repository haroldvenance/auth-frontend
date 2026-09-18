/**
 * Types TypeScript partagés par tous les composants du module.
 */

// ============================================================
// Utilisateur
// ============================================================
export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string;
  is_active: boolean;
  is_verified: boolean;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  totp_enabled: boolean;
  created_at: string;
  last_login_at: string | null;
}

// ============================================================
// Tokens
// ============================================================
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ============================================================
// Requêtes
// ============================================================
export interface RegisterRequest {
  email?: string;
  phone?: string;
  display_name: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface OTPRequestPayload {
  email: string;
  purpose?: "login" | "verify_email" | "reset_password";
}

export interface OTPVerifyPayload {
  email: string;
  code: string;
  purpose?: "login" | "verify_email" | "reset_password";
}

// ============================================================
// TOTP
// ============================================================
export interface TOTPSetupResponse {
  secret: string;
  otpauth_url: string;
  qr_code_data_url: string;
}

export interface TOTPVerifyResponse {
  success: boolean;
  message: string;
  recovery_codes: string[] | null;
}

export interface TOTPStatusResponse {
  enabled: boolean;
  recovery_codes_remaining: number;
  setup_in_progress: boolean;
}

// ============================================================
// Passkeys
// ============================================================
export interface Passkey {
  id: string;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

// ============================================================
// Vérification d'identité
// ============================================================
export interface VerificationLatestInfo {
  id: string;
  status: string;
  document_type: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export interface VerificationStatus {
  status: "unverified" | "pending" | "verified" | "rejected";
  is_verified: boolean;
  attempts: number;
  max_attempts: number;
  latest_request: VerificationLatestInfo | null;
}

export interface VerificationRequestResponse {
  id: string;
  full_name: string;
  document_type: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export type DocumentType =
  | "cni"
  | "passport"
  | "student_card"
  | "school_card"
  | "livret"
  | "driver_license"
  | "other";

// ============================================================
// Configuration du AuthProvider
// ============================================================
export interface AuthConfig {
  /** URL de base de l'API d'authentification (ex: http://localhost:8000/api/v1/auth) */
  baseUrl: string;

  /** Callback appelé après une connexion réussie */
  onLogin?: (user: AuthUser) => void;

  /** Callback appelé après une déconnexion */
  onLogout?: () => void;

  /** Callback appelé en cas d'erreur non gérée */
  onError?: (error: Error) => void;

  /** Clé de stockage local du refresh token (par défaut : "auth_refresh_token") */
  storageKey?: string;
}

// ============================================================
// Contexte d'authentification
// ============================================================
export interface AuthContextValue {
  /** L'utilisateur connecté, ou null */
  user: AuthUser | null;

  /** Indique si la session est en cours de restauration au chargement */
  loading: boolean;

  /** Indique si un utilisateur est connecté */
  isAuthenticated: boolean;

  /** Indique si le compte de l'utilisateur est vérifié */
  isVerified: boolean;

  /** Connexion par email + mot de passe */
  login: (email: string, password: string) => Promise<AuthUser>;

  /** Inscription */
  register: (data: RegisterRequest) => Promise<AuthUser>;

  /** Déconnexion */
  logout: () => Promise<void>;

  /** Client API pour les appels personnalisés */
  api: import("./api/client").ApiClient;
}
