import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatRecoveryCode,
  copyToClipboard,
  downloadRecoveryCodes,
} from "../../src/lib/totp";

describe("formatRecoveryCode", () => {
  it("convertit en majuscules", () => {
    expect(formatRecoveryCode("abcd-ef01-2345")).toBe("ABCD-EF01-2345");
  });
});

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("copie via navigator.clipboard si disponible", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const result = await copyToClipboard("hello");
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });
});

describe("downloadRecoveryCodes", () => {
  it("crée un blob et déclenche le téléchargement", () => {
    // Mock URL.createObjectURL
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });

    // Mock document.createElement pour capturer le <a>
    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") {
        el.click = clickMock;
      }
      return el;
    });

    downloadRecoveryCodes(["AAAA-BBBB-CCCC", "DDDD-EEEE-FFFF"]);

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });
});
