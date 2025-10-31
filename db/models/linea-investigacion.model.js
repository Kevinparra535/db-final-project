const { Model, DataTypes, Sequelize } = require('sequelize');

const LINEA_INVESTIGACION_TABLE = 'linea_investigacion';

const LineaInvestigacionSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_linea'
	},
	nombre: {
		allowNull: false,
		unique: true,
		type: DataTypes.STRING(150)
	},
	descripcion: {
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

class LineaInvestigacion extends Model {
	static associate(models) {
		// Relación muchos a muchos con grupos
		this.belongsToMany(models.GrupoInvestigacion, {
			through: models.GrupoLinea,
			as: 'grupos',
			foreignKey: 'idLinea',
			otherKey: 'idGrupo'
		});

		// Relación muchos a muchos con proyectos
		this.belongsToMany(models.ProyectoInvestigacion, {
			through: models.ProyectoLinea,
			as: 'proyectos',
			foreignKey: 'idLinea',
			otherKey: 'idProyecto'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: LINEA_INVESTIGACION_TABLE,
			modelName: 'LineaInvestigacion',
			timestamps: true,
			underscored: true
		};
	}
}

module.exports = { LINEA_INVESTIGACION_TABLE, LineaInvestigacionSchema, LineaInvestigacion };