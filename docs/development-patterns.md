# Patrones de Desarrollo

## Service Layer Pattern

### Implementación

Cada entidad del dominio tiene su propia clase de servicio que encapsula la lógica de negocio:

```javascript
class BooksService {
  constructor() {
    this.books = [];
    this.generate(); // Inicialización de datos
  }

  // Operaciones CRUD estándar
  async create(data) { /* */ }
  async find() { /* */ }
  async findOne(id) { /* */ }
  async update(id, changes) { /* */ }
  async delete(id) { /* */ }
}
```

### Ventajas
- **Separación de responsabilidades**: Lógica de negocio independiente de HTTP
- **Reutilización**: Servicios pueden ser usados por múltiples controladores
- **Testeo**: Fácil de probar sin dependencias HTTP
- **Mantenimiento**: Cambios de lógica centralizados

### Convenciones
- Todos los métodos son `async` para consistencia
- Métodos CRUD estándar: `create`, `find`, `findOne`, `update`, `delete`
- Constructor inicializa estado necesario
- Manejo de errores mediante `throw`

## Router Pattern

### Estructura Modular

Cada feature tiene su propio archivo de router:

```javascript
// routes/books.router.js
const express = require('express');
const BooksService = require('../services/books.services');
const validatorHandler = require('../middleware/validator.handler');

const router = express.Router();
const service = new BooksService();

// Definición de rutas...
module.exports = router;
```

### Registro Centralizado

```javascript
// routes/index.js
function routerApi(app) {
  app.use('/api/v1/', homeRoutes);
  app.use('/api/v1/books', booksRoutes);
  app.use('/api/v1/user', userRoutes);
}
```

### Orden de Rutas

```javascript
// ✅ Correcto: rutas específicas primero
router.get('/filter', handler);
router.get('/:id', handler);

// ❌ Incorrecto: rutas paramétricas capturan todo
router.get('/:id', handler);
router.get('/filter', handler); // Nunca se ejecutará
```

## Validation Pattern

### Esquemas Reutilizables

```javascript
// schemas/validator.schema.js
const id = Joi.string().uuid();
const name = Joi.string().alphanum().min(3).max(15);
const price = Joi.number().integer().min(1);

// Composición de esquemas
const createBooksSchema = Joi.object().keys({
  name: name.required(),
  price: price.required(),
});

const updateBooksSchema = Joi.object().keys({
  name,    // Opcional para updates
  price,   // Opcional para updates
});
```

### Middleware Dinámico

```javascript
// middleware/validator.handler.js
function validatorHandler(schema, property) {
  return function (req, res, next) {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      next(boom.badRequest(error));
    }
    next();
  };
}
```

### Aplicación en Rutas

```javascript
router.get('/:id',
  validatorHandler(getBooksSchema, 'params'),
  async (req, res) => {
    // Datos ya validados
    const { id } = req.params;
    const books = await service.findOne(id);
    res.json(books);
  }
);
```

## Error Handling Pattern

### Middleware Chain

```javascript
// index.js - Orden importa
app.use(logErrors);        // 1. Logging
app.use(boomErrorHandler); // 2. Boom específico
app.use(errorHandler);     // 3. Genérico
```

### Uso de Boom

```javascript
// ✅ En validación
next(boom.badRequest(validationError));

// ✅ En servicios
throw boom.notFound('Resource not found');

// ✅ En controladores
next(boom.unauthorized('Access denied'));
```

## Async/Await Pattern

### En Controladores

```javascript
// ✅ Correcto manejo de async
router.get('/', async (req, res, next) => {
  try {
    const books = await service.find();
    res.json(books);
  } catch (error) {
    next(error); // Pasa al middleware de errores
  }
});
```

### En Servicios

```javascript
// ✅ Promesas consistentes
async find() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(this.books);
    }, 100);
  });
}

// ✅ O directamente async/await
async findOne(id) {
  const book = this.books.find(item => item.id === id);
  if (!book) {
    throw boom.notFound('Book not found');
  }
  return book;
}
```

## Data Transfer Object (DTO) Pattern

### Request DTOs

```javascript
// Para entrada de datos
const createBookDTO = {
  name: 'string',
  price: 'number',
  description: 'string?',
  author: 'string'
};

// Validación con Joi
const createBooksSchema = Joi.object().keys({
  name: Joi.string().required(),
  price: Joi.number().integer().min(1).required(),
  description: Joi.string().optional(),
  author: Joi.string().required()
});
```

### Response DTOs

```javascript
// Para respuesta estructurada
async create(data) {
  const newBook = {
    id: this.generateId(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.books.push(newBook);
  return newBook; // DTO de respuesta
}
```

## Repository Pattern (Preparación para BD)

### Interface Uniforme

```javascript
// services/books.services.js (actual)
class BooksService {
  async find() {
    // Actualmente: array en memoria
    return this.books;
  }
}

// services/books.repository.js (futuro)
class BooksRepository {
  async find() {
    // Futuro: consulta a PostgreSQL
    return await db.query('SELECT * FROM books');
  }
}
```

### Inyección de Dependencias

```javascript
// Preparación para DB
class BooksService {
  constructor(repository = new InMemoryRepository()) {
    this.repository = repository;
  }

  async find() {
    return await this.repository.find();
  }
}
```

## Configuration Pattern

### Variables de Entorno

```javascript
// config/config.js
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  dbName: process.env.DB_NAME || 'academic_db'
};

module.exports = config;
```

### Configuración por Ambiente

```javascript
// config/database.js
const environments = {
  development: {
    host: 'localhost',
    port: 5432,
    database: 'academic_dev'
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  }
};

module.exports = environments[process.env.NODE_ENV || 'development'];
```

## Middleware Composition Pattern

### Composición de Validaciones

```javascript
// Múltiples validaciones
router.post('/',
  validatorHandler(createBooksSchema, 'body'),
  authMiddleware,           // Autenticación
  permissionMiddleware,     // Autorización
  async (req, res) => {
    // Todas las validaciones pasaron
    const result = await service.create(req.body);
    res.status(201).json(result);
  }
);
```

### Factory de Middleware

```javascript
// middleware/factory.js
function createValidator(schema, property = 'body') {
  return validatorHandler(schema, property);
}

function createAuth(roles = []) {
  return (req, res, next) => {
    // Lógica de autorización por roles
    next();
  };
}

// Uso
router.post('/',
  createValidator(createBooksSchema),
  createAuth(['admin', 'editor']),
  handler
);
```