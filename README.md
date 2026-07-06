# Taher — App de Registro Juvenil

App móvil y web para registrar y gestionar jóvenes, con una base de datos **MongoDB Atlas**.

- **`backend/`** — API REST en Node + Express + Mongoose (habla con MongoDB). También sirve:
  - `/` — landing page (info, botón de descarga del APK y enlace a la app web)
  - `/app` — la app compilada para web (para iPhone/PC)
  - `/downloads/Taher.apk` — el APK de Android
- **`app/`** — App en React Native (Expo) + NativeWind. Compila a Android (APK) **y a web**.

La app **no** se conecta directo a MongoDB: consume la API del backend. Así las credenciales de la base nunca viajan dentro de la app.

```
┌─────────────┐      HTTP/REST      ┌──────────────┐    Mongoose    ┌───────────────┐
│  App Expo   │ ──────────────────> │ API Express  │ ─────────────> │ MongoDB Atlas │
│ (teléfono)  │ <────────────────── │ (PC :4000)   │ <───────────── │   (nube)      │
└─────────────┘       JSON          └──────────────┘                └───────────────┘
```

---

## 1. Backend (API)

```bash
cd backend
npm install
```

Crea el archivo `backend/.env` (ya incluido en este repo localmente, pero **no se sube a git**):

```env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/Taher?appName=Angeda
PORT=4000
APP_PIN=1234
```

Sembrar datos de ejemplo (opcional) y arrancar:

```bash
npm run seed     # inserta 8 jóvenes de prueba
npm start        # arranca la API en http://localhost:4000
```

### Endpoints

| Método | Ruta                  | Descripción                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/auth/pin`       | Valida el PIN de acceso (`{pin}`)    |
| GET    | `/api/jovenes`        | Lista jóvenes (`?search=` opcional)  |
| GET    | `/api/jovenes/:id`    | Un joven por id                      |
| POST   | `/api/jovenes`        | Crea un registro                     |
| PUT    | `/api/jovenes/:id`    | Actualiza un registro                |
| DELETE | `/api/jovenes/:id`    | Elimina un registro                  |
| GET    | `/api/stats`          | Estadísticas (totales, edad, género, WhatsApp) |

---

## 2. App móvil (Expo)

```bash
cd app
npm install
npm start        # abre Expo Dev Tools
```

Luego escanea el QR con la app **Expo Go** (Android/iOS) o pulsa `a` para abrir un emulador Android.

### A qué API se conecta la app

- **APK instalado / producción:** usa la API desplegada en Render (HTTPS), fijada en
  `app/.env` → `EXPO_PUBLIC_API_URL=https://taher-82uh.onrender.com`. Así la app
  funciona sola en cualquier teléfono, contra la base en la nube. No necesita tu PC.
- **Desarrollo con Expo Go (sin `.env`):** si borras `EXPO_PUBLIC_API_URL`, la app
  detecta la IP de tu PC (la de Metro) y usa el puerto `4000` contra el backend local
  (teléfono y PC en la misma WiFi; permite el puerto 4000 en el Firewall de Windows).
- El plan Free de Render "duerme" el servicio tras ~15 min de inactividad: el primer
  acceso puede tardar ~30-50s en responder, luego va normal.

### PIN de acceso

PIN universal **`2207`** (igual para todos). Se guarda en la BD (colección `config`)
y la API lo valida desde ahí. El valor inicial se siembra desde `backend/.env` → `APP_PIN`.

---

## 3. Generar el APK instalable (con logo)

El icono se genera desde un PNG con el logo de Taher:

```bash
cd app
node scripts/gen-icons.mjs C:/ruta/al/logo.png   # crea todos los assets en ./assets
```

### Opción A — Build local (sin cuenta Expo)

Requiere Android SDK + JDK 17/21. Genera un APK firmado con el keystore debug (instalable).

```bash
cd app
npx expo prebuild --platform android --no-install
# IMPORTANTE: el wrapper se genera con Gradle 9.3.1, que es incompatible con la
# cadena de plugins de RN 0.85 (falta JvmVendorSpec.IBM_SEMERU). Baja a 8.13:
#   android/gradle/wrapper/gradle-wrapper.properties
#   distributionUrl=...gradle-8.13-bin.zip
# y crea android/local.properties con: sdk.dir=C:/Users/<tu>/AppData/Local/Android/Sdk
cd android && ./gradlew assembleRelease
# APK resultante: android/app/build/outputs/apk/release/app-release.apk
```

### Opción B — Build en la nube con EAS

```bash
cd app
npx eas-cli login
npx eas-cli build -p android --profile preview   # devuelve un APK descargable
```

### Instalar en el celular

Descarga el APK desde la landing (`https://taher-82uh.onrender.com` → "Descargar para
Android") o pasa el `.apk` al teléfono, ábrelo y permite "instalar apps de orígenes
desconocidos". El APK de producción apunta a la API en Render, funciona solo.

### Versión web (iPhone / PC)

La misma app compilada a web se sirve en `https://taher-82uh.onrender.com/app`.
Para regenerarla tras un cambio:

```bash
cd app
EXPO_PUBLIC_API_URL=https://taher-82uh.onrender.com npx expo export --platform web --output-dir dist-web
rm -rf ../backend/public/app && cp -r dist-web ../backend/public/app
# commit + push → Render la sirve automáticamente
```

Para actualizar el APK descargable de la landing, copia el nuevo build a
`backend/public/downloads/Taher.apk` y haz commit.

---

## Pantallas

1. **Acceso por PIN** — teclado numérico, valida contra la API.
2. **Inicio** — bienvenida, buscador, accesos rápidos y métricas.
3. **Buscar** — búsqueda por nombre/ciudad en vivo.
4. **Estadísticas** — total, distribución por edad, género y % WhatsApp.
5. **Lista** — jóvenes registrados (pull-to-refresh) + detalle/eliminar.
6. **Registro** — formulario que guarda en MongoDB.
