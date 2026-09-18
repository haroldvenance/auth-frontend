import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "../../../src/components/ui/Input";

describe("Input", () => {
  it("affiche un label", () => {
    render(<Input label="Mon label" />);
    expect(screen.getByText("Mon label")).toBeInTheDocument();
  });

  it("affiche une erreur", () => {
    render(<Input label="Email" error="Email invalide" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Email invalide");
  });

  it("affiche un hint si pas d'erreur", () => {
    render(<Input label="Email" hint="Utilisez votre email pro" />);
    expect(screen.getByText("Utilisez votre email pro")).toBeInTheDocument();
  });

  it("n'affiche pas le hint si une erreur est présente", () => {
    render(<Input label="Email" hint="Hint" error="Erreur" />);
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
  });

  it("toggle le type password", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(<Input label="Mot de passe" type="password" togglePassword />);
    const input = screen.getByLabelText("Mot de passe") as HTMLInputElement;
    expect(input.type).toBe("password");

    const toggle = screen.getByRole("button", { name: /afficher/i });
    await user.click(toggle);
    expect(input.type).toBe("text");
  });
});
