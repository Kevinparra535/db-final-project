# API Documentation - Academic Research Database

Documentación completa de todos los endpoints de la API del sistema de gestión académica universitaria.

## 📍 Base URL

```
http://localhost:3000/api/v1
```

## 🔑 Convenciones Generales

### Formatos de Respuesta
- **Éxito**: JSON con datos solicitados
- **Error**: JSON con estructura de error (powered by @hapi/boom)

### Códigos de Estado HTTP
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error en validación de datos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: duplicado)
- `500 Internal Server Error` - Error interno del servidor

### Parámetros de Consulta Globales
- `limite` - Número máximo de resultados
- `desde` - Offset para paginación
- `size` - Alias para limite (compatibilidad)

---

## 👥 Entidades Core

### 🏛️ Facultades

**Base Path**: `/facultades`

#### Listar Facultades
```http
GET /facultades
```
**Respuesta**:
```json
[
  {
    "id": "FAC001",
    "nombre": "Facultad de Ingeniería",
    "decano": "Dr. Juan Pérez",
    "sede": "Sede Central",
    "ciudad": "Bogotá",
    "fecha_creacion": "2023-01-15T10:30:00Z",
    "fecha_actualizacion": "2023-10-01T14:20:00Z"
  }
]
```

#### Obtener Facultad por ID
```http
GET /facultades/:id
```
**Parámetros**:
- `id` (string): ID de la facultad

#### Buscar Facultades por Nombre
```http
GET /facultades/search/nombre/:nombre
```
**Parámetros**:
- `nombre` (string): Término de búsqueda en el nombre

#### Buscar Facultades por Ciudad
```http
GET /facultades/search/ciudad/:ciudad
```
**Parámetros**:
- `ciudad` (string): Ciudad de la facultad

#### Crear Facultad
```http
POST /facultades
```
**Body**:
```json
{
  "nombre": "Facultad de Ciencias",
  "decano": "Dra. María García",
  "sede": "Sede Norte",
  "ciudad": "Medellín"
}
```

#### Actualizar Facultad
```http
PUT /facultades/:id
PATCH /facultades/:id
```
**Body**: Campos a actualizar (PUT requiere todos, PATCH permite parciales)

#### Eliminar Facultad
```http
DELETE /facultades/:id
```

---

### 🔬 Investigadores

**Base Path**: `/investigadores`

#### Listar Investigadores
```http
GET /investigadores
```
**Respuesta**:
```json
[
  {
    "id": "INV001",
    "nombres": "Ana María",
    "apellidos": "González López",
    "tipo_id": "CC",
    "num_id": "12345678",
    "orcid": "0000-0000-0000-0000",
    "estado": "activo",
    "fecha_registro": "2023-01-15",
    "emails": [
      {
        "email": "ana.gonzalez@universidad.edu.co",
        "etiqueta": "institucional"
      }
    ],
    "telefonos": [
      {
        "numero": "+57 300 123 4567",
        "tipo": "móvil"
      }
    ]
  }
]
```

#### Búsquedas Especializadas
```http
GET /investigadores/search/nombre/:nombre
GET /investigadores/search/apellido/:apellido
GET /investigadores/search/orcid/:orcid
GET /investigadores/activos
GET /investigadores/inactivos
```

#### Gestión de Emails
```http
GET /investigadores/:id/emails
POST /investigadores/:id/emails
DELETE /investigadores/:id/emails/:email
```

**Agregar Email**:
```json
{
  "email": "ana.personal@gmail.com",
  "etiqueta": "personal"
}
```

#### Gestión de Teléfonos
```http
GET /investigadores/:id/telefonos
POST /investigadores/:id/telefonos
DELETE /investigadores/:id/telefonos/:numero
```

**Agregar Teléfono**:
```json
{
  "numero": "+57 1 234 5678",
  "tipo": "fijo"
}
```

---

### 👨‍🏫 Profesores

**Base Path**: `/profesores`

#### Listar Profesores
```http
GET /profesores
```
**Respuesta**:
```json
[
  {
    "id": "PROF001",
    "nombres": "Carlos Eduardo",
    "apellidos": "Rodríguez Silva",
    "tipo_id": "CC",
    "num_id": "87654321",
    "correo_institucional": "carlos.rodriguez@universidad.edu.co",
    "telefono": "+57 1 234 5678",
    "fecha_nacimiento": "1975-05-20",
    "categoria": "asociado",
    "dedicacion": "TC",
    "departamento": "Ingeniería de Sistemas"
  }
]
```

#### Búsquedas por Criterios
```http
GET /profesores/search/nombre/:nombre
GET /profesores/search/departamento/:departamento
GET /profesores/search/categoria/:categoria
```

**Categorías válidas**: `auxiliar`, `asistente`, `asociado`, `titular`
**Dedicaciones válidas**: `TC` (Tiempo Completo), `MT` (Medio Tiempo), `HC` (Hora Cátedra)

#### Estadísticas
```http
GET /profesores/estadisticas/departamentos
```
**Respuesta**:
```json
{
  "Ingeniería de Sistemas": {
    "total_profesores": 15,
    "por_categoria": {
      "titular": 3,
      "asociado": 7,
      "asistente": 4,
      "auxiliar": 1
    },
    "por_dedicacion": {
      "TC": 12,
      "MT": 2,
      "HC": 1
    }
  }
}
```

---

### 🎓 Estudiantes

**Base Path**: `/estudiantes`

#### Listar Estudiantes
```http
GET /estudiantes
```
**Respuesta**:
```json
[
  {
    "id": "EST001",
    "nombres": "Laura Patricia",
    "apellidos": "Martínez Herrera",
    "tipo_id": "CC",
    "num_id": "11223344",
    "codigo_estudiantil": "201812345678",
    "programa": "Maestría en Ingeniería de Software",
    "nivel": "maestría",
    "semestre": 3,
    "correo_institucional": "laura.martinez@estudiantes.universidad.edu.co"
  }
]
```

#### Búsquedas Especializadas
```http
GET /estudiantes/search/nombre/:nombre
GET /estudiantes/search/programa/:programa
GET /estudiantes/search/nivel/:nivel
GET /estudiantes/search/semestre-rango/:min/:max
```

**Niveles válidos**: `pregrado`, `maestría`, `doctorado`

#### Estadísticas Académicas
```http
GET /estudiantes/estadisticas/niveles
```
**Respuesta**:
```json
{
  "maestría": {
    "total": 45,
    "promedio_semestre": 2.8,
    "programas_activos": 5
  },
  "doctorado": {
    "total": 23,
    "promedio_semestre": 4.2,
    "programas_activos": 3
  }
}
```

---

## 🏗️ Estructura Académica

### 👥 Grupos de Investigación

**Base Path**: `/grupos`

#### Listar Grupos
```http
GET /grupos
```
**Respuesta**:
```json
[
  {
    "id": "GRP001",
    "nombre": "Grupo de Inteligencia Artificial",
    "clasificacion": "A1",
    "facultad_id": "FAC001",
    "lineas_investigacion": [
      {
        "id": "LIN001",
        "nombre": "Machine Learning",
        "fecha_asociacion": "2023-01-15"
      }
    ]
  }
]
```

#### Búsquedas Especializadas
```http
GET /grupos/search/nombre/:nombre
GET /grupos/search/facultad/:facultadId
GET /grupos/search/clasificacion/:clasificacion
```

**Clasificaciones Minciencias**: `A1`, `A`, `B`, `C`, `Reconocido`

#### Gestión de Líneas de Investigación
```http
GET /grupos/:id/lineas
POST /grupos/:id/lineas/:lineaId
DELETE /grupos/:id/lineas/:lineaId
```

#### Rankings y Estadísticas
```http
GET /grupos/ranking/lineas
GET /grupos/estadisticas/clasificaciones
```

---

### 🔍 Líneas de Investigación

**Base Path**: `/lineas`

#### Listar Líneas
```http
GET /lineas
```

#### Búsquedas por Contenido
```http
GET /lineas/search/nombre/:nombre
GET /lineas/search/keywords/:keywords
```

#### Estadísticas Generales
```http
GET /lineas/estadisticas
```

---

## 💼 Proyectos y Productos

### 📋 Convocatorias

**Base Path**: `/convocatorias`

#### Listar Convocatorias
```http
GET /convocatorias
```
**Respuesta**:
```json
[
  {
    "id": "CONV001",
    "nombre": "Convocatoria Nacional de Investigación 2024",
    "descripcion": "Convocatoria para financiar proyectos de investigación básica y aplicada",
    "tipo": "minciencias",
    "estado": "abierta",
    "fecha_apertura": "2024-01-15",
    "fecha_cierre": "2024-06-30",
    "presupuesto": 500000000,
    "requisitos": "Grupos categoría A o superior",
    "entidad_financiadora": "Minciencias"
  }
]
```

#### Estados de Convocatorias
```http
GET /convocatorias/activas
GET /convocatorias/proximas-vencer        # Próximas 30 días
GET /convocatorias/proximas-vencer/:dias  # Próximos N días
```

#### Búsquedas y Filtros
```http
GET /convocatorias/search/nombre/:nombre
GET /convocatorias/search/tipo/:tipo
GET /convocatorias/search/estado/:estado
```

**Tipos válidos**: `interna`, `minciencias`, `internacional`, `otra`
**Estados válidos**: `abierta`, `cerrada`, `en_evaluacion`, `finalizada`

#### Estadísticas
```http
GET /convocatorias/estadisticas/tipos
GET /convocatorias/estadisticas/estados
```

---

### 🚀 Proyectos de Investigación

**Base Path**: `/proyectos`

#### Listar Proyectos
```http
GET /proyectos?limite=10&desde=0
```
**Respuesta**:
```json
{
  "proyectos": [
    {
      "id": "PROY001",
      "titulo": "Desarrollo de Algoritmos de Machine Learning para Diagnóstico Médico",
      "descripcion": "Investigación aplicada en inteligencia artificial para el sector salud",
      "objetivo_general": "Desarrollar algoritmos precisos para diagnóstico asistido",
      "objetivos_especificos": "1. Crear dataset médico, 2. Entrenar modelos, 3. Validar resultados",
      "metodologia": "Metodología experimental con validación cruzada",
      "estado": "en_ejecucion",
      "fecha_inicio": "2023-02-01",
      "fecha_fin": "2024-12-31",
      "presupuesto": 150000000,
      "grupo_investigacion_id": "GRP001",
      "convocatoria_id": "CONV001"
    }
  ],
  "total": 80,
  "desde": 0,
  "limite": 10
}
```

#### Búsquedas Especializadas
```http
GET /proyectos/search/titulo/:titulo
GET /proyectos/search/estado/:estado
GET /proyectos/search/grupo/:grupoId
GET /proyectos/search/convocatoria/:convocatoriaId
GET /proyectos/search/fechas/:fechaInicio/:fechaFin
```

**Estados válidos**: `propuesto`, `aprobado`, `en_ejecucion`, `finalizado`, `cancelado`

#### Gestión de Estado
```http
GET /proyectos/activos
GET /proyectos/proximos-finalizar        # Próximos 30 días
GET /proyectos/proximos-finalizar/:dias  # Próximos N días
```

#### Gestión de Líneas de Investigación
```http
GET /proyectos/:id/lineas
POST /proyectos/:id/lineas/:lineaId
DELETE /proyectos/:id/lineas/:lineaId
```

#### Analytics y Rankings
```http
GET /proyectos/estadisticas/estados
GET /proyectos/estadisticas/grupos
GET /proyectos/ranking/antiguos           # 10 más antiguos
GET /proyectos/ranking/antiguos/:limite   # N más antiguos
```

---

### 📊 Productos de Investigación

**Base Path**: `/productos`

#### Listar Productos
```http
GET /productos?limite=20&desde=0&tipo=ART&año=2024
```
**Respuesta**:
```json
{
  "productos": [
    {
      "id": "PROD001",
      "titulo": "Machine Learning Applications in Medical Diagnosis: A Systematic Review",
      "descripcion": "Revisión sistemática sobre aplicaciones de ML en diagnóstico médico",
      "año_publicacion": 2024,
      "fecha_publicacion": "2024-03-15",
      "url": "https://journal.example.com/article/123",
      "doi": "10.1234/journal.2024.001",
      "isbn": null,
      "proyecto_investigacion_id": "PROY001",
      "producto_tipo_id": "ART001",
      "metadata": {
        "revista": "International Journal of Medical AI",
        "volumen": 15,
        "numero": 3,
        "paginas": "45-67",
        "indexacion": "Scopus",
        "idioma": "ingles",
        "pais_publicacion": "Colombia",
        "palabras_clave": ["machine learning", "medical diagnosis", "AI", "healthcare"]
      }
    }
  ],
  "total": 120,
  "desde": 0,
  "limite": 20
}
```

#### Búsquedas Avanzadas
```http
GET /productos/search/titulo/:titulo
GET /productos/search/tipo/:tipoId
GET /productos/search/proyecto/:proyectoId
GET /productos/search/año/:año
GET /productos/search/años/:añoInicio/:añoFin
GET /productos/search/metadata/:keywords
```

#### Gestión Temporal
```http
GET /productos/recientes           # 10 más recientes
GET /productos/recientes/:limite   # N más recientes
```

#### Gestión de Metadatos JSONB
```http
GET /productos/:id/metadata
PUT /productos/:id/metadata
POST /productos/:id/metadata/:campo
DELETE /productos/:id/metadata/:campo
```

**Agregar campo a metadatos**:
```json
{
  "valor": "Q1"
}
```

#### Analytics Avanzados
```http
GET /productos/estadisticas/tipos
GET /productos/estadisticas/años
GET /productos/estadisticas/proyectos
GET /productos/ranking/proyectos         # Proyectos más productivos
GET /productos/tendencias/publicacion   # Tendencias temporales
```

---

### 📝 Tipos de Producto

**Base Path**: `/tipos-producto`

#### Listar Tipos
```http
GET /tipos-producto?categoria=publicacion_cientifica&activo=true
```
**Respuesta**:
```json
[
  {
    "id": "ART001",
    "nombre": "Artículo de revista",
    "descripcion": "Artículo publicado en revista científica indexada",
    "categoria": "publicacion_cientifica",
    "activo": true,
    "requiere_doi": true,
    "requiere_isbn": false
  }
]
```

#### Búsquedas por Categoría
```http
GET /tipos-producto/search/nombre/:nombre
GET /tipos-producto/search/categoria/:categoria
GET /tipos-producto/activos
```

**Categorías**: `publicacion_cientifica`, `evento_cientifico`, `formacion`, `propiedad_intelectual`, `desarrollo_tecnologico`, `consultoria`, `divulgacion`

#### Gestión de Productos por Tipo
```http
GET /tipos-producto/:id/productos
GET /tipos-producto/:id/estadisticas
```

#### Rankings de Uso
```http
GET /tipos-producto/estadisticas/uso
GET /tipos-producto/ranking/mas-utilizados      # 10 más usados
GET /tipos-producto/ranking/mas-utilizados/:limite
```

---

## 🤝 Relaciones Académicas

### 👥 Afiliaciones (Investigador ↔ Grupo)

**Base Path**: `/afiliaciones`

#### Listar Afiliaciones
```http
GET /afiliaciones?limite=50&desde=0&rol=lider&activas=true
```
**Respuesta**:
```json
{
  "afiliaciones": [
    {
      "id": "AFIL001",
      "investigador_id": "INV001",
      "grupo_investigacion_id": "GRP001",
      "rol": "lider",
      "fecha_inicio": "2023-01-15",
      "fecha_fin": null,
      "observaciones": "Líder desde la creación del grupo"
    }
  ],
  "total": 200,
  "desde": 0,
  "limite": 50
}
```

#### Búsquedas por Entidad
```http
GET /afiliaciones/search/investigador/:investigadorId
GET /afiliaciones/search/grupo/:grupoId
GET /afiliaciones/search/rol/:rol
GET /afiliaciones/search/fechas/:fechaInicio/:fechaFin
```

**Roles válidos**: `lider`, `coinvestigador`, `semillerista`, `asistente`, `administrativo`

#### Filtros de Estado
```http
GET /afiliaciones/activas
GET /afiliaciones/lideres
GET /afiliaciones/coinvestigadores
GET /afiliaciones/semilleristas
```

#### Gestión de Afiliaciones
```http
PATCH /afiliaciones/:id/finalizar
PATCH /afiliaciones/:id/cambiar-rol
PATCH /afiliaciones/:id/transferir
```

**Finalizar afiliación**:
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

**Transferir a otro grupo**:
```json
{
  "nuevo_grupo_id": "GRP002",
  "fecha_transferencia": "2024-01-01"
}
```

#### Analytics Históricos
```http
GET /afiliaciones/historial/investigador/:investigadorId
GET /afiliaciones/evolucion/grupo/:grupoId
GET /afiliaciones/estadisticas/roles
GET /afiliaciones/estadisticas/grupos
GET /afiliaciones/ranking/grupos-miembros      # Grupos con más miembros
```

---

### ✍️ Autorías (Investigador ↔ Producto)

**Base Path**: `/autorias`

#### Listar Autorías
```http
GET /autorias?limite=100&desde=0&rol=autor&investigador=INV001
```
**Respuesta**:
```json
{
  "autorias": [
    {
      "id": "AUT001",
      "investigador_id": "INV001",
      "producto_investigacion_id": "PROD001",
      "rol": "autor",
      "orden_autoria": 1,
      "porcentaje_participacion": 60,
      "observaciones": "Autor principal y corresponding author"
    }
  ],
  "total": 300,
  "desde": 0,
  "limite": 100
}
```

#### Búsquedas por Entidad
```http
GET /autorias/search/investigador/:investigadorId
GET /autorias/search/producto/:productoId
GET /autorias/search/rol/:rol
GET /autorias/search/año/:año
```

**Roles válidos**: `autor`, `coautor`, `director`

#### Filtros por Rol
```http
GET /autorias/autores-principales
GET /autorias/coautores
GET /autorias/directores
```

#### Análisis de Colaboraciones
```http
GET /autorias/colaboraciones
GET /autorias/colaboraciones/investigador/:investigadorId
GET /autorias/red-colaboracion/investigador/:investigadorId
GET /autorias/productos-colaborativos
```

**Red de colaboración**:
```json
[
  {
    "investigador_id": "INV002",
    "productos_compartidos": 5,
    "productos": ["PROD001", "PROD003", "PROD007", "PROD012", "PROD018"]
  }
]
```

#### Gestión de Autorías
```http
PATCH /autorias/:id/cambiar-rol
PATCH /autorias/:id/transferir
POST /autorias/:id/duplicar
```

**Cambiar rol**:
```json
{
  "nuevo_rol": "coautor"
}
```

**Transferir autoría**:
```json
{
  "nuevo_investigador_id": "INV003"
}
```

**Duplicar autoría con nuevo rol**:
```json
{
  "nuevo_rol": "director"
}
```

#### Analytics de Productividad
```http
GET /autorias/estadisticas/roles
GET /autorias/estadisticas/productividad
GET /autorias/ranking/productivos          # 10 más productivos
GET /autorias/ranking/colaboradores        # 10 más colaborativos
GET /autorias/tendencias/colaboracion      # Tendencias por años
```

**Estadísticas de productividad**:
```json
{
  "INV001": {
    "investigador_id": "INV001",
    "total_productos": 25,
    "como_autor": 15,
    "como_coautor": 8,
    "como_director": 2
  }
}
```

---

## 🔍 Patrones de Respuesta

### Éxito
```json
{
  "data": { /* objeto o array de datos */ },
  "message": "Operación exitosa"
}
```

### Error de Validación
```json
{
  "statusCode": 400,
  "error": "Bad Request", 
  "message": "\"nombre\" is required"
}
```

### Error de Recurso No Encontrado
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Investigador no encontrado"
}
```

### Error de Conflicto
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Ya existe una afiliación activa de este investigador en el grupo"
}
```

---

## 📝 Notas de Implementación

### Validaciones Activas
- ✅ Emails deben contener '@'
- ✅ Años deben ser >= 2000
- ✅ ENUMs validados según `spec/entities.yaml`
- ✅ Relaciones FK verificadas antes de crear/actualizar
- ✅ Unicidad compuesta respetada

### Funcionalidades Avanzadas
- ✅ Paginación en endpoints con muchos resultados
- ✅ Búsquedas flexibles con coincidencias parciales
- ✅ Gestión de metadata JSONB para productos
- ✅ Analytics y estadísticas en tiempo real
- ✅ Gestión de relaciones many-to-many
- ✅ Atributos multivaluados (emails, teléfonos)

### Optimizaciones
- ✅ Datos mock realistas con Faker.js
- ✅ Responses estructuradas y consistentes
- ✅ Error handling centralizado con Boom
- ✅ Validación de entrada con Joi schemas
- ✅ Middleware reutilizable para validaciones

---

Esta documentación refleja el estado actual **100% funcional** de la API académica implementada.
