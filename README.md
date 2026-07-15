# ProjectBoard

ProjectBoard is a server-rendered project, feature, and issue tracker built with Next.js, React, Auth.js, Prisma, and MariaDB. It supports account registration and login, protected project membership, project boards, issue and feature creation/editing, assignments, due dates, labels, linked work, and comments.

## Local development

Requirements: Node.js 20+ and Docker (for MariaDB).

```bash
npm install
cp .env.example .env
docker compose up -d mariadb
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

Open <http://localhost:3000>. The seed accounts are:

To use a different development port, forward the option to Next.js after `--`:

```bash
npm run dev -- --port 4000
```

Auth.js uses the incoming browser host in local development, so sign-in works from both
`http://localhost:<port>` and a LAN address such as `http://10.0.6.18:<port>`. Restart the
development server after changing `.env` values.

- `andrew@example.com` / `projectboard`
- `maya@example.com` / `projectboard`

You can also register a new account. New users begin with an empty dashboard and become owners of projects they create.

## Verification

```bash
npm run build
```

To run the complete app and database locally in containers:

```bash
docker compose up --build
```

## Kubernetes notes

Kubernetes is optional and is not required or started by the local-development workflow.

- `minikube-deployment.yaml` deploys both `projectboard` and `mariadb` into the `amcdan10` namespace for local cluster testing.
- `k3s-deployment.yaml` does the same for the remote cluster and exposes the app at `projectboard.k3s.local`.
- Both manifests include a placeholder secret named `projectboard-env`. Replace those secret values before deploying.

## Security model

Passwords are salted and hashed with Node's `scrypt`. Auth.js manages signed JWT sessions. Dashboard queries only return projects the current user belongs to, and every project, issue, feature, and comment operation checks project membership on the server.
