import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../../src/components/ui/Button";

describe("Button", () => {
  it("affiche les enfants", () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Cliquer");
  });

  it("est désactivé quand loading", () => {
    render(<Button loading>Envoyer</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("est désactivé quand disabled", () => {
    render(<Button disabled>Envoyer</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("appelle onClick", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Cliquer</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("n'appelle pas onClick si disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Cliquer
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
