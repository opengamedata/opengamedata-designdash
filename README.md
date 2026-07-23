## Background

Field Day Lab processes rich gameplay data—population, session, and player features—via a data pipeline that outputs both TSV files and API endpoints. Currently, game designers, researchers, and educators lack an interactive, flexible way to explore and analyze these data, slowing insights and feedback loops. The Open Game Data visualization dashboard aims to empower educators, designers, and analysts to rapidly surface trends, patterns, and anomalies in game-based learning data.

## Key Features

1. **Multi-Visualization Support**
   - Pre-built components for histogram, bar chart, scatterplot, box plot, descriptive statistics, force graph, timeline.
   - Plugin interface for adding new chart types.
2. **Grid-Based UI**
   - Responsive, draggable/resizable panels using CSS Grid or a library (e.g., react-grid-layout).
   - Save and restore layout configurations.
3. **Data Source Selection**
   - Per-panel selector: choose between file upload or API endpoint.
   - Display validation errors for unsupported TSV schemas or API failures.
4. **File Upload & API Integration**
   - TSV parser with schema detection and mapping to feature sets.
   - Configurable API client supporting pagination and filter parameters.
5. **API Caching**
   - Implement caching layer in LocalStorage with TTL.
   - Cache invalidation controls (per-session or manual refresh).

## Technical Requirements

- **Framework:** React or Next.js with TypeScript.
- **State Management:** Zustand for layout, data-layer, and cache state.
- **Visualization Library:** D3.js.
- **Data Abstraction Layer:** Adapter pattern to normalize TSV and API responses into a common format.
- **Caching Strategy:** IndexedDB for dataset caching.
- **Testing:** Unit tests for components (Jest + React Testing Library); integration tests for data adapters.

## User Stories

- **As a designer**, I want to fetch player features via API and view a force graph, so I can trace player progression.
- **As a researcher**, I want to upload a session TSV file to generate a visualization dashboard, so I can inspect distribution of session durations.
- **As a stakeholder**, I want the dashboard to load cached data instantly on revisit, so I save time waiting for API calls.

## Assumptions & Constraints

- API schema may evolve; data adapter layer must handle minor breaking changes.
- TSV files follow a consistent feature naming convention; major schema shifts require manual adapter updates.
- Users have modern browsers supporting ES6 and LocalStorage.

## Running the App locally

Make sure you have node v22.17.1 (or newer) and npm v10.9.2 (or newer) install on your machine.

Copy `.env.example` to `.env.local` and optionally add your Google Analytics measurement ID (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) for usage tracking. Analytics only runs in production when the ID is set.

### Chat AI provider

The in-app assistant is **opt-in**. Set `AI_ASSISTANT_ENABLED=true` and `NEXT_PUBLIC_AI_ASSISTANT_ENABLED=true` in `.env.local` and configure a valid provider below. When the server flag is off or provider env vars are missing, `/api/chat` returns 503. When the public flag is off, the Assistant side panel is hidden.

| Variable | Required when | Purpose |
| -------- | ------------- | ------- |
| `AI_ASSISTANT_ENABLED` | Yes (to enable `/api/chat`) | Server master switch; unset or `false` disables the API |
| `NEXT_PUBLIC_AI_ASSISTANT_ENABLED` | Yes (to show Assistant UI) | Client build-time switch for the side panel |
| `AI_PROVIDER` | When assistant enabled (default `ollama`) | `ollama` or `openai` |
| `OLLAMA_MODEL` | `AI_PROVIDER=ollama` | Ollama model name |
| `OLLAMA_BASE_URL` | No | Custom Ollama host (default `http://127.0.0.1:11434`) |
| `OPENAI_API_KEY` | `AI_PROVIDER=openai` | OpenAI API key (server only) |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini` |

**Per-environment guidance:**

- **Local dev (with Ollama):** `AI_ASSISTANT_ENABLED=true`, `NEXT_PUBLIC_AI_ASSISTANT_ENABLED=true`, `AI_PROVIDER=ollama`, `OLLAMA_MODEL=<your-model>`
- **Cloud Run with LLM:** both assistant flags `true`, `AI_PROVIDER=openai`, plus Secret Manager `OPENAI_API_KEY`
- **Prod without LLM / static lab export:** both flags `false` (provider vars can be omitted)

Restart the dev server after changing env vars.

Install relevant npm packages:
`npm install`

For development:
`npm run dev`

Visit `localhost:3000` on your web broswer.

### Deploy targets

This repo supports two deploy paths that **coexist**:

| Target | How | Trigger |
| ------ | --- | ------- |
| **Lab static** (existing) | `DEPLOY_TARGET=static` (default) → static export + VPN/rsync | [`.github/workflows/CI_designdash.yml`](.github/workflows/CI_designdash.yml), [`RELEASE_designdash.yml`](.github/workflows/RELEASE_designdash.yml) |
| **Cloud Run** | `DEPLOY_TARGET=cloudrun` → Next.js standalone Node server | [`CI_validate.yml`](.github/workflows/CI_validate.yml), [`CD_cloudrun_staging.yml`](.github/workflows/CD_cloudrun_staging.yml), [`CD_cloudrun_prod.yml`](.github/workflows/CD_cloudrun_prod.yml) |

Local Cloud Run-style build:

```bash
DEPLOY_TARGET=cloudrun npm run build
```

Local Docker image (optional):

```bash
docker build \
  --build-arg DEPLOY_TARGET=cloudrun \
  --build-arg NEXT_PUBLIC_OGD_FILES_API_URL=https://example.com/api \
  -t designdash:local .
docker run --rm -p 8080:8080 \
  -e AI_ASSISTANT_ENABLED=false \
  designdash:local
```

## Cloud Run (staging + production)

v1 deploys two services only (no per-branch previews): `designdash-staging` and `designdash-prod`. Lab VPN/rsync workflows are unchanged.

### One-time GCP setup

1. Enable APIs: Cloud Run, Artifact Registry, IAM Credentials (for Workload Identity Federation). Secret Manager only if you later enable the assistant.
2. Create Artifact Registry Docker repo `ogd-dashboard` in your region (e.g. `us-central1-docker.pkg.dev/<project>/ogd-dashboard`).
3. Create a deploy service account with roles: `roles/run.admin`, `roles/artifactregistry.writer`, `roles/iam.serviceAccountUser`.
4. Configure [Workload Identity Federation](https://github.com/google-github-actions/auth#workload-identity-federation-through-a-service-account) so GitHub Actions can assume that service account (no JSON keys).
5. In the GitHub repo, create Environments **`cloudrun-staging`** and **`cloudrun-prod`** (optional approval on prod).

Optional (assistant off by default): create Secret Manager secret `designdash-openai-api-key` and grant the Cloud Run runtime SA `roles/secretmanager.secretAccessor` only when you set `CLOUDRUN_AI_ASSISTANT_ENABLED=true`.

### GitHub repository / environment variables

Set these repo (or environment-scoped) variables for the Cloud Run workflows:

| Variable | Purpose |
| -------- | ------- |
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_REGION` | e.g. `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full WIF provider resource name |
| `GCP_SERVICE_ACCOUNT` | Deployer service account email |
| `CLOUDRUN_OGD_FILES_API_URL` | Public HTTPS OGD Files API base URL (`NEXT_PUBLIC_OGD_FILES_API_URL`) |
| `CLOUDRUN_GA_ID` | Optional GA4 measurement ID |
| `CLOUDRUN_AI_ASSISTANT_ENABLED` | Leave unset/`false` (default). Only set `true` if enabling the assistant |
| `CLOUDRUN_AI_PROVIDER` | Only needed when assistant enabled (`openai`) |
| `CLOUDRUN_OPENAI_MODEL` | Only needed when assistant enabled (defaults to `gpt-4o-mini`) |

`NEXT_PUBLIC_*` values are also passed as Docker **build-args** (client bundles bake them in at image build time). Prefer environment-scoped vars if staging and prod need different API/GA values.

### Workflows

- **Validate** (`CI_validate.yml`): PR + push to `main` — install, lint (non-blocking while debt exists), test, `DEPLOY_TARGET=cloudrun` build. No deploy.
- **Staging** (`CD_cloudrun_staging.yml`): push to `main` — build/push image → deploy `designdash-staging` → smoke `GET /`.
- **Production** (`CD_cloudrun_prod.yml`): GitHub release (`released`) — same for `designdash-prod`.

Auth uses [`.github/actions/cloudrun_auth`](.github/actions/cloudrun_auth/action.yml) (WIF). Do not reuse `DesignDash_config` (lab static path only).

### Runtime notes

- Cloud Run listens on `$PORT` (image defaults to `8080`).
- Ollama is for local dev only; use OpenAI (or leave the assistant disabled) on Cloud Run.
- OGD Files API must be reachable from Cloud Run over public HTTPS in v1 (no Cloud VPN / private egress).
