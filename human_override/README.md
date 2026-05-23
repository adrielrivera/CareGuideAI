# CareGuideAI

CareGuideAI is a frontend-only healthcare guidance prototype for an AI &
Ethics assignment.

## What it includes

- A research-aligned home page with trust badges, survey context, and visible disclaimers
- A symptom checker that asks only for minimal symptom context
- Frontend-only simulated urgency results: Low, Moderate, and Urgent
- Emergency red-flag guidance, human consultation reminders, trusted-source
  placeholders, and privacy / AI limitation sections
- Human override refinements for stronger privacy wording, safer disclaimer
  language, and clearer prototype-only source transparency
- Result-reset behaviour that clears stale urgency output when users change
  inputs, plus mutually exclusive handling for "None of the above" red flags

## Important note

This project intentionally does not provide automated diagnoses, medication
recommendations, treatment guidance, or real medical triage. It does not store
health information and should not be treated as medical advice, diagnosis, or
treatment guidance.

## Human override safety notes

- Users are reminded not to enter names, contact details, identification
  numbers, or highly sensitive medical history.
- Trusted-source cards are clearly marked as prototype-only placeholders, not
  live citations or proof of external medical approval or clinical validation.
- The frontend code does not use `localStorage`, `sessionStorage`, cookies,
  `fetch`, a backend, a database, or external medical APIs.
