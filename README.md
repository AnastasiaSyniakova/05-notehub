# NoteHub

A Vite + React + TypeScript application for browsing, searching, creating, and deleting notes through the NoteHub API.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and replace the placeholder with your personal NoteHub token.
3. Start the app with `npm run dev`.

The token is sent to the API as `Authorization: Bearer <token>`. Add the same `VITE_NOTEHUB_TOKEN` environment variable to Vercel before deploying.
