# ClassGrid

ClassGrid is a school timetable management platform that helps schools configure academic structures, manage teaching assignments, generate and edit timetables, validate scheduling constraints, detect conflicts, and publish timetable versions.

## Overview

ClassGrid streamlines the process of organizing school timetables by bringing academic configuration, teaching resource allocation, and timetable planning into one platform.

It supports the management of:

- Academic sessions and terms
- Class levels and class arms
- Subjects and classrooms
- Teachers and teacher availability
- Teacher-subject and teaching assignments
- Periods and period schedules, including different daily schedules
- Timetable generation and manual editing
- Scheduling validation and conflict detection
- Draft, published, and archived timetable versions

ClassGrid is designed for independent school deployments, with each school having its own application environment and data.

## Project Structure

```text
ClassGrid/
├── apps/
│   ├── api/                     # Express + TypeScript backend
│   │   ├── prisma/              # Prisma schema and migrations
│   │   ├── src/                 # API application source
│   │   └── package.json
│   │
│   └── web/                     # React + Vite frontend
│       ├── src/                 # Pages, components, hooks, stores
│       ├── public/              # Static assets
│       ├── README.md
│       └── package.json
│
├── packages/                    # Shared workspace packages
├── package.json                 # Root workspace configuration
├── package-lock.json
├── .gitignore
├── .husky/
└── README.md
```

Each application maintains its own dependencies and configuration while sharing the root npm workspace.

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Zustand
- Axios

### Backend
- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- OpenAPI / Swagger

### Development Tooling
- npm workspaces
- concurrently
- Jest
- ESLint
- Prettier
- Husky

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- PostgreSQL

### 1. Clone the repository

```bash
git clone <repository-url>
cd ClassGrid
```

### 2. Install dependencies

Install all workspace dependencies from the repository root:

```bash
npm install
```

### 3. Configure environment variables

Create the required environment files using the examples or configuration requirements provided by each application.

```text
apps/
├── api/
│   └── .env
└── web/
    └── .env
```

The API requires database connection details, authentication secrets, and other server configuration.

The frontend requires the API base URL and any other client-side configuration.

Never commit secrets or sensitive environment variables.

### 4. Generate the Prisma Client

From the repository root:

```bash
npm --workspace @classgrid/api run prisma:generate
```

Run database migrations using the appropriate migration script defined in the API workspace.

### 5. Start the applications

Start both applications concurrently:

```bash
npm run dev
```

Or start them independently:

```bash
npm run dev:web
npm run dev:api
```

## Available Scripts

Run these commands from the repository root.

| Command | Description |
|---|---|
| `npm run dev` | Start frontend and backend |
| `npm run dev:web` | Start frontend only |
| `npm run dev:api` | Start backend only |
| `npm run test` | Run backend tests |
| `npm run build:web` | Build frontend |
| `npm run build:api` | Build backend |
| `npm run build:all` | Build both applications |

Additional database, migration, seeding, and Prisma Studio commands are available in `apps/api/package.json`.

## Core Features

### 1. Academic Configuration

- Configure academic sessions and terms.
- Manage class levels and class arms.
- Manage subjects and classrooms.
- Configure working days and period schedules.
- Support different daily schedules, including Friday schedules.

### 2. Teaching Resource Management

- Manage teacher information and availability.
- Assign subjects to class arms.
- Assign teachers to class-arm–subject combinations.
- Configure teaching requirements and scheduling constraints.

### 3. Timetable Management

- Generate timetables using constraint-based scheduling.
- Create and edit timetable entries.
- View timetables by class arm.
- View the master timetable across the school.
- Validate timetable arrangements.
- Detect teacher, class, and other scheduling conflicts.

### 4. Timetable Versioning and Publishing

- Manage timetable drafts.
- Review and validate timetable arrangements before publication.
- Publish approved timetable versions.
- Maintain timetable version history.

## Deployment

The frontend and backend are independently deployable applications.

A typical deployment setup uses:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** PostgreSQL hosting provider

Both applications can be deployed from the same Git repository while maintaining separate build and deployment configurations.

## Project Documentation

- [Frontend Documentation](apps/web/README.md)
- [Backend Documentation](apps/api/README.md)

## License

This project is currently unlicensed. All rights are reserved unless otherwise stated.