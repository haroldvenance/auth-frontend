import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithAuth } from "../../utils/render";
import { VerificationGate } from "../../../src/components/auth/VerificationGate";

// Mock du hook useAuth
vi.mock("../../../src/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../../src/useAuth";

describe("VerificationGate", () => {
  it("affiche les enfants si vérifié", () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isVerified: true,
      loading: false,
    });
    renderWithAuth(
      <VerificationGate>
        <div>Contenu protégé</div>
      </VerificationGate>,
    );
    expect(screen.getByText("Contenu protégé")).toBeInTheDocument();
  });

  it("affiche le message de blocage si non vérifié", () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isVerified: false,
      loading: false,
    });
    renderWithAuth(
      <VerificationGate>
        <div>Contenu protégé</div>
      </VerificationGate>,
    );
    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
    expect(screen.getByText(/réservée aux comptes vérifiés/i)).toBeInTheDocument();
  });

  it("appelle onVerifyClick au clic", async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isVerified: false,
      loading: false,
    });
    const onVerifyClick = vi.fn();
    const user = userEvent.setup();

    renderWithAuth(
      <VerificationGate onVerifyClick={onVerifyClick}>
        <div>Contenu protégé</div>
      </VerificationGate>,
    );

    await user.click(screen.getByRole("button", { name: /vérifier mon compte/i }));
    expect(onVerifyClick).toHaveBeenCalled();
  });
});
