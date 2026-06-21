# Abasto Paceno

Plataforma geolocalizada para consultar puntos de venta y ofertas de productos esenciales en La Paz, Bolivia.

Abasto Paceno no es un ecommerce: no procesa pagos, no gestiona delivery y no maneja inventario exacto. Su foco es mostrar disponibilidad aproximada y ofertas en un mapa, con una experiencia web y un prototipo movil de consulta.

## Contenido del monorepo

```text
abasto_paceno/
|-- backend/     API REST con NestJS, TypeORM y PostgreSQL
|-- frontend/    Aplicacion web con React, Vite y Leaflet
|-- mobile/      Prototipo movil con Expo, React Native y TypeScript
|-- docs/        Documentacion de apoyo del proyecto
|-- packages/    Espacio reservado para paquetes compartidos
`-- README.md
```

## Stack principal

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL, JWT y Swagger.
- Frontend web: React, Vite, React Router, Axios, Leaflet y OpenStreetMap.
- App movil: Expo SDK 54, React Native, TypeScript, React Navigation, react-native-maps y Axios.
- Base de datos local: PostgreSQL con Docker Compose.
- Gestores: Yarn en backend/frontend y npm en mobile.

## Requisitos

- Node.js instalado.
- Yarn instalado.
- Docker Desktop o Docker Engine.
- Git.
- Expo Go en el telefono para probar la app movil sin instalar APK.
- Cuenta de Expo solo si quieres generar APK con EAS Build.

En Windows, si PowerShell bloquea scripts, usa `yarn.cmd`, `npm.cmd` o `npx.cmd`.

## Variables de entorno

Cada aplicacion tiene su propio ejemplo. Copia cada archivo antes de ejecutar el proyecto:

```powershell
cd backend
copy .env.example .env

cd ..\frontend
copy .env.example .env

cd ..\mobile
copy .env.example .env
```

Valores importantes:

- Backend: `PORT`, `DATABASE_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`.
- Frontend: `VITE_API_URL`, por ejemplo `http://localhost:3000/api`.
- Mobile: `EXPO_PUBLIC_API_URL`, por ejemplo `http://192.168.1.25:3000/api`.

La API usa el prefijo global `/api`. Swagger queda disponible en `http://localhost:3000/docs`.

Para Expo Go en telefono fisico no uses `localhost` en `EXPO_PUBLIC_API_URL`: eso apuntaria al telefono. Usa la IP local de la computadora donde corre el backend y asegurate de que telefono y computadora esten en la misma red.

## Base de datos local

El compose de PostgreSQL vive en `backend/docker-compose.yml`.

```powershell
cd backend
docker compose up -d
```

Para apagar la base:

```powershell
docker compose down
```

Si el puerto de PostgreSQL ya esta ocupado, cambia el puerto publicado en `backend/docker-compose.yml` y ajusta `DATABASE_PORT` en `backend/.env`.

## Instalar dependencias

```powershell
cd backend
yarn install

cd ..\frontend
yarn install

cd ..\mobile
npm.cmd install
```

## Ejecutar en desarrollo

Levanta primero PostgreSQL y configura los `.env`.

Backend:

```powershell
cd backend
yarn start:dev
```

Frontend web:

```powershell
cd frontend
yarn dev
```

App movil con Expo Go:

```powershell
cd mobile
npm.cmd start
```

Escanea el QR con Expo Go. Si hay problemas de cache o assets viejos:

```powershell
npx.cmd expo start --clear --host lan
```

## Datos iniciales

Para cargar datos de prueba:

```powershell
cd backend
yarn seed
```

Ejecuta el seed con PostgreSQL levantado y `backend/.env` configurado.

## Generar APK de la app movil

La app movil esta preparada para generar un APK instalable con EAS Build.

Antes de construir, ajusta `mobile/eas.json`:

```json
"EXPO_PUBLIC_API_URL": "http://TU_IP_LOCAL:3000/api"
```

Luego:

```powershell
cd mobile
npx.cmd --yes --package eas-cli@20.3.0 eas login
npm.cmd run build:apk
```

EAS mostrara un enlace de descarga del `.apk`.

Notas importantes:

- La URL del backend queda embebida dentro del APK.
- Si compilas con una IP local, ese APK solo funcionara en esa red y contra esa computadora.
- Para compartir el APK con otras personas, usa una URL publica del backend.
- Para publicar en Google Play normalmente se genera AAB, no APK.

Durante el desarrollo se genero este APK de prueba:

[Descargar APK de prueba](https://expo.dev/artifacts/eas/rnzvAc-s_lXaTVE-6hcPJxfKHetyKswRBNxyr7-21Zk.apk)

Ese APK fue compilado para el entorno local del desarrollador, asi que no debe asumirse como distribuible para cualquier equipo.

## Flujo recomendado para probar todo desde cero

1. Clonar el repositorio.
2. Crear `backend/.env`, `frontend/.env` y `mobile/.env` desde sus ejemplos.
3. Levantar PostgreSQL con Docker Compose.
4. Instalar dependencias del backend, frontend y mobile.
5. Ejecutar `yarn seed` en backend si se necesitan datos de prueba.
6. Levantar el backend con `yarn start:dev`.
7. Levantar el frontend con `yarn dev`.
8. Levantar la app movil con `npm.cmd start` y escanear el QR con Expo Go.

## Comandos utiles

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

Mobile:

```powershell
cd mobile
npm.cmd run typecheck
npm.cmd run build:apk
```

## Problemas comunes

### El backend no conecta a PostgreSQL

- Revisa que Docker este corriendo.
- Revisa que el contenedor de PostgreSQL este levantado.
- Revisa que `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME` coincidan con tu base.

### El frontend no consume la API

- Revisa que el backend este levantado.
- Revisa que `VITE_API_URL` incluya `/api`.
- Revisa que `CORS_ORIGIN` en backend permita el origen del frontend.

### La app movil no consume la API

- Revisa que el backend este levantado.
- Revisa que `EXPO_PUBLIC_API_URL` incluya `/api`.
- En telefono fisico, usa la IP local de la computadora, no `localhost`.
- Asegurate de que telefono y computadora esten en la misma red.

### Expo Go indica SDK incompatible

- Este prototipo usa Expo SDK 54.
- Actualiza Expo Go desde la tienda o usa un build APK generado con EAS.

## Alcance actual

La app movil es un prototipo de consulta. Incluye mapa, listado de ofertas, seleccion desde listado hacia mapa, tema claro/oscuro, cliente API centralizado y marca visual alineada al frontend web.

Quedan fuera por ahora:

- Login y registro en mobile.
- Administracion en mobile.
- Perfil en mobile.
- Creacion o edicion de ofertas en mobile.
- Pagos, carrito, delivery e inventario exacto.
- Chat, notificaciones push reales y analytics complejos.
