const { Model, DataTypes, Sequelize } = require('sequelize');

const INVESTIGADOR_TELEFONO_TABLE = 'investigador_telefono';

const InvestigadorTelefonoSchema = {
	idInvestigador: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_investigador',
		references: {
			model: 'investigador',
			key: 'id_investigador'
		},
		onDelete: 'CASCADE'
	},
	numero: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.STRING(20)
	},
	tipo: {
		allowNull: false,
		type: DataTypes.ENUM('móvil', 'fijo'),
		defaultValue: 'móvil'
	}
};

class InvestigadorTelefono extends Model {
	static associate(models) {
		this.belongsTo(models.Investigador, {
			as: 'investigador',
			foreignKey: 'idInvestigador'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: INVESTIGADOR_TELEFONO_TABLE,
			modelName: 'InvestigadorTelefono',
			timestamps: false,
			underscored: true
		};
	}
}

module.exports = { INVESTIGADOR_TELEFONO_TABLE, InvestigadorTelefonoSchema, InvestigadorTelefono };