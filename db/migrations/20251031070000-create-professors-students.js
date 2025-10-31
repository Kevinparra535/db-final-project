'use strict';

const { PROFESOR_TABLE, ProfesorSchema } = require('../models/profesor.model');
const { PROFESOR_CORREO_TABLE, ProfesorCorreoSchema } = require('../models/profesor-correo.model');
const { ESTUDIANTE_TABLE, EstudianteSchema } = require('../models/estudiante.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla profesor
    await queryInterface.createTable(PROFESOR_TABLE, ProfesorSchema);

    // Crear tabla profesor_correo
    await queryInterface.createTable(PROFESOR_CORREO_TABLE, ProfesorCorreoSchema);

    // Crear tabla estudiante
    await queryInterface.createTable(ESTUDIANTE_TABLE, EstudianteSchema);

    // Crear índices
    await queryInterface.addIndex(PROFESOR_TABLE, ['num_id'], {
      unique: true,
      name: 'profesor_num_id_unique'
    });

    await queryInterface.addIndex(PROFESOR_TABLE, ['facultad'], {
      name: 'profesor_facultad_idx'
    });

    await queryInterface.addIndex(ESTUDIANTE_TABLE, ['num_id'], {
      unique: true,
      name: 'estudiante_num_id_unique'
    });

    await queryInterface.addIndex(ESTUDIANTE_TABLE, ['email'], {
      unique: true,
      name: 'estudiante_email_unique'
    });

    await queryInterface.addIndex(ESTUDIANTE_TABLE, ['facultad'], {
      name: 'estudiante_facultad_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(PROFESOR_CORREO_TABLE);
    await queryInterface.dropTable(PROFESOR_TABLE);
    await queryInterface.dropTable(ESTUDIANTE_TABLE);
  }
};
