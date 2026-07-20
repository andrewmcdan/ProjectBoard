# ProjectBoard Final Report Outline

This outline combines both requirement sets in `report.md` and uses the stricter requirement wherever they differ.

## Submission Requirements Checklist

- Report length: at least 10 full pages, double-spaced, excluding the cover page if the instructor permits.
- Proofread and spell-check the final report.
- Include a cover page with the project option and current completion status.
- Include an introduction.
- Discuss at least four implemented features or enhancements.
- Tag the challenging portion of each feature discussion with **GOTCHA**.
- List the application files and explain what they do.
- Explain the database design and changes.
- Include a copyright/open-source notice where applicable.
- Summarize what was learned.
- State whether the application is linked from the course home page, deployed on the server, viewable, and whether the Assignment 4B baseline features work.
- Submit the report as `ProjectFinalReport-netid.doc`.
- Submit the source archive as `ProjectFinalCode.zip`.

Suggested final length: 11–13 double-spaced pages plus cover page and optional appendices.

---

## Cover Page

Include:

- Report title: **ProjectBoard Final Project Report**
- Student name: `[Your full name]`
- NetID: `[Your NetID]`
- Course and section: `[Course/section]`
- Instructor: `[Instructor name]`
- Submission date: `[Date]`
- Project option: `[Exact option name/number from the assignment]`
- Project status: `Complete`, `Partially complete`, or the instructor's required wording
- Application URL: `[Deployed URL]`
- Source repository URL, if permitted: `[Repository URL]`

Status statement template:

> ProjectBoard is `[status]`. The application is linked from `[course home-page location]`, deployed at `[URL]`, and its required Assignment 4B features `[are/are not]` working. The report identifies any remaining limitations in the conclusion.

Do not claim deployment or full completion until those items have been tested in the required course environment.

---

## 1. Introduction

Target length: 0.75–1 page.

### 1.1 Problem and purpose

- Introduce ProjectBoard as a small-team project, feature, and issue tracker.
- Explain the organizational problem it solves: keeping work, responsibility, progress, deadlines, and discussion in one application.
- Mention inspiration from issue trackers and Kanban-style project boards without claiming to reproduce a specific commercial product.

### 1.2 Intended users and workflow

- Intended audience: students and small project teams.
- Basic workflow:
  1. Register or sign in.
  2. Create or join a project.
  3. Create features and issues.
  4. Assign, prioritize, label, link, and schedule work.
  5. Track work through Todo, In Progress, and Done.
  6. Discuss work through comments.

### 1.3 Technology overview

- Next.js 16 and React 19 for the server-rendered application and reusable UI.
- Auth.js for credentials sessions.
- Prisma ORM with MariaDB for relational persistence.
- Standard CSS rather than Tailwind.
- Docker for reproducible application/database setup.
- Minikube and k3s manifests for Kubernetes deployment.

### 1.4 Report roadmap

- Briefly preview the four feature discussions, file inventory, database design, deployment status, lessons learned, and conclusion.

Suggested evidence:

- Screenshot of the public home page or signed-in project overview.
- One concise architecture diagram: browser → Next.js server components/actions → Auth.js/Prisma → MariaDB.

---

## 2. Initial Scope and Completed Enhancements

Target length: 0.75–1 page.

### 2.1 Original project baseline

- Summarize the initial proposal from `Project Overview.md`:
  - Account registration and login.
  - Protected project dashboard.
  - Project and issue creation.
  - Three-column issue board.
  - Comments and labels.

### 2.2 Enhancements beyond the basic issue tracker

Discuss how the implemented project expanded the baseline:

- Added a separate `Feature` work type alongside `Issue`.
- Added feature-specific comments and labels.
- Allowed issues to link to a parent feature.
- Added priorities, assignees, due dates, and Markdown descriptions.
- Added owner/member project administration.
- Added dashboard totals and completion calculations.
- Added password changes and author-controlled comment deletion.
- Added Docker, Minikube, and k3s deployment configurations.

### 2.3 Current limitations

State these honestly if they still apply when the report is submitted:

- Board status is edited from detail forms rather than drag and drop.
- Member accounts must already exist before an owner can add them.
- No password-reset email flow is implemented in the current Version 1 code.
- Labels are created as starter data but do not yet have a separate management screen.
- Automated tests are not currently present.

Tie this section to the final status on the cover page.

---

## 3. Feature One: Authentication and Project Authorization

Target length: 1–1.25 pages.

### 3.1 User-facing behavior

- Registration, login, logout, and password change.
- Protected dashboard and project routes.
- Different home-page content for guests and signed-in users.

### 3.2 Implementation

- `auth.js` configures the Auth.js credentials provider and JWT sessions.
- `lib/password.js` salts and hashes passwords with Node's `scrypt` and verifies them with a timing-safe comparison.
- `lib/auth-helpers.js` centralizes signed-in-user and project-membership checks.
- Authentication actions live in `app/actions.js`.
- Project queries return data only for projects containing the signed-in user's membership.

### 3.3 **GOTCHA: Authentication is not authorization**

- Explain why a valid login alone must not grant access to every project.
- Discuss checking membership on server-rendered reads and again on mutations.
- Explain protection against manually entering another project's, issue's, or feature's URL.
- Note that project editing is restricted to the owner.
- Explain why password hashes and session secrets never belong in rendered client content.

### 3.4 Evidence and evaluation

- Screenshot of registration/login and account settings.
- Code excerpt or pseudocode showing `requireUser()` and `requireProjectMember()`.
- Manual test example: a non-member tries a direct project URL and receives no project data.
- Security limitation to acknowledge: full validation and automated authorization regression tests are future hardening work unless implemented before submission.

---

## 4. Feature Two: Project and Team Management

Target length: 1–1.25 pages.

### 4.1 User-facing behavior

- Create a project with a name, description, and initial team.
- View only projects the current user belongs to.
- Show member, issue, and feature counts on dashboard cards.
- Allow the owner to edit project details and membership.

### 4.2 Implementation

- `Project` has one owner and many `ProjectMember` records.
- `ProjectMember` supports `OWNER` and `MEMBER` roles.
- Project creation also creates the owner's membership and starter labels.
- Project update replaces member rows inside a Prisma transaction.
- Submitted member emails are normalized, deduplicated, and checked against registered users.

### 4.3 **GOTCHA: Maintaining relational consistency during membership changes**

- Explain why ownership and membership are stored separately but must remain consistent.
- Discuss preventing duplicate project memberships through the compound unique constraint.
- Explain why project/member updates use transactions.
- Discuss the need to reject unknown accounts instead of creating broken relationships.
- Note the current limitation that replacing the complete member list is less robust than a future invitation workflow.

### 4.4 Evidence and evaluation

- Screenshot of create-project and edit-project screens.
- Database diagram excerpt showing `User`, `Project`, and `ProjectMember`.
- Demonstrate owner-only edit controls and server-side enforcement.
- Mention seeded owner/member accounts used for local verification.

---

## 5. Feature Three: Issues, Features, and the Project Board

Target length: 1.25–1.5 pages.

### 5.1 User-facing behavior

- Track both features and issues as first-class work.
- Use Todo, In Progress, and Done columns.
- Store title, Markdown description, priority, assignee, due date, labels, creator, and timestamps.
- Link an issue to an optional parent feature.
- Open detail pages and update work data.

### 5.2 Implementation

- Separate `Issue` and `Feature` Prisma models preserve type-specific routes and comments.
- Both use shared `IssueStatus` and `IssuePriority` enums.
- `lib/project-data.js` loads authorized project data and maps both work types into status columns.
- `app/projects/[projectId]/page.js` renders the server-side board.
- `components/new-work-picker.js` and `app/work/new/page.js` provide a combined creation entry point.
- `app/actions.js` creates and updates both work types and their label joins.

### 5.3 **GOTCHA: Presenting two database models as one coherent board**

- Explain why issues and features remain separate tables but appear in the same status workflow.
- Discuss mapping enum values to display columns and combining counts safely.
- Explain preserving type-specific links while maintaining a consistent card design.
- Discuss keeping an issue's linked feature within the same project.
- Explain the due-date noon convention used to avoid a displayed date shifting across timezones.

### 5.4 Evidence and evaluation

- Screenshot of a populated three-column board.
- Screenshot of one issue and one feature detail page.
- Small table comparing Issue and Feature fields/relationships.
- Demonstrate a status update and board relocation after refresh.

---

## 6. Feature Four: Labels, Markdown, and Team Discussion

Target length: 1–1.25 pages.

### 6.1 User-facing behavior

- Apply multiple project labels to issues and features.
- Write formatted descriptions and comments using Markdown.
- Add issue-specific and feature-specific comment threads.
- Show comment authors and timestamps.
- Let comment authors delete their own comments.

### 6.2 Implementation

- `Label` belongs to a project and has a project-scoped unique name.
- `IssueLabel` and `FeatureLabel` implement separate many-to-many joins.
- `IssueComment` and `FeatureComment` preserve type-specific foreign keys.
- `components/markdown.js` renders Markdown with GitHub-flavored Markdown support.
- Comment actions verify current project membership; deletion additionally checks authorship.

### 6.3 **GOTCHA: Protecting relationships and permissions in collaborative data**

- Explain why many-to-many label joins must be replaced transactionally during updates.
- Discuss ensuring a submitted label belongs to the same project as the work item.
- Explain why comment ownership is checked on the server rather than relying on whether a delete button is visible.
- Discuss safe Markdown rendering and the importance of controlling unsupported raw HTML or unsafe links.

### 6.4 Evidence and evaluation

- Screenshot of a work detail page showing labels, rendered Markdown, and comments.
- Schema excerpt showing comment and label join relationships.
- Demonstrate that one user cannot delete another user's comment.
- Note any current Markdown sanitization or validation limitations honestly.

---

## 7. Database Design and Changes

Target length: 1–1.25 pages.

### 7.1 Database choice and access layer

- Explain why MariaDB fits relational project data.
- Explain Prisma's role in schema definition, generated queries, relationships, and transactions.
- Identify `prisma/schema.prisma`, `lib/prisma.js`, and `prisma/seed.mjs`.

### 7.2 Current database entities

Describe each model briefly:

| Model | Purpose | Important relationships or constraints |
|---|---|---|
| `User` | Account identity and password hash | Owns projects; has memberships, assignments, created work, and comments |
| `Project` | Top-level team workspace | One owner; many members, issues, features, and labels |
| `ProjectMember` | User/project membership | Unique `(projectId, userId)`; owner/member role |
| `Issue` | Actionable task or problem | Optional parent feature; assignee, creator, labels, comments |
| `Feature` | Larger unit of work | Contains issues; assignee, creator, labels, comments |
| `IssueComment` | Discussion attached to an issue | Belongs to author and issue |
| `FeatureComment` | Discussion attached to a feature | Belongs to author and feature |
| `Label` | Project-owned categorization | Unique name within project |
| `IssueLabel` | Issue/label many-to-many join | Compound primary key |
| `FeatureLabel` | Feature/label many-to-many join | Compound primary key |

Also discuss `ProjectRole`, `IssueStatus`, and `IssuePriority` enums.

### 7.3 Changes from the original proposal

- Added the `Feature`, `FeatureComment`, and `FeatureLabel` models.
- Added the optional issue-to-feature relationship.
- Applied labels to both work types.
- Added feature assignments and creators.
- Kept status and priority consistent across issues and features.

### 7.4 Integrity and deletion behavior

- Compound uniqueness for memberships and label names.
- Cascade deletion for project-owned work and joins.
- `SetNull` for an issue's feature link if the feature is removed.
- Transactions for replacing labels or project memberships.
- Acknowledge that the current shared workflow uses `prisma db push`; committed migrations are a planned hardening improvement unless added before submission.

Suggested evidence:

- One readable entity-relationship diagram.
- A short schema excerpt illustrating one-to-many and many-to-many relations.

---

## 8. Application File Inventory

Target length: 1–1.5 pages. Use concise grouped descriptions rather than reproducing source code.

### 8.1 Root configuration and documentation

| File | Purpose |
|---|---|
| `README.md` | Local setup, verification, seed accounts, deployment notes, and security summary |
| `package.json` / `package-lock.json` | Package metadata, scripts, and reproducible dependency versions |
| `next.config.mjs` | Standalone production output and development-origin configuration |
| `auth.js` | Auth.js credentials provider, JWT callbacks, and session user ID mapping |
| `.env.example` | Required local environment-variable template |
| `Dockerfile` | Multi-stage optimized production image |
| `docker-compose.yml` | Local MariaDB and application services |
| `minikube-deployment.yaml` | Local Kubernetes namespace, database, application, storage, probes, and services |
| `k3s-deployment.yaml` | Remote k3s database/application deployment and ingress |

### 8.2 Shared library files

| File | Purpose |
|---|---|
| `lib/prisma.js` | Reuses a Prisma client safely during development |
| `lib/password.js` | Password hashing and timing-safe verification |
| `lib/auth-helpers.js` | Requires authentication and checks project membership |
| `lib/project-data.js` | Loads project choices, dashboard summaries, and board view data |
| `lib/mock-data.js` | Legacy/static data support; explain whether it remains used at submission time |

### 8.3 Shared components and styling

| File | Purpose |
|---|---|
| `components/site-shell.js` | Shared page shell/header structure |
| `components/primary-nav.js` | Signed-in and guest navigation behavior |
| `components/section-card.js` | Reusable section/card presentation |
| `components/new-work-picker.js` | Selects project and work type for creation |
| `components/markdown.js` | Renders GitHub-flavored Markdown |
| `app/globals.css` | Global theme, responsive layout, forms, cards, tags, board, and detail styles |

### 8.4 Routes and server actions

- Group route descriptions instead of spending a paragraph on every `page.js`:
  - Public/account: home, login, registration, settings.
  - Project: dashboard, create, board, edit.
  - Work creation: combined work selector plus issue/feature compatibility routes.
  - Detail: dynamic issue and feature routes.
  - API: Auth.js handler route.
- Explain that `app/actions.js` centralizes authentication, project, issue, feature, and comment mutations.
- Include an appendix with the complete path-by-path inventory if the instructor expects every file individually.

### 8.5 Database files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | MariaDB provider, enums, models, constraints, and relations |
| `prisma/seed.mjs` | Deterministic demonstration users, project, labels, features, and issues |

### 8.6 PHP requirement note

The application contains no PHP files. State this directly:

> The assignment's PHP-file requirement is not applicable because the approved implementation uses Next.js server components and server actions. The equivalent server-side logic is primarily in `app/actions.js`, `auth.js`, and `lib/*.js`.

Confirm that this technology substitution was approved; if not, ask the instructor how the PHP-specific requirement should be presented.

---

## 9. Deployment, Verification, and Assignment Status

Target length: 0.5–0.75 page.

### 9.1 Deployment architecture

- Next.js standalone production image from the multi-stage `Dockerfile`.
- MariaDB persistent storage.
- Docker Compose for local full-stack operation.
- Minikube manifest for local Kubernetes testing.
- k3s manifest and ingress for the remote cluster.
- Readiness/liveness probes and resource requests/limits.

### 9.2 Required status evidence

Fill in and verify:

- Course home-page link: `[URL and date tested]`
- Deployed application: `[URL and date tested]`
- Application viewable without local tooling: `[Yes/No and evidence]`
- Assignment 4B baseline features working: `[List each required feature and pass/fail]`
- Production build command/result: `npm run build` — `[result/date]`
- Container test: `docker compose up --build` — `[result/date]`
- Kubernetes test, if required: `[environment/result/date]`

### 9.3 Limitations and operational cautions

- Replace placeholder secrets before deployment.
- Explain whether k3s configuration values are stored as ConfigMaps or Secrets at final submission and correct any sensitive configuration before publication.
- Report any environment-specific hostname, certificate, or ingress limitation.

Suggested evidence:

- Screenshot of the deployed app showing the browser URL.
- Screenshot or short table of verification results.

---

## 10. What I Learned

Target length: 0.75–1 page.

Use first-person reflection and connect each lesson to a specific implementation decision.

Possible topics:

- Server-rendered React differs from a purely client-side interface because data and authorization checks can happen before HTML is returned.
- Authentication establishes identity, while authorization must still protect every project query and mutation.
- Relational design makes many-to-many labels, project memberships, assignments, creators, and linked features explicit.
- Transactions keep multi-record updates from becoming partially applied.
- Password handling requires salts, slow hashing, and timing-safe comparison rather than encryption or plain hashing.
- Reusable components reduce duplicated layout while server actions centralize mutations.
- Docker and Kubernetes require attention to runtime configuration, database readiness, persistence, networking, and secret management.
- Timezone behavior can affect apparently simple date-only fields.
- A useful reflection should mention one design that worked well and one that would be redesigned, such as replacing full member-list editing with invitations.

Avoid a generic list of technologies; explain how your understanding changed while building the application.

---

## 11. Copyright and Third-Party Software Notice

Target length: 0.25–0.5 page.

Suggested structure:

- State that the original application code and report were written by the student unless otherwise identified.
- List major open-source dependencies:
  - Next.js and React.
  - Auth.js.
  - Prisma ORM and Prisma Client.
  - `react-markdown` and `remark-gfm`.
  - MariaDB container image.
- State that dependencies remain under their respective licenses.
- Identify any copied images, icons, code, templates, or text and provide source/license attribution.
- If no third-party media or copied code is used, state that explicitly.
- Do not claim copyright ownership over third-party libraries.

Before submission, verify dependency licenses and add exact notices if the assignment requires them.

---

## 12. Summary and Conclusion

Target length: 0.5–0.75 page.

- Restate the purpose of ProjectBoard.
- Summarize the four demonstrated features:
  - Authentication and authorization.
  - Project/team management.
  - Issue/feature board.
  - Labels, Markdown, and comments.
- State how the final implementation exceeded the original basic issue-tracker proposal.
- Give an honest final status for deployment and Assignment 4B requirements.
- Mention the most important remaining improvement without turning the conclusion into a future-feature list.
- Close with what the project demonstrates about full-stack Internet programming.

---

## Optional Appendices

Appendices should support the report but should not be used to reach the 10-page body minimum unless the instructor explicitly allows it.

### Appendix A: Complete File Inventory

- List every authored source/configuration file with a one-sentence purpose.
- Exclude generated `.next`, `node_modules`, local `.env`, and database volume contents.

### Appendix B: Database Diagram

- Include a readable ERD with primary keys, foreign keys, and cardinalities.

### Appendix C: Test Matrix

Suggested columns:

| Workflow | User/role | Expected result | Actual result | Evidence/date |
|---|---|---|---|---|
| Register and sign in | Guest | Dashboard access | `[Result]` | `[Evidence]` |
| Open another project by URL | Non-member | Access denied/no data | `[Result]` | `[Evidence]` |
| Edit project | Member | Owner-only rejection | `[Result]` | `[Evidence]` |
| Create and update issue | Member | Board reflects changes | `[Result]` | `[Evidence]` |
| Link issue to feature | Member | Feature relation displayed | `[Result]` | `[Evidence]` |
| Delete another user's comment | Member/non-author | Rejected | `[Result]` | `[Evidence]` |

### Appendix D: Submission Checklist

- Replace every bracketed placeholder.
- Verify the exact project option and status wording from the assignment.
- Verify the deployed URL and course home-page link.
- Insert readable screenshots with captions and references from the body.
- Spell-check and proofread.
- Confirm at least 10 double-spaced body pages.
- Confirm all four feature sections contain a **GOTCHA** discussion.
- Confirm the database and file inventory sections are complete.
- Confirm copyright/source attributions.
- Save as `ProjectFinalReport-netid.doc`.
- Create `ProjectFinalCode.zip` without `.env`, `.next`, `node_modules`, database data, or secrets.
