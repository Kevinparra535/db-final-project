# Guía de Deployment

Documentación completa para desplegar el sistema de gestión académica en diferentes entornos.

## 🚀 Entornos de Deployment

### Desarrollo (Development)
- **Propósito**: Desarrollo local y testing
- **Base de datos**: Mock data con Faker.js
- **Puerto**: 3000
- **Hot reload**: Activado con Nodemon

### Pruebas (Staging)
- **Propósito**: Testing pre-producción
- **Base de datos**: PostgreSQL (staging)
- **Puerto**: 3000
- **SSL**: Opcional

### Producción (Production)
- **Propósito**: Ambiente productivo
- **Base de datos**: PostgreSQL (production)
- **Puerto**: 80/443
- **SSL**: Requerido
- **Load balancer**: Recomendado

---

## 🐳 Deployment con Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    postgresql-client \
    curl

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S academic -u 1001 -G nodejs

# Cambiar ownership de archivos
RUN chown -R academic:nodejs /usr/src/app
USER academic

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/home || exit 1

# Comando de inicio
CMD ["npm", "start"]
```

### Docker Compose para Desarrollo

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  academic-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    command: npm run dev
    depends_on:
      - postgres
    networks:
      - academic-network

  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: academic_db
      POSTGRES_USER: academic_user
      POSTGRES_PASSWORD: academic_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - academic-network

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@academic.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "8080:80"
    depends_on:
      - postgres
    networks:
      - academic-network

volumes:
  postgres_data:

networks:
  academic-network:
    driver: bridge
```

### Docker Compose para Producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  academic-api:
    image: academic-api:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - API_KEY=${API_KEY}
    depends_on:
      - postgres
    networks:
      - academic-network
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  postgres:
    image: postgres:13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - academic-network
    deploy:
      placement:
        constraints: [node.role == manager]

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - academic-api
    networks:
      - academic-network

volumes:
  postgres_prod_data:

networks:
  academic-network:
    driver: overlay
    attachable: true
```

### Comandos Docker

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up --build

# Producción
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose logs -f academic-api

# Escalar servicio
docker-compose -f docker-compose.prod.yml up -d --scale academic-api=3

# Backup de base de datos
docker-compose exec postgres pg_dump -U academic_user academic_db > backup.sql

# Restore de base de datos
docker-compose exec -T postgres psql -U academic_user academic_db < backup.sql
```

---

## ⚙️ Variables de Entorno

### Archivo .env para Desarrollo

```env
# .env.development
NODE_ENV=development
PORT=3000

# Base de datos (cuando se implemente PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=academic_db
DB_USER=academic_user
DB_PASSWORD=academic_pass
DATABASE_URL=postgresql://academic_user:academic_pass@localhost:5432/academic_db

# Configuración de la aplicación
API_VERSION=v1
DEFAULT_LIMIT=10
MAX_LIMIT=100

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# CORS
CORS_ORIGIN=http://localhost:3001

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# JWT (para futura autenticación)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Faker.js configuración
FAKER_LOCALE=es
MOCK_DATA_SIZE=100
```

### Archivo .env para Producción

```env
# .env.production
NODE_ENV=production
PORT=3000

# Base de datos
DB_HOST=db.academic-prod.internal
DB_PORT=5432
DB_NAME=academic_production
DB_USER=academic_prod_user
DB_PASSWORD=super-secure-password-123
DATABASE_URL=postgresql://academic_prod_user:super-secure-password-123@db.academic-prod.internal:5432/academic_production

# SSL configuración
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Configuración de la aplicación
API_VERSION=v1
DEFAULT_LIMIT=10
MAX_LIMIT=50

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/academic/app.log

# CORS
CORS_ORIGIN=https://academic.universidad.edu.co,https://app.universidad.edu.co

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50

# JWT
JWT_SECRET=production-super-secret-jwt-key-very-long-and-secure
JWT_EXPIRES_IN=8h

# Monitoring
HEALTH_CHECK_PATH=/health
METRICS_ENABLED=true

# Email (para notificaciones)
SMTP_HOST=smtp.universidad.edu.co
SMTP_PORT=587
SMTP_USER=noreply@universidad.edu.co
SMTP_PASSWORD=smtp-password

# File uploads (futuro)
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,xlsx
UPLOAD_PATH=/var/uploads/academic
```

### Script para cargar variables

```bash
#!/bin/bash
# scripts/load-env.sh

ENV=${1:-development}

if [ -f ".env.${ENV}" ]; then
    export $(cat .env.${ENV} | sed 's/#.*//g' | xargs)
    echo "✅ Variables de entorno cargadas para: ${ENV}"
else
    echo "❌ Archivo .env.${ENV} no encontrado"
    exit 1
fi
```

---

## 🏗️ Configuración de Nginx

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream academic_backend {
        server academic-api:3000;
        # Si usas múltiples instancias:
        # server academic-api-1:3000;
        # server academic-api-2:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    server {
        listen 80;
        server_name academic.universidad.edu.co;
        
        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name academic.universidad.edu.co;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/academic.crt;
        ssl_certificate_key /etc/nginx/ssl/academic.key;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://academic_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check
        location /health {
            proxy_pass http://academic_backend/api/v1/home;
            access_log off;
        }

        # Static files (futuro frontend)
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # Error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
        
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Academic API

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: universidad/academic-api

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm test
      if: github.event_name == 'pull_request'

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=sha
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Deploy to staging
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /opt/academic-api
          docker-compose -f docker-compose.staging.yml pull
          docker-compose -f docker-compose.staging.yml up -d
          docker system prune -af

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/academic-api
          
          # Backup antes del deploy
          docker-compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql
          
          # Deploy nueva versión
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d --no-deps academic-api
          
          # Health check
          sleep 30
          curl -f http://localhost:3000/api/v1/home || exit 1
          
          # Cleanup
          docker system prune -af
```

---

## 📊 Monitoreo y Logging

### Configuración de Logging

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'academic-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Health Check Endpoint

```javascript
// routes/health.router.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };

  // Verificar conexión a base de datos (cuando se implemente)
  try {
    // await databaseHealthCheck();
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

### Métricas con Prometheus

```javascript
// middleware/metrics.js
const promClient = require('prom-client');

// Crear métricas
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Middleware para capturar métricas
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: route,
      status_code: res.statusCode
    }, duration);
  });
  
  next();
}

module.exports = { metricsMiddleware, register: promClient.register };
```

---

## 🔐 Seguridad en Producción

### Configuración de Seguridad

```javascript
// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

module.exports = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }),
  rateLimit: limiter,
  cors: cors(corsOptions)
};
```

### Variables de Entorno Sensibles

```bash
# Usar Docker secrets para variables sensibles
echo "super-secure-jwt-secret" | docker secret create jwt_secret -
echo "database-password" | docker secret create db_password -

# En docker-compose.yml
services:
  academic-api:
    secrets:
      - jwt_secret
      - db_password
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

---

## 📋 Checklist de Deployment

### Pre-deployment
- [ ] ✅ Tests pasan exitosamente
- [ ] 🔍 Code review completado
- [ ] 📋 Variables de entorno configuradas
- [ ] 🔐 Secrets configurados correctamente
- [ ] 🗃️ Backup de base de datos realizado
- [ ] 📊 Monitoreo configurado

### Durante deployment
- [ ] 🚀 Deploy ejecutado sin errores
- [ ] 🔍 Health check pasa
- [ ] 📊 Métricas están funcionando
- [ ] 🔍 Logs se están generando correctamente
- [ ] 🌐 Endpoints responden correctamente

### Post-deployment
- [ ] ✅ Smoke tests ejecutados
- [ ] 📊 Monitoreo activo por 30 minutos
- [ ] 📝 Documentación actualizada
- [ ] 👥 Equipo notificado del deployment
- [ ] 🗃️ Backup post-deployment realizado

---

## 🆘 Rollback y Recuperación

### Proceso de Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=${1}

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "❌ Debe especificar la versión anterior"
    echo "Uso: ./rollback.sh <version>"
    exit 1
fi

echo "🔄 Iniciando rollback a versión: $PREVIOUS_VERSION"

# Backup actual antes del rollback
docker-compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backups/pre-rollback-$(date +%Y%m%d-%H%M%S).sql

# Rollback de la aplicación
docker-compose -f docker-compose.prod.yml down
docker pull academic-api:$PREVIOUS_VERSION
docker tag academic-api:$PREVIOUS_VERSION academic-api:latest
docker-compose -f docker-compose.prod.yml up -d

# Verificar que el rollback fue exitoso
sleep 30
if curl -f http://localhost:3000/api/v1/home; then
    echo "✅ Rollback completado exitosamente"
else
    echo "❌ Rollback falló, revisar logs"
    exit 1
fi
```

### Recuperación de Base de Datos

```bash
#!/bin/bash
# scripts/restore-db.sh

BACKUP_FILE=${1}

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Debe especificar el archivo de backup"
    exit 1
fi

echo "🔄 Restaurando base de datos desde: $BACKUP_FILE"

# Detener aplicación
docker-compose -f docker-compose.prod.yml stop academic-api

# Restaurar base de datos
docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < $BACKUP_FILE

# Reiniciar aplicación
docker-compose -f docker-compose.prod.yml start academic-api

echo "✅ Restauración completada"
```

---

Esta guía de deployment cubre todos los aspectos necesarios para desplegar la aplicación académica de manera segura y eficiente en diferentes entornos.
