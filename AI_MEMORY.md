# Memoria del Proyecto - Saas-turnero

Este documento sirve para contextualizar rápidamente a la IA sobre el estado del proyecto.

## Estado Actual
- **Épica 7 (Arquitectura B2B y Panel Superadmin)**: Completada y mergeada a develop. Se implementaron los endpoints protegidos para el superadmin y un DataGrid en el frontend para gestionar los planes de los negocios (BASIC, PRO, PREMIUM).
- **Planificación de Refactor (15 Sep 2026)**: 
  - Se definieron 10 tickets granulares en Plane para refactorizar la arquitectura y funcionalidades base.
  - El orquestador se encargará de delegar la ejecución de estos tickets en base a sus relaciones de bloqueo (`blocked_by`).

## Decisiones de Arquitectura Recientes
- **Autenticación B2B y B2C**: Se eliminó el mock de roles (Devtool / Role Switcher) y el uso de localStorage para el dev env. A partir de ahora, todo funciona contra la base de datos (JWT) sin Firebase en entorno de desarrollo. Se añade `password` a los usuarios.
- **Autorización y Rutas Protegidas**: El acceso al dashboard (`/dashboard`) implementa verificación real por rol (Dueño vs Empleado) renderizando vistas distintas.
- **Imágenes (Pexels)**: Se descarta el diseño genérico azul de `/explorar`. En su lugar, el modelo `Business` tiene `imageUrls` que serán sembrados estáticamente usando imágenes de Pexels.
- **Flujo de Reserva (Booking)**: El usuario explora locales, selecciona un servicio -> selecciona un empleado -> elige fecha y hora -> se le pide inicio de sesión (si es anónimo) guardando el estado -> confirma la cita en BD.

## Base de Datos y Backend (NestJS + Prisma)
- Modelos principales: User, Business, Employee, Schedule, Service, Shift, Product, Appointment, Review, LegalNotice.
- El esquema cuenta con el enum SubscriptionPlan.

## Frontend (Next.js App Router)
- Frontend con componentes UI modernos (inspirados en shadcn/ui y skill impecable).
- Comunicación con API mediante funciones fetch.
