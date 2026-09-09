# AI-Powered Form Builder & Document Autofill

A dynamic form builder that lets users create custom forms from scratch, upload a document (PDF/image), and have AI extract and autofill the form based on the schema the user defined — no hardcoded fields, works for any form type.

## Live Demo
🔗 **App:** https://ai-form-autofill.vercel.app/
🔗 **GitHub Repository:** https://github.com/Ruthwursun/ai-form-autofill
🔗 **Screen Recording:** https://drive.google.com/file/d/1vtwa8PPWEucGFSf5HcgzzG82Yqv495Rn/view?usp=sharing

## Tech Stack & Why

| Tech | Reason |
|---|---|
| React (Vite) | Fast dev server, component-based UI suited for a dynamic, stateful form builder |
| Tailwind CSS | Rapid styling without writing custom CSS for every component |
| Node.js + Express | Thin backend layer — its only job is to keep the Gemini API key off the client |
| Google Gemini (`gemini-flash-latest`) | Free tier with generous quota; natively multimodal (reads PDF and images directly) so no separate OCR step is needed |
| @dnd-kit | Lightweight drag-and-drop library for field reordering (bonus feature) |
| Vercel + Render | Frontend deployed on Vercel, backend deployed on Render as a separate service |

## Architecture Decision

The document is sent to Gemini as base64 directly — not parsed through an OCR/text-extraction library first. Gemini reads the file visually/natively, which means:
- One API call handles both PDFs and scanned images
- Simpler pipeline, fewer failure points
- No dependency on how well a separate OCR tool performs

The form schema (labels, types, required flags) is passed into the extraction prompt as JSON at runtime. This is what makes extraction fully dynamic — the same code path handles a resume, an invoice, or a medical intake form without any code changes.

**Note on model choice:** Originally built against `gemini-2.5-flash`. Mid-development, Google began phasing that model out for new API access ahead of its scheduled shutdown. Switched to the `gemini-flash-latest` alias, which automatically resolves to whichever flash-tier model is currently stable — a more resilient choice than pinning to a specific version number that can be deprecated.

**Note on reliability:** Gemini's free tier occasionally returns a 503 ("model overloaded") during high-demand periods. Added retry-with-backoff logic in the backend (up to 4 attempts, exponential delay) so transient overload errors are absorbed automatically rather than surfacing to the user.

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
# create a .env file with:
# VITE_API_URL=http://localhost:5000
npm run dev
```

Open the app at `http://localhost:5173` (or whatever port Vite prints). Backend must be running on `localhost:5000` for extraction to work locally.

## Deployment

- **Frontend:** Deployed on Vercel, root directory set to `client`
- **Backend:** Deployed on Render as a Web Service, root directory set to `server`
- Environment variables (`GEMINI_API_KEY` on Render, `VITE_API_URL` on Vercel) are set directly in each platform's dashboard — never committed to the repo
- Render's free tier spins down after inactivity; the first request after idle can take 30-50 seconds to respond while the server wakes up

## Features Implemented

- Dynamic form builder — add/remove fields, set label, type (text, textarea, number, date, dropdown, checkbox), required toggle, live preview
- Document upload with file type validation and clear error messages
- Schema-driven AI extraction via Gemini — no fixed/hardcoded fields
- Review & edit flow with confidence indicators (high/medium/low) per field
- Required fields with no match are visually flagged, not left silently blank
- Reset form and export form data as JSON
- Retry-with-backoff for transient AI model overload errors

## Edge Cases Handled

| Situation | Behavior |
|---|---|
| Upload attempted before building any fields | Blocked with a clear message to build the form first |
| Unsupported file type | Specific error message shown, upload rejected |
| Required field has no matching data | Left blank, visually highlighted in red |
| Number field with no numeric match | Left blank rather than guessed |
| AI not confident about a value | `found: false` returned — field left blank instead of hallucinating a value |
| Date fields with inconsistent AI-returned formats | Normalized through JS `Date` parsing before rendering, since native HTML date inputs only accept strict `YYYY-MM-DD` |
| Gemini API temporarily overloaded (503) | Backend retries automatically with exponential backoff before failing |

## Assumptions & Trade-offs

- No persistence/database layer — "Save form" currently logs the completed form data to the console. Given the time constraint, a full DB layer (e.g. SQLite/Postgres) was deprioritized in favor of getting the core extraction pipeline solid. A real implementation would persist to a database and expose a proper save/retrieve API.
- Gemini's free tier was chosen over a paid multimodal model (GPT-4V/Claude) primarily for cost — appropriate for an assessment/demo context. In production, I'd evaluate accuracy and reliability trade-offs against a paid tier, especially given free-tier rate limiting under high demand.
- Dropdown field matching requires an exact string match between the AI's extracted value and the dropdown's configured options to visually populate — a synonym or differently phrased match from the document would extract correctly in data but not auto-select in the UI. Would add fuzzy matching with more time.
