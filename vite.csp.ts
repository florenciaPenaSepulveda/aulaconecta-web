import type { Plugin } from "vite";

const origenDe = (url: string): string => {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
};

export const politicaDeContenido = (apiUrl: string): string =>
  [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    `connect-src 'self' ${origenDe(apiUrl)}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

export const contentSecurityPolicy = (apiUrl: string): Plugin => ({
  name: "content-security-policy",
  apply: "build",
  transformIndexHtml: (html) =>
    html.replace("</head>", `    <meta http-equiv="Content-Security-Policy" content="${politicaDeContenido(apiUrl)}" />\n  </head>`),
});
