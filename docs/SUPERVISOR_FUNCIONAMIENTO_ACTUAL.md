# Supervisor: funcionamiento actual y conexion con backend

## Objetivo

Este documento describe como funciona hoy la aplicacion `apps/supervisor` del monorepo `pump-iot-web-prod`, con foco en:

- flujo de autenticacion
- pantallas principales del supervisor
- como lee y escribe datos contra el backend .NET
- donde usa SignalR para tiempo real
- que partes estan mockeadas o incompletas

No describe el flujo ideal de negocio. Describe lo que hace actualmente el codigo.

## Ubicacion y stack

- Frontend supervisor: `apps/supervisor`
- Framework: Next.js App Router
- Rendering: cliente en la mayor parte de las pantallas funcionales
- Cliente HTTP principal: `apps/supervisor/src/lib/api.ts`
- Tiempo real: SignalR contra `hubs/protocol`
- Backend esperado por defecto: `http://127.0.0.1:5002`

La URL base sale de `NEXT_PUBLIC_API_URL` y si no existe usa `http://127.0.0.1:5002`.

## Arquitectura general del supervisor

El supervisor esta organizado en cuatro capas practicas:

1. `src/app`
   Rutas y paginas de Next.js.
2. `src/components`
   UI compartida y modales.
3. `src/hooks`
   Carga de datos, SWR y SignalR.
4. `src/features/test-detail`
   Logica de detalle de prueba/protocolo, guardado, carga de PDF y extraccion.

## Flujo de autenticacion

### Pantalla de login

Ruta:

- `apps/supervisor/src/app/login/page.tsx`

Funcionamiento actual:

1. El usuario introduce usuario y password.
2. La pantalla llama a `login(username, password)` desde `src/lib/api.ts`.
3. Esa funcion hace `POST /api/auth/login`.
4. Si la respuesta es correcta:
   - guarda `token` en cookie accesible desde cliente
   - guarda `user` en `localStorage`
   - limpia flags de mock
   - redirige a `/supervisor`

Notas:

- El comentario del codigo habla de httpOnly cookies, pero hoy el token se escribe desde el cliente, asi que no es httpOnly.
- Existe un boton de acceso mock que activa `USE_MOCK_DATA` y salta la validacion real.

### Middleware de proteccion

Archivo:

- `apps/supervisor/middleware.ts`

Funcionamiento actual:

1. Protege rutas que empiezan por `/supervisor`.
2. Lee el `token` desde cookie.
3. Si no hay token, redirige a `/login`.
4. Si hay token, llama a `GET /api/auth/verify`.
5. Si el backend devuelve error o timeout, elimina cookie y redirige a login.
6. Si el token es valido, deja pasar.

Excepcion:

- Si la cookie `use_mock_data=true` esta activa, el middleware deja pasar sin validar con backend.

## Cliente de backend del supervisor

Archivo principal:

- `apps/supervisor/src/lib/api.ts`

### Patron actual

La mayor parte del supervisor habla con backend a traves de `fetchApi()`:

- compone `API_BASE_URL + endpoint`
- mete `Content-Type: application/json` por defecto
- parsea JSON
- levanta `Error` si `response.ok` es falso

Ademas, algunas operaciones con archivos usan `fetch` directo con `FormData`.

### Endpoints usados actualmente

#### Autenticacion

- `POST /api/auth/login`
- `GET /api/auth/verify`

#### Pruebas y protocolos

- `GET /api/tests`
- `GET /api/tests/{id}`
- `PATCH /api/tests/{id}`
- `DELETE /api/tests/{id}`
- `POST /api/tests/generate`
- `POST /api/tests/listado`

#### Bancos

- `GET /api/bancos`

#### Importacion Excel y CSV

- `GET /api/Import/listados`
- `POST /api/Import/excel/sheets`
- `POST /api/Import/excel`
- `POST /api/Import/csv`

#### PDFs

- `POST /api/pdf/upload`
- `GET /api/pdf/{id}`

#### Salud del backend

- `GET /api/health`

## Carga de datos en dashboard

Hook principal:

- `apps/supervisor/src/hooks/useTests.ts`

Funcionamiento actual:

- usa `useSWR('/api/tests', swrFetcher)`
- refresca al recuperar foco
- refresca al reconectar red
- deduplica durante 2 segundos

Si `USE_MOCK_DATA=true`, no llama al backend y devuelve `MOCK_TESTS`.

## Pantalla principal del supervisor

Ruta:

- `apps/supervisor/src/app/supervisor/page.tsx`

### Que muestra hoy

La pagina principal actua como dashboard de entradas y protocolos:

- pruebas pendientes
- protocolos generados
- filtros por estado
- tabla principal
- boton para importar Excel
- boton para crear prueba manual

### Como se alimenta

- usa `useTests()` para traer `/api/tests`
- separa localmente los items por estado e id
- identifica los registros `pending-*` como pruebas pendientes
- identifica protocolos generados con estados como `GENERATED` o `GENERADO`

### Acciones que dispara

- eliminar una prueba o protocolo
  - `DELETE /api/tests/{id}`
- crear una prueba manual vacia
  - `POST /api/tests/listado`
- refrescar tabla
  - `mutate()` de SWR

### Tiempo real en dashboard

El dashboard principal si escucha SignalR:

- hook: `apps/supervisor/src/hooks/useSignalR.ts`
- hub: `{API_BASE_URL}/hubs/protocol`

Eventos escuchados:

- `ActiveLocks`
- `ProtocolLocked`
- `ProtocolUnlocked`
- `ProtocolListUpdated`

Uso actual:

- muestra protocolos bloqueados por otros dispositivos
- usa `ProtocolListUpdated` para relanzar `mutate()` y refrescar listado

Importante:

- aqui el tiempo real se usa sobre todo para bloqueo visual y refresco de listas
- no todas las pantallas del supervisor consumen este hook

## Importacion de Excel

Componente:

- `apps/supervisor/src/components/import-modal.tsx`

### Flujo actual

1. El usuario sube un `.xlsx` o `.xls`.
2. El modal llama a `getExcelSheets(file)`.
3. Eso hace `POST /api/Import/excel/sheets`.
4. Si solo hay una hoja:
   - importa automaticamente
5. Si hay varias:
   - pide seleccionar una
6. Luego llama a `importExcel(file, sheet)`.
7. Eso hace `POST /api/Import/excel`.
8. Al terminar:
   - devuelve numero de registros importados
   - llama a `onImportSuccess`
   - el dashboard hace `mutate()` para volver a cargar `/api/tests`

### Resultado funcional

El supervisor usa el Excel como punto de entrada para crear o refrescar los datos base del pedido en backend.

## Creacion y edicion de protocolos

### Ruta de protocolo generado

- `apps/supervisor/src/app/supervisor/protocolo/[id]/page.tsx`

Esta pagina:

- carga el detalle del protocolo ya generado
- permite editar campos
- permite guardar
- permite mover la prueba a banco

### Carga de detalle

Hooks principales:

- `useTestDetail`
- `useTestDetailPage`

Archivos:

- `apps/supervisor/src/features/test-detail/hooks/useTestDetail.ts`
- `apps/supervisor/src/features/test-detail/hooks/useTestDetailPage.ts`

Funcionamiento actual:

1. Llama a `GET /api/tests/{id}`.
2. Si no esta en modo mock, mapea entidades del backend a una estructura `pdfData`.
3. Si el backend marca `hasPdf`, carga tambien el binario con `GET /api/pdf/{id}` para previsualizarlo.

### Guardado de protocolo

Hook:

- `apps/supervisor/src/features/test-detail/hooks/useTestSave.ts`

Flujo actual:

1. Toma `generalInfo` y `pdfData` del formulario.
2. Los transforma con `mapTestToSaveDTO(...)`.
3. Hace `PATCH /api/tests/{id}`.
4. Si hay fichero PDF adjunto:
   - hace `POST /api/pdf/upload`
   - en modo `PENDING` puede subirlo a varios ids generados
   - en modo `GENERATED` lo sube al protocolo actual

Resultado:

- el detalle del protocolo se persiste en backend
- el PDF se almacena aparte via endpoint de PDF

### Cambio a estado "en banco"

Desde la pagina de protocolo generado existe una accion manual:

- `PUT /api/Tests/{id}/status` con body `{ status: 'EN_BANCO' }`

Importante:

- esta llamada se hace con `fetch` directo desde la pagina
- no pasa por `src/lib/api.ts`
- tras el cambio, redirige a `/supervisor/programacion`

## Pantalla de programacion por bancos

Ruta:

- `apps/supervisor/src/app/supervisor/programacion/page.tsx`

### Que hace hoy

Construye un kanban por bancos `A` a `E` con protocolos que esten en:

- `EN_BANCO`
- `IN_PROGRESS`

La fuente de datos sigue siendo `useTests()` sobre `GET /api/tests`.

### Movimiento entre bancos

Al arrastrar una tarjeta a otra columna hace:

- `PUT /api/Tests/{id}/banco`
- body: `{ bancoId: number }`

Luego fuerza recarga con `mutate()`.

### Limitacion actual

Esta pantalla no esta conectada a SignalR aunque el proyecto tiene hook para ello.

Consecuencia:

- la pantalla de programacion del supervisor no recibe por si sola actualizaciones en tiempo real de locks o lista
- solo se refresca con la carga normal de SWR o tras mover una tarjeta

## Gestion de usuarios

Ruta:

- `apps/supervisor/src/app/supervisor/user-management/page.tsx`

Hook:

- `apps/supervisor/src/app/supervisor/user-management/hooks/useUsers.ts`

Estado actual:

- no usa backend real
- simula llamadas asincronas
- guarda usuarios en `localStorage` bajo `mock_users`

Esto significa que hoy la gestion de usuarios del supervisor es local al navegador, no persistida en el backend .NET.

## Modo mock

El supervisor tiene una ruta alternativa de funcionamiento sin backend real.

Se activa con:

- `localStorage.setItem('USE_MOCK_DATA', 'true')`
- cookie `use_mock_data=true`

Efectos actuales:

- el middleware no valida token contra backend
- `useTests()` devuelve `MOCK_TESTS`
- `useTestSave()` no guarda en backend
- varias pantallas usan datos simulados o saltan llamadas reales

## Como se conecta exactamente con el backend .NET

### Conexion HTTP

Todos los endpoints se resuelven contra:

- `NEXT_PUBLIC_API_URL`
- o, por defecto, `http://127.0.0.1:5002`

El frontend supervisor no implementa un BFF propio hoy. En la practica hace llamadas directas desde navegador o componentes cliente al backend .NET.

### Conexion tiempo real

El tiempo real se hace con SignalR WebSocket directo contra:

- `{API_BASE_URL}/hubs/protocol`

Configuracion actual:

- `skipNegotiation: true`
- `transport: WebSockets`
- reconexion automatica

Eventos consumidos:

- locks activos
- bloqueo de protocolo
- desbloqueo de protocolo
- aviso de actualizacion de lista

## Resumen por pantalla

### Login

- backend real para login y verify
- soporta modo mock

### Dashboard principal

- backend real para listar, borrar y crear pruebas manuales
- SignalR para locks y refresco de lista

### Importacion Excel

- backend real para leer hojas e importar

### Detalle de protocolo

- backend real para cargar detalle
- backend real para guardar datos
- backend real para subir y leer PDF

### Programacion

- backend real para listar pruebas y mover banco/estado
- sin SignalR conectado en esta pagina

### Gestion de usuarios

- sin backend real
- mock en localStorage

## Limitaciones actuales detectadas en esta documentacion

- el token no se gestiona hoy como cookie httpOnly real; se escribe desde cliente
- la gestion de usuarios del supervisor no esta integrada con backend
- algunas operaciones usan `fetch` directo en pagina en lugar del cliente API comun
- la programacion del supervisor no esta enlazada a SignalR aunque el proyecto ya tiene el hook
- conviven varios nombres de estado entre frontend y backend (`PENDING`, `GENERATED`, `GENERADO`, `EN_BANCO`, `IN_PROGRESS`, `EN_PROCESO`)

## Archivo de referencia para seguir

Si quieres ampliar esta documentacion, estos son los archivos mas relevantes:

- `apps/supervisor/src/lib/api.ts`
- `apps/supervisor/middleware.ts`
- `apps/supervisor/src/app/login/page.tsx`
- `apps/supervisor/src/app/supervisor/page.tsx`
- `apps/supervisor/src/app/supervisor/programacion/page.tsx`
- `apps/supervisor/src/app/supervisor/protocolo/[id]/page.tsx`
- `apps/supervisor/src/hooks/useTests.ts`
- `apps/supervisor/src/hooks/useSignalR.ts`
- `apps/supervisor/src/components/import-modal.tsx`
- `apps/supervisor/src/features/test-detail/hooks/useTestDetail.ts`
- `apps/supervisor/src/features/test-detail/hooks/useTestDetailPage.ts`
- `apps/supervisor/src/features/test-detail/hooks/useTestSave.ts`
- `apps/supervisor/src/app/supervisor/user-management/hooks/useUsers.ts`
