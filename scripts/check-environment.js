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
    const output = execSync('docker ps --filter "expose=5432" --format "table {{.Names}}\t{{.Status}}"', {
      encoding: 'utf8'
    });

    if (output.includes('Up')) {
      console.log('✅ Contenedor PostgreSQL está ejecutándose');
      return true;
    } else {
      console.log('❌ Contenedor PostgreSQL no está ejecutándose');
      return false;
    }
  } catch (error) {
    console.log('❌ No se pudo verificar el estado del contenedor PostgreSQL');
    return false;
  }
}

async function checkDatabaseConnection() {
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
  console.log('🐳 Iniciando contenedor PostgreSQL...');

  try {
    // Verificar si ya existe un contenedor llamado postgres
    try {
      execSync('docker inspect postgres', { stdio: 'pipe' });
      console.log('📋 Contenedor postgres ya existe, iniciándolo...');
      execSync('docker start postgres', { stdio: 'inherit' });
    } catch {
      console.log('📋 Creando nuevo contenedor PostgreSQL...');
      execSync(`docker run --name postgres \
        -e POSTGRES_USER=${config.dbUser} \
        -e POSTGRES_PASSWORD=${config.dbPassword} \
        -p ${config.dbPort}:5432 \
        -d postgres:13`, { stdio: 'inherit' });
    }

    console.log('✅ Contenedor PostgreSQL iniciado');
    console.log('⏳ Esperando que PostgreSQL esté listo...');

    // Esperar unos segundos para que PostgreSQL inicie
    setTimeout(() => {
      console.log('✅ PostgreSQL debería estar listo');
    }, 5000);

    return true;
  } catch (error) {
    console.error('❌ Error al iniciar PostgreSQL:', error.message);
    return false;
  }
}

async function checkEnvironment() {
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
