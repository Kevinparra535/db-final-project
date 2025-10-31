# AI Coding Instructions for data-final

## Project Overview
Node.js Express API for academic research database management with **full PostgreSQL + Sequelize ORM integration**. Manages researchers, professors, students, faculties, research groups, projects, academic products, and all relationships between entities.

**✅ PRODUCTION-READY STATE**:
- 13 Sequelize models with complex associations (1:N, N:M, multivalued attributes)
- 3 database migrations with PostgreSQL ENUMs and constraints
- **13 services fully migrated to PostgreSQL** (NO mock data)
- 13 routers with CRUD + specialized endpoints (search, statistics, rankings)
- Docker Compose setup with PostgreSQL + pgAdmin
- Complete Postman API collection for testing
- **Database connection healthcheck** - App fails immediately if PostgreSQL is down

## Critical Architecture Decisions

### 1. Layered MVC-Style Architecture
```
HTTP Request → Router → Validator → Service → Sequelize Model → PostgreSQL
     ↓            ↓          ↓           ↓           ↓              ↓
  Express    Route Params  Joi Schema  Business   ORM Queries    Database
     ↓            ↓          ↓           ↓           ↓              ↓
  Response ← Error Handler ← Boom Errors ← Transaction ← Results ← Data
```

**Key Pattern**: Router → Service → Model separation is STRICT. Never query database directly from routers.

### 2. Database Connection Setup (Critical Init Sequence)
The application **requires** this initialization order in `index.js`:
```javascript
require('./libs/sequelize');  // ← MUST load BEFORE app.listen()
const app = express();
routerApi(app);              // Register routes
app.use(logErrors);          // Error middleware chain (ORDER MATTERS)
app.use(ormErrorHandler);    // ← BEFORE boomErrorHandler
app.use(boomErrorHandler);
app.use(errorHandler);
app.listen(port);
```

**Why**: `libs/sequelize.js` calls `setupModels(sequelize)` which initializes all models AND their associations. If routes load before models, queries will fail.

### 3. Sequelize Model Associations (setupModels Pattern)
All model associations are defined in `db/models/index.js` after initialization:
```javascript
function setupModels(sequelize) {
  // 1. Initialize all models first
  Investigador.init(InvestigadorSchema, Investigador.config(sequelize));
  InvestigadorCorreo.init(InvestigadorCorreoSchema, InvestigadorCorreo.config(sequelize));
  
  // 2. Then configure associations (ORDER MATTERS)
  Investigador.associate(sequelize.models);  // Sets up hasMany, belongsTo, etc.
  InvestigadorCorreo.associate(sequelize.models);
}
```

**Critical**: Adding new models requires updating THREE locations:
1. Create model file with `associate()` method
2. Import in `db/models/index.js`
3. Call `Model.init()` and `Model.associate()` in `setupModels()`

## Development Workflow

### Docker-First Development (CRITICAL)
PostgreSQL runs in Docker. **ALWAYS** start Docker before running the app:
```bash
npm run docker:up          # Start PostgreSQL + pgAdmin containers
npm run dev                # Then start development server
```

**Common Docker Issues**:
- `Error: connect ECONNREFUSED 127.0.0.1:5432` → Docker not running, run `npm run docker:up`
- `Port 5432 already in use` → Local PostgreSQL conflict, stop it: `brew services stop postgresql`
- Reset everything: `npm run docker:reset` (destroys data, re-creates containers)

### Essential Scripts (Most Used)
```bash
# Development (daily use)
npm run docker:up          # Start PostgreSQL + pgAdmin
npm run dev                # Development server with auto-reload
npm run pgadmin            # Open pgAdmin in browser (auto-login)

# Database operations (setup/reset)
npm run db:setup           # Full setup: create DB + migrate + seed
npm run db:reset           # Nuke & rebuild: undo + migrate + seed
npm run db:migrate         # Run pending migrations only
npm run db:seed            # Populate with test data only

# Verification (debugging)
npm run system:verify      # Check Docker + DB + API health
npm run config:verify      # Verify .env matches docker-compose.yml
npm run db:tables          # List all database tables

# Cleanup
npm run docker:down        # Stop containers (keeps data)
npm run docker:reset       # Nuclear option: delete everything
```

### Code Style Conventions
- **Language Mix**: Spanish field names (`nombres`, `apellidos`), English code (`create`, `find`)
- **Indentation**: Tabs configured as 2 spaces (`.editorconfig`)
- **Quotes**: Single quotes mandatory for JavaScript
- **ESLint**: `no-console: warn` - use sparingly in production code
- **Naming**: camelCase for variables, PascalCase for classes/models, kebab-case for routes

## API Structure & Patterns

### URL Pattern Convention
All endpoints follow: `/api/v1/{entity}/{action?}/{param?}`

**Examples from codebase**:
```javascript
// CRUD operations
GET    /api/v1/investigadores           // List all
GET    /api/v1/investigadores/:id       // Get one
POST   /api/v1/investigadores           // Create
PUT    /api/v1/investigadores/:id       // Full update
PATCH  /api/v1/investigadores/:id       // Partial update
DELETE /api/v1/investigadores/:id       // Delete

// Specialized endpoints
GET /api/v1/investigadores/search/nombre/:nombre     // Search by name
GET /api/v1/investigadores/activos                   // Filter active
GET /api/v1/investigadores/:id/emails                // Nested resource
POST /api/v1/investigadores/:id/emails               // Add to collection
GET /api/v1/grupos/ranking/lineas                    // Rankings
GET /api/v1/proyectos/estadisticas/estados           // Statistics
```

### Router Implementation Pattern
```javascript
// routes/investigadores.router.js
const express = require('express');
const InvestigadorService = require('../services/investigador.service');
const validatorHandler = require('../middleware/validator.handler');
const { createInvestigadorSchema, getInvestigadorSchema } = require('../schemas/academic.schema');

const router = express.Router();
const service = new InvestigadorService();

// CRITICAL: Specific routes BEFORE parameterized routes
router.get('/activos', async (req, res, next) => { /* ... */ });
router.get('/:id', 
  validatorHandler(getInvestigadorSchema, 'params'),
  async (req, res, next) => { /* ... */ }
);
```

**Route Order Rule**: Static paths (`/activos`, `/search/nombre`) MUST come before dynamic params (`/:id`). See `books.router.js` for reference.

### Service Layer Pattern (Sequelize)
```javascript
// services/investigador.service.js
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class InvestigadorService {
  async find() {
    return await models.Investigador.findAll({
      include: [
        { association: 'emails', attributes: ['email', 'etiqueta'] },
        { association: 'telefonos' }
      ],
      order: [['apellidos', 'ASC']]
    });
  }

  async create(data) {
    const transaction = await models.sequelize.transaction();
    try {
      // Generate unique ID (pattern: INV0000001)
      const investigador = await models.Investigador.create(data, { transaction });
      
      // Create related multivalued data in same transaction
      if (data.emails) {
        await models.InvestigadorCorreo.bulkCreate(
          data.emails.map(e => ({ ...e, idInvestigador: investigador.id })),
          { transaction }
        );
      }
      
      await transaction.commit();
      return this.findOne(investigador.id);
    } catch (error) {
      await transaction.rollback();
      throw boom.internal('Error al crear investigador');
    }
  }
}
```

**Transaction Rule**: All operations that modify multiple tables MUST use transactions.

## Validation & Error Handling

### Joi Schema Pattern
All validation schemas are centralized in `schemas/academic.schema.js`:
```javascript
// Reusable field definitions
const nombres = Joi.string().max(80).required();
const email = Joi.string().email().max(120);

// Entity schemas
const createInvestigadorSchema = Joi.object({
  id_investigador: Joi.string().length(10).pattern(/^INV\d{7}$/).required(),
  nombres: nombres,
  apellidos: Joi.string().max(80).required(),
  tipo_id: Joi.string().valid('CC', 'CE', 'PAS', 'TI').required(),
  orcid: Joi.string().pattern(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/).allow(null),
  emails: Joi.array().items(Joi.object({
    email: Joi.string().email().required(),
    etiqueta: Joi.string().valid('institucional', 'personal', 'otro')
  })).min(1)
});
```

### Validation Middleware (Dynamic)
```javascript
// middleware/validator.handler.js - Creates middleware closures
function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];  // 'body', 'params', or 'query'
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) next(boom.badRequest(error));
    next();
  };
}

// Usage in routers
router.post('/', 
  validatorHandler(createInvestigadorSchema, 'body'),
  async (req, res, next) => { /* ... */ }
);
```

### Error Middleware Chain (ORDER CRITICAL)
Defined in `index.js` - **MUST be in this exact order**:
```javascript
app.use(logErrors);          // 1. Log all errors
app.use(ormErrorHandler);    // 2. Handle Sequelize ValidationError (409)
app.use(boomErrorHandler);   // 3. Handle @hapi/boom errors
app.use(errorHandler);       // 4. Catch-all for unhandled errors (500)
```

**Why order matters**: `ormErrorHandler` must check errors before `boomErrorHandler` catches them.

### Error Throwing Patterns
```javascript
// Not found (404)
if (!entity) throw boom.notFound('Entidad no encontrada');

// Validation error (400)
if (!isValid) throw boom.badRequest('Datos inválidos');

// Conflict (409) - unique constraint violations
if (exists) throw boom.conflict('Ya existe un registro con esos datos');

// Internal error (500) - catch-all
throw boom.internal('Error al procesar la solicitud');
```

## Database Design Principles (PostgreSQL Current)

### Schema Rules
- **Database Engine**: PostgreSQL 13+ with Sequelize ORM
- **Normalization**: Follow 3NF (Third Normal Form) - implemented in models
- **Naming Convention**: camelCase for models, snake_case for actual DB columns
- **ENUMs**: Native PostgreSQL ENUM types for controlled categorical fields
- **Keys**: All entities have primary keys, foreign keys, unique constraints, and indexes
- **Relationships**: Proper Sequelize associations with CASCADE options

### Domain Entities (Implemented in db/models/)
- **Core people**: `Investigador`, `Profesor`, `Estudiante` (independent entities)
- **Institutional**: `Facultad`, `GrupoInvestigacion`, `LineaInvestigacion`
- **Projects**: `ProyectoInvestigacion`, `ProductoInvestigacion`, `Convocatoria`, `ProductoTipo`
- **Relationships**: `Afiliacion` (investigador ⇢ grupo), `Autoria` (investigador ⇢ producto)
- **Multivalued**: `InvestigadorCorreo`, `InvestigadorTelefono`, `ProfesorCorreo`
- **ENUMs**: 11 controlled vocabularies (ID types, roles, categories, states)
- **Metadata**: JSONB for flexible product metadata storage
- **Constraints**: Unique constraints, check constraints, proper FK relationships

### Academic Business Rules
- Investigadores, profesores, estudiantes are independent entities
- Grupo de investigación belongs to Facultad, may have multiple Líneas de investigación
- Proyecto belongs to Grupo, optionally to Convocatoria, can have multiple Líneas
- Afiliación has roles: líder, coinvestigador, semillerista, asistente, administrativo
- Autoría has roles: autor, coautor, director
- Convocatoria types: interna, Minciencias, internacional, otra
- All entities use char(10) or char(12) primary keys except relationships
- Email validation: must contain '@' symbol
- Unique constraints on names, IDs, and critical combinations

### Adding New Models (3-Step Process)
1. **Create model file** in `db/models/` with schema + `associate()` method
2. **Import in `db/models/index.js`**: Add to imports at top
3. **Initialize in `setupModels()`**: Call `Model.init()` then `Model.associate()`

Example:
```javascript
// 1. Create db/models/nueva-entidad.model.js
class NuevaEntidad extends Model {
  static associate(models) {
    this.belongsTo(models.Facultad, { as: 'facultad' });
  }
  static config(sequelize) {
    return { sequelize, tableName: 'nueva_entidad', modelName: 'NuevaEntidad' };
  }
}

// 2. Import in db/models/index.js
const { NuevaEntidad, NuevaEntidadSchema } = require('./nueva-entidad.model');

// 3. Add to setupModels()
function setupModels(sequelize) {
  // ... existing models ...
  NuevaEntidad.init(NuevaEntidadSchema, NuevaEntidad.config(sequelize));
  // ... after all inits ...
  NuevaEntidad.associate(sequelize.models);
}
```

## Common Tasks

### Adding New Routes
1. Create router file in `routes/` following pattern: `{entity}.router.js`
2. Import service class: `const Service = require('../services/{entity}.service')`
3. Create router instance: `const router = express.Router(); const service = new Service();`
4. Register in `routes/index.js`: `app.use('/api/v1/{entity}', require('./{entity}.router'))`

**Route Order Rule** (CRITICAL):
```javascript
// ✅ CORRECT - Specific routes FIRST
router.get('/activos', handler);        // Static path
router.get('/search/:term', handler);   // Specific action
router.get('/:id', handler);            // Generic param LAST

// ❌ WRONG - Generic param will catch everything
router.get('/:id', handler);            // This catches ALL GET requests
router.get('/activos', handler);        // Never reached!
```

### Adding New Services
All services use the same pattern - see `services/investigador.service.js` as reference:

```javascript
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class NuevaEntidadService {
  async find() {
    return await models.NuevaEntidad.findAll({
      include: ['associations'],
      order: [['campo', 'ASC']]
    });
  }

  async findOne(id) {
    const entity = await models.NuevaEntidad.findByPk(id);
    if (!entity) throw boom.notFound('Entidad no encontrada');
    return entity;
  }

  async create(data) {
    return await models.NuevaEntidad.create(data);
  }

  async update(id, changes) {
    const entity = await this.findOne(id);
    return await entity.update(changes);
  }

  async delete(id) {
    const entity = await this.findOne(id);
    await entity.destroy();
    return { id };
  }
}
```

### Working with Transactions
Use for operations that modify multiple tables:

```javascript
async create(data) {
  const transaction = await models.sequelize.transaction();
  try {
    const entity = await models.Entity.create(data, { transaction });
    
    // Create related records in same transaction
    if (data.related) {
      await models.Related.bulkCreate(
        data.related.map(r => ({ ...r, entityId: entity.id })),
        { transaction }
      );
    }
    
    await transaction.commit();
    return this.findOne(entity.id);
  } catch (error) {
    await transaction.rollback();
    throw boom.internal('Error creating entity');
  }
}
```

### Debugging Database Issues
```bash
# Check if PostgreSQL is running
npm run docker:logs

# Verify tables exist
npm run db:tables

# Check configuration consistency
npm run config:verify

# Full system health check
npm run system:verify

# Reset database completely
npm run db:reset
```

## PostgreSQL Development Guidelines

### Code Requirements
- **SQL Compatibility**: Write queries compatible with PostgreSQL 13+
- **Referential Integrity**: Maintain FK constraints and appropriate cascading
- **Optimization**: Include indexes, check constraints, and candidate keys
- **Data Integrity**: Generate inserts that respect FK constraints
- **Query Types**: Support CRUD operations, analytical queries, and reporting

### When Writing Database Code
- Return executable PostgreSQL code
- Maintain existing schema decisions unless explicitly instructed to change
- Comment code for clarity when needed
- Use appropriate PostgreSQL data types (JSONB, ENUMs, etc.)
- Implement proper error handling and constraint validation

## Testing and API Documentation

### Postman Collection Available
- **Complete collection**: `postman/Academic_Research_API.postman_collection.json`
- **Environment**: `postman/Academic_API_Environment.postman_environment.json`
- **Documentation**: `postman/README.md` with usage instructions
- **Coverage**: All 13 entities with CRUD, searches, and specialized endpoints
- **Database Testing**: Full test cases for migrated services (Facultad, Investigador)

### Testing Guidelines
- Use PostgreSQL endpoints for ALL 13 entities (Facultad, Investigador, Profesor, Estudiante, Grupo, Linea, Convocatoria, Proyecto, Producto, ProductoTipo, Afiliacion, Autoria, User)
- Verify database transactions and error handling
- Test multivalued attribute operations (emails, phones)
- Validate constraint enforcement and data integrity

## Key Files Reference

### Configuration
- `config/config.js` - Environment variables loader
- `docker-compose.yml` - PostgreSQL + pgAdmin setup
- `.env` - Database credentials (DB_USER=kevin, DB_PASSWORD=admin123, DB_NAME=academic_db)

### Core Application
- `index.js` - Application entry point with middleware chain
- `routes/index.js` - Central router registration (13 academic routes)
- `middleware/erros.handler.js` - Error middleware chain (ORDER CRITICAL)
- `middleware/validator.handler.js` - Dynamic Joi validation factory

### Database Layer
- `libs/sequelize.js` - Sequelize connection initialization
- `db/models/index.js` - Model registration and associations setup
- `db/config.js` - Sequelize CLI configuration
- `db/migrations/*.js` - Schema migrations (3 files)
- `db/seeders/seed-database.js` - Sample academic data

### Business Logic
- `services/*.service.js` - 13 service classes (all use PostgreSQL)
- `schemas/academic.schema.js` - Joi validation schemas for all entities

### Documentation
- `FLUJO_COMPLETO.md` - Complete initialization workflow
- `DOCKER_SETUP.md` - Docker configuration details
- `PGADMIN_QUICKSTART.md` - pgAdmin access guide
- `README.md` - Project overview and API documentation
