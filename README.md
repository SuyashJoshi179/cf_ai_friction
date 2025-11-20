# Friction

**Friction** is an AI-powered experiment in improving online discourse. It acts as a "cognitive speed bump" for toxic comments.

Instead of simply censoring speech, Friction intervenes when a user attempts to post a toxic comment. It forces them to prove they have actually read and understood the content they are attacking by passing a reading comprehension quiz generated in real-time by AI.

## How it Works

1.  **Intercept**: When a user posts a comment, it is sent to a Cloudflare Worker.
2.  **Analyze**: Workers AI (Llama 3.3) analyzes the sentiment.
3.  **Challenge**: If toxic, the AI generates a 3-question quiz based on the article.
4.  **Verify**: The comment is held in a Durable Object "Vault" until the user passes the quiz.
5.  **Release**: If the user passes, the comment is posted.

## Tech Stack

-   **Backend**: Cloudflare Workers (Hono)
-   **AI**: Workers AI (@cf/meta/llama-3.3-70b-instruct-fp8-fast)
-   **State**: Durable Objects
-   **Frontend**: React + Vite + TypeScript

## Local Development

### Prerequisites
-   Node.js (v20+)
-   Cloudflare Account (for Workers AI)

### 1. Backend Setup
```bash
cd friction-app/backend
npm install
npx wrangler dev
```
The backend will run on `http://localhost:8787`.

### 2. Frontend Setup
```bash
cd friction-app/frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Deployment

### Deploy Backend
```bash
cd friction-app/backend
npx wrangler deploy
```
Note the URL of your deployed worker (e.g., `https://friction-backend.your-name.workers.dev`). You will need to update the API URL in `frontend/src/App.tsx` before deploying the frontend.

### Deploy Frontend
```bash
cd friction-app/frontend
npm run build
npx wrangler pages deploy dist --project-name friction
```
