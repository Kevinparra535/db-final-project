# AI Coding Instructions for data-final

## Project Overview
A Node.js Express API for an academic database management system for university research. The system manages researchers, professors, students, faculties, research groups, affiliations, projects, products, convocations, and academic output. Currently uses Express.js routing with plans to integrate PostgreSQL database backend.

## Architecture Patterns

### Router Module System
- **Central routing**: All route modules are registered in `routes/index.js` using the pattern `app.use('/api/v1/endpoint', routerModule)`
- **Router files**: Each feature has its own router file (e.g., `books.router.js`, `users.router.js`, `home.router.js`)
- **Export pattern**: All routers export using `module.exports = router` and import with `require('./route.router')`

### Known Issues to Fix When Editing
1. **File naming mismatch**: `routes/index.js` imports `user.router` but file is named `users.router.js`
2. **Variable inconsistency**: In `books.router.js`, line 42 references `productos` but should be `books`
3. **Mixed language**: Comments and variable names mix Spanish/English (e.g., `nombre`, `precio` vs `name`, `price`)

## Development Workflow

### Scripts
- `npm run dev` - Development with nodemon auto-reload
- `npm start` - Production server
- `npm run lint` - ESLint validation

### Code Style
- **Indentation**: Tabs (2 spaces width) as per `.editorconfig`
- **Quotes**: Single quotes for JS files
- **ESLint**: Standard rules + Prettier integration
- **Console warnings**: `no-console: warn` - avoid console.log in production code

## API Structure

### URL Patterns
- Base path: `/api/v1/`
- Books: `/api/v1/books` - supports query param `?size=N` for limit
- Users: `/api/v1/user` - supports query params `?limit=N&offset=N`
- Nested routes: `/api/v1/books/categories/:categoryId/books/:booksId`

### Response Patterns
- **JSON responses**: Use `res.json()` for data
- **Simple responses**: Use `res.send()` for strings
- **Query params**: Extract with destructuring `const { param } = req.query`
- **Route params**: Extract with destructuring `const { id } = req.params`

## Data Generation
- **Current**: Faker.js used for generating mock data in books router
- **Target**: PostgreSQL database with academic research entities
- **Spanish field names**: `nombre` (name), `precio` (price), `descripcion` (description), `imagen` (image)
- **Price formatting**: Use `parseInt(faker.commerce.price(), 10)` for integer prices

## Database Design Principles (PostgreSQL Target)

### Schema Rules
- **Database Engine**: PostgreSQL 13+
- **Normalization**: Follow 3NF (Third Normal Form) - no repeating groups, no multivalued attributes in tables
- **Naming Convention**: snake_case for columns, singular table names (e.g., `investigador`, `profesor`, `proyecto_investigacion`)
- **ENUMs**: Use ENUM types for controlled categorical fields
- **Keys**: All entities must include primary keys, foreign keys, unique constraints, and useful indexes
- **Relationships**: Composite PRIMARY KEY for relationship tables unless surrogate key needed

### Domain Entities
- **Core entities**: `investigador`, `profesor`, `estudiante`, `facultad`, `grupo_investigacion`
- **Projects**: `proyecto_investigacion`, `producto`, `convocatoria`
- **Relationships**: `afiliacion` (investigador ⇢ grupo), `autoria` (investigador ⇢ producto)
- **Multivalued attributes**: Moved to separate tables (e.g., investigador emails, phone numbers)
- **Metadata**: Use JSONB for flexible product metadata storage

### Academic Rules
- Investigadores, profesores, estudiantes are independent entities
- Grupo de investigación belongs to Facultad, may have multiple Líneas de investigación
- Proyecto belongs to Grupo, optionally to Convocatoria, can have multiple Líneas
- Afiliación has roles: líder, coinvestigador, etc.
- Autoría has roles: autor, coautor, director
- Convocatoria types: interna, Minciencias, internacional, otra

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
