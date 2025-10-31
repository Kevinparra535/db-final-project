const { Model, DataTypes, Sequelize } = require('sequelize');

const CONVOCATORIA_TABLE = 'convocatoria';

const ConvocatoriaSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_convocatoria'
	},
	nombre: {
		allowNull: false,
		type: DataTypes.STRING(150)
	},
	tipo: {
		allowNull: false,
		type: DataTypes.ENUM('interna', 'Minciencias', 'internacional', 'otra')
	},
	entidad: {
		allowNull: false,
		type: DataTypes.STRING(150)
	},
	anio: {
		allowNull: false,
		type: DataTypes.SMALLINT,
		validate: {
			min: 2000
		}
	},
	fechaApertura: {
		allowNull: true,
		field: 'fecha_apertura',
		type: DataTypes.DATEONLY
	},
	fechaCierre: {
		allowNull: false,
		field: 'fecha_cierre',
		type: DataTypes.DATEONLY
	},
	montoMaximo: {
		allowNull: true,
		field: 'monto_maximo',
		type: DataTypes.DECIMAL(14, 2)
	},
	descripcion: {
		allowNull: true,
		type: DataTypes.TEXT
	},
	requisitos: {
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

class Convocatoria extends Model {
	static associate(models) {
		// Relación con proyectos
		this.hasMany(models.ProyectoInvestigacion, {
			as: 'proyectos',
			foreignKey: 'convocatoria'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: CONVOCATORIA_TABLE,
			modelName: 'Convocatoria',
			timestamps: true,
			underscored: true,
			indexes: [
				{
					unique: true,
					fields: ['nombre', 'anio', 'entidad']
				}
			],
			validate: {
				fechaValidation() {
					if (this.fechaApertura && this.fechaCierre && this.fechaCierre <= this.fechaApertura) {
						throw new Error('La fecha de cierre debe ser posterior a la fecha de apertura');
					}
				}
			}
		};
	}
}

module.exports = { CONVOCATORIA_TABLE, ConvocatoriaSchema, Convocatoria };