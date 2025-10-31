const { Model, DataTypes, Sequelize } = require('sequelize');

const FACULTAD_TABLE = 'facultad';

const FacultadSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_facultad'
	},
	nombre: {
		allowNull: false,
		unique: true,
		type: DataTypes.STRING(150)
	},
	decano: {
		allowNull: false,
		type: DataTypes.STRING(150)
	},
	sede: {
		allowNull: false,
		type: DataTypes.STRING(50)
	},
	ciudad: {
		allowNull: false,
		type: DataTypes.STRING(50)
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

class Facultad extends Model {
	static associate(models) {
		// Relación con grupos de investigación
		this.hasMany(models.GrupoInvestigacion, {
			as: 'grupos',
			foreignKey: 'facultad'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: FACULTAD_TABLE,
			modelName: 'Facultad',
			timestamps: true,
			underscored: true
		};
	}
}

module.exports = { FACULTAD_TABLE, FacultadSchema, Facultad };
