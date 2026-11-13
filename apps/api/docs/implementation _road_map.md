# ClassGrid — MVP Implementation Roadmap

> Phase-by-phase, day-by-day implementation plan for a production-ready MVP. Duration: **4 Weeks (28 Days)**
> Goal: Deliver a deployed **School Timetable Management Platform** with authentication, academic configuration, resource management, teaching assignments, manual timetable creation, conflict detection, timetable generation, publishing, and Excel/PDF export.

---

# Timeline Overview

| **Phase**                            | **Days**  | **Theme**                                                       |
| ------------------------------------ | --------- | --------------------------------------------------------------- |
| **1 — Foundation**                   | Day 1–5   | Project Setup, Database, Architecture, Authentication           |
| **2 — School Configuration**         | Day 6–10  | Academic Structure, Classes, Teachers, Subjects, Rooms, Periods |
| **3 — Scheduling Core**              | Day 11–16 | Teaching Assignments, Timetable, Conflict Detection             |
| **4 — Timetable Generator**          | Day 17–21 | Automatic Generation, Constraints, Validation                   |
| **5 — Frontend & Workflow**          | Day 22–25 | Dashboard, Timetable Editor, Publishing                         |
| **6 — Export, Testing & Deployment** | Day 26–28 | Excel/PDF, Testing, Security, Deployment                        |

---

# Phase 1 — Foundation (Day 1–5)

## Day 1 — Project Setup

**Goal:** Development environment fully configured.

| **ID**        | **Task**                                  | **Acceptance Criteria**                           |
| ------------- | ----------------------------------------- | ------------------------------------------------- |
| CLASSGRID-1.1 | Initialize Express + TypeScript backend   | Backend starts successfully                       |
| CLASSGRID-1.2 | Initialize React + TypeScript frontend    | Frontend starts successfully                      |
| CLASSGRID-1.3 | Configure ESLint, Prettier & Husky        | Formatting and linting work correctly             |
| CLASSGRID-1.4 | Configure environment validation with Zod | Application rejects invalid environment variables |
| CLASSGRID-1.5 | Configure PostgreSQL & Prisma             | Database connection successful                    |
| CLASSGRID-1.6 | Configure project folder structure        | Backend and frontend follow agreed architecture   |
| CLASSGRID-1.7 | Configure Git repository                  | Initial commit completed                          |
| CLASSGRID-1.8 | Configure application logging             | HTTP/application logs are available               |

**Deliverable:** Backend and frontend projects ready for development.

---

## Day 2 — Database Schema

**Goal:** Establish the complete timetable domain model.

| **ID**         | **Task**                                    | **Acceptance Criteria**                         |
| -------------- | ------------------------------------------- | ----------------------------------------------- |
| CLASSGRID-1.9  | Finalize Prisma schema                      | All required entities are represented           |
| CLASSGRID-1.10 | Define enums                                | Status and configuration enums are defined      |
| CLASSGRID-1.11 | Define school/session/term relationships    | Academic structure is represented correctly     |
| CLASSGRID-1.12 | Define class and class-arm relationships    | Classes can contain multiple arms               |
| CLASSGRID-1.13 | Define teacher, subject and room models     | Scheduling resources are represented            |
| CLASSGRID-1.14 | Define period model                         | Periods can be ordered and scheduled            |
| CLASSGRID-1.15 | Define teaching assignments                 | Teacher + Subject + ClassArm relationship works |
| CLASSGRID-1.16 | Define timetable and timetable-entry models | Timetable versions can contain entries          |
| CLASSGRID-1.17 | Add indexes and database constraints        | Important uniqueness rules are enforced         |
| CLASSGRID-1.18 | Create initial migration                    | Database can be created from migration          |

**Deliverable:** Initial ClassGrid database schema and migration.

---

## Day 3 — Database & Seed Data

**Goal:** Make the development database usable.

| **ID**         | **Task**                         | **Acceptance Criteria**               |
| -------------- | -------------------------------- | ------------------------------------- |
| CLASSGRID-1.19 | Review generated migration       | Migration matches intended schema     |
| CLASSGRID-1.20 | Add required raw SQL constraints | Prisma limitations are handled safely |
| CLASSGRID-1.21 | Generate Prisma Client           | Client generated successfully         |
| CLASSGRID-1.22 | Create database seed             | Development data can be inserted      |
| CLASSGRID-1.23 | Seed academic session and term   | Active academic period exists         |
| CLASSGRID-1.24 | Seed classes and class arms      | Test classes exist                    |
| CLASSGRID-1.25 | Seed teachers and subjects       | Scheduling resources exist            |
| CLASSGRID-1.26 | Seed rooms and periods           | Timetable can be constructed          |

**Deliverable:** Reproducible development database.

---

## Day 4 — Authentication

**Goal:** Secure access to the ClassGrid administration system.

| **ID**         | **Task**                            | **Acceptance Criteria**                             |
| -------------- | ----------------------------------- | --------------------------------------------------- |
| CLASSGRID-1.27 | Implement user registration/setup   | Initial administrator can be created                |
| CLASSGRID-1.28 | Implement password hashing          | Passwords are never stored in plaintext             |
| CLASSGRID-1.29 | Implement login                     | Valid credentials create an authenticated session   |
| CLASSGRID-1.30 | Implement logout                    | Session can be terminated                           |
| CLASSGRID-1.31 | Implement authentication middleware | Protected routes reject unauthenticated requests    |
| CLASSGRID-1.32 | Implement authorization             | Restricted operations require appropriate role      |
| CLASSGRID-1.33 | Implement current-user endpoint     | Authenticated user can retrieve account information |

**Deliverable:** Secure authentication foundation.

---

## Day 5 — API Foundation

**Goal:** Establish consistent backend patterns before implementing features.

| **ID**         | **Task**                                          | **Acceptance Criteria**                        |
| -------------- | ------------------------------------------------- | ---------------------------------------------- |
| CLASSGRID-1.34 | Establish controller/service/repository structure | Business logic is separated from HTTP handling |
| CLASSGRID-1.35 | Configure request validation with Zod             | Invalid request data is rejected               |
| CLASSGRID-1.36 | Implement centralized error handling              | API errors follow a consistent format          |
| CLASSGRID-1.37 | Configure API response conventions                | Responses follow a consistent structure        |
| CLASSGRID-1.38 | Configure OpenAPI documentation                   | API documentation is generated                 |
| CLASSGRID-1.39 | Implement health endpoint                         | Health check returns successful response       |
| CLASSGRID-1.40 | Write foundation tests                            | Core infrastructure passes tests               |

**Deliverable:** Stable backend foundation ready for feature development.

---

# Phase 2 — School Configuration (Day 6–10)

## Day 6 — Academic Session & Term Management

**Goal:** Configure the academic periods used by timetables.

| **ID**        | **Task**                           | **Acceptance Criteria**                      |
| ------------- | ---------------------------------- | -------------------------------------------- |
| CLASSGRID-2.1 | Implement academic session CRUD    | Sessions can be created and managed          |
| CLASSGRID-2.2 | Implement term CRUD                | Terms can be created and managed             |
| CLASSGRID-2.3 | Implement active session selection | One active session can be selected           |
| CLASSGRID-2.4 | Implement active term selection    | One active term can be selected              |
| CLASSGRID-2.5 | Add session/term validation        | Invalid academic configurations are rejected |
| CLASSGRID-2.6 | Create session/term API tests      | Tests cover main workflows                   |

**Deliverable:** Academic configuration is functional.

---

## Day 7 — Classes & Class Arms

**Goal:** Manage the classes that will receive timetables.

| **ID**         | **Task**                           | **Acceptance Criteria**                     |
| -------------- | ---------------------------------- | ------------------------------------------- |
| CLASSGRID-2.7  | Implement class CRUD               | Classes can be created, edited and archived |
| CLASSGRID-2.8  | Implement class-arm CRUD           | Arms can be created and managed             |
| CLASSGRID-2.9  | Validate unique class-arm names    | Duplicate arms are rejected                 |
| CLASSGRID-2.10 | Implement class listing/filtering  | Classes can be searched and filtered        |
| CLASSGRID-2.11 | Implement class timetable endpoint | Class timetable can be retrieved            |
| CLASSGRID-2.12 | Write class module tests           | Main class workflows are covered            |

**Deliverable:** Class structure is manageable through the API.

---

## Day 8 — Teachers & Subjects

**Goal:** Manage teaching resources.

| **ID**         | **Task**                                  | **Acceptance Criteria**             |
| -------------- | ----------------------------------------- | ----------------------------------- |
| CLASSGRID-2.13 | Implement teacher CRUD                    | Teachers can be managed             |
| CLASSGRID-2.14 | Implement teacher availability fields     | Availability can be configured      |
| CLASSGRID-2.15 | Implement teacher timetable endpoint      | Teacher schedule can be retrieved   |
| CLASSGRID-2.16 | Implement subject CRUD                    | Subjects can be managed             |
| CLASSGRID-2.17 | Configure subject scheduling requirements | Required periods can be represented |
| CLASSGRID-2.18 | Write teacher/subject tests               | Main workflows pass                 |

**Deliverable:** Teachers and subjects are ready for scheduling.

---

## Day 9 — Rooms & Periods

**Goal:** Configure physical and temporal scheduling resources.

| **ID**         | **Task**                          | **Acceptance Criteria**              |
| -------------- | --------------------------------- | ------------------------------------ |
| CLASSGRID-2.19 | Implement room CRUD               | Rooms can be managed                 |
| CLASSGRID-2.20 | Configure room properties         | Room capacity/type can be stored     |
| CLASSGRID-2.21 | Implement room timetable endpoint | Room schedule can be retrieved       |
| CLASSGRID-2.22 | Implement period CRUD             | Periods can be created and updated   |
| CLASSGRID-2.23 | Configure period ordering         | Periods maintain predictable order   |
| CLASSGRID-2.24 | Configure working days            | Active timetable days can be defined |
| CLASSGRID-2.25 | Write room/period tests           | Main workflows pass                  |

**Deliverable:** All basic scheduling resources are configurable.

---

## Day 10 — Configuration Frontend

**Goal:** Provide an administrative interface for school configuration.

| **ID**         | **Task**                   | **Acceptance Criteria**              |
| -------------- | -------------------------- | ------------------------------------ |
| CLASSGRID-2.26 | Build application layout   | Navigation and page structure work   |
| CLASSGRID-2.27 | Build session/term screens | Academic configuration is manageable |
| CLASSGRID-2.28 | Build classes screen       | Classes and arms can be managed      |
| CLASSGRID-2.29 | Build teachers screen      | Teachers can be managed              |
| CLASSGRID-2.30 | Build subjects screen      | Subjects can be managed              |
| CLASSGRID-2.31 | Build rooms screen         | Rooms can be managed                 |
| CLASSGRID-2.32 | Build periods screen       | Periods can be managed               |

**Deliverable:** Basic administration interface is functional.

---

# Phase 3 — Scheduling Core (Day 11–16)

## Day 11 — Teaching Assignments

**Goal:** Define the actual teaching workload that must be scheduled.

| **ID**        | **Task**                            | **Acceptance Criteria**                |
| ------------- | ----------------------------------- | -------------------------------------- |
| CLASSGRID-3.1 | Implement teaching-assignment CRUD  | Assignments can be created and managed |
| CLASSGRID-3.2 | Assign teacher to subject/class arm | Valid relationships are enforced       |
| CLASSGRID-3.3 | Configure periods required per week | Weekly requirements are stored         |
| CLASSGRID-3.4 | Validate teacher assignments        | Invalid assignments are rejected       |
| CLASSGRID-3.5 | View assignments by class           | Class workload is visible              |
| CLASSGRID-3.6 | View assignments by teacher         | Teacher workload is visible            |
| CLASSGRID-3.7 | Write assignment tests              | Assignment workflows pass              |

**Deliverable:** Complete scheduling workload is represented.

---

## Day 12 — Timetable Versioning

**Goal:** Establish the lifecycle of a timetable.

| **ID**         | **Task**                        | **Acceptance Criteria**                   |
| -------------- | ------------------------------- | ----------------------------------------- |
| CLASSGRID-3.8  | Implement timetable creation    | New timetable can be created              |
| CLASSGRID-3.9  | Implement timetable versions    | Multiple versions can exist               |
| CLASSGRID-3.10 | Implement DRAFT status          | Draft timetable can be modified           |
| CLASSGRID-3.11 | Implement PUBLISHED status      | Published timetable becomes controlled    |
| CLASSGRID-3.12 | Implement ARCHIVED status       | Previous versions can be retained         |
| CLASSGRID-3.13 | Implement timetable duplication | Existing timetable can become a new draft |
| CLASSGRID-3.14 | Write versioning tests          | Version lifecycle behaves correctly       |

**Deliverable:** Timetable version lifecycle is functional.

---

## Day 13 — Timetable Entries

**Goal:** Implement the core scheduling operation.

| **ID**         | **Task**                           | **Acceptance Criteria**                    |
| -------------- | ---------------------------------- | ------------------------------------------ |
| CLASSGRID-3.15 | Implement timetable entry creation | Lesson can be placed into a timetable      |
| CLASSGRID-3.16 | Implement timetable entry update   | Lesson can be moved/updated                |
| CLASSGRID-3.17 | Implement timetable entry deletion | Draft entries can be removed               |
| CLASSGRID-3.18 | Assign day and period              | Entry occupies a specific time slot        |
| CLASSGRID-3.19 | Assign room                        | Lesson can have a room                     |
| CLASSGRID-3.20 | Retrieve timetable grid            | Complete weekly timetable can be retrieved |
| CLASSGRID-3.21 | Retrieve class timetable           | Class-specific timetable works             |
| CLASSGRID-3.22 | Retrieve teacher timetable         | Teacher-specific timetable works           |
| CLASSGRID-3.23 | Retrieve room timetable            | Room-specific timetable works              |

**Deliverable:** Timetable entries can be created and retrieved.

---

## Day 14 — Conflict Detection

**Goal:** Prevent scheduling conflicts.

| **ID**         | **Task**                               | **Acceptance Criteria**                           |
| -------------- | -------------------------------------- | ------------------------------------------------- |
| CLASSGRID-3.24 | Implement class clash detection        | Class cannot have two lessons in one slot         |
| CLASSGRID-3.25 | Implement teacher clash detection      | Teacher cannot teach two lessons in one slot      |
| CLASSGRID-3.26 | Implement room clash detection         | Room cannot host two lessons in one slot          |
| CLASSGRID-3.27 | Implement conflict service             | Conflicts are detected consistently               |
| CLASSGRID-3.28 | Return structured conflict information | API identifies conflict type and affected entries |
| CLASSGRID-3.29 | Prevent invalid timetable writes       | Conflicting entries cannot be saved               |
| CLASSGRID-3.30 | Write conflict tests                   | All core clash scenarios are tested               |

**Deliverable:** ClassGrid prevents class, teacher, and room clashes.

---

## Day 15 — Timetable Validation

**Goal:** Determine whether a timetable is complete and publishable.

| **ID**         | **Task**                               | **Acceptance Criteria**                |
| -------------- | -------------------------------------- | -------------------------------------- |
| CLASSGRID-3.31 | Validate weekly lesson requirements    | Required periods are checked           |
| CLASSGRID-3.32 | Detect unscheduled assignments         | Missing lessons are identified         |
| CLASSGRID-3.33 | Detect scheduling conflicts            | Existing conflicts are reported        |
| CLASSGRID-3.34 | Validate room assignments              | Invalid room usage is reported         |
| CLASSGRID-3.35 | Validate teacher availability          | Unavailable periods are reported       |
| CLASSGRID-3.36 | Generate validation summary            | User receives clear validation results |
| CLASSGRID-3.37 | Block publishing when validation fails | Invalid timetable cannot be published  |

**Deliverable:** ClassGrid can determine whether a timetable is valid.

---

## Day 16 — Manual Timetable Editor

**Goal:** Build the primary timetable management interface.

| **ID**         | **Task**                        | **Acceptance Criteria**             |
| -------------- | ------------------------------- | ----------------------------------- |
| CLASSGRID-3.38 | Build weekly timetable grid     | Days and periods are displayed      |
| CLASSGRID-3.39 | Display timetable entries       | Lessons show relevant information   |
| CLASSGRID-3.40 | Add lesson from UI              | Administrator can schedule a lesson |
| CLASSGRID-3.41 | Edit lesson                     | Existing lesson can be modified     |
| CLASSGRID-3.42 | Delete lesson                   | Draft lesson can be removed         |
| CLASSGRID-3.43 | Display conflict feedback       | Scheduling conflicts are visible    |
| CLASSGRID-3.44 | Add timetable validation action | User can validate timetable         |
| CLASSGRID-3.45 | Add draft-save workflow         | Changes persist correctly           |

**Deliverable:** Administrator can manually build and validate a timetable visually.

---

# Phase 4 — Timetable Generator (Day 17–21)

## Day 17 — Generator Design

**Goal:** Define the automatic scheduling engine before implementation.

| **ID**        | **Task**                       | **Acceptance Criteria**                              |
| ------------- | ------------------------------ | ---------------------------------------------------- |
| CLASSGRID-4.1 | Define generator input model   | Generator receives complete scheduling requirements  |
| CLASSGRID-4.2 | Define hard constraints        | Mandatory scheduling rules are documented            |
| CLASSGRID-4.3 | Define soft constraints        | Preferences are separated from mandatory rules       |
| CLASSGRID-4.4 | Define scheduling strategy     | Initial generation algorithm is documented           |
| CLASSGRID-4.5 | Define failure scenarios       | Generator explains why schedules cannot be generated |
| CLASSGRID-4.6 | Create generator test fixtures | Repeatable scheduling scenarios exist                |

**Deliverable:** Generator architecture and constraints documented before coding.

---

## Day 18 — Generator Core

**Goal:** Implement the scheduling engine.

| **ID**         | **Task**                              | **Acceptance Criteria**                             |
| -------------- | ------------------------------------- | --------------------------------------------------- |
| CLASSGRID-4.7  | Build scheduling candidate model      | Assignments can be converted into scheduling units  |
| CLASSGRID-4.8  | Implement available-slot calculation  | Valid slots can be identified                       |
| CLASSGRID-4.9  | Implement constraint checking         | Candidate placements are validated                  |
| CLASSGRID-4.10 | Implement lesson placement            | Generator can place lessons                         |
| CLASSGRID-4.11 | Implement backtracking/retry strategy | Failed placements can be reconsidered               |
| CLASSGRID-4.12 | Implement generation result model     | Generated timetable or failure details are returned |

**Deliverable:** Generator can produce a timetable for a valid scheduling dataset.

---

## Day 19 — Generator Rules

**Goal:** Improve generated timetable quality.

| **ID**         | **Task**                                | **Acceptance Criteria**                     |
| -------------- | --------------------------------------- | ------------------------------------------- |
| CLASSGRID-4.13 | Implement teacher availability          | Generator respects teacher availability     |
| CLASSGRID-4.14 | Implement room availability             | Generator respects room availability        |
| CLASSGRID-4.15 | Implement class availability            | Generator respects class constraints        |
| CLASSGRID-4.16 | Implement periods-per-week requirements | Required lesson counts are satisfied        |
| CLASSGRID-4.17 | Implement teacher workload constraints  | Workload limits are respected               |
| CLASSGRID-4.18 | Implement maximum lessons per day       | Daily limits are respected                  |
| CLASSGRID-4.19 | Implement consecutive-lesson rules      | Configured consecutive limits are respected |

**Deliverable:** Generator handles the primary scheduling constraints.

---

## Day 20 — Generator Integration

**Goal:** Connect automatic generation to the timetable workflow.

| **ID**         | **Task**                             | **Acceptance Criteria**                               |
| -------------- | ------------------------------------ | ----------------------------------------------------- |
| CLASSGRID-4.20 | Create generation endpoint           | Generator can be triggered through API                |
| CLASSGRID-4.21 | Create generation request validation | Invalid generation requests are rejected              |
| CLASSGRID-4.22 | Generate timetable as draft          | Generated schedules are never published automatically |
| CLASSGRID-4.23 | Validate generated timetable         | Generated result passes validation                    |
| CLASSGRID-4.24 | Handle generation failure            | User receives useful failure information              |
| CLASSGRID-4.25 | Add generation history/status        | Generation attempts can be tracked                    |

**Deliverable:** Automatic generation produces editable draft timetables.

---

## Day 21 — Generator UI

**Goal:** Provide an interface for automatic timetable generation.

| **ID**         | **Task**                              | **Acceptance Criteria**                     |
| -------------- | ------------------------------------- | ------------------------------------------- |
| CLASSGRID-4.26 | Build generation configuration screen | User can configure generation               |
| CLASSGRID-4.27 | Display scheduling requirements       | User can review inputs                      |
| CLASSGRID-4.28 | Start generation                      | Generation can be triggered                 |
| CLASSGRID-4.29 | Display generation progress/state     | User receives clear status                  |
| CLASSGRID-4.30 | Display generation result             | Generated timetable can be reviewed         |
| CLASSGRID-4.31 | Allow generated timetable editing     | Generated schedule can be manually adjusted |

**Deliverable:** Automatic generation is usable from the frontend.

---

# Phase 5 — Frontend & Timetable Workflow (Day 22–25)

## Day 22 — Dashboard

**Goal:** Provide a useful administrative overview.

| **ID**        | **Task**                 | **Acceptance Criteria**                              |
| ------------- | ------------------------ | ---------------------------------------------------- |
| CLASSGRID-5.1 | Build dashboard layout   | Dashboard loads correctly                            |
| CLASSGRID-5.2 | Display active timetable | Current timetable is visible                         |
| CLASSGRID-5.3 | Display resource counts  | Classes, teachers, subjects and rooms are summarized |
| CLASSGRID-5.4 | Display timetable status | Draft/published status is visible                    |
| CLASSGRID-5.5 | Display recent activity  | Recent timetable actions are visible                 |
| CLASSGRID-5.6 | Add quick actions        | Common operations are easily accessible              |

**Deliverable:** Functional ClassGrid dashboard.

---

## Day 23 — Timetable Management

**Goal:** Complete timetable lifecycle management from the frontend.

| **ID**         | **Task**                      | **Acceptance Criteria**                   |
| -------------- | ----------------------------- | ----------------------------------------- |
| CLASSGRID-5.7  | Build timetable list          | Existing timetable versions are displayed |
| CLASSGRID-5.8  | Filter by session/term/status | Timetables can be filtered                |
| CLASSGRID-5.9  | Create timetable version      | New draft can be created                  |
| CLASSGRID-5.10 | Duplicate timetable           | Existing version can be copied            |
| CLASSGRID-5.11 | Archive timetable             | Old versions can be archived              |
| CLASSGRID-5.12 | View timetable details        | Complete timetable can be opened          |

**Deliverable:** Complete timetable version management UI.

---

## Day 24 — Publish Workflow

**Goal:** Safely move a timetable from draft to published state.

| **ID**         | **Task**                                  | **Acceptance Criteria**                    |
| -------------- | ----------------------------------------- | ------------------------------------------ |
| CLASSGRID-5.13 | Add pre-publish validation                | Validation runs before publishing          |
| CLASSGRID-5.14 | Display validation errors                 | User can identify problems                 |
| CLASSGRID-5.15 | Implement publish action                  | Valid timetable can be published           |
| CLASSGRID-5.16 | Prevent invalid publishing                | Invalid timetable cannot be published      |
| CLASSGRID-5.17 | Handle active published timetable         | Published timetable is clearly identified  |
| CLASSGRID-5.18 | Implement archive-on-replacement workflow | Previous version is retained appropriately |

**Deliverable:** Safe draft → validation → publish workflow.

---

## Day 25 — Views & Usability

**Goal:** Make schedules useful to different school users.

| **ID**         | **Task**                       | **Acceptance Criteria**                    |
| -------------- | ------------------------------ | ------------------------------------------ |
| CLASSGRID-5.19 | Build class timetable view     | Schedule can be viewed by class            |
| CLASSGRID-5.20 | Build teacher timetable view   | Schedule can be viewed by teacher          |
| CLASSGRID-5.21 | Build room timetable view      | Schedule can be viewed by room             |
| CLASSGRID-5.22 | Add timetable filtering        | Relevant schedules can be filtered         |
| CLASSGRID-5.23 | Improve responsive layout      | Core screens work on tablet-sized displays |
| CLASSGRID-5.24 | Add loading/empty/error states | UI handles common states correctly         |

**Deliverable:** Timetable is usable from multiple perspectives.

---

# Phase 6 — Export, Testing & Deployment (Day 26–28)

## Day 26 — Excel & PDF Export

**Goal:** Allow schools to distribute and print timetables.

| **ID**        | **Task**                         | **Acceptance Criteria**                      |
| ------------- | -------------------------------- | -------------------------------------------- |
| CLASSGRID-6.1 | Implement Excel export           | Timetable can be exported as `.xlsx`         |
| CLASSGRID-6.2 | Format Excel timetable           | Export is readable and print-friendly        |
| CLASSGRID-6.3 | Implement PDF generation         | Timetable can be exported as PDF             |
| CLASSGRID-6.4 | Format PDF timetable             | PDF contains school/session/term information |
| CLASSGRID-6.5 | Support class timetable export   | Individual class schedules can be exported   |
| CLASSGRID-6.6 | Support teacher timetable export | Individual teacher schedules can be exported |

**Deliverable:** Timetables can be distributed digitally or printed.

---

## Day 27 — Testing & Security

**Goal:** Ensure the MVP is reliable before deployment.

| **ID**         | **Task**                          | **Acceptance Criteria**                        |
| -------------- | --------------------------------- | ---------------------------------------------- |
| CLASSGRID-6.7  | Run backend unit tests            | Core services pass                             |
| CLASSGRID-6.8  | Test timetable conflict scenarios | All core clash cases pass                      |
| CLASSGRID-6.9  | Test generator scenarios          | Valid datasets generate correctly              |
| CLASSGRID-6.10 | Test invalid generator scenarios  | Impossible schedules fail gracefully           |
| CLASSGRID-6.11 | Test authentication/authorization | Unauthorized access is rejected                |
| CLASSGRID-6.12 | Test timetable publishing         | Invalid timetables cannot be published         |
| CLASSGRID-6.13 | Test frontend critical workflows  | Main user flows work                           |
| CLASSGRID-6.14 | Review API validation             | Invalid input is consistently rejected         |
| CLASSGRID-6.15 | Review security configuration     | Production security requirements are satisfied |
| CLASSGRID-6.16 | Fix critical bugs                 | No known blocker remains                       |

**Deliverable:** MVP passes functional and security verification.

---

## Day 28 — Production Deployment

**Goal:** Deploy ClassGrid and verify the production environment.

| **ID**         | **Task**                         | **Acceptance Criteria**                        |
| -------------- | -------------------------------- | ---------------------------------------------- |
| CLASSGRID-6.17 | Configure production environment | Production variables are configured securely   |
| CLASSGRID-6.18 | Configure production PostgreSQL  | Production database is accessible              |
| CLASSGRID-6.19 | Run production migrations        | Database is up to date                         |
| CLASSGRID-6.20 | Deploy backend                   | API is publicly accessible                     |
| CLASSGRID-6.21 | Deploy frontend                  | Web application is publicly accessible         |
| CLASSGRID-6.22 | Configure CORS/domain            | Frontend communicates with backend             |
| CLASSGRID-6.23 | Configure production logging     | Production errors can be diagnosed             |
| CLASSGRID-6.24 | Run production smoke tests       | Critical workflows work in production          |
| CLASSGRID-6.25 | Create deployment documentation  | Project can be deployed/recovered consistently |

**Deliverable:** **ClassGrid MVP deployed and operational.**

---

# MVP Completion Criteria

ClassGrid is considered MVP-complete when an administrator can:

- [ ] Log in securely
- [ ] Configure an academic session and term
- [ ] Create classes and class arms
- [ ] Create teachers
- [ ] Create subjects
- [ ] Create rooms
- [ ] Configure school periods
- [ ] Create teaching assignments
- [ ] Specify required periods per week
- [ ] Create a timetable version
- [ ] Manually create timetable entries
- [ ] Detect class clashes
- [ ] Detect teacher clashes
- [ ] Detect room clashes
- [ ] Validate timetable completeness
- [ ] Automatically generate a timetable
- [ ] Review generated timetable
- [ ] Manually modify generated timetable
- [ ] Save timetable as draft
- [ ] Publish a valid timetable
- [ ] Archive previous timetable versions
- [ ] View timetable by class
- [ ] View timetable by teacher
- [ ] View timetable by room
- [ ] Export timetable to Excel
- [ ] Export timetable to PDF
- [ ] Deploy and operate the application in production

---

# Post-MVP — Future Enhancements

These should **not block the MVP** unless they become necessary during implementation.

- [ ] Teacher preferred periods
- [ ] Subject preferred periods
- [ ] Advanced teacher workload balancing
- [ ] Advanced consecutive-period optimization
- [ ] Free-period optimization
- [ ] Multiple timetable generation strategies
- [ ] Timetable comparison between versions
- [ ] Timetable change history
- [ ] Audit log UI
- [ ] Public timetable sharing
- [ ] Student timetable views
- [ ] Teacher accounts
- [ ] School-wide notifications
- [ ] Excel timetable import
- [ ] SMS integration
- [ ] API integration with the existing School Management System
- [ ] More advanced optimization algorithms

---

# Development Principle

ClassGrid should be implemented in this order:

**Foundation → Domain → Resources → Assignments → Manual Scheduling → Conflict Detection → Validation → Automatic Generation → Publishing → Export → Deployment**

The **manual scheduler and conflict engine should work before the automatic generator is considered complete**. The generator should use the same scheduling and validation rules rather than creating a separate set of business rules.

The database remains the **source of truth**. Excel is an import/export format, not the primary scheduling system.

Generated timetables should always be created as **DRAFT** and must pass validation before they can become **PUBLISHED**.
