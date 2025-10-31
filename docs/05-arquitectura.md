# 🏗️ Arquitectura del Sistema

[⬅️ Volver al Índice](./README.md)

Esta guía explica la arquitectura en capas del sistema y el flujo de datos a través de la aplicación.

---

## 📐 Visión General

El sistema implementa una **arquitectura MVC en capas** que separa claramente las responsabilidades:

```
HTTP Request → Router → Validator → Service → Sequelize Model → PostgreSQL
     ↓            ↓          ↓           ↓           ↓              ↓
  Express    Route Params  Joi Schema  Business   ORM Queries    Database
     ↓            ↓          ↓           ↓           ↓              ↓
  Response ← Error Handler ← Boom Errors ← Transaction ← Results ← Data
```

**Regla fundamental**: Router → Service → Model. Nunca consultar la base de datos directamente desde routers.

---

## 🧱 Capas de la Aplicación

### 1️⃣ Capa de Presentación (Routes)

**Ubicación**: `routes/`

**Responsabilidades**:
- Definir endpoints HTTP
- Aplicar middleware de validación
- Manejar peticiones y respuestas
- Formatear respuestas JSON
- Delegar lógica al servicio

**Ejemplo**:
```javascript
// routes/investigadores.router.js
const express = require('express');
const InvestigadorService = require('../services/investigador.service');
const validatorHandler = require('../middleware/validator.handler');
const { createInvestigadorSchema, getInvestigadorSchema } = require('../schemas/academic.schema');

const router = express.Router();
const service = new InvestigadorService();

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

**Patrón de organización**:
```
routes/
├── index.js              # Registro centralizado de rutas
├── investigadores.router.js
├── profesores.router.js
├── grupos.router.js
└── ...
```

### 2️⃣ Capa de Validación (Schemas)

**Ubicación**: `schemas/`

**Responsabilidades**:
- Definir esquemas de validación con Joi
- Validar tipos de datos
- Establecer restricciones de negocio
- Generar mensajes de error descriptivos

**Ejemplo**:
```javascript
// schemas/academic.schema.js
const Joi = require('joi');

// Definiciones reutilizables
const id = Joi.string().length(10).pattern(/^INV\d{7}$/);
const nombres = Joi.string().max(80).required();
const orcid = Joi.string().pattern(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/).allow(null);

// Esquema de creación
const createInvestigadorSchema = Joi.object({
  nombres: nombres,
  apellidos: Joi.string().max(80).required(),
  tipo_id: Joi.string().valid('CC', 'CE', 'PAS', 'TI').required(),
  orcid: orcid,
  emails: Joi.array().items(Joi.object({
    email: Joi.string().email().required(),
    etiqueta: Joi.string().valid('institucional', 'personal', 'otro')
  })).min(1)
});

module.exports = {
  createInvestigadorSchema,
  getInvestigadorSchema,
  updateInvestigadorSchema
};
```

**Middleware de validación**:
```javascript
// middleware/validator.handler.js
function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property]; // 'body', 'params', or 'query'
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      next(boom.badRequest(error));
    }
    next();
  };
}
```

### 3️⃣ Capa de Servicios (Business Logic)

**Ubicación**: `services/`

**Responsabilidades**:
- Implementar lógica de negocio
- Gestionar transacciones de base de datos
- Operaciones CRUD asíncronas
- Manejo de errores de dominio
- Coordinar múltiples modelos

**Ejemplo**:
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

  async findOne(id) {
    const investigador = await models.Investigador.findByPk(id, {
      include: ['emails', 'telefonos']
    });
    if (!investigador) {
      throw boom.notFound('Investigador no encontrado');
    }
    return investigador;
  }

  async create(data) {
    const transaction = await models.sequelize.transaction();
    try {
      const investigador = await models.Investigador.create(data, { transaction });
      
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

  async update(id, changes) {
    const investigador = await this.findOne(id);
    return await investigador.update(changes);
  }

  async delete(id) {
    const investigador = await this.findOne(id);
    await investigador.destroy();
    return { id };
  }
}

module.exports = InvestigadorService;
```

**Patrón uniforme**:
- Todos los métodos son `async`
- Métodos estándar: `create`, `find`, `findOne`, `update`, `delete`
- Operaciones complejas usan transacciones
- Errores se lanzan con `boom`

### 4️⃣ Capa de Datos (Sequelize ORM)

**Ubicación**: `db/models/`

**Responsabilidades**:
- Definir modelos de datos (tablas)
- Configurar asociaciones (relaciones)
- Mapear tipos de datos PostgreSQL
- Validaciones de campo

**Ejemplo**:
```javascript
// db/models/investigador.model.js
const { Model, DataTypes, Sequelize } = require('sequelize');

const INVESTIGADOR_TABLE = 'investigador';

const InvestigadorSchema = {
  idInvestigador: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.CHAR(10),
    field: 'id_investigador'
  },
  nombres: {
    allowNull: false,
    type: DataTypes.STRING(80)
  },
  apellidos: {
    allowNull: false,
    type: DataTypes.STRING(80)
  },
  tipoId: {
    type: DataTypes.ENUM('CC', 'CE', 'PAS', 'TI'),
    field: 'tipo_id'
  },
  orcid: {
    type: DataTypes.STRING(19),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
};

class Investigador extends Model {
  static associate(models) {
    this.hasMany(models.InvestigadorCorreo, {
      as: 'emails',
      foreignKey: 'idInvestigador'
    });
    this.hasMany(models.InvestigadorTelefono, {
      as: 'telefonos',
      foreignKey: 'idInvestigador'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: INVESTIGADOR_TABLE,
      modelName: 'Investigador',
      timestamps: false
    };
  }
}

module.exports = { INVESTIGADOR_TABLE, InvestigadorSchema, Investigador };
```

**Inicialización de modelos**:
```javascript
// db/models/index.js
function setupModels(sequelize) {
  // 1. Inicializar TODOS los modelos primero
  Investigador.init(InvestigadorSchema, Investigador.config(sequelize));
  InvestigadorCorreo.init(InvestigadorCorreoSchema, InvestigadorCorreo.config(sequelize));
  Facultad.init(FacultadSchema, Facultad.config(sequelize));
  
  // 2. Configurar asociaciones (DESPUÉS de inicializar)
  Investigador.associate(sequelize.models);
  InvestigadorCorreo.associate(sequelize.models);
  Facultad.associate(sequelize.models);
}
```

**⚠️ IMPORTANTE**: El orden importa. Primero `.init()`, luego `.associate()`.

### 5️⃣ Capa de Middleware

**Ubicación**: `middleware/`

**Responsabilidades**:
- Interceptar peticiones HTTP
- Aplicar validaciones transversales
- Manejar errores globalmente
- Formatear respuestas de error

**Pipeline de errores** (en `index.js`):
```javascript
app.use(logErrors);          // 1. Log errores en consola
app.use(ormErrorHandler);    // 2. Maneja errores de Sequelize ValidationError
app.use(boomErrorHandler);   // 3. Maneja errores de @hapi/boom
app.use(errorHandler);       // 4. Catch-all para errores genéricos
```

**⚠️ CRÍTICO**: El orden de los middleware de error es OBLIGATORIO.

---

## 🔄 Flujo de Datos Completo

### Ejemplo: GET `/api/v1/investigadores/:id`

```
1. Cliente envía → GET /api/v1/investigadores/INV0000001

2. Express recibe petición
   ↓
3. Router (/api/v1/investigadores)
   → routes/investigadores.router.js
   ↓
4. Validación de parámetros
   → validatorHandler(getInvestigadorSchema, 'params')
   → schemas/academic.schema.js valida formato del ID
   ↓
5. Controller (handler de ruta)
   → Ejecuta: service.findOne(id)
   ↓
6. Service Layer
   → services/investigador.service.js
   → Ejecuta: models.Investigador.findByPk(id, { include: ['emails', 'telefonos'] })
   ↓
7. Sequelize ORM
   → db/models/investigador.model.js
   → Genera SQL: SELECT * FROM investigador WHERE id_investigador = 'INV0000001'
   → Genera SQL: SELECT * FROM investigador_correo WHERE id_investigador = 'INV0000001'
   ↓
8. PostgreSQL
   → Ejecuta queries
   → Retorna filas
   ↓
9. Sequelize mapea a objetos
   ↓
10. Service retorna objeto al controller
    ↓
11. Controller formatea respuesta JSON
    → res.json(investigador)
    ↓
12. Cliente recibe respuesta 200 OK
```

### Ejemplo: POST `/api/v1/investigadores` (con transacción)

```
1. Cliente envía → POST /api/v1/investigadores
   Body: { nombres, apellidos, emails: [...], telefonos: [...] }

2. Validación Joi
   → Valida estructura completa (campos requeridos, formatos)
   ↓
3. Service.create(data)
   → Inicia transacción: await models.sequelize.transaction()
   ↓
4. INSERT investigador
   → models.Investigador.create(data, { transaction })
   ↓
5. INSERT emails
   → models.InvestigadorCorreo.bulkCreate(emails, { transaction })
   ↓
6. INSERT teléfonos
   → models.InvestigadorTelefono.bulkCreate(telefonos, { transaction })
   ↓
7. Commit transacción
   → await transaction.commit()
   ↓
8. Retorna investigador completo
   → service.findOne(investigador.id)
   ↓
9. Respuesta 201 Created
```

**Si ocurre error**:
```
Error en paso 5
   ↓
catch (error) { await transaction.rollback(); }
   ↓
throw boom.internal('Error al crear investigador')
   ↓
errorHandler middleware
   ↓
Respuesta 500 Internal Server Error
```

---

## 🎯 Patrones de Diseño Implementados

### 1. Service Layer Pattern
- Encapsula lógica de negocio
- Independiente de HTTP
- Facilita testing y reutilización

### 2. Repository Pattern (Sequelize ORM)
- Abstrae acceso a datos
- Permite cambiar BD sin afectar servicios
- Centraliza queries

### 3. Middleware Pattern
- Intercepta peticiones HTTP
- Composición de funcionalidades
- Separa concerns transversales

### 4. Schema Validation Pattern
- Valida datos de entrada
- Centraliza reglas de validación
- Genera errores estructurados

### 5. Error Handling Chain
- Manejo centralizado de errores
- Diferentes niveles de procesamiento
- Respuestas consistentes

---

## 🔧 Inicialización de la Aplicación

**Secuencia CRÍTICA** en `index.js`:

```javascript
const express = require('express');
const routerApi = require('./routes');
const { logErrors, ormErrorHandler, boomErrorHandler, errorHandler } = require('./middleware/erros.handler');

// 1. PRIMERO: Inicializar Sequelize y modelos
require('./libs/sequelize'); // ← Llama setupModels() internamente

// 2. Crear app
const app = express();

// 3. Middleware de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Registrar rutas
routerApi(app);

// 5. Middleware de errores (ORDEN CRÍTICO)
app.use(logErrors);
app.use(ormErrorHandler);    // ← ANTES de boomErrorHandler
app.use(boomErrorHandler);
app.use(errorHandler);

// 6. Iniciar servidor
app.listen(port, () => {
  console.log('API running on port', port);
});
```

**⚠️ Si cambias el orden**:
- `require('./libs/sequelize')` después de `app.listen()` → Modelos no inicializados
- `ormErrorHandler` después de `boomErrorHandler` → Errores de Sequelize mal manejados

---

## 🛠️ Convenciones de Arquitectura

### Naming Conventions
- **Routes**: `{entity}.router.js` (ej: `investigadores.router.js`)
- **Services**: `{entity}.service.js` (ej: `investigador.service.js`)
- **Models**: `{entity}.model.js` (ej: `investigador.model.js`)
- **Schemas**: Agrupados en `academic.schema.js`
- **Middleware**: `{action}.handler.js`

### Import/Export Patterns
```javascript
// Services
module.exports = InvestigadorService;

// Schemas
module.exports = { createSchema, updateSchema, getSchema };

// Middleware
module.exports = validatorHandler;

// Multiple handlers
module.exports = { logErrors, errorHandler, boomErrorHandler };
```

### Response Patterns
```javascript
// Éxito
res.json(data);              // GET, PUT, PATCH, DELETE
res.status(201).json(data);  // POST (Created)

// Errores
next(boom.badRequest(error)); // Validación
next(boom.notFound('msg'));   // No encontrado
throw boom.internal('msg');   // Error interno
```

---

## 📦 Extensibilidad

### Agregar Nueva Entidad (5 pasos)

1. **Crear modelo** en `db/models/{entity}.model.js`
2. **Registrar modelo** en `db/models/index.js`:
   - Importar: `const { Entity, EntitySchema } = require('./{entity}.model');`
   - Inicializar: `Entity.init(EntitySchema, Entity.config(sequelize));`
   - Asociar: `Entity.associate(sequelize.models);`
3. **Crear servicio** en `services/{entity}.service.js`
4. **Definir esquemas** en `schemas/academic.schema.js`
5. **Crear router** en `routes/{entity}.router.js` y registrar en `routes/index.js`

### Agregar Middleware
1. Crear handler en `middleware/{feature}.handler.js`
2. Registrar en `index.js` (global) o aplicar a rutas específicas
3. Mantener orden de middleware

---

[⬅️ Anterior: Postman](./04-postman.md) | [⬆️ Volver al Índice](./README.md) | [➡️ Siguiente: Patrones](./06-patrones.md)
