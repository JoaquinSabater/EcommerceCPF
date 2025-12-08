# 🔒 Reporte de Seguridad - Diciembre 6, 2025

## 🚨 PROBLEMA DETECTADO
**Atacantes entrando desde el carrito ejecutando scripts de cryptomining en el servidor**

### Vectores de Ataque Encontrados:
1. ✅ **APIs sin autenticación** - Cualquiera podía crear pedidos, subir archivos, modificar productos
2. ✅ **Middleware permisivo** - Permitía TODO `/api/*` sin verificación
3. ✅ **API de Chat abierta** - Permitía ejecutar llamadas externas arbitrarias
4. ✅ **Sin validación de tokens** - Tokens de prospecto no se validaban contra BD
5. ✅ **Sin sanitización de inputs** - Vulnerable a SQL injection

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. Sistema de Autenticación JWT (`src/lib/auth.ts`)
```typescript
✅ verifyAuth() - Verificar token JWT y cookies
✅ requireAuth() - Middleware para proteger rutas de usuario
✅ requireAdmin() - Middleware para proteger rutas de admin
✅ sanitizeInput() - Prevenir SQL injection
✅ validateId() - Validar IDs numéricos
✅ isAdmin() / isDistribuidor() - Verificar permisos
```

### 2. APIs Protegidas (18 endpoints)

#### 🔐 Autenticación de Usuario Requerida:
- `/api/pedidos-preliminares` - Valida que clienteId = usuario autenticado
- `/api/pedidos-prospecto` - Valida token de prospecto desde cookies

#### 🛡️ Solo Administradores:
- `/api/actualizar` - Actualizar productos
- `/api/upload-image` - Subir imágenes (previene shell upload)
- `/api/admin/items/toggle` - Cambiar disponibilidad
- `/api/prospecto-to-cliente` - Convertir prospectos
- `/api/home-carousel` (POST/PUT/DELETE)
- `/api/cards-informativas` (POST/PUT/DELETE)
- `/api/categorias-home` (POST/PUT/DELETE)
- `/api/info-card-special` (POST/PUT/DELETE)
- `/api/recomendaciones` (POST)

#### 🚫 APIs Bloqueadas:
- `/api/chat` - **DESHABILITADA** - Permitía ejecutar código externo sin auth

### 3. Middleware Reforzado (`middleware.ts`)

**ANTES:**
```typescript
// ❌ VULNERABLE - Permitía TODO /api/*
if (pathname.startsWith('/api')) {
  return NextResponse.next();
}
```

**AHORA:**
```typescript
// ✅ SEGURO - Lista blanca de APIs públicas (solo GET)
const publicReadAPIs = [
  '/api/dolar',
  '/api/detalle',
  '/api/precio',
  '/api/search',
  // ... solo lectura
];

// 🚨 Bloquear todo lo demás que no esté autenticado
if (isWriteOperation && !hasAuth) {
  return 401 Unauthorized;
}
```

### 4. Logs de Seguridad
Todos los intentos de acceso no autorizado se registran con:
- IP del atacante
- User-Agent
- URL solicitada
- Usuario que intentó la acción

---

## 🎯 ACCIONES INMEDIATAS REQUERIDAS

### En el Servidor:
```bash
# 1. Detectar procesos de cryptomining
top -b -n 1 | head -20
ps aux | grep -E 'xmrig|minerd|cpuminer|cryptonight'

# 2. Matar procesos maliciosos
kill -9 [PID]

# 3. Eliminar archivos maliciosos
rm -rf ~/carrito  # Carpeta creada por atacantes
find /tmp -name "*.sh" -mtime -7 -delete
find /var/tmp -name "*.sh" -mtime -7 -delete

# 4. Revisar crontab
crontab -l  # Ver tareas programadas
crontab -r  # Eliminar si hay scripts maliciosos

# 5. Revisar logs de acceso
tail -100 /var/log/nginx/access.log  # o apache
grep "POST /api" /var/log/nginx/access.log | tail -50

# 6. Cambiar credenciales
# - Cambiar passwords de BD
# - Rotar JWT_SECRET en .env
# - Cambiar API keys de Cloudinary
```

### En la Aplicación:
```bash
# 1. Instalar dependencias (si falta jwt)
pnpm install jsonwebtoken
pnpm install --save-dev @types/jsonwebtoken

# 2. Configurar variables de entorno (.env)
JWT_SECRET=tu-secret-key-super-segura-cambiar-esto

# 3. Reiniciar aplicación
pnpm run build
pm2 restart ecommerce  # o el nombre de tu proceso
```

---

## 📊 COMPARATIVA ANTES/DESPUÉS

| Endpoint | ANTES | AHORA |
|----------|-------|-------|
| `/api/pedidos-preliminares` | ❌ Abierto | ✅ requireAuth() + validación clienteId |
| `/api/pedidos-prospecto` | ❌ Sin validar token | ✅ Valida token en BD |
| `/api/upload-image` | ❌ Cualquiera sube | ✅ Solo admin |
| `/api/actualizar` | ❌ Cualquiera modifica | ✅ Solo admin |
| `/api/chat` | ❌ Ejecuta código externo | 🚫 BLOQUEADA |
| `/api/admin/*` | ❌ Sin protección | ✅ requireAdmin() |
| Middleware | ❌ Permite todo /api/* | ✅ Lista blanca estricta |

---

## 🔍 MONITOREO CONTINUO

### Revisar diariamente:
```bash
# CPU usage (detectar mining)
top -b -n 1 | head -5

# Procesos sospechosos
ps aux | grep -v grep | grep -E 'tmp|dev/shm|var/tmp'

# Intentos de acceso no autorizados
grep "🚨 INTENTO DE ACCESO" logs/application.log | tail -20
```

### Alertas a implementar:
- [ ] Notificación por email si CPU > 80%
- [ ] Alert si se detecta proceso con nombre sospechoso
- [ ] Logs de todos los POST a /api/* sin auth
- [ ] Rate limiting (máximo 100 requests por IP por minuto)

---

## ✅ CHECKLIST DE SEGURIDAD

- [x] Sistema de autenticación JWT creado
- [x] APIs críticas protegidas con requireAuth/requireAdmin
- [x] Middleware con lista blanca estricta
- [x] API de chat bloqueada
- [x] Validación de tokens de prospecto
- [x] Sanitización de inputs
- [x] Logs de intentos no autorizados
- [ ] Rate limiting implementado
- [ ] Auditoría del servidor ejecutada
- [ ] Procesos maliciosos eliminados
- [ ] Credenciales rotadas
- [ ] Monitoreo automático configurado

---

## 📝 NOTAS FINALES

**El servidor está AHORA protegido a nivel de código**, pero es CRÍTICO:
1. Eliminar los procesos/archivos maliciosos actuales del servidor
2. Rotar todas las credenciales (JWT_SECRET, DB passwords, API keys)
3. Configurar monitoreo continuo
4. Implementar rate limiting para prevenir ataques de fuerza bruta

**Fecha de implementación:** 6 de diciembre, 2025  
**Estado:** ✅ Código asegurado - ⚠️ Servidor requiere limpieza manual
