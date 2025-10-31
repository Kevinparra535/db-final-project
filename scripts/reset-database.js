#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const { config } = require('../config/config');
const initializeProject = require('./setup-project');

async function resetDatabase() {
  console.log('🔄 Reseteando base de datos...\n');

  // Conectar a PostgreSQL
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
    console.log('✅ Conexión establecida');

    // Terminar conexiones activas a la base de datos
    await sequelize.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${config.dbName}' AND pid <> pg_backend_pid()
    `);

    // Eliminar la base de datos si existe
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${config.dbName}'`
    );

    if (results.length > 0) {
      await sequelize.query(`DROP DATABASE "${config.dbName}"`);
      console.log(`🗑️  Base de datos '${config.dbName}' eliminada`);
    }

    await sequelize.close();
    console.log('');

    // Reinicializar todo
    await initializeProject();

  } catch (error) {
    console.error('❌ Error durante el reset:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;
