const { Model, DataTypes, Sequelize } = require('sequelize');

const PROYECTO_INVESTIGACION_TABLE = 'proyecto_investigacion';

const ProyectoInvestigacionSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(12),
		field: 'id_proyecto'
	},
	codigoInterno: {
		allowNull: true,
		unique: true,
		type: DataTypes.STRING(30),
		field: 'codigo_interno'
	},
	titulo: {
		allowNull: false,
		unique: true,
		type: DataTypes.STRING(200)
	},
	resumen: {
		allowNull: true,
		type: DataTypes.TEXT
	},
	objetivoGeneral: {
		allowNull: true,
		field: 'objetivo_general',
		type: DataTypes.TEXT
	},
	objetivosEspecificos: {
		allowNull: true,
		field: 'objetivos_especificos',
		type: DataTypes.TEXT
	},
	metodologia: {
		allowNull: true,
		type: DataTypes.TEXT
	},
	grupo: {
		allowNull: true,
		type: DataTypes.CHAR(10),
		references: {
			model: 'grupo_investigacion',
			key: 'id_grupo'
		}
	},
	convocatoria: {
		allowNull: true,
		type: DataTypes.CHAR(10),
		references: {
			model: 'convocatoria',
			key: 'id_convocatoria'
		}
	},
	fechaInicio: {
		allowNull: false,
		field: 'fecha_inicio',
		type: DataTypes.DATEONLY
	},
	fechaFin: {
		allowNull: true,
		field: 'fecha_fin',
		type: DataTypes.DATEONLY
	},
	estado: {
		allowNull: false,
		type: DataTypes.ENUM('propuesto', 'aprobado', 'en_ejecucion', 'finalizado', 'cancelado'),
		defaultValue: 'propuesto'
	},
	presupuestoAprobado: {
		allowNull: true,
		field: 'presupuesto_aprobado',
		type: DataTypes.DECIMAL(12, 2)
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

class ProyectoInvestigacion extends Model {
	static associate(models) {
		// Relación con grupo
		this.belongsTo(models.GrupoInvestigacion, {
			as: 'grupoInfo',
			foreignKey: 'grupo'
		});

		// Relación con convocatoria
		this.belongsTo(models.Convocatoria, {
			as: 'convocatoriaInfo',
			foreignKey: 'convocatoria'
		});

		// Relación con productos
		this.hasMany(models.ProductoInvestigacion, {
			as: 'productos',
			foreignKey: 'proyecto'
		});

		// Relación muchos a muchos con líneas de investigación
		this.belongsToMany(models.LineaInvestigacion, {
			through: models.ProyectoLinea,
			as: 'lineas',
			foreignKey: 'idProyecto',
			otherKey: 'idLinea'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: PROYECTO_INVESTIGACION_TABLE,
			modelName: 'ProyectoInvestigacion',
			timestamps: true,
			underscored: true,
			validate: {
				fechaValidation() {
					if (this.fechaFin && this.fechaFin < this.fechaInicio) {
						throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
					}
				},
				presupuestoValidation() {
					if (this.presupuestoAprobado && this.presupuestoAprobado < 0) {
						throw new Error('El presupuesto no puede ser negativo');
					}
				}
			}
		};
	}
}

module.exports = { PROYECTO_INVESTIGACION_TABLE, ProyectoInvestigacionSchema, ProyectoInvestigacion };
