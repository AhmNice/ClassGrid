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

- [ ] Initialize Express + TypeScript backend
- [ ] Initialize React + TypeScript frontend
- [ ] Configure ESLint, Prettier & Husky
- [ ] Configure environment validation with Zod
- [ ] Configure PostgreSQL & Prisma
- [ ] Configure project folder structure
- [ ] Configure Git repository
- [ ] Configure application logging

### Day 2 — Database Schema

- [ ] Finalize Prisma schema
- [ ] Define enums
- [ ] Define school/session/term relationships
- [ ] Define class and class-arm relationships
- [ ] Define teacher, subject and room models
- [ ] Define period model
- [ ] Define teaching assignments
- [ ] Define timetable and timetable-entry models
- [ ] Add indexes and database constraints
- [ ] Create initial migration

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

- [ ] Implement user registration/setup
- [ ] Implement password hashing
- [ ] Implement login
- [ ] Implement logout
- [ ] Implement authentication middleware
- [ ] Implement authorization
- [ ] Implement current-user endpoint

### Day 5 — API Foundation

- [ ] Establish controller/service/repository structure
- [ ] Configure request validation with Zod
- [ ] Implement centralized error handling
- [ ] Configure API response conventions
- [ ] Configure OpenAPI documentation
- [ ] Implement health endpoint
- [ ] Write foundation tests

---

## Phase 2 — School Configuration (Day 6–10)

### Day 6 — Academic Session & Term Management

- [ ] Implement academic session CRUD
- [ ] Implement term CRUD
- [ ] Implement active session selection
- [ ] Implement active term selection
- [ ] Add session/term validation
- [ ] Create session/term API tests

### Day 7 — Classes & Class Arms

- [ ] Implement class CRUD
- [ ] Implement class-arm CRUD
- [ ] Validate unique class-arm names
- [ ] Implement class listing/filtering
- [ ] Implement class timetable endpoint
- [ ] Write class module tests

### Day 8 — Teachers & Subjects

- [ ] Implement teacher CRUD
- [ ] Implement teacher availability fields
- [ ] Implement teacher timetable endpoint
- [ ] Implement subject CRUD
- [ ] Configure subject scheduling requirements
- [ ] Write teacher/subject tests

### Day 9 — Rooms & Periods

- [ ] Implement room CRUD
- [ ] Configure room properties
- [ ] Implement room timetable endpoint
- [ ] Implement period CRUD
- [ ] Configure period ordering
- [ ] Configure working days
- [ ] Write room/period tests

### Day 10 — Configuration Frontend

- [ ] Build application layout
- [ ] Build session/term screens
- [ ] Build classes screen
- [ ] Build teachers screen
- [ ] Build subjects screen
- [ ] Build rooms screen
- [ ] Build periods screen

---

## Phase 3 — Scheduling Core (Day 11–16)

### Day 11 — Teaching Assignments

- [ ] Implement teaching-assignment CRUD
- [ ] Assign teacher to subject/class arm
- [ ] Configure periods required per week
- [ ] Validate teacher assignments
- [ ] View assignments by class
- [ ] View assignments by teacher
- [ ] Write assignment tests

### Day 12 — Timetable Versioning

- [ ] Implement timetable creation
- [ ] Implement timetable versions
- [ ] Implement DRAFT status
- [ ] Implement PUBLISHED status
- [ ] Implement ARCHIVED status
- [ ] Implement timetable duplication
- [ ] Write versioning tests

### Day 13 — Timetable Entries

- [ ] Implement timetable entry creation
- [ ] Implement timetable entry update
- [ ] Implement timetable entry deletion
- [ ] Assign day and period
- [ ] Assign room
- [ ] Retrieve timetable grid
- [ ] Retrieve class timetable
- [ ] Retrieve teacher timetable
- [ ] Retrieve room timetable

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

- [ ] Define generator input model
- [ ] Define hard constraints
- [ ] Define soft constraints
- [ ] Define scheduling strategy
- [ ] Define failure scenarios
- [ ] Create generator test fixtures

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