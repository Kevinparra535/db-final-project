# Academic Research Database API

API RESTful para gestión de base de datos académica universitaria. Sistema para administrar investigadores, profesores, estudiantes, facultades, grupos de investigación, afiliaciones, proyectos, productos, convocatorias y producción académica.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura en capas (MVC-like) con separación clara de responsabilidades:

```
├── routes/          # Endpoints HTTP y manejo de peticiones
├── services/        # Lógica de negocio y manipulación de datos
├── schemas/         # Validación de datos con Joi
├── middleware/      # Middleware transversal (validación, errores)
└── index.js         # Punto de entrada de la aplicación
```

### Flujo de Datos

```
Request → Router → Middleware → Service → Response
                    ↓
                 Validation + Error Handling
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+ 
- npm

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd data-final

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 📡 API Endpoints

### Books API (Temporal - Solo para Demo)
- `GET /api/v1/books` - Listar todos los libros
- `GET /api/v1/books/:id` - Obtener libro por ID
- `GET /api/v1/books/filter` - Filtrar libros
- `POST /api/v1/books` - Crear nuevo libro
- `PUT /api/v1/books/:id` - Actualizar libro completo
- `PATCH /api/v1/books/:id` - Actualizar libro parcial
- `DELETE /api/v1/books/:id` - Eliminar libro

### APIs Target (Entidades Académicas)
**Entidades Core:**
- `GET/POST/PUT/DELETE /api/v1/investigadores` - Gestión de investigadores
- `GET/POST/PUT/DELETE /api/v1/profesores` - Gestión de profesores
- `GET/POST/PUT/DELETE /api/v1/estudiantes` - Gestión de estudiantes
- `GET/POST/PUT/DELETE /api/v1/facultades` - Gestión de facultades

**Estructura Académica:**
- `GET/POST/PUT/DELETE /api/v1/grupos` - Grupos de investigación
- `GET/POST/PUT/DELETE /api/v1/lineas` - Líneas de investigación
- `GET/POST/PUT/DELETE /api/v1/proyectos` - Proyectos de investigación
- `GET/POST/PUT/DELETE /api/v1/productos` - Productos académicos

**Gestión:**
- `GET/POST/PUT/DELETE /api/v1/convocatorias` - Convocatorias
- `GET/POST/PUT/DELETE /api/v1/afiliaciones` - Afiliaciones investigador-grupo
- `GET/POST/PUT/DELETE /api/v1/autorias` - Autorías de productos

### Parámetros de Consulta
- `?size=N` - Limitar número de resultados
- `?limit=N&offset=N` - Paginación

## 🛠️ Tecnologías

### Core
- **Express.js 5.1.0** - Framework web
- **Joi 18.0.1** - Validación de esquemas
- **@hapi/boom 10.0.1** - Manejo de errores HTTP

### Desarrollo
- **ESLint + Prettier** - Linting y formateo
- **Nodemon** - Auto-reload en desarrollo
- **Faker.js** - Generación de datos mock (temporal)

## 🔧 Patrones de Desarrollo

### Servicios
```javascript
class BooksService {
  async create(data) { /* ... */ }
  async find() { /* ... */ }
  async findOne(id) { /* ... */ }
  async update(id, changes) { /* ... */ }
  async delete(id) { /* ... */ }
}
```

### Validación de Esquemas
```javascript
const createBooksSchema = Joi.object().keys({
  name: Joi.string().alphanum().min(3).max(15).required(),
  price: Joi.number().integer().min(1).required(),
});
```

### Middleware de Validación
```javascript
router.get('/:id', 
  validatorHandler(getBooksSchema, 'params'),
  async (req, res) => { /* ... */ }
);
```

## 🎯 Roadmap

### Fase Actual
- ✅ Arquitectura base con Express.js
- ✅ Sistema de routing modular
- ✅ Validación con Joi
- ✅ Manejo centralizado de errores
- ✅ Servicios con operaciones CRUD

### Próximas Fases
- 🔄 Integración con PostgreSQL
- 📊 Entidades académicas (investigadores, proyectos, etc.)
- 🔐 Autenticación y autorización
- 📋 Documentación API con Swagger
- 🧪 Suite de pruebas unitarias

## 📝 Convenciones de Código

### Estructura de Archivos
- **Routers**: `feature.router.js`
- **Servicios**: `feature.services.js`
- **Esquemas**: `validator.schema.js`
- **Middleware**: `handler.js`

### Estilo de Código
- **Indentación**: Tabs (2 espacios)
- **Comillas**: Simples para JS
- **Idioma**: Comentarios en español, código en inglés
- **Naming**: camelCase para variables, PascalCase para clases

## 🔍 Base de Datos (PostgreSQL Target)

### Especificación Completa: `spec/entities.yaml`
El modelo de datos completo está definido en `spec/entities.yaml` con:
- **11 entidades principales** con relaciones complejas
- **11 ENUMs** para campos controlados
- **Multivalued attributes** en tablas separadas
- **Constraints y validaciones** completas
- **Índices optimizados** para consultas frecuentes

### Entidades Core
- `investigador` - Investigadores con emails/teléfonos múltiples
- `profesor` - Profesores con categorías académicas
- `estudiante` - Estudiantes de posgrado con programas
- `facultad` - Facultades universitarias

### Estructura Académica
- `grupo_investigacion` - Grupos de investigación con clasificación Minciencias
- `linea_investigacion` - Líneas de investigación
- `proyecto_investigacion` - Proyectos con presupuestos y estados
- `producto_investigacion` - Productos con metadata JSONB
- `producto` - Productos académicos
- `convocatoria` - Convocatorias de financiación

### Reglas de Dominio
- Investigadores, profesores y estudiantes son entidades independientes
- Grupos pertenecen a facultades
- Proyectos pertenecen a grupos y opcionalmente a convocatorias
- Relaciones many-to-many: afiliación (investigador-grupo), autoría (investigador-producto)

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
