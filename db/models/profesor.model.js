const { Model, DataTypes, Sequelize } = require('sequelize');

const PROFESOR_TABLE = 'profesor';

const ProfesorSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_profesor'
	},
	nombres: {
		allowNull: false,
		type: DataTypes.STRING(100)
	},
	apellidos: {
		allowNull: false,
		type: DataTypes.STRING(100)
	},
	tipoId: {
		allowNull: false,
		type: DataTypes.ENUM('CC', 'CE', 'TI', 'PA', 'RC'),
		field: 'tipo_id'
	},
	numId: {
		allowNull: false,
		type: DataTypes.STRING(20),
		field: 'num_id'
	},
	facultad: {
		allowNull: false,
		type: DataTypes.CHAR(10),
		references: {
			model: 'facultad',
			key: 'id_facultad'
		},
		onUpdate: 'CASCADE',
		onDelete: 'RESTRICT'
	},
	categoria: {
		allowNull: false,
		type: DataTypes.ENUM('titular', 'asociado', 'asistente', 'catedratico', 'ocasional'),
		defaultValue: 'asistente'
	},
	dedicacion: {
		allowNull: false,
		type: DataTypes.ENUM('tiempo_completo', 'medio_tiempo', 'catedra'),
		defaultValue: 'tiempo_completo'
	},
	estado: {
		allowNull: false,
		type: DataTypes.ENUM('activo', 'inactivo', 'retirado'),
		defaultValue: 'activo'
	},
	fechaIngreso: {
		allowNull: true,
		type: DataTypes.DATE,
		field: 'fecha_ingreso'
	},
	fechaRegistro: {
		allowNull: false,
		type: DataTypes.DATE,
		defaultValue: Sequelize.NOW,
		field: 'fecha_registro'
	},
	createdAt: {
		allowNull: false,
		type: DataTypes.DATE,
		field: 'fecha_creacion'
	},
	updatedAt: {
		allowNull: false,
		type: DataTypes.DATE,
		field: 'fecha_actualizacion'
	}
};

class Profesor extends Model {
	static associate(models) {
		// Relación con Facultad
		this.belongsTo(models.Facultad, {
			as: 'facultadInfo',
			foreignKey: 'facultad',
			targetKey: 'id'
		});

		// Relación con correos (1:N)
		this.hasMany(models.ProfesorCorreo, {
			as: 'correos',
			foreignKey: 'idProfesor',
			sourceKey: 'id'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: PROFESOR_TABLE,
			modelName: 'Profesor',
			timestamps: true
		};
	}
}

module.exports = { PROFESOR_TABLE, ProfesorSchema, Profesor };
