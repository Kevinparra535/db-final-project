# 🚀 Flujo Completo de Inicialización del Proyecto

## ✅ Estado Final del Proyecto

Este documento describe el flujo completo para inicializar el proyecto desde cero, incluyendo la base de datos PostgreSQL con Docker.

## 📋 Prerequisitos

- Docker y Docker Compose instalados
- Node.js 16+ instalado
- npm instalado

## 🔧 Arquitectura de Configuración

### Archivos de Configuración

1. **`.env`** - Variables de entorno de la aplicación
   ```env
   PORT=3000
   DB_USER=kevin
   DB_PASSWORD=admin123
   DB_HOST=localhost
   DB_NAME=academic_db
   DB_PORT=5432
   ```

2. **`docker-compose.yml`** - Configuración de servicios Docker
   - PostgreSQL 13 (contenedor: `db`)
   - pgAdmin (puerto: 5050)
   - MySQL (puerto: 3306)
   - phpMyAdmin (puerto: 8080)

### Credenciales Verificadas

Todas las credenciales están sincronizadas entre `.env` y `docker-compose.yml`:
- **Base de datos**: `academic_db`
- **Usuario**: `kevin`
- **Contraseña**: `admin123`
- **Host**: `localhost`
- **Puerto**: `5432`

## 🎯 Scripts Disponibles

### Scripts de Docker

```bash
# Iniciar todos los servicios Docker
npm run docker:up

# Detener todos los servicios Docker
npm run docker:down

# Ver logs de los contenedores
npm run docker:logs

# Reiniciar completamente Docker (elimina volúmenes)
npm run docker:reset
```

### Scripts de Base de Datos

```bash
# Crear la base de datos (solo creación, sin migrar)
npm run db:create

# Ejecutar migraciones
npm run db:migrate

# Deshacer última migración
npm run db:migrate:undo

# Poblar base de datos con datos de prueba
npm run db:seed

# Setup completo: crear + migrar + poblar
npm run db:setup

# Reset completo: eliminar + crear + migrar + poblar
npm run db:reset
```

### Scripts de Verificación

```bash
# Verificar consistencia de configuración (.env vs docker-compose.yml)
npm run config:verify

# Verificación completa del sistema (config + docker + db + api)
npm run system:verify
```

### Scripts de Desarrollo

```bash
# Iniciar servidor en modo desarrollo (con nodemon)
npm run dev

# Iniciar servidor en producción
npm start

# Setup completo incluyendo Docker
npm run setup
```

## 🚀 Flujo de Inicialización Desde Cero

### Opción 1: Inicialización Rápida (Recomendada)

```bash
# 1. Clonar el repositorio (si aplica)
git clone <repo-url>
cd data-final

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de ejemplo de variables de entorno
cp .env.example .env

# 4. Setup completo (inicia Docker + crea DB + migra + pobla)
npm run setup

# 5. Iniciar servidor
npm run dev
```

### Opción 2: Inicialización Paso a Paso

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# 3. Iniciar servicios Docker
npm run docker:up

# 4. Esperar que PostgreSQL esté listo (10-15 segundos)
sleep 15

# 5. Crear base de datos
npm run db:create

# 6. Ejecutar migraciones
npm run db:migrate

# 7. Poblar con datos de prueba
npm run db:seed

# 8. Verificar que todo esté correcto
npm run system:verify

# 9. Iniciar servidor
npm run dev
```

## 🔍 Verificación del Sistema

### Verificación Manual

```bash
# 1. Verificar que Docker esté corriendo
docker-compose ps

# 2. Verificar que PostgreSQL esté accesible
docker exec db psql -U kevin -d postgres -c "\l"

# 3. Verificar que la base de datos existe
docker exec db psql -U kevin -d academic_db -c "\dt"

# 4. Verificar la API (debe estar corriendo el servidor)
curl http://localhost:3000/api/v1/facultades
```

### Verificación Automática

```bash
# Ejecutar script de verificación completa
npm run system:verify
```

**Salida esperada:**
```
✅ 1. VERIFICANDO CONFIGURACIÓN
✅ 2. VERIFICANDO DOCKER
✅ 3. VERIFICANDO CONEXIÓN A POSTGRESQL
✅ 4. VERIFICANDO BASE DE DATOS
✅ 5. VERIFICANDO API

✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE
🚀 Sistema listo para trabajar!
```

## 📊 Estructura de la Base de Datos

### Tablas Creadas (15 tablas)

1. **facultad** - Facultades de la universidad
2. **investigador** - Investigadores
3. **investigador_correo** - Emails de investigadores (multivaluado)
4. **investigador_telefono** - Teléfonos de investigadores (multivaluado)
5. **profesor** - Profesores
6. **profesor_correo** - Emails de profesores (multivaluado)
7. **estudiante** - Estudiantes de posgrado
8. **linea_investigacion** - Líneas de investigación
9. **grupo_investigacion** - Grupos de investigación
10. **convocatoria** - Convocatorias de investigación
11. **proyecto_investigacion** - Proyectos de investigación
12. **producto_investigacion** - Productos de investigación
13. **producto_tipo** - Tipos de productos
14. **afiliacion** - Relación investigador-grupo
15. **autoria** - Relación investigador-producto

### Tablas de Relación (2 tablas)

1. **proyecto_linea** - Relación muchos a muchos proyecto-línea
2. **grupo_linea** - Relación muchos a muchos grupo-línea

### Datos de Prueba Incluidos

- **3 facultades**: Ingeniería, Ciencias, Medicina
- **3 investigadores** con emails y teléfonos
- **2 profesores** con emails
- **2 estudiantes** de posgrado
- **2 grupos de investigación**
- **4 líneas de investigación**
- **3 tipos de producto**
- **1 convocatoria**

## 🛠️ Scripts de Automatización

### `scripts/create-database.js`
Crea la base de datos PostgreSQL si no existe.

**Uso:**
```bash
npm run db:create
```

### `scripts/setup-project.js`
Orquesta el setup completo del proyecto.

**Flujo:**
1. Crea la base de datos
2. Ejecuta migraciones
3. Puebla con datos de prueba

**Uso:**
```bash
npm run db:setup
```

### `scripts/reset-database.js`
Elimina y recrea completamente la base de datos.

**Uso:**
```bash
npm run db:reset
```

### `scripts/check-environment.js`
Verifica que Docker y PostgreSQL estén corriendo.

**Uso:**
```bash
node scripts/check-environment.js
```

### `scripts/verify-config.js`
Verifica consistencia entre `.env` y `docker-compose.yml`.

**Uso:**
```bash
npm run config:verify
```

### `scripts/verify-system.js`
Verificación completa del sistema (5 pasos).

**Uso:**
```bash
npm run system:verify
```

## 🐛 Solución de Problemas

### Problema: Base de datos no existe

**Error:**
```
FATAL: database "academic_db" does not exist
```

**Solución:**
```bash
npm run db:create
npm run db:migrate
npm run db:seed
```

### Problema: Contenedor PostgreSQL no está corriendo

**Error:**
```
Error: No se encontró contenedor PostgreSQL
```

**Solución:**
```bash
npm run docker:up
sleep 15
npm run system:verify
```

### Problema: Credenciales no coinciden

**Error:**
```
❌ DB_NAME no coincide
```

**Solución:**
1. Editar `.env` para que coincida con `docker-compose.yml`
2. O editar `docker-compose.yml` para que coincida con `.env`
3. Ejecutar `npm run config:verify` para confirmar

### Problema: Puerto 5432 en uso

**Error:**
```
Error: Port 5432 is already in use
```

**Solución:**
```bash
# Opción 1: Detener PostgreSQL local
sudo service postgresql stop

# Opción 2: Cambiar puerto en docker-compose.yml
# Editar: ports: ["5433:5432"]
# Y en .env: DB_PORT=5433
```

### Problema: Migraciones ya ejecutadas

**Error:**
```
== 20251031050000-create-core-entities: migrated
```

**Solución:**
```bash
# Si quieres empezar de cero
npm run db:reset
```

## 📝 Notas Importantes

1. **Docker Centralizado**: Todo usa Docker Compose, no PostgreSQL local
2. **Consistencia de Credenciales**: Verificada automáticamente
3. **Datos de Prueba**: Siempre se insertan con `ON CONFLICT DO NOTHING`
4. **Timestamps**: Todas las tablas tienen `created_at` y `updated_at`
5. **ENUMs**: PostgreSQL ENUMs nativos para campos categóricos
6. **Índices**: 11 índices creados para optimizar búsquedas

## 🎯 Endpoints de API Disponibles

### Facultades
- `GET /api/v1/facultades` - Listar todas
- `GET /api/v1/facultades/:id` - Obtener una
- `POST /api/v1/facultades` - Crear
- `PATCH /api/v1/facultades/:id` - Actualizar
- `DELETE /api/v1/facultades/:id` - Eliminar

### Investigadores
- `GET /api/v1/investigadores` - Listar todos
- `GET /api/v1/investigadores/:id` - Obtener uno
- `POST /api/v1/investigadores` - Crear
- `PATCH /api/v1/investigadores/:id` - Actualizar
- `DELETE /api/v1/investigadores/:id` - Eliminar

(Y así para todas las demás entidades...)

## 🔐 Acceso a pgAdmin

Si necesitas acceder a la interfaz gráfica de PostgreSQL:

1. Abrir navegador: `http://localhost:5050`
2. Login:
   - Email: `admin@admin.com`
   - Password: `admin`
3. Agregar servidor:
   - Host: `db`
   - Port: `5432`
   - Username: `kevin`
   - Password: `admin123`

## ✅ Checklist de Inicialización

- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Docker corriendo (`npm run docker:up`)
- [ ] Base de datos creada (`npm run db:create`)
- [ ] Migraciones ejecutadas (`npm run db:migrate`)
- [ ] Datos de prueba insertados (`npm run db:seed`)
- [ ] Sistema verificado (`npm run system:verify`)
- [ ] Servidor corriendo (`npm run dev`)
- [ ] API respondiendo correctamente

## 🎉 Conclusión

El proyecto está configurado para inicialización completa desde cero con un solo comando:

```bash
npm run setup && npm run dev
```

O verificar todo con:

```bash
npm run system:verify
```

¡Happy coding! 🚀
