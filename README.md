# Sistema Tópico - Backend

API backend para el sistema de tópico, desarrollada con NestJS y TypeScript. La aplicación utiliza Supabase como base de datos.

## Requisitos

- Git para clonar el repositorio.
- Node.js **20 o superior**. Se recomienda instalar Node.js **24 LTS**.
- npm, incluido con Node.js.
- Acceso a un proyecto Supabase con la base de datos y las tablas del sistema configuradas.

Verifica las versiones instaladas:

```bash
node --version
npm --version
```

## Clonar e instalar

Reemplaza `<URL_DEL_REPOSITORIO>` por la URL Git del repositorio:

```bash
git clone <URL_DEL_REPOSITORIO> sistema-topico-back
cd sistema-topico-back
npm ci
```

`npm ci` instala las dependencias usando las versiones fijadas en `package-lock.json`.

## Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto copiando `.env.example`.

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

En macOS/Linux:

```bash
cp .env.example .env
```

Edita `.env` con los datos de tu proyecto Supabase:

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto local de la API. Opcional; por defecto es `3000`. |
| `SUPABASE_URL` | URL del proyecto Supabase. |
| `SUPABASE_KEY` | Clave de API de Supabase para que el backend acceda al proyecto. |
| `JWT_SECRET` | Secreto privado y fuerte para firmar y validar tokens JWT. |

No compartas ni subas el archivo `.env` al repositorio. Usa las credenciales de un entorno autorizado y mantén los secretos fuera del código.

## Ejecutar en desarrollo

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3000/api` (o en el puerto indicado en `PORT`). Para comprobar la conexión con Supabase, abre:

```text
http://localhost:3000/api/health
```

La verificación consulta la tabla `personas`; por eso, la base de datos debe estar configurada y accesible.

## Compilar y ejecutar

```bash
npm run build
npm run start:prod
```

## Pruebas y lint

```bash
npm test
npm run test:e2e
npm run lint
```

## Scripts disponibles

- `npm run start`: inicia la aplicación.
- `npm run start:dev`: inicia en modo desarrollo con recarga automática.
- `npm run start:debug`: inicia en modo depuración con recarga automática.
- `npm run build`: compila la aplicación.
- `npm run start:prod`: ejecuta la compilación de producción.
- `npm test`: ejecuta las pruebas unitarias.
- `npm run test:e2e`: ejecuta las pruebas end-to-end.
- `npm run test:cov`: ejecuta las pruebas y genera cobertura.
- `npm run lint`: analiza el código fuente y las pruebas.
