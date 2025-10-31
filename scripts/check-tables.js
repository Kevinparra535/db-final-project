#!/usr/bin/env node

/**
 * Script simple para verificar la conexión y ver tablas
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkConnection() {
	console.log('📋 Variables de entorno:');
	console.log('   DB_NAME:', process.env.DB_NAME);
	console.log('   DB_HOST:', process.env.DB_HOST);
	console.log('   DB_USER:', process.env.DB_USER);
	console.log('   DB_PORT:', process.env.DB_PORT);
	console.log();

	const sequelize = new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			dialect: 'postgres',
			logging: false
		}
	);

	try {
		await sequelize.authenticate();
		console.log('✅ Conexión exitosa a PostgreSQL\n');

		// Ver la base de datos actual
		const [currentDB] = await sequelize.query('SELECT current_database();');
		console.log('📊 Base de datos actual:', currentDB[0].current_database, '\n');

		// Ver todas las tablas
		const [tables] = await sequelize.query(`
			SELECT
				schemaname as schema,
				tablename as table
			FROM pg_tables
			WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
			ORDER BY schemaname, tablename;
		`);

		console.log('📋 Tablas encontradas:');
		if (tables.length === 0) {
			console.log('   ❌ No se encontraron tablas\n');
		} else {
			tables.forEach(t => {
				console.log(`   - ${t.schema}.${t.table}`);
			});
			console.log(`\n   Total: ${tables.length} tablas\n`);
		}

		// Ver ENUMs
		const [enums] = await sequelize.query(`
			SELECT n.nspname as schema, t.typname as name
			FROM pg_type t
			LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
			WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid))
			AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
			AND n.nspname NOT IN ('pg_catalog', 'information_schema')
			AND t.typtype = 'e'
			ORDER BY n.nspname, t.typname;
		`);

		console.log('🔢 ENUMs encontrados:');
		if (enums.length === 0) {
			console.log('   ❌ No se encontraron ENUMs\n');
		} else {
			enums.forEach(e => {
				console.log(`   - ${e.schema}.${e.name}`);
			});
			console.log(`\n   Total: ${enums.length} ENUMs\n`);
		}

		await sequelize.close();
	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error(error);
		process.exit(1);
	}
}

checkConnection();
