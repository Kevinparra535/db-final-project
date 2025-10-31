# Manejo de Errores

## Estrategia de Manejo de Errores

El sistema implementa un manejo de errores en capas usando una combinación de middleware de Express y la librería `@hapi/boom`.

## Tipos de Errores

### 1. Errores de Validación (400 Bad Request)
Generados por el middleware `validatorHandler` cuando los datos no cumplen con los esquemas Joi.

```javascript
// En validator.handler.js
if (error) {
  next(boom.badRequest(error));
}
```

### 2. Errores de Servicio (500 Internal Server Error)
Errores de lógica de negocio generados en la capa de servicios.

```javascript
// En books.services.js
async delete(id) {
  const index = this.books.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Book not found');
  }
  // ...
}
```

### 3. Errores de Boom
Errores estructurados usando la librería `@hapi/boom` para respuestas HTTP consistentes.

```javascript
const boom = require('@hapi/boom');
next(boom.badRequest('Invalid input data'));
next(boom.notFound('Resource not found'));
next(boom.unauthorized('Invalid credentials'));
```

## Pipeline de Middleware de Errores

El sistema procesa errores a través de un pipeline de middleware registrado en `index.js`:

```javascript
app.use(logErrors);        // 1. Logging
app.use(boomErrorHandler); // 2. Boom errors
app.use(errorHandler);     // 3. Generic errors
```

### 1. logErrors Middleware
**Propósito**: Registrar errores para debugging y monitoreo.

```javascript
function logErrors(err, req, res, next) {
  console.error(err);
  next(err); // Pasa al siguiente middleware
}
```

**Características**:
- No modifica la respuesta
- Registra todos los errores en consola
- Pasa el error al siguiente middleware

### 2. boomErrorHandler Middleware
**Propósito**: Manejar errores específicos de Boom con formato consistente.

```javascript
function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json({
      error: output.payload,
    });
  }
  next(err);
}
```

**Formato de respuesta Boom**:
```json
{
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Validation error details"
  }
}
```

### 3. errorHandler Middleware
**Propósito**: Manejo genérico de errores no capturados por Boom.

```javascript
function errorHandler(err, req, res, next) {
  res.status(500).json({
    error: err.message,
    stack: err.stack // Solo en desarrollo
  });
}
```

## Validación con Joi

### Configuración de Esquemas

```javascript
// schemas/validator.schema.js
const createBooksSchema = Joi.object().keys({
  name: name.required(),
  price: price.required(),
});

const updateBooksSchema = Joi.object().keys({
  name,           // Opcional para updates
  price,          // Opcional para updates
});
```

### Middleware Dinámico de Validación

```javascript
function validatorHandler(schema, property) {
  return function (req, res, next) {
    const data = req[property]; // 'params', 'query', 'body'
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
// Validar parámetros de URL
router.get('/:id',
  validatorHandler(getBooksSchema, 'params'),
  async (req, res) => { /* */ }
);

// Validar body de petición
router.post('/',
  validatorHandler(createBooksSchema, 'body'),
  async (req, res) => { /* */ }
);
```

## Mejores Prácticas

### 1. Uso de Boom para Errores HTTP
```javascript
// ✅ Correcto
next(boom.badRequest('Invalid input'));
next(boom.notFound('Resource not found'));
next(boom.unauthorized('Access denied'));

// ❌ Evitar
res.status(400).json({ error: 'Bad request' });
```

### 2. Manejo de Errores Asíncronos
```javascript
// ✅ En rutas async/await
router.get('/', async (req, res, next) => {
  try {
    const books = await service.find();
    res.json(books);
  } catch (error) {
    next(error); // Pasa al middleware de errores
  }
});

// ✅ En servicios
async findOne(id) {
  if (!id) {
    throw boom.badRequest('ID is required');
  }
  // ...
}
```

### 3. Validación de Datos de Entrada
```javascript
// ✅ Siempre validar antes de procesar
router.post('/',
  validatorHandler(createSchema, 'body'),
  async (req, res, next) => {
    // Los datos ya están validados aquí
    const result = await service.create(req.body);
    res.status(201).json(result);
  }
);
```

### 4. Errores de Servicio Específicos
```javascript
// ✅ Errores descriptivos en servicios
async delete(id) {
  const index = this.books.findIndex(item => item.id === id);
  if (index === -1) {
    throw boom.notFound(`Book with id ${id} not found`);
  }
  this.books.splice(index, 1);
  return { id };
}
```

## Debugging de Errores

### Logs en Desarrollo
```javascript
// En logErrors middleware
function logErrors(err, req, res, next) {
  console.log('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  next(err);
}
```

### Variables de Entorno
```javascript
// Mostrar stack traces solo en desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

function errorHandler(err, req, res, next) {
  res.status(500).json({
    error: err.message,
    ...(isDevelopment && { stack: err.stack })
  });
}
```

## Códigos de Estado HTTP Comunes

| Código | Uso | Boom Method |
|--------|-----|-------------|
| 400 | Bad Request | `boom.badRequest()` |
| 401 | Unauthorized | `boom.unauthorized()` |
| 403 | Forbidden | `boom.forbidden()` |
| 404 | Not Found | `boom.notFound()` |
| 409 | Conflict | `boom.conflict()` |
| 422 | Unprocessable Entity | `boom.badData()` |
| 500 | Internal Server Error | `boom.internal()` |
