const { Sequelize } = require('sequelize');

const { config } = require('../config/config');
const setupModels  = require('../db/models/index');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;

const sequelize = new Sequelize(URI, {
  dialect: 'postgres', // Esta variable nos dice que tipo de base de datos estamos utilizando
  logging: console.log, // Resulta de comando directo SQL
});

setupModels(sequelize); // Le pasamos la conexion

// Sincronizar la base de datos (crear tablas si no existen)
// NOTA: En producción esto debería manejarse con migraciones
// sequelize.sync({ alter: true }); // alter: true modifica las tablas existentes para coincidir con el modelo

module.exports = sequelize;
