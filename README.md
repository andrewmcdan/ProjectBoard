# ProjectBoard

ProjectBoard is a server-rendered project, feature, and issue tracker for students and small teams. It combines project membership, a three-column work board, assignments, priorities, due dates, labels, linked issues and features, Markdown descriptions, and team discussion in one application.

The application is built with Next.js 16, React 19, Auth.js, Prisma, and MariaDB. Reads and writes happen on the server. A browser never connects directly to MariaDB, and project data is returned only after the server verifies the signed-in user's membership.

## Table of contents

- [What the application does](#what-the-application-does)
- [How the application works](#how-the-application-works)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database setup and lifecycle](#database-setup-and-lifecycle)
- [Development workflow](#development-workflow)
- [Application routes](#application-routes)
- [Authentication and authorization](#authentication-and-authorization)
- [Data model](#data-model)
- [Server actions and mutations](#server-actions-and-mutations)
- [Testing](#testing)
- [Production build](#production-build)
- [Docker](#docker)
- [Minikube](#minikube)
- [k3s](#k3s)
- [Security guidance](#security-guidance)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Current limitations](#current-limitations)

## What the application does

### Accounts

- Register with a name, email address, and password.
- Sign in and out with Auth.js credentials authentication.
- Change the current password after confirming the old password.
- Store passwords as salted `scrypt` hashes rather than plain text or reversible encryption.

### Projects and teams

- Create a project with a name, description, and initial team.
- Become the `OWNER` automatically when creating a project.
- Add registered users as `MEMBER` records by email address.
- Show only projects for which the signed-in user has a membership.
- Allow only the project owner to edit project details and membership.
- Display project, issue, feature, member, open-work, and completion totals.

### Issues and features

- Track issues and features as separate first-class record types.
- Move both record types through `TODO`, `IN_PROGRESS`, and `DONE` states.
- Set `LOW`, `MEDIUM`, or `HIGH` priority.
- Assign work to a project member or leave it unassigned.
- Add an optional due date.
- Write descriptions using Markdown.
- Link an issue to an optional parent feature.
- View issues and features together on the same project board while retaining type-specific detail pages.

### Labels and discussion

- Create starter labels automatically with each project.
- Attach multiple project labels to issues and features.
- Add Markdown comments to an issue or feature.
- Show comment authors and timestamps.
- Allow only the comment author, while still a project member, to delete that comment.

## How the application works

```mermaid
flowchart LR
    B[Browser] -->|HTTP request or form submission| N[Next.js server]
    N -->|Session validation| A[Auth.js]
    N -->|Authorized reads and writes| P[Prisma Client]
    P --> M[(MariaDB)]
    N -->|Server-rendered HTML| B
```

1. A browser requests a route or submits a form.
2. A Next.js server component or server action receives the request.
3. Auth.js reads and verifies the signed session token.
4. Protected operations call `requireUser()` or `requireProjectMember()`.
5. Prisma sends a parameterized query or transaction to MariaDB.
6. Next.js renders the result on the server and returns HTML.
7. Mutations revalidate affected routes before redirecting the user.

Most pages are server components. `components/primary-nav.js` and `components/new-work-picker.js` are client components because they need the current browser pathname or client-side navigation.

## Technology stack

| Technology | Purpose |
| --- | --- |
| Next.js 16.2.9 | App Router, server components, server actions, routing, production build |
| React 19.2.0 | Component rendering and reusable interface composition |
| Auth.js / NextAuth 5 beta | Credentials sign-in, signed JWT sessions, login/logout helpers |
| Prisma 6.16.3 | Schema definition, generated database client, relations, and transactions |
| MariaDB 11.8 | Relational persistence for accounts, projects, work, labels, and comments |
| `react-markdown` | Safe React rendering of stored Markdown text |
| `remark-gfm` | GitHub-flavored Markdown features such as tables and strikethrough |
| Vitest 4 | Unit, server-action, route-rendering, and coverage tests |
| Testing Library | DOM-oriented component assertions and interactions |
| Docker | Reproducible application and database containers |
| Kubernetes | Optional Minikube and k3s deployment definitions |

The interface uses ordinary CSS in `app/globals.css`; Tailwind CSS is not used.

## Requirements

For normal local development:

- Node.js 20 or newer. The production container uses Node.js 22 Alpine.
- npm, using the committed `package-lock.json`.
- Docker with Docker Compose for the recommended local MariaDB service.
- Git for normal source-control workflows.

Optional deployment tooling:

- Minikube and `kubectl` for the local Kubernetes manifest.
- A k3s cluster, `kubectl`, a working Traefik ingress controller, and image-registry access for the k3s manifest.

## Quick start

From the repository root:

```bash
npm install
cp .env.example .env
docker compose up -d mariadb
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

Open <http://localhost:3000>.

The order matters:

1. `npm install` installs exact dependency versions from `package-lock.json`.
2. `.env.example` becomes the local `.env` file read by Next.js and Prisma.
3. Docker starts MariaDB and keeps its data in a named volume.
4. Prisma generates the JavaScript client for the current schema.
5. `prisma:push` creates or updates the database tables.
6. `prisma:seed` creates deterministic demonstration data.
7. `npm run dev` starts the Next.js development server.

### Seed accounts

The development seed creates these accounts:

| Email | Password | Intended use |
| --- | --- | --- |
| `andrew@example.com` | `projectboard` | Demonstration owner account |
| `maya@example.com` | `projectboard` | Demonstration member account |

These credentials are development fixtures. Do not use them in a public or production environment.

New users may also register through `/register`. A newly registered user begins with an empty dashboard and becomes the owner of any project they create.

## Environment variables

Copy `.env.example` to `.env` for local development.

| Variable | Required by | What it controls |
| --- | --- | --- |
| `DATABASE_URL` | Prisma and the application | Complete MariaDB connection string |
| `MARIADB_DATABASE` | Docker Compose MariaDB | Database created when the container initializes |
| `MARIADB_USER` | Docker Compose MariaDB | Non-root database user |
| `MARIADB_PASSWORD` | Docker Compose MariaDB | Password for the non-root user |
| `MARIADB_ROOT_PASSWORD` | Docker Compose MariaDB | MariaDB administrative password |
| `AUTH_SECRET` | Auth.js | Key used to protect authentication tokens and cookies |
| `AUTH_TRUST_HOST` | Auth.js | Allows Auth.js to trust the incoming host in local/container deployments |

The default local `DATABASE_URL` points to `localhost:3306` because Next.js normally runs on the host while MariaDB runs in Docker:

```dotenv
DATABASE_URL="mysql://projectboard:projectboard-password@localhost:3306/projectboard"
```

Inside Docker Compose, the application uses `mariadb` as the hostname because containers communicate through the Compose network.

Generate a strong Auth.js secret before any real deployment. One option is:

```bash
openssl rand -base64 48
```

Do not commit the resulting `.env` file. The repository's `.gitignore` excludes `.env` and `.env.local`.

## Database setup and lifecycle

### Generate Prisma Client

Run this after installing dependencies or changing `prisma/schema.prisma`:

```bash
npm run prisma:generate
```

This generates the query client imported by `lib/prisma.js`.

### Apply the schema during current Version 1 development

```bash
npm run prisma:push
```

`prisma db push` synchronizes MariaDB with `prisma/schema.prisma` without creating migration files. It is convenient for the current course-project workflow, but it does not provide a versioned migration history.

### Use migrations for a longer-lived deployment

```bash
npm run prisma:migrate -- --name describe_the_change
```

This invokes `prisma migrate dev`. Review and commit the generated migration before relying on it in shared or production environments. The repository currently does not contain committed migrations.

### Seed demonstration data

```bash
npm run prisma:seed
```

`prisma/seed.mjs` clears the existing ProjectBoard records in dependency-safe order and recreates demonstration users, memberships, labels, features, issues, and linked work. Seeding is destructive to existing ProjectBoard application data in the selected database. Confirm `DATABASE_URL` before running it.

### Reset local database data

To remove the entire Docker-managed MariaDB volume and start over:

```bash
docker compose down -v
docker compose up -d mariadb
npm run prisma:push
npm run prisma:seed
```

`docker compose down -v` permanently removes the named database volume. Do not use it when the volume contains data you need.

## Development workflow

Start MariaDB if it is not already running:

```bash
docker compose up -d mariadb
```

Start Next.js with hot reload:

```bash
npm run dev
```

Use a different port by forwarding arguments after `--`:

```bash
npm run dev -- --port 4000
```

The development configuration currently allows the additional origin `10.0.6.37`. Update `allowedDevOrigins` in `next.config.mjs` if a different LAN host needs development access. Restart Next.js after changing `.env` or `next.config.mjs`.

Recommended validation before committing:

```bash
npm test
npm run test:coverage
npm run build
```

## Application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Guest landing page or signed-in project overview |
| `/register` | Guest | Account registration; signed-in users redirect to the dashboard |
| `/login` | Guest | Credentials login; signed-in users redirect to the dashboard |
| `/dashboard` | Signed in | All projects in which the user is a member |
| `/settings` | Signed in | Account details and password change |
| `/projects/new` | Signed in | Create a project and initial team |
| `/projects/[projectId]` | Project member | Three-column combined issue/feature board |
| `/projects/[projectId]/edit` | Project owner | Edit project details and replace member list |
| `/work/new` | Project member | Combined issue/feature creation page |
| `/issues/[issueId]` | Project member | Issue details, editing, labels, Markdown, and discussion |
| `/features/[featureId]` | Project member | Feature details, linked issues, editing, labels, and discussion |
| `/issues/new` | Signed in | Compatibility redirect to `/work/new?type=issue` |
| `/features/new` | Signed in | Compatibility redirect to `/work/new?type=feature` |
| `/api/auth/[...nextauth]` | Auth.js | Authentication GET and POST handlers |

Dynamic routes do not trust the URL alone. The server loads the related project and checks membership before returning protected content.

## Authentication and authorization

### Authentication

`auth.js` configures an Auth.js credentials provider and JWT session strategy.

1. The submitted email is trimmed and converted to lowercase.
2. Prisma loads the matching user.
3. `lib/password.js` hashes the submitted password with the stored salt.
4. `timingSafeEqual` compares the derived and stored hashes.
5. The user's database ID is copied into the signed token and then into `session.user.id`.

Passwords are hashed with Node's `scrypt`, a unique random 16-byte salt, and a 64-byte derived key. Stored values have the form `salt:hash`.

### Authorization

Authentication identifies a user; authorization decides which project data that user may access.

- `requireUser()` redirects unauthenticated requests to `/login`.
- `requireProjectMember(projectId)` queries the compound `(projectId, userId)` membership key.
- Dashboard and home queries filter projects through membership.
- Issue, feature, and comment mutations resolve the parent project and check membership again.
- Project editing checks `project.ownerId`, not only membership.
- Comment deletion checks both project membership and `comment.userId` ownership.

Client-side visibility is not treated as a security boundary. Server actions repeat the authorization decision even when the normal interface hides a button.

## Data model

`prisma/schema.prisma` is the authoritative schema.

### Enums

| Enum | Values | Purpose |
| --- | --- | --- |
| `ProjectRole` | `OWNER`, `MEMBER` | Project-level membership role |
| `IssueStatus` | `TODO`, `IN_PROGRESS`, `DONE` | Shared issue/feature board workflow |
| `IssuePriority` | `LOW`, `MEDIUM`, `HIGH` | Shared issue/feature priority |

### Models

| Model | Purpose | Important constraints and relationships |
| --- | --- | --- |
| `User` | Account identity and password hash | Unique email; owns projects; has memberships, assignments, created work, and comments |
| `Project` | Top-level team workspace | One owner; many members, issues, features, and labels |
| `ProjectMember` | User-to-project membership | Unique `(projectId, userId)` pair; `OWNER` or `MEMBER` role |
| `Issue` | Actionable task or problem | Belongs to project; optional feature and assignee; creator, labels, comments |
| `Feature` | Larger unit of work | Belongs to project; contains issues; optional assignee; creator, labels, comments |
| `IssueComment` | Issue discussion entry | Belongs to one issue and one author |
| `FeatureComment` | Feature discussion entry | Belongs to one feature and one author |
| `Label` | Project-owned category | Unique `(projectId, name)` pair |
| `IssueLabel` | Issue-to-label join | Compound primary key `(issueId, labelId)` |
| `FeatureLabel` | Feature-to-label join | Compound primary key `(featureId, labelId)` |

Project-owned data generally uses cascading deletion. Deleting a feature sets a linked issue's `featureId` to `null`, preserving the issue instead of deleting it.

## Server actions and mutations

`app/actions.js` centralizes mutations:

- Login, registration, logout, and password change
- Project creation and owner-only project update
- Issue creation and update
- Feature creation and update
- Issue and feature comment creation and deletion

Important mutation behavior:

- Form values are trimmed before use.
- Optional blank fields become database `null`.
- Member email lists are lowercased and deduplicated.
- Unknown member email addresses cause a descriptive redirect instead of being ignored.
- Project membership replacement runs in a Prisma transaction.
- Label replacement deletes and recreates join rows in a transaction.
- Date inputs are converted to local noon to reduce accidental calendar-day shifts near timezone boundaries.
- Successful mutations call `revalidatePath()` for affected routes and redirect to the appropriate page.

## Testing

The test suite uses Vitest, Testing Library, jsdom, React server rendering, and mocked Auth.js/Prisma boundaries.

### Run the complete suite once

```bash
npm test
```

### Run in watch mode

```bash
npm run test:watch
```

### Generate coverage

```bash
npm run test:coverage
```

Coverage output is written to `coverage/`, which is ignored by Git. Open `coverage/index.html` after a coverage run for the interactive report.

The current suite contains 53 tests across 11 test files. It covers:

- Salted password hashing and verification
- Auth.js credentials, JWT, and session callbacks
- Signed-in-user and project-membership guards
- Prisma query shapes and dashboard/board mapping
- Registration, login, logout, and every password-change validation branch
- Project creation, email normalization, ownership, and membership transactions
- Issue and feature creation/update behavior
- Label-join transactions and noon due-date conversion
- Comment creation, ownership checks, deletion, and empty-comment behavior
- Shared components and client-side work-picker navigation
- Guest and member home pages
- Dashboard, project board, account, settings, new-work, edit, and detail routes
- Redirect, not-found, empty-state, read-only, and edit-mode behavior
- Root layout, Auth.js API exports, Next.js configuration, and Prisma singleton behavior

The suite intentionally mocks database and authentication boundaries for deterministic unit and rendered-route tests. It does not replace manual browser verification or a separate end-to-end suite against a disposable MariaDB instance.

At the time this README was updated, the suite passed all 53 tests. Run the command locally rather than relying on this statement because results can change with the code.

## Production build

Create the optimized application build:

```bash
npm run build
```

Run the build locally:

```bash
npm start
```

`next.config.mjs` uses `output: "standalone"`. Next.js therefore produces `.next/standalone`, which contains the minimal server entry point used by the final Docker stage.

The database must be reachable and its schema must already exist when the running application handles database-backed requests. Building the JavaScript application does not apply the Prisma schema.

## Docker

### Start only MariaDB for host-based development

```bash
docker compose up -d mariadb
docker compose ps
```

The service exposes MariaDB on host port `3306` and stores data in the `mariadb-data` named volume.

### Run the full application stack

Initialize the database first from the host:

```bash
npm install
cp .env.example .env
docker compose up -d mariadb
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
docker compose up --build app
```

Then open <http://localhost:3000>.

The Compose application waits for the MariaDB health check, but it does not automatically run `prisma db push` or seed data. Schema initialization is a separate, explicit step so startup does not mutate a production database unexpectedly.

### Useful Compose commands

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f mariadb
docker compose restart app
docker compose down
```

Use `docker compose down -v` only when you intentionally want to delete the database volume.

### Dockerfile stages

1. `deps` installs locked dependencies with `npm ci`.
2. `builder` copies the source, generates Prisma Client, and runs `npm run build`.
3. `runner` copies only standalone server output and static assets into a Node 22 Alpine image.

The runtime listens on `0.0.0.0:3000` and starts with `node server.js`.

## Minikube

`minikube-deployment.yaml` creates:

- Namespace `amcdan10`
- Secret `projectboard-env`
- 2 GiB MariaDB persistent volume claim
- MariaDB Deployment and ClusterIP Service
- ProjectBoard Deployment and NodePort Service
- TCP database probes and HTTP application probes
- CPU and memory requests and limits

### Build and deploy

```bash
minikube start
eval "$(minikube docker-env)"
docker build -t projectboard:latest .
kubectl apply -f minikube-deployment.yaml
kubectl -n amcdan10 get pods,services,pvc
```

The manifest uses `imagePullPolicy: Never`, so the image must exist inside Minikube's Docker environment.

Access the application with:

```bash
minikube service projectboard -n amcdan10 --url
```

Before deployment, replace every placeholder credential in the manifest. The database schema must also be applied to the MariaDB instance; the manifest does not currently include a Prisma migration Job.

Useful diagnostics:

```bash
kubectl -n amcdan10 logs deployment/projectboard
kubectl -n amcdan10 logs deployment/mariadb
kubectl -n amcdan10 describe pod -l app=projectboard
kubectl -n amcdan10 describe pod -l app=mariadb
```

## k3s

`k3s-deployment.yaml` defines:

- A configuration object in namespace `amcdan10`
- A 5 GiB MariaDB persistent volume claim
- MariaDB and ProjectBoard Deployments
- Internal ClusterIP Services
- HTTP and TCP health probes
- A Traefik Ingress for `projectboard.k3s.local`
- The application image `ghcr.io/andrewmcdan/projectboard:latest`

### Prepare the image

Build, tag, and push the image to the configured registry:

```bash
docker build -t ghcr.io/andrewmcdan/projectboard:latest .
docker push ghcr.io/andrewmcdan/projectboard:latest
```

The cluster must be authorized to pull the image if the registry package is private.

### Deploy

```bash
kubectl apply -f k3s-deployment.yaml
kubectl -n amcdan10 rollout status deployment/mariadb
kubectl -n amcdan10 rollout status deployment/projectboard
kubectl -n amcdan10 get pods,services,ingress,pvc
```

Configure DNS or a local hosts-file entry so `projectboard.k3s.local` resolves to the ingress address. TLS is not configured by the current manifest; add a certificate and TLS section before treating the deployment as production-ready.

As with Minikube, apply the Prisma schema separately. The current manifest does not contain an automated migration or seed Job.

### Important k3s warning

The current k3s file places credentials and `AUTH_SECRET` in a ConfigMap. ConfigMaps are not intended for secrets. Move sensitive values into a Kubernetes Secret or an external secret manager before deploying outside an isolated demonstration environment.

## Security guidance

Implemented protections:

- Salted `scrypt` password hashes
- Timing-safe password comparison
- Signed Auth.js JWT sessions
- Server-side membership checks for project data
- Owner-only project settings
- Author-only comment deletion
- Prisma parameterization and relational constraints
- No raw-HTML plugin in the Markdown renderer
- Environment files excluded from Git

Required deployment hardening:

- Replace all example/default passwords and Auth.js secrets.
- Store Kubernetes credentials in Secrets, not ConfigMaps or committed clear text.
- Use HTTPS and secure DNS for remote deployments.
- Apply explicit same-project validation to submitted feature, label, and assignee IDs.
- Add rate limiting for login, registration, comments, and other write endpoints.
- Add CSRF, session, dependency, and adversarial Markdown checks to deployment verification.
- Use versioned Prisma migrations and database backups.
- Run `npm audit` and review advisories before release; do not apply breaking automatic downgrades without analysis.
- Never expose MariaDB port `3306` publicly in production.

## Project structure

```text
ProjectBoard/
├── app/
│   ├── api/auth/[...nextauth]/route.js  # Auth.js HTTP handlers
│   ├── dashboard/page.js                # Protected project list
│   ├── features/                        # Feature creation compatibility and details
│   ├── issues/                          # Issue creation compatibility and details
│   ├── projects/                        # Project creation, board, and owner editing
│   ├── settings/page.js                 # Password change
│   ├── work/new/page.js                 # Combined issue/feature creation
│   ├── actions.js                       # All application server mutations
│   ├── globals.css                      # Complete application styling
│   ├── layout.js                        # Root HTML layout and metadata
│   └── page.js                          # Guest/member home page
├── components/
│   ├── markdown.js                      # Markdown renderer
│   ├── new-work-picker.js               # Client-side type/project picker
│   ├── primary-nav.js                   # Active-route navigation
│   ├── section-card.js                  # Reusable content section
│   └── site-shell.js                    # Shared authenticated header and page shell
├── lib/
│   ├── auth-helpers.js                  # Authentication and membership guards
│   ├── mock-data.js                     # Legacy static UI demonstration data
│   ├── password.js                      # scrypt hashing and verification
│   ├── prisma.js                        # Reusable Prisma Client singleton
│   └── project-data.js                  # Authorized project/dashboard/board reads
├── prisma/
│   ├── schema.prisma                    # Relational schema
│   └── seed.mjs                         # Deterministic development seed
├── test/                                # Vitest test suites and helpers
├── .env.example                         # Environment-variable template
├── Dockerfile                           # Multi-stage production image
├── docker-compose.yml                   # Local MariaDB and application stack
├── k3s-deployment.yaml                  # Remote k3s deployment
├── minikube-deployment.yaml             # Local Kubernetes deployment
├── next.config.mjs                      # Next.js standalone/development config
├── package.json                         # Scripts and dependencies
└── vitest.config.mjs                    # Test transformation and coverage config
```

## Troubleshooting

### `Can't reach database server` or Prisma connection errors

Confirm MariaDB is running and healthy:

```bash
docker compose ps
docker compose logs mariadb
```

For host-based Next.js, `DATABASE_URL` should use `localhost`. For a containerized application, it should use the Compose/Kubernetes service name `mariadb`.

### Tables do not exist

The database is reachable but the schema has not been applied:

```bash
npm run prisma:generate
npm run prisma:push
```

### Prisma Client is out of date

Regenerate it after editing the schema or switching branches:

```bash
npm run prisma:generate
```

Restart the development server afterward.

### Sign-in fails on a LAN hostname

- Confirm `AUTH_TRUST_HOST="true"` in the intended environment.
- Add the LAN host to `allowedDevOrigins` in `next.config.mjs` if needed.
- Restart Next.js after changing configuration.
- Confirm the browser is using the same host throughout the sign-in flow.

### Port 3000 is already used

```bash
npm run dev -- --port 4000
```

### Port 3306 is already used

Stop the conflicting local database or change the host-side port mapping in `docker-compose.yml` and update the host-based `DATABASE_URL` to match.

### A project member cannot be added

Member accounts must be registered before an owner adds their email address. Confirm the exact email and try again. Email matching is case-insensitive after normalization.

### A Kubernetes pod is not ready

Inspect pod status, events, logs, environment references, database connectivity, and image availability:

```bash
kubectl -n amcdan10 get pods
kubectl -n amcdan10 describe pod POD_NAME
kubectl -n amcdan10 logs POD_NAME
```

### Tests fail after dependency or source changes

```bash
npm install
npm run prisma:generate
npm test
```

Use `npm run test:coverage` to find the exact untested or failing area. Generated coverage files do not belong in Git.

## Current limitations

- Board status changes use edit forms rather than drag and drop.
- Project members must already have registered accounts; there is no invitation workflow.
- There is no password-reset email flow.
- Labels have starter values but no separate label-administration page.
- Prisma migrations are not yet committed; Version 1 primarily uses `prisma db push`.
- Docker and Kubernetes startup do not automatically apply the database schema.
- The current Kubernetes files require secret-management hardening.
- The application needs explicit same-project validation for submitted related IDs as additional defense against crafted form submissions.
- The automated suite mocks Auth.js and Prisma boundaries; browser-level end-to-end tests against a disposable MariaDB database are still a separate future layer.

## License and third-party software

Project-specific source code is original unless otherwise noted. Dependencies such as Next.js, React, Auth.js, Prisma, `react-markdown`, `remark-gfm`, Node.js, MariaDB, Vitest, and Testing Library remain under their respective licenses. Review exact dependency licenses and redistribution requirements before publishing a packaged release.
