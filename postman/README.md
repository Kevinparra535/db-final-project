# 📮 Colección Postman - Academic Research API

## 🚀 Guía de Importación y Uso

### 📁 Archivos Incluidos

1. **`Academic_Research_API.postman_collection.json`** - Colección completa con todos los endpoints
2. **`Academic_API_Environment.postman_environment.json`** - Variables de entorno configuradas

### 🔧 Pasos para Importar en Postman

#### 1. Importar la Colección
```bash
1. Abrir Postman
2. Click en "Import" (botón superior izquierdo)
3. Seleccionar "File" tab
4. Arrastrar o seleccionar: Academic_Research_API.postman_collection.json
5. Click "Import"
```

#### 2. Importar el Environment
```bash
1. Click en el ⚙️ gear icon (configuración) en la esquina superior derecha
2. Click "Import" en la sección Environments
3. Seleccionar: Academic_API_Environment.postman_environment.json
4. Click "Import"
```

#### 3. Activar el Environment
```bash
1. En el dropdown superior derecho seleccionar "Academic API Environment"
2. Verificar que las variables estén cargadas:
   - baseUrl: http://localhost:3000/api/v1
   - host: localhost
   - port: 3000
```

### 📋 Estructura de la Colección

#### 🏠 **Home & Health**
- ✅ Health Check - Verificar estado del servidor

#### 🏛️ **Facultades** (✅ Sequelize + PostgreSQL)
- 📋 **CRUD Completo**:
  - GET todas las facultades
  - GET facultad por ID
  - POST crear nueva facultad
  - PUT actualizar facultad completa
  - PATCH actualizar facultad parcial
  - DELETE eliminar facultad

- 🔍 **Búsquedas Especializadas**:
  - Buscar por nombre
  - Buscar por ciudad
  - Estadísticas de facultades

#### 👥 **Investigadores** (✅ Sequelize + PostgreSQL)
- 📋 **CRUD Completo**: Operaciones básicas
- 🔍 **Búsquedas**: Por nombre, apellido, ORCID
- 📧 **Gestión de Emails**:
  - GET emails de investigador
  - POST agregar email
  - DELETE eliminar email
- 📱 **Gestión de Teléfonos**:
  - GET teléfonos de investigador
  - POST agregar teléfono
  - DELETE eliminar teléfono
- 📊 **Estados**: Investigadores activos/inactivos

#### 👨‍🏫 **Profesores** (🔄 Mock Data - Pendiente migración)
- Búsqueda por departamento
- Estadísticas por departamento

#### 👨‍🎓 **Estudiantes** (🔄 Mock Data - Pendiente migración)
- Búsqueda por programa
- Estadísticas por nivel académico

#### 🏛️ **Grupos de Investigación** (🔄 Mock Data)
- Búsqueda por clasificación Minciencias
- Gestión de líneas de investigación
- Rankings por productividad

#### 🔬 **Líneas de Investigación** (🔄 Mock Data)
- Búsqueda por keywords
- Gestión de asociaciones

#### 📢 **Convocatorias** (🔄 Mock Data)
- Convocatorias activas
- Próximas a vencer
- Búsqueda por tipo

#### 📊 **Proyectos de Investigación** (🔄 Mock Data)
- Proyectos activos
- Búsqueda por grupo
- Próximos a finalizar

#### 📝 **Productos de Investigación** (🔄 Mock Data)
- Productos más recientes
- Búsqueda por tipo y año
- Rankings de productividad

#### 📋 **Tipos de Producto** (🔄 Mock Data)
- Tipos más utilizados
- Estadísticas de uso

#### 🤝 **Afiliaciones** (🔄 Mock Data)
- Afiliaciones activas
- Líderes de grupos
- Historial de investigadores
- Rankings por miembros

#### ✍️ **Autorías** (🔄 Mock Data)
- Autores principales
- Colaboraciones entre investigadores
- Rankings de productividad y colaboración

#### 📚 **Temporal - Books** (Ejemplo de flujo)
- GET libros con mock data
- POST crear libro nuevo

### 🎯 Variables de Entorno Configuradas

```json
{
  "baseUrl": "http://localhost:3000/api/v1",
  "host": "localhost",
  "port": "3000",
  "testFacultadId": "FAC0000001",
  "testInvestigadorId": "INV0000001",
  "testGrupoId": "GRP0000001",
  // ... más IDs de prueba
}
```

### 🧪 Casos de Prueba Recomendados

#### 1. **Verificación Inicial** ✅
```bash
1. Health Check → Verificar servidor corriendo
2. GET Facultades → Verificar conexión a BD PostgreSQL
3. GET Investigadores → Verificar datos de seeder
```

#### 2. **Test CRUD Facultades** (✅ Con Base de Datos)
```bash
1. GET todas las facultades
2. POST crear nueva facultad
3. GET facultad creada por ID
4. PATCH actualizar parcialmente
5. PUT actualizar completamente
6. DELETE eliminar facultad
```

#### 3. **Test Investigadores Multivaluados** (✅ Con Base de Datos)
```bash
1. GET investigador completo con emails/teléfonos
2. POST agregar nuevo email
3. GET verificar email agregado
4. POST agregar teléfono
5. DELETE eliminar email
6. GET verificar cambios
```

#### 4. **Test Búsquedas** (✅ Con Base de Datos)
```bash
1. Buscar facultad por nombre: "Ingeniería"
2. Buscar facultad por ciudad: "Bogotá"
3. Buscar investigador por ORCID
4. Buscar investigador por nombre: "Carlos"
```

#### 5. **Test Endpoints Mock Data** (🔄 Hasta migración completa)
```bash
1. Verificar grupos de investigación
2. Verificar convocatorias activas
3. Verificar productos recientes
4. Verificar rankings de productividad
```

### ⚡ Tips para Testing

#### Variables Dinámicas
- Usar `{{baseUrl}}` en lugar de localhost:3000
- Los IDs de test están pre-configurados como variables
- Cambiar el environment para testing/producción fácilmente

#### Validaciones
- Verificar response status codes (200, 201, 404, etc.)
- Validar estructura JSON de respuestas
- Probar casos edge (IDs inexistentes, datos inválidos)

#### Flujos de Trabajo
- Ejecutar carpetas completas con "Run Collection"
- Configurar tests automáticos con assertions
- Usar pre-request scripts para datos dinámicos

### 🐛 Troubleshooting

#### Errores Comunes
```bash
❌ "Connection refused" → Verificar servidor npm run dev
❌ "404 Not Found" → Verificar endpoint URL y baseUrl
❌ "Database connection error" → Verificar PostgreSQL y variables .env
❌ "Validation error" → Verificar format de datos JSON en body
```

#### Verificaciones
```bash
✅ Servidor corriendo: curl http://localhost:3000/api/v1/
✅ Base de datos: Verificar endpoints facultades/investigadores
✅ Variables environment: Revisar baseUrl en Postman
✅ Headers: Content-Type: application/json para POST/PUT
```

### 📊 Estado de Implementación por Endpoint

| Entidad | Estado BD | CRUD | Búsquedas | Relaciones |
|---------|-----------|------|-----------|------------|
| Facultades | ✅ PostgreSQL | ✅ | ✅ | ✅ |
| Investigadores | ✅ PostgreSQL | ✅ | ✅ | ✅ |
| Profesores | 🔄 Mock | ✅ | ✅ | 🔄 |
| Estudiantes | 🔄 Mock | ✅ | ✅ | 🔄 |
| Grupos | 🔄 Mock | ✅ | ✅ | ✅ |
| Líneas | 🔄 Mock | ✅ | ✅ | ✅ |
| Convocatorias | 🔄 Mock | ✅ | ✅ | ✅ |
| Proyectos | 🔄 Mock | ✅ | ✅ | ✅ |
| Productos | 🔄 Mock | ✅ | ✅ | ✅ |
| Tipos Producto | 🔄 Mock | ✅ | ✅ | ✅ |
| Afiliaciones | 🔄 Mock | ✅ | ✅ | ✅ |
| Autorías | 🔄 Mock | ✅ | ✅ | ✅ |

### 🎯 Próximos Pasos

1. **Migrar servicios restantes** a Sequelize + PostgreSQL
2. **Agregar tests automáticos** con assertions en Postman
3. **Configurar environment de producción** cuando esté disponible
4. **Documentar casos de prueba específicos** para cada flujo de negocio académico

¡La colección está lista para probar todo el sistema académico! 🚀
