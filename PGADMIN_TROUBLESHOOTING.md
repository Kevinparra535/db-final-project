# 🔧 Solución: No Puedo Ver las Tablas en pgAdmin

## ✅ Verificación: Las Tablas SÍ Existen

Primero, verifica que las tablas existan ejecutando:

```bash
node scripts/check-tables.js
```

Si ves las **19 tablas** listadas, entonces el problema está en pgAdmin, no en la base de datos.

## 🐘 Soluciones para Ver las Tablas en pgAdmin

### Solución 1: Refrescar la Conexión (MÁS COMÚN)

1. **En pgAdmin**, en el panel izquierdo
2. Busca tu servidor **"Academic DB"**
3. **Click derecho** en el servidor
4. Selecciona **"Disconnect Server"**
5. Espera unos segundos
6. **Click derecho** nuevamente en el servidor
7. Selecciona **"Connect Server"**
8. Ingresa la contraseña si te la pide: `admin123`
9. **Expande el árbol**:
   ```
   Servers
   └── Academic DB
       └── Databases (1)
           └── academic_db
               └── Schemas (1)
                   └── public
                       └── Tables (19)  ← Deberías ver 19 tablas aquí
   ```

### Solución 2: Refrescar Solo las Tablas

1. En el panel izquierdo, navega hasta:
   ```
   Servers → Academic DB → Databases → academic_db → Schemas → public
   ```
2. **Click derecho** en **"Tables"**
3. Selecciona **"Refresh..."** o presiona **F5**
4. Las tablas deberían aparecer ahora

### Solución 3: Limpiar Cache de pgAdmin

1. Cierra todas las pestañas abiertas en pgAdmin
2. En el menú superior: **File → Clear Recent History**
3. **Desconecta** el servidor (click derecho → Disconnect Server)
4. **Reconecta** el servidor
5. Expande el árbol completo de nuevo

### Solución 4: Verificar el Esquema Correcto

Las tablas están en el esquema `public`. Asegúrate de estar expandiendo:

```
academic_db
  └── Schemas (1)
      └── public ← Expande este
          └── Tables (19) ← Las tablas están aquí
```

**NO** busques las tablas directamente bajo `academic_db`. Deben estar dentro de `Schemas → public → Tables`.

### Solución 5: Recrear la Conexión del Servidor

Si nada funciona, elimina y vuelve a crear la conexión:

1. **Click derecho** en **"Academic DB"**
2. Selecciona **"Remove Server..."**
3. Confirma la eliminación
4. **Click derecho** en **"Servers"**
5. **"Register" → "Server..."**
6. Configura nuevamente:

   **General:**
   - Name: `Academic DB`

   **Connection:**
   - Host: `db`
   - Port: `5432`
   - Database: `academic_db` ← **IMPORTANTE: Especificar la base de datos**
   - Username: `kevin`
   - Password: `admin123`
   - Save password: ✅

7. Click en **"Save"**
8. Expande el árbol completo

## 🔍 Verificación Manual desde Terminal

Si quieres verificar que las tablas existen sin usar pgAdmin:

### Método 1: Script de verificación
```bash
node scripts/check-tables.js
```

Deberías ver:
```
📋 Tablas encontradas:
   - public.SequelizeMeta
   - public.afiliacion
   - public.autoria
   - public.convocatoria
   - public.estudiante
   - public.facultad
   - public.grupo_investigacion
   - public.grupo_linea
   - public.investigador
   - public.investigador_correo
   - public.investigador_telefono
   - public.linea_investigacion
   - public.producto_investigacion
   - public.producto_tipo
   - public.profesor
   - public.profesor_correo
   - public.proyecto_investigacion
   - public.proyecto_linea
   - public.users

   Total: 19 tablas
```

### Método 2: psql directo
```bash
# Listar tablas
docker exec db psql -U kevin -d academic_db -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

# Contar tablas
docker exec db psql -U kevin -d academic_db -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';"

# Ver datos de una tabla específica
docker exec db psql -U kevin -d academic_db -c "SELECT * FROM facultad;"
```

### Método 3: Verificar con curl (API debe estar corriendo)
```bash
# Iniciar el servidor si no está corriendo
npm run dev

# En otra terminal:
curl http://localhost:3000/api/v1/facultades
```

Si la API responde con datos, las tablas definitivamente existen.

## 🎯 Problema Común: Configuración Incorrecta del Servidor

### ❌ Configuración Incorrecta
```
Host: localhost  ← INCORRECTO dentro de Docker
```

### ✅ Configuración Correcta
```
Host: db  ← CORRECTO (nombre del contenedor)
```

Si configuraste el servidor con `localhost` en lugar de `db`, pgAdmin **NO PODRÁ** conectarse correctamente desde su contenedor al contenedor de PostgreSQL.

## 🔄 Flujo Completo de Verificación

Ejecuta estos pasos en orden:

```bash
# 1. Verificar que Docker esté corriendo
docker-compose ps

# Deberías ver:
# db                     Up
# data-final-pgadmin-1   Up

# 2. Verificar que las tablas existan
node scripts/check-tables.js

# Deberías ver 19 tablas listadas

# 3. Abrir pgAdmin
npm run pgadmin

# 4. En pgAdmin:
#    - Login: admin@mail.com / root
#    - Conectar al servidor con host: db
#    - Navegar: Servers → Academic DB → Databases → academic_db → Schemas → public → Tables
#    - Si no ves tablas, hacer: Click derecho en "Tables" → Refresh

# 5. Verificar datos
#    - Click derecho en "facultad"
#    - "View/Edit Data" → "All Rows"
#    - Deberías ver 3 facultades
```

## 🐛 Diagnóstico Avanzado

Si después de todo esto no ves las tablas, ejecuta este diagnóstico completo:

```bash
# Crear archivo de diagnóstico
cat > /tmp/pgadmin-diagnosis.txt << EOF
=== DIAGNÓSTICO PGADMIN ===
Fecha: $(date)

1. Estado de contenedores:
$(docker-compose ps)

2. Tablas en la base de datos:
$(docker exec db psql -U kevin -d academic_db -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;")

3. Conexión desde pgAdmin container:
$(docker exec data-final-pgadmin-1 ping -c 2 db)

4. Verificación de puerto PostgreSQL:
$(docker exec db pg_isready -U kevin)

5. Variables de entorno:
DB_NAME=$(grep DB_NAME .env)
DB_USER=$(grep DB_USER .env)
DB_HOST=$(grep DB_HOST .env)

EOF

cat /tmp/pgadmin-diagnosis.txt
```

Comparte esta salida si sigues teniendo problemas.

## 📸 Captura de Pantalla Esperada

En pgAdmin deberías ver esta estructura:

```
📁 Servers
  └── 🖥️ Academic DB (PostgreSQL 13)
      └── 📊 Databases (1)
          └── 🗄️ academic_db
              └── 📂 Schemas (1)
                  └── 📂 public
                      └── 📋 Tables (19)
                          ├── SequelizeMeta
                          ├── afiliacion
                          ├── autoria
                          ├── convocatoria
                          ├── estudiante
                          ├── facultad
                          ├── grupo_investigacion
                          ├── grupo_linea
                          ├── investigador
                          ├── investigador_correo
                          ├── investigador_telefono
                          ├── linea_investigacion
                          ├── producto_investigacion
                          ├── producto_tipo
                          ├── profesor
                          ├── profesor_correo
                          ├── proyecto_investigacion
                          ├── proyecto_linea
                          └── users
```

## ✅ Confirmación Final

Una vez que veas las tablas, prueba esto para confirmar que todo funciona:

1. **Click derecho** en la tabla `facultad`
2. Selecciona **"View/Edit Data" → "All Rows"**
3. Deberías ver **3 registros**:
   - Facultad de Ingeniería (Bogotá)
   - Facultad de Ciencias (Medellín)
   - Facultad de Medicina (Cali)

Si ves estos datos, ¡todo está funcionando correctamente! 🎉

---

**Nota**: El problema más común es que pgAdmin mantiene conexiones cacheadas. Siempre intenta desconectar y reconectar el servidor primero antes de intentar otras soluciones.
