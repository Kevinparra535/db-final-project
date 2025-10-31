'use strict';

const { UserSchema, USER_TABLE } = require('./../models/user.model');

module.exports = {
  // QueryInterface: Sirve para ejecutar estos comandos
  async up(queryInterface) {
    // Que tabla y que esquema queremos crear
    await queryInterface.createTable(USER_TABLE, UserSchema);

    //... aca haríamos todos los modelos
  },

  // Down: Sirve para revertir cambios
  async down(queryInterface) {
    // Rollback de nuestra migración, revertimos la tabla
    await queryInterface.dropTable(USER_TABLE);
  },
};
