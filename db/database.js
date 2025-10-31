const { Sequelize } = require('sequelize');
const { config } = require('../config/config');

const setupDatabase = {
	development: new Sequelize(
		config.development.database,
		config.development.username,
		config.development.password,
		{
			host: config.development.host,
			port: config.development.port,
			dialect: config.development.dialect,
			logging: config.development.logging,
			pool: config.development.pool,
			define: {
				timestamps: true,
				underscored: false,
				freezeTableName: true
			}
		}
	),

	production: new Sequelize(
		config.production.database,
		config.production.username,
		config.production.password,
		{
			host: config.production.host,
			port: config.production.port,
			dialect: config.production.dialect,
			logging: config.production.logging,
			pool: config.production.pool,
			define: {
				timestamps: true,
				underscored: false,
				freezeTableName: true
			}
		}
	)
};

module.exports = setupDatabase;
