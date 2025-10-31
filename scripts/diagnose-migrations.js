#!/usr/bin/env node

/**
 * Script para ejecutar migraciones manualmente y diagnosticar problemas
 */

const { Sequelize } = require('sequelize');
const { config } = require('../config/config');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;

async function runMigrations() {
	const sequelize = new Sequelize(URI, {
		dialect: 'postgres',
		logging: console.log
	});

	try {
		console.log('🔍 Verificando conexión a la base de datos...');
		await sequelize.authenticate();
		console.log('✅ Conexión exitosa\n');

		console.log('📋 Base de datos:', config.dbName);
		console.log('🔧 Host:', config.dbHost);
		console.log('👤 Usuario:', config.dbUser, '\n');

		// Verificar si existe la tabla SequelizeMeta
		const [results] = await sequelize.query(`
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name = 'SequelizeMeta';
		`);

		if (results.length > 0) {
			console.log('📊 Tabla SequelizeMeta existe\n');

			// Ver migraciones registradas
			const [migrations] = await sequelize.query('SELECT * FROM "SequelizeMeta" ORDER BY name;');
			console.log('📝 Migraciones registradas:');
			if (migrations.length === 0) {
				console.log('   (ninguna)');
			} else {
				migrations.forEach(m => console.log('   -', m.name));
			}
			console.log();
		} else {
			console.log('⚠️  Tabla SequelizeMeta NO existe\n');
		}

		// Ver todas las tablas en la base de datos
		const [tables] = await sequelize.query(`
			SELECT tablename
			FROM pg_tables
			WHERE schemaname = 'public'
			ORDER BY tablename;
		`);

		console.log('📊 Tablas en la base de datos:');
		if (tables.length === 0) {
			console.log('   (ninguna - base de datos vacía)');
		} else {
			tables.forEach(t => console.log('   -', t.tablename));
		}
		console.log();

		// Intentar ejecutar migraciones usando Umzug directamente
		console.log('🚀 Intentando ejecutar migraciones usando Sequelize CLI programáticamente...\n');

		const { exec } = require('child_process');
		const util = require('util');
		const execPromise = util.promisify(exec);

		const { stdout, stderr } = await execPromise('npx sequelize-cli db:migrate --debug --config db/config.js');

		console.log('📤 STDOUT:');
		console.log(stdout);

		if (stderr) {
			console.log('📤 STDERR:');
			console.log(stderr);
		}

		await sequelize.close();

	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error('\n📋 Stack trace completo:');
		console.error(error);
		process.exit(1);
	}
}

runMigrations();
