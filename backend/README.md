# Backend Abasto Paceno

API REST de Abasto Paceno construida con NestJS, TypeScript, TypeORM y PostgreSQL.

El backend expone la informacion que consumen el frontend web y el prototipo movil: usuarios, autenticacion, productos, categorias, perfiles de comerciantes y ofertas geolocalizadas.

## Stack

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- JWT con Passport
- Swagger/OpenAPI
- class-validator y class-transformer

## Estructura relevante

```text
backend/
|-- src/
|   |-- modules/
|   |   |-- auth/
|   |   |-- categories/
|   |   |-- merchant-profiles/
|   |   |-- offers/
|   |   |-- products/
|   |   `-- users/
|   |-- scripts/
|   `-- main.ts
|-- docker-compose.yml
|-- .env.example
`-- package.json
```

## Variables de entorno

Copia el ejemplo:

```powershell
cd backend
copy .env.example .env
```

Variables disponibles:

```text
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=abasto_paceno
JWT_SECRET=super_secret_change_me
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

`CORS_ORIGIN` acepta una lista separada por comas si necesitas permitir mas de un origen, por ejemplo el frontend web y una URL adicional de pruebas.

## Base de datos

Levantar PostgreSQL local:

```powershell
cd backend
docker compose up -d
```

Apagar PostgreSQL:

```powershell
docker compose down
```

Si cambias el puerto publicado en Docker, actualiza tambien `DATABASE_PORT`.

## Instalacion

```powershell
cd backend
yarn install
```

## Ejecucion

Desarrollo con recarga:

```powershell
yarn start:dev
```

Produccion local:

```powershell
yarn build
yarn start:prod
```

La API queda disponible por defecto en:

```text
http://localhost:3000/api
```

Swagger queda disponible en:

```text
http://localhost:3000/docs
```

## Seed de datos

Para cargar datos iniciales:

```powershell
yarn seed
```

Ejecuta este comando con PostgreSQL levantado y las variables de entorno configuradas.

## Endpoints principales

La API usa prefijo global `/api`.

Autenticacion:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Ofertas:

- `GET /api/offers`
- `GET /api/offers/map`
- `GET /api/offers/my-offers`
- `GET /api/offers/:id`
- `POST /api/offers`
- `PATCH /api/offers/:id`
- `PATCH /api/offers/:id/disable`

Productos:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `PATCH /api/products/:id/disable`

Categorias:

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `PATCH /api/categories/:id/disable`

Perfiles de comerciante:

- `GET /api/merchant-profiles`
- `GET /api/merchant-profiles/me`
- `GET /api/merchant-profiles/:id`
- `POST /api/merchant-profiles`
- `PATCH /api/merchant-profiles/me`
- `PATCH /api/merchant-profiles/:id`
- `PATCH /api/merchant-profiles/:id/disable`

Usuarios:

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/me`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/disable`

El endpoint usado por el prototipo movil para el mapa es `GET /api/offers/map`. Devuelve ofertas con informacion basica del producto, precio si existe, comerciante y coordenadas.

## Comandos utiles

```powershell
yarn build
yarn lint
yarn test
yarn test:e2e
yarn test:cov
```

## Notas de integracion

- El frontend web consume la API con `VITE_API_URL`.
- La app movil consume la API con `EXPO_PUBLIC_API_URL`.
- Ambas URLs deben incluir `/api`.
- Para pruebas desde Expo Go en telefono fisico, la URL del backend debe usar la IP local de la computadora, no `localhost`.
