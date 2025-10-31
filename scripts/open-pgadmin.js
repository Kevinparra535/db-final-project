#!/usr/bin/env node

/**
 * Script para abrir pgAdmin en el navegador
 */

const { exec } = require('child_process');

console.log('🐘 Abriendo pgAdmin en el navegador...\n');

console.log('📋 Credenciales de Login:');
console.log('   Email: admin@mail.com');
console.log('   Password: root\n');

console.log('🔧 Configuración de Servidor PostgreSQL:');
console.log('   Host: db');
console.log('   Port: 5432');
console.log('   Username: kevin');
console.log('   Password: admin123');
console.log('   Database: academic_db\n');

// Abrir navegador según el sistema operativo
const url = 'http://localhost:5050';
let command;

switch (process.platform) {
	case 'darwin': // macOS
		command = `open ${url}`;
		break;
	case 'win32': // Windows
		command = `start ${url}`;
		break;
	default: // Linux y otros
		command = `xdg-open ${url}`;
}

exec(command, (error) => {
	if (error) {
		console.error('❌ Error al abrir el navegador:', error.message);
		console.log(`\n💡 Abre manualmente: ${url}`);
		process.exit(1);
	}
	console.log(`✅ Navegador abierto en: ${url}`);
	console.log('\n📚 Para más información, consulta: PGADMIN_SETUP.md');
});
