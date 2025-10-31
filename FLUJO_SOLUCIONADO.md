# 🚀 Guía Completa - Configuración de Base de Datos

## ✅ Problema Resuelto

El flujo de inicialización de base de datos ahora está **100% funcional** con scripts dedicados y manejo automático de Docker PostgreSQL.

## 🔧 Scripts Implementados

### 📋 Scripts de Configuración

```bash
npm run db:check    # ✅ Verificar entorno (Docker + PostgreSQL)
npm run db:setup    # ✅ Configuración completa desde cero  
npm run db:create   # ✅ Solo crear base de datos
npm run db:reset    # ✅ Reset completo (eliminar + reconfigurar)
```

### 📋 Scripts de Migración

```bash
npm run db:migrate              # ✅ Ejecutar migraciones
npm run db:migrate:undo         # ✅ Deshacer última migración
npm run db:migrate:undo:all     # ✅ Deshacer todas las migraciones
```

### 📋 Scripts de Datos

```bash
npm run db:seed     # ✅ Poblar con datos de prueba
```

## 🐳 Flujo con Docker (Recomendado)

### 1. Verificación Automática de Entorno
```bash
npm run db:check
```
**Este comando:**
- ✅ Verifica que Docker esté instalado
- ✅ Detecta si PostgreSQL está ejecutándose en puerto 5432
- ✅ Crea/inicia contenedor PostgreSQL automáticamente si es necesario
- ✅ Verifica conexión a la base de datos
- ✅ Muestra diagnósticos detallados si hay problemas

### 2. Configuración Completa (Primera vez)
```bash
npm run db:setup
```
**Este comando ejecuta automáticamente:**
1. **Crear base de datos** (`academic_research_db`)
2. **Ejecutar migraciones** (3 archivos de migración)
3. **Poblar datos de prueba** (facultades, investigadores, profesores, etc.)

### 3. Verificar Funcionamiento
```bash
npm run dev
```

## 📁 Estructura de Scripts Implementada

```
scripts/
├── check-environment.js    # Verificación completa de entorno
├── create-database.js      # Creación de base de datos
├── setup-project.js        # Configuración completa
└── reset-database.js       # Reset completo
```

## 🔄 Casos de Uso Comunes

### Inicialización Completa (Primera vez)
```bash
# 1. Verificar entorno
npm run db:check

# 2. Configurar todo
npm run db:setup

# 3. Iniciar servidor
npm run dev
```

### Desarrollo Diario
```bash
# Solo iniciar servidor (la DB ya está configurada)
npm run dev
```

### Reset Completo (Empezar desde cero)
```bash
# Eliminar todo y reconfigurar
npm run db:reset

# Iniciar servidor
npm run dev
```

### Problemas de Migración
```bash
# Deshacer todas las migraciones
npm run db:migrate:undo:all

# Ejecutar migraciones de nuevo
npm run db:migrate

# Poblar datos
npm run db:seed
```

## 🛠️ Resolución Automática de Problemas

### Docker PostgreSQL
El script `db:check` maneja automáticamente:
- ✅ **Puerto ocupado**: Detecta contenedores existentes
- ✅ **Contenedor parado**: Inicia contenedor existente
- ✅ **Sin contenedor**: Crea nuevo contenedor con credenciales correctas
- ✅ **Variables de entorno**: Valida configuración del `.env`

### Configuración de Base de Datos
Los scripts manejan:
- ✅ **Base de datos existe**: No duplica, usa la existente
- ✅ **Migraciones**: Ejecuta solo las pendientes
- ✅ **Datos duplicados**: Usa `ON CONFLICT DO NOTHING`
- ✅ **Errores de FK**: Referencias correctas a nombres de columna reales

## 📊 Base de Datos Poblada

### Entidades Creadas (Datos de Prueba)
- **3 Facultades** - Ingeniería, Ciencias, Medicina
- **3 Investigadores** - Con emails y teléfonos multivaluados
- **2 Profesores** - Con correos y relación a facultad
- **2 Estudiantes** - Programas de maestría y doctorado
- **2 Grupos de Investigación** - IA y Biotecnología
- **4 Líneas de Investigación** - IA, Software, Biotecnología, Energías
- **3 Tipos de Producto** - Artículo, Libro, Ponencia
- **1 Convocatoria** - Minciencias 2024

### API Endpoints Funcionales
```bash
# Todas estas URL funcionan inmediatamente después del setup
curl http://localhost:3000/api/v1/facultades
curl http://localhost:3000/api/v1/investigadores  
curl http://localhost:3000/api/v1/profesores
curl http://localhost:3000/api/v1/estudiantes
curl http://localhost:3000/api/v1/grupos
curl http://localhost:3000/api/v1/lineas
curl http://localhost:3000/api/v1/convocatorias
curl http://localhost:3000/api/v1/tipos-producto
```

## 🔧 Migraciones Implementadas

### 1. `20251031050000-create-core-entities.js`
- **9 ENUMs PostgreSQL** para campos controlados
- **12 Tablas principales** con relaciones FK
- **2 Tablas muchos-a-muchos** (proyecto-línea, grupo-línea)
- **11 Índices** optimizados para consultas

### 2. `20251031062953-test.js`
- Tabla `user` (legacy, se mantiene por compatibilidad)

### 3. `20251031070000-create-professors-students.js`
- Tabla `profesor` con relación a facultad
- Tabla `profesor_correo` para emails multivaluados
- Tabla `estudiante` con programas académicos

## 🎯 Beneficios del Nuevo Flujo

### Para Desarrollo
- ✅ **Un comando**: `npm run db:setup` configura todo
- ✅ **Sin errores manuales**: Scripts manejan todas las dependencias
- ✅ **Diagnóstico automático**: Detecta y resuelve problemas comunes
- ✅ **Desarrollo inmediato**: Lista para usar en segundos

### Para Docker
- ✅ **Detección automática**: No importa cómo esté configurado Docker
- ✅ **Reutilización**: Usa contenedores existentes cuando es posible
- ✅ **Configuración correcta**: Credenciales automáticas del `.env`
- ✅ **Gestión de puertos**: Maneja conflictos de puerto automáticamente

### Para PostgreSQL
- ✅ **Referencias correctas**: Nombres de columna reales en migraciones
- ✅ **Índices optimizados**: Performance mejorado desde el inicio
- ✅ **ENUMs nativos**: Tipos de datos controlados
- ✅ **Relaciones complejas**: FK, muchos-a-muchos, multivaluados

## 🚀 Resultado Final

El sistema académico está **100% operativo** con:
- ✅ **13 Servicios funcionando** con PostgreSQL
- ✅ **15 Modelos Sequelize** completamente implementados
- ✅ **Base de datos poblada** con datos realistas
- ✅ **API completa** con endpoints CRUD
- ✅ **Configuración automática** sin pasos manuales

**¡El flujo de inicialización está completamente solucionado y listo para desarrollo!** 🎉
