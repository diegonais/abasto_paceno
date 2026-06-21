# App móvil Abasto Paceño

Prototipo móvil de consulta construido con Expo SDK 54, React Native y TypeScript.

El SDK está fijado en 54 para evitar incompatibilidades con versiones de Expo Go instaladas desde tienda en teléfonos físicos.

## Configuración

1. Instala dependencias:

   ```powershell
   cd mobile
   npm.cmd install
   ```

2. Crea el archivo de entorno:

   ```powershell
   copy .env.example .env
   ```

3. Ajusta `EXPO_PUBLIC_API_URL` con la URL real del backend, incluyendo `/api`.

   En Expo Go sobre un teléfono físico no uses `localhost`, porque apuntaría al teléfono. Usa la IP local de tu computadora, por ejemplo:

   ```text
   EXPO_PUBLIC_API_URL=http://192.168.1.25:3000/api
   ```

4. Asegúrate de que el backend esté levantado y que `CORS_ORIGIN` permita el origen usado por Expo durante desarrollo.

## Ejecutar con Expo Go

```powershell
cd mobile
npm.cmd start
```

Luego escanea el QR con Expo Go desde Android o iOS. El prototipo muestra un mapa de ofertas activas desde `GET /offers/map` y una pestaña de listado simple.
