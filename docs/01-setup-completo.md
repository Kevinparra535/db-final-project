# 🔧 Setup Completo del Proyecto

[⬅️ Volver al Índice](./README.md)

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Instalación Paso a Paso](#instalación-paso-a-paso)
3. [Configuración de Docker](#configuración-de-docker)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Setup de Base de Datos](#setup-de-base-de-datos)
6. [Verificación de Instalación](#verificación-de-instalación)

---

## Prerequisitos

### Software Requerido

| Software | Versión Mínima | Link de Descarga |
|----------|----------------|------------------|
| Node.js | 16.x o superior | https://nodejs.org/ |
| npm | 8.x o superior | Viene con Node.js |
| Docker Desktop | Última versión | https://www.docker.com/products/docker-desktop |
| Git | Cualquiera | https://git-scm.com/ |

### Verificar Instalaciones

```bash
# Verificar Node.js
node --version  # Debe mostrar v16.x.x o superior

# Verificar npm
npm --version   # Debe mostrar 8.x.x o superior

# Verificar Docker
docker --version        # Debe mostrar Docker version 20.x.x o superior
docker-compose --version # Debe mostrar version 1.29.x o superior

# Verificar Git
git --version   # Cualquier versión reciente
```

---

## Instalación Paso a Paso

### 1. Obtener el Código

**Opción A: Clonar desde GitHub**
```bash
git clone https://github.com/Kevinparra535/db-final-project.git
cd db-final-project
```

**Opción B: Desde archivo ZIP**
```bash
# Descomprimir el archivo
unzip data-final.zip
cd data-final
```

### 2. Instalar Dependencias de Node.js

```bash
# Instalar todas las dependencias del proyecto
npm install

# Verificar instalación
npm list --depth=0
```

**Dependencias Principales que se Instalan:**
- Express.js 5.1.0 - Framework web
- Sequelize 6.37.7 - ORM para PostgreSQL
- Joi 18.0.1 - Validación de esquemas
- @hapi/boom 10.0.1 - Manejo de errores HTTP
- pg 8.16.3 - Driver de PostgreSQL
- dotenv 17.2.3 - Variables de entorno

**Tiempo estimado**: 2-3 minutos

---

## Configuración de Docker

### 1. Iniciar Docker Desktop

- **Windows/Mac**: Abre la aplicación Docker Desktop
- **Linux**: Asegúrate que el servicio Docker esté corriendo

```bash
# Verificar que Docker está corriendo
docker ps
```

Si ves una tabla vacía, Docker está funcionando correctamente.

### 2. Arquitectura de Servicios Docker

El proyecto usa `docker-compose.yml` con los siguientes servicios:

```yaml
services:
  postgres:       # Base de datos PostgreSQL 13
    - Puerto: 5432
    - Usuario: kevin
    - Password: admin123
    - Base de datos: academic_db
    
  pgadmin:        # Interfaz web para administrar PostgreSQL
    - Puerto: 5050
    - Email: admin@mail.com
    - Password: root
```

### 3. Iniciar Servicios Docker

```bash
# Iniciar PostgreSQL y pgAdmin
npm run docker:up

# Ver logs para verificar que todo está bien
npm run docker:logs
```

**✅ Deberías ver:**
```
postgres | database system is ready to accept connections
pgadmin  | Starting pgAdmin 4...
```

**⏱️ Tiempo de inicio**: 10-30 segundos

### 4. Verificar que los Contenedores Están Corriendo

```bash
# Ver contenedores activos
docker ps

# Deberías ver algo como:
# CONTAINER ID   IMAGE            PORTS                    NAMES
# abc123...      postgres:13      0.0.0.0:5432->5432/tcp   db
# def456...      dpage/pgadmin4   0.0.0.0:5050->80/tcp     pgadmin
```

---

## Configuración de Variables de Entorno

### 1. Crear Archivo .env

El proyecto incluye `.env.example` como plantilla:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### 2. Contenido del Archivo .env

```env
# Puerto del servidor Express
PORT=3000

# Configuración de PostgreSQL
DB_USER=kevin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_NAME=academic_db
DB_PORT=5432
```

### 3. Verificar Consistencia de Configuración

```bash
# Ejecutar script de verificación
npm run config:verify
```

**✅ Debería mostrar:**
```
✓ .env existe y está configurado
✓ docker-compose.yml existe y está configurado
✓ Todas las credenciales coinciden
```

### ⚠️ Importante: No Cambiar Credenciales

Las credenciales están sincronizadas entre:
- `.env` (aplicación Node.js)
- `docker-compose.yml` (contenedores Docker)
- Scripts de configuración

Si necesitas cambiarlas, debes hacerlo en AMBOS archivos.

---

## Setup de Base de Datos

### Opción A: Setup Automático Completo (Recomendado)

```bash
# Un solo comando: Crear DB + Migrar + Poblar
npm run db:setup
```

Este comando ejecuta:
1. Crea la base de datos `academic_db` si no existe
2. Ejecuta las 3 migraciones (tablas, ENUMs, constraints)
3. Puebla con datos académicos de ejemplo

**⏱️ Tiempo**: 30-60 segundos

### Opción B: Setup Manual (Paso a Paso)

```bash
# 1. Crear la base de datos
npm run db:create

# 2. Ejecutar migraciones
npm run db:migrate

# 3. Poblar con datos de ejemplo
npm run db:seed
```

### Verificar las Tablas Creadas

```bash
# Listar todas las tablas
npm run db:tables
```

**✅ Deberías ver 16+ tablas:**
- facultad
- investigador
- investigador_correo
- investigador_telefono
- profesor
- profesor_correo
- estudiante
- grupo_investigacion
- linea_investigacion
- grupo_linea
- convocatoria
- proyecto_investigacion
- proyecto_linea
- producto_tipo
- producto_investigacion
- afiliacion
- autoria
- users

### Datos de Ejemplo Incluidos

El seeder (`db/seeders/seed-database.js`) crea:
- 5 Facultades (Ingeniería, Ciencias, Artes, etc.)
- 10 Investigadores con emails y teléfonos
- 5 Profesores
- 5 Estudiantes
- 8 Grupos de Investigación
- 6 Líneas de Investigación
- 3 Convocatorias
- 5 Proyectos
- 5 Tipos de Productos
- 8 Productos de Investigación
- 15 Afiliaciones (investigador-grupo)
- 12 Autorías (investigador-producto)

---

## Verificación de Instalación

### 1. Iniciar el Servidor

```bash
npm run dev
```

**✅ Debería mostrar:**
```
Example app listening on port 3000!
```

### 2. Verificación Automática del Sistema

En una nueva terminal:

```bash
npm run system:verify
```

**✅ Debería mostrar:**
```
=== VERIFICACIÓN DEL SISTEMA ===

✓ Configuración (.env y docker-compose.yml)
✓ Docker está ejecutándose
✓ PostgreSQL está accesible en localhost:5432
✓ Base de datos 'academic_db' existe
✓ API responde en http://localhost:3000
✓ Endpoint /api/v1/facultades funciona
✓ Datos de prueba cargados correctamente

=== SISTEMA VERIFICADO ===
```

### 3. Pruebas Manuales

#### Prueba en Navegador
1. Abre: http://localhost:3000/api/v1/
2. Deberías ver: `"Hola Bienvenido a mi API"`

#### Prueba de Entidades
```bash
# Ver facultades
curl http://localhost:3000/api/v1/facultades

# Ver investigadores
curl http://localhost:3000/api/v1/investigadores

# Ver grupos
curl http://localhost:3000/api/v1/grupos
```

#### Acceder a pgAdmin
```bash
# Abrir pgAdmin en navegador
npm run pgadmin
```

1. Login con:
   - Email: `admin@mail.com`
   - Password: `root`
2. Conectar al servidor PostgreSQL:
   - Host: `db`
   - Port: `5432`
   - Username: `kevin`
   - Password: `admin123`
   - Database: `academic_db`

---

## 🎉 ¡Instalación Completa!

Si todas las verificaciones pasaron, el proyecto está listo para usar.

### Próximos Pasos

1. **Probar la API**: Ver [Guía de API](./03-guia-api.md)
2. **Usar Postman**: Ver [Guía Postman](./04-postman.md)
3. **Explorar Datos**: Ver [Base de Datos](./07-base-de-datos.md)

### Scripts Útiles para el Día a Día

```bash
# Desarrollo
npm run dev              # Iniciar servidor con auto-reload

# Docker
npm run docker:up        # Iniciar PostgreSQL + pgAdmin
npm run docker:down      # Detener contenedores (mantiene datos)
npm run docker:logs      # Ver logs de PostgreSQL

# Base de Datos
npm run db:reset         # Resetear DB: deshacer + migrar + poblar
npm run db:migrate       # Ejecutar migraciones pendientes
npm run db:seed          # Repoblar con datos de ejemplo

# Verificación
npm run system:verify    # Verificar todo el sistema
npm run config:verify    # Verificar configuración
```

---

## 🆘 Solución de Problemas Comunes

Ver [Troubleshooting](./08-troubleshooting.md) para soluciones detalladas.

### Error: "Docker no está corriendo"
```bash
# Iniciar Docker Desktop manualmente
# Luego ejecutar:
npm run docker:up
```

### Error: "Port already in use"
```bash
# Puerto 5432 (PostgreSQL)
brew services stop postgresql  # macOS
sudo service postgresql stop   # Linux

# Puerto 3000 (API)
lsof -i :3000  # Ver qué proceso lo usa
kill -9 <PID>  # Matar el proceso
```

### Error: "Cannot connect to database"
```bash
# Verificar que Docker está corriendo
docker ps

# Verificar logs de PostgreSQL
npm run docker:logs

# Reiniciar contenedores
npm run docker:down
npm run docker:up
```

### Resetear Todo (Última Opción)
```bash
# Detener todo
npm run docker:down

# Eliminar volúmenes de Docker
npm run docker:reset

# Setup completo desde cero
npm run docker:up
npm run db:setup
```

---

[⬅️ Volver al Índice](./README.md) | [➡️ Siguiente: Verificación](./02-verificacion.md)
