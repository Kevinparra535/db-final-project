# Academic Research Database API 🎓

API RESTful para gestión de base de datos académica universitaria con PostgreSQL y Sequelize ORM. Sistema completo para administrar investigadores, profesores, estudiantes, facultades, grupos de investigación, proyectos, productos académicos y todas sus relaciones.

> **✅ Estado**: Sistema completamente funcional con PostgreSQL + Docker

---

## 🚀 Inicio Rápido (Para Evaluadores)

**¿Solo necesitas ejecutar el proyecto?** Sigue estos 5 comandos:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar PostgreSQL con Docker  
npm run docker:up

# 3. Configurar base de datos
npm run db:setup

# 4. Iniciar servidor
npm run dev

# 5. Verificar en navegador
# Abre: http://localhost:3000/api/v1/facultades
```

✅ **¿Funcionó?** Deberías ver datos JSON de las facultades.

📚 **Documentación Completa**: [`docs/README.md`](./docs/README.md)

---

## 📚 Documentación Organizada

Toda la documentación está centralizada en la carpeta [`docs/`](./docs/):

### 🎯 Para Empezar
- **[📖 Índice Principal](./docs/README.md)** ← **EMPIEZA AQUÍ**
- **[🔧 Setup Completo](./docs/01-setup-completo.md)** - Instalación paso a paso
- **[✅ Verificación](./docs/02-verificacion.md)** - Comprobar que todo funciona

### 📡 Usando la API
- **[Guía de API](./docs/03-guia-api.md)** - Todas las entidades y endpoints
- **[Guía Postman](./docs/04-postman.md)** - Probar endpoints con Postman

### 🔧 Para Desarrolladores
- **[Arquitectura](./docs/05-arquitectura.md)** - Cómo está organizado el código
- **[Patrones de Desarrollo](./docs/06-patrones.md)** - Convenciones y mejores prácticas
- **[Base de Datos](./docs/07-base-de-datos.md)** - Modelos y migraciones

### 🆘 Ayuda
- **[Troubleshooting](./docs/08-troubleshooting.md)** - Solución de errores comunes
- **[Scripts NPM](./docs/09-scripts.md)** - Referencia de comandos

---

## 🏗️ Stack Tecnológico

```
├── Express.js 5.1.0 + Node.js 16+
├── PostgreSQL 13+ con Docker
├── Sequelize 6.37.7 ORM
├── Joi 18.0.1 para validación
└── @hapi/boom 10.0.1 para errores
```

**📐 Arquitectura**: Capas (Router → Service → Model → PostgreSQL)  
**📊 Base de Datos**: 13 entidades + 16+ tablas + relaciones complejas  
**📡 API**: 13 routers con CRUD completo + búsquedas + estadísticas  

Ver detalles completos en [Arquitectura](./docs/05-arquitectura.md)

---

## 📡 Entidades y API

El proyecto gestiona **13 entidades académicas** con API REST completa:

| Entidad | Endpoint | Características |
|---------|----------|-----------------|
| Facultades | `/api/v1/facultades` | CRUD + búsquedas + estadísticas |
| Investigadores | `/api/v1/investigadores` | CRUD + emails/teléfonos multivaluados |
| Profesores | `/api/v1/profesores` | CRUD + búsquedas por departamento |
| Estudiantes | `/api/v1/estudiantes` | CRUD + filtros por nivel académico |
| Grupos | `/api/v1/grupos` | CRUD + líneas + clasificación Minciencias |
| Líneas | `/api/v1/lineas` | CRUD + palabras clave |
| Convocatorias | `/api/v1/convocatorias` | CRUD + filtros por tipo/estado |
| Proyectos | `/api/v1/proyectos` | CRUD + presupuestos + líneas |
| Productos | `/api/v1/productos` | CRUD + metadata JSONB + búsquedas |
| Tipos Producto | `/api/v1/tipos-producto` | CRUD + estadísticas de uso |
| Afiliaciones | `/api/v1/afiliaciones` | Investigador ↔ Grupo con roles |
| Autorías | `/api/v1/autorias` | Investigador ↔ Producto |
| Users | `/api/v1/user` | Sistema de usuarios |

**Cada entidad soporta**: GET, POST, PUT, PATCH, DELETE + búsquedas especializadas

📚 **Endpoints completos**: Ver [Guía de API](./docs/03-guia-api.md)  
📡 **Colección Postman**: Ver `postman/Academic_Research_API.postman_collection.json`

---

## 🧪 Verificación Rápida

### Opción A: Navegador Web (Más Fácil)
```
http://localhost:3000/api/v1/facultades
http://localhost:3000/api/v1/investigadores
http://localhost:3000/api/v1/grupos
```

### Opción B: Postman (Recomendado)
1. Importar: `postman/Academic_Research_API.postman_collection.json`
2. Importar: `postman/Academic_API_Environment.postman_environment.json`
3. Ejecutar peticiones organizadas por entidad

### Opción C: pgAdmin (Visual)
```bash
npm run pgadmin
```
- URL: http://localhost:5050
- Login: `admin@mail.com` / `root`
- Conectar a PostgreSQL: Host `db`, User `kevin`, Password `admin123`

---

## 📋 Scripts Esenciales

```bash
# Desarrollo
npm run docker:up      # Iniciar PostgreSQL + pgAdmin
npm run dev            # Servidor con auto-reload
npm run docker:down    # Detener Docker

# Base de Datos
npm run db:setup       # Setup completo (crear + migrar + poblar)
npm run db:reset       # Resetear (undo + migrar + poblar)
npm run db:tables      # Listar tablas

# Verificación
npm run system:verify  # Verificar todo el sistema
npm run config:verify  # Verificar configuración
npm run pgadmin        # Abrir pgAdmin en navegador
```

Ver todos los scripts en [Scripts NPM](./docs/09-scripts.md)

---

## 🛑 Detener el Proyecto

```bash
# Detener servidor: Ctrl+C

# Detener Docker (mantiene datos)
npm run docker:down

# Resetear todo (borra datos)
npm run docker:reset
```

---

## 🆘 Problemas Comunes

| Error | Solución |
|-------|----------|
| `ECONNREFUSED :5432` | Docker no está corriendo → `npm run docker:up` |
| `Port 3000 in use` | Matar proceso → `lsof -i :3000` y `kill -9 <PID>` |
| `database does not exist` | Crear BD → `npm run db:setup` |
| Datos no aparecen | Resetear → `npm run db:reset` |

Ver más en [Troubleshooting](./docs/08-troubleshooting.md)

---

## 📞 Recursos

- **Repositorio**: [github.com/Kevinparra535/db-final-project](https://github.com/Kevinparra535/db-final-project)
- **Documentación**: [`docs/README.md`](./docs/README.md)
- **Postman**: `postman/Academic_Research_API.postman_collection.json`
- **AI Instructions**: [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)

---

## 📄 Licencia

ISC License - Ver `package.json` para detalles
