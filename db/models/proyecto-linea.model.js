const { Model, DataTypes, Sequelize } = require('sequelize');

const PROYECTO_LINEA_TABLE = 'proyecto_linea';

const ProyectoLineaSchema = {
	idProyecto: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(12),
		field: 'id_proyecto',
		references: {
			model: 'proyecto_investigacion',
			key: 'id_proyecto'
		},
		onDelete: 'CASCADE'
	},
	idLinea: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_linea',
		references: {
			model: 'linea_investigacion',
			key: 'id_linea'
		},
		onDelete: 'CASCADE'
	}
};

class ProyectoLinea extends Model {
	static associate(models) {
		this.belongsTo(models.ProyectoInvestigacion, {
			as: 'proyecto',
			foreignKey: 'idProyecto'
		});

		this.belongsTo(models.LineaInvestigacion, {
			as: 'linea',
			foreignKey: 'idLinea'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: PROYECTO_LINEA_TABLE,
			modelName: 'ProyectoLinea',
			timestamps: false,
			underscored: true
		};
	}
}

module.exports = { PROYECTO_LINEA_TABLE, ProyectoLineaSchema, ProyectoLinea };
