import { contentSecurityPolicy, politicaDeContenido } from "./vite.csp";

describe("política de seguridad de contenido", () => {
  it("restringe los scripts y las conexiones a los orígenes necesarios", () => {
    const politica = politicaDeContenido("https://api.colegio.cl/graphql");
    expect(politica).toContain("script-src 'self'");
    expect(politica).not.toMatch(/script-src[^;]*unsafe/);
    expect(politica).toContain("connect-src 'self' https://api.colegio.cl");
    expect(politica).toContain("object-src 'none'");
    expect(politica).toContain("base-uri 'self'");
  });

  it("tolera una URL de API inválida sin abrir las conexiones", () => {
    expect(politicaDeContenido("no-es-url")).toContain("connect-src 'self'");
    expect(politicaDeContenido("no-es-url")).not.toContain("*");
  });

  it("inserta la política como meta en el HTML del build", () => {
    const plugin = contentSecurityPolicy("http://localhost:3000/graphql");
    const transformar = plugin.transformIndexHtml as (html: string) => string;
    const html = transformar("<html><head><title>x</title></head><body></body></html>");
    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain("connect-src 'self' http://localhost:3000");
    expect(plugin.apply).toBe("build");
  });
});
