# Référence des composants

## `AuthProvider`

Fournit le contexte d'authentification à toute l'application.

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `config` | `AuthConfig` | — | Configuration (obligatoire) |
| `children` | `ReactNode` | — | Application enveloppée |

### `AuthConfig`

```typescript
{
  baseUrl: string;
  onLogin?: (user: AuthUser) => void;
  onLogout?: () => void;
  onError?: (error: Error) => void;
  storageKey?: string;
}
