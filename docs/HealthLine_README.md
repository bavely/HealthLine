# HealthLine — FHIR Patient Timeline Viewer

An interactive patient history viewer that connects to FHIR R4 servers, displays clinical data as a navigable timeline, and uses AI to generate plain-language patient summaries. Built to demonstrate FHIR interoperability skills and healthcare AI integration.

## The Problem

Patient medical records are scattered across encounters, conditions, medications, labs, and procedures — each stored as separate FHIR resources. Clinicians and patients struggle to see the full picture. HealthLine transforms raw FHIR data into a visual timeline with AI-powered summaries that explain what happened, when, and why it matters.

## Architecture

![HealthLine Architecture](./docs/architecture.svg)

### Data Flow

1. User searches for a patient on the FHIR test server
2. Frontend requests the patient's clinical data through the Node.js proxy
3. Proxy fetches and normalizes FHIR resources: Patient, Condition, MedicationRequest, Observation, Encounter, Procedure, AllergyIntolerance
4. Frontend renders an interactive timeline grouped by encounter dates
5. User clicks "Summarize" to trigger AI analysis
6. Proxy assembles the FHIR data into a structured prompt and sends to OpenAI
7. GPT-4 returns a plain-language patient history summary with medical terms glossed

### Key Design Decisions

- **Public FHIR test server**: Uses HAPI FHIR's public R4 sandbox (https://hapi.fhir.org/baseR4) — no credentials, no real patient data, fully open for development and demos.
- **Proxy architecture**: The Node.js server sits between the frontend and FHIR server to handle CORS, normalize FHIR bundles into timeline-friendly shapes, and keep the OpenAI API key server-side.
- **Zustand for FHIR state**: Patient data involves multiple related resource types that need to stay in sync. Zustand stores manage the patient context, timeline entries (sorted chronologically), and filter state without Redux boilerplate.
- **AI guardrails**: The summarization prompt explicitly instructs the model to explain medical terminology in parentheses, avoid diagnosing, and note when data appears incomplete. A disclaimer accompanies every summary.
- **FHIR R4 compliance**: All resource parsing uses the official FHIR R4 type definitions. The normalizer extracts display-friendly fields while preserving coding references for detail views.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Zustand, shadcn/ui, Tailwind CSS, shadcn CLI, React Aria   |
| Backend | Node.js, Express, REST API |
| FHIR | HAPI FHIR R4 public sandbox |
| AI | OpenAI GPT-4 (patient history summarization) |
| Testing | Jest, React Testing Library |
| CI/CD | GitHub Actions |

## FHIR Resources Used

| Resource | What it shows | Timeline entry |
|----------|--------------|----------------|
| Patient | Demographics, identifiers | Profile header |
| Encounter | Visits, admissions | Primary timeline anchors |
| Condition | Diagnoses (active, resolved) | Condition onset markers |
| MedicationRequest | Prescriptions | Medication start/stop ranges |
| Observation | Lab results, vitals | Data points on timeline |
| Procedure | Surgeries, treatments | Event markers |
| AllergyIntolerance | Known allergies | Persistent sidebar badges |

## Project Structure

```
healthline/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + test + build
│       └── deploy.yml                # Production deploy
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientSearch/        # Search bar + patient list
│   │   │   ├── PatientHeader/        # Demographics + allergies
│   │   │   ├── Timeline/
│   │   │   │   ├── Timeline.tsx      # Main scrollable timeline
│   │   │   │   ├── TimelineEntry.tsx # Individual event card
│   │   │   │   ├── TimelineFilter.tsx# Resource type toggles
│   │   │   │   └── DateMarker.tsx    # Year/month separators
│   │   │   ├── AiSummary/           # Summary panel + disclaimer
│   │   │   ├── ResourceDetail/       # Expandable FHIR detail view
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── store/
│   │   │   ├── patient-store.ts      # Active patient + demographics
│   │   │   ├── timeline-store.ts     # Normalized timeline entries
│   │   │   └── filter-store.ts       # Resource type + date filters
│   │   ├── services/
│   │   │   └── api.ts                # Backend API client
│   │   ├── lib/
│   │   │   ├── fhir-normalizer.ts    # FHIR resource → timeline entry
│   │   │   ├── date-utils.ts         # FHIR date parsing helpers
│   │   │   └── resource-icons.ts     # Icon mapping per resource type
│   │   ├── types/
│   │   │   ├── fhir.ts              # FHIR R4 type definitions
│   │   │   └── timeline.ts          # App-specific timeline types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── __tests__/
│   │   ├── PatientSearch.test.tsx
│   │   ├── Timeline.test.tsx
│   │   ├── TimelineEntry.test.tsx
│   │   ├── AiSummary.test.tsx
│   │   └── fhir-normalizer.test.ts
│   ├── package.json
│   └── tsconfig.json
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── patients.ts           # GET /api/patients/search
│   │   │   ├── timeline.ts           # GET /api/patients/:id/timeline
│   │   │   └── summary.ts            # POST /api/patients/:id/summary
│   │   ├── services/
│   │   │   ├── fhirClient.ts         # HAPI FHIR API wrapper
│   │   │   ├── resourceFetcher.ts    # Parallel fetch + bundle parse
│   │   │   ├── timelineBuilder.ts    # Normalize + sort + group
│   │   │   └── aiSummarizer.ts       # GPT-4 summary generation
│   │   ├── prompts/
│   │   │   └── patientSummary.ts     # System prompt + few-shot
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts                  # Express app entry
│   ├── __tests__/
│   │   ├── fhirClient.test.ts
│   │   ├── timelineBuilder.test.ts
│   │   └── aiSummarizer.test.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── architecture.svg
│   ├── FHIR_RESOURCES.md             # Resource mapping documentation
│   └── TECHNICAL_DECISIONS.md
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key

No database required — FHIR data is fetched live from the public test server.

### 1. Clone and install
```bash
git clone https://github.com/bavely/healthline.git
cd healthline
npm install --workspaces
```

### 2. Configure environment
```bash
cp .env.example .env
```

Required variables:
```
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
OPENAI_API_KEY=sk-...
PORT=3001
```

### 3. Run the app
```bash
npm run dev               # Starts client + server concurrently
```

The app opens at http://localhost:5173. Search for any patient name — the HAPI test server has thousands of synthetic patient records.

## API Endpoints

### `GET /api/patients/search?q=smith`
Searches the FHIR server for patients matching the name. Returns normalized patient list with id, name, gender, birthDate.

### `GET /api/patients/:id/timeline`
Fetches all clinical resources for a patient in parallel (Condition, MedicationRequest, Observation, Encounter, Procedure, AllergyIntolerance), normalizes them into a unified timeline format, and returns them sorted chronologically.

```json
{
  "patient": {
    "id": "12345",
    "name": "John Smith",
    "gender": "male",
    "birthDate": "1965-04-12"
  },
  "allergies": ["Penicillin", "Sulfa drugs"],
  "entries": [
    {
      "id": "enc-001",
      "date": "2024-03-15",
      "type": "encounter",
      "title": "Office Visit",
      "detail": "Routine follow-up",
      "resources": [...]
    }
  ]
}
```

### `POST /api/patients/:id/summary`
Accepts the patient's timeline data, constructs a prompt with the clinical history, and returns a GPT-4-generated plain-language summary.

```json
{
  "summary": "John Smith is a 61-year-old male with a history of...",
  "glossary": [
    { "term": "Hypertension", "definition": "High blood pressure..." }
  ],
  "disclaimer": "This summary is AI-generated for educational purposes..."
}
```

## FHIR Resource Normalization

Each FHIR resource type is mapped to a common timeline entry shape:

```typescript
interface TimelineEntry {
  id: string;
  date: string;                    // ISO date from resource
  endDate?: string;                // For ranges (medications, conditions)
  type: 'encounter' | 'condition' | 'medication' | 'observation' | 'procedure';
  title: string;                   // Human-readable display
  detail?: string;                 // Additional context
  status?: string;                 // active, resolved, completed, etc.
  coding?: {                       // Original FHIR coding reference
    system: string;
    code: string;
    display: string;
  };
  values?: {                       // For observations (lab results)
    value: number;
    unit: string;
    referenceRange?: { low: number; high: number };
  };
}
```

## Testing
```bash
npm run test              # Run all tests
npm run test:client       # Frontend tests only
npm run test:server       # Backend tests only
```

Key test areas:
- FHIR normalizer: ensures each resource type maps correctly to timeline entries
- Timeline sorting: validates chronological ordering across resource types
- AI summarizer: tests prompt construction and response parsing
- Component tests: PatientSearch, Timeline rendering, filter interactions

## Future Enhancements
- SMART on FHIR (OAuth2) authentication for connecting to real FHIR servers
- PDF export of timeline + AI summary
- Medication timeline with dosage change tracking
- Lab result trend charts (Observation values over time)
- Multi-patient comparison view

## License
MIT
