# 🆘 Troubleshooting - Solución de Problemas

[⬅️ Volver al Índice](./README.md)

Esta guía contiene soluciones a los problemas más comunes que puedes encontrar.

---

## 🐳 Problemas con Docker

### Error: "Cannot connect to the Docker daemon"

**Síntoma:**
```
Error: Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?
```

**Solución:**
1. Verifica que Docker Desktop esté instalado
2. Inicia Docker Desktop manualmente
3. Espera a que el ícono de Docker en la barra de tareas esté activo (ballena)
4. Ejecuta de nuevo:
```bash
npm run docker:up
```

### Error: "Port 5432 is already allocated"

**Síntoma:**
```
Error starting userland proxy: listen tcp 0.0.0.0:5432: bind: address already in use
```

**Causa:** Tienes PostgreSQL corriendo localmente en tu máquina.

**Solución:**

**macOS:**
```bash
# Ver si PostgreSQL está corriendo
brew services list

# Detener PostgreSQL local
brew services stop postgresql
```

**Linux:**
```bash
# Detener PostgreSQL
sudo service postgresql stop
```

**Windows:**
```powershell
# Detener servicio PostgreSQL
net stop postgresql-x64-13
```

Luego reinicia Docker:
```bash
npm run docker:up
```

### Error: "Port 3000 is already in use"

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**

**macOS/Linux:**
```bash
# Encontrar el proceso usando el puerto 3000
lsof -i :3000

# Matar el proceso (reemplaza PID con el número mostrado)
kill -9 <PID>
```

**Windows:**
```powershell
# Encontrar el proceso
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

**Alternativa:** Cambiar el puerto en `.env`:
```env
PORT=3001
```

### Error: "No space left on device"

**Solución:**
```bash
# Limpiar contenedores e imágenes no usadas
docker system prune -a

# Limpiar volúmenes
docker volume prune
```

---

## 🗄️ Problemas con PostgreSQL

### Error: "ECONNREFUSED 127.0.0.1:5432"

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causa:** PostgreSQL no está corriendo en Docker.

**Solución:**
```bash
# Verificar que el contenedor está corriendo
docker ps | grep postgres

# Si no está, iniciar Docker
npm run docker:up

# Verificar logs
npm run docker:logs
```

### Error: "database does not exist"

**Síntoma:**
```
error: database "academic_db" does not exist
```

**Solución:**
```bash
# Crear la base de datos
npm run db:create

# O setup completo
npm run db:setup
```

### Error: "relation does not exist"

**Síntoma:**
```
error: relation "facultad" does not exist
```

**Causa:** Las migraciones no se han ejecutado.

**Solución:**
```bash
# Ejecutar migraciones
npm run db:migrate

# Verificar que las tablas existen
npm run db:tables
```

### Error: "password authentication failed for user"

**Síntoma:**
```
error: password authentication failed for user "kevin"
```

**Causa:** Credenciales incorrectas en `.env`.

**Solución:**
1. Verifica que `.env` tenga:
```env
DB_USER=kevin
DB_PASSWORD=admin123
```

2. Verifica que `docker-compose.yml` tenga:
```yaml
environment:
  - POSTGRES_USER=kevin
  - POSTGRES_PASSWORD=admin123
```

3. Si cambiaste las credenciales, resetea Docker:
```bash
npm run docker:reset
npm run docker:up
npm run db:setup
```

---

## 📦 Problemas con npm/Node.js

### Error: "Cannot find module"

**Síntoma:**
```
Error: Cannot find module 'express'
```

**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "EACCES: permission denied"

**Síntoma:**
```
npm ERR! Error: EACCES: permission denied
```

**Solución:**

**NO uses sudo**. En su lugar:

**macOS/Linux:**
```bash
# Cambiar propietario de node_modules
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP node_modules
```

**Windows:** Ejecuta la terminal como Administrador.

### Error: "Engine not compatible"

**Síntoma:**
```
The engine "node" is incompatible with this module
```

**Solución:**
```bash
# Verificar versión de Node
node --version

# Debe ser 16.x o superior
# Si no, instala desde: https://nodejs.org/
```

---

## 🔧 Problemas con la API

### Error: "Cannot GET /api/v1/..."

**Síntoma:**
```
Cannot GET /api/v1/facultades
```

**Causa:** El servidor no está corriendo.

**Solución:**
```bash
# Iniciar servidor
npm run dev
```

### Error: "ValidationError" al crear entidad

**Síntoma:**
```json
{
  "statusCode": 409,
  "message": "SequelizeValidationError",
  "errors": [...]
}
```

**Causa:** Datos inválidos o duplicados.

**Solución:**
1. Verifica que el JSON cumpla con el schema
2. Verifica que el ID no exista ya
3. Verifica que los campos requeridos estén presentes

**Ejemplo correcto para Facultad:**
```json
{
  "id_facultad": "FAC0000099",
  "nombre": "Facultad de Test",
  "decano": "Dr. Test",
  "sede": "Principal",
  "ciudad": "Bogotá"
}
```

### Error: "notFound" al buscar entidad

**Síntoma:**
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Entidad no encontrada"
}
```

**Causa:** El ID no existe en la base de datos.

**Solución:**
1. Verifica que el ID esté correcto
2. Lista las entidades disponibles:
```bash
curl http://localhost:3000/api/v1/facultades
```

---

## 🔄 Problemas con Migraciones

### Error: "Migration already executed"

**Síntoma:**
```
Migration already executed
```

**Solución:**
```bash
# Ver estado de migraciones
npm run db:migrate

# Si todo está al día, no hace falta nada
```

### Error: "Migration file not found"

**Solución:**
```bash
# Verificar que existen los archivos
ls db/migrations/

# Deberías ver:
# 20241025-create-core-entities.js
# 20241026-create-projects-products.js
# 20241027-create-professors-students.js
```

### Quiero rehacer todas las migraciones

**Solución:**
```bash
# Deshacer todas las migraciones
npm run db:migrate:undo:all

# Ejecutar de nuevo
npm run db:migrate

# Poblar con datos
npm run db:seed
```

---

## 🔍 Problemas con pgAdmin

### No puedo acceder a http://localhost:5050

**Solución:**
```bash
# Verificar que pgAdmin está corriendo
docker ps | grep pgadmin

# Si no está, iniciar Docker
npm run docker:up

# Esperar 10 segundos y probar de nuevo
```

### Error al conectar a PostgreSQL desde pgAdmin

**Síntoma:** "Unable to connect to server"

**Solución:**

Al registrar el servidor, usa estos datos **EXACTOS**:

**General:**
- Name: `Academic DB` (puede ser cualquier nombre)

**Connection:**
- Host name/address: `db` ⚠️ **NO localhost**
- Port: `5432`
- Maintenance database: `postgres`
- Username: `kevin`
- Password: `admin123`
- Save password: ✅ (marcar)

**¿Por qué `db` y no `localhost`?**

Porque pgAdmin corre dentro de Docker, y desde ahí el contenedor de PostgreSQL se llama `db` según `docker-compose.yml`.

---

## 🔄 Reset Completo (Última Opción)

Si nada funciona, resetea todo desde cero:

```bash
# 1. Detener servidor Node (Ctrl+C)

# 2. Detener y eliminar contenedores Docker
npm run docker:down

# 3. Eliminar volúmenes de datos
npm run docker:reset

# 4. Limpiar node_modules
rm -rf node_modules
rm package-lock.json

# 5. Reinstalar todo
npm install

# 6. Iniciar Docker
npm run docker:up

# 7. Esperar 10 segundos
sleep 10

# 8. Setup completo de base de datos
npm run db:setup

# 9. Iniciar servidor
npm run dev

# 10. Verificar
npm run system:verify
```

---

## 📊 Verificar Estado del Sistema

### Script de Diagnóstico

```bash
# Verificación completa
npm run system:verify
```

### Verificación Manual Paso a Paso

```bash
# 1. Docker
docker ps

# 2. PostgreSQL
docker exec -it db psql -U kevin -d academic_db -c "\dt"

# 3. API
curl http://localhost:3000/api/v1/

# 4. Datos
curl http://localhost:3000/api/v1/facultades
```

---

## 🆘 Errores Específicos por Entidad

### Investigadores: Error con emails/teléfonos

**Síntoma:** No se crean los emails o teléfonos

**Causa:** Error en la transacción

**Solución:**
Asegúrate de enviar los datos en el formato correcto:

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "tipo_id": "CC",
  "num_id": "1234567890",
  "facultad": "FAC0000001",
  "emails": [
    {
      "email": "juan@universidad.edu.co",
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

### Proyectos: Error con líneas de investigación

**Síntoma:** No se asocian las líneas al proyecto

**Solución:**
Usar el endpoint específico:

```bash
# Primero crear el proyecto
POST /api/v1/proyectos

# Luego agregar líneas
POST /api/v1/proyectos/{id}/lineas/{lineaId}
```

### Productos: Error con metadata JSONB

**Síntoma:** Error al actualizar metadata

**Solución:**
El metadata debe ser un objeto JSON válido:

```json
{
  "metadata": {
    "doi": "10.1234/example",
    "isbn": "978-1234567890",
    "paginas": "100-120",
    "revista": "Journal of Research"
  }
}
```

---

## 📞 Ayuda Adicional

Si el problema persiste:

1. **Revisa los logs:**
```bash
# Logs de PostgreSQL
npm run docker:logs

# Logs del servidor
# (visible en la terminal donde corre npm run dev)
```

2. **Verifica la configuración:**
```bash
npm run config:verify
```

3. **Consulta la documentación:**
   - [Setup Completo](./01-setup-completo.md)
   - [Verificación](./02-verificacion.md)
   - [Base de Datos](./07-base-de-datos.md)

4. **Revisa issues en GitHub:**
   - https://github.com/Kevinparra535/db-final-project/issues

---

[⬅️ Volver al Índice](./README.md)
