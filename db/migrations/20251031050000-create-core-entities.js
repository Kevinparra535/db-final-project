'use strict';

// Esquemas de modelos
const { FacultadSchema, FACULTAD_TABLE } = require('../models/facultad.model');
const { InvestigadorSchema, INVESTIGADOR_TABLE } = require('../models/investigador.model');
const { InvestigadorCorreoSchema, INVESTIGADOR_CORREO_TABLE } = require('../models/investigador-correo.model');
const { InvestigadorTelefonoSchema, INVESTIGADOR_TELEFONO_TABLE } = require('../models/investigador-telefono.model');
const { LineaInvestigacionSchema, LINEA_INVESTIGACION_TABLE } = require('../models/linea-investigacion.model');
const { GrupoInvestigacionSchema, GRUPO_INVESTIGACION_TABLE } = require('../models/grupo-investigacion.model');
const { ConvocatoriaSchema, CONVOCATORIA_TABLE } = require('../models/convocatoria.model');
const { ProyectoInvestigacionSchema, PROYECTO_INVESTIGACION_TABLE } = require('../models/proyecto-investigacion.model');
const { ProductoInvestigacionSchema, PRODUCTO_INVESTIGACION_TABLE } = require('../models/producto-investigacion.model');
const { ProductoTipoSchema, PRODUCTO_TIPO_TABLE } = require('../models/producto-tipo.model');
const { AfiliacionSchema, AFILIACION_TABLE } = require('../models/afiliacion.model');
const { AutoriaSchema, AUTORIA_TABLE } = require('../models/autoria.model');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creando ENUMs...');

    // Crear ENUMs
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para tipos de identificación
        CREATE TYPE tipo_identificacion AS ENUM ('CC', 'CE', 'PA', 'TI', 'RC', 'NIT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para tipos de convocatoria
        CREATE TYPE tipo_convocatoria AS ENUM ('interna', 'Minciencias', 'internacional', 'otra');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para estados de proyecto
        CREATE TYPE estado_proyecto AS ENUM ('activo', 'finalizado', 'suspendido', 'cancelado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para categorías de producto
        CREATE TYPE categoria_producto AS ENUM ('Publicación científica', 'Producto tecnológico', 'Evento científico', 'Formación de recurso humano', 'Otro');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para roles de afiliación
        CREATE TYPE rol_afiliacion AS ENUM ('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para roles de autoría
        CREATE TYPE rol_autoria AS ENUM ('autor', 'coautor', 'director');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para categoría de profesor
        CREATE TYPE categoria_profesor AS ENUM ('titular', 'asociado', 'asistente', 'catedrático', 'auxiliar');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para dedicación de profesor
        CREATE TYPE dedicacion_profesor AS ENUM ('completa', 'medio_tiempo', 'hora_cátedra');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        -- ENUM para nivel de formación
        CREATE TYPE nivel_formacion AS ENUM ('especialización', 'maestría', 'doctorado', 'postdoctorado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('Creando tablas principales...');

    // Crear tablas en orden de dependencias
    await queryInterface.createTable(FACULTAD_TABLE, FacultadSchema);
    await queryInterface.createTable(INVESTIGADOR_TABLE, InvestigadorSchema);
    await queryInterface.createTable(INVESTIGADOR_CORREO_TABLE, InvestigadorCorreoSchema);
    await queryInterface.createTable(INVESTIGADOR_TELEFONO_TABLE, InvestigadorTelefonoSchema);
    await queryInterface.createTable(LINEA_INVESTIGACION_TABLE, LineaInvestigacionSchema);
    await queryInterface.createTable(GRUPO_INVESTIGACION_TABLE, GrupoInvestigacionSchema);
    await queryInterface.createTable(CONVOCATORIA_TABLE, ConvocatoriaSchema);
    await queryInterface.createTable(PROYECTO_INVESTIGACION_TABLE, ProyectoInvestigacionSchema);
    await queryInterface.createTable(PRODUCTO_TIPO_TABLE, ProductoTipoSchema);
    await queryInterface.createTable(PRODUCTO_INVESTIGACION_TABLE, ProductoInvestigacionSchema);
    await queryInterface.createTable(AFILIACION_TABLE, AfiliacionSchema);
    await queryInterface.createTable(AUTORIA_TABLE, AutoriaSchema);

    console.log('Creando tabla de muchos a muchos...');

    // Tabla de muchos a muchos para Proyecto - Línea
    await queryInterface.createTable('proyecto_linea', {
      proyecto_id: {
        type: Sequelize.STRING(12),
        primaryKey: true,
        references: {
          model: PROYECTO_INVESTIGACION_TABLE,
          key: 'id_proyecto'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      linea_id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        references: {
          model: LINEA_INVESTIGACION_TABLE,
          key: 'id_linea'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Tabla de muchos a muchos para Grupo - Línea
    await queryInterface.createTable('grupo_linea', {
      grupo_id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        references: {
          model: GRUPO_INVESTIGACION_TABLE,
          key: 'id_grupo'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      linea_id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        references: {
          model: LINEA_INVESTIGACION_TABLE,
          key: 'id_linea'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    console.log('Creando índices...');

    // Índices para mejor rendimiento - usar nombres reales de columna
    await queryInterface.addIndex(GRUPO_INVESTIGACION_TABLE, ['facultad']);
    await queryInterface.addIndex(INVESTIGADOR_CORREO_TABLE, ['id_investigador']);
    await queryInterface.addIndex(INVESTIGADOR_TELEFONO_TABLE, ['id_investigador']);
    await queryInterface.addIndex(PROYECTO_INVESTIGACION_TABLE, ['grupo']);
    await queryInterface.addIndex(PROYECTO_INVESTIGACION_TABLE, ['convocatoria']);
    await queryInterface.addIndex(PRODUCTO_INVESTIGACION_TABLE, ['proyecto']);
    await queryInterface.addIndex(PRODUCTO_INVESTIGACION_TABLE, ['tipo_producto']);
    await queryInterface.addIndex(AFILIACION_TABLE, ['investigador']);
    await queryInterface.addIndex(AFILIACION_TABLE, ['grupo']);
    await queryInterface.addIndex(AUTORIA_TABLE, ['investigador']);
    await queryInterface.addIndex(AUTORIA_TABLE, ['producto']);

    console.log('Migración principal completada exitosamente');
  },

  async down(queryInterface) {
    // Eliminar tablas en orden inverso
    await queryInterface.dropTable('grupo_linea');
    await queryInterface.dropTable('proyecto_linea');
    await queryInterface.dropTable(AUTORIA_TABLE);
    await queryInterface.dropTable(AFILIACION_TABLE);
    await queryInterface.dropTable(PRODUCTO_INVESTIGACION_TABLE);
    await queryInterface.dropTable(PRODUCTO_TIPO_TABLE);
    await queryInterface.dropTable(PROYECTO_INVESTIGACION_TABLE);
    await queryInterface.dropTable(CONVOCATORIA_TABLE);
    await queryInterface.dropTable(GRUPO_INVESTIGACION_TABLE);
    await queryInterface.dropTable(LINEA_INVESTIGACION_TABLE);
    await queryInterface.dropTable(INVESTIGADOR_TELEFONO_TABLE);
    await queryInterface.dropTable(INVESTIGADOR_CORREO_TABLE);
    await queryInterface.dropTable(INVESTIGADOR_TABLE);
    await queryInterface.dropTable(FACULTAD_TABLE);

    // Eliminar ENUMs
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS tipo_identificacion CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS tipo_convocatoria CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS estado_proyecto CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS categoria_producto CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS rol_afiliacion CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS rol_autoria CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS categoria_profesor CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS dedicacion_profesor CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS nivel_formacion CASCADE;');
  }
};
