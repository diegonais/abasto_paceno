# Abasto Paceño

## Stack

### Backend
- NestJS
- TypeORM
- PostgreSQL
- JWT para autenticación
- Yarn

### Frontend
- React
- Vite
- React Router
- Axios
- Leaflet + React Leaflet
- Yarn

### Mobile
- Aplicación móvil dentro de `mobile`

## Arquitectura

Monorepo:

```text
abasto_paceno/
├── backend/
├── frontend/
└── mobile/
```

### Backend
- API REST en `backend`
- Configuración por variables de entorno en `.env`
- Módulos principales:
  - `auth`
  - `users`
  - `merchant-profiles`
  - `categories`
  - `products`
  - `offers`

### Frontend
- Aplicación web en `frontend`
- Consumo de API REST por `VITE_API_URL`
- Estructura base:
  - `src/app`
  - `src/components`
  - `src/features`
  - `src/services`
  - `src/styles`

## Comandos de ejecución

### 1. Levantar base de datos

```powershell
cd C:\Users\USUARIO\Desktop\diego\abasto_paceno\backend
docker compose up -d
```

### 2. Levantar backend

```powershell
cd C:\Users\USUARIO\Desktop\diego\abasto_paceno\backend
yarn install
yarn start:dev
```

Backend:

```text
http://localhost:3001/api
```

Swagger:

```text
http://localhost:3001/docs
```

### 3. Ejecutar seed

```powershell
cd C:\Users\USUARIO\Desktop\diego\abasto_paceno\backend
yarn seed
```

### 4. Levantar frontend

```powershell
cd C:\Users\USUARIO\Desktop\diego\abasto_paceno\frontend
yarn install
yarn dev
```

Frontend:

```text
http://localhost:5173
```

### 5. Apagar base de datos

```powershell
cd C:\Users\USUARIO\Desktop\diego\abasto_paceno\backend
docker compose down
```
