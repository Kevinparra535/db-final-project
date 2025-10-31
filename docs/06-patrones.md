# 🎨 Patrones de Desarrollo

[⬅️ Volver al Índice](./README.md)

Esta guía documenta los patrones de código utilizados en el proyecto y las mejores prácticas para desarrollo.

---

## 📝 Service Layer Pattern

### Implementación Estándar

Cada entidad del dominio tiene su propia clase de servicio que encapsula la lógica de negocio:

```javascript
// services/investigador.service.js
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class InvestigadorService {
  // Operaciones CRUD estándar
  async find() {
    return await models.Investigador.findAll({
      include: ['emails', 'telefonos'],
      order: [['apellidos', 'ASC']]
    });
  }

  async findOne(id) {
    const entity = await models.Investigador.findByPk(id);
    if (!entity) throw boom.notFound('Investigador no encontrado');
    return entity;
  }

  async create(data) { /* */ }
  async update(id, changes) { /* */ }
  async delete(id) { /* */ }
}

module.exports = InvestigadorService;
```

### Ventajas
- ✅ **Separación de responsabilidades**: Lógica de negocio independiente de HTTP
- ✅ **Reutilización**: Servicios usables por múltiples controladores
- ✅ **Testeo**: Fácil de probar sin dependencias HTTP
- ✅ **Mantenimiento**: Cambios de lógica centralizados

### Convenciones
- Todos los métodos son `async` para consistencia
- Métodos CRUD estándar: `create`, `find`, `findOne`, `update`, `delete`
- Métodos especializados: `findByName`, `findActive`, `addEmail`, etc.
- Manejo de errores mediante `throw boom.error()`
- Transacciones para operaciones multi-tabla

---

## 🛣️ Router Pattern

### Estructura Modular

Cada entidad tiene su propio archivo de router:

```javascript
// routes/investigadores.router.js
const express = require('express');
const InvestigadorService = require('../services/investigador.service');
const validatorHandler = require('../middleware/validator.handler');
const { createInvestigadorSchema, getInvestigadorSchema } = require('../schemas/academic.schema');

const router = express.Router();
const service = new InvestigadorService();

// Rutas específicas ANTES de rutas paramétricas
router.get('/activos', async (req, res, next) => {
  try {
    const investigadores = await service.findActive();
    res.json(investigadores);
  } catch (error) {
    next(error);
  }
});

// Ruta paramétrica al final
router.get('/:id',
  validatorHandler(getInvestigadorSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const investigador = await service.findOne(id);
      res.json(investigador);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

### Registro Centralizado

```javascript
// routes/index.js
function routerApi(app) {
  const router = express.Router();
  app.use('/api/v1', router);
  
  router.use('/facultades', require('./facultades.router'));
  router.use('/investigadores', require('./investigadores.router'));
  router.use('/profesores', require('./profesores.router'));
  router.use('/grupos', require('./grupos.router'));
}

module.exports = routerApi;
```

### ⚠️ ORDEN DE RUTAS CRÍTICO

```javascript
// ✅ CORRECTO: Rutas específicas primero
router.get('/activos', handler);        // Ruta estática
router.get('/search/:term', handler);   // Acción específica
router.get('/:id', handler);            // Parámetro genérico ÚLTIMO

// ❌ INCORRECTO: Parámetro captura todo
router.get('/:id', handler);            // Captura TODO (incluso '/activos')
router.get('/activos', handler);        // NUNCA se ejecutará
```

**Regla**: Las rutas más específicas van primero, las paramétricas al final.

---

## ✅ Validation Pattern

### Esquemas Reutilizables

```javascript
// schemas/academic.schema.js
const Joi = require('joi');

// Definiciones base reutilizables
const id = Joi.string().length(10).pattern(/^INV\d{7}$/);
const nombres = Joi.string().max(80);
const email = Joi.string().email().max(120);
const orcid = Joi.string().pattern(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/);

// Composición de esquemas
const createInvestigadorSchema = Joi.object({
  nombres: nombres.required(),
  apellidos: Joi.string().max(80).required(),
  tipo_id: Joi.string().valid('CC', 'CE', 'PAS', 'TI').required(),
  orcid: orcid.allow(null),
  emails: Joi.array().items(Joi.object({
    email: email.required(),
    etiqueta: Joi.string().valid('institucional', 'personal', 'otro')
  })).min(1).required()
});

const updateInvestigadorSchema = Joi.object({
  nombres: nombres,    // Todos opcionales para update
  apellidos: Joi.string().max(80),
  orcid: orcid.allow(null)
});

const getInvestigadorSchema = Joi.object({
  id: id.required()
});

module.exports = {
  createInvestigadorSchema,
  updateInvestigadorSchema,
  getInvestigadorSchema
};
```

### Middleware Dinámico

```javascript
// middleware/validator.handler.js
const boom = require('@hapi/boom');

function validatorHandler(schema, property) {
  return function (req, res, next) {
    const data = req[property]; // 'body', 'params', or 'query'
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      next(boom.badRequest(error));
    }
    next();
  };
}

module.exports = validatorHandler;
```

### Aplicación en Rutas

```javascript
// Validar parámetros de URL
router.get('/:id',
  validatorHandler(getInvestigadorSchema, 'params'),
  async (req, res) => {
    // Aquí req.params.id ya está validado
    const investigador = await service.findOne(req.params.id);
    res.json(investigador);
  }
);

// Validar body de petición
router.post('/',
  validatorHandler(createInvestigadorSchema, 'body'),
  async (req, res) => {
    // Aquí req.body ya está validado
    const result = await service.create(req.body);
    res.status(201).json(result);
  }
);

// Validar query params
router.get('/',
  validatorHandler(querySchema, 'query'),
  async (req, res) => {
    // Aquí req.query ya está validado
    const results = await service.find(req.query);
    res.json(results);
  }
);
```

---

## 🚨 Error Handling Pattern

### Middleware Chain (ORDEN CRÍTICO)

```javascript
// index.js - El orden importa
app.use(logErrors);          // 1. Log errores
app.use(ormErrorHandler);    // 2. Errores de Sequelize (ANTES de boom)
app.use(boomErrorHandler);   // 3. Errores de Boom
app.use(errorHandler);       // 4. Errores genéricos
```

### 1. logErrors Middleware

```javascript
// middleware/erros.handler.js
function logErrors(err, req, res, next) {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  next(err); // Pasa al siguiente middleware
}
```

### 2. ormErrorHandler Middleware

```javascript
function ormErrorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(409).json({
      statusCode: 409,
      error: 'Conflict',
      message: err.name,
      errors: err.errors
    });
  }
  next(err);
}
```

### 3. boomErrorHandler Middleware

```javascript
function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json({
      error: output.payload
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
    "message": "\"email\" must be a valid email"
  }
}
```

### 4. errorHandler Middleware (Catch-all)

```javascript
function errorHandler(err, req, res, next) {
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
```

### Uso de Boom en Servicios

```javascript
const boom = require('@hapi/boom');

// ✅ Correcto
async findOne(id) {
  const entity = await models.Entity.findByPk(id);
  if (!entity) {
    throw boom.notFound('Entidad no encontrada');
  }
  return entity;
}

async create(data) {
  const exists = await models.Entity.findOne({ where: { email: data.email } });
  if (exists) {
    throw boom.conflict('Ya existe un registro con ese email');
  }
  return await models.Entity.create(data);
}

// ❌ Evitar
async findOne(id) {
  const entity = await models.Entity.findByPk(id);
  if (!entity) {
    throw new Error('Not found'); // Sin código HTTP
  }
  return entity;
}
```

### Códigos de Estado HTTP Comunes

| Código | Uso | Boom Method |
|--------|-----|-------------|
| 400 | Bad Request (validación) | `boom.badRequest()` |
| 401 | Unauthorized | `boom.unauthorized()` |
| 403 | Forbidden | `boom.forbidden()` |
| 404 | Not Found | `boom.notFound()` |
| 409 | Conflict (duplicado) | `boom.conflict()` |
| 422 | Unprocessable Entity | `boom.badData()` |
| 500 | Internal Server Error | `boom.internal()` |

---

## ⏱️ Async/Await Pattern

### En Controladores (Routers)

```javascript
// ✅ CORRECTO: Manejo de errores con try-catch
router.get('/', async (req, res, next) => {
  try {
    const results = await service.find();
    res.json(results);
  } catch (error) {
    next(error); // Pasa al middleware de errores
  }
});

// ❌ EVITAR: Sin manejo de errores
router.get('/', async (req, res) => {
  const results = await service.find(); // Si falla, crashea la app
  res.json(results);
});
```

### En Servicios

```javascript
// ✅ CORRECTO: Async/await con Sequelize
async find() {
  return await models.Investigador.findAll({
    include: ['emails', 'telefonos']
  });
}

// ✅ CORRECTO: Con validación
async findOne(id) {
  const entity = await models.Investigador.findByPk(id);
  if (!entity) {
    throw boom.notFound('Investigador no encontrado');
  }
  return entity;
}

// ✅ CORRECTO: Con transacción
async create(data) {
  const transaction = await models.sequelize.transaction();
  try {
    const entity = await models.Entity.create(data, { transaction });
    await transaction.commit();
    return entity;
  } catch (error) {
    await transaction.rollback();
    throw boom.internal('Error creating entity');
  }
}
```

---

## 🔄 Transaction Pattern

### Transacciones para Operaciones Multi-tabla

```javascript
async create(data) {
  const transaction = await models.sequelize.transaction();
  try {
    // 1. Crear entidad principal
    const investigador = await models.Investigador.create(data, { transaction });
    
    // 2. Crear registros relacionados (multivalores)
    if (data.emails) {
      await models.InvestigadorCorreo.bulkCreate(
        data.emails.map(e => ({ ...e, idInvestigador: investigador.id })),
        { transaction }
      );
    }
    
    if (data.telefonos) {
      await models.InvestigadorTelefono.bulkCreate(
        data.telefonos.map(t => ({ ...t, idInvestigador: investigador.id })),
        { transaction }
      );
    }
    
    // 3. Commit si todo fue exitoso
    await transaction.commit();
    
    // 4. Retornar entidad completa con relaciones
    return this.findOne(investigador.id);
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    throw boom.internal('Error al crear investigador');
  }
}
```

**Regla**: Toda operación que modifique 2+ tablas DEBE usar transacciones.

---

## 📦 Data Transfer Object (DTO) Pattern

### Request DTOs (Validación)

```javascript
// Esquema define el DTO de entrada
const createInvestigadorDTO = Joi.object({
  nombres: Joi.string().required(),
  apellidos: Joi.string().required(),
  tipo_id: Joi.string().valid('CC', 'CE', 'PAS', 'TI').required(),
  orcid: Joi.string().pattern(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/).allow(null),
  emails: Joi.array().items(Joi.object({
    email: Joi.string().email().required(),
    etiqueta: Joi.string().valid('institucional', 'personal')
  })).min(1)
});
```

### Response DTOs (Formato de salida)

```javascript
async create(data) {
  const investigador = await models.Investigador.create(data);
  
  // Retornar entidad completa con relaciones (DTO de respuesta)
  return this.findOne(investigador.id); // Incluye emails y teléfonos
}
```

---

## 🔧 Middleware Composition Pattern

### Composición de Validaciones

```javascript
// Múltiples middleware en una ruta
router.post('/',
  validatorHandler(createSchema, 'body'),  // 1. Validación
  authMiddleware,                          // 2. Autenticación
  permissionMiddleware(['admin']),         // 3. Autorización
  async (req, res, next) => {
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
    // Lógica de autorización
    if (!roles.includes(req.user.role)) {
      return next(boom.forbidden('Acceso denegado'));
    }
    next();
  };
}

// Uso
router.post('/',
  createValidator(createSchema),
  createAuth(['admin', 'editor']),
  handler
);
```

---

## 🏗️ Repository Pattern (Sequelize)

### Interface Uniforme

```javascript
// Actual: Sequelize como repository
class InvestigadorService {
  async find() {
    return await models.Investigador.findAll();
  }
}

// Futuro: Preparado para cambiar implementación
class InvestigadorService {
  constructor(repository = new SequelizeRepository()) {
    this.repository = repository;
  }

  async find() {
    return await this.repository.find();
  }
}
```

---

## ⚙️ Configuration Pattern

### Variables de Entorno

```javascript
// config/config.js
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || 5432,
  dbName: process.env.DB_NAME || 'academic_db',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD
};

module.exports = config;
```

### Configuración de Sequelize

```javascript
// libs/sequelize.js
const { Sequelize } = require('sequelize');
const { config } = require('../config/config');
const setupModels = require('../db/models');

const URI = `postgres://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}`;

const sequelize = new Sequelize(URI, {
  dialect: 'postgres',
  logging: config.env === 'development' ? console.log : false
});

setupModels(sequelize); // Inicializa modelos y asociaciones

module.exports = sequelize;
```

---

## 📋 Checklist de Mejores Prácticas

### ✅ Routers
- [ ] Rutas específicas ANTES de rutas paramétricas
- [ ] Usar `try-catch` en handlers async
- [ ] Pasar errores a `next(error)`
- [ ] Aplicar validación con `validatorHandler`
- [ ] Instanciar servicio al inicio del archivo

### ✅ Services
- [ ] Todos los métodos son `async`
- [ ] Lanzar errores con `boom`
- [ ] Usar transacciones para operaciones multi-tabla
- [ ] Validar entrada antes de procesar
- [ ] Retornar entidades completas con relaciones

### ✅ Validation
- [ ] Definir esquemas reutilizables
- [ ] Validar `params`, `body`, y `query` según sea necesario
- [ ] Usar `.required()` en campos obligatorios
- [ ] Usar ENUMs para valores controlados
- [ ] Incluir mensajes de error descriptivos

### ✅ Error Handling
- [ ] Middleware de errores en orden correcto
- [ ] Usar `boom` para errores HTTP
- [ ] Log errores en desarrollo
- [ ] No exponer stack traces en producción
- [ ] Manejar errores de Sequelize (409 Conflict)

---

[⬅️ Anterior: Arquitectura](./05-arquitectura.md) | [⬆️ Volver al Índice](./README.md) | [➡️ Siguiente: Base de Datos](./07-base-de-datos.md)
