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
- **Sleek Custom Scrollbar Design System**: Applied a unified, thin, pill-thumb scrollbar system across Webkit and Firefox browsers (`globals.css`), blending glassmorphic opacity values in light and dark modes with primary accent color transitions on hover. Replaced hidden sidebar scrollbars with custom scrollbars for smooth navigation.
- **Persistent User Theme**: Toggle theme changes via the top-header switcher. Settings sync directly to the database user record (`users.theme`), completely avoiding flash layout mismatches or cookies.
- **Collapsible Sidebar Tree**: Fully responsive sidebar with collapsible navigation groups, active route tracking, and real-time menu search filtering.
- **Credential Protection**: All creation popups include `Confirm Password` fields with client-side match checking and `Eye`/`EyeOff` visibility toggles.
- **Password Strength Indicator**: Renders a premium, real-time client-side validation widget on all forms where passwords are set or modified. It checks for length (min 6 characters), numbers, uppercase letters, and special symbols, updating visual segmented color-coded bars and checklists dynamically.
- **Setup Auto-Redirection**: Automatically routes the administrator to the backoffice portal (/backoffice) upon completing first-time platform setup. Direct access to `/initialization` is strictly blocked and redirected to `/backoffice` once the platform has been initialized.
- **Tactile Service Toggle Cards**: Replaced standard multi-select fields with a visual option grid. Users can toggle multiple services. Existing category services are displayed as checkmarked and disabled with a "Registered" indicator to prevent duplicate allocations.
- **FAQ Accordion Builder & Display**: Interactive FAQ Q&A list builder situated underneath the Terms of Participation section in the Course Form (`CourseForm`). Renders as a clean, static, always-visible question-and-answer list (with no collapsible accordion functionality) inside expandable course detail drawers on the dynamic services settings page.
- **Unsaved Changes Safeguard**: Checks if any input fields in the Course Configurator (`CourseForm`) are dirty. Prompts a native confirm dialog if the user clicks the "Back" button, and registers a browser `beforeunload` listener to warn the user if they attempt to reload or close the tab.
- **Renamed Account Settings & Dedicated Billing Tab**: Renamed dashboard and backoffice settings tabs ("Account information" to "Information", "Account settings" to "Security") and extracted the organization's address parameters into a new dedicated "Billing" tab. Updated routes to `/dashboard/account/information`, `/dashboard/account/security`, `/dashboard/account/billing` for the dashboard, and `/backoffice/organizations/information/[id]`, `/backoffice/organizations/security/[id]`, `/backoffice/organizations/billing/[id]` for the backoffice.
- **Profile Information Updates**:
  - Added **Email** row to the Information tab page, linking to the pre-existing email edit modal.
  - Renamed **"Phone number"** row and input labels to **"Phone"**.
  - Added a new rich-text **Description** field (persisted under `description` in database schema) edited using the pre-existing custom `WysiwygEditor` inside a new dedicated edit modal popup. Renders a plain-text preview on the card view.
  - **End-Area Chevron Edit Controls & Clickable External Links**: Replaced whole-row button triggers across `/backoffice/organizations/*` and `/dashboard/account/*` cards with dedicated end-area chevron edit buttons. Field labels and values remain clean and non-interactive for clicking except for Email (renders `mailto:` link opening in a new tab), Phone numbers (renders `tel:` link opening in a new tab), and Website / Social profile URLs (renders `https://` link opening in a new tab). Also updated the main Organizations Directory table (`OrganizationsTable`) email column to render clickable `mailto:` links opening in a new tab.
- **Flat Service Lists & Boarding-only Time Pickers**:
  - Removed course collapsible detail panel drawers entirely on training, sports, and boarding services detail views to present clean, flat entry list rows. Key attribute badges (Certified, Field, Parking, Meds, Web Cam, Walks, Updates, Meal Plan, Price) render directly inside the rows.
  - Restricted "Check-in Time" and "Check-out Time" picker inputs and badges to only display for the Dog Boarding service (`slug === "dog-boarding"`).
  - Built custom `TimePickerSelect` inputs with chevron toggles for the Daily Operating Schedule that render all time options in a scrollable dropdown container showing **5 visible items at a time** so users can scroll to inspect and select any option.
- **Unified Custom Dropdowns (`CustomSelect`)**: Replaced all native browser `<select>` elements across the entire platform (Daily Walks, Billing Frequency, Organization Category, Staff Role, and Service Template preview dropdowns) with a reusable, accessible custom dropdown component (`CustomSelect`). Features animated popover menus with thin custom scrollbars (`custom-scrollbar`), hover state highlights, selected checkmark indicators, outside-click auto-dismissal, and a synchronized hidden native select element ensuring seamless HTML form submission and test compatibility.
  - Enforced strict client-side and server-side validation ensuring check-out time cannot be before or equal to check-in time (`checkout > checkin`).
  - Added **Web cam** boolean switch (`webCam`) and optional access instructions text input (`webCamDetails`) strictly scoped to the Dog Boarding service (`/dashboard/services/dog-boarding`). Renders a teal `Web Cam` badge on active entries.
- **Dog Sports Training & Dog Training Screen Reorganization**:
  - Reorganized the "Dog training" service (`/dashboard/services/dog-training`) into a clean tabbed layout matching "Dog sports training".
  - Standardized tabs: **General**, **Terms of participation**, **Pricing**, **Schedule**, **Location**, **FAQ**.
  - Added an **Others** tab for existing Dog Training fields that are not mapped to standard tabs (`Communication with the Owner` and `Personalized Meal Plan`), preserving all existing functionality without adding unrequested fields.
- **Dog Grooming Sidebar Redirection**:
  - Updated active service slug resolution in `src/app/dashboard/layout.tsx` to automatically fall back to normalized service name slugs (`s.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")`).
  - Accessing "Dog grooming" from the sidebar now redirects directly to `/dashboard/services/dog-grooming`.
- **Dog Sports Training MVP Subsystem**:
  - Renamed "Daily operating Schedule" header to "Schedule" for Dog Sport services (`/dashboard/services/sport-dog-training`).
  - Updated check-in and check-out field labels to **Start** and **End** across the Weekly Schedule, Special Openings, and summary views for Dog Sports.
  - Added per-day **Note / Schedule Remarks** text inputs to every day row in the Schedule editor, enabling trainers to attach specific session remarks (e.g. "Group sessions only", "Advance registration required").
  - Fixed `parseScheduleGroups` to include schedule notes in grouping keys so remarks are preserved in summary detail views.
  - Built real-time Date Overlap Validation & Conflict Notifications that warn users if closed periods overlap with open operating dates.
  - Constrained Start/End dropdown widths (`sm:w-36`) for a sleek, compact layout with 100% unified styling matching `CustomSelect` and `Input`.
  - Removed the "Active" status badge on the Dog Sport Training dashboard view (`/dashboard/services/sport-dog-training`).
- **Service Age Limits Switch & Checkboxes Option Group**:
  - Added a new database-backed `Age limits` boolean switch (`ageLimitsEnabled`) and text field (`ageLimits`) to courses schema.
  - Shows when editing or adding courses for "Dog training" and "Dog sports training" services.
  - If enabled, presents a checkbox multi-select option group for age phases: "Puppyhood (8 Weeks to 5 Months)", "Adolescence / Teenage Phase (5 Months to 12–18 Months)", and "Adulthood & Senior Years (1 Year +)".
- **Two-Column Billing Cards & Primary / Secondary Contact Reorganization**:
  - The "Billing" tab splits content into a two-column layout on large screens: **Company information** card (Company name, Tax ID, Trade Registry Number, EUID, Address, Bank, and Bank Account Number) and **Contact information** card (Primary Contact Person and Secondary Contact Person).
- **Modular Component Architecture & Form Decomposition**:
  - Decomposed monolithic form structures (`course-form.tsx` and `edit-organization-form.tsx`) into clean, focused sub-components under `src/components/org-form/` and shared UI primitives.
  - Split `edit-organization-form.tsx` (2,800+ lines) into modular tab components (`org-info-tab.tsx`, `org-billing-tab.tsx`, `org-security-tab.tsx`, `org-services-tab.tsx`, `org-subscription-tab.tsx`, and `types.ts`).
  - Standardized all toggle controls across services lists, service detail screens, organization forms, and course forms with the reusable `ToggleSwitch` component primitive.
  - Primary Contact Person: Name (`*`), Phone (`*`), Email (`*`) — all mandatory.
  - Secondary Contact Person: Name, Phone, Email — optional secondary contact backup.
  - Simplified clean field labels (`Name`, `Phone`, `Email`) under explicit section headers ("Primary Contact Person" and "Secondary Contact Person (Optional)" with no uppercase font transforms applied).
  - Separated primary and secondary contact details editing into distinct popups (`showPrimaryContactModal` and `showSecondaryContactModal`).
  - Marked all required fields dynamically with a red asterisk `*` and native validation.
  - Added a search dropdown selector containing all major Romanian banks with a dropdown indicator and quick-reset clear button.
  - Optimized wrapper layouts to allow full-width page stretching on `/dashboard/account/*` and `/backoffice/organizations/*` subpages, while constraining single-column forms to `max-w-4xl` and allowing the two-column Billing view to split 50%-50% across the entire width of the page.
- **Romanian Territory Searchable Dependent Dropdowns with Keyboard Navigation, Auto-Focus Jump & Validation**:
  - Built a comprehensive territory dictionary (`src/config/romanian-territory.ts`) mapping all 42 Romanian Counties to their respective cities, municipalities, towns, and communes.
  - Form address County (`addressState`) renders as a searchable dropdown listing all 42 Romanian counties with real-time text filtering and quick reset (`X`) clear button.
  - Locality (`addressCity`) renders as a searchable dependent dropdown input populated dynamically based on the selected county.
  - Implemented full keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`, mouse hover sync) for all search dropdown inputs.
  - Automatically shifts focus directly to the Locality input field and opens its search dropdown as soon as a County is selected.
  - Configured Edit Address Details modal to enforce County, Locality, and Street Address as mandatory (marked with red asterisk `*` and native form validation) while leaving the Zip Code optional and renamed to "Zip code".
- **Centralized Email TLD & 10-Digit Romanian Phone Validations (`src/lib/validation.ts`)**:
  - Implemented strict email validation (`isValidEmail`) enforcing standard RFC email format with valid domain TLD extensions of at least 2 characters (e.g., `.com`, `.ro`, `.org`).
  - Implemented simple 10-digit Romanian phone number validation (`isValidRomanianPhone`) enforcing 10-digit format starting with `0` (`07xxxxxxx`, `02xxxxxxx`, `03xxxxxxx`). Strictly rejects country prefixes (`+4`/`+40`), spaces, dots, hyphens, and non-numeric characters. Enforced across all server actions (`organizations`, `users`, `employees`, `auth`) and form controls.
- **Clean Modal Reinitialization Lifecycle**:
  - Enforced dynamic modal session key tracking (`key={modalKey}`) across all creation, editing, testing, and deletion dialogs (`SmtpConfigForm`, `EmployeesTable`, `UsersTable`, `OrganizationsTable`, `ServicesTable`, `ServiceTypesTable`, `EditOrganizationForm`).
  - Automatically unmounts and remounts clean component instances upon opening, clearing stale inputs, password visibility toggles, and previous server action error/success result banners.
- **Organization Password Change Security Email Notification**:
  - When an organization updates its main account password (`/dashboard/account/security`), `changeOrganizationPasswordAction` automatically dispatches a HTML security alert email (`sendMail`) to the account's primary email address.
  - The notification includes the recipient name, target email address, UTC timestamp of change, and a security warning advising the organization to contact support or reset their password if the change was unauthorized.
- **WYSIWYG Editor Keyboard Shortcut Isolation**:
  - Prevented the global sidebar toggle shortcut (`Ctrl + B` / `Cmd + B`) from expanding or collapsing the sidebar when focus is active inside a WYSIWYG editor (`WysiwygEditor`), contenteditable area, `<input>`, or `<textarea>`.
  - Added event propagation suppression (`e.stopPropagation()` & `e.nativeEvent.stopImmediatePropagation()`) in `WysiwygEditor` for `Ctrl + B`, `Ctrl + I`, and `Ctrl + U` formatting commands.
  - Added target check in `SidebarProvider` (`src/components/ui/sidebar.tsx`) to ignore sidebar toggle shortcuts when the user is inside an editable input field or element tagged with `data-wysiwyg="true"`.
- **Multi-Pricing Tiers, Closed Periods & Special Openings Schedule Builder**:
  - **Multi-Pricing Tiers**: Allows organizations to configure multiple price tiers and billing frequencies (e.g. `2000 RON / course`, `800 RON / month`, `100 RON / session`) with optional tier labels (e.g., "Basic Package", "Monthly Pass") across `/dashboard/services/sport-dog-training` and all course offerings. Single-price offerings remain backward compatible with plain string values.
  - **Closed Periods Schedule Builder**: Organizations can define special closed periods (vacation dates, seasonal breaks, or holiday closures with title, start date, and end date) within the Schedule tab. Displays rose `Closed: Reason (Start to End)` badges on service cards.
  - **Special Openings Schedule Builder**: Organizations can specify special dates or holiday sessions when they ARE open (e.g. Christmas Special Session, Weekend Workshop with title, start date, end date, Check-in time, and Check-out time). Displays emerald `Open: Reason (Start to End)` badges on service cards.
  - **Closed / Special Openings Overlap & Empty Entry Validation**: Automatically filters out blank entries and enforces live notification banners and form validation on submit so that closed closure date ranges (`[startDate, endDate]`) cannot overlap with special open date ranges (`[startDate, endDate]`).
- **Romanian Date Picker & Manual Text Input (`DatePickerInput`)**:
  - Created a custom reusable date picker component (`src/components/ui/date-picker-input.tsx`) formatted for Romanian locale (`DD.MM.YYYY`, e.g. `15.08.2026`).
  - Provides an interactive calendar popover widget with Romanian month names (*Ianuarie*...*Decembrie*), weekday headers (*Lu*, *Ma*, *Mi*, *Jo*, *Vi*, *Sâ*, *Du*), month navigation (`<` / `>`), and day picker grid, while leaving the text field (`type="text"`) 100% manually editable for typing, editing, or pasting date strings in Romanian format.
- **Dog Sports MVP Refinements & Schedule Notes**:
  - **Customized Terminology**: Updated daily operating schedule time labels from "Check-in Time" / "Check-out Time" to **Start** and **End** for Dog Sports Training (`/dashboard/services/sport-dog-training`), with updated validation alerts (*"End time cannot be before or equal to start time."*). Renamed section heading to **Schedule** and removed the "Active" status badge.
  - **Schedule Item Notes & Redesigned Spacious Layout**: Added optional **Note / Schedule Remarks** text fields to each daily operating schedule item (Monday to Sunday), **Closed Periods**, and **Special Openings**. Reorganized input cards to give note fields full-width dedicated rows with comfortable `h-9` inputs. Notes dynamically display alongside schedule badges on service detail views.

---





## 4. Dynamic Categories & Service Types

The backoffice system integrates completely dynamic configuration layers for business categorization and service templates:

### A. Organization Categories (`/backoffice/organizations`)
- Organization Categories are dynamically queryable from the database.
- Admin can search, create, and customize categories.
- Includes **Category Edit Modals** to update category names and descriptions.
- Dynamic color badges represent distinct category types (e.g. green for NGO, blue for Kennel, purple for Association, indigo for Provider).

### B. Service Types Configuration (`/backoffice/services/types`)
- Custom names and descriptions for service templates (Dog training, Dog boarding, Dog sports training, Dog walking, Dog grooming, etc.) are managed in the database `service_types` table.
- Added **Dog grooming** as a core sub-service under **Dog service provider** (`applicableTo: ["dog_service_provider"]`) with dedicated dynamic offerings management page (`/dashboard/services/dog-grooming`). Cleared irrelevant training and facility attribute toggles (Certified Trainer, Dedicated Field, Parking, Medication, Daily Walks, Meal Plan, Age Limits, Check-in/out), providing a clean form focused on Grooming Service Name, Pricing (per service/session/hour), Details, Terms, and FAQs.
- Renamed "Dog Sports Training" to **"Dog sports training"** to align with standardized lowercase naming conventions across all service templates.
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
  - *Personal Info*: Organization names, categories, primary contact phone, **Website** field (positioned under Phone with strict URL validation requiring `http://` or `https://`), recovery emails, social profile widgets (Facebook, Instagram, TikTok, website, GBP), and full address structures with country-specific dropdown search matching.
  - *Localized Address Validation*: Form matches phone pattern inputs against target countries (e.g., +40 for Romania, +44 for UK).
  - *Account Settings*: Interactive password reset forms complete with real-time Password Strength Check indicators.
  - *Subscription Details*: Telemetry license tier indicators and plans.
  - *Services Directory*: Modular tactile service cards enabling direct toggle actions for services.
- **Dynamic Dog Boarding Settings (Presentation-Only)**: The Dog Boarding settings page (`/dashboard/services/dog-boarding`) allows organizations to add custom sortable **Boarding service** offerings (e.g., Standard Room, VIP Cabin) with drag-and-drop reordering. The configuration form is tailored to exclude training-specific inputs (trainer certification, training field details) and supports daily, nightly, monthly, and service-level pricing frequencies. It excludes the technical Service Template Identifier string and the Service Status toggle panel.
  - *Custom attributes*: Allows toggling medication administration instructions, owner communication update feeds, and custom dietary meal plans (displaying details text boxes when enabled), along with a 1-4 walks selection dropdown.
  - *Check-in/Check-out timing*: Combobox timing text inputs configured per day for all 7 days of the week (**Monday through Sunday**) with individual day enable/disable toggles, batch preset tools ("Copy Mon to Mon–Fri", "Copy Mon to All"), and 24-hour `hh:mm` format validation with `<datalist>` dropdown suggestions every 30 minutes from `00:00` to `23:30`.
  - *Tactile lists indicators*: Displays visual indicators (Meds Administered, Walks, Updates Sent, Meal Plan) and smart grouped timing badges for operating hours (e.g. `Mon–Fri: In: 08:00 • Out: 18:00`, `Sat–Sun: In: 09:00 • Out: 16:00` or `Sun: Closed`) next to offerings in the dashboard view.

### B. Backoffice Staff Dashboard
- **Platform Telemetry Metrics**: Staff members can view critical operational metrics, including:
  - Total registered business entities/organizations.
  - 24-hour subscription activation rate trackers (+15% trend indicator).
  - Total active subscription count.
  - Expiring license alert systems prompting immediate backoffice action.

---

## 6. Dynamic Offerings & Cynological Offerings (Courses & Dog Sports)

The platform supports dynamic, nested sub-offerings for specialized services, specifically **"Dog training"**, **"Dog sports training"**, and **"Dog boarding"**:

### A. Dynamic Noun Context-Switching & Tabbed Form Architecture
The application UI dynamically adjusts its user-facing terminology and input settings depending on the slug of the active service:
- **Dog sports training** (`sport-dog-training`): Configures and displays offerings as **"Dog Sports"** (e.g. "Add Dog Sport", "Dog Sport Name") using the **Tabbed Navigation System**.
- **Dog training** (`dog-training`): Configures and displays offerings as **"Courses"** (e.g. "Add Course", "Course Name") using the **Tabbed Navigation System**.
- **Dog boarding** (`dog-boarding`): Configures and displays offerings as **"Boarding Services"** (e.g. "Add Boarding service", "Boarding service Name") using the **Tabbed Navigation System**, extended with a dedicated **Care & facilities** tab for boarding care amenities.
- Core tabbed navigation structure:
  1. **General Tab**: Name, Certified Dog Trainer toggle & Certifier Institution (training/sports), Trainer Experience Description (WYSIWYG editor), Information & Details (WYSIWYG editor).
  2. **Terms of participation Tab**: Age Limits switch & phase checkboxes (`Puppy (Up to 9 months)`, `Junior (9 to 18 months)`, `Adult (18 months to 8 years)`, `Senior (8+ years)`), Terms of Participation (WYSIWYG editor).
  3. **Pricing Tab**: Price Amount & Billing Frequency selector (`Per Night`, `Per Day`, `Per Half Day`, `Per Month`, `Per Boarding service`, etc.).
  4. **Schedule Tab**: 7-Day Daily Operating Schedule with time pickers, Closed Periods, Special Openings, and quick preset buttons (`Copy Mon to Mon–Fri` & `Copy Mon to All`).
  5. **Location Tab**: Address, Google Business Profile link, Google Maps Link, Dedicated Training Field switch (training/sports), and Parking switch & Description.
  6. **FAQ Tab**: Interactive FAQ Q&A item builder with WYSIWYG answer fields.
  7. **Care & facilities Tab** (*Boarding services*): Specialized boarding care options including Daily Walks (1–4 selector), Medication Administration (WYSIWYG editor), Web Cam access (WYSIWYG editor), Owner Communication updates (WYSIWYG editor), and Personalized Meal Plans (WYSIWYG editor).

### B. Facility & Venue Attributes & Top Action Header
Each course or dog sport is defined in a dynamic form featuring:
- **Top Header Action Bar**: Prominently displays `Cancel` and `Save Changes` / `Create [ItemNoun]` buttons right at the top header for instant access without scrolling.
- **Obedience & Certified Coaching**: Toggleable trainer certifications with certifier name tracking and a dedicated **Experience Description** WYSIWYG editor for detailing trainer background.
- **Dedicated Venues & Location**: Address, Google Business Profile (GBP) link, and Google Maps link.
- **Parking Accommodations**: Switchable parking toggle with descriptive details.
- **WYSIWYG Descriptions**: Text styling editors for program details and participation terms.

### C. Configurable Pricing Frequency
Pricing configurations support both **per-offering** and **per-month** options. The selection is saved in the database under `courses.priceType` and formatted cleanly in the directory listing (e.g. `200 RON / course` or `$150 / month`).

### D. Interactive Drag-and-Drop Reordering & Collapsible Badges Tray
Dynamic offerings are rendered as a clean, flat list featuring a tactical `GripVertical` handle and an interactive expand chevron button (`ChevronDown`). Clicking an entry or chevron expands a collapsible tray containing all associated amenity badges, schedule operating hours, closed/open exceptions, and pricing tiers. Users can drag and drop items to reorder them locally with real-time database persistence via `reorderOrgCoursesAction`.

### E. CourseForm Component Architecture

The `CourseForm` (`src/components/course-form.tsx`) is organized around **shared UI primitives** and **local section components** to eliminate duplication between the tabbed and flat layouts:

#### Shared UI Primitives (`src/components/ui/`)
| Component | Description |
| :--- | :--- |
| `ToggleSwitch` | Accessible `role="switch"` pill toggle (replaces 12+ inline button patterns). |
| `BooleanToggleField` | Compound field combining label + description + `ToggleSwitch` + optional expanded details slot. |

#### Shared Types (`src/types/`)
| File | Exports |
| :--- | :--- |
| `course.ts` | `Course` interface — shared between `CourseForm` and `DashboardServiceDetail`. |

#### Local Section Components (internal to `course-form.tsx`, not exported)
| Component | Purpose |
| :--- | :--- |
| `DayScheduleGrid` | 7-day per-day schedule editor with time pickers, notes, and copy shortcuts. |
| `AgeLimitsSection` | Age limits toggle + dog age phase checkboxes. |
| `LocationSection` | Dedicated training field + address/GBP/Maps inputs + parking. Accepts `layout="tabbed" \| "flat"` to control when address fields are revealed. |
| `PricingSection` | Multi-tier pricing builder. Accepts `compact` for sidebar/column-2 style. |
| `FaqSection` | FAQ Q&A builder. Accepts `compact` for inline (flat layout) vs card (tabbed layout). |

#### Dirty-State Detection
`isDirty` is computed via `useMemo`, with all initial values captured **once at mount** in a `useRef` snapshot (`iv`). This prevents unnecessary recomputation on every render and avoids the `getInitialWeeklySchedule(initialCourse)` call executing on every keystroke.

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
| `actions/organizations.ts` | `getOrganizationCategories`, `createOrganizationCategoryAction`, `updateOrganizationCategoryAction`, `deleteOrganizationCategoryAction`, `createOrganizationAction`, `updateOrganizationAction`, `changeOrganizationPasswordAction`, `deleteOrganizationAction`, `toggleOrganizationServiceAction`, `toggleOrganizationCourseAction` |
| `actions/services.ts` | `createServiceAction`, `deleteServiceAction`, `reorderServicesAction`, `reorderCoursesAction` |
| `actions/service-types.ts` | `getServiceTypesAction`, `updateServiceTypeAction` |
| `actions/courses.ts` | `createCourseAction`, `updateCourseAction`, `deleteCourseAction`, `reorderOrgCoursesAction` |
| `actions/system.ts` | `updateSmtpConfigAction`, `sendTestEmailAction` |

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
# Run all tests (493 tests across 39 test files)
npm run test

# Run with coverage report
npx vitest run --coverage --coverage.provider=v8 --coverage.reporter=text
```

### Test Coverage Metrics
- **Statements**: **86.20%**
- **Lines**: **87.10%**
- **Functions**: **85.10%**
- **Branches**: **76.50%**

### Test Coverage Summary
| Area | Files Covered |
| :--- | :--- |
| Server actions | `auth`, `initialization`, `employees`, `users`, `organizations`, `services`, `service-types`, `courses`, `system` |
| Auth & routing | `auth.ts` (authorize logic), `auth.config.ts` (route guards) |
| Components | `backoffice-login-form`, `login-form`, `signup-form`, `backoffice-sidebar`, `theme-provider`, `service-types-table`, `password-strength`, `edit-organization-form`, `dashboard-services-list`, `services-table`, `course-form`, `dashboard-service-detail`, `wysiwyg-editor`, `custom-select`, `service-type-preview-form`, `smtp-config-form` |
| Config & utilities | `config/service-types`, `config/dog-training`, `config/romanian-territory`, `lib/utils`, `lib/email` |
| Hooks | `use-mobile` |
