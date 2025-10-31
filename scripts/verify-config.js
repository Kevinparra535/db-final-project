#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando consistencia de configuración...\n');

// Leer .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key] = valueParts.join('=');
  }
});

// Leer docker-compose.yml
const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');

// Extraer valores de docker-compose.yml (parsing mejorado para YAML)
const extractValue = (content, key) => {
  // Buscar el patrón: - KEY=value o KEY: value
  const patterns = [
    new RegExp(`-\\s*${key}=(.+)`, 'i'),
    new RegExp(`${key}:\\s*(.+)`, 'i')
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
};

const dockerVars = {
  POSTGRES_DB: extractValue(dockerComposeContent, 'POSTGRES_DB'),
  POSTGRES_USER: extractValue(dockerComposeContent, 'POSTGRES_USER'),
  POSTGRES_PASSWORD: extractValue(dockerComposeContent, 'POSTGRES_PASSWORD'),
};

console.log('📋 Configuración en .env:');
console.log(`   DB_NAME: ${envVars.DB_NAME}`);
console.log(`   DB_USER: ${envVars.DB_USER}`);
console.log(`   DB_PASSWORD: ${envVars.DB_PASSWORD}`);
console.log(`   DB_HOST: ${envVars.DB_HOST}`);
console.log(`   DB_PORT: ${envVars.DB_PORT}\n`);

console.log('🐳 Configuración en docker-compose.yml:');
console.log(`   POSTGRES_DB: ${dockerVars.POSTGRES_DB}`);
console.log(`   POSTGRES_USER: ${dockerVars.POSTGRES_USER}`);
console.log(`   POSTGRES_PASSWORD: ${dockerVars.POSTGRES_PASSWORD}\n`);

// Verificar consistencia
let hasErrors = false;

console.log('✅ Verificando consistencia:\n');

if (envVars.DB_NAME !== dockerVars.POSTGRES_DB) {
  console.log(`❌ DB_NAME no coincide:`);
  console.log(`   .env: ${envVars.DB_NAME}`);
  console.log(`   docker-compose.yml: ${dockerVars.POSTGRES_DB}\n`);
  hasErrors = true;
} else {
  console.log(`✅ DB_NAME coincide: ${envVars.DB_NAME}`);
}

if (envVars.DB_USER !== dockerVars.POSTGRES_USER) {
  console.log(`❌ DB_USER no coincide:`);
  console.log(`   .env: ${envVars.DB_USER}`);
  console.log(`   docker-compose.yml: ${dockerVars.POSTGRES_USER}\n`);
  hasErrors = true;
} else {
  console.log(`✅ DB_USER coincide: ${envVars.DB_USER}`);
}

if (envVars.DB_PASSWORD !== dockerVars.POSTGRES_PASSWORD) {
  console.log(`❌ DB_PASSWORD no coincide:`);
  console.log(`   .env: ${envVars.DB_PASSWORD}`);
  console.log(`   docker-compose.yml: ${dockerVars.POSTGRES_PASSWORD}\n`);
  hasErrors = true;
} else {
  console.log(`✅ DB_PASSWORD coincide: ${envVars.DB_PASSWORD}`);
}

if (envVars.DB_HOST !== 'localhost') {
  console.log(`⚠️  DB_HOST debería ser 'localhost' para conectar desde el host al contenedor`);
  console.log(`   Valor actual: ${envVars.DB_HOST}\n`);
} else {
  console.log(`✅ DB_HOST configurado correctamente: ${envVars.DB_HOST}`);
}

if (envVars.DB_PORT !== '5432') {
  console.log(`⚠️  DB_PORT debería ser '5432' (puerto por defecto de PostgreSQL)`);
  console.log(`   Valor actual: ${envVars.DB_PORT}\n`);
} else {
  console.log(`✅ DB_PORT configurado correctamente: ${envVars.DB_PORT}`);
}

console.log('');

if (hasErrors) {
  console.log('❌ Se encontraron inconsistencias en la configuración');
  console.log('💡 Actualiza .env o docker-compose.yml para que coincidan\n');
  process.exit(1);
} else {
  console.log('🎉 ¡Todas las configuraciones son consistentes!\n');
  console.log('💡 Siguiente paso:');
  console.log('   1. docker-compose up -d postgres');
  console.log('   2. npm run db:setup');
  console.log('   3. npm run dev\n');
  process.exit(0);
}
