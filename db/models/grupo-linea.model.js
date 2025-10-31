const { Model, DataTypes, Sequelize } = require('sequelize');

const GRUPO_LINEA_TABLE = 'grupo_linea';

const GrupoLineaSchema = {
	grupoId: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'grupo_id',
		references: {
			model: 'grupo_investigacion',
			key: 'id_grupo'
		},
		onDelete: 'CASCADE'
	},
	lineaId: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'linea_id',
		references: {
			model: 'linea_investigacion',
			key: 'id_linea'
		},
		onDelete: 'CASCADE'
	},
	fechaAsociacion: {
		allowNull: false,
		defaultValue: Sequelize.NOW,
		field: 'fecha_asociacion',
		type: DataTypes.DATEONLY
	}
};

class GrupoLinea extends Model {
	static associate(models) {
		this.belongsTo(models.GrupoInvestigacion, {
			as: 'grupo',
			foreignKey: 'grupoId'
		});

		this.belongsTo(models.LineaInvestigacion, {
			as: 'linea',
			foreignKey: 'lineaId'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: GRUPO_LINEA_TABLE,
			modelName: 'GrupoLinea',
			timestamps: false,
			underscored: true
		};
	}
}

module.exports = { GRUPO_LINEA_TABLE, GrupoLineaSchema, GrupoLinea };
