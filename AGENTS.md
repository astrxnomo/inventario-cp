# Agentes de IA - Inventario Inteligente

Este archivo contiene instrucciones y convenciones para los agentes de IA que trabajan en este repositorio.

_Este archivo fue recreado por el equipo._

## Reglas Generales

1. **Stack Tecnológico**:
   - Next.js 15+ (App Router)
   - TypeScript
   - Tailwind CSS v4
   - Supabase (Auth & Database)
   - Shadcn UI (Componentes base)

2. **Seguridad**:
   - Nunca commitear secretos (.env).
   - Validar inputs con Zod.
   - Usar RLS en Supabase.

3. **Convenciones de Código**:
   - Usar Server Components por defecto.
   - Usar `use client` solo cuando sea necesario (interactividad).
   - Mantener componentes pequeños y reutilizables.
   - Usar `lucide-react` para iconos.

4. **Commits**:
   - Usar Conventional Commits (feat, fix, docs, style, refactor, test, chore).
   - Verificar cambios con `tsc` y linter antes de confirmar.

## Estructura de Directorios

- `app/`: Rutas y páginas (Next.js App Router).
- `components/`: Componentes de UI y features.
  - `ui/`: Componentes base (shadcn).
- `lib/`: Utilidades, hooks, acciones de servidor, cliente Supabase.
- `public/`: Archivos estáticos.
