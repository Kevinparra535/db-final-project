# ⚠️ COMPORTAMIENTO IMPORTANTE: Dependencia de PostgreSQL

## 🎯 Resumen Ejecutivo

**TODAS las 13 entidades del proyecto usan PostgreSQL.**
**NO hay datos mock - Si Docker se apaga, la API NO funcionará.**

---

## ✅ Estado Real del Proyecto

### Migración Completa a PostgreSQL

| Entidad | Estado | Motor |
|---------|--------|-------|
| Facultades | ✅ Migrado | PostgreSQL |
| Investigadores | ✅ Migrado | PostgreSQL |
| Profesores | ✅ Migrado | PostgreSQL |
| Estudiantes | ✅ Migrado | PostgreSQL |
| Grupos | ✅ Migrado | PostgreSQL |
| Líneas | ✅ Migrado | PostgreSQL |
| Convocatorias | ✅ Migrado | PostgreSQL |
| Proyectos | ✅ Migrado | PostgreSQL |
| Productos | ✅ Migrado | PostgreSQL |
| Tipos Producto | ✅ Migrado | PostgreSQL |
| Afiliaciones | ✅ Migrado | PostgreSQL |
| Autorías | ✅ Migrado | PostgreSQL |
| Users | ✅ Migrado | PostgreSQL |

**Total**: 13/13 entidades (100%)

---

## 🔍 Verificación del Código

### Todos los servicios importan Sequelize

```javascript
// Ejemplo: services/profesor.service.js
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize'); // ← PostgreSQL

class ProfesorService {
  async find() {
    return await models.Profesor.findAll(); // ← Query a PostgreSQL
  }
}
```

### NO hay generación de datos mock

```javascript
// ❌ NO existe en el proyecto actual
const { faker } = require('@faker-js/faker');
this.generate(); // Mock data
this.books = []; // Array en memoria

// ✅ Lo que SÍ existe
const { models } = require('../libs/sequelize');
await models.Entity.findAll(); // Query real a PostgreSQL
```

---

## 🐳 Comportamiento con Docker

### Escenario 1: Docker CORRIENDO ✅

```bash
# 1. Docker activo
docker ps
# CONTAINER ID   IMAGE         PORTS
# 6b749c7043d0   postgres:13   0.0.0.0:5432->5432/tcp

# 2. Iniciar servidor
npm run dev
# ✅ Conexión a PostgreSQL establecida correctamente
# Example app listening on port 3000!

# 3. Probar API
curl http://localhost:3000/api/v1/facultades
# ✅ Retorna datos desde PostgreSQL
```

### Escenario 2: Docker APAGADO ❌

```bash
# 1. Apagar Docker
docker stop db
# O: npm run docker:down

# 2. Intentar iniciar servidor
npm run dev
# ❌ ERROR: No se pudo conectar a PostgreSQL:
#    Mensaje: connect ECONNREFUSED 127.0.0.1:5432
#
# ⚠️  SOLUCIÓN:
#    1. Verifica que Docker esté corriendo: docker ps
#    2. Inicia PostgreSQL con: npm run docker:up
#    3. Espera 10 segundos y vuelve a intentar: npm run dev

# El servidor NO inicia - proceso termina con exit code 1
```

### Escenario 3: Apagar Docker CON servidor corriendo 🔥

```bash
# 1. Docker y servidor corriendo
docker ps          # ✅ PostgreSQL activo
curl http://localhost:3000/api/v1/facultades  # ✅ Funciona

# 2. Apagar Docker mientras servidor corre
docker stop db

# 3. Intentar usar la API
curl http://localhost:3000/api/v1/facultades
# ❌ Retorna error 500:
# {
#   "statusCode": 500,
#   "error": "Internal Server Error",
#   "message": "Error al obtener facultades"
# }

# Los logs del servidor mostrarán:
# Error: Connection terminated unexpectedly
# o: connect ECONNREFUSED 127.0.0.1:5432
```

---

## 🔧 Healthcheck Implementado

### Verificación al Inicio (libs/sequelize.js)

```javascript
async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('❌ ERROR: No se pudo conectar a PostgreSQL:');
    console.error('   Mensaje:', error.message);
    console.error('');
    console.error('⚠️  SOLUCIÓN:');
    console.error('   1. Verifica que Docker esté corriendo: docker ps');
    console.error('   2. Inicia PostgreSQL con: npm run docker:up');
    console.error('   3. Espera 10 segundos y vuelve a intentar: npm run dev');
    console.error('');
    process.exit(1); // Terminar la aplicación
  }
}

checkDatabaseConnection(); // Se ejecuta al importar el módulo
```

### Comportamiento

- **Si PostgreSQL NO está disponible**: La app termina inmediatamente con mensaje claro
- **Si PostgreSQL está disponible**: La app inicia normalmente
- **Si PostgreSQL se cae después**: Las queries fallan con error 500

---

## 📊 Flujo de Datos Completo

```
Cliente HTTP Request
    ↓
Express Router (routes/investigadores.router.js)
    ↓
Validation Middleware (Joi schemas)
    ↓
Service Layer (services/investigador.service.js)
    ↓
Sequelize ORM (models/investigador.model.js)
    ↓
PostgreSQL Database (Docker container)
    ↓
PostgreSQL retorna datos
    ↓
Sequelize mapea a objetos
    ↓
Service retorna al router
    ↓
Router envía JSON response
```

**⚠️ Si cualquier parte de esta cadena falla, la API retorna error 500.**

---

## 🧪 Pruebas de Verificación

### Test 1: Verificar dependencia de PostgreSQL

```bash
# 1. Apagar Docker completamente
docker stop $(docker ps -aq)

# 2. Intentar iniciar servidor
npm run dev

# Resultado esperado:
# ❌ ERROR: No se pudo conectar a PostgreSQL
# ❌ Process exits with code 1

# 3. Iniciar Docker
npm run docker:up

# 4. Intentar nuevamente
npm run dev

# Resultado esperado:
# ✅ Conexión a PostgreSQL establecida correctamente
# ✅ Example app listening on port 3000!
```

### Test 2: Verificar que NO hay cache de datos

```bash
# 1. Con todo funcionando, obtener datos
curl http://localhost:3000/api/v1/facultades
# ✅ Retorna datos

# 2. Apagar Docker
docker stop db

# 3. Intentar obtener datos nuevamente
curl http://localhost:3000/api/v1/facultades
# ❌ Error 500 (si servidor sigue corriendo)
# ❌ Connection refused (si servidor se reinició)

# Conclusión: NO hay cache - todos los datos vienen de PostgreSQL
```

---

## 📝 Correcciones en Documentación

### Antes (INCORRECTO ❌)

```markdown
### Entidades en PostgreSQL ✅
- Facultades
- Investigadores

### Entidades con Mock Data 🔄
- Profesores (Planificada migración)
- Estudiantes (Planificada migración)
- ...11 más
```

### Ahora (CORRECTO ✅)

```markdown
### ✅ TODAS las Entidades en PostgreSQL
- Facultades ✅
- Investigadores ✅
- Profesores ✅
- Estudiantes ✅
- Grupos ✅
- ...13 entidades en total

⚠️ IMPORTANTE: NO hay datos mock
Si Docker se apaga, la API NO funcionará
```

---

## 🎓 Conclusión

### Lo que debes saber:

1. ✅ **Todas las 13 entidades están en PostgreSQL** (migración 100% completa)
2. ❌ **NO existe mock data** en el proyecto actual
3. 🐳 **PostgreSQL es OBLIGATORIO** - la app no funciona sin Docker
4. ⚡ **Healthcheck implementado** - falla rápido si PostgreSQL no está disponible
5. 📊 **Todos los datos son persistentes** - se guardan en disco (carpeta `postgres_data/`)

### Archivos corregidos:

- ✅ `docs/04-postman.md` - Estado de migración actualizado
- ✅ `libs/sequelize.js` - Healthcheck agregado
- ✅ `.github/copilot-instructions.md` - Documentación actualizada
- ✅ Este archivo - Comportamiento claramente explicado

---

**Fecha de corrección**: Octubre 31, 2025
**Revisado por**: Kevin Parra (basado en hallazgo correcto del evaluador)
