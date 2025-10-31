const { Model, DataTypes, Sequelize } = require('sequelize');

const INVESTIGADOR_CORREO_TABLE = 'investigador_correo';

const InvestigadorCorreoSchema = {
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
	email: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.STRING(120),
		validate: {
			isEmail: true
		}
	},
	etiqueta: {
		allowNull: false,
		type: DataTypes.ENUM('institucional', 'personal'),
		defaultValue: 'institucional'
	}
};

class InvestigadorCorreo extends Model {
	static associate(models) {
		this.belongsTo(models.Investigador, {
			as: 'investigador',
			foreignKey: 'idInvestigador'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: INVESTIGADOR_CORREO_TABLE,
			modelName: 'InvestigadorCorreo',
			timestamps: false,
			underscored: true
		};
	}
}

module.exports = { INVESTIGADOR_CORREO_TABLE, InvestigadorCorreoSchema, InvestigadorCorreo };
