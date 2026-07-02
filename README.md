# ProjectBoard

`ProjectBoard` is a starter scaffold for a server-rendered project, issue, and feature tracking app built with Next.js, Prisma, MariaDB, and Auth.js.

## Current scaffold

- Marketing-style home page
- Placeholder pages for login, registration, dashboard, project board, issue creation, feature creation, detail views, and settings
- Shared card and section components
- Starter Prisma schema that matches the project overview and supports optional issue-to-feature links
- `.env.example` values for local development

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` and `AUTH_SECRET` in `.env`.

4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Start the app:

```bash
npm run dev
```

## Local Docker Compose

Use Compose when you want the app and MariaDB running together outside Kubernetes:

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000` and MariaDB at `localhost:3306`.

## Kubernetes notes

- `minikube-deployment.yaml` deploys both `projectboard` and `mariadb` into the `amcdan10` namespace for local cluster testing.
- `k3s-deployment.yaml` does the same for the remote cluster and exposes the app at `projectboard.k3s.local`.
- Both manifests include a placeholder secret named `projectboard-env`. Replace those secret values before deploying.

## Next steps

- Wire up Auth.js routes and session handling
- Run the first Prisma migration against MariaDB
- Replace placeholder data with real server queries
- Add create/edit forms with validation and authorization
- Flesh out the feature CRUD flow and linked-issue views
