# 🗄️ Guía de Base de Datos

[⬅️ Volver al Índice](./README.md)

Esta guía documenta el esquema completo de la base de datos PostgreSQL del sistema académico.

---

## 📊 Información General

- **Motor**: PostgreSQL 13+
- **ORM**: Sequelize 6.37.7
- **Total de tablas**: 16+
- **Migrations**: 3 archivos
- **Seeders**: 1 archivo con datos de prueba

### Convenciones de Nomenclatura

- **Nombres de tabla**: snake_case singular (`investigador`, `proyecto_investigacion`)
- **Columnas**: snake_case (`fecha_inicio`, `tipo_id`)
- **Claves primarias**: char(10) o char(12) con prefijo (`INV0000001`, `PRY0000001`)
- **Foreign keys**: Mismo nombre que tabla referenciada

---

## 🏗️ Modelo Entidad-Relación Simplificado

```
facultad (1) ─────< (N) grupo_investigacion
                         │
                         ├────< (N) proyecto_investigacion
                         │             │
                         │             └────< (N) producto_investigacion
                         │                           │
                         └────< (N) afiliacion       │
                                       │             │
investigador (1) ──────────────────────┘             │
      │                                              │
      └────────────< (N) autoria ───────────────────┘
```

### Relaciones Principales

1. **Facultad → Grupo**: 1:N (una facultad tiene varios grupos)
2. **Grupo → Proyecto**: 1:N (un grupo desarrolla varios proyectos)
3. **Proyecto → Producto**: 1:N (un proyecto genera varios productos)
4. **Investigador ↔ Grupo**: N:M (a través de `afiliacion`)
5. **Investigador ↔ Producto**: N:M (a través de `autoria`)
6. **Grupo ↔ Línea**: N:M (a través de `grupo_linea`)
7. **Proyecto ↔ Línea**: N:M (a través de `proyecto_linea`)

---

## 📋 Catálogos y ENUMs

### Tipos de Identificación
```sql
CREATE TYPE tipo_id_enum AS ENUM ('CC', 'CE', 'PAS', 'TI');
```
- `CC`: Cédula de Ciudadanía
- `CE`: Cédula de Extranjería
- `PAS`: Pasaporte
- `TI`: Tarjeta de Identidad

### Estados de Investigador
```sql
CREATE TYPE estado_investigador_enum AS ENUM ('activo', 'inactivo');
```

### Categorías Docentes
```sql
CREATE TYPE categoria_prof_enum AS ENUM ('auxiliar', 'asistente', 'asociado', 'titular');
```

### Dedicaciones Docentes
```sql
CREATE TYPE dedicacion_prof_enum AS ENUM ('TC', 'MT', 'HC');
```
- `TC`: Tiempo Completo
- `MT`: Medio Tiempo
- `HC`: Hora Cátedra

### Clasificación Minciencias (Grupos)
```sql
CREATE TYPE clasif_minciencias_enum AS ENUM ('A1', 'A', 'B', 'C', 'D', 'Reconocido');
```

### Niveles Académicos (Estudiantes)
```sql
CREATE TYPE estudiante_nivel_enum AS ENUM ('pregrado', 'maestría', 'doctorado');
```

### Tipos de Convocatoria
```sql
CREATE TYPE convocatoria_tipo_enum AS ENUM ('interna', 'Minciencias', 'internacional', 'otra');
```

### Estados de Proyecto
```sql
CREATE TYPE estado_proyecto_enum AS ENUM ('formulación', 'en_ejecución', 'finalizado', 'cancelado');
```

### Roles en Afiliación (Investigador-Grupo)
```sql
CREATE TYPE rol_afiliacion_enum AS ENUM ('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo');
```

### Roles de Autoría (Investigador-Producto)
```sql
CREATE TYPE rol_autor_enum AS ENUM ('autor', 'coautor', 'director');
```

### Etiquetas de Correo
```sql
CREATE TYPE etiqueta_correo_enum AS ENUM ('institucional', 'personal', 'otro');
```

### Tipos de Teléfono
```sql
CREATE TYPE tel_tipo_enum AS ENUM ('móvil', 'fijo');
```

---

## 🗂️ Entidades Principales

### 1. Facultad

**Tabla**: `facultad`  
**Descripción**: Unidades académicas de la universidad

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_facultad` | CHAR(10) PK | Identificador único (FAC0000001) |
| `nombre` | VARCHAR(150) UNIQUE | Nombre de la facultad |
| `decano` | VARCHAR(150) | Nombre del decano |
| `sede` | VARCHAR(50) | Sede donde se ubica |
| `ciudad` | VARCHAR(50) | Ciudad |

**Ejemplo**:
```sql
INSERT INTO facultad VALUES
('FAC0000001', 'Facultad de Ingeniería', 'Dr. Juan Pérez', 'Sede Central', 'Bogotá');
```

---

### 2. Investigador

**Tabla**: `investigador`  
**Descripción**: Investigadores registrados en el sistema

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_investigador` | CHAR(10) PK | Identificador único (INV0000001) |
| `nombres` | VARCHAR(80) | Nombres del investigador |
| `apellidos` | VARCHAR(80) | Apellidos |
| `tipo_id` | tipo_id_enum | Tipo de identificación (CC, CE, PAS, TI) |
| `num_id` | VARCHAR(20) UNIQUE | Número de identificación |
| `orcid` | VARCHAR(19) | ORCID (formato: 0000-0001-2345-6789) |
| `estado` | estado_investigador_enum | Estado (activo/inactivo) |
| `fecha_registro` | DATE | Fecha de registro en el sistema |

**Tablas multivaluadas**:

- `investigador_correo`: Emails del investigador
  - `id_investigador`, `email`, `etiqueta` (institucional/personal/otro)
  
- `investigador_telefono`: Teléfonos del investigador
  - `id_investigador`, `numero`, `tipo` (móvil/fijo)

**Ejemplo**:
```sql
-- Investigador
INSERT INTO investigador VALUES
('INV0000001', 'Ana María', 'González López', 'CC', '12345678', '0000-0001-2345-6789', 'activo', '2023-01-15');

-- Emails
INSERT INTO investigador_correo VALUES
('INV0000001', 'ana.gonzalez@universidad.edu.co', 'institucional'),
('INV0000001', 'ana@gmail.com', 'personal');

-- Teléfonos
INSERT INTO investigador_telefono VALUES
('INV0000001', '3001234567', 'móvil');
```

---

### 3. Profesor

**Tabla**: `profesor`  
**Descripción**: Profesores de la universidad

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_profesor` | CHAR(10) PK | Identificador único (PROF000001) |
| `nombres` | VARCHAR(80) | Nombres |
| `apellidos` | VARCHAR(80) | Apellidos |
| `departamento` | VARCHAR(100) | Departamento académico |
| `categoria` | categoria_prof_enum | Categoría (auxiliar/asistente/asociado/titular) |
| `dedicacion` | dedicacion_prof_enum | Dedicación (TC/MT/HC) |
| `correo_institucional` | VARCHAR(120) | Email institucional |
| `telefono` | VARCHAR(20) | Teléfono de contacto |
| `fecha_nacimiento` | DATE | Fecha de nacimiento |

---

### 4. Estudiante

**Tabla**: `estudiante`  
**Descripción**: Estudiantes de programas académicos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_estudiante` | CHAR(10) PK | Identificador único (EST0000001) |
| `nombres` | VARCHAR(50) | Nombres |
| `apellidos` | VARCHAR(50) | Apellidos |
| `codigo_estudiantil` | CHAR(12) UNIQUE | Código estudiantil |
| `programa` | VARCHAR(120) | Programa académico |
| `nivel` | estudiante_nivel_enum | Nivel (pregrado/maestría/doctorado) |
| `semestre` | SMALLINT | Semestre actual (1-10) |
| `correo_institucional` | VARCHAR(100) UNIQUE | Email institucional |

---

### 5. Grupo de Investigación

**Tabla**: `grupo_investigacion`  
**Descripción**: Grupos de investigación institucionales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_grupo` | CHAR(10) PK | Identificador único (GRP0000001) |
| `nombre` | VARCHAR(150) UNIQUE | Nombre del grupo |
| `clasificacion` | clasif_minciencias_enum | Clasificación Minciencias (A1/A/B/C/D/Reconocido) |
| `facultad` | CHAR(10) FK | Facultad a la que pertenece |
| `descripcion` | TEXT | Descripción del grupo |
| `fecha_creacion_grupo` | DATE | Fecha de creación oficial |

**Relación N:M con Líneas**:
```sql
-- Tabla: grupo_linea
-- Asocia grupos con líneas de investigación
CREATE TABLE grupo_linea (
  id_grupo CHAR(10) FK,
  id_linea CHAR(10) FK,
  fecha_asociacion DATE,
  PRIMARY KEY (id_grupo, id_linea)
);
```

---

### 6. Línea de Investigación

**Tabla**: `linea_investigacion`  
**Descripción**: Líneas temáticas de investigación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_linea` | CHAR(10) PK | Identificador único (LIN0000001) |
| `nombre` | VARCHAR(150) UNIQUE | Nombre de la línea |
| `descripcion` | TEXT | Descripción detallada |

---

### 7. Convocatoria

**Tabla**: `convocatoria`  
**Descripción**: Convocatorias de financiación para proyectos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_convocatoria` | CHAR(10) PK | Identificador único (CNV0000001) |
| `nombre` | VARCHAR(150) | Nombre de la convocatoria |
| `tipo` | convocatoria_tipo_enum | Tipo (interna/Minciencias/internacional/otra) |
| `entidad` | VARCHAR(150) | Entidad convocante |
| `anio` | SMALLINT | Año de la convocatoria |
| `fecha_apertura` | DATE | Fecha de apertura |
| `fecha_cierre` | DATE | Fecha de cierre |
| `monto_maximo` | DECIMAL(14,2) | Monto máximo de financiación |
| `descripcion` | TEXT | Descripción |
| `requisitos` | TEXT | Requisitos de participación |

**Constraints**:
- `UNIQUE (nombre, anio, entidad)` - No duplicar convocatorias
- `CHECK (fecha_cierre > fecha_apertura)` - Fechas consistentes

---

### 8. Proyecto de Investigación

**Tabla**: `proyecto_investigacion`  
**Descripción**: Proyectos de investigación desarrollados

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_proyecto` | CHAR(12) PK | Identificador único (PRY000000001) |
| `codigo_interno` | VARCHAR(30) UNIQUE | Código interno del proyecto |
| `titulo` | VARCHAR(200) UNIQUE | Título del proyecto |
| `resumen` | TEXT | Resumen ejecutivo |
| `objetivo_general` | TEXT | Objetivo general |
| `objetivos_especificos` | TEXT | Objetivos específicos |
| `metodologia` | TEXT | Metodología de investigación |
| `grupo` | CHAR(10) FK | Grupo responsable |
| `convocatoria` | CHAR(10) FK | Convocatoria asociada (opcional) |
| `fecha_inicio` | DATE | Fecha de inicio |
| `fecha_fin` | DATE | Fecha de finalización |
| `estado` | estado_proyecto_enum | Estado (formulación/en_ejecución/finalizado/cancelado) |
| `presupuesto_aprobado` | DECIMAL(12,2) | Presupuesto aprobado |

**Relación N:M con Líneas**:
```sql
-- Tabla: proyecto_linea
-- Asocia proyectos con líneas de investigación
CREATE TABLE proyecto_linea (
  id_proyecto CHAR(12) FK,
  id_linea CHAR(10) FK,
  PRIMARY KEY (id_proyecto, id_linea)
);
```

---

### 9. Tipo de Producto

**Tabla**: `producto_tipo`  
**Descripción**: Clasificación de productos de investigación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_ptipo` | CHAR(10) PK | Identificador único (PT00000001) |
| `nombre` | VARCHAR(120) UNIQUE | Nombre del tipo |
| `descripcion` | TEXT | Descripción |
| `categoria` | VARCHAR(50) | Categoría (Publicación científica, Producto tecnológico, etc.) |

**Categorías comunes**:
- Publicación científica
- Producto tecnológico
- Evento científico
- Formación académica

---

### 10. Producto de Investigación

**Tabla**: `producto_investigacion`  
**Descripción**: Productos generados por proyectos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_producto` | CHAR(12) PK | Identificador único (PRD000000001) |
| `proyecto` | CHAR(12) FK | Proyecto que lo generó |
| `tipo_producto` | CHAR(10) FK | Tipo de producto |
| `titulo` | VARCHAR(200) | Título del producto |
| `resumen` | TEXT | Resumen/abstract |
| `doi` | VARCHAR(100) | Digital Object Identifier |
| `isbn` | VARCHAR(17) | ISBN (para libros) |
| `fecha_publicado` | DATE | Fecha de publicación |
| `url` | VARCHAR(300) | URL del producto |
| `metadatos` | JSONB | Metadatos flexibles en JSON |

**Uso de JSONB** para metadatos específicos:
```json
{
  "cuartil": "Q1",
  "factor_impacto": 3.456,
  "indexacion": ["Scopus", "WoS"],
  "volumen": "25",
  "numero": "3",
  "paginas": "123-145"
}
```

---

### 11. Afiliación (Investigador ↔ Grupo)

**Tabla**: `afiliacion`  
**Descripción**: Relación de investigadores con grupos de investigación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_afiliacion` | CHAR(10) PK | Identificador único |
| `investigador` | CHAR(10) FK | Investigador afiliado |
| `grupo` | CHAR(10) FK | Grupo de investigación |
| `rol` | rol_afiliacion_enum | Rol (líder/coinvestigador/semillerista/asistente/administrativo) |
| `fecha_inicio` | DATE | Fecha de inicio de afiliación |
| `fecha_fin` | DATE | Fecha de fin (NULL si activa) |
| `observaciones` | TEXT | Observaciones adicionales |

**Constraints**:
- `UNIQUE (investigador, grupo, fecha_inicio)` - No duplicar afiliaciones
- `CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)`

---

### 12. Autoría (Investigador ↔ Producto)

**Tabla**: `autoria`  
**Descripción**: Autoría de investigadores en productos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_autoria` | CHAR(10) PK | Identificador único |
| `investigador` | CHAR(10) FK | Investigador autor |
| `producto` | CHAR(12) FK | Producto de investigación |
| `orden_autor` | SMALLINT | Orden en la lista de autores |
| `rol_autor` | rol_autor_enum | Rol (autor/coautor/director) |
| `porcentaje_participacion` | DECIMAL(5,2) | % de participación (0-100) |
| `observaciones` | TEXT | Observaciones |

**Constraints**:
- `UNIQUE (producto, orden_autor)` - Orden único por producto
- `CHECK (orden_autor > 0)`
- `CHECK (porcentaje_participacion BETWEEN 0 AND 100)`

---

## 🔍 Consultas SQL Útiles

### Investigadores más productivos (últimos 5 años)

```sql
SELECT 
    i.nombres,
    i.apellidos,
    COUNT(a.id_autoria) AS total_productos,
    COUNT(CASE WHEN a.rol_autor = 'autor' THEN 1 END) AS como_autor_principal
FROM investigador i
JOIN autoria a ON i.id_investigador = a.investigador
JOIN producto_investigacion p ON a.producto = p.id_producto
WHERE p.fecha_publicado >= CURRENT_DATE - INTERVAL '5 years'
GROUP BY i.id_investigador, i.nombres, i.apellidos
ORDER BY total_productos DESC
LIMIT 10;
```

### Proyectos próximos a finalizar (30 días)

```sql
SELECT 
    p.titulo,
    p.fecha_fin,
    g.nombre AS grupo,
    p.estado,
    EXTRACT(DAY FROM (p.fecha_fin - CURRENT_DATE)) AS dias_restantes
FROM proyecto_investigacion p
JOIN grupo_investigacion g ON p.grupo = g.id_grupo
WHERE p.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND p.estado = 'en_ejecución'
ORDER BY p.fecha_fin;
```

### Estadísticas de producción por año y tipo

```sql
SELECT 
    EXTRACT(YEAR FROM pr.fecha_publicado) AS año,
    pt.nombre AS tipo_producto,
    COUNT(*) AS cantidad,
    COUNT(DISTINCT pr.proyecto) AS proyectos_involucrados
FROM producto_investigacion pr
JOIN producto_tipo pt ON pr.tipo_producto = pt.id_ptipo
WHERE pr.fecha_publicado >= '2020-01-01'
GROUP BY EXTRACT(YEAR FROM pr.fecha_publicado), pt.nombre
ORDER BY año DESC, cantidad DESC;
```

### Grupos con más investigadores activos

```sql
SELECT 
    g.nombre AS grupo,
    g.clasificacion,
    f.nombre AS facultad,
    COUNT(DISTINCT a.investigador) AS miembros_activos
FROM grupo_investigacion g
LEFT JOIN facultad f ON g.facultad = f.id_facultad
LEFT JOIN afiliacion a ON g.id_grupo = a.grupo
WHERE a.fecha_fin IS NULL
GROUP BY g.id_grupo, g.nombre, g.clasificacion, f.nombre
ORDER BY miembros_activos DESC;
```

### Red de colaboración de un investigador

```sql
SELECT 
    i1.nombres || ' ' || i1.apellidos AS investigador_principal,
    i2.nombres || ' ' || i2.apellidos AS colaborador,
    COUNT(DISTINCT a1.producto) AS productos_conjuntos
FROM autoria a1
JOIN autoria a2 ON a1.producto = a2.producto AND a1.investigador != a2.investigador
JOIN investigador i1 ON a1.investigador = i1.id_investigador
JOIN investigador i2 ON a2.investigador = i2.id_investigador
WHERE a1.investigador = 'INV0000001'
GROUP BY i1.nombres, i1.apellidos, i2.nombres, i2.apellidos
ORDER BY productos_conjuntos DESC;
```

---

## 📈 Índices para Optimización

```sql
-- Búsquedas por investigador
CREATE INDEX idx_investigador_apellidos_nombres ON investigador(apellidos, nombres);
CREATE INDEX idx_investigador_estado ON investigador(estado);

-- Búsquedas por proyecto
CREATE INDEX idx_proyecto_estado ON proyecto_investigacion(estado);
CREATE INDEX idx_proyecto_grupo ON proyecto_investigacion(grupo);
CREATE INDEX idx_proyecto_fecha_inicio ON proyecto_investigacion(fecha_inicio);

-- Búsquedas por producto
CREATE INDEX idx_producto_fecha_publicado ON producto_investigacion(fecha_publicado);
CREATE INDEX idx_producto_tipo ON producto_investigacion(tipo_producto);
CREATE INDEX idx_producto_proyecto ON producto_investigacion(proyecto);

-- Búsquedas JSONB en metadatos
CREATE INDEX idx_producto_metadata_gin ON producto_investigacion USING GIN (metadatos);

-- Búsquedas por afiliación
CREATE INDEX idx_afiliacion_investigador ON afiliacion(investigador);
CREATE INDEX idx_afiliacion_grupo ON afiliacion(grupo);
CREATE INDEX idx_afiliacion_rol ON afiliacion(rol);
```

---

## 🛠️ Trabajar con Sequelize ORM

### Definir Modelo

```javascript
// db/models/investigador.model.js
const { Model, DataTypes } = require('sequelize');

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

module.exports = { Investigador, InvestigadorSchema };
```

### Queries Comunes

```javascript
// Listar todos con relaciones
const investigadores = await models.Investigador.findAll({
  include: ['emails', 'telefonos'],
  order: [['apellidos', 'ASC']]
});

// Buscar por ID
const investigador = await models.Investigador.findByPk('INV0000001', {
  include: ['emails']
});

// Buscar con condiciones
const activos = await models.Investigador.findAll({
  where: { estado: 'activo' }
});

// Crear con transacción
const transaction = await models.sequelize.transaction();
try {
  const inv = await models.Investigador.create(data, { transaction });
  await models.InvestigadorCorreo.create(email, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
}
```

---

## 📚 Recursos Adicionales

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL ENUM Types](https://www.postgresql.org/docs/13/datatype-enum.html)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/13/datatype-json.html)
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)

---

[⬅️ Anterior: Patrones](./06-patrones.md) | [⬆️ Volver al Índice](./README.md) | [➡️ Siguiente: Troubleshooting](./08-troubleshooting.md)
