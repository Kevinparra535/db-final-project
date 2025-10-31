# ✅ Verificación del Sistema

[⬅️ Volver al Índice](./README.md)

## 📋 Tabla de Contenidos

1. [Verificación Automática](#verificación-automática)
2. [Verificación Manual por Componentes](#verificación-manual-por-componentes)
3. [Lista de Verificación Completa](#lista-de-verificación-completa)
4. [Pruebas de Funcionalidad](#pruebas-de-funcionalidad)

---

## Verificación Automática

### Script de Verificación Completa

```bash
npm run system:verify
```

Este comando verifica:
- ✅ Configuración (.env y docker-compose.yml)
- ✅ Docker está ejecutándose
- ✅ PostgreSQL está accesible
- ✅ Base de datos existe y tiene tablas
- ✅ API responde correctamente
- ✅ Datos de prueba están cargados

**Salida Esperada:**
```
=== VERIFICACIÓN DEL SISTEMA ===

✓ Archivo .env encontrado
✓ Archivo docker-compose.yml encontrado
✓ Credenciales consistentes entre archivos
✓ Docker daemon está corriendo
✓ Contenedor 'db' está activo
✓ PostgreSQL responde en puerto 5432
✓ Base de datos 'academic_db' existe
✓ 16 tablas encontradas en la base de datos
✓ API responde en http://localhost:3000
✓ Endpoint /api/v1/ devuelve respuesta correcta
✓ Endpoint /api/v1/facultades devuelve datos
✓ 5 facultades encontradas en la base de datos

=== TODAS LAS VERIFICACIONES PASARON ✓ ===
Tiempo total: 2.3s
```

---

## Verificación Manual por Componentes

### 1. Verificar Docker

```bash
# Ver si Docker está corriendo
docker ps

# Verificar contenedor de PostgreSQL
docker ps | grep postgres

# Ver logs de PostgreSQL
npm run docker:logs
```

**✅ PostgreSQL está OK si ves:**
```
database system is ready to accept connections
```

**✅ pgAdmin está OK si ves:**
```
Starting pgAdmin 4...
Listening at: http://0.0.0.0:80
```

### 2. Verificar Base de Datos

```bash
# Listar tablas
npm run db:tables

# Ver configuración
npm run config:verify
```

**✅ Deberías ver al menos 16 tablas:**
- facultad
- investigador
- investigador_correo
- investigador_telefono
- profesor
- profesor_correo
- estudiante
- grupo_investigacion
- linea_investigacion
- grupo_linea
- convocatoria
- proyecto_investigacion
- proyecto_linea
- producto_tipo
- producto_investigacion
- afiliacion
- autoria

### 3. Verificar API

```bash
# Iniciar servidor (si no está corriendo)
npm run dev
```

En otra terminal:

```bash
# Verificar endpoint raíz
curl http://localhost:3000/api/v1/

# Verificar facultades
curl http://localhost:3000/api/v1/facultades

# Verificar investigadores
curl http://localhost:3000/api/v1/investigadores
```

### 4. Verificar pgAdmin (Opcional)

```bash
# Abrir pgAdmin
npm run pgadmin
```

Esto abre http://localhost:5050 con credenciales pre-configuradas.

**Verificar conexión a base de datos:**
1. Login: `admin@mail.com` / `root`
2. Register Server:
   - Name: `Academic DB`
   - Host: `db`
   - Port: `5432`
   - Username: `kevin`
   - Password: `admin123`
3. Navegar: Servers → Academic DB → Databases → academic_db → Schemas → public → Tables
4. ✅ Deberías ver las 16+ tablas

---

## Lista de Verificación Completa

### Checklist para Evaluadores

Use esta lista para verificar que todo funciona correctamente:

#### Infraestructura
- [ ] Docker Desktop está instalado y corriendo
- [ ] Contenedor `db` (PostgreSQL) está activo
- [ ] Contenedor `pgadmin` está activo
- [ ] Puerto 5432 está accesible
- [ ] Puerto 5050 está accesible
- [ ] Puerto 3000 está accesible

#### Base de Datos
- [ ] Base de datos `academic_db` existe
- [ ] Las 16+ tablas están creadas
- [ ] Los datos de ejemplo están cargados
- [ ] pgAdmin se conecta correctamente
- [ ] Puedo ver datos en las tablas desde pgAdmin

#### API
- [ ] Servidor Node.js inicia sin errores
- [ ] Endpoint raíz `/api/v1/` responde
- [ ] Endpoint `/api/v1/facultades` devuelve datos
- [ ] Endpoint `/api/v1/investigadores` devuelve datos
- [ ] Endpoint `/api/v1/grupos` devuelve datos
- [ ] Endpoint `/api/v1/proyectos` devuelve datos

#### Operaciones CRUD
- [ ] Puedo listar entidades (GET)
- [ ] Puedo crear una entidad (POST)
- [ ] Puedo actualizar una entidad (PUT/PATCH)
- [ ] Puedo eliminar una entidad (DELETE)
- [ ] Las validaciones funcionan (errores 400 con datos inválidos)

#### Funcionalidades Avanzadas
- [ ] Búsquedas funcionan (`/search/nombre/...`)
- [ ] Estadísticas funcionan (`/estadisticas/...`)
- [ ] Rankings funcionan (`/ranking/...`)
- [ ] Relaciones many-to-many funcionan (afiliaciones, autorías)
- [ ] Datos multivaluados funcionan (emails, teléfonos)

---

## Pruebas de Funcionalidad

### Prueba 1: CRUD Básico de Facultades

```bash
# 1. Listar todas las facultades
curl http://localhost:3000/api/v1/facultades

# 2. Crear nueva facultad
curl -X POST http://localhost:3000/api/v1/facultades \
  -H "Content-Type: application/json" \
  -d '{
    "id_facultad": "FAC0000099",
    "nombre": "Facultad de Prueba",
    "decano": "Dr. Test",
    "sede": "Sede Principal",
    "ciudad": "Bogotá"
  }'

# 3. Obtener la facultad creada
curl http://localhost:3000/api/v1/facultades/FAC0000099

# 4. Actualizar la facultad
curl -X PATCH http://localhost:3000/api/v1/facultades/FAC0000099 \
  -H "Content-Type: application/json" \
  -d '{
    "decano": "Dr. Test Updated"
  }'

# 5. Eliminar la facultad
curl -X DELETE http://localhost:3000/api/v1/facultades/FAC0000099
```

**✅ Todas las operaciones deben responder con status 200/201**

### Prueba 2: Investigador con Datos Multivaluados

```bash
# Crear investigador con múltiples emails y teléfonos
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
      {"email": "juan.perez@universidad.edu.co", "etiqueta": "institucional"},
      {"email": "juan@gmail.com", "etiqueta": "personal"}
    ],
    "telefonos": [
      {"numero": "3001234567", "tipo": "móvil"},
      {"numero": "6012345678", "tipo": "fijo"}
    ]
  }'
```

**✅ Debe crear investigador + 2 emails + 2 teléfonos en una transacción**

### Prueba 3: Búsquedas

```bash
# Buscar investigadores por nombre
curl http://localhost:3000/api/v1/investigadores/search/nombre/Juan

# Buscar grupos por clasificación
curl http://localhost:3000/api/v1/grupos/search/clasificacion/A

# Buscar proyectos por estado
curl http://localhost:3000/api/v1/proyectos/search/estado/en_ejecución
```

**✅ Cada búsqueda debe devolver resultados filtrados**

### Prueba 4: Estadísticas

```bash
# Estadísticas de grupos por clasificación
curl http://localhost:3000/api/v1/grupos/estadisticas/clasificaciones

# Estadísticas de proyectos por estado
curl http://localhost:3000/api/v1/proyectos/estadisticas/estados

# Estadísticas de productos por tipo
curl http://localhost:3000/api/v1/productos/estadisticas/tipos
```

**✅ Debe devolver objetos con conteos agregados**

### Prueba 5: Relaciones Many-to-Many

```bash
# Ver afiliaciones de un investigador
curl http://localhost:3000/api/v1/afiliaciones/search/investigador/INV0000001

# Ver autorías de un producto
curl http://localhost:3000/api/v1/autorias/search/producto/PROD00000001

# Ver líneas de un grupo
curl http://localhost:3000/api/v1/grupos/GRP0000001/lineas
```

**✅ Debe mostrar las relaciones correctamente**

---

## Verificación con Postman

### Setup de Postman

1. **Importar Colección:**
   - File → Import
   - Seleccionar: `postman/Academic_Research_API.postman_collection.json`

2. **Importar Entorno:**
   - File → Import
   - Seleccionar: `postman/Academic_API_Environment.postman_environment.json`

3. **Seleccionar Entorno:**
   - En la esquina superior derecha, seleccionar "Academic API Environment"

### Carpetas de Prueba Organizadas

La colección tiene estas carpetas:

1. **Home** - Endpoint raíz
2. **Facultades** - CRUD completo + búsquedas
3. **Investigadores** - CRUD + emails + teléfonos + búsquedas
4. **Profesores** - CRUD + emails + búsquedas
5. **Estudiantes** - CRUD + búsquedas por nivel
6. **Grupos** - CRUD + líneas + rankings
7. **Líneas** - CRUD + estadísticas
8. **Convocatorias** - CRUD + filtros por estado
9. **Proyectos** - CRUD + líneas + estadísticas
10. **Productos** - CRUD + metadata JSONB + búsquedas
11. **Tipos Producto** - CRUD + estadísticas de uso
12. **Afiliaciones** - CRUD + cambio de roles + historial
13. **Autorías** - CRUD + colaboraciones + rankings

### Ejecutar Pruebas Automáticas

1. Click derecho en la colección "Academic Research API"
2. Seleccionar "Run collection"
3. Click en "Run Academic Research API"

**✅ Todas las peticiones deben pasar (verde)**

---

## Verificación Visual con pgAdmin

### 1. Acceder a pgAdmin

```bash
npm run pgadmin
```

### 2. Consultas SQL de Verificación

Ejecuta estas queries en Query Tool:

```sql
-- Ver total de registros por tabla
SELECT 
    'facultades' as tabla, COUNT(*) as total FROM facultad
UNION ALL
SELECT 'investigadores', COUNT(*) FROM investigador
UNION ALL
SELECT 'profesores', COUNT(*) FROM profesor
UNION ALL
SELECT 'estudiantes', COUNT(*) FROM estudiante
UNION ALL
SELECT 'grupos', COUNT(*) FROM grupo_investigacion
UNION ALL
SELECT 'proyectos', COUNT(*) FROM proyecto_investigacion
UNION ALL
SELECT 'productos', COUNT(*) FROM producto_investigacion;

-- Ver investigadores con sus emails
SELECT 
    i.nombres || ' ' || i.apellidos as investigador,
    STRING_AGG(ic.email, ', ') as emails
FROM investigador i
LEFT JOIN investigador_correo ic ON i.id_investigador = ic.id_investigador
GROUP BY i.id_investigador, i.nombres, i.apellidos
LIMIT 10;

-- Ver afiliaciones activas
SELECT 
    i.nombres || ' ' || i.apellidos as investigador,
    g.nombre as grupo,
    a.rol,
    a.fecha_inicio
FROM afiliacion a
JOIN investigador i ON a.investigador = i.id_investigador
JOIN grupo_investigacion g ON a.grupo = g.id_grupo
WHERE a.estado = 'activa'
ORDER BY a.fecha_inicio DESC;
```

**✅ Todas las queries deben devolver resultados**

---

## 🎯 Resumen de Verificación

Si completaste todos los pasos anteriores con éxito:

✅ **Infraestructura**: Docker + PostgreSQL + pgAdmin funcionando  
✅ **Base de Datos**: 16+ tablas creadas con datos de ejemplo  
✅ **API**: 13 entidades con CRUD completo funcionando  
✅ **Funcionalidades**: Búsquedas, estadísticas, relaciones OK  
✅ **Validaciones**: Joi + Boom manejando errores correctamente  
✅ **Transacciones**: Operaciones complejas con integridad garantizada  

**🎉 El proyecto está completamente funcional y listo para evaluación**

---

## ⏭️ Próximos Pasos

- **Explorar API**: [Guía de API](./03-guia-api.md)
- **Usar Postman**: [Guía Postman](./04-postman.md)
- **Ver Arquitectura**: [Arquitectura](./05-arquitectura.md)

---

[⬅️ Anterior: Setup](./01-setup-completo.md) | [⬅️ Volver al Índice](./README.md) | [➡️ Siguiente: Guía de API](./03-guia-api.md)
