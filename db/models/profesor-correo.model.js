const { Model, DataTypes } = require('sequelize');

const PROFESOR_CORREO_TABLE = 'profesor_correo';

const ProfesorCorreoSchema = {
	idProfesor: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_profesor',
		references: {
			model: 'profesor',
			key: 'id_profesor'
		},
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	},
	email: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.STRING(100),
		validate: {
			isEmail: true
		}
	},
	etiqueta: {
		allowNull: false,
		type: DataTypes.ENUM('institucional', 'personal', 'alternativo'),
		defaultValue: 'institucional'
	}
};

class ProfesorCorreo extends Model {
	static associate(models) {
		// Relación con Profesor
		this.belongsTo(models.Profesor, {
			as: 'profesor',
			foreignKey: 'idProfesor',
			targetKey: 'id'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: PROFESOR_CORREO_TABLE,
			modelName: 'ProfesorCorreo',
			timestamps: false
		};
	}
}

module.exports = { PROFESOR_CORREO_TABLE, ProfesorCorreoSchema, ProfesorCorreo };
