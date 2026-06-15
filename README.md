# Abasto Paceño

Abasto Paceño es una plataforma web y móvil geolocalizada para informar puntos de venta de productos esenciales en La Paz, Bolivia. La aplicación muestra productos disponibles en un mapa mediante pines y maneja stock aproximado reportado por el vendedor.

## Stack general

- Monorepo con Yarn Workspaces
- Backend con NestJS y TypeScript
- Base de datos PostgreSQL con PostGIS
- Web con React, Vite y TypeScript
- Mobile con React Native CLI y TypeScript
- Mapas con Leaflet + OpenStreetMap en web y react-native-maps en mobile
- Autenticación con email, password y JWT
- Swagger para documentación de API

## Estructura del monorepo

```text
abasto-paceno/
├── apps/
│   ├── backend/
│   ├── mobile/
│   └── web/
├── docs/
├── packages/
│   └── shared/
├── docker-compose.yml
├── AGENTS.md
├── package.json
├── README.md
└── yarn.lock
```

## Notas de ejecución

- Docker Compose se usará para levantar la base de datos, el backend y la aplicación web.
- La aplicación mobile correrá localmente con React Native CLI y Android Studio, fuera de Docker durante el MVP.

## Estado actual

Este repositorio contiene solo la estructura base del monorepo. Todavía no se instalaron frameworks ni se creó código de aplicación.
