const { Model, DataTypes, Sequelize } = require('sequelize');

const INVESTIGADOR_TABLE = 'investigador';

const InvestigadorSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_investigador'
	},
	nombres: {
		allowNull: false,
		type: DataTypes.STRING(80)
	},
	apellidos: {
		allowNull: false,
		type: DataTypes.STRING(80)
	},
	tipoId: {
		allowNull: true,
		type: DataTypes.ENUM('CC', 'TI', 'CE', 'PP'),
		field: 'tipo_id'
	},
	numId: {
		allowNull: true,
		unique: true,
		type: DataTypes.STRING(20),
		field: 'num_id'
	},
	orcid: {
		allowNull: true,
		type: DataTypes.STRING(19),
		validate: {
			len: [19, 19]
		}
	},
	estado: {
		allowNull: false,
		type: DataTypes.ENUM('activo', 'inactivo'),
		defaultValue: 'activo'
	},
	fechaRegistro: {
		allowNull: false,
		defaultValue: Sequelize.NOW,
		field: 'fecha_registro',
		type: DataTypes.DATEONLY
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

class Investigador extends Model {
	static associate(models) {
		// Relación con emails (multivaluada)
		this.hasMany(models.InvestigadorCorreo, {
			as: 'emails',
			foreignKey: 'idInvestigador'
		});
		
		// Relación con teléfonos (multivaluada)
		this.hasMany(models.InvestigadorTelefono, {
			as: 'telefonos',
			foreignKey: 'idInvestigador'
		});
		
		// Relación con afiliaciones
		this.hasMany(models.Afiliacion, {
			as: 'afiliaciones',
			foreignKey: 'investigador'
		});
		
		// Relación con autorías
		this.hasMany(models.Autoria, {
			as: 'autorias',
			foreignKey: 'investigador'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: INVESTIGADOR_TABLE,
			modelName: 'Investigador',
			timestamps: true,
			underscored: true,
			indexes: [
				{
					unique: true,
					fields: ['nombres', 'apellidos']
				}
			]
		};
	}
}

module.exports = { INVESTIGADOR_TABLE, InvestigadorSchema, Investigador };