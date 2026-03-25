# Inventario Inteligente

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=flat-square)](https://ui.shadcn.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

A modern, intelligent inventory management system for prototyping centers with real-time cabinet access tracking, stock management, and reservation system.

</div>

---

## Overview

**Inventario Inteligente** is a full-stack web application designed to manage access to storage cabinets and track item traceability in prototyping centers. The system maintains detailed records of who accesses materials, when they access them, and for how long.

The application features a comprehensive admin panel for inventory oversight, user management, and reservation tracking. Future versions will integrate with Raspberry Pi and ESP32 hardware for physical cabinet control; currently, cabinet access actions update the database state.

---

## Features

### Core Functionality

- **User Management** — Authentication, profiles, and role-based access control
- **Cabinet Management** — Digital cabinet organization and access control
- **Inventory Tracking** — Stock level monitoring and material management
- **Reservation System** — Request and manage material reservations
- **Access History** — Complete audit trail of cabinet access and material usage
- **Admin Dashboard** — Comprehensive analytics and system oversight
- **Real-time Updates** — Live data synchronization across the application using Supabase Realtime

### Future Enhancements

- Hardware integration (Raspberry Pi / ESP32) for physical cabinet locking mechanisms
- Automated cabinet opening via IoT integration
- Advanced analytics and reporting

---

## Tech Stack

### Frontend

- **Next.js 16.1.6** — React framework with App Router for server-side rendering and API routes
- **React 19.2.4** — Modern UI library with concurrent rendering
- **TypeScript 5.9.3** — Static typing for maintainability and safety
- **Tailwind CSS 4.1.18** — Utility-first CSS framework
- **Shadcn/ui** — High-quality, customizable React components
- **Lucide React 0.577.0** — Icon library

### Backend & Data

- **Supabase** — Open-source Firebase alternative
  - PostgreSQL database for data persistence
  - Authentication (Session-based & SSR support)
  - Realtime subscriptions for live updates
  - Row Level Security (RLS) policies
- **@supabase/ssr** — Server-side rendering authentication support

### Development Tools

- **ESLint** — Code quality and linting
- **Prettier** — Code formatting
- **Zod 4.3.6** — Runtime schema validation
- **React Table (TanStack)** — Advanced table component
- **date-fns 4.1.0** — Date manipulation and formatting
- **Recharts 2.15.4** — Data visualization library

---

## Project Structure

```
inventario-inteligente-app/
├── app/                          # Next.js App Router pages and layouts
│   ├── (admin)/                  # Admin dashboard routes (group)
│   │   └── ...                   # Admin-specific pages
│   ├── (auth)/                   # Authentication routes (group)
│   │   └── ...                   # Login, signup, reset password
│   ├── profile/                  # User profile page
│   ├── history/                  # Access history and logs
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # Reusable React components
│   ├── ui/                       # Shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── auth/                     # Authentication components
│   ├── cabinet/                  # Cabinet management components
│   ├── inventory/                # Inventory display components
│   ├── reservations/             # Reservation management components
│   └── ...                       # Other domain-specific components
│
├── lib/                          # Shared utilities and configurations
│   ├── actions/                  # Server Actions for backend operations
│   │   ├── auth.ts               # Authentication logic
│   │   ├── cabinets.ts           # Cabinet management
│   │   ├── inventory.ts          # Stock management
│   │   ├── reservations.ts       # Reservation operations
│   │   └── ...
│   ├── data/                     # Data fetching utilities
│   │   └── queries.ts            # Reusable data fetch functions
│   ├── supabase/                 # Supabase client initialization
│   │   ├── client.ts             # Browser client (client-side)
│   │   └── server.ts             # Server client (server-side)
│   ├── types/                    # TypeScript type definitions
│   │   └── database.ts           # Database schema types
│   ├── schemas/                  # Zod validation schemas
│   │   └── forms.ts              # Form validation schemas
│   ├── realtime/                 # Realtime subscription handlers
│   │   └── subscriptions.ts      # Supabase Realtime setup
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Classname utility
│   │   └── helpers.ts            # General helpers
│   └── utils.ts                  # Export barrel file
│
├── public/                       # Static assets
│   ├── favicon.ico
│   └── ...
│
├── .env.local                    # Environment variables (not tracked in git)
├── .gitignore                    # Git ignore rules
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── components.json               # Shadcn/ui configuration
├── README.md                     # This file
└── ...
```

### Key Directories Explained

- **`app/`** — Contains all routes using Next.js App Router. Components here are Server Components by default for optimal performance.
- **`components/`** — Reusable UI components including Shadcn/ui library components and custom domain-specific components.
- **`lib/actions/`** — Server Actions for backend operations. These are secured functions that handle authentication, data mutations, and business logic.
- **`lib/supabase/`** — Contains Supabase client initialization for both browser (`client.ts`) and server (`server.ts`) environments.
- **`lib/types/`** — TypeScript type definitions, including auto-generated database schema types from Supabase.
- **`lib/schemas/`** — Zod schemas for runtime validation of forms and API requests.

---

## Development Conventions

### Project Stack & Standards

This project follows these conventions:

- **Server Components by default** — App Router components are Server Components unless marked with `"use client"`
- **Server Actions** — Mutations and side effects use Server Actions in `/lib/actions/`
- **Type Safety** — All code is written in TypeScript with strict mode enabled
- **Component Organization** — Components are organized by domain (auth, inventory, reservations, etc.)
- **Validation** — All user inputs are validated using Zod schemas
- **Styling** — Tailwind CSS with Shadcn/ui component library

### Code Quality

```bash
# Run all quality checks
npm run lint:fix && npm run format && npm run typecheck
```

---

## Current Project Status

| Component                                 | Status            |
| ----------------------------------------- | ----------------- |
| Web Application                           | ✅ In Development |
| Authentication                            | ✅ Implemented    |
| Cabinet Management                        | ✅ Implemented    |
| Inventory System                          | ✅ Implemented    |
| Reservation System                        | ✅ Implemented    |
| Admin Dashboard                           | ✅ Implemented    |
| Access History                            | ✅ Implemented    |
| Hardware Integration (Raspberry Pi/ESP32) | ⏳ Planned        |
| Automated Tests                           | ⏳ Planned        |
| CI/CD Pipeline                            | ⏳ Planned        |

---

## License

This project is private and maintained by the prototyping center team.

---
