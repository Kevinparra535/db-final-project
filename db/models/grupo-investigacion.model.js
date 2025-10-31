const { Model, DataTypes, Sequelize } = require('sequelize');

const GRUPO_INVESTIGACION_TABLE = 'grupo_investigacion';

const GrupoInvestigacionSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_grupo'
	},
	nombre: {
		allowNull: false,
		unique: true,
		type: DataTypes.STRING(150)
	},
	clasificacion: {
		allowNull: true,
		type: DataTypes.ENUM('A1', 'A', 'B', 'C', 'Reconocido')
	},
	facultad: {
		allowNull: false,
		type: DataTypes.CHAR(10),
		references: {
			model: 'facultad',
			key: 'id_facultad'
		}
	},
	descripcion: {
		allowNull: true,
		type: DataTypes.TEXT
	},
	fechaCreacionGrupo: {
		allowNull: true,
		field: 'fecha_creacion_grupo',
		type: DataTypes.DATEONLY
	},
	createdAt: {
		allowNull: false,
		defaultValue: Sequelize.NOW,
		field: 'fecha_creacion',
		type: DataTypes.DATE
	},
	updatedAt: {
		allowNull: false,
		defaultValue: Sequelize.NOW,
		field: 'fecha_actualizacion',
		type: DataTypes.DATE
	}
};

class GrupoInvestigacion extends Model {
	static associate(models) {
		// Relación con facultad
		this.belongsTo(models.Facultad, {
			as: 'facultadInfo',
			foreignKey: 'facultad'
		});

		// Relación con proyectos
		this.hasMany(models.ProyectoInvestigacion, {
			as: 'proyectos',
			foreignKey: 'grupo'
		});

		// Relación con afiliaciones
		this.hasMany(models.Afiliacion, {
			as: 'afiliaciones',
			foreignKey: 'grupo'
		});

		// Relación muchos a muchos con líneas de investigación
		this.belongsToMany(models.LineaInvestigacion, {
			through: models.GrupoLinea,
			as: 'lineas',
			foreignKey: 'grupoId',
			otherKey: 'lineaId'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: GRUPO_INVESTIGACION_TABLE,
			modelName: 'GrupoInvestigacion',
			timestamps: true,
			underscored: true
		};
	}
}

module.exports = { GRUPO_INVESTIGACION_TABLE, GrupoInvestigacionSchema, GrupoInvestigacion };
