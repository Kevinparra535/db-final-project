# Hoja de Ruta y Migraciones

## Estado Actual del Proyecto

### ✅ Implementado
- **Arquitectura base**: Express.js con patrón en capas
- **Sistema de routing**: Modular y escalable
- **Validación de datos**: Joi + middleware dinámico
- **Manejo de errores**: Pipeline centralizado con Boom
- **Servicios CRUD**: Operaciones básicas en memoria
- **Documentación**: Arquitectura y patrones

### 🔄 En Desarrollo
- **API Books**: Endpoints completos (mock data)
- **Middleware**: Validación y manejo de errores
- **Esquemas**: Definiciones Joi básicas

## Roadmap de Desarrollo

### Fase 1: Fundación (Completada)
**Objetivo**: Establecer arquitectura sólida

- [x] Setup inicial del proyecto
- [x] Estructura de carpetas
- [x] Sistema de routing modular
- [x] Middleware de validación
- [x] Manejo centralizado de errores
- [x] Servicios con patrón CRUD

### Fase 2: Base de Datos (Próxima)
**Objetivo**: Integrar PostgreSQL con entidades académicas

#### 2.1 Setup de Base de Datos
- [ ] Configuración PostgreSQL
- [ ] Pool de conexiones
- [ ] Variables de entorno
- [ ] Scripts de migración

#### 2.2 Entidades Core
```sql
-- Entidades principales
CREATE TABLE investigador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  orcid VARCHAR(19) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE facultad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  codigo VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE grupo_investigacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  codigo_colciencias VARCHAR(50),
  facultad_id UUID REFERENCES facultad(id)
);
```

#### 2.3 Servicios de BD
- [ ] `InvestigadorService` con PostgreSQL
- [ ] `FacultadService` con PostgreSQL  
- [ ] `GrupoService` con PostgreSQL
- [ ] Migrar `BooksService` a BD

### Fase 3: Entidades Académicas (Mes 2)
**Objetivo**: Completar modelo de dominio

#### 3.1 Gestión de Proyectos
```sql
CREATE TABLE convocatoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  tipo convocatoria_tipo NOT NULL,
  fecha_apertura DATE,
  fecha_cierre DATE
);

CREATE TABLE proyecto_investigacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(500) NOT NULL,
  grupo_id UUID REFERENCES grupo_investigacion(id),
  convocatoria_id UUID REFERENCES convocatoria(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE
);
```

#### 3.2 Productos Académicos
```sql
CREATE TABLE producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(500) NOT NULL,
  tipo producto_tipo NOT NULL,
  proyecto_id UUID REFERENCES proyecto_investigacion(id),
  metadata JSONB,
  fecha_publicacion DATE
);
```

#### 3.3 Relaciones
```sql
-- Investigador ⇄ Grupo
CREATE TABLE afiliacion (
  investigador_id UUID REFERENCES investigador(id),
  grupo_id UUID REFERENCES grupo_investigacion(id),
  rol afiliacion_rol NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  PRIMARY KEY (investigador_id, grupo_id, fecha_inicio)
);

-- Investigador ⇄ Producto  
CREATE TABLE autoria (
  investigador_id UUID REFERENCES investigador(id),
  producto_id UUID REFERENCES producto(id),
  rol autoria_rol NOT NULL,
  orden_autoria INTEGER,
  PRIMARY KEY (investigador_id, producto_id)
);
```

### Fase 4: APIs Completas (Mes 3)
**Objetivo**: Endpoints RESTful completos

#### 4.1 API Investigadores
```javascript
// routes/investigadores.router.js
GET    /api/v1/investigadores       // Lista con filtros
GET    /api/v1/investigadores/:id   // Detalle
POST   /api/v1/investigadores       // Crear
PUT    /api/v1/investigadores/:id   // Actualizar
DELETE /api/v1/investigadores/:id   // Eliminar
GET    /api/v1/investigadores/:id/productos // Productos
```

#### 4.2 API Proyectos
```javascript
// routes/proyectos.router.js
GET    /api/v1/proyectos            // Lista con filtros
GET    /api/v1/proyectos/:id        // Detalle
POST   /api/v1/proyectos            // Crear
PUT    /api/v1/proyectos/:id        // Actualizar
GET    /api/v1/proyectos/:id/productos // Productos del proyecto
```

#### 4.3 Consultas Analíticas
```javascript
// routes/analytics.router.js
GET /api/v1/analytics/investigadores/ranking
GET /api/v1/analytics/grupos/productividad
GET /api/v1/analytics/productos/por-tipo
GET /api/v1/analytics/convocatorias/participacion
```

### Fase 5: Autenticación y Autorización (Mes 4)
**Objetivo**: Seguridad y control de acceso

#### 5.1 Sistema de Usuarios
```sql
CREATE TABLE usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol usuario_rol NOT NULL DEFAULT 'user',
  investigador_id UUID REFERENCES investigador(id)
);
```

#### 5.2 Middleware de Autenticación
```javascript
// middleware/auth.handler.js
const authHandler = (req, res, next) => {
  // JWT validation
  // Role-based access control
};

// Aplicación en rutas
router.post('/investigadores',
  authHandler,
  roleHandler(['admin', 'coordinator']),
  validatorHandler(createInvestigadorSchema, 'body'),
  async (req, res) => { /* */ }
);
```

### Fase 6: Features Avanzados (Mes 5-6)
**Objetivo**: Funcionalidades especializadas

#### 6.1 Reportes y Exportación
- [ ] Generación de reportes PDF
- [ ] Exportación a Excel/CSV
- [ ] Dashboards estadísticos
- [ ] Métricas de productividad

#### 6.2 Integraciones Externas
- [ ] Integración con ORCID
- [ ] Consulta bases bibliográficas
- [ ] APIs de Minciencias
- [ ] Notificaciones email

#### 6.3 Optimización
- [ ] Caché con Redis
- [ ] Índices de BD optimizados
- [ ] Paginación avanzada
- [ ] Rate limiting

## Migración de Datos

### De Mock a PostgreSQL

#### Paso 1: Configuración
```javascript
// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

#### Paso 2: Servicios Híbridos
```javascript
// services/books.services.js - Transición
class BooksService {
  constructor() {
    this.useDatabase = process.env.USE_DATABASE === 'true';
    if (!this.useDatabase) {
      this.books = [];
      this.generate();
    }
  }

  async find() {
    if (this.useDatabase) {
      const result = await pool.query('SELECT * FROM books');
      return result.rows;
    }
    return this.books;
  }
}
```

#### Paso 3: Migración Gradual
1. **Dual mode**: Mantener ambos sistemas funcionando
2. **Data sync**: Script para migrar datos mock → BD
3. **Testing**: Validar equivalencia funcional
4. **Switch**: Cambiar a BD como fuente principal
5. **Cleanup**: Remover código mock

## Arquitectura Target

### Estructura Final
```
├── config/          # Configuración de BD y ambiente
├── db/             # Scripts SQL, migraciones, seeds
├── routes/         # Endpoints HTTP
├── services/       # Lógica de negocio + BD
├── middleware/     # Validación, auth, errores
├── schemas/        # Validaciones Joi
├── utils/          # Helpers y utilidades
├── tests/          # Suite de pruebas
└── docs/           # Documentación
```

### Stack Tecnológico Final
- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL 13+
- **Validación**: Joi
- **ORM/Query Builder**: pg (nativo) o Knex.js
- **Autenticación**: JWT + bcrypt
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Caché**: Redis (opcional)
- **Deployment**: Docker + Docker Compose

## Consideraciones de Rendimiento

### Base de Datos
- **Índices**: En campos de búsqueda frecuente
- **Particionamiento**: Para tablas grandes (productos, proyectos)
- **Conexiones**: Pool de conexiones configurado
- **Queries**: Optimización con EXPLAIN ANALYZE

### API
- **Paginación**: Limit/offset en todas las listas
- **Filtros**: Query parameters para búsquedas
- **Caché**: Redis para consultas frecuentes
- **Rate Limiting**: Protección contra abuso

### Escalabilidad
- **Horizontal**: Load balancer + múltiples instancias
- **Vertical**: Optimización de queries y conexiones
- **CDN**: Para archivos estáticos
- **Monitoreo**: Logs estructurados + métricas
