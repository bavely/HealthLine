# HealthLine

HealthLine is a FHIR Patient Timeline Viewer that helps users search for patients, review clinical history in chronological order, and generate a plain-language AI summary of the available record. It connects a React/TypeScript frontend to a Node/Express API that searches the public HAPI FHIR R4 sandbox, normalizes clinical resources into a focused timeline, and uses OpenAI only for optional patient summaries.

The app is designed for education and care-navigation support. AI-generated summaries include a disclaimer and are not intended to replace clinician review, diagnosis, or treatment planning.

## Stack

- Frontend: React, TypeScript, Vite, Zustand, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- FHIR: HAPI FHIR R4 public sandbox
- AI: OpenAI API, kept server-side
- Testing: Jest and React Testing Library

## What The App Does

- Searches patients from a FHIR R4 server.
- Fetches encounters, conditions, medication requests, observations, procedures, and allergies.
- Normalizes noisy FHIR resources into consistent timeline entries.
- Displays clinical events with dates, status, details, values, and reference ranges when available.
- Generates an optional AI summary with a glossary of medical terms.
- Keeps the OpenAI API key on the server so it is never exposed to the browser.

## AI Token And Cost Management

HealthLine reduces AI usage cost by controlling when the model is called and how much data is sent to it.

- The AI model is called only by `POST /api/patients/:id/summary`. Patient search and timeline browsing do not use AI tokens.
- The server first converts full FHIR bundles into a compact timeline. The prompt sends only the fields needed for summarization: patient demographics, allergies, dates, event type, title, detail, status, and observation values.
- Large raw FHIR payloads are intentionally left out of the AI prompt. Timeline entries may keep the original resource internally for the app, but the summary prompt strips that data before sending it to OpenAI.
- The prompt asks for a focused JSON response with `summary`, `glossary`, and `disclaimer`, which helps keep output concise and predictable.
- The model is configurable with `OPENAI_MODEL`, and the default is `gpt-4o-mini`, a lower-cost model suitable for short plain-language summaries.
- The frontend sends the already-built timeline back to the summary endpoint when available, avoiding another full timeline fetch before summarization.

This approach keeps token usage tied to the actual summary feature instead of the whole app session, and it reduces prompt size by summarizing normalized clinical facts rather than sending complete FHIR records.

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
