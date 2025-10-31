#!/usr/bin/env node

const { execSync } = require('child_process');
const { Sequelize } = require('sequelize');
const { config } = require('../config/config');

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker está instalado');
    return true;
  } catch (error) {
    console.log('❌ Docker no está instalado o no está en PATH');
    return false;
  }
}

function checkPostgreSQLContainer() {
  try {
    const output = execSync('docker ps --filter "name=db" --format "table {{.Names}}\t{{.Status}}"', {
      encoding: 'utf8'
    });

    if (output.includes('db') && output.includes('Up')) {
      console.log('✅ Contenedor PostgreSQL (db) está ejecutándose');
      return true;
    } else {
      console.log('❌ Contenedor PostgreSQL (db) no está ejecutándose');
      return false;
    }
  } catch (error) {
    console.log('❌ No se pudo verificar el estado del contenedor PostgreSQL');
    return false;
  }
}async function checkDatabaseConnection() {
  const sequelize = new Sequelize(
    'postgres',
    config.dbUser,
    config.dbPassword,
    {
      host: config.dbHost,
      port: config.dbPort,
      dialect: 'postgres',
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL exitosa');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ No se pudo conectar a PostgreSQL:', error.message);
    await sequelize.close();
    return false;
  }
}

function startPostgreSQLContainer() {
  console.log('🐳 Iniciando contenedor PostgreSQL con Docker Compose...');

  try {
    // Verificar si existe docker-compose.yml
    try {
      execSync('test -f docker-compose.yml', { stdio: 'pipe' });
    } catch {
      console.error('❌ No se encontró docker-compose.yml en la raíz del proyecto');
      return false;
    }

    console.log('📋 Iniciando servicios con Docker Compose...');
    execSync('docker-compose up -d postgres', { stdio: 'inherit' });

    console.log('✅ Contenedor PostgreSQL iniciado');
    console.log('⏳ Esperando que PostgreSQL esté listo...');

    // Esperar unos segundos para que PostgreSQL inicie
    setTimeout(() => {
      console.log('✅ PostgreSQL debería estar listo');
    }, 5000);

    return true;
  } catch (error) {
    console.error('❌ Error al iniciar PostgreSQL con Docker Compose:', error.message);
    console.log('💡 Intenta ejecutar manualmente: docker-compose up -d postgres');
    return false;
  }
}async function checkEnvironment() {
  console.log('🔍 Verificando entorno de desarrollo...\n');

  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log(`   DB_HOST: ${config.dbHost}`);
  console.log(`   DB_PORT: ${config.dbPort}`);
  console.log(`   DB_USER: ${config.dbUser}`);
  console.log(`   DB_NAME: ${config.dbName}`);
  console.log('');

  // Verificar Docker
  const dockerOk = checkDocker();
  if (!dockerOk) {
    console.log('💡 Instala Docker desde: https://www.docker.com/products/docker-desktop');
    return false;
  }

  // Verificar contenedor PostgreSQL
  let postgresOk = checkPostgreSQLContainer();

  if (!postgresOk) {
    console.log('🐳 Intentando iniciar PostgreSQL con Docker...');
    const started = startPostgreSQLContainer();

    if (!started) {
      return false;
    }

    // Esperar a que inicie
    await new Promise(resolve => setTimeout(resolve, 6000));
  }

  // Verificar conexión
  const connectionOk = await checkDatabaseConnection();

  if (connectionOk) {
    console.log('\n🎉 ¡Entorno verificado exitosamente!');
    console.log('💡 Puedes ejecutar: npm run db:setup');
    return true;
  } else {
    console.log('\n❌ Hay problemas con la configuración');
    console.log('💡 Sugerencias:');
    console.log('   - Verifica que el contenedor PostgreSQL esté ejecutándose');
    console.log('   - Revisa las credenciales en .env');
    console.log('   - Asegúrate de que el puerto 5432 esté disponible');
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkEnvironment();
}

module.exports = checkEnvironment;
