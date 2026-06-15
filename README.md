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
- `backend`: contenedor Node para NestJS en modo desarrollo sobre Yarn Workspaces.
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
- Mientras `apps/backend/package.json` o `apps/web/package.json` no existan, sus contenedores quedaran en espera con un mensaje indicando el comando esperado.

### Variables y puertos base

- DB: `postgres://postgres:postgres@localhost:5432/abasto_paceno`
- Backend: `http://localhost:3000`
- Web: `http://localhost:5173`
- Web hacia backend: `VITE_API_URL=http://localhost:3000`

### Mobile y acceso al backend local

- Android emulator: usar `http://10.0.2.2:3000`
- Celular fisico: usar `http://IP_DE_LA_PC:3000`

## Pendiente para siguientes prompts

- Crear `apps/backend/package.json` y el scaffold real de NestJS para que `yarn workspace backend start:dev` arranque la API.
- Crear `apps/web/package.json` y el scaffold real de React + Vite para que `yarn workspace web dev --host 0.0.0.0` arranque la web.
- Ajustar instalacion de dependencias si el monorepo adopta Yarn Berry, pnpm o una estrategia distinta de workspaces.
