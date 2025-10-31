# 📮 Guía de Postman

[⬅️ Volver al Índice](./README.md)

Esta guía explica cómo usar la colección de Postman para probar la API del sistema académico.

---

## 📥 Instalación y Configuración

### 1. Instalar Postman
- Descargar desde [postman.com/downloads](https://www.postman.com/downloads/)
- O usar la versión web: [web.postman.co](https://web.postman.co)

### 2. Importar la Colección

**Archivos a importar** (en carpeta `postman/`):
- `Academic_Research_API.postman_collection.json` - Colección completa
- `Academic_API_Environment.postman_environment.json` - Variables de entorno

**Pasos**:
1. Abrir Postman
2. Clic en **"Import"** (esquina superior izquierda)
3. Arrastrar los 2 archivos JSON o usar **"Upload Files"**
4. Confirmar importación

### 3. Configurar el Entorno

**Seleccionar entorno**:
- En la esquina superior derecha, seleccionar **"Academic API Environment"**

**Variables incluidas**:
```
base_url: http://localhost:3000/api/v1
investigador_id: INV0000001
facultad_id: FAC0000001
grupo_id: GRP0000001
proyecto_id: PRY0000001
producto_id: PRD0000001
```

**✅ Verificar que el servidor esté corriendo**:
```bash
npm run dev
```

---

## 📁 Estructura de la Colección

La colección contiene **13 carpetas principales**, una por cada entidad:

### 1. Facultades (Faculties)
- ✅ **PostgreSQL** - Base de datos real
- 7 requests: CRUD completo + búsquedas (nombre, ciudad)

### 2. Investigadores (Researchers)
- ✅ **PostgreSQL** - Base de datos real
- 15 requests: CRUD + búsquedas + emails + teléfonos + activos/inactivos

### 3. Profesores (Professors)
- ✅ **PostgreSQL** - Base de datos real
- 10 requests: CRUD + búsquedas (nombre, departamento, categoría)

### 4. Estudiantes (Students)
- ✅ **PostgreSQL** - Base de datos real
- 12 requests: CRUD + búsquedas (nombre, programa, nivel, semestre)

### 5. Grupos de Investigación (Research Groups)
- ✅ **PostgreSQL** - Base de datos real
- 15 requests: CRUD + líneas + clasificaciones + rankings

### 6. Líneas de Investigación (Research Lines)
- ✅ **PostgreSQL** - Base de datos real
- 8 requests: CRUD + búsquedas + estadísticas

### 7. Convocatorias (Calls for Projects)
- ✅ **PostgreSQL** - Base de datos real
- 13 requests: CRUD + activas + próximas a vencer + estadísticas

### 8. Proyectos (Research Projects)
- ✅ **PostgreSQL** - Base de datos real
- 17 requests: CRUD + búsquedas + líneas + activos + estadísticas

### 9. Productos (Research Products)
- ✅ **PostgreSQL** - Base de datos real
- 16 requests: CRUD + búsquedas + metadata JSONB + tendencias

### 10. Tipos de Producto (Product Types)
- ✅ **PostgreSQL** - Base de datos real
- 12 requests: CRUD + búsquedas + estadísticas + rankings

### 11. Afiliaciones (Affiliations)
- ✅ **PostgreSQL** - Base de datos real
- 20 requests: CRUD + búsquedas + gestión de afiliaciones + historial

### 12. Autorías (Authorships)
- ✅ **PostgreSQL** - Base de datos real
- 19 requests: CRUD + búsquedas + colaboraciones + productividad

### 13. Users (Authentication)
- ✅ **PostgreSQL** - Base de datos real
- 5 requests: CRUD básico

---

## 🚀 Flujos de Prueba Recomendados

### Flujo 1: Verificación Básica (5 minutos)

**Objetivo**: Verificar que la API funciona correctamente

```
1. GET Facultades > Get All Faculties
   ✓ Debe retornar lista de facultades
   
2. POST Facultades > Create Faculty
   ✓ Debe crear nueva facultad (código 201)
   
3. GET Investigadores > Get All Researchers
   ✓ Debe retornar investigadores con emails y teléfonos
   
4. GET Grupos > Get All Groups
   ✓ Debe retornar grupos (mock data)
   
5. GET Proyectos > Get All Projects
   ✓ Debe retornar proyectos (mock data)
```

### Flujo 2: Investigadores Completo (PostgreSQL)

**Objetivo**: Probar operaciones avanzadas con datos reales

```
1. GET Investigadores > Get All Researchers
   → Ver investigadores existentes
   
2. POST Investigadores > Create Researcher
   → Crear investigador con emails y teléfonos
   → Guardar el ID generado
   
3. GET Investigadores > Get Researcher by ID
   → Usar el ID guardado
   
4. POST Investigadores > Add Email to Researcher
   → Agregar email adicional
   
5. GET Investigadores > Get Researcher Emails
   → Verificar que se agregó
   
6. PATCH Investigadores > Update Researcher
   → Actualizar campos
   
7. GET Investigadores > Search by Name
   → Buscar por nombre
   
8. DELETE Investigadores > Delete Researcher
   → Eliminar investigador creado
```

### Flujo 3: Gestión de Afiliaciones

**Objetivo**: Probar relaciones investigador-grupo

```
1. GET Afiliaciones > Get All Affiliations
   → Ver afiliaciones existentes
   
2. POST Afiliaciones > Create Affiliation
   → Crear afiliación activa
   
3. GET Afiliaciones > Get Active Affiliations
   → Verificar que aparece
   
4. PATCH Afiliaciones > Change Role
   → Cambiar rol (líder → coinvestigador)
   
5. PATCH Afiliaciones > Finalize Affiliation
   → Finalizar afiliación
   
6. GET Afiliaciones > Get Affiliation History
   → Ver historial completo
```

### Flujo 4: Productividad Científica

**Objetivo**: Probar generación de productos y análisis

```
1. POST Productos > Create Product
   → Crear nuevo producto
   
2. POST Autorías > Create Authorship
   → Asociar investigador como autor
   
3. GET Productos > Get Products by Type
   → Filtrar por tipo de producto
   
4. GET Autorías > Get Researcher Productivity
   → Ver estadísticas de productividad
   
5. GET Autorías > Get Collaboration Network
   → Ver red de colaboración
   
6. GET Productos > Get Publication Trends
   → Ver tendencias de publicación
```

---

## 📊 Casos de Uso por Entidad

### Facultades (PostgreSQL ✅)

**Crear facultad**:
```json
POST /api/v1/facultades
{
  "id_facultad": "FAC0000099",
  "nombre": "Facultad de Ciencias",
  "decano": "Dra. María García",
  "sede": "Sede Norte",
  "ciudad": "Medellín"
}
```

**Buscar por ciudad**:
```
GET /api/v1/facultades/search/ciudad/Medellín
```

### Investigadores (PostgreSQL ✅)

**Crear investigador con multivalores**:
```json
POST /api/v1/investigadores
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "tipo_id": "CC",
  "num_id": "1234567890",
  "orcid": "0000-0001-2345-6789",
  "facultad": "FAC0000001",
  "emails": [
    {
      "email": "juan.perez@universidad.edu.co",
      "etiqueta": "institucional"
    },
    {
      "email": "juan@gmail.com",
      "etiqueta": "personal"
    }
  ],
  "telefonos": [
    {
      "numero": "3001234567",
      "tipo": "móvil"
    }
  ]
}
```

**Agregar email adicional**:
```json
POST /api/v1/investigadores/INV0000001/emails
{
  "email": "nuevo@email.com",
  "etiqueta": "otro"
}
```

### Grupos de Investigación

**Buscar por clasificación**:
```
GET /api/v1/grupos/search/clasificacion/A1
```

**Ver ranking por líneas**:
```
GET /api/v1/grupos/ranking/lineas
```

### Proyectos

**Proyectos próximos a finalizar**:
```
GET /api/v1/proyectos/proximos-finalizar/60
```

**Estadísticas por estado**:
```
GET /api/v1/proyectos/estadisticas/estados
```

### Productos

**Buscar por metadata JSONB**:
```
GET /api/v1/productos/search/metadata/Q1
```

**Agregar campo a metadata**:
```json
POST /api/v1/productos/PRD0000001/metadata/cuartil
{
  "valor": "Q1"
}
```

### Afiliaciones

**Cambiar rol**:
```json
PATCH /api/v1/afiliaciones/1/cambiar-rol
{
  "nuevo_rol": "coinvestigador"
}
```

**Finalizar afiliación**:
```json
PATCH /api/v1/afiliaciones/1/finalizar
{
  "fecha_fin": "2024-12-31"
}
```

### Autorías

**Ver red de colaboración**:
```
GET /api/v1/autorias/red-colaboracion/investigador/INV0000001
```

**Ranking de productividad**:
```
GET /api/v1/autorias/ranking/productivos
```

---

## 🔍 Debugging y Troubleshooting

### Problema: "Could not send request"

**Causa**: El servidor no está corriendo

**Solución**:
```bash
# Terminal 1: Iniciar Docker
npm run docker:up

# Terminal 2: Iniciar servidor
npm run dev
```

### Problema: "404 Not Found"

**Causa**: URL incorrecta o endpoint no existe

**Solución**:
- Verificar que `base_url` en entorno sea `http://localhost:3000/api/v1`
- Revisar que el endpoint existe en [03-guia-api.md](./03-guia-api.md)

### Problema: "500 Internal Server Error"

**Causa**: Error en servidor (probablemente base de datos)

**Solución**:
```bash
# Verificar estado de la base de datos
npm run system:verify

# Si hay problemas, resetear
npm run db:reset
```

### Problema: "400 Bad Request - Validation Error"

**Causa**: Datos enviados no cumplen validación Joi

**Solución**:
- Revisar el mensaje de error (indica el campo problemático)
- Verificar esquemas en [schemas/academic.schema.js](../schemas/academic.schema.js)
- Ejemplo: `"orcid" must match pattern ^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$`

### Problema: "409 Conflict"

**Causa**: Violación de constraint (duplicado, FK inválida)

**Solución**:
- Verificar que IDs no estén duplicados
- Asegurar que FKs existan (ej: `facultad` debe existir en Facultades)
- Revisar constraints en base de datos

---

## 📋 Checklist de Verificación

### Antes de probar

- [ ] Docker corriendo (`docker ps` muestra contenedores)
- [ ] Base de datos creada (`npm run db:setup` o `npm run db:migrate`)
- [ ] Servidor API corriendo (`npm run dev`)
- [ ] Postman abierto con colección importada
- [ ] Entorno "Academic API Environment" seleccionado

### Prueba básica (5 minutos)

- [ ] GET Facultades funciona
- [ ] POST Facultades crea registro
- [ ] GET Investigadores retorna datos con emails
- [ ] Búsquedas funcionan correctamente
- [ ] Errores retornan JSON con statusCode/error/message

### Prueba avanzada (15 minutos)

- [ ] Crear investigador con emails y teléfonos
- [ ] Agregar email adicional a investigador
- [ ] Crear afiliación investigador-grupo
- [ ] Cambiar rol de afiliación
- [ ] Crear producto y autoría
- [ ] Ver estadísticas y rankings
- [ ] Eliminar registros creados

---

## 🎯 Estado de Migración

### ✅ TODAS las Entidades en PostgreSQL

| Entidad | Estado | Funcionalidad |
|---------|--------|---------------|
| **Facultades** | ✅ PostgreSQL | CRUD + búsquedas funcionando |
| **Investigadores** | ✅ PostgreSQL | CRUD + emails + teléfonos + búsquedas |
| **Profesores** | ✅ PostgreSQL | CRUD + correos + búsquedas + estadísticas |
| **Estudiantes** | ✅ PostgreSQL | CRUD + búsquedas por programa/nivel |
| **Grupos** | ✅ PostgreSQL | CRUD + líneas + rankings + estadísticas |
| **Líneas** | ✅ PostgreSQL | CRUD + búsquedas + estadísticas |
| **Convocatorias** | ✅ PostgreSQL | CRUD + filtros + estadísticas |
| **Proyectos** | ✅ PostgreSQL | CRUD + líneas + búsquedas avanzadas |
| **Productos** | ✅ PostgreSQL | CRUD + metadata JSONB + tendencias |
| **TiposProducto** | ✅ PostgreSQL | CRUD + estadísticas de uso |
| **Afiliaciones** | ✅ PostgreSQL | CRUD + gestión de roles + historial |
| **Autorías** | ✅ PostgreSQL | CRUD + red de colaboración + productividad |
| **Users** | ✅ PostgreSQL | CRUD básico |

**⚠️ IMPORTANTE**: 
- **TODAS** las entidades requieren que PostgreSQL (Docker) esté corriendo
- Si Docker se apaga, la API retornará errores 500 en TODOS los endpoints
- No hay datos mock - todo está en base de datos real

---

## 🔗 Referencias

- [Guía Completa de API](./03-guia-api.md) - Documentación de todos los endpoints
- [Verificación del Sistema](./02-verificacion.md) - Cómo verificar que todo funciona
- [Troubleshooting](./08-troubleshooting.md) - Solución de problemas comunes

---

[⬅️ Anterior: Guía API](./03-guia-api.md) | [⬆️ Volver al Índice](./README.md) | [➡️ Siguiente: Arquitectura](./05-arquitectura.md)
