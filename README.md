# HamHamHub Backoffice & Application Directory

A modern Next.js admin backoffice application integrating robust authentication, multi-role access control, persistent light/dark themes, and directory interfaces for managing personnel, users, and organization accounts.

---

## Technology Stack

This application is built with a state-of-the-art framework stack:

### Core Framework & View Layer
- **Next.js 16 (`16.2.9`)**: Uses App Router, Dynamic Metadata, Middleware route guards, and Server Actions for asynchronous server-client interaction.
- **React 19 (`19.2.4`) & React DOM (`19.2.4`)**: Leverages React Server Components, actions hooks, and form state tracking.
- **Tailwind CSS v4 (`^4`)**: Dynamic styles processed via `@tailwindcss/postcss` for custom themes.
- **Lucide Icons (`^1.22.0`)**: Vector graphic icons library.
- **Base UI / Radix UI Primitives (`^1.6.0`)**: Accessible component primitives powered by `@base-ui/react`.

### Database & Data Access Layer
- **Drizzle ORM (`^0.45.2`)**: TypeScript-safe Object-Relational Mapper for PostgreSQL.
- **Postgres.js (`^3.4.9`)**: Pooled client connection driver for native PostgreSQL.
- **Zod (`^4.4.3`)**: Schema-based validation utilized for profile parameters, address layouts, and credentials checks.

### Authentication & Security
- **Auth.js / NextAuth.js (`5.0.0-beta.31`)**: Session-based credentials authentication with custom role and token payloads.
- **BcryptJS (`^3.0.3`)**: Password hashing and verification library.

### Development & Testing
- **TypeScript (`^5`)**: Strong static typing compiled and validated locally.
- **Vitest (`^4.1.9`)**: Lightweight unit and integration test runner.
- **Happy DOM (`^20.10.6`)**: Fast, lightweight browser simulation environment.
- **Testing Library React (`^16.3.2`)**: Component validation utilities.

---

## 1. Directory Structure

The backoffice system contains three primary user directories under `/backoffice`:

### A. Employees Directory (`/backoffice/employees`)
- **Domain Context**: Employees / Admin — Oversees marketplace integrity. Manages onboarding approvals, verifies veterinary credentials, and resolves disputes with access to the backoffice.
- **Login Credentials**: Username & Password
- **Roles**: `admin` or `employee`
- **Fields**: Full Name, Username, Email Address, Role
- **Privilege Boundaries**: A staff member can be added/registered by administrators (`role === "admin"`) only; normal employee accounts do not have this permission. Only administrators can modify roles or perform deletions. Deletion of the primary account with the username `"admin"` is strictly blocked.

### B. Users Directory (`/backoffice/users`)
- **Domain Context**: Users are the **Pet Owners**.
- **Login Credentials**: Email Address & Password
- **Role**: Strictly fixed to `"user"` (client/customer role)
- **Fields**: Name (1st column), Email Address (2nd column), Joined Date (3rd column)
- **Privilege Boundaries**: No role assignment is rendered or permitted during creation/updates, preventing privilege escalation.

### C. Organizations Directory (`/backoffice/organizations`)
- **Domain Context**: Organizations are the **Business Entities** (e.g., Dogmaster, Ach Napoca, or Sirius Animal Rescue). Must handle CUI/CIF verification (e.g., validating an S.R.L. or P.F.A.) and define precise service radii.
- **Login Credentials**: Email Address & Password
- **Role**: Strictly fixed to `"organization"`
- **Fields**: Name (1st column), Email Address (2nd column), Joined Date (3rd column)
- **Privilege Boundaries**: Custom role targeting businesses/partners, allowing dashboard access while segregating staff assets.

---

## 2. Authentication & Authorization Matrix

Authentication separation is managed in `src/auth.ts` and `src/auth.config.ts`:

| Route Category | Target Access Roles | Login Identifier Type | Redirect Target on Auth |
| :--- | :--- | :--- | :--- |
| **Backoffice (`/backoffice/*`)** | `admin`, `employee` | Username | `/backoffice` |
| **Client Dashboard (`/dashboard/*`)** | `user`, `organization` | Email Address | `/dashboard` |

- **Username Login**: Identifiers *without* an `@` symbol are treated as staff logins. Access checks verify the user does *not* have the `"user"` or `"organization"` role.
- **Email Login**: Identifiers *with* an `@` symbol are treated as customer/organization logins. Access checks verify the role is either `"user"` or `"organization"`.
- **Enforced Separation**: Logins on the Client Dashboard (`/dashboard/login`) are strictly restricted to email format. The login server action (`loginAction`) rejects any identifier without an `@` symbol for the `"user"` login type, preventing staff username sign-ins on the client portal.

---

## 3. UI Features
- **Persistent User Theme**: Toggle theme changes via the top-header switcher. Settings sync directly to the database user record (`users.theme`), completely avoiding flash layout mismatches or cookies.
- **Collapsible Sidebar Tree**: Fully responsive sidebar with collapsible navigation groups, active route tracking, and real-time menu search filtering.
- **Credential Protection**: All creation popups include `Confirm Password` fields with client-side match checking and `Eye`/`EyeOff` visibility toggles.
- **Password Strength Indicator**: Renders a premium, real-time client-side validation widget on all forms where passwords are set or modified. It checks for length (min 6 characters), numbers, uppercase letters, and special symbols, updating visual segmented color-coded bars and checklists dynamically.
- **Setup Auto-Redirection**: Automatically routes the administrator to the backoffice portal (/backoffice) upon completing first-time platform setup. Direct access to `/initialization` is strictly blocked and redirected to `/backoffice` once the platform has been initialized.
- **Tactile Service Toggle Cards**: Replaced standard multi-select fields with a visual option grid. Users can toggle multiple services. Existing category services are displayed as checkmarked and disabled with a "Registered" indicator to prevent duplicate allocations.

---

## 4. Dynamic Categories & Service Types

The backoffice system integrates completely dynamic configuration layers for business categorization and service templates:

### A. Organization Categories (`/backoffice/organizations`)
- Organization Categories are dynamically queryable from the database.
- Admin can search, create, and customize categories.
- Includes **Category Edit Modals** to update category names and descriptions.
- Dynamic color badges represent distinct category types (e.g. green for NGO, blue for Kennel, purple for Association, indigo for Provider).

### B. Service Types Configuration (`/backoffice/services/types`)
- Custom names and descriptions for service templates (Obedience training, Boarding, Walking, etc.) are managed in the database `service_types` table.
- Admin can modify names and descriptions through an edit popup, instantly propagating updates to page views and validation rules.

### C. Services Directory (`/backoffice/services`)
- Services are organized in a card grid grouped by organization category.
- Each category card has an **"Add Service Type"** button that opens a context-aware modal titled **"Add Service Types to {Category Name}"**.
- The organization category is **locked** in the modal — it is pre-set by the card clicked and cannot be changed, preventing accidental cross-category assignments.
- Already-registered service types display a "Registered" badge and cannot be re-selected.

---

## 5. Core Business Workflows & Dashboards

### A. Client Dashboard (Pet Owners & Organizations)
- **Hamster Telemetry Stream**: Standard users are presented with a real-time hamster monitoring grid (tracking Cage synced configurations, wheel RPM, food level indicators, and live activity streams for hamsters like Biscuit or Peanut).
- **Unified Organization Form (`EditOrganizationForm`)**: An advanced multi-tab settings panel containing:
  - *Personal Info*: Organization names, categories, recovery emails, social profile widgets (Facebook, Instagram, TikTok, website, GBP), and full address structures with country-specific dropdown search matching.
  - *Localized Address Validation*: Form matches phone pattern inputs against target countries (e.g., +40 for Romania, +44 for UK).
  - *Account Settings*: Interactive password reset forms complete with real-time Password Strength Check indicators.
  - *Subscription Details*: Telemetry license tier indicators and plans.
  - *Services Directory*: Modular tactile service cards enabling direct toggle actions for services.
- **Dynamic Dog Boarding Settings (Presentation-Only)**: The Dog Boarding settings page (`/dashboard/services/dog-boarding`) allows organizations to add custom sortable **Boarding service** offerings (e.g., Standard Room, VIP Cabin) with drag-and-drop reordering. The configuration form is tailored to exclude training-specific inputs (trainer certification, training field details) and supports daily, nightly, monthly, and service-level pricing frequencies. It excludes the technical Service Template Identifier string and the Service Status toggle panel.
  - *Custom attributes*: Allows toggling medication administration instructions, owner communication update feeds, and custom dietary meal plans (displaying details text boxes when enabled), along with a 1-4 walks selection dropdown.
  - *Check-in/Check-out timing*: Combobox timing text inputs validated to 24-hour `hh:mm` format with Microsoft Teams-style native browser `<datalist>` dropdown suggestions every 30 minutes from `00:00` to `23:30`.
  - *Tactile lists indicators*: Displays visual indicators (Meds Administered, Walks, Updates Sent, Meal Plan) and timing markers (e.g. `In: 08:00 • Out: 18:00`) next to offerings in the dashboard view.

### B. Backoffice Staff Dashboard
- **Platform Telemetry Metrics**: Staff members can view critical operational metrics, including:
  - Total registered business entities/organizations.
  - 24-hour subscription activation rate trackers (+15% trend indicator).
  - Total active subscription count.
  - Expiring license alert systems prompting immediate backoffice action.

---

## 6. Dynamic Offerings & Cynological Offerings (Courses & Dog Sports)

The platform supports dynamic, nested sub-offerings for specialized services, specifically **"Dog training"** and **"Dog Sports Training"**:

### A. Dynamic Noun Context-Switching
The application UI dynamically adjusts its user-facing terminology and input settings depending on the slug of the active service:
- **Dog training** (`dog-training`): Configures and displays offerings as **"Courses"** (e.g. "Add Course", "Course Name").
- **Dog Sports Training** (`sport-dog-training`): Configures and displays offerings as **"Dog Sports"** (e.g. "Add Dog Sport", "Dog Sport Name").

### B. Facility & Venue Attributes
Each course or dog sport is defined in a dynamic form featuring:
- **Obedience & Certified Coaching**: Toggleable trainer certifications with certifier name tracking.
- **Dedicated Venues**: An address field, Google Business Profile (GBP) link, and Google Maps embed link (grouped under "Dedicated Training Field").
- **Parking Accommodations**: Switchable parking toggle with descriptive details.
- **WYSIWYG Descriptions**: Text styling editors for program details and participation terms.

### C. Configurable Pricing Frequency
Pricing configurations support both **per-offering** and **per-month** options. The selection is saved in the database under `courses.priceType` and formatted cleanly in the directory listing (e.g. `200 RON / course` or `$150 / month`).

### D. Interactive Drag-and-Drop Reordering
Dynamic offerings are rendered as a clean, flat list featuring a tactical `GripVertical` handle. Users can drag and drop items to reorder them locally. On drop, the new sequence is persisted to the database via `reorderOrgCoursesAction` updating the `sortOrder` values.

---

## 7. Server Action Documentation

All server actions in `src/app/actions/` are documented with JSDoc comments directly above each function, covering:

- **Input parameters** — `formData` field names, types, and whether they are required
- **Return shapes** — `{ success: true }` on success, `{ error: string }` on failure
- **Side effects** — which Next.js cache paths are revalidated
- **Redirect behaviour** — actions that issue server-side redirects note that they never return on success and re-throw `NEXT_REDIRECT` errors
- **Security guards** — role restrictions and idempotency checks are explicitly documented

### Action files
| File | Exported Actions |
| :--- | :--- |
| `actions/auth.ts` | `signUpAction`, `loginAction`, `updateUserThemeAction` |
| `actions/initialization.ts` | `createAdminAction` |
| `actions/employees.ts` | `createEmployeeAction`, `updateEmployeeAction`, `changeEmployeePasswordAction`, `deleteEmployeeAction` |
| `actions/users.ts` | `createUserAction`, `updateUserAction`, `changeUserPasswordAction`, `deleteUserAction` |
| `actions/organizations.ts` | `getOrganizationCategories`, `createOrganizationCategoryAction`, `updateOrganizationCategoryAction`, `deleteOrganizationCategoryAction`, `createOrganizationAction`, `updateOrganizationAction`, `changeOrganizationPasswordAction`, `deleteOrganizationAction` |
| `actions/services.ts` | `createServiceAction`, `deleteServiceAction` |
| `actions/service-types.ts` | `getServiceTypesAction`, `updateServiceTypeAction` |
| `actions/courses.ts` | `createCourseAction`, `updateCourseAction`, `deleteCourseAction`, `reorderOrgCoursesAction` |

---

## 8. Commands & Verification

### Running Locally
```bash
# Start development environment
npm run dev

# Run Production Build Check
npm run build
```

### Running Unit Tests
Execute the unit test suites to verify server action constraints, security boundaries, component behaviour, and theme integrations:
```bash
# Run all tests (241 tests across 24 test files)
npm run test

# Run with coverage report
npx vitest run --coverage --coverage.provider=v8 --coverage.reporter=text
```

### Test Coverage Metrics
- **Statements**: 75.95%
- **Branches**: 65.29%
- **Functions**: 61.06%
- **Lines**: 76.58%

### Test Coverage Summary
| Area | Files Covered |
| :--- | :--- |
| Server actions | `auth`, `initialization`, `employees`, `users`, `organizations`, `services`, `service-types`, `courses` |
| Auth & routing | `auth.ts` (authorize logic), `auth.config.ts` (route guards) |
| Components | `backoffice-login-form`, `login-form`, `signup-form`, `backoffice-sidebar`, `theme-provider`, `service-types-table`, `password-strength`, `edit-organization-form`, `dashboard-services-list`, `services-table`, `course-form`, `dashboard-service-detail` |
| Config & utilities | `config/service-types`, `config/dog-training`, `lib/utils` |
| Hooks | `use-mobile` |
