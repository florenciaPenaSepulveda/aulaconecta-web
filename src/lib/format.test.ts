import { average, formatDate, formatGrade, formatTime, gradeTone, initials } from "./format";

describe("format", () => {
  it("formatea fecha y hora en español", () => {
    expect(formatDate("2026-10-24T15:30:00")).toMatch(/2026/);
    expect(formatTime("2026-10-24T15:30:00")).toMatch(/15:30|03:30/);
  });

  it("formatea notas y promedios", () => {
    expect(formatGrade(5.64)).toBe("5.6");
    expect(formatGrade(0)).toBe("-");
    expect(average([4, 6])).toBe(5);
    expect(average([])).toBe(0);
  });

  it("elige el tono según la nota", () => {
    expect(gradeTone(0)).toBe("badge-ghost");
    expect(gradeTone(4)).toBe("badge-success");
    expect(gradeTone(3.9)).toBe("badge-error");
  });

  it("obtiene las iniciales", () => {
    expect(initials("ana", "perez")).toBe("AP");
    expect(initials("ana")).toBe("A");
  });
});
