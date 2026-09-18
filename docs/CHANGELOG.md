# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et respecte le [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-09-18

### Ajouté

- **AuthProvider** : contexte React global pour l'authentification
- **useAuth()** : hook principal
- **ProtectedRoute** : protection de routes avec option `requireVerified`
- **LoginForm** : connexion email + mot de passe
- **RegisterForm** : inscription avec confirmation
- **OTPForm** : connexion par code à usage unique (email)
- **TOTPForm** : enregistrement TOTP avec QR code
- **RecoveryCodes** : affichage et téléchargement des codes de secours
- **TOTPDisableForm** : désactivation du TOTP
- **TOTPStatusCard** : carte de statut TOTP
- **PasskeyButton** : enregistrement / connexion par passkey
- **PasskeyList** : liste des passkeys avec renommage et suppression
- **PasskeyManager** : vue complète de gestion
- **VerificationForm** : soumission de vérification d'identité (3 étapes)
- **VerificationStatusCard** : statut de la vérification
- **VerificationBanner** : bandeau d'avertissement
- **VerificationGate** : wrapper de restriction
- **Button** et **Input** : composants UI réutilisables
- **Validation Zod** : schémas pour tous les formulaires
- **Client API Axios** : intercepteurs avec refresh automatique
- **Utilitaires** : TOTP, passkeys, vérification
- **Styles par défaut** : personnalisables via variables CSS
- **36 tests unitaires** : validation, UI, composants auth

### Notes

- Compatible React 18 et 19
- TypeScript strict
- Support des passkeys nécessite HTTPS en production
