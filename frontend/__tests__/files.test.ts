import { safeFileName } from "../src/utils/files";

describe("safeFileName", () => {
  it("keeps a normal pdf name", () => {
    expect(safeFileName("bca-601.pdf")).toBe("bca-601.pdf");
  });

  it("replaces spaces and unsafe characters", () => {
    expect(safeFileName("My Exam Paper (2024).pdf")).toBe(
      "My_Exam_Paper_2024_.pdf",
    );
  });

  it("adds the pdf extension when missing", () => {
    expect(safeFileName("notes")).toBe("notes.pdf");
  });

  it("keeps path traversal out of the name", () => {
    const name = safeFileName("../../etc/passwd");
    expect(name).not.toMatch(/[/\\]/);
    expect(name.startsWith(".")).toBe(false);
  });

  it("falls back for an empty name", () => {
    expect(safeFileName("   ")).toBe("document.pdf");
  });
});
