import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithAuth } from "../../utils/render";
import { LoginForm } from "../../../src/components/auth/LoginForm";

// Mock du module axios pour éviter les appels réseau
vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        post: vi.fn(),
        get: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
      post: vi.fn(),
    },
    isAxiosError: actual.isAxiosError,
  };
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("affiche les champs email et mot de passe", () => {
    renderWithAuth(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });

  it("affiche une erreur si email invalide", async () => {
    const user = userEvent.setup();
    renderWithAuth(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.type(screen.getByLabelText(/mot de passe/i), "any");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
    });
  });

  it("affiche un lien mot de passe oublié", () => {
    const onForgotPassword = vi.fn();
    renderWithAuth(<LoginForm onForgotPassword={onForgotPassword} />);
    expect(screen.getByRole("button", { name: /mot de passe oublié/i })).toBeInTheDocument();
  });

  it("affiche un lien d'inscription", async () => {
    const onSignupClick = vi.fn();
    const user = userEvent.setup();
    renderWithAuth(<LoginForm onSignupClick={onSignupClick} />);

    await user.click(screen.getByRole("button", { name: /créer un compte/i }));
    expect(onSignupClick).toHaveBeenCalled();
  });
});
