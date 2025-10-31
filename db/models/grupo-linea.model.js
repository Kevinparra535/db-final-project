const { Model, DataTypes, Sequelize } = require('sequelize');

const GRUPO_LINEA_TABLE = 'grupo_linea';

const GrupoLineaSchema = {
	idGrupo: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_grupo',
		references: {
			model: 'grupo_investigacion',
			key: 'id_grupo'
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
			foreignKey: 'idGrupo'
		});

		this.belongsTo(models.LineaInvestigacion, {
			as: 'linea',
			foreignKey: 'idLinea'
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
