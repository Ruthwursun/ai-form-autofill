# AI-Powered Form Builder & Document Autofill

A dynamic form builder that lets users create custom forms from scratch, upload a document (PDF/image), and have AI extract and autofill the form based on the schema the user defined — no hardcoded fields, works for any form type.

## Demo
[Add screenshot(s) or screen recording link here]

## Tech Stack & Why

| Tech | Reason |
|---|---|
| React (Vite) | Fast dev server, component-based UI suited for a dynamic, stateful form builder |
| Tailwind CSS | Rapid styling without writing custom CSS for every component |
| Node.js + Express | Thin backend layer — its only job is to keep the Gemini API key off the client |
| Google Gemini 1.5 Flash | Free tier with generous quota; natively multimodal (reads PDF and images directly) so no separate OCR step is needed |
| @dnd-kit | Lightweight drag-and-drop library for field reordering (bonus feature) |

## Architecture Decision

The document is sent to Gemini as base64 directly — not parsed through an OCR/text-extraction library first. Gemini reads the file visually/natively, which means:
- One API call handles both PDFs and scanned images
- Simpler pipeline, fewer failure points
- No dependency on how well a separate OCR tool performs

The form schema (labels, types, required flags) is passed into the extraction prompt as JSON at runtime. This is what makes extraction fully dynamic — the same code path handles a resume, an invoice, or a medical intake form without any code changes.

## How to Run Locally

### Backend
```bash
cd server
npm install
# create a .env file with:
# GEMINI_API_KEY=your_key_here
# PORT=5000
node server.js
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open the app at `http://localhost:5173` (or whatever port Vite prints). Backend must be running on `localhost:5000` for extraction to work.

## Features Implemented

- Dynamic form builder — add/remove fields, set label, type (text, textarea, number, date, dropdown, checkbox), required toggle, live preview
- Document upload with file type validation and clear error messages
- Schema-driven AI extraction via Gemini — no fixed/hardcoded fields
- Review & edit flow with confidence indicators (high/medium/low) per field
- Required fields with no match are visually flagged, not left silently blank
- Reset form and download form data as JSON
- [Add any bonus features you completed — drag-and-drop reorder, templates, import schema, etc.]

## Edge Cases Handled

| Situation | Behavior |
|---|---|
| Upload attempted before building any fields | Blocked with a clear message to build the form first |
| Unsupported file type | Specific error message shown, upload rejected |
| Required field has no matching data | Left blank, visually highlighted in red |
| Number field with no numeric match | Left blank rather than guessed |
| AI not confident about a value | `found: false` returned — field left blank instead of hallucinating a value |

## Assumptions & Trade-offs

- No persistence/database layer — "Save form" currently logs the completed form data to the console. Given the time constraint, a full DB layer (e.g. SQLite/Postgres) was deprioritized in favor of getting the core extraction pipeline solid. A real implementation would persist to a database and expose a proper save/retrieve API.
-Gemini 2.5 Flash was chosen over a paid model (GPT-4V/Claude) primarily for cost — appropriate for an assessment/demo context. In production, I'd evaluate accuracy trade-offs against a paid multimodal model for higher-stakes documents.

## Repository
https://github.com/Ruthwursun/ai-form-autofill.git