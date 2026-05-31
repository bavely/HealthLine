# Technical Decisions

## Proxy Server

The browser talks to the local Express API instead of the public FHIR server directly. This avoids CORS issues, keeps the OpenAI API key out of the client, and gives the app one place to normalize FHIR bundles.

## Live FHIR Data

The starter uses `https://hapi.fhir.org/baseR4` by default. It is public demo data, so records can be incomplete or inconsistent. The UI and summary prompt both treat missing fields as expected.

## State Management

Zustand stores keep patient search state, timeline entries, and filters separate. This keeps the UI easy to evolve as more timeline controls are added.

## AI Summary Guardrails

The summary prompt asks for plain language, glossary-style explanations, and explicit uncertainty when the data is sparse. It also forbids diagnosis or treatment recommendations.
