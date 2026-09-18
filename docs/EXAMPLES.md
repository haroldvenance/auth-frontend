# Exemples d'intégration

## Exemple 1 : Application minimale

```tsx
import { AuthProvider, LoginForm, useAuth } from "@haroldvenance/auth-frontend";
import { Toaster } from "sonner";
import "@haroldvenance/auth-frontend/styles.css";

function App() {
  return (
    <AuthProvider config={{ baseUrl: "http://localhost:8000/api/v1/auth" }}>
      <Toaster />
      <Main />
    </AuthProvider>
  );
}

function Main() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Bienvenue {user?.display_name}</h1>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
