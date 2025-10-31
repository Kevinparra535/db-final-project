# 🐘 Guía de Configuración de pgAdmin

## 📋 Información General

pgAdmin es una interfaz gráfica web para administrar bases de datos PostgreSQL. Esta guía te ayudará a configurar y usar pgAdmin para visualizar y gestionar la base de datos `academic_db`.

## 🚀 Acceso a pgAdmin

### 1. Verificar que pgAdmin esté corriendo

```bash
# Verificar contenedores activos
docker-compose ps

# Deberías ver:
# data-final-pgadmin-1   dpage/pgadmin4   Up   0.0.0.0:5050->80/tcp
```

### 2. Acceder a la interfaz web

1. Abre tu navegador web
2. Navega a: **http://localhost:5050**
3. Deberías ver la pantalla de login de pgAdmin

### 3. Credenciales de Login

**Email:** `admin@mail.com`  
**Password:** `root`

> 💡 **Nota**: Estas credenciales están configuradas en `docker-compose.yml` bajo las variables:
> - `PGADMIN_DEFAULT_EMAIL`
> - `PGADMIN_DEFAULT_PASSWORD`

## 🔧 Configurar Conexión a PostgreSQL

### Paso 1: Agregar Nuevo Servidor

Una vez dentro de pgAdmin:

1. **Click derecho** en "Servers" en el panel izquierdo
2. Selecciona **"Register" → "Server..."**

### Paso 2: Pestaña "General"

En la pestaña **General**:
- **Name**: `Academic DB` (o cualquier nombre descriptivo)

### Paso 3: Pestaña "Connection"

En la pestaña **Connection**, ingresa los siguientes datos:

| Campo | Valor | Descripción |
|-------|-------|-------------|
| **Host name/address** | `db` | Nombre del contenedor PostgreSQL |
| **Port** | `5432` | Puerto por defecto de PostgreSQL |
| **Maintenance database** | `postgres` | Base de datos por defecto |
| **Username** | `kevin` | Usuario de PostgreSQL |
| **Password** | `admin123` | Contraseña de PostgreSQL |
| **Save password?** | ✅ Activado | Para no ingresarla cada vez |

> ⚠️ **IMPORTANTE**: Usa `db` como hostname, NO `localhost`. Los contenedores Docker se comunican por nombre de servicio.

### Paso 4: Guardar Configuración

1. Click en **"Save"**
2. pgAdmin se conectará al servidor PostgreSQL
3. Deberías ver el servidor "Academic DB" en el panel izquierdo

## 📊 Navegando la Base de Datos

### Estructura de Navegación

```
Servers
└── Academic DB
    └── Databases (1)
        └── academic_db
            ├── Schemas (1)
            │   └── public
            │       ├── Tables (15)
            │       │   ├── afiliacion
            │       │   ├── autoria
            │       │   ├── convocatoria
            │       │   ├── estudiante
            │       │   ├── facultad
            │       │   ├── grupo_investigacion
            │       │   ├── grupo_linea
            │       │   ├── investigador
            │       │   ├── investigador_correo
            │       │   ├── investigador_telefono
            │       │   ├── linea_investigacion
            │       │   ├── producto_investigacion
            │       │   ├── producto_tipo
            │       │   ├── profesor
            │       │   ├── profesor_correo
            │       │   └── proyecto_investigacion
            │       └── Sequences
            └── Extensions
```

### Ver Datos de una Tabla

1. **Expandir** el árbol: Servers → Academic DB → Databases → academic_db → Schemas → public → Tables
2. **Click derecho** en cualquier tabla (por ejemplo, `facultad`)
3. Selecciona **"View/Edit Data" → "All Rows"**
4. Se abrirá una pestaña con todos los registros

### Ejecutar Consultas SQL

1. Click en el ícono de **"Query Tool"** (rayo) en la barra superior
2. Escribe tu consulta SQL, por ejemplo:

```sql
-- Ver todas las facultades
SELECT * FROM facultad;

-- Ver investigadores con sus emails
SELECT 
    i.id_investigador,
    i.nombres,
    i.apellidos,
    ic.email,
    ic.etiqueta
FROM investigador i
LEFT JOIN investigador_correo ic ON i.id_investigador = ic.id_investigador
ORDER BY i.apellidos;

-- Ver grupos con sus facultades
SELECT 
    g.id_grupo,
    g.nombre AS grupo_nombre,
    g.clasificacion,
    f.nombre AS facultad_nombre,
    f.ciudad
FROM grupo_investigacion g
INNER JOIN facultad f ON g.facultad = f.id_facultad;

-- Estadísticas de productos por tipo
SELECT 
    pt.nombre AS tipo_producto,
    pt.categoria,
    COUNT(pi.id_producto) AS total_productos
FROM producto_tipo pt
LEFT JOIN producto_investigacion pi ON pt.id_ptipo = pi.tipo_producto
GROUP BY pt.id_ptipo, pt.nombre, pt.categoria
ORDER BY total_productos DESC;

-- Investigadores más productivos
SELECT 
    i.nombres,
    i.apellidos,
    COUNT(a.producto) AS total_productos,
    COUNT(DISTINCT a.rol) AS roles_diferentes
FROM investigador i
LEFT JOIN autoria a ON i.id_investigador = a.investigador
GROUP BY i.id_investigador, i.nombres, i.apellidos
ORDER BY total_productos DESC;
```

3. Click en **"Execute/Refresh"** (▶️) o presiona `F5`
4. Los resultados aparecerán en la parte inferior

## 🛠️ Operaciones Comunes en pgAdmin

### Ver Estructura de una Tabla

1. **Click derecho** en la tabla
2. Selecciona **"Properties"**
3. Explora las pestañas:
   - **Columns**: Ver columnas y tipos de datos
   - **Constraints**: Ver primary keys, foreign keys, unique constraints
   - **Indexes**: Ver índices de la tabla

### Ver Relaciones (Foreign Keys)

1. Click derecho en una tabla
2. Selecciona **"Properties"**
3. Ve a la pestaña **"Constraints"**
4. Expande **"Foreign Key"** para ver las relaciones

### Exportar Datos

1. Click derecho en la tabla
2. Selecciona **"Import/Export Data..."**
3. En la pestaña **"Options"**:
   - Activa **"Export"**
   - Selecciona formato (CSV, JSON, etc.)
   - Elige ubicación del archivo
4. Click en **"OK"**

### Ver Diagrama de Base de Datos (ERD)

pgAdmin 4 tiene una herramienta de generación de diagramas:

1. Click derecho en **"academic_db"**
2. Selecciona **"Generate ERD"**
3. Se abrirá un diagrama visual de todas las tablas y relaciones

## 📋 Consultas Útiles para el Proyecto Académico

### 1. Resumen General de la Base de Datos

```sql
-- Contar registros en cada tabla
SELECT 
    'facultad' AS tabla, COUNT(*) AS registros FROM facultad
UNION ALL
SELECT 'investigador', COUNT(*) FROM investigador
UNION ALL
SELECT 'profesor', COUNT(*) FROM profesor
UNION ALL
SELECT 'estudiante', COUNT(*) FROM estudiante
UNION ALL
SELECT 'grupo_investigacion', COUNT(*) FROM grupo_investigacion
UNION ALL
SELECT 'linea_investigacion', COUNT(*) FROM linea_investigacion
UNION ALL
SELECT 'convocatoria', COUNT(*) FROM convocatoria
UNION ALL
SELECT 'proyecto_investigacion', COUNT(*) FROM proyecto_investigacion
UNION ALL
SELECT 'producto_investigacion', COUNT(*) FROM producto_investigacion
UNION ALL
SELECT 'producto_tipo', COUNT(*) FROM producto_tipo
UNION ALL
SELECT 'afiliacion', COUNT(*) FROM afiliacion
UNION ALL
SELECT 'autoria', COUNT(*) FROM autoria
ORDER BY tabla;
```

### 2. Investigadores con Todos sus Datos

```sql
SELECT 
    i.id_investigador,
    i.nombres || ' ' || i.apellidos AS nombre_completo,
    i.tipo_id,
    i.num_id,
    i.orcid,
    i.estado,
    i.fecha_registro,
    STRING_AGG(DISTINCT ic.email, ', ') AS emails,
    STRING_AGG(DISTINCT it.numero, ', ') AS telefonos
FROM investigador i
LEFT JOIN investigador_correo ic ON i.id_investigador = ic.id_investigador
LEFT JOIN investigador_telefono it ON i.id_investigador = it.id_investigador
GROUP BY i.id_investigador, i.nombres, i.apellidos, i.tipo_id, i.num_id, i.orcid, i.estado, i.fecha_registro
ORDER BY i.apellidos;
```

### 3. Grupos con sus Miembros

```sql
SELECT 
    g.id_grupo,
    g.nombre AS grupo,
    g.clasificacion,
    f.nombre AS facultad,
    COUNT(a.investigador) AS total_miembros,
    STRING_AGG(
        CASE 
            WHEN a.rol = 'líder' THEN i.nombres || ' ' || i.apellidos || ' (Líder)'
            ELSE i.nombres || ' ' || i.apellidos || ' (' || a.rol || ')'
        END, 
        ', '
    ) AS miembros
FROM grupo_investigacion g
LEFT JOIN facultad f ON g.facultad = f.id_facultad
LEFT JOIN afiliacion a ON g.id_grupo = a.grupo AND a.estado = 'activa'
LEFT JOIN investigador i ON a.investigador = i.id_investigador
GROUP BY g.id_grupo, g.nombre, g.clasificacion, f.nombre
ORDER BY g.nombre;
```

### 4. Proyectos con Líneas de Investigación

```sql
SELECT 
    p.id_proyecto,
    p.titulo,
    p.estado,
    p.fecha_inicio,
    p.fecha_fin,
    g.nombre AS grupo,
    c.nombre AS convocatoria,
    STRING_AGG(l.nombre, ', ') AS lineas_investigacion
FROM proyecto_investigacion p
LEFT JOIN grupo_investigacion g ON p.grupo = g.id_grupo
LEFT JOIN convocatoria c ON p.convocatoria = c.id_convocatoria
LEFT JOIN proyecto_linea pl ON p.id_proyecto = pl.proyecto_id
LEFT JOIN linea_investigacion l ON pl.linea_id = l.id_linea
GROUP BY p.id_proyecto, p.titulo, p.estado, p.fecha_inicio, p.fecha_fin, g.nombre, c.nombre
ORDER BY p.fecha_inicio DESC;
```

### 5. Productos con Autores

```sql
SELECT 
    p.id_producto,
    p.titulo,
    pt.nombre AS tipo,
    p.año_publicacion,
    p.doi,
    STRING_AGG(
        i.nombres || ' ' || i.apellidos || ' (' || a.rol || ')',
        ', '
        ORDER BY a.orden
    ) AS autores
FROM producto_investigacion p
LEFT JOIN producto_tipo pt ON p.tipo_producto = pt.id_ptipo
LEFT JOIN autoria a ON p.id_producto = a.producto
LEFT JOIN investigador i ON a.investigador = i.id_investigador
GROUP BY p.id_producto, p.titulo, pt.nombre, p.año_publicacion, p.doi
ORDER BY p.año_publicacion DESC, p.titulo;
```

### 6. Estadísticas por Facultad

```sql
SELECT 
    f.id_facultad,
    f.nombre AS facultad,
    f.ciudad,
    COUNT(DISTINCT g.id_grupo) AS grupos,
    COUNT(DISTINCT i.id_investigador) AS investigadores,
    COUNT(DISTINCT pr.id_profesor) AS profesores,
    COUNT(DISTINCT e.id_estudiante) AS estudiantes
FROM facultad f
LEFT JOIN grupo_investigacion g ON f.id_facultad = g.facultad
LEFT JOIN investigador i ON f.id_facultad = i.facultad
LEFT JOIN profesor pr ON f.id_facultad = pr.facultad
LEFT JOIN estudiante e ON f.id_facultad = e.facultad
GROUP BY f.id_facultad, f.nombre, f.ciudad
ORDER BY f.nombre;
```

## 🎨 Personalización de pgAdmin

### Cambiar Tema (Claro/Oscuro)

1. Click en **"File" → "Preferences"**
2. En el panel izquierdo: **"Miscellaneous" → "Themes"**
3. Selecciona **"Theme"**: Standard (claro) o Dark (oscuro)
4. Click en **"Save"**

### Configurar Auto-refresh

Para que las tablas se actualicen automáticamente:

1. File → Preferences
2. Query Tool → Auto-refresh
3. Configura el intervalo deseado

## 🔒 Seguridad y Buenas Prácticas

### ⚠️ Credenciales por Defecto

Las credenciales actuales son para desarrollo. Para producción:

1. Cambia las credenciales en `docker-compose.yml`
2. Reinicia los contenedores:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 🔐 Cambiar Credenciales de pgAdmin

Edita `docker-compose.yml`:

```yaml
pgadmin:
  image: dpage/pgadmin4
  environment:
    - PGADMIN_DEFAULT_EMAIL=tu_email@example.com  # Cambiar aquí
    - PGADMIN_DEFAULT_PASSWORD=tu_password_seguro  # Cambiar aquí
  ports:
    - 5050:80
```

### 🛡️ Acceso desde la Red Local

Por defecto, pgAdmin está accesible desde cualquier IP. Para restringir:

```yaml
ports:
  - 127.0.0.1:5050:80  # Solo localhost
```

## 🐛 Solución de Problemas

### Problema: No puedo acceder a localhost:5050

**Solución:**
```bash
# Verificar que el contenedor esté corriendo
docker-compose ps

# Si no está corriendo
docker-compose up -d pgadmin

# Ver logs de pgAdmin
docker-compose logs pgadmin
```

### Problema: No puedo conectar a PostgreSQL desde pgAdmin

**Solución:**
- ✅ Usa `db` como hostname, NO `localhost`
- ✅ Verifica que ambos contenedores estén en la misma red Docker
- ✅ Verifica las credenciales:
  - User: `kevin`
  - Password: `admin123`
  - Port: `5432`

### Problema: pgAdmin dice "Connection refused"

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker exec db pg_isready -U kevin

# Verificar conectividad de red
docker exec data-final-pgadmin-1 ping -c 3 db
```

### Problema: Olvidé la contraseña de pgAdmin

**Solución:**
```bash
# Resetear contenedor de pgAdmin
docker-compose down pgadmin
docker volume rm data-final_pgadmin_data  # Si existe
docker-compose up -d pgadmin

# Volver a intentar con las credenciales del docker-compose.yml
```

## 📱 Acceso desde Dispositivos Móviles

pgAdmin es responsive y funciona en tablets/móviles:

1. Encuentra tu IP local:
   ```bash
   # En macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Desde el dispositivo móvil en la misma red:
   - Navega a `http://TU_IP:5050`
   - Ejemplo: `http://192.168.1.100:5050`

## 🔗 Enlaces Útiles

- [Documentación oficial de pgAdmin 4](https://www.pgadmin.org/docs/)
- [Tutorial de pgAdmin en YouTube](https://www.youtube.com/results?search_query=pgadmin+4+tutorial)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📝 Resumen de Configuración

| Parámetro | Valor |
|-----------|-------|
| **URL de Acceso** | http://localhost:5050 |
| **Email de Login** | admin@mail.com |
| **Password de Login** | root |
| **Hostname PostgreSQL** | db |
| **Puerto PostgreSQL** | 5432 |
| **Usuario PostgreSQL** | kevin |
| **Password PostgreSQL** | admin123 |
| **Base de Datos** | academic_db |

---

¡Ahora puedes visualizar y gestionar toda tu base de datos académica desde una interfaz gráfica! 🎉
