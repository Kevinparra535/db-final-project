#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA\n');
console.log('═'.repeat(60));

let hasErrors = false;

// 1. Verificar configuración
console.log('\n📋 1. VERIFICANDO CONFIGURACIÓN');
console.log('─'.repeat(60));
try {
  execSync('node scripts/verify-config.js', { stdio: 'inherit' });
} catch (error) {
  hasErrors = true;
  console.error('❌ Error en verificación de configuración');
}

// 2. Verificar Docker
console.log('\n🐳 2. VERIFICANDO DOCKER');
console.log('─'.repeat(60));
try {
  const dockerOutput = execSync('docker-compose ps --format "table {{.Name}}\t{{.Status}}"', {
    encoding: 'utf8'
  });

  if (dockerOutput.includes('db') && dockerOutput.includes('Up')) {
    console.log('✅ Contenedor PostgreSQL (db) está ejecutándose');
    console.log(dockerOutput);
  } else {
    console.log('❌ Contenedor PostgreSQL no está ejecutándose');
    console.log('💡 Ejecuta: npm run docker:up');
    hasErrors = true;
  }
} catch (error) {
  console.error('❌ Error al verificar Docker');
  hasErrors = true;
}

// 3. Verificar conexión PostgreSQL
console.log('\n🔌 3. VERIFICANDO CONEXIÓN A POSTGRESQL');
console.log('─'.repeat(60));
try {
  const pgReady = execSync('docker exec db pg_isready -U kevin', {
    encoding: 'utf8'
  });
  console.log('✅ PostgreSQL está listo:', pgReady.trim());
} catch (error) {
  console.error('❌ PostgreSQL no está respondiendo');
  hasErrors = true;
}

// 4. Verificar base de datos
console.log('\n🗄️  4. VERIFICANDO BASE DE DATOS');
console.log('─'.repeat(60));

let dbOk = false;
try {
  // Verificar conexión a la base de datos
  const dbTest = execSync(
    'docker exec db psql -U kevin -d academic_research_db -c "SELECT current_database();" -t',
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  );

  console.log('✅ Base de datos academic_research_db existe');

  // Verificar tablas
  const tables = execSync(
    'docker exec db psql -U kevin -d academic_research_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\';" -t',
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  console.log(`✅ Tablas en la base de datos: ${tables.trim()}`);

  // Verificar datos en facultades
  const facultades = execSync(
    'docker exec db psql -U kevin -d academic_research_db -c "SELECT COUNT(*) FROM facultad;" -t',
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  console.log(`✅ Registros en facultad: ${facultades.trim()}`);
  dbOk = true;

} catch (error) {
  console.error('⚠️  No se pudo verificar la base de datos directamente');
  console.log('   (Se verificará con la API)');
}

// 5. Verificar API
console.log('\n🌐 5. VERIFICANDO API');
console.log('─'.repeat(60));
try {
  const apiResponse = execSync('curl -s http://localhost:3000/api/v1/facultades', {
    encoding: 'utf8',
    timeout: 2000
  });

  const facultades = JSON.parse(apiResponse);
  console.log(`✅ API respondiendo correctamente (${facultades.length} facultades)`);

  // Si la API funciona, la base de datos está OK
  if (!dbOk) {
    console.log('✅ Base de datos confirmada (vía API)');
    dbOk = true;
  }

} catch (error) {
  console.error('❌ Error al verificar API');
  console.log('💡 Verifica que el servidor esté corriendo: npm run dev');
  hasErrors = true;
}

// Resumen final
console.log('\n' + '═'.repeat(60));
if (hasErrors || !dbOk) {
  console.log('❌ VERIFICACIÓN COMPLETADA CON ERRORES');
  console.log('\n📋 RECOMENDACIONES:');
  console.log('   1. Verifica docker-compose.yml y .env');
  console.log('   2. Ejecuta: docker-compose up -d');
  console.log('   3. Ejecuta: npm run db:setup');
  console.log('   4. Ejecuta: npm run dev');
  process.exit(1);
} else {
  console.log('✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE');
  console.log('\n🚀 Sistema listo para trabajar!');
}

// Resumen final
console.log('\n═'.repeat(60));
if (hasErrors) {
  console.log('\n❌ VERIFICACIÓN COMPLETADA CON ERRORES');
  console.log('\n📋 Acciones sugeridas:');
  console.log('   1. npm run docker:up');
  console.log('   2. npm run db:setup');
  console.log('   3. npm run dev\n');
  process.exit(1);
} else {
  console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA EXITOSAMENTE!');
  console.log('\n✅ Todo está configurado correctamente');
  console.log('✅ Docker ejecutándose');
  console.log('✅ PostgreSQL funcionando');
  console.log('✅ Base de datos configurada');
  console.log('\n💡 Sistema listo para desarrollo');
  console.log('   Comando para iniciar: npm run dev\n');
  process.exit(0);
}
