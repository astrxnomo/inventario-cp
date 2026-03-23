# Inventario Inteligente

Aplicación web para gestionar el acceso a gabinetes y la trazabilidad de objetos en un centro de prototipado. Permite llevar registro de quién toma materiales, cuándo y por cuánto tiempo. En etapas futuras la app se integrará con la capa física (Raspberry Pi controlando ESP32) para ejecutar aperturas físicas de gabinetes; actualmente la integración hardware NO está implementada y las acciones de apertura solo actualizan el estado en la base de datos.

## Estado actual

- Desarrollo de la aplicación web (dashboard, autenticación, gestión de gabinetes, inventario y reservas).
- Integración hardware (Raspberry Pi / ESP32): PENDIENTE (no implementada).
- Tests automatizados: NO implementados.
- CI/CD: NO configurado.

## Stack tecnológico

- Next.js v16.1.6 (App Router)
- React v19.2.4
- TypeScript v5.9.3
- Tailwind CSS v4.1.18
- Supabase: `supabase-js` v2.99.0 y `@supabase/ssr` v0.9.0 (Auth, Database, Realtime)
- UI: Shadcn UI, `lucide-react` v0.577.0
- Gráficos: `recharts` v2.15.4
- Validación: `zod` v4.3.6
- Fechas: `date-fns` v4.1.0


## Requisitos previos

- Node.js 18+ (recomendado)
- npm 8+/pnpm (según tu preferencia)

## Estructura principal del proyecto

- `app/` — Rutas del App Router (Server Components por defecto)
- `components/` — Componentes UI reutilizables (incluye `components/ui/` de Shadcn)
- `lib/supabase/` — Inicialización de clientes Supabase (client.ts / server.ts)
- `lib/actions/` — Server Actions y lógica de dominio (auth, cabinets, inventory, reservations)


## Contacto

Para dudas y coordinación, abre un Issue en este repositorio o contacta al equipo del centro de prototipado responsable.

---
