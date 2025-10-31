#!/usr/bin/env node

const { execSync } = require('child_process');
const createDatabase = require('./create-database');

async function initializeProject() {
  console.log('🚀 Iniciando configuración completa del proyecto...\n');

  try {
    // Paso 1: Crear base de datos
    console.log('📋 Paso 1: Crear base de datos');
    await createDatabase();
    console.log('');

    // Paso 2: Ejecutar migraciones
    console.log('📋 Paso 2: Ejecutar migraciones');
    console.log('🔧 Ejecutando migraciones...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log('✅ Migraciones completadas\n');

    // Paso 3: Poblar con datos de prueba
    console.log('📋 Paso 3: Poblar base de datos');
    console.log('🔧 Insertando datos de prueba...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✅ Datos de prueba insertados\n');

    console.log('🎉 ¡Configuración completa exitosa!');
    console.log('💡 Puedes iniciar el servidor con: npm run dev');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeProject();
}

module.exports = initializeProject;
