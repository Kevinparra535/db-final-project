# 📡 Guía Completa de API

[⬅️ Volver al Índice](./README.md)

Esta guía documenta todos los endpoints disponibles en la API del sistema de gestión académica.

---

## 📍 Información General

### Base URL
```
http://localhost:3000/api/v1
```

### Códigos de Estado HTTP
| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| `200` | OK | Operación exitosa (GET, PUT, PATCH, DELETE) |
| `201` | Created | Recurso creado exitosamente (POST) |
| `400` | Bad Request | Error de validación en los datos enviados |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto (ej: duplicado, violación de constraint) |
| `500` | Internal Server Error | Error interno del servidor |

### Formato de Respuestas

**Éxito**:
```json
{
  "id": "FAC0000001",
  "nombre": "Facultad de Ingeniería",
  "ciudad": "Bogotá"
}
```

**Error**:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "\"nombre\" is required"
}
```

---

## 🏛️ Facultades

### Listar todas las facultades
```http
GET /api/v1/facultades
```

**Respuesta**:
```json
[
  {
    "id_facultad": "FAC0000001",
    "nombre": "Facultad de Ingeniería",
    "decano": "Dr. Juan Pérez",
    "sede": "Sede Central",
    "ciudad": "Bogotá"
  }
]
```

### Obtener una facultad
```http
GET /api/v1/facultades/:id
```

### Buscar por nombre
```http
GET /api/v1/facultades/search/nombre/:nombre
```

### Buscar por ciudad
```http
GET /api/v1/facultades/search/ciudad/:ciudad
```

### Crear facultad
```http
POST /api/v1/facultades
Content-Type: application/json

{
  "id_facultad": "FAC0000099",
  "nombre": "Facultad de Ciencias",
  "decano": "Dra. María García",
  "sede": "Sede Norte",
  "ciudad": "Medellín"
}
```

### Actualizar facultad
```http
PUT /api/v1/facultades/:id      # Actualización completa
PATCH /api/v1/facultades/:id    # Actualización parcial
```

### Eliminar facultad
```http
DELETE /api/v1/facultades/:id
```

---

## 👥 Investigadores

### Listar todos
```http
GET /api/v1/investigadores
```

**Respuesta incluye emails y teléfonos**:
```json
[
  {
    "id_investigador": "INV0000001",
    "nombres": "Ana María",
    "apellidos": "González López",
    "tipo_id": "CC",
    "num_id": "12345678",
    "orcid": "0000-0001-2345-6789",
    "facultad": "FAC0000001",
    "emails": [
      {
        "email": "ana.gonzalez@universidad.edu.co",
        "etiqueta": "institucional"
      },
      {
        "email": "ana@gmail.com",
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
]
```

### Búsquedas especializadas
```http
GET /api/v1/investigadores/search/nombre/:nombre
GET /api/v1/investigadores/search/apellido/:apellido
GET /api/v1/investigadores/search/orcid/:orcid
GET /api/v1/investigadores/activos
GET /api/v1/investigadores/inactivos
```

### Gestión de emails
```http
GET /api/v1/investigadores/:id/emails
POST /api/v1/investigadores/:id/emails
DELETE /api/v1/investigadores/:id/emails/:email
```

**Agregar email**:
```json
{
  "email": "nuevo@email.com",
  "etiqueta": "personal"
}
```

### Gestión de teléfonos
```http
GET /api/v1/investigadores/:id/telefonos
POST /api/v1/investigadores/:id/telefonos
DELETE /api/v1/investigadores/:id/telefonos/:numero
```

**Agregar teléfono**:
```json
{
  "numero": "3009876543",
  "tipo": "móvil"
}
```

### Crear investigador (con emails y teléfonos)
```http
POST /api/v1/investigadores
Content-Type: application/json

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

---

## 👨‍🏫 Profesores

### Listar todos
```http
GET /api/v1/profesores
```

**Respuesta**:
```json
[
  {
    "id_profesor": "PROF000001",
    "nombres": "Carlos",
    "apellidos": "Rodríguez",
    "departamento": "Ingeniería de Sistemas",
    "categoria": "asociado",
    "dedicacion": "TC",
    "facultad": "FAC0000001"
  }
]
```

**Categorías**: `auxiliar`, `asistente`, `asociado`, `titular`  
**Dedicación**: `TC` (Tiempo Completo), `MT` (Medio Tiempo), `HC` (Hora Cátedra)

### Búsquedas
```http
GET /api/v1/profesores/search/nombre/:nombre
GET /api/v1/profesores/search/departamento/:departamento
GET /api/v1/profesores/search/categoria/:categoria
```

### Estadísticas
```http
GET /api/v1/profesores/estadisticas/departamentos
```

---

## 🎓 Estudiantes

### Listar todos
```http
GET /api/v1/estudiantes
```

**Niveles académicos**: `pregrado`, `maestría`, `doctorado`

### Búsquedas
```http
GET /api/v1/estudiantes/search/nombre/:nombre
GET /api/v1/estudiantes/search/programa/:programa
GET /api/v1/estudiantes/search/nivel/:nivel
GET /api/v1/estudiantes/search/semestre-rango/:min/:max
```

### Estadísticas
```http
GET /api/v1/estudiantes/estadisticas/niveles
```

---

## 👥 Grupos de Investigación

### Listar todos
```http
GET /api/v1/grupos
```

**Clasificaciones Minciencias**: `A1`, `A`, `B`, `C`, `D`, `Reconocido`

### Búsquedas
```http
GET /api/v1/grupos/search/nombre/:nombre
GET /api/v1/grupos/search/facultad/:facultadId
GET /api/v1/grupos/search/clasificacion/:clasificacion
```

### Gestión de líneas de investigación
```http
GET /api/v1/grupos/:id/lineas
POST /api/v1/grupos/:id/lineas/:lineaId
DELETE /api/v1/grupos/:id/lineas/:lineaId
```

### Rankings y estadísticas
```http
GET /api/v1/grupos/ranking/lineas
GET /api/v1/grupos/estadisticas/clasificaciones
```

---

## 🔍 Líneas de Investigación

### Listar todas
```http
GET /api/v1/lineas
```

### Búsquedas
```http
GET /api/v1/lineas/search/nombre/:nombre
GET /api/v1/lineas/search/keywords/:keywords
```

### Estadísticas
```http
GET /api/v1/lineas/estadisticas
```

---

## 📢 Convocatorias

### Listar todas
```http
GET /api/v1/convocatorias
```

**Tipos**: `interna`, `Minciencias`, `internacional`, `otra`  
**Estados**: `abierta`, `cerrada`, `en_evaluación`, `finalizada`

### Convocatorias activas
```http
GET /api/v1/convocatorias/activas
GET /api/v1/convocatorias/proximas-vencer        # Próximos 30 días
GET /api/v1/convocatorias/proximas-vencer/:dias  # Próximos N días
```

### Búsquedas
```http
GET /api/v1/convocatorias/search/nombre/:nombre
GET /api/v1/convocatorias/search/tipo/:tipo
GET /api/v1/convocatorias/search/estado/:estado
```

### Estadísticas
```http
GET /api/v1/convocatorias/estadisticas/tipos
GET /api/v1/convocatorias/estadisticas/estados
```

---

## 🚀 Proyectos de Investigación

### Listar todos (con paginación)
```http
GET /api/v1/proyectos?limite=10&desde=0
```

**Estados**: `formulación`, `en_ejecución`, `finalizado`, `cancelado`

### Búsquedas
```http
GET /api/v1/proyectos/search/titulo/:titulo
GET /api/v1/proyectos/search/estado/:estado
GET /api/v1/proyectos/search/grupo/:grupoId
GET /api/v1/proyectos/search/convocatoria/:convocatoriaId
GET /api/v1/proyectos/search/fechas/:fechaInicio/:fechaFin
```

### Proyectos activos
```http
GET /api/v1/proyectos/activos
GET /api/v1/proyectos/proximos-finalizar        # Próximos 30 días
GET /api/v1/proyectos/proximos-finalizar/:dias
```

### Gestión de líneas
```http
GET /api/v1/proyectos/:id/lineas
POST /api/v1/proyectos/:id/lineas/:lineaId
DELETE /api/v1/proyectos/:id/lineas/:lineaId
```

### Estadísticas
```http
GET /api/v1/proyectos/estadisticas/estados
GET /api/v1/proyectos/estadisticas/grupos
GET /api/v1/proyectos/ranking/antiguos
GET /api/v1/proyectos/ranking/antiguos/:limite
```

---

## 📝 Productos de Investigación

### Listar todos
```http
GET /api/v1/productos?limite=20&desde=0
```

### Búsquedas
```http
GET /api/v1/productos/search/titulo/:titulo
GET /api/v1/productos/search/tipo/:tipoId
GET /api/v1/productos/search/proyecto/:proyectoId
GET /api/v1/productos/search/año/:año
GET /api/v1/productos/search/años/:añoInicio/:añoFin
GET /api/v1/productos/search/metadata/:keywords
```

### Productos recientes
```http
GET /api/v1/productos/recientes           # 10 más recientes
GET /api/v1/productos/recientes/:limite
```

### Gestión de metadata (JSONB)
```http
GET /api/v1/productos/:id/metadata
PUT /api/v1/productos/:id/metadata
POST /api/v1/productos/:id/metadata/:campo
DELETE /api/v1/productos/:id/metadata/:campo
```

**Agregar campo a metadata**:
```json
{
  "valor": "Q1"
}
```

### Estadísticas
```http
GET /api/v1/productos/estadisticas/tipos
GET /api/v1/productos/estadisticas/años
GET /api/v1/productos/estadisticas/proyectos
GET /api/v1/productos/ranking/proyectos
GET /api/v1/productos/tendencias/publicacion
```

---

## 📋 Tipos de Producto

### Listar todos
```http
GET /api/v1/tipos-producto
GET /api/v1/tipos-producto?categoria=Publicación científica&activo=true
```

**Categorías**: Publicación científica, Producto tecnológico, Evento científico, Formación académica

### Búsquedas
```http
GET /api/v1/tipos-producto/search/nombre/:nombre
GET /api/v1/tipos-producto/search/categoria/:categoria
GET /api/v1/tipos-producto/activos
```

### Productos por tipo
```http
GET /api/v1/tipos-producto/:id/productos
GET /api/v1/tipos-producto/:id/estadisticas
```

### Rankings
```http
GET /api/v1/tipos-producto/estadisticas/uso
GET /api/v1/tipos-producto/ranking/mas-utilizados
GET /api/v1/tipos-producto/ranking/mas-utilizados/:limite
```

---

## 🤝 Afiliaciones (Investigador ↔ Grupo)

### Listar todas
```http
GET /api/v1/afiliaciones?limite=50&desde=0
```

**Roles**: `líder`, `coinvestigador`, `semillerista`, `asistente`, `administrativo`  
**Estados**: `activa`, `inactiva`, `finalizada`

### Búsquedas
```http
GET /api/v1/afiliaciones/search/investigador/:investigadorId
GET /api/v1/afiliaciones/search/grupo/:grupoId
GET /api/v1/afiliaciones/search/rol/:rol
GET /api/v1/afiliaciones/search/fechas/:fechaInicio/:fechaFin
```

### Filtros por rol
```http
GET /api/v1/afiliaciones/activas
GET /api/v1/afiliaciones/lideres
GET /api/v1/afiliaciones/coinvestigadores
GET /api/v1/afiliaciones/semilleristas
```

### Gestión de afiliaciones
```http
PATCH /api/v1/afiliaciones/:id/finalizar
PATCH /api/v1/afiliaciones/:id/cambiar-rol
PATCH /api/v1/afiliaciones/:id/transferir
```

**Finalizar**:
```json
{
  "fecha_fin": "2024-12-31"
}
```

**Cambiar rol**:
```json
{
  "nuevo_rol": "coinvestigador"
}
```

### Historial y estadísticas
```http
GET /api/v1/afiliaciones/historial/investigador/:investigadorId
GET /api/v1/afiliaciones/evolucion/grupo/:grupoId
GET /api/v1/afiliaciones/estadisticas/roles
GET /api/v1/afiliaciones/ranking/grupos-miembros
```

---

## ✍️ Autorías (Investigador ↔ Producto)

### Listar todas
```http
GET /api/v1/autorias?limite=100&desde=0
```

**Roles**: `autor`, `coautor`, `director`

### Búsquedas
```http
GET /api/v1/autorias/search/investigador/:investigadorId
GET /api/v1/autorias/search/producto/:productoId
GET /api/v1/autorias/search/rol/:rol
GET /api/v1/autorias/search/año/:año
```

### Filtros por rol
```http
GET /api/v1/autorias/autores-principales
GET /api/v1/autorias/coautores
GET /api/v1/autorias/directores
```

### Análisis de colaboraciones
```http
GET /api/v1/autorias/colaboraciones
GET /api/v1/autorias/colaboraciones/investigador/:investigadorId
GET /api/v1/autorias/red-colaboracion/investigador/:investigadorId
GET /api/v1/autorias/productos-colaborativos
```

### Gestión
```http
PATCH /api/v1/autorias/:id/cambiar-rol
PATCH /api/v1/autorias/:id/transferir
POST /api/v1/autorias/:id/duplicar
```

### Rankings de productividad
```http
GET /api/v1/autorias/estadisticas/roles
GET /api/v1/autorias/estadisticas/productividad
GET /api/v1/autorias/ranking/productivos
GET /api/v1/autorias/ranking/colaboradores
GET /api/v1/autorias/tendencias/colaboracion
```

---

## 📝 Ejemplos de Uso Completos

### Crear investigador con emails y teléfonos
```bash
curl -X POST http://localhost:3000/api/v1/investigadores \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Buscar investigadores activos
```bash
curl http://localhost:3000/api/v1/investigadores/activos
```

### Agregar email a investigador
```bash
curl -X POST http://localhost:3000/api/v1/investigadores/INV0000001/emails \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@email.com",
    "etiqueta": "otro"
  }'
```

### Ver estadísticas de grupos por clasificación
```bash
curl http://localhost:3000/api/v1/grupos/estadisticas/clasificaciones
```

---

[⬅️ Volver al Índice](./README.md) | [➡️ Siguiente: Guía Postman](./04-postman.md)
