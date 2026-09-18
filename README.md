# @haroldvenance/auth-frontend

Composants React réutilisables pour l'authentification : connexion, inscription, OTP, TOTP, Passkeys et vérification d'identité.

## ✨ Fonctionnalités

- 🔐 **Authentification de base** : connexion email/mot de passe, inscription, JWT
- 📧 **OTP par email** : code à 6 chiffres à usage unique
- 🔑 **TOTP** : Google Authenticator, Authy, codes de secours
- 🗝️ **Passkeys (WebAuthn)** : connexion sans mot de passe par biométrie
- 🪪 **Vérification d'identité** : soumission de documents avec suivi de statut
- 🛡️ **Protection de routes** : composant `ProtectedRoute` et `VerificationGate`
- 🎨 **Styles par défaut** : personnalisables via variables CSS
- 📦 **TypeScript** : types complets pour tous les composants
- ✅ **Testé** : 36 tests unitaires

## 📦 Installation

```bash
pnpm add @haroldvenance/auth-frontend
# ou
npm install @haroldvenance/auth-frontend
# ou
yarn add @haroldvenance/auth-frontend
