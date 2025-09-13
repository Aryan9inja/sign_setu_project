<div align="center">

# RLS Guard Dog 🛡️🐾

Role-Based Row Level Security demo using Supabase RLS + Next.js App Router with teacher/student segregation, auditable update flows, and AI-powered progress coaching.

<strong>Students only see their own rows. Teachers see & update everything – and tests prove it.</strong>

<br/>

</div>

## 🚀 Overview
RLS Guard Dog is an internship assignment project showcasing secure data access patterns using **Supabase Row Level Security (RLS)** combined with a modern **Next.js 15 (App Router + Turbopack)** frontend. It enforces strict visibility and mutation rules across two core tables: `progress` and `classrooms`.

| Role | Can Read | Can Update |
|------|----------|------------|
| Student | Only their own `progress` & `classrooms` rows | Only their own rows (if allowed) – prevented from touching others |
| Teacher | All rows in both tables | Any student row (controlled + verified via RLS + guarded pages) |

An additional bonus feature gives students an **AI motivational review** of their current progress using OpenRouter (Llama model). 

## ✨ Key Features
- 🔐 **Row Level Security**: Supabase policies restrict selection & updates by role and row ownership.
- 👩‍🏫 **Teacher Control Panels**: Dedicated pages (`/update-progress`, `/update-classroom`) only accessible to teachers.
- 🧪 **Integration Tests**: Automated Vitest suite validates visibility + mutation policies for both roles.
- 🧭 **Protected Routing**: Auth guard components wrap sensitive pages; unauthorized users are redirected or blocked.
- 🗄️ **MongoDB Audit Logging**: Every teacher update writes a structured document to `activity_log` (action traceability).
- 🗃️ **Hybrid Data Stack**: Supabase Postgres for auth & relational tables + MongoDB for immutable operational audit trail.
- 🤖 **AI Progress Review**: Serverless route `/api/ai-review` delivers contextual motivational feedback.
- ⚡ **Modern Stack**: Next.js App Router, React 19, Tailwind (v4 PostCSS pipeline), TypeScript.

## 🧱 System Architecture
```
Next.js (App Router)
	├── Auth Layer (Supabase SSR + client helpers)
	├── Pages
	│   ├── / (landing / student view)
	│   ├── /dashboard (authenticated area)
	│   ├── /update-progress (teacher only)
	│   └── /update-classroom (teacher only)
	├── API Routes
	│   ├── /api/update-progress
	│   ├── /api/update-classroom
	│   └── /api/ai-review  (OpenRouter integration)
	└── Components (tables, auth provider, route guards)

Supabase
	├── Auth (students / teachers)
	├── Tables: progress, classrooms, users (with user_role)
	└── RLS Policies (see below)

MongoDB
	└── Audit log collection: activity_log (db: rls_guard_dog)
```

## 🛡️ RLS Policy Design (Conceptual)
While policies are defined in the Supabase dashboard, they follow these effective rules:

### progress
1. Students: `SELECT` where `user_id = auth.uid()`
2. Teachers: `SELECT` always allowed if role claim = 'teacher'
3. Student Updates: Allowed only on own row (or fully disabled depending on assignment scope)
4. Teacher Updates: Allowed for any row when role claim = 'teacher'

### classrooms
1. Students: `SELECT` where `user_id = auth.uid()`
2. Teachers: `SELECT` all
3. Updates mirror `progress` logic.

> The test suite (`tests/rls.test.ts`) asserts these invariants directly using signed JWTs for each role.

## 🧪 Testing Strategy
The integration tests use **Vitest** + the official Supabase JS client:

Test coverage highlights:
- Students only receive rows where `row.user_id === STUDENT_USER_ID`.
- Teachers receive multiple rows (system-wide visibility).
- Teachers can update student rows (progress + classrooms).
- Students attempting cross-user updates receive `null` mutation result (denied by RLS).

Run tests:
```bash
pnpm install
pnpm test
```

Ensure `.env.test` contains the role JWTs + identifiers (see Environment section).

## 🤖 AI Review Feature
Endpoint: `GET /api/ai-review?progress=NN`

Flow:
1. Accepts a `progress` percentage.
2. Crafts a tailored mentor-style prompt.
3. Calls OpenRouter (`meta-llama/llama-4-maverick:free`).
4. Returns a concise motivational string (no markdown / punctuation) to the UI.

Use Cases:
- Encourages students as they track progress.
- Highlights when progress is < 10% with a gentle nudge.

## 🔑 Authentication & Authorization
- Supabase handles user auth (email + password assumed through signup/login forms).
- A `users` table holds `user_role` (e.g., `student`, `teacher`).
- Client & server Supabase helpers (`supabaseClient.ts`, `supabaseServer.ts`) manage session propagation.
- Frontend `ProtectedRoute` component enforces auth gating; teacher-only pages additionally re-check role before rendering.

## 🧩 Core Components
- `AuthProvider` – React context for session state.
- `ProtectedRoute` – Redirects or blocks unauthenticated users.
- `ProgressTable` / `ClassroomsTable` – Student-facing filtered views.
- `UpdateProgressTable` / `UpdateClassroomTable` – Teacher CRUD surfaces.
- `ErrorMessage`, `LoadingSpinner`, `AccessDenied`, `PageHeader` – UI utilities.

## ⚙️ Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| UI | TailwindCSS (v4 pipeline) |
| Auth / DB / RLS | Supabase (Postgres + Policies) |
| Secondary Data | MongoDB (extensible) |
| AI | OpenRouter (Llama model) |
| Testing | Vitest |
| Forms | react-hook-form |

## 📂 Important Paths
```
src/
	app/
		api/ai-review/route.ts         # AI endpoint
		update-progress/page.tsx       # Teacher progress management
		update-classroom/page.tsx      # Teacher classroom management
	components/                      # UI + auth components
	lib/                             # Supabase + Mongo helpers
tests/
	rls.test.ts                      # Integration / policy tests
	utils/supabaseClients.ts         # Role-based clients
```

## 🛠️ Local Setup
```bash
git clone <repo-url>
cd sign_setu_project
pnpm install
cp example.env .env
cp example.env .env.test   # then edit test-specific secrets
pnpm dev
```
Visit: http://localhost:3000

### Scripts
```bash
pnpm dev     # Start dev server (Turbopack)
pnpm build   # Production build
pnpm start   # Run compiled build
pnpm lint    # ESLint
pnpm test    # Vitest integration tests
```

## 🔐 Environment Variables
From `example.env` (adjust values):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
MONGO_URI=...
OPENROUTER_API_KEY=...

# Testing only (.env.test)
STUDENT_EMAIL=...
STUDENT_PASSWORD=...
TEACHER_EMAIL=...
TEACHER_PASSWORD=...
TEST_CLASS=...               # sample classroom row id
STUDENT_USER_ID=...          # used in tests
OTHER_STUDENT_ID=...         # another student for negative update test
STUDENT_JWT=...              # pre-issued auth token for test client
TEACHER_JWT=...              # teacher token for test client
```

> Note: JWTs can be generated by authenticating once and copying the access token for deterministic test runs.

## �️ MongoDB Audit Logging
Teacher-triggered mutations (progress or classroom updates) are written to the `activity_log` collection for accountability and potential later analytics.

Sample document (`activity_log`):
```json
{
	"_id": "ObjectId(...)",
	"teacherId": "uuid-of-teacher",
	"studentId": "uuid-of-student",
	"activity": "UPDATE_PROGRESS", // or UPDATE_CLASSROOM
	"oldProgress": 54,              // present for progress updates
	"updatedProgress": 76,          // present for progress updates
	"oldData": {                    // present for classroom updates
		"class_name": "Physics",
		"grade": 6
	},
	"updatedData": {
		"class_name": "Chemistry Hons",
		"grade": 7
	},
	"timestamp": "2025-09-14T09:12:33.512Z" // suggested addition
}
```

> The schema is intentionally flexible so additional metadata (IP, user-agent, diff hash) can be appended without migration overhead.

## �🔄 Update Flow (Teacher Pages)
1. Teacher visits `/update-progress` or `/update-classroom`.
2. Role verification query: `select user_role from users where id = auth.uid()`.
3. All rows fetched with joined user info.
4. Edits issue authorized POST to internal API route including previous + new values.
5. Supabase RLS validates teacher privilege before mutation.
6. UI optimistic state update on success.

## 🧪 Example Policy Test (Excerpt)
```ts
const supabase = studentClient();
const { data } = await supabase.from('progress').select('*');
data!.forEach(r => expect(r.user_id).toBe(process.env.STUDENT_USER_ID));
```

## 🚧 Future Enhancements
- Enrich Mongo logs with user agent + IP + diff hash.
- Real-time subscriptions for live progress updates.
- Role management UI (promote / demote users).
- Cypress or Playwright end-to-end UI tests.
- Metrics dashboard (teacher engagement, progress distribution graphs).
- AI model fallback + caching layer.

## 🙌 Why This Project Matters
This codebase demonstrates practical, test-backed enforcement of least privilege at the data layer – a crucial production concern. It highlights an ability to design secure access patterns, implement full-stack features, and validate them with automated tests.

## 📄 License
Educational / assessment use. Add a formal license if extended.

## 👋 Contact / Follow-up
Happy to discuss implementation details, scaling strategy, or policy hardening approaches. Feel free to reach out for a walkthrough.

---
Made with curiosity, security focus, and a little AI ✨
