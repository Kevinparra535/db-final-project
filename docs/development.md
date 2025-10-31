# Guía de Desarrollo

Esta guía contiene todo lo necesario para configurar, desarrollar y contribuir al sistema de gestión académica universitaria.

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18.0.0 o superior
- **npm** 8.0.0 o superior
- **Git** para control de versiones
- **VS Code** (recomendado) con extensiones ESLint y Prettier

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd data-final
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Verificar instalación**
```bash
npm run lint    # Verificar estilo de código
npm test       # Ejecutar tests (si están disponibles)
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Verificación de Setup

Una vez iniciado el servidor, puedes verificar que todo funcione correctamente:

```bash
# Verificar API básica
curl http://localhost:3000/api/v1/home

# Verificar endpoint académico
curl http://localhost:3000/api/v1/facultades
```

---

## 🛠️ Scripts de Desarrollo

### Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Iniciar servidor de producción
npm start

# Verificar estilo de código
npm run lint

# Arreglar problemas de estilo automáticamente
npm run lint:fix
```

### Configuración de package.json

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "lint": "eslint ."
  }
}
```

---

## 📂 Flujo de Desarrollo

### 1. Estructura del Proyecto

```
data-final/
├── index.js                    # 🚀 Entry point
├── package.json               # 📦 Dependencias
├── .editorconfig              # ⚙️ Configuración editor
├── .eslintrc.json            # ✅ Configuración ESLint
│
├── routes/                    # 🛣️ Endpoints HTTP
│   ├── index.js              # Registro central
│   └── *.router.js           # Routers por entidad
│
├── services/                  # 💼 Lógica de negocio
│   └── *.service.js          # Servicios por entidad
│
├── schemas/                   # 📋 Validaciones
│   └── validator.schema.js   # Schemas Joi
│
├── middleware/                # ⚙️ Middleware
│   └── error.handler.js      # Manejo de errores
│
├── docs/                      # 📚 Documentación
│   ├── api.md               # API docs
│   ├── architecture.md      # Arquitectura
│   └── development.md       # Esta guía
│
└── spec/                      # 📋 Especificaciones
    └── entities.yaml         # Modelo de dominio
```

### 2. Convenciones de Código

#### Naming Conventions

**Archivos y Directorios**:
- Routers: `entidad.router.js`
- Services: `entidad.service.js`
- Directorios: `kebab-case`

**Variables y Funciones**:
```javascript
// camelCase para variables y funciones
const facultadService = new FacultadService();
const findByName = (nombre) => { /* */ };

// PascalCase para clases
class InvestigadorService { /* */ }

// SCREAMING_SNAKE_CASE para constantes
const DEFAULT_LIMIT = 10;
const API_BASE_PATH = '/api/v1';
```

#### Import/Export Patterns

```javascript
// Imports (al inicio del archivo)
const express = require('express');
const FacultadService = require('../services/facultad.service');
const { createFacultadSchema } = require('../schemas/validator.schema');

// Exports (al final del archivo)
module.exports = router;
```

#### Error Handling

```javascript
// En servicios - usar Boom para errores HTTP
const boom = require('@hapi/boom');

if (!entity) {
  throw boom.notFound('Entidad no encontrada');
}

// En routers - siempre usar try-catch con next()
router.get('/', async (req, res, next) => {
  try {
    const result = await service.find();
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

### 3. Patrones de Desarrollo

#### Router Pattern

```javascript
const express = require('express');
const router = express.Router();
const Service = require('../services/entity.service');
const validatorHandler = require('../middleware/validator.handler');
const { createSchema, updateSchema, getSchema } = require('../schemas/validator.schema');

const service = new Service();

// GET collection
router.get('/', async (req, res, next) => {
  try {
    const { limite, desde } = req.query;
    const result = await service.find(limite, desde);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET by ID
router.get('/:id',
  validatorHandler(getSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const entity = await service.findOne(id);
      res.json(entity);
    } catch (error) {
      next(error);
    }
  }
);

// POST create
router.post('/',
  validatorHandler(createSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newEntity = await service.create(body);
      res.status(201).json(newEntity);
    } catch (error) {
      next(error);
    }
  }
);

// PUT/PATCH update
router.patch('/:id',
  validatorHandler(getSchema, 'params'),
  validatorHandler(updateSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedEntity = await service.update(id, body);
      res.json(updatedEntity);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE
router.delete('/:id',
  validatorHandler(getSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedEntity = await service.delete(id);
      res.json(deletedEntity);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

#### Service Pattern

```javascript
const faker = require('faker');
const boom = require('@hapi/boom');

class EntityService {
  constructor() {
    this.data = [];
    this.generateData();
  }

  generateData() {
    const limit = 100;
    for (let index = 0; index < limit; index++) {
      this.data.push({
        id: faker.datatype.uuid(),
        // ... campos específicos con faker
        fecha_creacion: faker.date.recent(),
        fecha_actualizacion: faker.date.recent()
      });
    }
  }

  async find(limite = 10, desde = 0) {
    const limit = parseInt(limite);
    const offset = parseInt(desde);
    
    return {
      data: this.data.slice(offset, offset + limit),
      total: this.data.length,
      limite: limit,
      desde: offset
    };
  }

  async findOne(id) {
    const entity = this.data.find(item => item.id === id);
    if (!entity) {
      throw boom.notFound('Entidad no encontrada');
    }
    return entity;
  }

  async create(data) {
    const newEntity = {
      id: faker.datatype.uuid(),
      ...data,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    };
    this.data.push(newEntity);
    return newEntity;
  }

  async update(id, changes) {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw boom.notFound('Entidad no encontrada');
    }
    
    const updatedEntity = {
      ...this.data[index],
      ...changes,
      fecha_actualizacion: new Date().toISOString()
    };
    
    this.data[index] = updatedEntity;
    return updatedEntity;
  }

  async delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw boom.notFound('Entidad no encontrada');
    }
    
    const deletedEntity = this.data.splice(index, 1)[0];
    return deletedEntity;
  }

  // Métodos específicos del dominio
  async findByName(nombre) {
    return this.data.filter(item => 
      item.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  async getStatistics() {
    return {
      total: this.data.length,
      activos: this.data.filter(item => item.estado === 'activo').length,
      inactivos: this.data.filter(item => item.estado === 'inactivo').length
    };
  }
}

module.exports = EntityService;
```

#### Validation Schema Pattern

```javascript
const Joi = require('joi');

// Schema base reutilizable
const baseEntitySchema = {
  id: Joi.string().uuid(),
  fecha_creacion: Joi.date().iso(),
  fecha_actualizacion: Joi.date().iso()
};

// Schemas específicos
const facultadSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  decano: Joi.string().min(2).max(100).required(),
  sede: Joi.string().min(2).max(50).required(),
  ciudad: Joi.string().min(2).max(50).required()
});

// Schemas para diferentes operaciones
const createFacultadSchema = facultadSchema;
const updateFacultadSchema = facultadSchema.fork(['nombre', 'decano'], (schema) => schema.optional());
const getFacultadSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Query schemas
const queryFacultadSchema = Joi.object({
  limite: Joi.number().integer().min(1).max(100),
  desde: Joi.number().integer().min(0),
  nombre: Joi.string(),
  ciudad: Joi.string()
});

module.exports = {
  createFacultadSchema,
  updateFacultadSchema,
  getFacultadSchema,
  queryFacultadSchema
};
```

---

## 🔍 Debugging y Testing

### Debugging

#### Usar console.log estratégicamente

```javascript
// Información de entrada
console.log('📥 Request received:', { method: req.method, url: req.url, body: req.body });

// Estado de datos
console.log('💾 Data state:', { count: this.data.length, lastItem: this.data[this.data.length - 1] });

// Errores
console.log('❌ Error occurred:', error.message, error.stack);
```

#### Herramientas de Debug

- **VS Code Debugger**: Configurar breakpoints
- **Postman/Insomnia**: Testing de endpoints
- **curl**: Testing rápido desde terminal

```bash
# GET request
curl -X GET http://localhost:3000/api/v1/facultades

# POST request
curl -X POST http://localhost:3000/api/v1/facultades \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Nueva Facultad","decano":"Dr. Juan","sede":"Norte","ciudad":"Medellín"}'
```

### Testing Manual

#### Endpoints de Verificación

```bash
# Verificar servidor funcionando
curl http://localhost:3000/api/v1/home

# Verificar entidades académicas
curl http://localhost:3000/api/v1/facultades
curl http://localhost:3000/api/v1/investigadores
curl http://localhost:3000/api/v1/proyectos

# Verificar paginación
curl "http://localhost:3000/api/v1/facultades?limite=5&desde=0"

# Verificar validación (debe fallar)
curl -X POST http://localhost:3000/api/v1/facultades \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🆕 Agregar Nueva Funcionalidad

### Proceso Step-by-Step

#### 1. Agregar Nueva Entidad

**Paso 1: Definir en spec/entities.yaml**
```yaml
nueva_entidad:
  nombre: string
  descripcion: text
  estado: enum
  fecha_creacion: timestamp
```

**Paso 2: Crear Service**
```bash
touch services/nueva-entidad.service.js
```

**Paso 3: Crear Router**
```bash
touch routes/nueva-entidad.router.js
```

**Paso 4: Agregar Schemas**
Editar `schemas/validator.schema.js` para agregar validaciones

**Paso 5: Registrar Router**
Editar `routes/index.js`:
```javascript
const nuevaEntidadRouter = require('./nueva-entidad.router');
app.use('/api/v1/nueva-entidad', nuevaEntidadRouter);
```

#### 2. Agregar Endpoint a Entidad Existente

**Ejemplo: Agregar búsqueda por fecha**

En el service:
```javascript
async findByDateRange(fechaInicio, fechaFin) {
  return this.data.filter(item => {
    const fecha = new Date(item.fecha_creacion);
    return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
  });
}
```

En el router:
```javascript
router.get('/search/fechas/:fechaInicio/:fechaFin',
  validatorHandler(getDateRangeSchema, 'params'),
  async (req, res, next) => {
    try {
      const { fechaInicio, fechaFin } = req.params;
      const result = await service.findByDateRange(fechaInicio, fechaFin);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
```

En schemas:
```javascript
const getDateRangeSchema = Joi.object({
  fechaInicio: Joi.date().iso().required(),
  fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).required()
});
```

#### 3. Agregar Middleware

**Ejemplo: Middleware de logging**

Crear `middleware/logger.handler.js`:
```javascript
function loggerHandler(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
}

module.exports = loggerHandler;
```

Registrar en `index.js`:
```javascript
const loggerHandler = require('./middleware/logger.handler');
app.use(loggerHandler);
```

---

## 🔧 Configuración de Desarrollo

### VS Code Settings

Crear `.vscode/settings.json`:
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "eslint.autoFixOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Extensiones Recomendadas

Crear `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### EditorConfig

El archivo `.editorconfig` ya está configurado:
```ini
root = true

[*]
indent_style = tab
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module"

**Problema**: Error al importar módulos
**Solución**:
```bash
# Verificar que las dependencias estén instaladas
npm install

# Verificar ruta de import
ls -la services/  # Verificar que el archivo existe
```

### Error: "Port already in use"

**Problema**: Puerto 3000 ocupado
**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -ti:3000

# Terminar proceso
kill -9 $(lsof -ti:3000)

# O cambiar puerto en index.js
const port = process.env.PORT || 3001;
```

### Error de Validación Joi

**Problema**: Esquemas no validan correctamente
**Solución**:
```javascript
// Verificar que el schema esté bien definido
console.log('Schema:', createSchema);

// Verificar datos de entrada
console.log('Data to validate:', req.body);

// Verificar resultado de validación
const { error, value } = createSchema.validate(req.body);
console.log('Validation result:', { error, value });
```

### Error: "next is not a function"

**Problema**: Middleware mal configurado
**Solución**:
```javascript
// Asegurarse de llamar next() en middleware
function myMiddleware(req, res, next) {
  // lógica
  next(); // ¡Importante!
}

// En caso de error
function myMiddleware(req, res, next) {
  try {
    // lógica
    next();
  } catch (error) {
    next(error); // Pasar error al siguiente middleware
  }
}
```

---

## 📝 Checklist para Pull Requests

Antes de enviar un PR, verificar:

- [ ] ✅ Código pasa ESLint (`npm run lint`)
- [ ] 🧪 Endpoints funcionan correctamente
- [ ] 📋 Validaciones implementadas y testeadas
- [ ] 🔄 Manejo de errores implementado
- [ ] 📚 Documentación actualizada si es necesario
- [ ] 🎯 Commits tienen mensajes descriptivos
- [ ] 🔍 Código fue revisado para optimizaciones

### Formato de Commits

```bash
# Formato recomendado
git commit -m "feat: agregar endpoint de búsqueda por fecha en proyectos"
git commit -m "fix: corregir validación de email en investigadores"
git commit -m "docs: actualizar documentación de API"
git commit -m "refactor: mejorar estructura de servicio de facultades"
```

---

## 🚀 Roadmap de Desarrollo

### Próximas Implementaciones

1. **Base de Datos PostgreSQL**
   - Configurar conexión
   - Crear migrations
   - Reemplazar mock data

2. **Autenticación y Autorización**
   - JWT tokens
   - Roles y permisos
   - Middleware de autenticación

3. **Testing Automatizado**
   - Unit tests con Jest
   - Integration tests
   - API testing con Supertest

4. **Optimizaciones**
   - Caching con Redis
   - Rate limiting
   - Compression

5. **Deployment**
   - Docker containerization
   - CI/CD pipeline
   - Environment configurations

---

Esta guía te permitirá comenzar a desarrollar efectivamente en el proyecto académico. ¡Happy coding! 🚀
