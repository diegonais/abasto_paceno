# Abasto Paceno

Abasto Paceno es una plataforma web y movil geolocalizada para informar puntos de venta de productos esenciales en La Paz, Bolivia. La aplicacion muestra productos disponibles en un mapa mediante pines y maneja stock aproximado reportado por el vendedor.

## Stack general

- Monorepo con Yarn Workspaces
- Backend con NestJS y TypeScript
- Base de datos PostgreSQL con PostGIS
- Web con React, Vite y TypeScript
- Mobile con React Native CLI y TypeScript
- Mapas con Leaflet + OpenStreetMap en web y react-native-maps en mobile
- Autenticacion con email, password y JWT
- Swagger para documentacion de API

## Estructura del monorepo

```text
abasto-paceno/
|-- apps/
|   |-- backend/
|   |-- mobile/
|   `-- web/
|-- docs/
|-- packages/
|   `-- shared/
|-- docker-compose.yml
|-- AGENTS.md
|-- package.json
|-- README.md
`-- yarn.lock
```

## Docker para desarrollo

`docker-compose.yml` deja preparados estos servicios:

- `db`: PostgreSQL + PostGIS con volumen persistente y healthcheck.
- `backend`: contenedor Node para NestJS en modo desarrollo sobre Yarn Workspaces y conectado a `db`.
- `web`: contenedor Node para Vite en modo desarrollo sobre Yarn Workspaces.

La app mobile no se dockeriza en el MVP. `apps/mobile` corre localmente con React Native CLI.

### Levantar servicios

```bash
docker compose up db
docker compose up backend
docker compose up web
docker compose up
```

Notas:

- `docker compose up backend` levantara tambien `db` por la dependencia declarada.
- `docker compose up web` levantara `backend` y `db`.
- La extension `postgis` se habilita desde el backend al iniciar con `CREATE EXTENSION IF NOT EXISTS postgis;`.
- Copia `apps/backend/.env.example` a `apps/backend/.env` para ejecutar el backend fuera de Docker.

### Variables y puertos base

- DB: `postgres://postgres:postgres@localhost:5432/abasto_paceno`
- Backend: `http://localhost:3000`
- Web: `http://localhost:5173`
- Web hacia backend: `VITE_API_URL=http://localhost:3000`

### Mobile y acceso al backend local

- Android emulator: usar `http://10.0.2.2:3000`
- Celular fisico: usar `http://IP_DE_LA_PC:3000`

## Backend y base de datos

El backend usa `@nestjs/config` y `@nestjs/typeorm` con configuracion centralizada.

- En Docker, usa `DATABASE_HOST=db`.
- Fuera de Docker, usa `DATABASE_HOST=localhost`.
- `synchronize` esta en `false` para evitar cambios peligrosos sobre la BD.
- Aun no se definieron entidades de negocio ni autenticacion.

### Levantar la base de datos

```bash
docker compose up db
```

Esto deja PostgreSQL + PostGIS disponible en `localhost:5432`.

### Levantar el backend conectado a la BD

```bash
docker compose up backend
```

El backend quedara disponible en `http://localhost:3000` y expondra:

- Health: `GET http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api/docs`

### Ejecutar backend fuera de Docker

```bash
copy apps\\backend\\.env.example apps\\backend\\.env
yarn workspace backend start:dev
```

Para este flujo, deja `DATABASE_HOST=localhost` en `apps/backend/.env`.
