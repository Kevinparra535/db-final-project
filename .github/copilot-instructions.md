# AI Coding Instructions for data-final

## Project Overview
A Node.js Express API for an academic database management system for university research with **PostgreSQL database and Sequelize ORM integration**. The system manages researchers, professors, students, faculties, research groups, affiliations, projects, products, convocations, and academic output with complete database persistence.

**CURRENT STATE**: 
- ✅ **PostgreSQL + Sequelize**: 13 models, 3 migrations, seeder implemented
- ✅ **8 Services Migrated**: Facultad, Investigador, Profesor, Estudiante, Grupo, Linea, Convocatoria, Proyecto use PostgreSQL  
- 🔄 **5 Services Pending**: Still using mock data, need Sequelize migration
- ✅ **Complete API**: All 13 routers with full CRUD and specialized endpoints

## Architecture Patterns

### Database-First Architecture (Current)
The project follows a database-driven layered architecture:
- **Database** (`db/`): PostgreSQL with Sequelize ORM (13 models + migrations)
- **Routes** (`routes/`): HTTP endpoints and request handling (13 routers)
- **Services** (`services/`): Business logic - 2 migrated to Sequelize, 11 pending
- **Schemas** (`schemas/`): Data validation with Joi (updated for DB schemas)
- **Middleware** (`middleware/`): Cross-cutting concerns (validation, error handling)

### Database Integration Status

#### ✅ COMPLETED - PostgreSQL + Sequelize Setup
- **13 Sequelize Models**: All academic entities with proper associations
- **3 Database Migrations**: Complete schema with ENUMs and constraints  
- **Seeder with Real Data**: Academic sample data for testing
- **8 Services Migrated**: Full CRUD with database operations and complex business logic

#### 🔄 IN PROGRESS - Service Migration
**Services Using PostgreSQL** (8/13):
- ✅ `facultad.service.js` - Full CRUD with database operations
- ✅ `investigador.service.js` - Complex operations with transactions for multivalued data
- ✅ `profesor.service.js` - Email management and faculty relationships  
- ✅ `estudiante.service.js` - Academic program management with faculty FK
- ✅ `grupo.service.js` - Research group management with faculty and line relationships
- ✅ `linea.service.js` - Research lines with many-to-many group associations
- ✅ `convocatoria.service.js` - Call management with date validation and statistics
- ✅ `proyecto.service.js` - Complex project management with multiple FK relationships

**Services Using Mock Data** (5/13 - PENDING MIGRATION):
- 🔄 `producto.service.js` - Needs Sequelize migration with JSONB metadata
- 🔄 `producto-tipo.service.js` - Needs Sequelize migration
- 🔄 `afiliacion.service.js` - Needs Sequelize migration for investigator-group relationships
- 🔄 `autoria.service.js` - Needs Sequelize migration for investigator-product relationships
- 🔄 `user.service.js` - Needs real authentication system

### Router Module System
- **Central routing**: All route modules are registered in `routes/index.js` using the pattern `app.use('/api/v1/endpoint', routerModule)`
- **Router files**: Each feature has its own router file (e.g., `facultades.router.js`, `investigadores.router.js`, `books.router.js`)
- **Export pattern**: All routers export using `module.exports = router` and import with `require('./route.router')`

### Service Layer Pattern
- **Service classes**: Each domain entity has a service class (e.g., `FacultadService`, `InvestigadorService`)
- **Database operations**: 2 services use Sequelize + PostgreSQL, 11 still use mock data
- **Async operations**: All service methods return promises
- **CRUD operations**: Standard create, read, update, delete methods
- **Transactions**: Complex operations use Sequelize transactions for data integrity

### Validation & Error Handling
- **Joi schemas**: Input validation using Joi library in `schemas/validator.schema.js`
- **Dynamic middleware**: `validatorHandler` creates reusable validation middleware
- **Boom errors**: Structured error responses using `@hapi/boom`
- **Global error handling**: Centralized error middleware chain

### Known Issues to Fix When Editing
1. **Service Migration Status**: 5/13 services still use mock data and need migration to Sequelize + PostgreSQL
2. **File naming mismatch**: `routes/index.js` imports `user.router` but file is named `users.router.js`  
3. **Temporary implementation**: `books` router is only a flow example - real entities defined in `spec/entities.yaml`
4. **Mixed language**: Comments and variable names mix Spanish/English (e.g., `nombre`, `precio` vs `name`, `price`)
5. **Database dependency**: Migrated services require PostgreSQL running and properly configured

## Development Workflow

### Scripts
- `npm run dev` - Development with nodemon auto-reload
- `npm start` - Production server
- `npm run lint` - ESLint validation

### Dependencies
- **Core**: Express.js 5.1.0, Joi 18.0.1, @hapi/boom 10.0.1
- **Database**: PostgreSQL 13+, Sequelize 6.37.7, pg 8.16.3
- **Development**: ESLint, Prettier, Nodemon, sequelize-cli
- **Mock data**: Faker.js 6.6.6 (being replaced by PostgreSQL seeder)

### Code Style
- **Indentation**: Tabs (2 spaces width) as per `.editorconfig`
- **Quotes**: Single quotes for JS files
- **ESLint**: Standard rules + Prettier integration
- **Console warnings**: `no-console: warn` - avoid console.log in production code

## API Structure

### URL Patterns (Current - Books Example)
- Base path: `/api/v1/`
- Books: `/api/v1/books` - supports query param `?size=N` for limit
- Users: `/api/v1/user` - supports query params `?limit=N&offset=N`
- Nested routes: `/api/v1/books/categories/:categoryId/books/:booksId`

### Target API Structure (Academic Entities)
```
/api/v1/investigadores      # Researchers
/api/v1/profesores         # Professors  
/api/v1/estudiantes        # Students
/api/v1/facultades         # Faculties
/api/v1/grupos             # Research groups
/api/v1/proyectos          # Research projects
/api/v1/productos          # Academic products
/api/v1/convocatorias      # Calls for proposals
/api/v1/afiliaciones       # Group affiliations
```

### Response Patterns
- **JSON responses**: Use `res.json()` for data
- **Simple responses**: Use `res.send()` for strings
- **Query params**: Extract with destructuring `const { param } = req.query`
- **Route params**: Extract with destructuring `const { id } = req.params`

## Data Generation
- **Current Migration State**: Faculty and Investigator services use PostgreSQL + Sequelize
- **Seeder Data**: Academic sample data in `db/seeders/seed-database.js`
- **Mock Services**: 11 services still use Faker.js until migration complete
- **Field Names**: Spanish field names (`nombre`, `descripcion`, `fechaRegistro`)
- **Database Operations**: Transactional operations for complex multivalued data

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

### Academic Rules
- Investigadores, profesores, estudiantes are independent entities
- Grupo de investigación belongs to Facultad, may have multiple Líneas de investigación
- Proyecto belongs to Grupo, optionally to Convocatoria, can have multiple Líneas
- Afiliación has roles: líder, coinvestigador, semillerista, asistente, administrativo
- Autoría has roles: autor, coautor, director
- Convocatoria types: interna, Minciencias, internacional, otra
- All entities use char(10) or char(12) primary keys except relationships
- Email validation: must contain '@' symbol
- Unique constraints on names, IDs, and critical combinations

## Common Tasks

### Adding New Routes
1. Create new router file in `routes/` folder following naming pattern `feature.router.js`
2. Register in `routes/index.js` with appropriate API path
3. Use express.Router() and export with module.exports

### Route Order Matters
- Specific routes (like `/filter`) must come BEFORE parameterized routes (like `/:id`)
- See `books.router.js` for correct ordering example

### Query Parameter Validation
- Always validate query parameters exist before using them
- Example pattern from `users.router.js`: check if both `limit` and `offset` exist before processing

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
- Use PostgreSQL endpoints for Faculty, Investigador, Profesor, Estudiante, Grupo, Linea, Convocatoria, and Proyecto entities
- Mock data endpoints for remaining 5 entities (until migration)
- Verify database transactions and error handling
- Test multivalued attribute operations (emails, phones)
- Validate constraint enforcement and data integrity
