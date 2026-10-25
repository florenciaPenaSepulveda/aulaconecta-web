# AulaConecta Web

Panel web por rol (profesor, apoderado y administrador) construido con React, Vite, Tailwind CSS y daisyUI.

## Desarrollo

```
cp .env.example .env
npm install
npm run dev
```

Disponible en `http://localhost:5173`. La URL de la API se configura con `VITE_API_URL` (por defecto `http://localhost:3000/graphql`).

## Pruebas

```
npm test
npm run test:cov
```

## Compilación

```
npm run build
```

## Diseño

- Tema corporativo `aulaconecta` definido en `tailwind.config.js` (azul institucional, acento dorado sobrio).
- Escala tipográfica y clases compartidas en `src/styles/index.css`.
- Botones: tamaño estándar para acciones principales y `btn-sm` para acciones dentro de tablas y tarjetas.
