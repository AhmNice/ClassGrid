# ClassGrid Web

ClassGrid Web is the responsive React frontend for ClassGrid, a school timetable management platform. It provides an interface for managing academic data, configuring teaching assignments, generating and editing timetables, reviewing scheduling conflicts, and publishing timetable versions.

## Overview

ClassGrid Web is built with React 19, TypeScript, and Vite. It communicates with the ClassGrid API to manage school academic data and timetable operations.

## Core Features

- **Authentication and Access Control** — School-scoped authentication and role-based access.
- **Academic Management** — Configure academic sessions, terms, class levels, and class arms.
- **Resource Management** — Manage teachers, subjects, rooms, and periods.
- **Teaching Assignments** — Assign subjects to class arms and teachers to class-arm–subject combinations.
- **Timetable Management** — Create, edit, and review timetable arrangements.
- **Timetable Views** — View schedules by class arm and across the school using the master timetable grid.
- **Scheduling Validation** — Review scheduling conflicts and validation results.
- **Timetable Publishing** — Manage timetable versions and their publication status.
- **Responsive Interface** — Layouts and theme support for different screen sizes.

## Technology Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS 4

## Project Structure

```text
apps/web/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── routes/
│   ├── stores/
│   ├── types/
│   └── ...
├── index.html
├── package.json
└── vite.config.ts
```

The frontend is maintained as an independent workspace within the ClassGrid npm monorepo.

## Development

Run the following commands from the repository root.

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm run dev:web
```

### Start both frontend and backend

```bash
npm run dev
```

### Build the frontend

```bash
npm run build:web
```

### Run backend tests

```bash
npm test
```

## Backend

ClassGrid Web requires the ClassGrid API for authentication, academic data management, timetable operations, and other server-side functionality.

The API is maintained separately under `apps/api` and can be developed and deployed independently.

