# HamHamHub Backoffice & Application Directory

A modern Next.js admin backoffice application integrating robust authentication, multi-role access control, persistent light/dark themes, and directory interfaces for managing personnel, users, and organization accounts.

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

## 5. Server Action Documentation

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

---

## 6. Commands & Verification

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
# Run all tests (188 tests across 21 test files)
npm run test

# Run with coverage report
npx vitest run --coverage --coverage.provider=v8 --coverage.reporter=text
```

### Test Coverage Summary
| Area | Files Covered |
| :--- | :--- |
| Server actions | `auth`, `initialization`, `employees`, `users`, `organizations`, `services`, `service-types` |
| Auth & routing | `auth.ts` (authorize logic), `auth.config.ts` (route guards) |
| Components | `backoffice-login-form`, `login-form`, `signup-form`, `backoffice-sidebar`, `theme-provider`, `service-types-table`, `password-strength`, `edit-organization-form` |
| Config & utilities | `config/service-types`, `lib/utils` |
| Hooks | `use-mobile` |
