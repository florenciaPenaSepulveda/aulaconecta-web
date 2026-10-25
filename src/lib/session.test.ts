import { loadSession, normalizeRole, saveSession } from "./session";

const session = { token: "t", id: 3, role: "teacher" as const, firstName: "Ana", isChangePassword: false };

describe("session", () => {
  it("guarda, carga y elimina la sesión", () => {
    expect(loadSession()).toBeNull();
    saveSession(session);
    expect(loadSession()).toEqual(session);
    saveSession(null);
    expect(loadSession()).toBeNull();
  });

  it("normaliza el rol a minúsculas", () => {
    expect(normalizeRole("Teacher")).toBe("teacher");
  });

  it("tolera un almacenamiento inutilizable", () => {
    localStorage.setItem("aulaconecta.session", "{no-json");
    expect(loadSession()).toBeNull();
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("lleno");
    });
    expect(() => saveSession(session)).not.toThrow();
    spy.mockRestore();
  });
});
