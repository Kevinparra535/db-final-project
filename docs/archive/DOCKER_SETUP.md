# 🐳 Configuración Docker - Sistema Académico

## 📋 Servicios Disponibles

El proyecto incluye los siguientes servicios Docker:

### PostgreSQL (Servicio Principal)
- **Contenedor**: `db`
- **Puerto**: `5432`
- **Base de datos**: `academic_research_db`
- **Usuario**: `kevin`
- **Contraseña**: `admin123`
- **Volumen**: `./postgres_data`

### pgAdmin (Administrador PostgreSQL)
- **Puerto**: `5050`
- **Email**: `admin@mail.com`
- **Contraseña**: `root`
- **URL**: http://localhost:5050

### MySQL (Opcional)
- **Puerto**: `3306`
- **Base de datos**: `academic_research_db`
- **Usuario**: `kevin`
- **Contraseña root**: `admin123`

### phpMyAdmin (Opcional)
- **Puerto**: `8080`
- **URL**: http://localhost:8080

## 🚀 Inicio Rápido

### 1. Iniciar Todos los Servicios
```bash
docker-compose up -d
```

### 2. Solo PostgreSQL (Recomendado para desarrollo)
```bash
docker-compose up -d postgres
```

### 3. PostgreSQL + pgAdmin
```bash
docker-compose up -d postgres pgadmin
```

## 🔧 Configuración del Proyecto

### Variables de Entorno (.env)
```env
PORT=3000
DB_USER=kevin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_NAME=academic_research_db
DB_PORT=5432
```

**⚠️ IMPORTANTE**: Estas credenciales coinciden exactamente con `docker-compose.yml`

### Verificación de Configuración
```bash
# Verificar que Docker esté ejecutándose y PostgreSQL listo
npm run db:check
```

## 📦 Comandos Docker Útiles

### Gestión de Servicios
```bash
# Iniciar servicios
docker-compose up -d postgres

# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f postgres

# Ver estado de contenedores
docker-compose ps
```

### Gestión de Datos
```bash
# Acceder a PostgreSQL desde terminal
docker exec -it db psql -U kevin -d academic_research_db

# Backup de base de datos
docker exec -t db pg_dump -U kevin academic_research_db > backup.sql

# Restaurar backup
docker exec -i db psql -U kevin academic_research_db < backup.sql
```

### Limpieza y Reset
```bash
# Eliminar contenedores y volúmenes (RESET TOTAL)
docker-compose down -v

# Eliminar solo datos de PostgreSQL
rm -rf postgres_data

# Recrear desde cero
docker-compose up -d postgres
npm run db:setup
```

## 🔄 Flujo de Desarrollo Completo

### Primera Vez (Setup Inicial)
```bash
# 1. Iniciar PostgreSQL con Docker
docker-compose up -d postgres

# 2. Esperar 5 segundos para que PostgreSQL inicie
sleep 5

# 3. Verificar entorno
npm run db:check

# 4. Configurar base de datos
npm run db:setup

# 5. Iniciar aplicación
npm run dev
```

### Desarrollo Diario
```bash
# 1. Iniciar PostgreSQL (si no está corriendo)
docker-compose up -d postgres

# 2. Iniciar aplicación
npm run dev
```

### Reset Completo
```bash
# 1. Detener servicios
docker-compose down -v

# 2. Limpiar datos
rm -rf postgres_data mysql_data

# 3. Iniciar servicios
docker-compose up -d postgres

# 4. Esperar y reconfigurar
sleep 5
npm run db:setup

# 5. Iniciar aplicación
npm run dev
```

## 🔌 Conexión a PostgreSQL

### Desde la Aplicación Node.js
La aplicación se conecta automáticamente usando las variables del `.env`:
```javascript
// Ya configurado en db/config.js
postgres://kevin:admin123@localhost:5432/academic_research_db
```

### Desde pgAdmin
1. Abrir http://localhost:5050
2. Login: `admin@mail.com` / `root`
3. Agregar servidor:
   - **Name**: Academic Research DB
   - **Host**: `host.docker.internal` (Mac/Windows) o `172.17.0.1` (Linux)
   - **Port**: `5432`
   - **Database**: `academic_research_db`
   - **Username**: `kevin`
   - **Password**: `admin123`

### Desde Terminal (psql)
```bash
# Opción 1: Desde el contenedor
docker exec -it db psql -U kevin -d academic_research_db

# Opción 2: Desde host (si tienes psql instalado)
psql -h localhost -U kevin -d academic_research_db
```

## 📊 Verificación de Estado

### Verificar que PostgreSQL está listo
```bash
docker exec db pg_isready -U kevin
# Debe retornar: /var/run/postgresql:5432 - accepting connections
```

### Ver tablas creadas
```bash
docker exec -it db psql -U kevin -d academic_research_db -c "\dt"
```

### Verificar datos poblados
```bash
# Contar registros en facultades
docker exec -it db psql -U kevin -d academic_research_db -c "SELECT COUNT(*) FROM facultad;"
```

## 🛠️ Troubleshooting

### Puerto 5432 ya está en uso
```bash
# Ver qué está usando el puerto
lsof -i :5432

# Detener PostgreSQL local si existe
brew services stop postgresql  # Mac
sudo service postgresql stop   # Linux

# O cambiar puerto en docker-compose.yml
ports:
  - 5433:5432  # Usar puerto 5433 en host
```

### Contenedor no inicia
```bash
# Ver logs del contenedor
docker-compose logs postgres

# Reiniciar contenedor
docker-compose restart postgres

# Recrear contenedor
docker-compose down
docker-compose up -d postgres
```

### Datos corruptos
```bash
# Eliminar volumen y recrear
docker-compose down -v
rm -rf postgres_data
docker-compose up -d postgres
npm run db:setup
```

### Error de permisos en volumen
```bash
# Eliminar carpeta de datos
sudo rm -rf postgres_data

# Recrear con permisos correctos
docker-compose up -d postgres
```

## 🔐 Seguridad

### Producción
**⚠️ NUNCA uses estas credenciales en producción**

Para producción, actualizar:
1. Cambiar contraseñas en `.env`
2. Actualizar `docker-compose.yml` con variables de entorno
3. Usar secretos de Docker o variables de entorno del sistema

### Variables de Entorno Seguras (Producción)
```yaml
# docker-compose.yml
services:
  postgres:
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

## 📈 Monitoreo

### Ver uso de recursos
```bash
docker stats db
```

### Ver conexiones activas
```bash
docker exec -it db psql -U kevin -d academic_research_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### Ver tamaño de base de datos
```bash
docker exec -it db psql -U kevin -d academic_research_db -c "SELECT pg_size_pretty(pg_database_size('academic_research_db'));"
```

## ✅ Checklist de Validación

Después de configurar, verifica:

- [ ] `docker-compose ps` muestra contenedor `db` en estado `Up`
- [ ] `npm run db:check` pasa todas las verificaciones
- [ ] `curl http://localhost:3000/api/v1/facultades` retorna datos
- [ ] pgAdmin en http://localhost:5050 se conecta correctamente
- [ ] Logs sin errores: `docker-compose logs postgres`

## 🎯 Resumen

**El proyecto está 100% configurado para usar Docker:**
- ✅ PostgreSQL ejecutándose en contenedor `db`
- ✅ Credenciales consistentes entre `.env` y `docker-compose.yml`
- ✅ Scripts `npm run db:*` verifican y usan Docker automáticamente
- ✅ No se requiere PostgreSQL local instalado
- ✅ Datos persistentes en volumen `postgres_data`

**Comando único para empezar:**
```bash
docker-compose up -d postgres && sleep 5 && npm run db:setup && npm run dev
```
