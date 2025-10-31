# 📚 Documentación del Proyecto - Academic Research Database API

> **Para Profesores/Evaluadores**: Si solo necesitas ejecutar y probar el proyecto, ve directo a [🚀 Inicio Rápido](#-inicio-rápido-para-evaluadores)

## 📖 Índice de Documentación

### 🎯 Para Empezar (Esencial)
1. **[🚀 Inicio Rápido para Evaluadores](#-inicio-rápido-para-evaluadores)** ⬅️ **EMPIEZA AQUÍ**
2. **[Setup Completo](./01-setup-completo.md)** - Instalación paso a paso con Docker
3. **[Verificación del Sistema](./02-verificacion.md)** - Comprobar que todo funciona

### 📡 Usando la API
4. **[Guía de API](./03-guia-api.md)** - Todas las entidades y endpoints disponibles
5. **[Colección Postman](./04-postman.md)** - Cómo usar Postman para probar endpoints

### 🔧 Desarrollo (Para desarrolladores)
6. **[Arquitectura del Proyecto](./05-arquitectura.md)** - Cómo está organizado el código
7. **[Patrones de Desarrollo](./06-patrones.md)** - Convenciones y mejores prácticas
8. **[Base de Datos](./07-base-de-datos.md)** - Modelos, migraciones y esquemas

### 🆘 Solución de Problemas
9. **[Troubleshooting](./08-troubleshooting.md)** - Soluciones a errores comunes
10. **[Scripts Disponibles](./09-scripts.md)** - Referencia completa de comandos npm

---

## 🚀 Inicio Rápido para Evaluadores

**Objetivo**: Levantar el proyecto y verificar que las 13 entidades académicas funcionen correctamente.

### ✅ Requisitos Previos
- **Docker Desktop** instalado y ejecutándose ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- **Node.js 16+** instalado ([Descargar aquí](https://nodejs.org/))
- **10 minutos** de tiempo

### 📋 Pasos para Ejecutar (5 comandos)

```bash
# 1. Clonar el repositorio (o descomprimirlo)
cd ruta/al/proyecto

# 2. Instalar dependencias de Node.js
npm install

# 3. Iniciar PostgreSQL con Docker
npm run docker:up

# 4. Configurar base de datos (crear + migrar + poblar con datos)
npm run db:setup

# 5. Iniciar servidor de desarrollo
npm run dev
```

**✅ Si ves esto, todo funciona:**
```
Example app listening on port 3000!
```

### 🧪 Verificar que Funciona

#### Opción A: Navegador Web (Más Fácil)
1. Abre tu navegador en: `http://localhost:3000/api/v1/`
2. Deberías ver: `"Hola Bienvenido a mi API"`
3. Prueba ver las facultades: `http://localhost:3000/api/v1/facultades`

#### Opción B: Postman (Recomendado)
1. Abre Postman
2. Importa la colección desde: `postman/Academic_Research_API.postman_collection.json`
3. Importa el entorno desde: `postman/Academic_API_Environment.postman_environment.json`
4. Ejecuta las peticiones de prueba (ver [Guía Postman](./04-postman.md))

#### Opción C: Línea de comandos
```bash
# Ver todas las facultades
curl http://localhost:3000/api/v1/facultades

# Ver todos los investigadores
curl http://localhost:3000/api/v1/investigadores

# Ver todos los grupos de investigación
curl http://localhost:3000/api/v1/grupos
```

### 🎯 Entidades Disponibles para Verificar

El proyecto tiene **13 entidades académicas** funcionando con PostgreSQL:

| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| Facultades | `/api/v1/facultades` | Facultades universitarias |
| Investigadores | `/api/v1/investigadores` | Investigadores con emails/teléfonos |
| Profesores | `/api/v1/profesores` | Profesores con departamentos |
| Estudiantes | `/api/v1/estudiantes` | Estudiantes de posgrado |
| Grupos | `/api/v1/grupos` | Grupos de investigación |
| Líneas | `/api/v1/lineas` | Líneas de investigación |
| Convocatorias | `/api/v1/convocatorias` | Convocatorias de financiación |
| Proyectos | `/api/v1/proyectos` | Proyectos de investigación |
| Productos | `/api/v1/productos` | Productos académicos |
| Tipos Producto | `/api/v1/tipos-producto` | Tipos de productos |
| Afiliaciones | `/api/v1/afiliaciones` | Relación investigador-grupo |
| Autorías | `/api/v1/autorias` | Relación investigador-producto |
| Users | `/api/v1/user` | Usuarios del sistema |

**Cada entidad soporta**: GET, POST, PUT, PATCH, DELETE + endpoints especializados

### 🐘 Ver los Datos en pgAdmin (Opcional)

Si quieres ver visualmente la base de datos:

```bash
# Abrir pgAdmin en el navegador
npm run pgadmin
```

- **URL**: http://localhost:5050
- **Email**: `admin@mail.com`
- **Password**: `root`

Luego conecta al servidor PostgreSQL:
- **Host**: `db` (nombre del contenedor Docker)
- **Usuario**: `kevin`
- **Password**: `admin123`
- **Base de datos**: `academic_db`

### 🛑 Detener el Proyecto

```bash
# Detener el servidor (Ctrl+C en la terminal donde corre)

# Detener Docker (mantiene los datos)
npm run docker:down

# Resetear todo (borra datos y reinicia)
npm run docker:reset
```

---

## 📊 Verificación Rápida de Funcionalidad

### Lista de Verificación para Evaluadores

- [ ] El servidor inicia sin errores en el puerto 3000
- [ ] Puedo ver la lista de facultades en `/api/v1/facultades`
- [ ] Puedo ver la lista de investigadores en `/api/v1/investigadores`
- [ ] Puedo crear una nueva facultad con POST
- [ ] Puedo actualizar una facultad existente con PUT/PATCH
- [ ] Puedo eliminar una facultad con DELETE
- [ ] Los investigadores tienen emails y teléfonos (multivaluados)
- [ ] Las búsquedas funcionan (ej: `/api/v1/investigadores/search/nombre/Juan`)
- [ ] Las estadísticas funcionan (ej: `/api/v1/grupos/estadisticas/clasificaciones`)
- [ ] pgAdmin muestra las 13+ tablas en la base de datos

### Pruebas Básicas con Postman

La colección incluye carpetas organizadas para cada entidad:

1. **CRUD Básico**: Crear, leer, actualizar, eliminar
2. **Búsquedas**: Por nombre, apellido, facultad, etc.
3. **Estadísticas**: Conteos, rankings, tendencias
4. **Relaciones**: Afiliaciones, autorías, líneas

Ejecuta las carpetas en orden y verifica que todas respondan con status 200/201.

---

## 🆘 ¿Problemas?

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Solución**: Docker no está corriendo
```bash
npm run docker:up
```

### Error: "Port 3000 already in use"
**Solución**: Ya hay un servidor corriendo
```bash
# Encuentra el proceso
lsof -i :3000
# Mátalo o usa otro puerto editando .env
```

### Error: "Database does not exist"
**Solución**: No se creó la base de datos
```bash
npm run db:setup
```

### Los datos no aparecen
**Solución**: Resetea la base de datos
```bash
npm run db:reset
```

Ver más soluciones en [Troubleshooting](./08-troubleshooting.md)

---

## 📞 Contacto y Soporte

- **Documentación completa**: Navega por los archivos numerados en esta carpeta
- **Colección Postman**: `postman/Academic_Research_API.postman_collection.json`
- **Repositorio**: [github.com/Kevinparra535/db-final-project](https://github.com/Kevinparra535/db-final-project)

---

## 📚 Navegación de Documentos

- **Siguiente**: [Setup Completo](./01-setup-completo.md) - Instalación detallada
- **Ver también**: [Guía de API](./03-guia-api.md) - Todos los endpoints
