# Configuración de Base de Datos - Sistema Académico

## 🚀 Guía de Inicio Rápido

### Requisitos previos
- Node.js (versión 14 o superior)
- Docker Desktop instalado y ejecutándose
- NPM o Yarn

### Configuración Inicial

#### 1. Variables de entorno
El archivo `.env` debe contener:
```env
PORT=3000
DB_USER=kevin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_NAME=academic_db
DB_PORT=5432
```

#### 2. Verificar entorno
```bash
npm run db:check
```
Este comando:
- ✅ Verifica que Docker esté instalado
- ✅ Inicia PostgreSQL si no está ejecutándose
- ✅ Verifica la conexión a la base de datos
- ✅ Muestra sugerencias si hay problemas

#### 3. Configuración completa (primera vez)
```bash
npm run db:setup
```
Este comando ejecuta automáticamente:
1. Crear base de datos
2. Ejecutar migraciones
3. Poblar con datos de prueba

#### 4. Iniciar el servidor
```bash
npm run dev
```

### 🔧 Scripts Disponibles

#### Verificación y diagnóstico
```bash
npm run db:check        # Verifica entorno y conexión
```

#### Configuración inicial
```bash
npm run db:setup        # Setup completo (crear + migrar + poblar)
npm run db:create       # Solo crear base de datos
```

#### Migraciones
```bash
npm run db:migrate              # Ejecutar migraciones pendientes
npm run db:migrate:undo         # Deshacer última migración
npm run db:migrate:undo:all     # Deshacer todas las migraciones
```

#### Datos de prueba
```bash
npm run db:seed         # Poblar con datos de prueba
```

#### Reset completo
```bash
npm run db:reset        # Eliminar todo y reconfigurar desde cero
```

### 🐳 Docker PostgreSQL

#### Comando manual para Docker
Si prefieres manejar Docker manualmente:
```bash
# Crear y ejecutar contenedor
docker run --name postgres \
  -e POSTGRES_USER=kevin \
  -e POSTGRES_PASSWORD=admin123 \
  -p 5432:5432 \
  -d postgres:13

# Iniciar contenedor existente
docker start postgres

# Parar contenedor
docker stop postgres
```

#### Conectar a PostgreSQL
```bash
# Desde Docker
docker exec -it postgres psql -U kevin -d academic_db

# Desde host (si tienes psql instalado)
psql -h localhost -U kevin -d academic_db
```

### � Estructura de Base de Datos

#### Entidades principales (13 modelos)
- **Facultad** - Facultades universitarias
- **Investigador** - Investigadores con emails y teléfonos
- **InvestigadorCorreo** - Emails multivaluados
- **InvestigadorTelefono** - Teléfonos multivaluados
- **Profesor** - Profesores con correos adicionales
- **ProfesorCorreo** - Emails de profesores
- **Estudiante** - Estudiantes de postgrado
- **LineaInvestigacion** - Líneas de investigación
- **GrupoInvestigacion** - Grupos de investigación
- **Convocatoria** - Convocatorias de financiación
- **ProyectoInvestigacion** - Proyectos de investigación
- **ProductoInvestigacion** - Productos académicos con metadata JSONB
- **ProductoTipo** - Tipos de productos académicos
- **Afiliacion** - Relación investigador-grupo con roles
- **Autoria** - Relación investigador-producto con orden

#### Datos de prueba incluidos
- 4 Facultades
- 2 Investigadores con emails y teléfonos
- 2 Profesores con correos
- 2 Estudiantes
- 2 Grupos de investigación
- 4 Líneas de investigación
- 3 Tipos de producto
- 1 Convocatoria

### 🔧 Resolución de Problemas

#### Error: "ECONNREFUSED"
```bash
# Verificar que Docker esté ejecutándose
docker ps

# Iniciar PostgreSQL
npm run db:check
```

#### Error: "password authentication failed"
- Verifica las credenciales en `.env`
- Asegúrate de que coincidan con las del contenedor Docker

#### Error: "role does not exist"
```bash
# El script db:check maneja esto automáticamente
npm run db:check
```

#### Error: "database does not exist"
```bash
# Crear la base de datos
npm run db:create
```

#### Error en migraciones
```bash
# Resetear todo
npm run db:reset
```

#### Empezar desde cero
```bash
# Eliminar contenedor actual
docker stop postgres
docker rm postgres

# Configurar todo nuevamente
npm run db:check
npm run db:setup
```

### 🏗️ Arquitectura

#### Configuración Sequelize
- **Configuración**: `db/config.js` - configuración de conexión
- **Modelos**: `db/models/` - 15 modelos Sequelize
- **Migraciones**: `db/migrations/` - 4 archivos de migración
- **Seeders**: `db/seeders/` - datos de prueba
- **Scripts**: `scripts/` - utilidades de configuración

#### Servicios implementados
- ✅ **13 Servicios migrados** - Todos funcionando con PostgreSQL
- ✅ **CRUD completo** - Operaciones básicas y avanzadas
- ✅ **Transacciones** - Para operaciones complejas
- ✅ **Búsquedas avanzadas** - Filtros y agregaciones
- ✅ **Relaciones complejas** - Joins y asociaciones

#### API endpoints disponibles
```
GET  /api/v1/facultades
GET  /api/v1/investigadores  
GET  /api/v1/profesores
GET  /api/v1/estudiantes
GET  /api/v1/grupos
GET  /api/v1/lineas
GET  /api/v1/convocatorias
GET  /api/v1/proyectos
GET  /api/v1/productos
GET  /api/v1/tipos-producto
GET  /api/v1/afiliaciones
GET  /api/v1/autorias
GET  /api/v1/user?limit=5&offset=0
```

### 📝 Próximos pasos

1. **Ejecutar configuración**: `npm run db:setup`
2. **Iniciar servidor**: `npm run dev`
3. **Probar API**: Usar Postman o curl en los endpoints
4. **Revisar logs**: Verificar que todos los servicios respondan correctamente

El sistema está 100% funcional con PostgreSQL + Sequelize. ¡Listo para desarrollo!
