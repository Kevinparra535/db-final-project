#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const { config } = require('../config/config');

async function createDatabase() {
  console.log('🔧 Iniciando creación de base de datos...');

  // Conectar a PostgreSQL usando la base de datos por defecto 'postgres'
  const sequelize = new Sequelize(
    'postgres', // base de datos por defecto
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
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');

    // Verificar si la base de datos ya existe
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${config.dbName}'`
    );

    if (results.length > 0) {
      console.log(`📋 La base de datos '${config.dbName}' ya existe`);
    } else {
      // Crear la base de datos
      await sequelize.query(`CREATE DATABASE "${config.dbName}"`);
      console.log(`✅ Base de datos '${config.dbName}' creada exitosamente`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Sugerencia: Asegúrate de que PostgreSQL esté ejecutándose');
      console.error('   - Si usas Docker: docker run --name postgres -e POSTGRES_PASSWORD=admin123 -p 5432:5432 -d postgres');
    } else if (error.message.includes('password authentication failed')) {
      console.error('💡 Sugerencia: Verifica las credenciales en el archivo .env');
    } else if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.error('💡 Sugerencia: Crea el usuario PostgreSQL:');
      console.error('   - createuser -s', config.dbUser);
    }

    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase;
