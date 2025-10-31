# Entidades del Dominio Académico

## Visión General

El sistema de gestión académica está diseñado para manejar la investigación universitaria con un modelo robusto que cumple con estándares de Minciencias y requerimientos académicos colombianos.

## Entidades Core

### 👥 Personas Académicas

#### investigador

```yaml
Primary Key: id_investigador (char(10))
Campos:
  - nombres, apellidos (varchar)
  - tipo_id: [CC, TI, CE, PP]
  - num_id (varchar, unique)
  - orcid (varchar, optional)
  - estado: [activo, inactivo]
  - fecha_registro (date)

Multivalued:
  - emails: con etiquetas [institucional, personal]
  - teléfonos: con tipos [móvil, fijo]

Constraints:
  - Unique: [nombres, apellidos]
  - Email validation: position('@' in email) > 1
```

#### profesor

```yaml
Primary Key: id_profesor (char(10))
Campos:
  - nombres, apellidos (varchar)
  - tipo_id, num_id (unique combination)
  - correo_institucional (optional)
  - telefono, fecha_nacimiento
  - categoria: [auxiliar, asistente, asociado, titular]
  - dedicacion: [TC, MT, HC]
  - departamento (varchar)

Multivalued:
  - correos_adicionales: emails extra
```

#### estudiante

```yaml
Primary Key: id_estudiante (char(10))
Campos:
  - nombres, apellidos (varchar)
  - tipo_id, num_id (optional, unique)
  - codigo_estudiantil (char(12), unique)
  - programa (varchar, optional)
  - nivel: [pregrado, maestría, doctorado]
  - semestre: 1-10 range
  - correo_institucional (unique, required)
```

### 🏛️ Estructura Institucional

#### facultad

```yaml
Primary Key: id_facultad (char(10))
Campos:
  - nombre (varchar, unique)
  - decano (varchar)
  - sede, ciudad (varchar)
```

#### grupo_investigacion

```yaml
Primary Key: id_grupo (char(10))
Campos:
  - nombre (varchar, unique)
  - clasificacion: [A1, A, B, C, Reconocido] # Minciencias
  - facultad (FK: facultad.id_facultad)

Relaciones:
  - Many-to-Many con linea_investigacion via grupo_linea
```

#### linea_investigacion

```yaml
Primary Key: id_linea (char(10))
Campos:
  - nombre (varchar, unique)

Nota: Líneas pueden pertenecer a múltiples grupos y proyectos
```

## Gestión de Proyectos

#### convocatoria

```yaml
Primary Key: id_convocatoria (char(10))
Campos:
  - nombre (varchar)
  - tipo: [interna, Minciencias, internacional, otra]
  - entidad (varchar)
  - anio (smallint, >= 2000)
  - fecha_apertura (date, optional)
  - fecha_cierre (date, required)
  - monto_maximo (decimal, optional)

Constraints:
  - Unique: [nombre, anio, entidad]
```

#### proyecto_investigacion

```yaml
Primary Key: id_proyecto (char(12))
Campos:
  - codigo_interno (varchar, unique, optional)
  - titulo (varchar, unique)
  - resumen (text, optional)
  - grupo (FK: grupo_investigacion, optional)
  - convocatoria (FK: convocatoria, optional)
  - fecha_inicio (date, required)
  - fecha_fin (date, optional)
  - estado: [propuesto, ejecución, finalizado, suspendido]
  - presupuesto_aprobado (decimal, optional)

Relaciones:
  - Many-to-Many con linea_investigacion via proyecto_linea
```

#### producto_tipo

```yaml
Primary Key: id_ptipo (char(10))
Campos:
  - nombre (varchar, unique)

Ejemplos: Artículo, Libro, Ponencia, Software, Patente
```

#### producto_investigacion

```yaml
Primary Key: id_producto (char(12))
Campos:
  - proyecto (FK: proyecto_investigacion, on_delete: set null)
  - tipo_producto (FK: producto_tipo)
  - titulo (varchar)
  - resumen (text, optional)
  - doi (varchar, optional)
  - fecha_publicado (date)
  - url (varchar, optional)
  - metadatos (jsonb, optional) # Datos específicos por tipo

Relaciones:
  - Many-to-Many con investigador via autoria
```

## Relaciones Complejas

#### afiliacion

```yaml
Primary Key: id_afiliacion (char(10))
Propósito: Relaciona investigadores con grupos de investigación

Campos:
  - investigador (FK: investigador.id_investigador)
  - grupo (FK: grupo_investigacion.id_grupo)
  - rol: [líder, coinvestigador, semillerista, asistente, administrativo]
  - fecha_inicio (date, required)
  - fecha_fin (date, optional)

Constraints:
  - Unique: [investigador, grupo, fecha_inicio]
```

#### autoria

```yaml
Primary Key: id_autoria (char(10))
Propósito: Relaciona investigadores con productos académicos

Campos:
  - investigador (FK: investigador.id_investigador)
  - producto (FK: producto_investigacion, on_delete: cascade)
  - orden_autor (smallint, optional)
  - rol_autor: [autor, coautor, director]
  - fecha_fin (date, optional)

Constraints:
  - Unique: [producto, orden_autor] # No duplicar orden
```

## Tablas de Relación Many-to-Many

#### grupo_linea

```yaml
Primary Key: [id_grupo, id_linea]
Propósito: Grupos pueden tener múltiples líneas de investigación

Campos:
  - id_grupo (FK: grupo_investigacion.id_grupo)
  - id_linea (FK: linea_investigacion.id_linea)
```

#### proyecto_linea

```yaml
Primary Key: [id_proyecto, id_linea]
Propósito: Proyectos pueden abarcar múltiples líneas

Campos:
  - id_proyecto (FK: proyecto_investigacion.id_proyecto)
  - id_linea (FK: linea_investigacion.id_linea)
```

## Tablas Multivaluadas

#### investigador_correo

```yaml
Primary Key: [id_investigador, email]
Campos:
  - id_investigador (FK: investigador.id_investigador)
  - email (varchar, with @ validation)
  - etiqueta: [institucional, personal]
```

#### investigador_telefono

```yaml
Primary Key: [id_investigador, numero]
Campos:
  - id_investigador (FK: investigador.id_investigador)
  - numero (varchar)
  - tipo: [móvil, fijo]
```

#### profesor_correo_adicional

```yaml
Primary Key: [id_profesor, email]
Campos:
  - id_profesor (FK: profesor.id_profesor)
  - email (varchar, with @ validation)
```

## ENUMs del Sistema

```sql
-- Tipos de identificación
CREATE TYPE tipo_id_enum AS ENUM ('CC', 'TI', 'CE', 'PP');

-- Etiquetas de correo
CREATE TYPE etiqueta_correo_enum AS ENUM ('institucional', 'personal');

-- Tipos de teléfono
CREATE TYPE tel_tipo_enum AS ENUM ('móvil', 'fijo');

-- Estados de investigador
CREATE TYPE estado_investigador_enum AS ENUM ('activo', 'inactivo');

-- Categorías profesorales
CREATE TYPE categoria_prof_enum AS ENUM ('auxiliar', 'asistente', 'asociado', 'titular');

-- Dedicación profesoral
CREATE TYPE dedicacion_prof_enum AS ENUM ('TC', 'MT', 'HC');

-- Clasificación Minciencias
CREATE TYPE clasif_minciencias_enum AS ENUM ('A1', 'A', 'B', 'C', 'Reconocido');

-- Tipos de convocatoria
CREATE TYPE convocatoria_tipo_enum AS ENUM ('interna', 'Minciencias', 'internacional', 'otra');

-- Estados de proyecto
CREATE TYPE estado_proyecto_enum AS ENUM ('propuesto', 'ejecución', 'finalizado', 'suspendido');

-- Roles de afiliación
CREATE TYPE rol_afiliacion_enum AS ENUM ('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo');

-- Roles de autoría
CREATE TYPE rol_autor_enum AS ENUM ('autor', 'coautor', 'director');
```

## Índices Recomendados

```sql
-- Búsquedas frecuentes por investigador
CREATE INDEX idx_investigador_nombres ON investigador(apellidos, nombres);

-- Filtrado por departamento de profesores
CREATE INDEX idx_profesor_departamento ON profesor(departamento);

-- Estados de proyectos para reportes
CREATE INDEX idx_proyecto_estado ON proyecto_investigacion(estado);

-- Productos por fecha de publicación
CREATE INDEX idx_producto_fecha ON producto_investigacion(fecha_publicado);

-- Afiliaciones por grupo (para listar miembros)
CREATE INDEX idx_afiliacion_grupo ON afiliacion(grupo);
```

## Reglas de Negocio Implementadas

### Validaciones

- **Emails**: Deben contener '@' (check constraint)
- **Años**: Convocatorias >= 2000
- **Semestres**: Estudiantes entre 1-10
- **Unicidad**: Combinaciones críticas como [nombres, apellidos]

### Integridad Referencial

- **Cascadas**: Eliminar producto elimina autorías
- **Set null**: Eliminar proyecto no elimina productos (investigación independiente)
- **Restrict**: No eliminar entidades con dependencias activas

### Flexibilidad

- **JSONB**: Metadata de productos permite extensión sin cambios de schema
- **Opcionales**: Muchos campos permiten NULL para adaptabilidad
- **Fechas abiertas**: fecha_fin opcional para relaciones activas

## Casos de Uso Principales

1. **Gestión de Investigadores**: CRUD completo con emails/teléfonos múltiples
2. **Estructuración Académica**: Facultades → Grupos → Líneas de investigación
3. **Proyectos**: Desde convocatoria hasta productos finales
4. **Productos Académicos**: Con autoría múltiple y metadata flexible
5. **Reportes**: Productividad por investigador, grupo, línea, período
6. **Búsquedas**: Por nombre, afiliación, tipo de producto, período
