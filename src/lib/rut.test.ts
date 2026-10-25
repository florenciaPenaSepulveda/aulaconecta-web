import { cleanRut, formatRut, isValidRut } from "./rut";

describe("rut", () => {
  it("limpia caracteres no válidos y limita el largo", () => {
    expect(cleanRut("12.345.678-k")).toBe("12345678K");
    expect(cleanRut("1234567890123")).toHaveLength(9);
  });

  it("formatea con puntos y guion", () => {
    expect(formatRut("123456785")).toBe("12.345.678-5");
    expect(formatRut("1")).toBe("1");
    expect(formatRut("")).toBe("");
  });

  it("valida el dígito verificador", () => {
    expect(isValidRut("12.345.678-5")).toBe(true);
    expect(isValidRut("12.345.678-9")).toBe(false);
    expect(isValidRut("123")).toBe(false);
  });

  it("acepta K y 0 como dígitos verificadores", () => {
    expect(isValidRut("23.232.323-K")).toBe(true);
    expect(isValidRut("10.000.013-0")).toBe(false);
    expect(isValidRut("11.111.111-1")).toBe(true);
    expect(isValidRut("20.000.007-0")).toBe(false);
    expect(isValidRut("6.000.000-0")).toBe(false);
    expect(isValidRut("21.234.567-8")).toBe(false);
  });
});
