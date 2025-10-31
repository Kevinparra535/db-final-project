# 🎯 Guía Rápida de Acceso - pgAdmin

## 🚀 Acceso Rápido

### Método 1: Script NPM (Recomendado)
```bash
npm run pgadmin
```
Este comando abrirá automáticamente pgAdmin en tu navegador con todas las credenciales mostradas.

### Método 2: Manual
1. Abre tu navegador
2. Navega a: **http://localhost:5050**

---

## 🔑 Credenciales de pgAdmin

| Campo | Valor |
|-------|-------|
| **URL** | http://localhost:5050 |
| **Email** | `admin@mail.com` |
| **Password** | `root` |

---

## 🐘 Configuración del Servidor PostgreSQL

### Pasos para Conectar

1. **Login en pgAdmin** con las credenciales de arriba
2. **Click derecho** en "Servers"
3. Selecciona **"Register" → "Server..."**
4. **Completa los siguientes datos:**

#### Pestaña "General"
| Campo | Valor |
|-------|-------|
| **Name** | `Academic DB` |

#### Pestaña "Connection"
| Campo | Valor | ⚠️ Importante |
|-------|-------|--------------|
| **Host name/address** | `db` | ⚠️ Usar `db`, NO `localhost` |
| **Port** | `5432` | |
| **Maintenance database** | `postgres` | |
| **Username** | `kevin` | |
| **Password** | `admin123` | |
| **Save password?** | ✅ Marcar | Para no ingresarla cada vez |

5. Click en **"Save"**

---

## 📊 Navegar la Base de Datos

Una vez conectado:

```
Servers
└── Academic DB
    └── Databases (1)
        └── academic_db
            └── Schemas (1)
                └── public
                    └── Tables (17)
```

### Ver Datos de una Tabla

1. Expande: **Servers → Academic DB → Databases → academic_db → Schemas → public → Tables**
2. **Click derecho** en cualquier tabla (ej: `facultad`)
3. Selecciona **"View/Edit Data" → "All Rows"**

### Ejecutar Consultas SQL

1. Click en el ícono **⚡ Query Tool** en la barra superior
2. Escribe tu consulta SQL
3. Presiona **F5** o click en **▶️ Execute**

---

## 💡 Consultas SQL de Ejemplo

### Ver Todas las Facultades
```sql
SELECT * FROM facultad;
```

### Investigadores con Emails
```sql
SELECT 
    i.id_investigador,
    i.nombres || ' ' || i.apellidos AS nombre_completo,
    STRING_AGG(ic.email, ', ') AS emails
FROM investigador i
LEFT JOIN investigador_correo ic 
    ON i.id_investigador = ic.id_investigador
GROUP BY i.id_investigador, i.nombres, i.apellidos
ORDER BY i.apellidos;
```

### Grupos por Facultad
```sql
SELECT 
    f.nombre AS facultad,
    COUNT(g.id_grupo) AS total_grupos,
    STRING_AGG(g.nombre, ', ') AS grupos
FROM facultad f
LEFT JOIN grupo_investigacion g ON f.id_facultad = g.facultad
GROUP BY f.id_facultad, f.nombre
ORDER BY total_grupos DESC;
```

### Resumen de Datos
```sql
SELECT 'Facultades' AS entidad, COUNT(*) AS total FROM facultad
UNION ALL
SELECT 'Investigadores', COUNT(*) FROM investigador
UNION ALL
SELECT 'Profesores', COUNT(*) FROM profesor
UNION ALL
SELECT 'Estudiantes', COUNT(*) FROM estudiante
UNION ALL
SELECT 'Grupos', COUNT(*) FROM grupo_investigacion
UNION ALL
SELECT 'Proyectos', COUNT(*) FROM proyecto_investigacion
UNION ALL
SELECT 'Productos', COUNT(*) FROM producto_investigacion;
```

---

## 🎨 Funcionalidades Útiles

### Generar Diagrama ERD
1. Click derecho en **"academic_db"**
2. Selecciona **"Generate ERD"**
3. Se mostrará un diagrama visual de todas las tablas y relaciones

### Exportar Datos
1. Click derecho en una tabla
2. Selecciona **"Import/Export Data..."**
3. Elige formato (CSV, JSON, etc.)
4. Especifica ubicación y click en **"OK"**

### Ver Estructura de Tabla
1. Click derecho en la tabla
2. Selecciona **"Properties"**
3. Explora pestañas:
   - **Columns**: Columnas y tipos de datos
   - **Constraints**: Primary keys, Foreign keys, Unique
   - **Indexes**: Índices de la tabla

---

## 🔧 Solución de Problemas

### ❌ No puedo acceder a localhost:5050

**Solución:**
```bash
# Verificar que pgAdmin esté corriendo
docker-compose ps

# Si no está corriendo, iniciarlo
docker-compose up -d pgadmin

# Ver logs
docker-compose logs pgadmin
```

### ❌ Error "connection refused" al conectar

**Causas comunes:**
- ✅ Asegúrate de usar `db` como hostname, NO `localhost`
- ✅ Verifica que el contenedor PostgreSQL esté corriendo
- ✅ Confirma las credenciales: user=`kevin`, password=`admin123`

**Verificar PostgreSQL:**
```bash
docker exec db pg_isready -U kevin
```

### ❌ Olvidé la contraseña de pgAdmin

**Solución:**
```bash
# Resetear pgAdmin
docker-compose down pgadmin
docker-compose up -d pgadmin

# Volver a intentar con credenciales del docker-compose.yml
# Email: admin@mail.com
# Password: root
```

---

## 📚 Documentación Completa

Para más información detallada:

- **[PGADMIN_SETUP.md](./PGADMIN_SETUP.md)** - Guía completa con consultas avanzadas
- **[FLUJO_COMPLETO.md](./FLUJO_COMPLETO.md)** - Flujo completo de inicialización
- **[README.md](./README.md)** - Documentación principal del proyecto

---

## ✅ Checklist de Verificación

- [ ] pgAdmin accesible en http://localhost:5050
- [ ] Login exitoso con admin@mail.com / root
- [ ] Servidor PostgreSQL registrado
- [ ] Conexión exitosa a `academic_db`
- [ ] Tablas visibles en la navegación
- [ ] Consultas SQL ejecutándose correctamente

---

¡Ahora puedes visualizar y gestionar toda tu base de datos académica! 🎉
