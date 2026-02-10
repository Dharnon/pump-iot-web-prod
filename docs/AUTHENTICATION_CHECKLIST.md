# Checklist de Verificación - Sistema de Autenticación OT

Este documento proporciona una lista de verificación paso a paso para validar que el sistema de autenticación está funcionando correctamente.

---

## ✅ Pre-requisitos

Antes de comenzar las pruebas, asegúrate de que:

- [ ] El backend (.NET API) está corriendo en `http://localhost:5002`
- [ ] El endpoint `/api/auth/verify` está implementado en el backend
- [ ] El frontend (Next.js) está corriendo en `http://localhost:3000`
- [ ] Tienes credenciales de prueba (ej: `admin` / `admin123`)

---

## 🔒 Fase 1: Pruebas de Autenticación Básica

### Test 1.1: Login Exitoso

- [ ] Navegar a `http://localhost:3000/login`
- [ ] Ingresar credenciales válidas
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] **Resultado Esperado**: Redirección a `/supervisor`

### Test 1.2: Login Fallido

- [ ] Navegar a `http://localhost:3000/login`
- [ ] Ingresar credenciales inválidas
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] **Resultado Esperado**: Mensaje de error "Credenciales inválidas"

### Test 1.3: Persistencia de Sesión

- [ ] Iniciar sesión exitosamente
- [ ] Recargar la página (F5)
- [ ] **Resultado Esperado**: Permaneces en `/supervisor` sin redirigir a login

---

## 🛡️ Fase 2: Pruebas de Seguridad del Middleware

### Test 2.1: Acceso sin Autenticación

- [ ] Abrir una ventana de incógnito
- [ ] Navegar directamente a `http://localhost:3000/supervisor`
- [ ] **Resultado Esperado**: Redirección inmediata a `/login?callbackUrl=/supervisor`

### Test 2.2: Callback URL Funcional

- [ ] Después del Test 2.1, iniciar sesión
- [ ] **Resultado Esperado**: Redirección automática a `/supervisor` (la URL original)

### Test 2.3: Protección de Cookies

- [ ] Iniciar sesión
- [ ] Abrir DevTools (F12) → Application → Cookies
- [ ] Buscar la cookie `token`
- [ ] Verificar los siguientes atributos:
  - [ ] `SameSite`: Strict
  - [ ] `Path`: /
  - [ ] `Max-Age`: ~28800 (8 horas)

### Test 2.4: Validación Activa del Token

- [ ] Iniciar sesión
- [ ] Abrir DevTools → Network
- [ ] Navegar a `/supervisor`
- [ ] Buscar la petición a `/api/auth/verify`
- [ ] **Resultado Esperado**: Petición GET con header `Authorization: Bearer <token>`

---

## ⏱️ Fase 3: Pruebas de Expiración y Errores

### Test 3.1: Token Expirado (Simulación)

**Nota**: Este test requiere modificar temporalmente el token o esperar 8 horas.

**Opción A - Modificar Cookie Manualmente**:

- [ ] Iniciar sesión
- [ ] Abrir DevTools → Application → Cookies
- [ ] Modificar el valor de la cookie `token` a un valor inválido (ej: `invalid_token`)
- [ ] Navegar a `/supervisor`
- [ ] **Resultado Esperado**: Redirección a `/login?error=session_expired`
- [ ] Verificar mensaje: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."

**Opción B - Esperar Expiración Natural**:

- [ ] Iniciar sesión
- [ ] Esperar 8 horas
- [ ] Navegar a `/supervisor`
- [ ] **Resultado Esperado**: Redirección a `/login?error=session_expired`

### Test 3.2: Backend No Disponible (Fail-Safe)

- [ ] Iniciar sesión exitosamente
- [ ] Detener el backend (.NET API)
- [ ] Navegar a `/supervisor`
- [ ] **Resultado Esperado**: Redirección a `/login?error=validation_failed`
- [ ] Verificar mensaje: "Error de validación de sesión. Por favor, inicia sesión nuevamente."
- [ ] Reiniciar el backend

### Test 3.3: Timeout del Middleware

**Nota**: Este test requiere simular latencia en el backend.

- [ ] Modificar el endpoint `/api/auth/verify` para que tarde más de 3 segundos
- [ ] Iniciar sesión
- [ ] Navegar a `/supervisor`
- [ ] **Resultado Esperado**: Redirección a `/login?error=validation_failed` después de ~3 segundos

---

## 🔐 Fase 4: Pruebas de Seguridad Avanzada

### Test 4.1: XSS - Acceso al Token desde JavaScript

- [ ] Iniciar sesión
- [ ] Abrir la consola del navegador (F12)
- [ ] Ejecutar: `document.cookie`
- [ ] **Resultado Actual**: El token es visible (porque se setea desde el cliente)
- [ ] **Resultado Ideal (Producción)**: El backend debe setear la cookie con `HttpOnly=true`

**Nota**: Para seguridad completa, implementar en el backend:

```csharp
Response.Cookies.Append("token", jwtToken, new CookieOptions {
    HttpOnly = true,  // ← Esto previene acceso desde JS
    Secure = true,
    SameSite = SameSiteMode.Strict
});
```

### Test 4.2: CSRF - Petición Cross-Site

**Nota**: Este test es avanzado y requiere crear una página externa.

- [ ] Crear un archivo HTML externo con:

```html
<form action="http://localhost:3000/supervisor" method="GET">
  <button type="submit">Intentar acceso cross-site</button>
</form>
```

- [ ] Abrir el archivo en el navegador
- [ ] Hacer clic en el botón
- [ ] **Resultado Esperado**: La cookie NO se envía (bloqueada por `SameSite=Strict`)

### Test 4.3: Replay Attack - Reutilización de Token

- [ ] Iniciar sesión en el navegador A
- [ ] Copiar el valor de la cookie `token`
- [ ] Abrir el navegador B (o ventana de incógnito)
- [ ] Crear manualmente la cookie con el mismo valor
- [ ] Navegar a `/supervisor`
- [ ] **Resultado Esperado**: Acceso permitido (el token es válido)
- [ ] **Mitigación Futura**: Implementar binding de IP o device fingerprinting

---

## 🚪 Fase 5: Pruebas de Logout

### Test 5.1: Logout Manual (Si está implementado)

**Nota**: Actualmente la función `logout()` existe en `api.ts` pero no está conectada a la UI.

Para probar manualmente:

- [ ] Iniciar sesión
- [ ] Abrir la consola del navegador
- [ ] Ejecutar:

```javascript
import { logout } from "@/lib/api";
logout();
window.location.href = "/login";
```

- [ ] **Resultado Esperado**: Cookie borrada y redirección a login

### Test 5.2: Implementar Botón de Logout (Tarea Futura)

- [ ] Añadir botón "Cerrar Sesión" en el dashboard
- [ ] Al hacer clic, llamar a `logout()` y redirigir a `/login`

---

## 📊 Fase 6: Pruebas de Rendimiento

### Test 6.1: Tiempo de Validación del Middleware

- [ ] Abrir DevTools → Network
- [ ] Navegar a `/supervisor`
- [ ] Medir el tiempo de la petición a `/api/auth/verify`
- [ ] **Resultado Esperado**: < 100ms en red local
- [ ] **Límite Máximo**: 3000ms (timeout del middleware)

### Test 6.2: Carga Concurrente

- [ ] Abrir 10 pestañas del navegador
- [ ] En cada una, navegar a `/supervisor` simultáneamente
- [ ] **Resultado Esperado**: Todas las pestañas cargan correctamente sin errores

---

## 🐛 Troubleshooting

### Problema: "Redirección infinita entre /login y /supervisor"

**Diagnóstico**:

1. Verificar que el backend está corriendo
2. Verificar que el endpoint `/api/auth/verify` existe
3. Revisar la consola del navegador para errores

**Solución**:

```bash
# Verificar backend
curl http://localhost:5002/api/auth/verify -H "Authorization: Bearer <token>"
```

### Problema: "La cookie no se está guardando"

**Diagnóstico**:

1. Verificar en DevTools → Application → Cookies
2. Verificar que no hay errores en la consola

**Solución**:

- Si estás en HTTP, el flag `Secure` puede estar causando problemas
- Verificar que el dominio es correcto (localhost vs 127.0.0.1)

### Problema: "Error: validation_failed en cada navegación"

**Diagnóstico**:

1. El backend no está respondiendo correctamente
2. El token es inválido

**Solución**:

```bash
# Verificar logs del backend
# Verificar que el endpoint /api/auth/verify está implementado
```

---

## ✅ Resumen de Resultados

Completa esta tabla después de ejecutar todas las pruebas:

| Fase | Test                     | Estado | Notas |
| ---- | ------------------------ | ------ | ----- |
| 1.1  | Login Exitoso            | ⬜     |       |
| 1.2  | Login Fallido            | ⬜     |       |
| 1.3  | Persistencia de Sesión   | ⬜     |       |
| 2.1  | Acceso sin Autenticación | ⬜     |       |
| 2.2  | Callback URL             | ⬜     |       |
| 2.3  | Protección de Cookies    | ⬜     |       |
| 2.4  | Validación Activa        | ⬜     |       |
| 3.1  | Token Expirado           | ⬜     |       |
| 3.2  | Backend No Disponible    | ⬜     |       |
| 3.3  | Timeout del Middleware   | ⬜     |       |
| 4.1  | XSS                      | ⬜     |       |
| 4.2  | CSRF                     | ⬜     |       |
| 4.3  | Replay Attack            | ⬜     |       |
| 6.1  | Tiempo de Validación     | ⬜     |       |
| 6.2  | Carga Concurrente        | ⬜     |       |

**Leyenda**:

- ✅ = Pasó
- ❌ = Falló
- ⚠️ = Pasó con advertencias
- ⬜ = No probado

---

## 📝 Notas Finales

- **Prioridad Alta**: Tests de Fase 1 y Fase 2 (funcionalidad básica)
- **Prioridad Media**: Tests de Fase 3 (manejo de errores)
- **Prioridad Baja**: Tests de Fase 4 (seguridad avanzada)

**Próximos Pasos**:

1. Implementar el endpoint `/api/auth/verify` en el backend si no existe
2. Añadir botón de logout en la UI
3. Configurar cookies HttpOnly desde el backend
4. Implementar refresh tokens para sesiones largas
