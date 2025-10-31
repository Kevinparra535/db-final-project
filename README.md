# Academic Research Database API

API RESTful para gestión de base de datos académica universitaria. Sistema completo para administrar investigadores, profesores, estudiantes, facultades, grupos de investigación, proyectos, productos académicos, convocatorias y todas las relaciones entre estas entidades.

## 🏗️ Arquitectura

El proyecto implementa una arquitectura en capas (MVC-like) con separación clara de responsabilidades:

```
├── routes/          # Endpoints HTTP y manejo de peticiones (13 routers)
├── services/        # Lógica de negocio y manipulación de datos (13 servicios)
├── schemas/         # Validación de datos con Joi (completa)
├── middleware/      # Middleware transversal (validación, errores)
├── spec/           # Especificación del modelo de datos (entities.yaml)
└── index.js        # Punto de entrada de la aplicación
```

### Flujo de Datos

```
Request → Router → Validation Middleware → Service → Business Logic → Response
                              ↓
                    Schema Validation + Error Handling (Boom)
```

## 🚀 Estado Actual - Sistema Completamente Funcional

### ✅ Implementación Completa

**Servicios Académicos (13 servicios):**
- ✅ `facultad.service.js` - Gestión de facultades universitarias
- ✅ `investigador.service.js` - Investigadores con emails/teléfonos múltiples
- ✅ `profesor.service.js` - Profesores con categorías académicas
- ✅ `estudiante.service.js` - Estudiantes de posgrado con programas
- ✅ `grupo.service.js` - Grupos de investigación con clasificación Minciencias
- ✅ `linea.service.js` - Líneas de investigación
- ✅ `convocatoria.service.js` - Convocatorias de financiación
- ✅ `proyecto.service.js` - Proyectos con presupuestos y estados
- ✅ `producto.service.js` - Productos con metadata JSONB
- ✅ `producto-tipo.service.js` - Tipos de productos académicos
- ✅ `afiliacion.service.js` - Relaciones investigador-grupo
- ✅ `autoria.service.js` - Autorías de productos académicos
- ✅ `books.services.js` - Servicio temporal de ejemplo

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

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+ 
- npm

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd data-final

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints Completa

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

## 🛠️ Tecnologías

### Core
- **Express.js 5.1.0** - Framework web
- **Joi 18.0.1** - Validación de esquemas
- **@hapi/boom 10.0.1** - Manejo de errores HTTP estructurados

### Base de Datos (Preparado)
- **PostgreSQL 13+** - Base de datos principal (configurado)
- **Sequelize 6.37.7** - ORM (instalado, pendiente configuración)
- **pg 8.16.3** - Driver PostgreSQL

### Desarrollo
- **ESLint + Prettier** - Linting y formateo de código
- **Nodemon** - Auto-reload en desarrollo
- **Faker.js** - Generación de datos mock realistas

## 🔧 Patrones de Desarrollo Implementados

### Servicios con CRUD Completo
```javascript
class FacultadService {
  async create(data) { /* ... */ }
  async find() { /* ... */ }
  async findOne(id) { /* ... */ }
  async update(id, changes) { /* ... */ }
  async delete(id) { /* ... */ }
  // Métodos especializados
  async findByNombre(nombre) { /* ... */ }
  async findByCiudad(ciudad) { /* ... */ }
}
```

### Validación de Esquemas Joi
```javascript
const createFacultadSchema = Joi.object().keys({
  nombre: Joi.string().max(150).required(),
  decano: Joi.string().max(150).required(),
  sede: Joi.string().max(50).required(),
  ciudad: Joi.string().max(50).required(),
});
```

### Middleware de Validación Dinámico
```javascript
router.post('/', 
  validatorHandler(createFacultadSchema, 'body'),
  async (req, res, next) => { /* ... */ }
);
```

### Gestión de Relaciones Many-to-Many
```javascript
// Grupos ↔ Líneas de Investigación
async addLinea(grupoId, lineaId) {
  // Verificar relación existente
  // Crear nueva relación
  // Retornar resultado
}
```

### Manejo de Datos Multivaluados
```javascript
// Investigador con múltiples emails/teléfonos
async addEmail(investigadorId, email, etiqueta) {
  // Validar investigador existe
  // Agregar email con etiqueta
  // Retornar resultado actualizado
}
```

## 🎯 Modelo de Datos Académico

### Basado en `spec/entities.yaml`

**Entidades Principales (11):**
- `facultad` - Facultades universitarias
- `investigador` - Investigadores con multivalued attributes
- `profesor` - Profesores con categorías académicas
- `estudiante` - Estudiantes de posgrado
- `grupo_investigacion` - Grupos con clasificación Minciencias
- `linea_investigacion` - Líneas de investigación
- `convocatoria` - Convocatorias de financiación
- `proyecto_investigacion` - Proyectos con presupuestos
- `producto_investigacion` - Productos con metadata JSONB
- `producto_tipo` - Tipos de productos académicos
- `afiliacion` - Relación investigador-grupo (many-to-many)
- `autoria` - Relación investigador-producto (many-to-many)

**ENUMs Implementados (11):**
- Tipos de ID, estados, categorías académicas
- Clasificaciones Minciencias, roles de afiliación
- Roles de autoría, tipos de convocatoria
- Estados de proyecto y más

### Reglas de Dominio Implementadas
- ✅ Investigadores, profesores y estudiantes son independientes
- ✅ Grupos pertenecen a facultades
- ✅ Proyectos pertenecen a grupos, opcionalmente a convocatorias
- ✅ Relaciones many-to-many con tablas intermedias
- ✅ Multivalued attributes en tablas separadas
- ✅ Validación de constraints y unicidad
- ✅ Metadata JSONB para productos flexibles

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

### Próximas Fases - 🔄 PLANEADAS
- 🔄 Integración con PostgreSQL (dependencias instaladas)
- 📊 Migración de datos mock a PostgreSQL
- 🔐 Autenticación y autorización
- 📋 Documentación API con Swagger
- 🧪 Suite de pruebas unitarias e integración
- 🐳 Dockerización completa
- 🚀 Deploy en producción

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
