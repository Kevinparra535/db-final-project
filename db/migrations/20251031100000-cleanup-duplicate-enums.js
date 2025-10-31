'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🧹 Iniciando limpieza de ENUMs duplicados...');

      // 1. Agregar valor 'D' al enum_grupo_investigacion_clasificacion si no existe
      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'enum_grupo_investigacion_clasificacion'
            AND e.enumlabel = 'D'
          ) THEN
            ALTER TYPE enum_grupo_investigacion_clasificacion ADD VALUE 'D';
          END IF;
        END $$;`,
        { transaction }
      );

      console.log('✅ Valor D agregado a enum_grupo_investigacion_clasificacion');

      await transaction.commit();
      console.log('🎉 Limpieza de ENUMs completada exitosamente');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en limpieza de ENUMs:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // No es posible eliminar valores de ENUMs en PostgreSQL
    // Esta migración es irreversible
    console.log('⚠️  Esta migración no es reversible - los valores ENUM no se pueden eliminar en PostgreSQL');
  }
};
