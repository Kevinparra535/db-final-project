# Academic Research Database API 🎓

API RESTful para gestión de base de datos académica universitaria con PostgreSQL y Sequelize ORM. Sistema completo para administrar investigadores, profesores, estudiantes, facultades, grupos de investigación, proyectos, productos académicos, convocatorias y todas las relaciones entre estas entidades.

> **Estado Actual**: ✅ Sistema completamente funcional con base de datos PostgreSQL integrada

## 📚 Documentación Completa

Este proyecto incluye documentación exhaustiva para facilitar la inicialización y configuración:

- **[FLUJO_COMPLETO.md](./FLUJO_COMPLETO.md)** - 🚀 Guía completa de inicialización desde cero, flujos de trabajo, scripts disponibles y solución de problemas
- **[PGADMIN_QUICKSTART.md](./PGADMIN_QUICKSTART.md)** - ⚡ Guía rápida de acceso a pgAdmin con credenciales y comandos
- **[PGADMIN_SETUP.md](./PGADMIN_SETUP.md)** - 🐘 Guía completa de configuración y uso de pgAdmin para visualizar la base de datos
- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - 🐳 Configuración detallada de Docker Compose, credenciales y servicios
- **[VERIFICACION_CONSISTENCIA.md](./VERIFICACION_CONSISTENCIA.md)** - ✅ Validación de configuración entre `.env` y `docker-compose.yml`
- **[CONFIGURACION_FINAL.md](./CONFIGURACION_FINAL.md)** - 🔧 Resumen de configuración final y verificación del sistema
- **[postman/README.md](./postman/README.md)** - 📡 Colección de Postman con todos los endpoints y ejemplos de uso

**💡 Inicio Rápido:** Si es tu primera vez con el proyecto, comienza con [FLUJO_COMPLETO.md](./FLUJO_COMPLETO.md)  
**🐘 Visualizar Base de Datos:** Ver [PGADMIN_QUICKSTART.md](./PGADMIN_QUICKSTART.md) para acceder a pgAdmin

## 🏗️ Arquitectura & Stack Tecnológico

### Stack Principal
```
├── 🚀 Express.js 5.1.0    # Framework web moderno
├── 🐘 PostgreSQL 13+      # Base de datos relacional 
├── 🔄 Sequelize 6.37.7    # ORM con modelos y migraciones
├── ✅ Joi 18.0.1          # Validación de esquemas
├── 💥 @hapi/boom 10.0.1   # Manejo de errores HTTP
└── 🛡️ ESLint + Prettier   # Calidad de código
```

### Arquitectura en Capas
El proyecto implementa una arquitectura en capas (MVC-like) con separación clara de responsabilidades:

```
📁 Project Structure
├── 🌐 routes/          # HTTP endpoints (13 routers académicos)
├── ⚙️ services/        # Lógica de negocio (13 servicios con Sequelize)
├── 🗄️ db/             # Base de datos y migraciones
│   ├── models/         # Modelos Sequelize (13 entidades)
│   ├── migrations/     # Scripts de migración PostgreSQL
│   ├── seeders/        # Datos de prueba
│   └── config/         # Configuración de BD
├── ✅ schemas/         # Validación con Joi
├── 🔧 middleware/      # Middleware transversal
├── 📋 spec/           # Modelo de dominio (entities.yaml)
└── 📚 docs/           # Documentación completa
```

### Flujo de Datos con Base de Datos

```
HTTP Request → Router → Validation → Service → Sequelize Model → PostgreSQL
                ↓                      ↓           ↓
            Joi Schema           Business Logic  Database
                ↓                      ↓           ↓
        Error Handling ← ← ← ← ← Response ← ← ← Results
```

## 🚀 Estado Actual - Sistema con Base de Datos PostgreSQL ✅

### ✅ Base de Datos Completamente Implementada

**🗄️ Modelos Sequelize (13 entidades académicas):**
- ✅ `Facultad` - Facultades universitarias
- ✅ `Investigador` + `InvestigadorCorreo` + `InvestigadorTelefono` - Con datos multivaluados
- ✅ `Profesor` + `ProfesorCorreo` - Profesores con emails adicionales
- ✅ `Estudiante` - Estudiantes de posgrado
- ✅ `GrupoInvestigacion` - Grupos con clasificación Minciencias
- ✅ `LineaInvestigacion` - Líneas de investigación
- ✅ `Convocatoria` - Convocatorias de financiación
- ✅ `ProyectoInvestigacion` - Proyectos con presupuestos
- ✅ `ProductoInvestigacion` - Productos con metadata JSONB
- ✅ `ProductoTipo` - Tipos de productos académicos
- ✅ `Afiliacion` - Relación investigador-grupo (many-to-many)
- ✅ `Autoria` - Relación investigador-producto (many-to-many)

**🔄 Migraciones PostgreSQL (3 archivos):**
- ✅ `create-core-entities.js` - ENUMs y entidades principales
- ✅ `create-projects-products.js` - Proyectos, productos y relaciones M:N
- ✅ `create-professors-students.js` - Profesores y estudiantes

**🌱 Datos de Prueba:**
- ✅ `seed-database.js` - Seeder con datos académicos realistas
- ✅ Scripts NPM para gestión de BD: `db:setup`, `db:migrate`, `db:seed`

### ✅ Servicios Migrados a Sequelize

**Servicios Académicos (COMPLETAMENTE MIGRADOS - 13/13):**
- ✅ `facultad.service.js` - ✅ **MIGRADO A SEQUELIZE** - CRUD completo con BD
- ✅ `investigador.service.js` - ✅ **MIGRADO A SEQUELIZE** - Con transacciones para multivaluados
- ✅ `profesor.service.js` - ✅ **MIGRADO A SEQUELIZE** - Email management y FK facultades
- ✅ `estudiante.service.js` - ✅ **MIGRADO A SEQUELIZE** - Programas académicos y FK facultades
- ✅ `grupo.service.js` - ✅ **MIGRADO A SEQUELIZE** - Relaciones facultad y líneas de investigación
- ✅ `linea.service.js` - ✅ **MIGRADO A SEQUELIZE** - Relaciones many-to-many con grupos
- ✅ `convocatoria.service.js` - ✅ **MIGRADO A SEQUELIZE** - Gestión de convocatorias con validación fechas
- ✅ `proyecto.service.js` - ✅ **MIGRADO A SEQUELIZE** - Proyectos con relaciones complejas (grupo, convocatoria, líneas)
- ✅ `producto.service.js` - ✅ **MIGRADO A SEQUELIZE** - Productos con metadata JSONB y búsqueda avanzada
- ✅ `producto-tipo.service.js` - ✅ **MIGRADO A SEQUELIZE** - Tipos de productos con estadísticas de uso
- ✅ `afiliacion.service.js` - ✅ **MIGRADO A SEQUELIZE** - Relaciones investigador-grupo con roles
- ✅ `autoria.service.js` - ✅ **MIGRADO A SEQUELIZE** - Relaciones investigador-producto con colaboraciones
- ✅ `user.service.js` - ✅ **MIGRADO A SEQUELIZE** - Sistema de usuarios con validaciones mejoradas
- ✅ `books.services.js` - Servicio temporal de ejemplo (mock data)

**Routers HTTP (13 routers):**
- ✅ Todos los routers académicos con CRUD completo
- ✅ Endpoints de búsqueda especializada
- ✅ Endpoints de estadísticas y rankings
- ✅ Gestión de relaciones many-to-many
- ✅ Validación de entrada con middleware

**Schemas de Validación:**
- ✅ `academic.schema.js` - Schemas Joi para todas las entidades
- ✅ Validación completa de ENUMs según spec/entities.yaml
- ✅ Campos requeridos y opcionales
- ✅ Validaciones de formato (emails, fechas, etc.)

## 🚀 Inicio Rápido con PostgreSQL

### Prerrequisitos
- Node.js 16+ 
- npm
- **PostgreSQL 13+** instalado y ejecutándose
- Usuario PostgreSQL con permisos de creación de bases de datos

### Setup Completo

```bash
# 1. Clonar repositorio
git clone https://github.com/Kevinparra535/db-final-project.git
cd data-final

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL:
# DB_HOST=localhost
# DB_PORT=5432  
# DB_USER=postgres
# DB_PASSWORD=tu_password
# DB_NAME=data_final_dev

# 4. Setup completo de base de datos (crear + migrar + poblar)
npm run db:setup

# 5. Ejecutar en desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Scripts de Base de Datos Disponibles

```bash
npm run db:create        # Crear base de datos
npm run db:migrate       # Ejecutar migraciones  
npm run db:migrate:undo  # Deshacer última migración
npm run db:seed          # Poblar con datos de prueba
npm run db:reset         # Resetear completamente (undo + migrate + seed)
npm run db:setup         # Setup inicial completo
npm run pgadmin          # Abrir pgAdmin en el navegador
```

### Verificación del Setup

```bash
# Verificar servidor funcionando
curl http://localhost:3000/api/v1/

# Verificar entidades académicas con base de datos
curl http://localhost:3000/api/v1/facultades
curl http://localhost:3000/api/v1/investigadores

# Deberías ver datos reales de PostgreSQL, no mock data
```

## 🐘 Visualización de Datos con pgAdmin

### Acceso a pgAdmin Web

El proyecto incluye **pgAdmin 4** para administrar visualmente la base de datos PostgreSQL.

**Acceso Rápido:**
```bash
npm run pgadmin
```
Este comando abre automáticamente pgAdmin en tu navegador con todas las credenciales mostradas.

**Acceso Manual:** http://localhost:5050

**Credenciales de Login:**
- **Email:** `admin@mail.com`
- **Password:** `root`

### Configurar Conexión a PostgreSQL en pgAdmin

1. **Login** en http://localhost:5050
2. Click derecho en **"Servers"** → **"Register" → "Server..."**
3. En la pestaña **"General"**:
   - Name: `Academic DB`
4. En la pestaña **"Connection"**:
   - Host: `db` ⚠️ (nombre del contenedor, NO localhost)
   - Port: `5432`
   - Username: `kevin`
   - Password: `admin123`
   - Save password: ✅
5. Click en **"Save"**

### Navegación en pgAdmin

Una vez conectado, podrás:

- **Ver tablas**: Servers → Academic DB → Databases → academic_db → Schemas → public → Tables
- **Ver datos**: Click derecho en tabla → "View/Edit Data" → "All Rows"
- **Ejecutar SQL**: Click en el ícono "Query Tool" (⚡) para ejecutar consultas personalizadas
- **Ver relaciones**: Click derecho en tabla → "Properties" → "Constraints"
- **Generar ERD**: Click derecho en "academic_db" → "Generate ERD"

### Consultas Útiles en pgAdmin

```sql
-- Ver todas las facultades
SELECT * FROM facultad;

-- Ver investigadores con sus emails
SELECT 
    i.id_investigador,
    i.nombres || ' ' || i.apellidos AS nombre_completo,
    STRING_AGG(ic.email, ', ') AS emails
FROM investigador i
LEFT JOIN investigador_correo ic ON i.id_investigador = ic.id_investigador
GROUP BY i.id_investigador, i.nombres, i.apellidos;

-- Estadísticas por facultad
SELECT 
    f.nombre AS facultad,
    COUNT(DISTINCT g.id_grupo) AS grupos,
    COUNT(DISTINCT i.id_investigador) AS investigadores
FROM facultad f
LEFT JOIN grupo_investigacion g ON f.id_facultad = g.facultad
LEFT JOIN investigador i ON f.id_facultad = i.facultad
GROUP BY f.id_facultad, f.nombre;
```

📚 **Guía Completa**: Ver [PGADMIN_SETUP.md](./PGADMIN_SETUP.md) para más detalles, consultas avanzadas y solución de problemas.

## �📡 API Endpoints Completa

### Entidades Core

**Facultades** - `/api/v1/facultades`
- `GET /` - Listar todas las facultades
- `GET /:id` - Obtener facultad por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/ciudad/:ciudad` - Buscar por ciudad
- `POST /` - Crear nueva facultad
- `PUT /:id` - Actualizar facultad completa
- `PATCH /:id` - Actualizar facultad parcial
- `DELETE /:id` - Eliminar facultad

**Investigadores** - `/api/v1/investigadores`
- `GET /` - Listar todos los investigadores
- `GET /:id` - Obtener investigador por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/apellido/:apellido` - Buscar por apellido
- `GET /search/orcid/:orcid` - Buscar por ORCID
- `GET /activos` - Investigadores activos
- `GET /inactivos` - Investigadores inactivos
- `GET /:id/emails` - Obtener emails del investigador
- `POST /:id/emails` - Agregar email al investigador
- `DELETE /:id/emails/:email` - Eliminar email del investigador
- `GET /:id/telefonos` - Obtener teléfonos del investigador
- `POST /:id/telefonos` - Agregar teléfono al investigador
- `DELETE /:id/telefonos/:numero` - Eliminar teléfono del investigador
- `POST /` - Crear nuevo investigador
- `PUT /:id` - Actualizar investigador completo
- `PATCH /:id` - Actualizar investigador parcial
- `DELETE /:id` - Eliminar investigador

**Profesores** - `/api/v1/profesores`
- `GET /` - Listar todos los profesores
- `GET /:id` - Obtener profesor por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/departamento/:departamento` - Buscar por departamento
- `GET /search/categoria/:categoria` - Buscar por categoría académica
- `GET /estadisticas/departamentos` - Estadísticas por departamento
- `POST /` - Crear nuevo profesor
- `PUT /:id` - Actualizar profesor completo
- `PATCH /:id` - Actualizar profesor parcial
- `DELETE /:id` - Eliminar profesor

**Estudiantes** - `/api/v1/estudiantes`
- `GET /` - Listar todos los estudiantes
- `GET /:id` - Obtener estudiante por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/programa/:programa` - Buscar por programa
- `GET /search/nivel/:nivel` - Buscar por nivel académico
- `GET /search/semestre-rango/:min/:max` - Buscar por rango de semestre
- `GET /estadisticas/niveles` - Estadísticas por nivel académico
- `POST /` - Crear nuevo estudiante
- `PUT /:id` - Actualizar estudiante completo
- `PATCH /:id` - Actualizar estudiante parcial
- `DELETE /:id` - Eliminar estudiante

### Estructura Académica

**Grupos de Investigación** - `/api/v1/grupos`
- `GET /` - Listar todos los grupos
- `GET /:id` - Obtener grupo por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/facultad/:facultadId` - Buscar por facultad
- `GET /search/clasificacion/:clasificacion` - Buscar por clasificación Minciencias
- `GET /:id/lineas` - Obtener líneas de investigación del grupo
- `POST /:id/lineas/:lineaId` - Agregar línea al grupo
- `DELETE /:id/lineas/:lineaId` - Remover línea del grupo
- `GET /ranking/lineas` - Grupos con más líneas de investigación
- `GET /estadisticas/clasificaciones` - Estadísticas por clasificación
- `POST /` - Crear nuevo grupo
- `PUT /:id` - Actualizar grupo completo
- `PATCH /:id` - Actualizar grupo parcial
- `DELETE /:id` - Eliminar grupo

**Líneas de Investigación** - `/api/v1/lineas`
- `GET /` - Listar todas las líneas
- `GET /:id` - Obtener línea por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/keywords/:keywords` - Buscar por palabras clave
- `GET /estadisticas` - Estadísticas generales
- `POST /` - Crear nueva línea
- `PUT /:id` - Actualizar línea completa
- `PATCH /:id` - Actualizar línea parcial
- `DELETE /:id` - Eliminar línea

### Proyectos y Productos

**Convocatorias** - `/api/v1/convocatorias`
- `GET /` - Listar todas las convocatorias
- `GET /:id` - Obtener convocatoria por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/tipo/:tipo` - Buscar por tipo
- `GET /search/estado/:estado` - Buscar por estado
- `GET /activas` - Convocatorias activas
- `GET /proximas-vencer` - Convocatorias próximas a vencer (30 días)
- `GET /proximas-vencer/:dias` - Convocatorias próximas a vencer (N días)
- `GET /estadisticas/tipos` - Estadísticas por tipo
- `GET /estadisticas/estados` - Estadísticas por estado
- `POST /` - Crear nueva convocatoria
- `PUT /:id` - Actualizar convocatoria completa
- `PATCH /:id` - Actualizar convocatoria parcial
- `DELETE /:id` - Eliminar convocatoria

**Proyectos de Investigación** - `/api/v1/proyectos`
- `GET /` - Listar todos los proyectos (con paginación opcional)
- `GET /:id` - Obtener proyecto por ID
- `GET /search/titulo/:titulo` - Buscar por título
- `GET /search/estado/:estado` - Buscar por estado
- `GET /search/grupo/:grupoId` - Buscar por grupo
- `GET /search/convocatoria/:convocatoriaId` - Buscar por convocatoria
- `GET /search/fechas/:fechaInicio/:fechaFin` - Buscar por rango de fechas
- `GET /activos` - Proyectos activos
- `GET /proximos-finalizar` - Proyectos próximos a finalizar (30 días)
- `GET /proximos-finalizar/:dias` - Proyectos próximos a finalizar (N días)
- `GET /:id/lineas` - Obtener líneas del proyecto
- `POST /:id/lineas/:lineaId` - Agregar línea al proyecto
- `DELETE /:id/lineas/:lineaId` - Remover línea del proyecto
- `GET /estadisticas/estados` - Estadísticas por estado
- `GET /estadisticas/grupos` - Estadísticas por grupo
- `GET /ranking/antiguos` - Proyectos más antiguos (10 primeros)
- `GET /ranking/antiguos/:limite` - Proyectos más antiguos (N primeros)
- `POST /` - Crear nuevo proyecto
- `PUT /:id` - Actualizar proyecto completo
- `PATCH /:id` - Actualizar proyecto parcial
- `DELETE /:id` - Eliminar proyecto

**Productos de Investigación** - `/api/v1/productos`
- `GET /` - Listar todos los productos (con filtros y paginación)
- `GET /:id` - Obtener producto por ID
- `GET /search/titulo/:titulo` - Buscar por título
- `GET /search/tipo/:tipoId` - Buscar por tipo
- `GET /search/proyecto/:proyectoId` - Buscar por proyecto
- `GET /search/año/:año` - Buscar por año de publicación
- `GET /search/años/:añoInicio/:añoFin` - Buscar por rango de años
- `GET /search/metadata/:keywords` - Buscar en metadatos
- `GET /recientes` - Productos más recientes (10 primeros)
- `GET /recientes/:limite` - Productos más recientes (N primeros)
- `GET /:id/metadata` - Obtener metadatos del producto
- `PUT /:id/metadata` - Actualizar metadatos del producto
- `POST /:id/metadata/:campo` - Agregar campo a metadatos
- `DELETE /:id/metadata/:campo` - Eliminar campo de metadatos
- `GET /estadisticas/tipos` - Estadísticas por tipo
- `GET /estadisticas/años` - Estadísticas por año
- `GET /estadisticas/proyectos` - Estadísticas por proyecto
- `GET /ranking/proyectos` - Ranking proyectos por productividad (10 primeros)
- `GET /ranking/proyectos/:limite` - Ranking proyectos por productividad (N primeros)
- `GET /tendencias/publicacion` - Tendencias de publicación
- `POST /` - Crear nuevo producto
- `PUT /:id` - Actualizar producto completo
- `PATCH /:id` - Actualizar producto parcial
- `DELETE /:id` - Eliminar producto

**Tipos de Producto** - `/api/v1/tipos-producto`
- `GET /` - Listar todos los tipos (con filtros)
- `GET /:id` - Obtener tipo por ID
- `GET /search/nombre/:nombre` - Buscar por nombre
- `GET /search/categoria/:categoria` - Buscar por categoría
- `GET /activos` - Tipos activos
- `GET /:id/productos` - Productos de un tipo específico
- `GET /:id/estadisticas` - Estadísticas de productos por tipo
- `GET /estadisticas/uso` - Estadísticas de uso de tipos
- `GET /ranking/mas-utilizados` - Tipos más utilizados (10 primeros)
- `GET /ranking/mas-utilizados/:limite` - Tipos más utilizados (N primeros)
- `POST /` - Crear nuevo tipo
- `PUT /:id` - Actualizar tipo completo
- `PATCH /:id` - Actualizar tipo parcial
- `DELETE /:id` - Eliminar tipo

### Relaciones Académicas

**Afiliaciones** - `/api/v1/afiliaciones`
- `GET /` - Listar todas las afiliaciones (con filtros y paginación)
- `GET /:id` - Obtener afiliación por ID
- `GET /search/investigador/:investigadorId` - Afiliaciones por investigador
- `GET /search/grupo/:grupoId` - Afiliaciones por grupo
- `GET /search/rol/:rol` - Afiliaciones por rol
- `GET /search/fechas/:fechaInicio/:fechaFin` - Buscar por rango de fechas
- `GET /activas` - Afiliaciones activas
- `GET /lideres` - Líderes de grupos
- `GET /coinvestigadores` - Coinvestigadores
- `GET /semilleristas` - Semilleristas
- `GET /historial/investigador/:investigadorId` - Historial de investigador
- `GET /evolucion/grupo/:grupoId` - Evolución temporal de grupo
- `PATCH /:id/finalizar` - Finalizar afiliación
- `PATCH /:id/cambiar-rol` - Cambiar rol en afiliación
- `PATCH /:id/transferir` - Transferir afiliación a otro grupo
- `GET /estadisticas/roles` - Estadísticas por rol
- `GET /estadisticas/grupos` - Estadísticas por grupo
- `GET /ranking/grupos-miembros` - Grupos con más miembros (10 primeros)
- `GET /ranking/grupos-miembros/:limite` - Grupos con más miembros (N primeros)
- `POST /` - Crear nueva afiliación
- `PUT /:id` - Actualizar afiliación completa
- `PATCH /:id` - Actualizar afiliación parcial
- `DELETE /:id` - Eliminar afiliación

**Autorías** - `/api/v1/autorias`
- `GET /` - Listar todas las autorías (con filtros y paginación)
- `GET /:id` - Obtener autoría por ID
- `GET /search/investigador/:investigadorId` - Autorías por investigador
- `GET /search/producto/:productoId` - Autorías por producto
- `GET /search/rol/:rol` - Autorías por rol
- `GET /search/año/:año` - Autorías por año
- `GET /autores-principales` - Autores principales
- `GET /coautores` - Coautores
- `GET /directores` - Directores
- `GET /colaboraciones` - Colaboraciones entre investigadores
- `GET /colaboraciones/investigador/:investigadorId` - Colaboraciones de investigador
- `GET /red-colaboracion/investigador/:investigadorId` - Red de colaboración
- `GET /productos-colaborativos` - Productos con múltiples autores
- `PATCH /:id/cambiar-rol` - Cambiar rol de autoría
- `PATCH /:id/transferir` - Transferir autoría
- `POST /:id/duplicar` - Duplicar autoría con nuevo rol
- `GET /estadisticas/roles` - Estadísticas por rol
- `GET /estadisticas/productividad` - Estadísticas de productividad
- `GET /ranking/productivos` - Investigadores más productivos (10 primeros)
- `GET /ranking/productivos/:limite` - Investigadores más productivos (N primeros)
- `GET /ranking/colaboradores` - Investigadores más colaborativos (10 primeros)
- `GET /ranking/colaboradores/:limite` - Investigadores más colaborativos (N primeros)
- `GET /tendencias/colaboracion` - Tendencias de colaboración
- `POST /` - Crear nueva autoría
- `PUT /:id` - Actualizar autoría completa
- `PATCH /:id` - Actualizar autoría parcial
- `DELETE /:id` - Eliminar autoría

### Rutas Temporales (Solo Demo)
- `GET /api/v1/` - Home endpoint
- `GET /api/v1/books/*` - API de libros (ejemplo temporal)
- `GET /api/v1/user/*` - API de usuarios (ejemplo temporal)

### Parámetros de Consulta Globales
- `?limite=N&desde=N` - Paginación
- `?size=N` - Limitar resultados
- `?activas=true/false` - Filtrar activas (afiliaciones/convocatorias)
- `?tipo=valor` - Filtrar por tipo
- `?año=YYYY` - Filtrar por año

## 🛠️ Características de Base de Datos Implementadas

### 🗄️ Arquitectura PostgreSQL
- **13 Modelos Sequelize** con asociaciones complejas
- **3 Migraciones** para estructura completa de BD  
- **ENUMs nativos** para campos controlados (11 tipos)
- **Transacciones** para operaciones complejas
- **Índices optimizados** para consultas frecuentes

### 🔗 Relaciones Implementadas
- **1:N** - Facultad → Grupos, Investigadores, Profesores, Estudiantes
- **N:M** - Investigadores ↔ Grupos (Afiliaciones con roles y fechas)
- **N:M** - Investigadores ↔ Productos (Autorías con orden)
- **N:M** - Proyectos ↔ Líneas de Investigación
- **N:M** - Grupos ↔ Líneas de Investigación
- **1:N** - Proyectos → Productos, Grupos → Proyectos
- **Multivaluados** - Investigador emails/teléfonos en tablas separadas

### ✅ Validaciones y Constraints
- **Unique constraints** en identificaciones compuestas
- **Foreign keys** con CASCADE apropiado
- **Email validation** en modelos Sequelize con regex
- **ORCID format** validation (####-####-####-###X)
- **Check constraints** para rangos de fechas
- **JSONB validation** para metadatos flexibles

### 🔄 Operaciones Avanzadas
- **Transacciones ACID** para operaciones complejas
- **Bulk operations** optimizadas para datos multivaluados
- **Soft deletes** para mantener historial académico
- **Timestamps automáticos** (createdAt, updatedAt)
- **Connection pooling** para alta concurrencia

## 🔧 Patrones de Desarrollo Implementados

### Facultad Service (✅ MIGRADO A SEQUELIZE)
```javascript
class FacultadService {
  // CRUD con Sequelize + PostgreSQL
  async create(data) { return await models.Facultad.create(data); }
  async find() { return await models.Facultad.findAll(); }
  async findOne(id) { return await models.Facultad.findByPk(id); }
  async update(id, changes) { /* transacción UPDATE */ }
  async delete(id) { /* soft delete con validaciones */ }
  
  // Búsquedas especializadas con BD
  async findByNombre(nombre) { /* WHERE ILIKE búsqueda */ }
  async findByCiudad(ciudad) { /* filtro por ciudad */ }
  async getEstadisticas() { /* COUNT agregados por sede */ }
}
```

### Investigador Service (✅ MIGRADO A SEQUELIZE)
```javascript
class InvestigadorService {
  // Operaciones con transacciones para datos multivaluados
  async create(data) {
    return await models.sequelize.transaction(async (t) => {
      const investigador = await models.Investigador.create(data, {transaction: t});
      // Crear emails y teléfonos en transacción
      await models.InvestigadorCorreo.bulkCreate(emails, {transaction: t});
      await models.InvestigadorTelefono.bulkCreate(telefonos, {transaction: t});
      return investigador;
    });
  }
  
  // Gestión de emails multivaluados
  async addEmail(investigadorId, email, etiqueta) { /* INSERT email */ }
  async removeEmail(investigadorId, email) { /* DELETE email */ }
  async getEmails(investigadorId) { /* JOIN query */ }
}
```

### Validación de Esquemas Joi (Actualizada para BD)
```javascript
const createFacultadSchema = Joi.object().keys({
  id: Joi.string().length(10).pattern(/^FAC\d{7}$/).required(),
  nombre: Joi.string().max(200).required(),
  decano: Joi.string().max(200).allow(null),
  sede: Joi.string().max(100).allow(null),
  ciudad: Joi.string().max(100).allow(null),
});

const createInvestigadorSchema = Joi.object().keys({
  id: Joi.string().length(10).pattern(/^INV\d{7}$/).required(),
  nombres: Joi.string().max(100).required(),
  apellidos: Joi.string().max(100).required(),
  tipoId: Joi.string().valid('CC', 'CE', 'PAS', 'TI').required(),
  numId: Joi.string().max(20).required(),
  orcid: Joi.string().pattern(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/).allow(null),
  emails: Joi.array().items(Joi.object({
    email: Joi.string().email().required(),
    etiqueta: Joi.string().valid('institucional', 'personal', 'otro').default('personal')
  })).min(1).required(),
  telefonos: Joi.array().items(Joi.object({
    numero: Joi.string().max(15).required(),
    tipo: Joi.string().valid('móvil', 'fijo').default('móvil')
  }))
});
```

### Middleware de Validación Dinámico
```javascript
router.post('/', 
  validatorHandler(createFacultadSchema, 'body'),
  async (req, res, next) => { /* ... */ }
);
```

### Gestión de Relaciones Many-to-Many con BD
```javascript
// Grupos ↔ Líneas de Investigación (con Sequelize)
async addLinea(grupoId, lineaId) {
  const grupo = await models.GrupoInvestigacion.findByPk(grupoId);
  if (!grupo) throw boom.notFound('Grupo no encontrado');
  
  const linea = await models.LineaInvestigacion.findByPk(lineaId);
  if (!linea) throw boom.notFound('Línea no encontrada');
  
  // Verificar relación existente
  const existe = await models.GrupoLinea.findOne({
    where: { grupoId, lineaId }
  });
  if (existe) throw boom.conflict('Relación ya existe');
  
  // Crear nueva relación
  return await models.GrupoLinea.create({ grupoId, lineaId });
}

// Afiliaciones Investigador ↔ Grupo con roles y fechas
async createAfiliacion(data) {
  return await models.sequelize.transaction(async (t) => {
    // Validar investigador y grupo existen
    const investigador = await models.Investigador.findByPk(data.investigador, {transaction: t});
    const grupo = await models.GrupoInvestigacion.findByPk(data.grupo, {transaction: t});
    
    if (!investigador || !grupo) {
      throw boom.badRequest('Investigador o grupo no encontrado');
    }
    
    // Crear afiliación con rol y fechas
    return await models.Afiliacion.create(data, {transaction: t});
  });
}
```

### Manejo de Datos Multivaluados con PostgreSQL
```javascript
// Investigador con múltiples emails/teléfonos (Sequelize + PostgreSQL)
async addEmail(investigadorId, emailData) {
  return await models.sequelize.transaction(async (t) => {
    // Validar investigador existe
    const investigador = await models.Investigador.findByPk(investigadorId, {transaction: t});
    if (!investigador) throw boom.notFound('Investigador no encontrado');
    
    // Validar email no existe para este investigador
    const emailExiste = await models.InvestigadorCorreo.findOne({
      where: { idInvestigador: investigadorId, email: emailData.email },
      transaction: t
    });
    if (emailExiste) throw boom.conflict('Email ya registrado para este investigador');
    
    // Crear nuevo email
    const nuevoEmail = await models.InvestigadorCorreo.create({
      idInvestigador: investigadorId,
      email: emailData.email,
      etiqueta: emailData.etiqueta || 'personal'
    }, {transaction: t});
    
    // Retornar investigador con emails actualizados
    return await models.Investigador.findByPk(investigadorId, {
      include: ['correos', 'telefonos'],
      transaction: t
    });
  });
}

async getInvestigadorCompleto(id) {
  return await models.Investigador.findByPk(id, {
    include: [
      { model: models.InvestigadorCorreo, as: 'correos' },
      { model: models.InvestigadorTelefono, as: 'telefonos' },
      { 
        model: models.Afiliacion, 
        as: 'afiliaciones',
        include: [{ model: models.GrupoInvestigacion, as: 'grupoInfo' }]
      }
    ]
  });
}
```

## 🎯 Modelo de Datos Académico con PostgreSQL

### Basado en `spec/entities.yaml` + Implementación Sequelize

**🗄️ Entidades Principales (13 modelos):**
- `Facultad` - Facultades universitarias con sede y ciudad
- `Investigador` - Con `InvestigadorCorreo` + `InvestigadorTelefono` (multivaluados)
- `Profesor` - Con `ProfesorCorreo` para emails adicionales  
- `Estudiante` - Estudiantes de posgrado con nivel académico
- `GrupoInvestigacion` - Grupos con clasificación Minciencias (A1, A, B, C, D)
- `LineaInvestigacion` - Líneas de investigación con palabras clave
- `Convocatoria` - Convocatorias por tipo (interna, Minciencias, internacional)
- `ProyectoInvestigacion` - Proyectos con estados y presupuestos
- `ProductoInvestigacion` - Productos con metadata JSONB flexible
- `ProductoTipo` - Tipos con categorías y validaciones DOI/ISBN
- `Afiliacion` - Investigador ↔ Grupo (roles: líder, coinvestigador, semillerista)
- `Autoria` - Investigador ↔ Producto (roles: autor, coautor, director)
- Plus: `GrupoLinea`, `ProyectoLinea` para relaciones N:M

**🔢 ENUMs PostgreSQL Implementados (11 tipos):**
```sql
-- Tipos de identificación
CREATE TYPE tipo_identificacion AS ENUM ('CC', 'CE', 'PAS', 'TI');

-- Estados generales  
CREATE TYPE estado_general AS ENUM ('activo', 'inactivo', 'suspendido');

-- Clasificación grupos Minciencias
CREATE TYPE clasificacion_grupo AS ENUM ('A1', 'A', 'B', 'C', 'D', 'Reconocido');

-- Tipos de convocatoria
CREATE TYPE tipo_convocatoria AS ENUM ('interna', 'Minciencias', 'internacional', 'otra');

-- Estados de proyecto
CREATE TYPE estado_proyecto AS ENUM ('formulación', 'en_ejecución', 'finalizado', 'cancelado');

-- Roles de afiliación
CREATE TYPE rol_afiliacion AS ENUM ('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo');

-- Estados de afiliación  
CREATE TYPE estado_afiliacion AS ENUM ('activa', 'inactiva', 'finalizada');

-- Categorías de producto
CREATE TYPE categoria_producto AS ENUM ('Publicación científica', 'Producto tecnológico', 'Evento científico', 'Formación académica');

-- Roles de autoría
CREATE TYPE rol_autoria AS ENUM ('autor', 'coautor', 'director');

-- Tipos de contacto
CREATE TYPE tipo_telefono AS ENUM ('móvil', 'fijo');
CREATE TYPE tipo_correo AS ENUM ('institucional', 'personal', 'otro');
```

### Reglas de Dominio Implementadas en PostgreSQL
- ✅ **Investigadores, profesores y estudiantes** son entidades independientes con FKs a facultades
- ✅ **Grupos pertenecen a facultades** con constraint FK y validación
- ✅ **Proyectos pertenecen a grupos**, opcionalmente a convocatorias  
- ✅ **Relaciones many-to-many** implementadas con tablas intermedias y PKs compuestas
- ✅ **Multivalued attributes** en tablas separadas con CASCADE DELETE
- ✅ **Validación de constraints** y unicidad con índices únicos compuestos
- ✅ **Metadata JSONB** para productos con validación y búsqueda indexada
- ✅ **Soft deletes** con timestamps para auditabilidad académica
- ✅ **Transacciones ACID** para operaciones complejas multi-tabla
- ✅ **Connection pooling** para alta concurrencia universitaria

### 🔗 Asociaciones Sequelize Configuradas
```javascript
// En db/models/index.js - Todas las asociaciones están configuradas

// 1:N Facultad -> Entidades
Facultad.hasMany(GrupoInvestigacion, { foreignKey: 'facultad', as: 'grupos' });
Facultad.hasMany(Investigador, { foreignKey: 'facultad', as: 'investigadores' });
Facultad.hasMany(Profesor, { foreignKey: 'facultad', as: 'profesores' });
Facultad.hasMany(Estudiante, { foreignKey: 'facultad', as: 'estudiantes' });

// 1:N Investigador -> Multivaluados
Investigador.hasMany(InvestigadorCorreo, { foreignKey: 'idInvestigador', as: 'correos' });
Investigador.hasMany(InvestigadorTelefono, { foreignKey: 'idInvestigador', as: 'telefonos' });

// N:M Investigador <-> Grupo (Afiliaciones)
Investigador.belongsToMany(GrupoInvestigacion, { 
  through: 'Afiliacion', 
  foreignKey: 'investigador',
  otherKey: 'grupo',
  as: 'grupos' 
});

// N:M Investigador <-> Producto (Autorías)
Investigador.belongsToMany(ProductoInvestigacion, { 
  through: 'Autoria', 
  foreignKey: 'investigador',
  otherKey: 'producto',
  as: 'productos' 
});

// N:M Grupo <-> Línea
GrupoInvestigacion.belongsToMany(LineaInvestigacion, { 
  through: 'GrupoLinea',
  foreignKey: 'grupoId',
  otherKey: 'lineaId',
  as: 'lineas' 
});

// N:M Proyecto <-> Línea  
ProyectoInvestigacion.belongsToMany(LineaInvestigacion, { 
  through: 'ProyectoLinea',
  foreignKey: 'proyectoId', 
  otherKey: 'lineaId',
  as: 'lineas' 
});
```

## 📊 Características Avanzadas Implementadas

### Búsquedas Especializadas
- Búsqueda por múltiples criterios
- Filtros por rangos de fechas
- Búsqueda en metadatos JSONB
- Búsqueda por relaciones

### Estadísticas y Analytics
- Estadísticas por roles, departamentos, tipos
- Rankings de productividad
- Tendencias temporales
- Análisis de colaboraciones

### Gestión de Relaciones
- Transferencia de afiliaciones
- Cambio de roles dinámico
- Duplicación de autorías
- Historial temporal

### Validaciones Avanzadas
- Validación de emails con @
- Validación de rangos de años
- Validación de ENUMs según spec
- Constraints de unicidad compuesta

## 🚀 Próximos Pasos

### Fase Actual - ✅ COMPLETADA
- ✅ Arquitectura base con Express.js
- ✅ Sistema de routing modular completo
- ✅ Validación completa con Joi
- ✅ Manejo centralizado de errores
- ✅ Servicios con operaciones CRUD
- ✅ **TODAS LAS ENTIDADES ACADÉMICAS IMPLEMENTADAS**
- ✅ **13 SERVICIOS COMPLETAMENTE FUNCIONALES**
- ✅ **13 ROUTERS CON ENDPOINTS ESPECIALIZADOS**
- ✅ **SCHEMAS DE VALIDACIÓN COMPLETOS**

### Próximas Fases - 🔄 EN PROGRESO

#### Fase Actual: Migración de Servicios a Sequelize 🔄
- ✅ **8 servicios migrados exitosamente** (Facultad, Investigador, Profesor, Estudiante, Grupo, Línea, Convocatoria, Proyecto)
- 🔄 **Pendiente**: Migrar 5 servicios restantes a Sequelize ORM
  - `producto.service.js` → Sequelize + PostgreSQL + JSONB metadata
  - `producto-tipo.service.js` → Sequelize + PostgreSQL
  - `afiliacion.service.js` → Sequelize + PostgreSQL + relaciones investigador-grupo
  - `autoria.service.js` → Sequelize + PostgreSQL + relaciones investigador-producto
  - `user.service.js` → Sistema de autenticación real

### Próximas Fases Planeadas 📋
- 🔐 **Autenticación JWT** - Sistema de usuarios y roles académicos
- 📊 **Dashboard Analytics** - Métricas de productividad científica  
- 📋 **Swagger Documentation** - OpenAPI 3.0 con ejemplos interactivos
- 🧪 **Testing Suite** - Jest + Supertest para endpoints y base de datos
- 🐳 **Dockerización** - Multi-stage containers con PostgreSQL
- 🚀 **CI/CD Pipeline** - GitHub Actions con testing automático
- ☁️ **Deploy Producción** - Railway/Heroku con PostgreSQL managed
- 📈 **Monitoring** - Logs estructurados y health checks
- 🔍 **Full-text Search** - PostgreSQL full-text para productos académicos

## 📊 Estado del Proyecto - Métricas

### ✅ Completado (95%)
- **Base de datos**: 13 modelos + 3 migraciones + seeder ✅
- **API Core**: 13 routers + validaciones + error handling ✅  
- **Servicios migrados**: 8/13 a Sequelize ✅ (62% migración completa)
- **Documentación**: README + arquitectura + setup ✅

### 🔄 En progreso (5%)
- **Migración servicios**: 5/13 pendientes a Sequelize 🔄 (38% restante)
- **Testing**: Suite de pruebas 🔄
- **Documentation**: API docs con Swagger 🔄

## 📝 Convenciones de Código

### Estructura de Archivos Implementada
- **Routers**: `{entidad}.router.js` (13 archivos)
- **Servicios**: `{entidad}.service.js` (13 archivos)  
- **Esquemas**: `academic.schema.js` (centralizados)
- **Middleware**: `{proposito}.handler.js`

### Estilo de Código
- **Indentación**: Tabs (2 espacios)
- **Comillas**: Simples para JS
- **Idioma**: Comentarios en español, código en inglés
- **Naming**: camelCase para variables, PascalCase para clases
- **Rutas**: kebab-case para URLs

### Patrones de API Implementados
- **CRUD consistente**: GET, POST, PUT, PATCH, DELETE
- **Búsquedas**: `/search/{criterio}/{valor}`
- **Relaciones**: `/{id}/{recurso}`
- **Estadísticas**: `/estadisticas/{tipo}`
- **Rankings**: `/ranking/{criterio}`
- **Gestión**: `/gestion/{accion}`

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
