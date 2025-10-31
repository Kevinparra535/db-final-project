const { Client } = require('pg');

// Esta funcion se encarga de conectarse a la base de datos
async function getConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'kevin',
    password: 'admin123',
    database: 'academic_research_db',
  });

  // Esta ejecucion nos devuelve una promesa como retorno
  await client.connect();

  return client;
}

module.exports = getConnection;
