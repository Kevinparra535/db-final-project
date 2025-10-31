# 📋 Scripts NPM - Referencia Completa

[⬅️ Volver al Índice](./README.md)

Esta es la referencia completa de todos los scripts npm disponibles en el proyecto.

---

## 🚀 Scripts de Desarrollo

### `npm run dev`
Inicia el servidor en modo desarrollo con **auto-reload**.

```bash
npm run dev
```

- **Usa:** nodemon para reiniciar automáticamente en cambios
- **Puerto:** 3000 (configurable en `.env`)
- **Output:** `Example app listening on port 3000!`
- **Detener:** Ctrl+C

**Cuándo usar:** Durante desarrollo activo

---

### `npm start`
Inicia el servidor en modo producción.

```bash
npm start
```

- **Usa:** node directo (sin auto-reload)
- **Puerto:** 3000 (configurable en `.env`)
- **Output:** `Example app listening on port 3000!`

**Cuándo usar:** En producción o para pruebas finales

---

### `npm run lint`
Ejecuta ESLint para verificar calidad de código.

```bash
npm run lint
```

**Cuándo usar:** Antes de hacer commit

---

## 🐳 Scripts de Docker

### `npm run docker:up`
Inicia los contenedores de PostgreSQL y pgAdmin.

```bash
npm run docker:up
```

- **Inicia:**
  - PostgreSQL en puerto 5432
  - pgAdmin en puerto 5050
- **Modo:** Detached (background)
- **Tiempo:** 10-30 segundos

**Cuándo usar:** Antes de iniciar el servidor por primera vez en el día

---

### `npm run docker:down`
Detiene los contenedores Docker **manteniendo los datos**.

```bash
npm run docker:down
```

- **Detiene:** PostgreSQL y pgAdmin
- **Conserva:** Datos en `postgres_data/`
- **No elimina:** Volúmenes

**Cuándo usar:** Al terminar de trabajar

---

### `npm run docker:logs`
Muestra los logs de PostgreSQL en tiempo real.

```bash
npm run docker:logs
```

- **Salir:** Ctrl+C
- **Usa:** `docker-compose logs -f postgres`

**Cuándo usar:** Para depurar problemas de conexión

---

### `npm run docker:reset`
**⚠️ DESTRUCTIVO** - Elimina todo y reinicia desde cero.

```bash
npm run docker:reset
```

- **Elimina:**
  - Contenedores
  - Volúmenes
  - Carpeta `postgres_data/`
- **Inicia:** Contenedores limpios
- **Resultado:** Base de datos vacía

**Cuándo usar:** Solo si necesitas empezar desde cero

**Después debes ejecutar:**
```bash
npm run db:setup
```

---

## 🗄️ Scripts de Base de Datos

### `npm run db:setup`
**Setup completo automático** - Crear + Migrar + Poblar.

```bash
npm run db:setup
```

- **Ejecuta:**
  1. `db:create` - Crea la base de datos
  2. `db:migrate` - Ejecuta migraciones
  3. `db:seed` - Puebla con datos de ejemplo
- **Tiempo:** 30-60 segundos
- **Idempotente:** Seguro ejecutar múltiples veces

**Cuándo usar:** Primera vez o después de `docker:reset`

---

### `npm run db:create`
Crea la base de datos `academic_db` si no existe.

```bash
npm run db:create
```

- **Usa:** Script `scripts/create-database.js`
- **Safe:** No falla si ya existe

**Cuándo usar:** Setup inicial o manual

---

### `npm run db:migrate`
Ejecuta las migraciones pendientes.

```bash
npm run db:migrate
```

- **Usa:** Sequelize CLI
- **Crea:** Tablas, ENUMs, constraints, índices
- **Archivos:** `db/migrations/*.js`
- **Orden:** Por timestamp en nombre de archivo

**Cuándo usar:** Después de crear la BD o agregar migraciones

---

### `npm run db:migrate:undo`
Deshace la **última** migración ejecutada.

```bash
npm run db:migrate:undo
```

**Cuándo usar:** Si hay error en última migración

---

### `npm run db:migrate:undo:all`
**⚠️ DESTRUCTIVO** - Deshace **todas** las migraciones.

```bash
npm run db:migrate:undo:all
```

- **Elimina:** Todas las tablas
- **Conserva:** La base de datos

**Cuándo usar:** Para rehacer todo el esquema

**Después debes ejecutar:**
```bash
npm run db:migrate
npm run db:seed
```

---

### `npm run db:seed`
Puebla la base de datos con datos de ejemplo.

```bash
npm run db:seed
```

- **Usa:** `db/seeders/seed-database.js`
- **Crea:**
  - 5 Facultades
  - 10 Investigadores
  - 5 Profesores
  - 5 Estudiantes
  - 8 Grupos
  - 6 Líneas
  - 3 Convocatorias
  - 5 Proyectos
  - 8 Productos
  - 15 Afiliaciones
  - 12 Autorías

**Cuándo usar:** Después de migrar o para repoblar datos

---

### `npm run db:reset`
**Reset completo de base de datos** - Undo + Migrate + Seed.

```bash
npm run db:reset
```

- **Ejecuta:**
  1. `db:migrate:undo:all` - Elimina todas las tablas
  2. `db:migrate` - Recrea las tablas
  3. `db:seed` - Puebla con datos

**Cuándo usar:** Para empezar con datos frescos sin tocar Docker

---

### `npm run db:tables`
Lista todas las tablas en la base de datos.

```bash
npm run db:tables
```

- **Usa:** Script `scripts/check-tables.js`
- **Output:** Lista de nombres de tablas

**Cuándo usar:** Para verificar que migraciones funcionaron

---

## ✅ Scripts de Verificación

### `npm run system:verify`
**Verificación completa del sistema** - Docker + DB + API.

```bash
npm run system:verify
```

- **Verifica:**
  - ✓ Configuración (.env y docker-compose.yml)
  - ✓ Docker corriendo
  - ✓ PostgreSQL accesible
  - ✓ Base de datos existe
  - ✓ Tablas creadas
  - ✓ API respondiendo
  - ✓ Datos cargados
- **Usa:** Script `scripts/verify-system.js`
- **Output:** Checklist con ✓ o ✗

**Cuándo usar:** Después de setup o para diagnosticar problemas

---

### `npm run config:verify`
Verifica consistencia entre `.env` y `docker-compose.yml`.

```bash
npm run config:verify
```

- **Verifica:**
  - Credenciales de BD coinciden
  - Puertos coinciden
  - Nombres de BD coinciden
- **Usa:** Script `scripts/verify-config.js`

**Cuándo usar:** Si hay problemas de conexión

---

### `npm run db:check`
Verifica entorno y conexión a PostgreSQL.

```bash
npm run db:check
```

- **Verifica:**
  - Variables de entorno
  - Conexión a PostgreSQL
  - Permisos
- **Usa:** Script `scripts/check-environment.js`

**Cuándo usar:** Para depurar conexiones

---

## 🐘 Scripts de pgAdmin

### `npm run pgadmin`
Abre pgAdmin en el navegador con credenciales automáticas.

```bash
npm run pgadmin
```

- **Abre:** http://localhost:5050
- **Muestra:**
  - Credenciales de login
  - Credenciales de conexión PostgreSQL
- **Usa:** Script `scripts/open-pgadmin.js`

**Cuándo usar:** Para administrar la BD visualmente

---

## 🔧 Scripts de Migraciones (Sequelize CLI)

### `npm run migrations:generate`
Genera un nuevo archivo de migración.

```bash
npm run migrations:generate -- --name nombre-de-migracion
```

**Ejemplo:**
```bash
npm run migrations:generate -- --name add-user-roles
```

**Cuándo usar:** Para crear nuevas migraciones

---

### `npm run migrations:run`
Alias de `db:migrate`.

```bash
npm run migrations:run
```

---

### `npm run migrations:revert`
Alias de `db:migrate:undo`.

```bash
npm run migrations:revert
```

---

### `npm run migrations:delete`
Alias de `db:migrate:undo:all`.

```bash
npm run migrations:delete
```

---

## 🎯 Flujos de Trabajo Comunes

### Inicio del Día
```bash
npm run docker:up     # Iniciar PostgreSQL
npm run dev           # Iniciar servidor
```

### Primera Vez / Setup Inicial
```bash
npm install           # Instalar dependencias
npm run docker:up     # Iniciar Docker
npm run db:setup      # Setup BD completo
npm run dev           # Iniciar servidor
npm run system:verify # Verificar todo
```

### Resetear Base de Datos (Mantener Docker)
```bash
npm run db:reset      # Undo + Migrate + Seed
```

### Resetear Todo (Desde Cero)
```bash
npm run docker:reset  # Resetear Docker + BD
npm run db:setup      # Setup BD completo
```

### Fin del Día
```bash
# Ctrl+C en terminal del servidor
npm run docker:down   # Detener Docker
```

### Verificar que Todo Funciona
```bash
npm run system:verify
```

### Depurar Problemas
```bash
npm run docker:logs   # Ver logs PostgreSQL
npm run config:verify # Verificar configuración
npm run db:tables     # Ver tablas creadas
```

---

## 📊 Resumen de Scripts por Categoría

### Esenciales (Uso Diario)
```bash
npm run docker:up     # Iniciar PostgreSQL
npm run dev           # Servidor desarrollo
npm run docker:down   # Detener PostgreSQL
```

### Setup/Reset
```bash
npm run db:setup      # Setup automático completo
npm run db:reset      # Reset BD (mantiene Docker)
npm run docker:reset  # Reset todo (Docker + BD)
```

### Verificación
```bash
npm run system:verify # Verificación completa
npm run config:verify # Verificar configuración
npm run db:tables     # Listar tablas
```

### Base de Datos Manual
```bash
npm run db:create     # Crear BD
npm run db:migrate    # Ejecutar migraciones
npm run db:seed       # Poblar datos
```

### Herramientas
```bash
npm run pgadmin       # Abrir pgAdmin
npm run docker:logs   # Ver logs
npm run lint          # Verificar código
```

---

## ⚠️ Scripts Destructivos (Usar con Cuidado)

Estos scripts **eliminan datos**:

| Script | Qué Elimina | Recuperable |
|--------|-------------|-------------|
| `npm run db:reset` | Datos de BD | No (requiere seed) |
| `npm run db:migrate:undo:all` | Todas las tablas | No (requiere migrate + seed) |
| `npm run docker:reset` | Contenedores + volúmenes + datos | No (requiere setup completo) |

**Regla de Oro:** Siempre ejecuta `npm run system:verify` después de scripts destructivos.

---

[⬅️ Volver al Índice](./README.md)
