import { passwordError } from "./password";

describe("passwordError", () => {
  it("acepta contraseñas con letras y números", () => {
    expect(passwordError("Clave12345")).toBe("");
  });

  it("rechaza las muy cortas, las sin números o letras y las demasiado largas", () => {
    expect(passwordError("Ab1")).toMatch(/al menos 8/);
    expect(passwordError("soloLetrasAqui")).toMatch(/letras y números/);
    expect(passwordError("123456789")).toMatch(/letras y números/);
    expect(passwordError("a1".repeat(40))).toMatch(/72/);
  });
});
