# Abasto Paceño

Plataforma web geolocalizada para consultar puntos de venta de productos esenciales en La Paz, Bolivia.

El proyecto no es ecommerce, no procesa pagos, no gestiona delivery y no maneja inventario exacto. Su objetivo es mostrar ofertas o disponibilidad aproximada en un mapa.

## Stack

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL, JWT y Swagger.
- Frontend web: React, Vite, React Router, Axios, Leaflet y OpenStreetMap.
- App movil: Expo, React Native, TypeScript, React Navigation y react-native-maps.
- Base de datos local: PostgreSQL mediante Docker Compose.
- Gestores de paquetes: Yarn para backend/frontend y npm para la app movil.

## Estructura

```text
abasto_paceno/
|-- backend/
|-- frontend/
|-- mobile/
|-- packages/
|-- docs/
|-- AGENTS.md
`-- README.md
```

## Requisitos

- Node.js instalado.
- Yarn instalado.
- Docker Desktop o Docker Engine instalado.
- Git instalado.

En Windows, si PowerShell bloquea `yarn`, usa `yarn.cmd` en los comandos.

## Variables de entorno

Cada app tiene su propio archivo de ejemplo. Copia el ejemplo, ajusta valores según tu máquina y evita versionar archivos `.env` reales.

### Backend

Archivo:

```powershell
cd backend
copy .env.example .env
```

Variables requeridas:

| Variable | Uso |
| --- | --- |
| `NODE_ENV` | Entorno de ejecución, por ejemplo desarrollo o producción. |
| `PORT` | Puerto donde escuchará el backend. Elige uno disponible en tu equipo. |
| `DATABASE_HOST` | Host de PostgreSQL. Si usas Docker local normalmente será el host accesible desde tu máquina. |
| `DATABASE_PORT` | Puerto publicado de PostgreSQL. Debe coincidir con Docker Compose o con tu base externa. |
| `DATABASE_USER` | Usuario de PostgreSQL. |
| `DATABASE_PASSWORD` | Contraseña de PostgreSQL. |
| `DATABASE_NAME` | Nombre de la base de datos. |
| `JWT_SECRET` | Secreto para firmar tokens JWT. Cambiarlo fuera de desarrollo local. |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token JWT. |
| `CORS_ORIGIN` | Origen del frontend autorizado para consumir el backend. Si hay varios, separarlos por coma. |

La API usa prefijo global `/api`. Swagger queda disponible en `/docs` sobre la URL base del backend.

### Frontend

Archivo:

```powershell
cd frontend
copy .env.example .env
```

Variables requeridas:

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | URL completa de la API backend, incluyendo el prefijo `/api`. |
| `VITE_PORT` | Puerto donde Vite servirá el frontend. Elige uno disponible en tu equipo. |

`VITE_API_URL` debe coincidir con la URL real donde levantaste el backend.

## Base de datos

El archivo de Docker Compose de la base está en `backend/docker-compose.yml`.

Levantar PostgreSQL:

```powershell
cd backend
docker compose up -d
```

Apagar PostgreSQL:

```powershell
cd backend
docker compose down
```

Si el puerto de PostgreSQL ya está ocupado, cambia el puerto publicado en `backend/docker-compose.yml` y ajusta `DATABASE_PORT` en `backend/.env` para que ambos coincidan.

## Instalar dependencias

Backend:

```powershell
cd backend
yarn install
```

Frontend:

```powershell
cd frontend
yarn install
```

App movil:

```powershell
cd mobile
npm.cmd install
```

En Windows con restricción de scripts:

```powershell
yarn.cmd install
```

## Ejecutar en desarrollo

Primero levanta la base de datos y asegúrate de tener configurados los `.env`.

Backend:

```powershell
cd backend
yarn start:dev
```

Frontend:

```powershell
cd frontend
yarn dev
```

App movil con Expo Go:

```powershell
cd mobile
copy .env.example .env
# Edita EXPO_PUBLIC_API_URL con la IP local de tu computadora y el prefijo /api.
npm.cmd start
```

Escanea el QR con Expo Go. En un telefono fisico, `EXPO_PUBLIC_API_URL` debe usar la IP local de la computadora, no `localhost`.

El frontend mostrará en consola la URL local donde quedó disponible. El backend escuchará en el valor definido por `PORT`.

## Seed de datos

Para cargar datos iniciales:

```powershell
cd backend
yarn seed
```

Ejecuta el seed con la base levantada y las variables del backend configuradas.

## Comandos útiles

Backend:

```powershell
cd backend
yarn build
yarn lint
yarn test
```

Frontend:

```powershell
cd frontend
yarn build
yarn lint
yarn preview
```

## Flujo recomendado para levantar todo

1. Clonar el repositorio.
2. Crear `backend/.env` desde `backend/.env.example`.
3. Crear `frontend/.env` desde `frontend/.env.example`.
4. Ajustar puertos y URLs en los `.env` según tu equipo.
5. Levantar PostgreSQL con Docker Compose.
6. Instalar dependencias del backend.
7. Instalar dependencias del frontend.
8. Ejecutar el backend en modo desarrollo.
9. Ejecutar el frontend en modo desarrollo.
10. Opcionalmente ejecutar el seed.

## Problemas comunes

### El backend no conecta a la base

Revisa:

- Que Docker esté corriendo.
- Que el servicio de PostgreSQL esté levantado.
- Que `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME` coincidan con tu base.
- Que el puerto publicado en Docker Compose sea el mismo configurado en `DATABASE_PORT`.

### El frontend no consume la API

Revisa:

- Que el backend esté levantado.
- Que `VITE_API_URL` apunte a la URL real del backend e incluya `/api`.
- Que `CORS_ORIGIN` en el backend incluya el origen real del frontend.

### PowerShell no deja ejecutar Yarn

Usa `yarn.cmd` en lugar de `yarn`:

```powershell
yarn.cmd install
yarn.cmd dev
```

## Notas de alcance

Para el MVP quedan fuera:

- Pagos.
- Carrito.
- Delivery.
- Inventario exacto.
- Chat.
- Push notifications reales.
- Login con Google.
- Verificación telefónica.
- Analytics complejos.
