# KALIX - Plataforma Web de Gestión Integral de Comunidades Residenciales

**KALIX** es una plataforma web modular, segura y escalable diseñada para centralizar la administración de comunidades residenciales (fraccionamientos privados, condominios y comunidades habitacionales).

---

## 📁 Estructura del Monorepo

El proyecto está organizado en una arquitectura de **Monorepo** utilizando **Turborepo** y **NPM Workspaces**:

```text
Kalix/
├── apps/
│   ├── web/                  # 🎨 FRONTEND: Next.js 15 (React 19, Tailwind CSS, TanStack Query)
│   └── api/                  # ⚙️ BACKEND: NestJS (REST API, Swagger, JWT, RBAC)
├── packages/
│   ├── database/             # 🗄️ PERSISTENCIA: Prisma ORM, Esquema de BD, Seeds
│   ├── shared/               # 📦 COMPARTIDO: Enums maestros y Zod Schemas
│   └── config-typescript/    # 🔧 CONFIGURACIÓN: tsconfig base reutilizable
├── docker-compose.yml        # 🐳 PostgreSQL 16 local (Puerto 5433)
├── turbo.json                # 🚀 Orquestador de tareas Turborepo
└── package.json              # Configuración raíz de workspaces
```

---

## 📍 Ubicación del Frontend y Backend

### 1. 🎨 Frontend (`apps/web`)
* **Ruta**: [`apps/web`](file:///c:/Users/betto/Documents/Proyectos/Kalix/apps/web)
* **Tecnologías**: Next.js 15 (App Router), React 19, Tailwind CSS, TanStack Query, Zod, Lucide Icons.
* **Punto de Entrada**: [`apps/web/src/app/page.tsx`](file:///c:/Users/betto/Documents/Proyectos/Kalix/apps/web/src/app/page.tsx)
* **Puerto de Desarrollo**: `http://localhost:3000`

### 2. ⚙️ Backend (`apps/api`)
* **Ruta**: [`apps/api`](file:///c:/Users/betto/Documents/Proyectos/Kalix/apps/api)
* **Tecnologías**: NestJS, TypeScript, REST API, Swagger, Prisma ORM, Argon2, JWT.
* **Punto de Entrada**: [`apps/api/src/main.ts`](file:///c:/Users/betto/Documents/Proyectos/Kalix/apps/api/src/main.ts)
* **Puerto de Desarrollo**: `http://localhost:4000/api`
* **Documentación Swagger**: `http://localhost:4000/api/docs`

### 3. 🗄️ Base de Datos & ORM (`packages/database`)
* **Ruta**: [`packages/database`](file:///c:/Users/betto/Documents/Proyectos/Kalix/packages/database)
* **Esquema Prisma**: [`packages/database/prisma/schema.prisma`](file:///c:/Users/betto/Documents/Proyectos/Kalix/packages/database/prisma/schema.prisma)
* **Script de Seed**: [`packages/database/prisma/seed.ts`](file:///c:/Users/betto/Documents/Proyectos/Kalix/packages/database/prisma/seed.ts)

---

## 🚀 Guía de Inicialización y Ejecución

### Requisitos Previos
* **Node.js**: v18.0.0 o superior
* **Docker Desktop**: En ejecución para la base de datos PostgreSQL

### Pasos para Ejecutar el Proyecto

#### 1. Clonar e Instalar Dependencias
```bash
npm install
```

#### 2. Encender la Base de Datos PostgreSQL en Docker
```bash
npm run db:up
```

#### 3. Sincronizar Esquema y Ejecutar Seed en la Base de Datos
```bash
# Sincroniza las 25 tablas con PostgreSQL
npm run db:push --workspace=@kalix/database

# Poblar roles (ADMIN, RESIDENT, OWNER, SECURITY, MAINTENANCE) y permisos iniciales
npm run db:seed --workspace=@kalix/database
```

#### 4. Iniciar Frontend y Backend simultáneamente
```bash
npm run dev
```
Este comando levantará en paralelo:
- 🌐 **Frontend**: `http://localhost:3000`
- 🔌 **Backend API**: `http://localhost:4000/api`
- 📚 **Swagger Docs**: `http://localhost:4000/api/docs`

---

## 🛠️ Scripts Principales del Monorepo

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Ejecuta en modo desarrollo tanto `@kalix/web` como `@kalix/api` |
| `npm run build` | Compila todos los paquetes y aplicaciones con Turborepo |
| `npm run db:up` | Levanta la base de datos PostgreSQL en Docker |
| `npm run db:down` | Detiene el contenedor de PostgreSQL |
| `npm run db:generate` | Genera los tipos de Prisma Client |
| `npm run db:migrate` | Ejecuta migraciones de Prisma |
