const { Model, DataTypes, Sequelize } = require('sequelize');

const AFILIACION_TABLE = 'afiliacion';

const AfiliacionSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_afiliacion'
	},
	investigador: {
		allowNull: false,
		type: DataTypes.CHAR(10),
		references: {
			model: 'investigador',
			key: 'id_investigador'
		}
	},
	grupo: {
		allowNull: false,
		type: DataTypes.CHAR(10),
		references: {
			model: 'grupo_investigacion',
			key: 'id_grupo'
		}
	},
	rol: {
		allowNull: false,
		type: DataTypes.ENUM('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo')
	},
	fechaInicio: {
		allowNull: false,
		defaultValue: Sequelize.NOW,
		field: 'fecha_inicio',
		type: DataTypes.DATEONLY
	},
	fechaFin: {
		allowNull: true,
		field: 'fecha_fin',
		type: DataTypes.DATEONLY
	},
	observaciones: {
		allowNull: true,
		type: DataTypes.TEXT
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

class Afiliacion extends Model {
	static associate(models) {
		// Relación con investigador
		this.belongsTo(models.Investigador, {
			as: 'investigadorInfo',
			foreignKey: 'investigador'
		});

		// Relación con grupo
		this.belongsTo(models.GrupoInvestigacion, {
			as: 'grupoInfo',
			foreignKey: 'grupo'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: AFILIACION_TABLE,
			modelName: 'Afiliacion',
			timestamps: true,
			underscored: true,
			indexes: [
				{
					unique: true,
					fields: ['investigador', 'grupo', 'fecha_inicio']
				}
			],
			validate: {
				fechaValidation() {
					if (this.fechaFin && this.fechaFin < this.fechaInicio) {
						throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
					}
				}
			}
		};
	}
}

module.exports = { AFILIACION_TABLE, AfiliacionSchema, Afiliacion };
