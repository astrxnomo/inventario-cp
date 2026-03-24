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

## Getting Started

### Prerequisites

- **Node.js 18+** (recommended 20 LTS or newer)
- **npm 8+** or **pnpm** (package manager of your choice)
- **Git** for version control
- **Supabase account** (free tier available at [supabase.com](https://supabase.com))

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/inventario-inteligente-app.git
cd inventario-inteligente-app
```

#### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

#### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration (get these from your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Optional: Additional environment variables for production
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_for_admin_operations
```

**Getting your Supabase credentials:**
1. Create a new project at [Supabase Dashboard](https://app.supabase.com)
2. Go to **Settings → API** to find your project URL and Publishable Key
3. Copy these values to `.env.local`

#### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
npm run format:write

# Type check with TypeScript
npm run typecheck
```

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

## Environment Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public API key for client-side Supabase | `eyJhbGc...` |

### Optional Environment Variables

| Variable | Description | Usage |
|----------|-------------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Server-side only, do not expose to client |
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |

### Setting Up Supabase

1. **Create a Supabase Project:**
   - Visit [supabase.com](https://supabase.com)
   - Click "New Project" and follow the setup wizard
   - Create a PostgreSQL database

2. **Get Your Credentials:**
   - Navigate to **Settings → API**
   - Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **Publishable Key** (anon key) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

3. **Configure Authentication:**
   - Go to **Authentication → Providers**
   - Enable desired auth methods (Email/Password, OAuth providers, etc.)

4. **Set Up Database Tables:**
   - Use the SQL editor to create necessary tables or restore from backups
   - Ensure Row Level Security (RLS) policies are configured appropriately

---

## Deployment

### Deploy to Vercel

Vercel is the recommended platform for deploying Next.js applications. The setup is straightforward:

#### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"** and import your GitHub repository
3. Select the repository and click **"Import"**
4. **Configure Environment Variables:**
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Optionally add `SUPABASE_SERVICE_ROLE_KEY` for server-side operations
5. Click **"Deploy"**

Your app will be live within minutes!

#### 3. Link Your Custom Domain (Optional)

- In Vercel dashboard, go to **Settings → Domains**
- Add your custom domain and configure DNS records

### Environment Variables on Vercel

1. Go to **Project Settings → Environment Variables**
2. Add your Supabase credentials for the production environment
3. Redeploy or create a new deployment for changes to take effect

### Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Database Row Level Security (RLS) policies enabled
- [ ] Supabase backups configured
- [ ] CORS settings configured properly in Supabase
- [ ] Error logging and monitoring set up
- [ ] Performance optimization completed

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

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the Repository** — Create your own copy
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes** — Follow the project conventions
4. **Test Your Changes** — Verify functionality locally
5. **Commit with Clear Messages:**
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push to Your Fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** — Describe your changes clearly

### Before Submitting a PR

- Run `npm run lint:fix` to fix linting issues
- Run `npm run format` to format code
- Run `npm run typecheck` to verify TypeScript types
- Test in multiple browsers if UI changes were made

---

## Roadmap

### Current Phase
- Web application development (dashboard, authentication, cabinet management, inventory, reservations)
- Supabase integration with PostgreSQL database
- Admin panel for system management

### Upcoming Features
- Hardware integration (Raspberry Pi + ESP32) for physical cabinet control
- Automated cabinet access via IoT devices
- Advanced analytics and reporting dashboard
- Mobile app support
- Automated testing suite (unit & integration tests)
- CI/CD pipeline configuration

### Not Yet Implemented
- Automated tests
- CI/CD configuration
- Hardware layer integration

---

## Troubleshooting

### Common Issues

**Issue: `NEXT_PUBLIC_SUPABASE_URL is not set`**
- Solution: Ensure `.env.local` file exists in the project root with the correct Supabase URL

**Issue: Authentication not working**
- Check Supabase Authentication settings are properly configured
- Verify environment variables are correct
- Clear browser cookies and try again

**Issue: Realtime updates not working**
- Check Supabase Realtime is enabled for your project
- Verify database subscriptions are properly configured

---

## Documentation & Resources

- **[Next.js Documentation](https://nextjs.org/docs)** — Official Next.js docs with App Router guide
- **[Supabase Documentation](https://supabase.com/docs)** — Database, Auth, and Realtime guides
- **[Shadcn/ui Documentation](https://ui.shadcn.com/docs)** — Component library reference
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** — TypeScript language reference
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** — Utility-first CSS framework

---

## Current Project Status

| Component | Status |
|-----------|--------|
| Web Application | ✅ In Development |
| Authentication | ✅ Implemented |
| Cabinet Management | ✅ Implemented |
| Inventory System | ✅ Implemented |
| Reservation System | ✅ Implemented |
| Admin Dashboard | ✅ Implemented |
| Access History | ✅ Implemented |
| Hardware Integration (Raspberry Pi/ESP32) | ⏳ Planned |
| Automated Tests | ⏳ Planned |
| CI/CD Pipeline | ⏳ Planned |

---

## Contact & Support

For questions, bug reports, or feature requests:

- **Open an Issue** — Create a GitHub issue with detailed information
- **Discussions** — Use GitHub Discussions for general questions
- **Team Contact** — Reach out to the prototyping center team for coordination

---

## License

This project is private and maintained by the prototyping center team.

---

<div align="center">

**Built with ❤️ using Next.js, Supabase, and Shadcn/ui**

</div>
