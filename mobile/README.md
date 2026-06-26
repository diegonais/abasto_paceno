# App movil Abasto Boliviano

Prototipo movil de consulta para Abasto Boliviano, construido con Expo SDK 54, React Native y TypeScript.

La app permite:

- Ver ofertas disponibles en un mapa.
- Consultar las mismas ofertas en un listado simple.
- Seleccionar una oferta del listado y ubicarla en el mapa.
- Alternar tema claro/oscuro con identidad visual alineada al frontend web.

No incluye login, registro, administracion, perfil, creacion ni edicion de ofertas. Es una app de visualizacion.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- React Navigation
- react-native-maps
- Axios
- EAS Build para generar APK

## Estructura

```text
mobile/
|-- assets/
|-- src/
|   |-- api/
|   |-- components/
|   |-- constants/
|   |-- context/
|   |-- navigation/
|   |-- screens/
|   `-- types/
|-- app.config.js
|-- eas.json
|-- .env.example
`-- package.json
```

## Variables de entorno

Copia el ejemplo:

```powershell
cd mobile
copy .env.example .env
```

Edita `mobile/.env`:

```text
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000/api
```

Importante:

- En telefono fisico no uses `localhost`, porque apuntaria al telefono.
- Usa la IP local de la computadora donde corre el backend.
- La URL debe incluir el prefijo `/api`.
- Telefono y computadora deben estar en la misma red.

Ejemplo:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.25:3000/api
```

## Ejecutar con Expo Go

```powershell
cd mobile
npm.cmd install
npm.cmd start
```

Escanea el QR con Expo Go.

Si Expo Go muestra una version anterior, assets cacheados o tarda demasiado:

```powershell
npx.cmd expo start --clear --host lan
```

Si aparece incompatibilidad de SDK, actualiza Expo Go. Esta app usa Expo SDK 54.

## Consumo del backend

El cliente API central esta en:

```text
src/api/client.ts
```

Las ofertas se obtienen desde:

```text
GET /api/offers/map
```

La URL base viene de `EXPO_PUBLIC_API_URL`. No se debe dejar una URL final hardcodeada con `localhost`.

## Tema e identidad visual

- La paleta esta en `src/constants/theme.ts`.
- El tema claro/oscuro se maneja desde `src/context/ThemeContext.tsx`.
- El logo completo vive en `assets/abasto-boliviano.png`.
- En modo claro se usa el logo normal.
- En modo oscuro el logo dentro de la app se pinta en blanco para mantener contraste.
- La navegacion usa una barra flotante inferior tipo capsula.

`app.config.js` usa un nombre dinamico:

- En Expo Go local se oculta el texto duplicado debajo del logo de carga.
- En EAS Build se usa `Abasto Boliviano`, porque Android requiere un nombre valido para instalar el APK.

## Generar APK

La app puede generar un APK instalable con EAS Build. El APK no depende de Expo Go.

Antes de construir, ajusta `mobile/eas.json` en el perfil `apk`:

```json
"EXPO_PUBLIC_API_URL": "http://TU_IP_LOCAL:3000/api"
```

Esa URL queda embebida dentro del APK. Por eso un APK construido con una IP local solo funciona para esa red/equipo. Para compartir el APK con otras personas, usa una URL publica del backend.

Luego ejecuta:

```powershell
cd mobile
npx.cmd --yes --package eas-cli@20.3.0 eas login
npm.cmd run build:apk
```

Al terminar, EAS mostrara un enlace para descargar el `.apk`.

Para Play Store normalmente se genera un AAB usando el perfil `production`.

## APK generado durante el desarrollo

Se genero un APK de prueba para el entorno local del desarrollador:

[Descargar APK de prueba](https://expo.dev/artifacts/eas/rnzvAc-s_lXaTVE-6hcPJxfKHetyKswRBNxyr7-21Zk.apk)

Ese APK fue compilado con una IP local especifica, por lo que no debe asumirse como distribuible para cualquier equipo.

## Comandos utiles

```powershell
npm.cmd start
npm.cmd run typecheck
npm.cmd run build:apk
```

## Problemas comunes

### La app carga mucho y luego falla

- Revisa `EXPO_PUBLIC_API_URL`.
- En telefono fisico usa la IP local de la computadora, no `localhost`.
- Verifica que el backend este levantado y que la URL incluya `/api`.
- Ejecuta `npx.cmd expo start --clear --host lan`.

### No aparecen ofertas en el mapa

- Verifica que existan ofertas con latitud y longitud.
- Ejecuta el seed del backend si necesitas datos de prueba.
- Revisa que `GET /api/offers/map` responda desde el navegador o Postman.

### El APK no consume la API

- Recuerda que la URL queda embebida durante el build.
- Si cambiaste de red o de IP, genera un APK nuevo.
- Para un APK compartible, usa un backend publico.

## Archivos que no se versionan

No subas archivos locales como:

- `mobile/.env`
- `.expo/`
- logs de ejecucion
- builds temporales

El repositorio incluye `.env.example` y `eas.json` como guia, pero cada persona debe ajustar sus credenciales, IP local o URL publica.
