# Memoria del Proyecto - Saas-turnero

Este documento sirve para contextualizar rápidamente a la IA sobre el estado del proyecto.

## Estado Actual
- **Épica 7 (Arquitectura B2B y Panel Superadmin)**: Completada y mergeada a develop. Se implementaron los endpoints protegidos para el superadmin y un DataGrid en el frontend para gestionar los planes de los negocios (BASIC, PRO, PREMIUM).
- **Siguientes pasos**: Épica 8 (Landing Page), Épica 9 (Marketplace B2C), Épica 10 (Upselling y Bloqueos), y Épica 11 (Mocks y Simulador).

## Base de Datos y Backend (NestJS + Prisma)
- Modelos principales: User, Business, Employee, Schedule, Service, Shift, Product, Appointment, Review, LegalNotice.
- El esquema cuenta con el enum SubscriptionPlan.

## Frontend (Next.js App Router)
- Frontend con componentes UI modernos (inspirados en shadcn/ui y skill impecable).
- Comunicación con API mediante funciones fetch.
