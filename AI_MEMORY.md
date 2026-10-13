# Memoria del Proyecto - Saas-turnero

Este documento sirve para contextualizar rápidamente a la IA sobre el estado del proyecto.

## Estado Actual

- **Sprint 6 (Estabilidad Operativa, Persistencia Real y Landing Lovable)**: 21 tickets en progreso en Plane (`TURN-97` al `TURN-117`), divididos en Épicas 18 a 24.
- **Política de Git para Épicas y Tickets**:
  1. Por cada épica, crear rama desde `develop` (`feature/epica-XX-...`).
  2. Commitear tras completar cada ticket individual (`feat(TURN-XX): ...`).
  3. Al completar todos los tickets de la épica, mergear la rama a `develop`.
  4. Al concluir todas las épicas del sprint, realizar `git push origin develop`.
- **Enrutamiento del Orquestador (Gemini 3.8 Exclusivo)**:
  - Dificultad 0: Usuario (Decisión de negocio / Credenciales).
  - Dificultad 1 a 3: Gemini 3.8 (Low Effort).
  - Dificultad 4 a 7: Gemini 3.8 (Medium Effort).
  - Dificultad 8 a 10: Gemini 3.8 (High Effort / Thinking Extendido).

## Decisiones de Arquitectura Recientes

- **Persistencia 100% en DB**: Supresión total de `localStorage` para ventas de mostrador (`ProductSale`), disponibilidad/ausencias (`EmployeeBlock`) y reseñas mutuas de empleados.
- **Agenda del Empleado**: Canvas temporal nativo con Tailwind CSS v4 (`TurnoTimelineGrid`) en lugar de librerías externas pesadas, con modal rápido para walk-ins y sincronización con Inicio.
- **Landing Page**: Migración 1:1 de los componentes de Lovable (`automa-turnos-pro`) a Next.js App Router conservando 100% de la estética, tipografía y tokens, conectando copies y tarifas al CMS de Superadmin y midiendo eventos con PostHog.
- **Landing Pública (/local/[id])**: Consulta resiliente por ID o slug real contra PostgreSQL sin fallbacks mockeados en producción.
- **Autenticación y Paywall**: Inclusión del plan en el JWT payload y bypass automático para `superadmin`. Impresión de finanzas con aislamiento `@media print / print:hidden`.
