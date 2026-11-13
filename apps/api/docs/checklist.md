# ClassGrid — MVP Checklist

> Progress tracker for the 4-week (28-day) MVP plan. Tick items as they are completed.

## Phase Progress

- [ ] Phase 1 — Foundation (Day 1–5)
- [ ] Phase 2 — School Configuration (Day 6–10)
- [ ] Phase 3 — Scheduling Core (Day 11–16)
- [ ] Phase 4 — Timetable Generator (Day 17–21)
- [ ] Phase 5 — Frontend & Workflow (Day 22–25)
- [ ] Phase 6 — Export, Testing & Deployment (Day 26–28)

---

## Phase 1 — Foundation (Day 1–5)

### Day 1 — Project Setup

- [x] Initialize Express + TypeScript backend
- [x] Initialize React + TypeScript frontend
- [x] Configure ESLint, Prettier & Husky
- [x] Configure environment validation with Zod
- [x] Configure PostgreSQL & Prisma
- [x] Configure project folder structure
- [x] Configure Git repository
- [x] Configure application logging

### Day 2 — Database Schema

- [x] Finalize Prisma schema
- [x] Define enums
- [x] Define school/session/term relationships
- [x] Define class and class-arm relationships
- [x] Define teacher, subject and room models
- [x] Define period model
- [x] Define teaching assignments
- [x] Define timetable and timetable-entry models
- [x] Add indexes and database constraints
- [x] Create initial migration

### Day 3 — Database & Seed Data

- [ ] Review generated migration
- [ ] Add required raw SQL constraints
- [ ] Generate Prisma Client
- [ ] Create database seed
- [ ] Seed academic session and term
- [ ] Seed classes and class arms
- [ ] Seed teachers and subjects
- [ ] Seed rooms and periods

### Day 4 — Authentication

- [x] Implement user registration/setup
- [x] Implement password hashing
- [x] Implement login
- [ ] Implement logout
- [x] Implement authentication middleware
- [x] Implement authorization
- [x] Implement current-user endpoint

### Day 5 — API Foundation

- [x] Establish controller/service/repository structure
- [x] Configure request validation with Zod
- [x] Implement centralized error handling
- [x] Configure API response conventions
- [x] Configure OpenAPI documentation
- [x] Implement health endpoint
- [x] Write foundation tests

---

## Phase 2 — School Configuration (Day 6–10)

### Day 6 — Academic Session & Term Management

- [x] Implement academic session CRUD
- [x] Implement term CRUD
- [x] Implement active session selection
- [x] Implement active term selection
- [x] Add session/term validation
- [x] Create session/term API tests

### Day 7 — Classes & Class Arms

- [x] Implement class CRUD
- [x] Implement class-arm CRUD
- [x] Validate unique class-arm names
- [x] Implement class listing/filtering
- [ ] Implement class timetable endpoint
- [x] Write class module tests

### Day 8 — Teachers & Subjects

- [x] Implement teacher CRUD
- [x] Implement teacher availability fields
- [x] Implement teacher timetable endpoint
- [x] Implement subject CRUD
- [x] Configure subject scheduling requirements
- [x] Write teacher/subject tests

### Day 9 — Rooms & Periods

- [x] Implement room CRUD
- [x] Configure room properties
- [ ] Implement room timetable endpoint
- [x] Implement period CRUD
- [x] Configure period ordering
- [x] Configure working days
- [ ] Write room/period tests

### Day 10 — Configuration Frontend

- [x] Build application layout
- [x] Build session/term screens
- [x] Build classes screen
- [x] Build teachers screen
- [x] Build subjects screen
- [x] Build rooms screen
- [x] Build periods screen

---

## Phase 3 — Scheduling Core (Day 11–16)

### Day 11 — Teaching Assignments

- [x] Implement teaching-assignment CRUD
- [x] Assign teacher to subject/class arm
- [x] Configure periods required per week
- [x] Validate teacher assignments
- [x] View assignments by class
- [x] View assignments by teacher
- [x] Write assignment tests

### Day 12 — Timetable Versioning

- [x] Implement timetable creation
- [x] Implement timetable versions
- [x] Implement DRAFT status
- [x] Implement PUBLISHED status
- [x] Implement ARCHIVED status
- [x] Implement timetable duplication
- [x] Write versioning tests

### Day 13 — Timetable Entries

- [x] Implement timetable entry creation
- [x] Implement timetable entry update
- [x] Implement timetable entry deletion
- [x] Assign day and period
- [x] Assign room
- [x] Retrieve timetable grid
- [x] Retrieve class timetable
- [x] Retrieve teacher timetable
- [x] Retrieve room timetable

### Day 14 — Conflict Detection

- [ ] Implement class clash detection
- [ ] Implement teacher clash detection
- [ ] Implement room clash detection
- [ ] Implement conflict service
- [ ] Return structured conflict information
- [ ] Prevent invalid timetable writes
- [ ] Write conflict tests

### Day 15 — Timetable Validation

- [ ] Validate weekly lesson requirements
- [ ] Detect unscheduled assignments
- [ ] Detect scheduling conflicts
- [ ] Validate room assignments
- [ ] Validate teacher availability
- [ ] Generate validation summary
- [ ] Block publishing when validation fails

### Day 16 — Manual Timetable Editor

- [ ] Build weekly timetable grid
- [ ] Display timetable entries
- [ ] Add lesson from UI
- [ ] Edit lesson
- [ ] Delete lesson
- [ ] Display conflict feedback
- [ ] Add timetable validation action
- [ ] Add draft-save workflow

---

## Phase 4 — Timetable Generator (Day 17–21)

### Day 17 — Generator Design

- [x] Define generator input model
- [x] Define hard constraints
- [x] Define soft constraints
- [x] Define scheduling strategy
- [x] Define failure scenarios
- [x] Create generator test fixtures

Design document: [Generator Design](generator-design.md)

### Day 18 — Generator Core

- [ ] Build scheduling candidate model
- [ ] Implement available-slot calculation
- [ ] Implement constraint checking
- [ ] Implement lesson placement
- [ ] Implement backtracking/retry strategy
- [ ] Implement generation result model

### Day 19 — Generator Rules

- [ ] Implement teacher availability
- [ ] Implement room availability
- [ ] Implement class availability
- [ ] Implement periods-per-week requirements
- [ ] Implement teacher workload constraints
- [ ] Implement maximum lessons per day
- [ ] Implement consecutive-lesson rules

### Day 20 — Generator Integration

- [ ] Create generation endpoint
- [ ] Create generation request validation
- [ ] Generate timetable as draft
- [ ] Validate generated timetable
- [ ] Handle generation failure
- [ ] Add generation history/status

### Day 21 — Generator UI

- [ ] Build generation configuration screen
- [ ] Display scheduling requirements
- [ ] Start generation
- [ ] Display generation progress/state
- [ ] Display generation result
- [ ] Allow generated timetable editing

---

## Phase 5 — Frontend & Workflow (Day 22–25)

### Day 22 — Dashboard

- [ ] Build dashboard layout
- [ ] Display active timetable
- [ ] Display resource counts
- [ ] Display timetable status
- [ ] Display recent activity
- [ ] Add quick actions

### Day 23 — Timetable Management

- [ ] Build timetable list
- [ ] Filter by session/term/status
- [ ] Create timetable version
- [ ] Duplicate timetable
- [ ] Archive timetable
- [ ] View timetable details

### Day 24 — Publish Workflow

- [ ] Add pre-publish validation
- [ ] Display validation errors
- [ ] Implement publish action
- [ ] Prevent invalid publishing
- [ ] Handle active published timetable
- [ ] Implement archive-on-replacement workflow

### Day 25 — Views & Usability

- [ ] Build class timetable view
- [ ] Build teacher timetable view
- [ ] Build room timetable view
- [ ] Add timetable filtering
- [ ] Improve responsive layout
- [ ] Add loading/empty/error states

---

## Phase 6 — Export, Testing & Deployment (Day 26–28)

### Day 26 — Excel & PDF Export

- [ ] Implement Excel export
- [ ] Format Excel timetable
- [ ] Implement PDF generation
- [ ] Format PDF timetable
- [ ] Support class timetable export
- [ ] Support teacher timetable export

### Day 27 — Testing & Security

- [ ] Run backend unit tests
- [ ] Test timetable conflict scenarios
- [ ] Test generator scenarios
- [ ] Test invalid generator scenarios
- [ ] Test authentication/authorization
- [ ] Test timetable publishing
- [ ] Test frontend critical workflows
- [ ] Review API validation
- [ ] Review security configuration
- [ ] Fix critical bugs

### Day 28 — Production Deployment

- [ ] Configure production environment
- [ ] Configure production PostgreSQL
- [ ] Run production migrations
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Configure CORS/domain
- [ ] Configure production logging
- [ ] Run production smoke tests
- [ ] Create deployment documentation

---

## MVP Completion Criteria

ClassGrid is MVP-complete when an administrator can:

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

## Post-MVP — Future Enhancements

_These should not block the MVP._

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

## Development Principles

- [ ] Manual scheduler and conflict engine work before the generator is considered complete
- [ ] Generator reuses the same scheduling and validation rules (no separate business rules)
- [ ] Database remains the source of truth (Excel is import/export only)
- [ ] Generated timetables are always created as DRAFT
- [ ] Timetables must pass validation before becoming PUBLISHED