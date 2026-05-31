# HealthLine

HealthLine is a starter implementation of the FHIR Patient Timeline Viewer described in the architecture docs. It connects a React/TypeScript frontend to a Node/Express proxy that searches the public HAPI FHIR R4 sandbox, normalizes patient resources into a timeline, and optionally sends that timeline to OpenAI for a plain-language summary.

## Stack

- Frontend: React, TypeScript, Vite, Zustand, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- FHIR: HAPI FHIR R4 public sandbox
- AI: OpenAI API, kept server-side
- Testing: Jest and React Testing Library

## Getting Started

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
cp .env.example .env
npm run dev
```

Client: http://localhost:5173

Server: http://localhost:3001

FHIR search and timeline endpoints work without credentials. The summary endpoint requires `OPENAI_API_KEY`.

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run lint
```

## API

- `GET /api/health`
- `GET /api/patients/search?q=smith`
- `GET /api/patients/:id/timeline`
- `POST /api/patients/:id/summary`

## Notes

This starter intentionally keeps UI primitives local instead of installing shadcn/ui-generated files up front. The folder layout mirrors the architecture document so generated shadcn components, SMART on FHIR auth, export flows, and richer detail panels can be added without reshaping the codebase.
