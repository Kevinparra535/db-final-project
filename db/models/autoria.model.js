const { Model, DataTypes, Sequelize } = require('sequelize');

const AUTORIA_TABLE = 'autoria';

const AutoriaSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_autoria'
	},
	investigador: {
		allowNull: false,
		type: DataTypes.CHAR(10),
		references: {
			model: 'investigador',
			key: 'id_investigador'
		}
	},
	producto: {
		allowNull: false,
		type: DataTypes.CHAR(12),
		references: {
			model: 'producto_investigacion',
			key: 'id_producto'
		},
		onDelete: 'CASCADE'
	},
	ordenAutor: {
		allowNull: true,
		field: 'orden_autor',
		type: DataTypes.SMALLINT,
		validate: {
			min: 1
		}
	},
	rolAutor: {
		allowNull: true,
		field: 'rol_autor',
		type: DataTypes.ENUM('autor', 'coautor', 'director')
	},
	porcentajeParticipacion: {
		allowNull: true,
		field: 'porcentaje_participacion',
		type: DataTypes.DECIMAL(5, 2),
		validate: {
			min: 0,
			max: 100
		}
	},
	observaciones: {
		allowNull: true,
		type: DataTypes.TEXT
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

class Autoria extends Model {
	static associate(models) {
		// Relación con investigador
		this.belongsTo(models.Investigador, {
			as: 'investigadorInfo',
			foreignKey: 'investigador'
		});

		// Relación con producto
		this.belongsTo(models.ProductoInvestigacion, {
			as: 'productoInfo',
			foreignKey: 'producto'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: AUTORIA_TABLE,
			modelName: 'Autoria',
			timestamps: true,
			underscored: true,
			indexes: [
				{
					unique: true,
					fields: ['producto', 'orden_autor']
				}
			]
		};
	}
}

module.exports = { AUTORIA_TABLE, AutoriaSchema, Autoria };
