const { Model, DataTypes, Sequelize } = require('sequelize');

const ESTUDIANTE_TABLE = 'estudiante';

const EstudianteSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_estudiante'
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
	email: {
		allowNull: false,
		type: DataTypes.STRING(100),
		unique: true,
		validate: {
			isEmail: true
		}
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
	programa: {
		allowNull: false,
		type: DataTypes.STRING(200)
	},
	nivelFormacion: {
		allowNull: false,
		type: DataTypes.ENUM('especializacion', 'maestria', 'doctorado'),
		field: 'nivel_formacion'
	},
	modalidad: {
		allowNull: false,
		type: DataTypes.ENUM('presencial', 'virtual', 'semipresencial'),
		defaultValue: 'presencial'
	},
	estado: {
		allowNull: false,
		type: DataTypes.ENUM('activo', 'graduado', 'retirado', 'suspendido'),
		defaultValue: 'activo'
	},
	semestreActual: {
		allowNull: true,
		type: DataTypes.INTEGER,
		field: 'semestre_actual',
		validate: {
			min: 1,
			max: 10
		}
	},
	fechaIngreso: {
		allowNull: false,
		type: DataTypes.DATE,
		field: 'fecha_ingreso'
	},
	fechaEsperadaGrado: {
		allowNull: true,
		type: DataTypes.DATE,
		field: 'fecha_esperada_grado'
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

class Estudiante extends Model {
	static associate(models) {
		// Relación con Facultad
		this.belongsTo(models.Facultad, {
			as: 'facultadInfo',
			foreignKey: 'facultad',
			targetKey: 'id'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: ESTUDIANTE_TABLE,
			modelName: 'Estudiante',
			timestamps: true
		};
	}
}

module.exports = { ESTUDIANTE_TABLE, EstudianteSchema, Estudiante };
