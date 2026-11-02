# PDF Viewer

A single-module PDF library. Admins sign in to upload and delete PDFs; users open the app,
browse the documents and read them inside the app. There is no download, share, or print action.

- **Backend:** Django 6 + Django REST Framework, SQLite, private local media storage
- **Frontend:** React Native 0.88 + TypeScript, React Navigation, Axios, `react-native-pdf`

## Project layout

```
backend/
  config/               Django settings, root URLs, WSGI
  documents/            model, serializers, views, permissions, tests, migrations
  media/documents/      private PDF storage (not served as static files)
  manage.py
  requirements.txt
frontend/
  src/
    api/                axios client, document/admin API calls, host configuration
    components/         reusable UI (buttons, cards, form fields, banners)
    navigation/         stack navigator
    screens/            Home, PDFViewer, AdminLogin, AdminUpload
    types/              shared TypeScript types
    utils/              token storage and error messages
  App.tsx
```

## Requirements

- Python 3.12+ (tested with 3.14)
- Node.js 22.11+ (tested with 24), npm
- JDK 17 and Android SDK 36/37 for Android
- macOS + Xcode + CocoaPods for iOS

## Backend setup

Run these from the repository root in PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python manage.py migrate
.\.venv\Scripts\python manage.py createsuperuser
.\.venv\Scripts\python manage.py runserver 0.0.0.0:8000
```

For bash/macOS/Linux, replace `.\.venv\Scripts\` with `.venv/bin/`.

A superuser with `is_staff=True` is required to log in to the admin screens. The local database in
this workspace already contains a test admin: **admin / Admin12345!**. Change that password (or
create your own superuser) before using the app for anything real.

### Configuration

Settings are read from environment variables. Defaults are suitable for local development.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | dev key | Set a strong random value outside development |
| `DJANGO_DEBUG` | `true` | Set to `false` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,10.0.2.2` | Comma-separated hosts; add your LAN IP for a physical phone |
| `APP_API_KEY` | `pdf-viewer-app-key-change-me` | Shared key required by the read/view endpoints; must match `frontend/src/api/config.ts` |
| `MAX_PDF_SIZE_MB` | `25` | Upload size limit |

Example for a physical device on the same Wi-Fi:

```powershell
$env:DJANGO_ALLOWED_HOSTS = "localhost,127.0.0.1,10.0.2.2,192.168.1.20"
$env:APP_API_KEY = "your-long-random-key"
.\.venv\Scripts\python manage.py runserver 0.0.0.0:8000
```

`backend/.env.example` lists the same variables. Django does not load that file automatically.

## Frontend setup

```powershell
cd frontend
npm install
npm start
```

In a second terminal:

```powershell
cd frontend
npm run android        # Android emulator/device
npm run ios            # macOS only
```

If the Android app shows **"Unable to load script"**, allow the Metro/bundler permission prompt on
the device (Android 16+ asks for local network access) and run `adb reverse tcp:8081 tcp:8081`.

### Running on a physical Android phone (USB)

The debug APK loads its JavaScript from Metro and talks to Django through USB port forwarding, so
the phone does not need to be on the same Wi-Fi:

```powershell
adb devices                       # phone must be listed (enable USB debugging first)
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
adb reverse tcp:8081 tcp:8081     # Metro
adb reverse tcp:8000 tcp:8000     # Django
adb shell pm grant com.pdfviewer android.permission.ACCESS_LOCAL_NETWORK   # Android 16+ only
```

If the cable is unplugged or adb restarts, the two `adb reverse` mappings are lost and the app
shows "Cannot reach the server" or "Unable to load script" — just run them again.

Keep `npm start` (Metro) and the Django server running, and keep the cable connected. The app uses
`localhost` on Android for exactly this reason (see `src/api/config.ts`).

To use the app untethered, set `DEV_HOST` in `src/api/config.ts` to your computer's LAN IP, add that
IP to `DJANGO_ALLOWED_HOSTS`, allow inbound TCP 8000 in the Windows firewall, and build a release APK
so the JavaScript bundle is embedded.

### API URL per target

Edit `frontend/src/api/config.ts`:

| Target | Host |
| --- | --- |
| Android emulator | `10.0.2.2` (already configured) |
| iOS simulator | `localhost` (already configured) |
| Physical Android/iOS device | Your computer's LAN IP, e.g. `192.168.1.20` |

When using a physical device, also add the same IP to `DJANGO_ALLOWED_HOSTS`, start Django on
`0.0.0.0`, keep both devices on the same network, and allow port 8000 through the firewall.
The Android debug build permits HTTP for local development; release builds do not. Use HTTPS in
production.

## API

Admin mutation endpoints require `Authorization: Token <token>`. Read/view endpoints accept
either that admin token or `X-App-Key: <APP_API_KEY>` (the mobile app sends the key).

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/admin/login/` | Public | Exchange admin credentials for a token |
| POST | `/api/documents/upload/` | Admin | Upload a PDF (multipart: `title`, `description`, `pdf_file`) |
| GET | `/api/documents/` | App key / admin | List active documents |
| GET | `/api/documents/{id}/` | App key / admin | Document metadata |
| GET | `/api/documents/{id}/view/` | App key / admin | Stream the PDF inline |
| DELETE | `/api/documents/{id}/` | Admin | Delete the document and its file |

Sample requests:

```bash
# Log in
curl -X POST http://127.0.0.1:8000/api/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin12345!"}'

# Upload (replace TOKEN)
curl -X POST http://127.0.0.1:8000/api/documents/upload/ \
  -H "Authorization: Token TOKEN" \
  -F "title=Employee handbook" \
  -F "description=Policies and benefits" \
  -F "pdf_file=@C:/path/to/handbook.pdf;type=application/pdf"

# List and view
curl http://127.0.0.1:8000/api/documents/ \
  -H "X-App-Key: pdf-viewer-app-key-change-me"
curl -i http://127.0.0.1:8000/api/documents/1/view/ \
  -H "X-App-Key: pdf-viewer-app-key-change-me" -o response.pdf

# Delete
curl -X DELETE http://127.0.0.1:8000/api/documents/1/ \
  -H "Authorization: Token TOKEN"
```

## How PDF protection works

- Files are stored under `backend/media/` and that folder is **not** routed or served. The only
  way to read a PDF is the controlled `/view/` endpoint, which requires the app key (or an admin
  token), only serves active documents, and returns `Content-Disposition: inline`,
  `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`, and a restrictive CSP.
- The mobile app has no download, share, or print controls. `react-native-pdf` renders inside the
  app; it does not launch an external viewer.
- Android enables `FLAG_SECURE`, blocking screenshots and screen recording for the whole app.
- iOS cannot block screenshots at the OS level. The app hides its content with a full-screen cover
  when it leaves the foreground, so the app-switcher preview is not readable.
- The built-in user access control is a shared app key shipped with the mobile app. It stops casual
  URL access, but a determined user can extract it from the app binary. For stronger per-user
  control, add real user accounts and short-lived signed view URLs.
- No client-side measure can guarantee that a user will never photograph a screen or copy content.
  The protections above are practical deterrents, not absolute prevention.

## Tests

```powershell
cd backend
.\.venv\Scripts\python manage.py test documents -v 2
```

The Django tests cover admin login, permissions, upload validation (invalid/corrupted files),
listing, inline streaming headers, missing files, and deletion (including file cleanup).

Frontend checks:

```powershell
cd frontend
npx tsc --noEmit
npm run lint
```
