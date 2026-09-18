/**
 * Utilitaires de test : rendu avec AuthProvider et mock du client API.
 */
import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Toaster } from "sonner";

import { AuthProvider } from "../../src/AuthProvider";
import type { AuthConfig } from "../../src/types";

export interface RenderWithAuthOptions extends Omit<RenderOptions, "wrapper"> {
  config?: Partial<AuthConfig>;
}

export function renderWithAuth(
  ui: ReactElement,
  { config, ...options }: RenderWithAuthOptions = {},
) {
  const finalConfig: AuthConfig = {
    baseUrl: "http://test/api/v1/auth",
    ...config,
  };

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider config={finalConfig}>
        <Toaster />
        {children}
      </AuthProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
