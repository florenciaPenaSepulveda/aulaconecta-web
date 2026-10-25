# AulaConecta · Web

Panel web de **AulaConecta**, plataforma de gestión escolar para profesores, apoderados y administración. Construido con React, Vite, TypeScript, Tailwind CSS y daisyUI, con un tema corporativo sobrio.

## Repositorios del proyecto

| Repositorio | Descripción |
|---|---|
| [aulaconecta-backend](https://github.com/florenciaPenaSepulveda/aulaconecta-backend) | API GraphQL y base de datos (necesaria para usar el panel) |
| **aulaconecta-web** (este) | Panel web por rol |
| [aulaconecta-app](https://github.com/florenciaPenaSepulveda/aulaconecta-app) | Aplicación móvil |

## Qué incluye

- **Profesor:** asignaturas, inscripción de estudiantes, registro de asistencia por fecha, calendario de asistencia (un cuadrado por estudiante y por día: verde presente, rojo ausente), notas, anuncios, mensajes y registro de estudiantes.
- **Apoderado:** resumen de pupilos, notas y asistencia por asignatura, anuncios y mensajes con los profesores.
- **Administrador:** todo lo anterior, más cursos, usuarios de cualquier rol y asistencia por curso, asignatura y estudiante.

## Requisitos

- Node.js 24 LTS (ver `.nvmrc`)
- El backend en ejecución (ver el README de [aulaconecta-backend](https://github.com/florenciaPenaSepulveda/aulaconecta-backend)) y datos de ejemplo cargados con `npm run seed`.

## Puesta en marcha

```
cp .env.example .env
npm install
npm run dev
```

Disponible en `http://localhost:5173`. La URL de la API se configura con `VITE_API_URL` (por defecto `http://localhost:3000/graphql`).

Usuarios de ejemplo, con contraseña `Demo1234`: `admin@aulaconecta.cl`, `profesor@aulaconecta.cl` y `apoderado@aulaconecta.cl`.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm test` | Pruebas |
| `npm run test:cov` | Pruebas con cobertura (umbral del 80 %; actual 99 %) |

## Diseño

- Tema `aulaconecta` definido en `tailwind.config.js`: azul institucional con acento dorado sobrio.
- Escala tipográfica y clases compartidas en `src/styles/index.css`.
- Botones: tamaño estándar para acciones principales y `btn-sm` dentro de tablas y tarjetas.

## Autoría

Proyecto académico desarrollado en equipo (originalmente ClosedAI); esta versión forma parte del portafolio de [Florencia Peña Sepúlveda](https://github.com/florenciaPenaSepulveda).
