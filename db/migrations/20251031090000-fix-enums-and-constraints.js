'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Agregar valor 'D' al ENUM de clasificación de grupos
      await queryInterface.sequelize.query(
        `ALTER TYPE clasificacion_grupo ADD VALUE IF NOT EXISTS 'D';`,
        { transaction }
      );

      console.log('✅ Agregado valor D a clasificacion_grupo');

      // 2. Renombrar ENUMs para consistencia con documentación
      // Nota: PostgreSQL no permite renombrar ENUMs directamente con columnas en uso
      // Estrategia: Crear nuevos ENUMs, migrar datos, eliminar antiguos

      // 2.1 Renombrar tipo_identificacion -> tipo_id_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE tipo_id_enum AS ENUM ('CC', 'CE', 'PAS', 'TI');`,
        { transaction }
      );

      // Migrar columnas que usan tipo_identificacion
      await queryInterface.sequelize.query(
        `ALTER TABLE investigador
         ALTER COLUMN tipo_id TYPE tipo_id_enum
         USING tipo_id::text::tipo_id_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE profesor
         ALTER COLUMN tipo_id TYPE tipo_id_enum
         USING tipo_id::text::tipo_id_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE estudiante
         ALTER COLUMN tipo_id TYPE tipo_id_enum
         USING tipo_id::text::tipo_id_enum;`,
        { transaction }
      );

      // Eliminar ENUM antiguo
      await queryInterface.sequelize.query(
        `DROP TYPE tipo_identificacion;`,
        { transaction }
      );

      console.log('✅ Renombrado tipo_identificacion -> tipo_id_enum');

      // 2.2 Renombrar categoria_profesor -> categoria_prof_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE categoria_prof_enum AS ENUM ('titular', 'asociado', 'asistente', 'auxiliar', 'instructor', 'catedrático');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE profesor
         ALTER COLUMN categoria TYPE categoria_prof_enum
         USING categoria::text::categoria_prof_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE categoria_profesor;`,
        { transaction }
      );

      console.log('✅ Renombrado categoria_profesor -> categoria_prof_enum');

      // 2.3 Renombrar dedicacion_profesor -> dedicacion_prof_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE dedicacion_prof_enum AS ENUM ('tiempo completo', 'medio tiempo', 'cátedra');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE profesor
         ALTER COLUMN dedicacion TYPE dedicacion_prof_enum
         USING dedicacion::text::dedicacion_prof_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE dedicacion_profesor;`,
        { transaction }
      );

      console.log('✅ Renombrado dedicacion_profesor -> dedicacion_prof_enum');

      // 2.4 Renombrar nivel_formacion -> nivel_formacion_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE nivel_formacion_enum AS ENUM ('pregrado', 'especialización', 'maestría', 'doctorado', 'postdoctorado');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE estudiante
         ALTER COLUMN nivel_formacion TYPE nivel_formacion_enum
         USING nivel_formacion::text::nivel_formacion_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE nivel_formacion;`,
        { transaction }
      );

      console.log('✅ Renombrado nivel_formacion -> nivel_formacion_enum');

      // 2.5 Renombrar clasificacion_grupo -> clasificacion_grupo_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE clasificacion_grupo_enum AS ENUM ('A1', 'A', 'B', 'C', 'D', 'Reconocido');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE grupo_investigacion
         ALTER COLUMN clasificacion TYPE clasificacion_grupo_enum
         USING clasificacion::text::clasificacion_grupo_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE clasificacion_grupo;`,
        { transaction }
      );

      console.log('✅ Renombrado clasificacion_grupo -> clasificacion_grupo_enum (con valor D incluido)');

      // 2.6 Renombrar tipo_convocatoria -> tipo_convocatoria_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE tipo_convocatoria_enum AS ENUM ('interna', 'Minciencias', 'internacional', 'otra');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE convocatoria
         ALTER COLUMN tipo TYPE tipo_convocatoria_enum
         USING tipo::text::tipo_convocatoria_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE tipo_convocatoria;`,
        { transaction }
      );

      console.log('✅ Renombrado tipo_convocatoria -> tipo_convocatoria_enum');

      // 2.7 Renombrar estado_proyecto -> estado_proyecto_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE estado_proyecto_enum AS ENUM ('formulación', 'en ejecución', 'finalizado', 'cancelado');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE proyecto_investigacion
         ALTER COLUMN estado TYPE estado_proyecto_enum
         USING estado::text::estado_proyecto_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE estado_proyecto;`,
        { transaction }
      );

      console.log('✅ Renombrado estado_proyecto -> estado_proyecto_enum');

      // 2.8 Renombrar categoria_producto -> categoria_producto_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE categoria_producto_enum AS ENUM ('generación de nuevo conocimiento', 'desarrollo tecnológico e innovación', 'apropiación social del conocimiento', 'formación de recurso humano');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE producto_tipo
         ALTER COLUMN categoria TYPE categoria_producto_enum
         USING categoria::text::categoria_producto_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE categoria_producto;`,
        { transaction }
      );

      console.log('✅ Renombrado categoria_producto -> categoria_producto_enum');

      // 2.9 Renombrar rol_afiliacion -> rol_afiliacion_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE rol_afiliacion_enum AS ENUM ('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE afiliacion
         ALTER COLUMN rol TYPE rol_afiliacion_enum
         USING rol::text::rol_afiliacion_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE rol_afiliacion;`,
        { transaction }
      );

      console.log('✅ Renombrado rol_afiliacion -> rol_afiliacion_enum');

      // 2.10 Renombrar rol_autoria -> rol_autoria_enum
      await queryInterface.sequelize.query(
        `CREATE TYPE rol_autoria_enum AS ENUM ('autor', 'coautor', 'director');`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE autoria
         ALTER COLUMN rol TYPE rol_autoria_enum
         USING rol::text::rol_autoria_enum;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE rol_autoria;`,
        { transaction }
      );

      console.log('✅ Renombrado rol_autoria -> rol_autoria_enum');

      await transaction.commit();
      console.log('🎉 Migración completada exitosamente - ENUMs estandarizados');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Revertir en orden inverso

      // Revertir rol_autoria_enum -> rol_autoria
      await queryInterface.sequelize.query(
        `CREATE TYPE rol_autoria AS ENUM ('autor', 'coautor', 'director');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE autoria ALTER COLUMN rol TYPE rol_autoria USING rol::text::rol_autoria;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE rol_autoria_enum;`, { transaction });

      // Revertir rol_afiliacion_enum -> rol_afiliacion
      await queryInterface.sequelize.query(
        `CREATE TYPE rol_afiliacion AS ENUM ('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE afiliacion ALTER COLUMN rol TYPE rol_afiliacion USING rol::text::rol_afiliacion;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE rol_afiliacion_enum;`, { transaction });

      // Revertir categoria_producto_enum -> categoria_producto
      await queryInterface.sequelize.query(
        `CREATE TYPE categoria_producto AS ENUM ('generación de nuevo conocimiento', 'desarrollo tecnológico e innovación', 'apropiación social del conocimiento', 'formación de recurso humano');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE producto_tipo ALTER COLUMN categoria TYPE categoria_producto USING categoria::text::categoria_producto;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE categoria_producto_enum;`, { transaction });

      // Revertir estado_proyecto_enum -> estado_proyecto
      await queryInterface.sequelize.query(
        `CREATE TYPE estado_proyecto AS ENUM ('formulación', 'en ejecución', 'finalizado', 'cancelado');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE proyecto_investigacion ALTER COLUMN estado TYPE estado_proyecto USING estado::text::estado_proyecto;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE estado_proyecto_enum;`, { transaction });

      // Revertir tipo_convocatoria_enum -> tipo_convocatoria
      await queryInterface.sequelize.query(
        `CREATE TYPE tipo_convocatoria AS ENUM ('interna', 'Minciencias', 'internacional', 'otra');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE convocatoria ALTER COLUMN tipo TYPE tipo_convocatoria USING tipo::text::tipo_convocatoria;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE tipo_convocatoria_enum;`, { transaction });

      // Revertir clasificacion_grupo_enum -> clasificacion_grupo (sin D)
      await queryInterface.sequelize.query(
        `CREATE TYPE clasificacion_grupo AS ENUM ('A1', 'A', 'B', 'C', 'Reconocido');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE grupo_investigacion ALTER COLUMN clasificacion TYPE clasificacion_grupo USING clasificacion::text::clasificacion_grupo;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE clasificacion_grupo_enum;`, { transaction });

      // Revertir nivel_formacion_enum -> nivel_formacion
      await queryInterface.sequelize.query(
        `CREATE TYPE nivel_formacion AS ENUM ('pregrado', 'especialización', 'maestría', 'doctorado', 'postdoctorado');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE estudiante ALTER COLUMN nivel_formacion TYPE nivel_formacion USING nivel_formacion::text::nivel_formacion;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE nivel_formacion_enum;`, { transaction });

      // Revertir dedicacion_prof_enum -> dedicacion_profesor
      await queryInterface.sequelize.query(
        `CREATE TYPE dedicacion_profesor AS ENUM ('tiempo completo', 'medio tiempo', 'cátedra');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE profesor ALTER COLUMN dedicacion TYPE dedicacion_profesor USING dedicacion::text::dedicacion_profesor;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE dedicacion_prof_enum;`, { transaction });

      // Revertir categoria_prof_enum -> categoria_profesor
      await queryInterface.sequelize.query(
        `CREATE TYPE categoria_profesor AS ENUM ('titular', 'asociado', 'asistente', 'auxiliar', 'instructor', 'catedrático');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE profesor ALTER COLUMN categoria TYPE categoria_profesor USING categoria::text::categoria_profesor;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE categoria_prof_enum;`, { transaction });

      // Revertir tipo_id_enum -> tipo_identificacion
      await queryInterface.sequelize.query(
        `CREATE TYPE tipo_identificacion AS ENUM ('CC', 'CE', 'PAS', 'TI');`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE investigador ALTER COLUMN tipo_id TYPE tipo_identificacion USING tipo_id::text::tipo_identificacion;`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE profesor ALTER COLUMN tipo_id TYPE tipo_identificacion USING tipo_id::text::tipo_identificacion;`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE estudiante ALTER COLUMN tipo_id TYPE tipo_identificacion USING tipo_id::text::tipo_identificacion;`,
        { transaction }
      );
      await queryInterface.sequelize.query(`DROP TYPE tipo_id_enum;`, { transaction });

      await transaction.commit();
      console.log('✅ Rollback completado - ENUMs revertidos a estado anterior');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en rollback:', error);
      throw error;
    }
  }
};
