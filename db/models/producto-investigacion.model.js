const { Model, DataTypes, Sequelize } = require('sequelize');

const PRODUCTO_INVESTIGACION_TABLE = 'producto_investigacion';

const ProductoInvestigacionSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(12),
		field: 'id_producto'
	},
	proyecto: {
		allowNull: true,
		type: DataTypes.CHAR(12),
		references: {
			model: 'proyecto_investigacion',
			key: 'id_proyecto'
		},
		onDelete: 'SET NULL'
	},
	tipoProducto: {
		allowNull: true,
		field: 'tipo_producto',
		type: DataTypes.CHAR(10),
		references: {
			model: 'producto_tipo',
			key: 'id_ptipo'
		}
	},
	titulo: {
		allowNull: false,
		type: DataTypes.STRING(200)
	},
	resumen: {
		allowNull: true,
		type: DataTypes.TEXT
	},
	doi: {
		allowNull: true,
		type: DataTypes.STRING(100)
	},
	isbn: {
		allowNull: true,
		type: DataTypes.STRING(17)
	},
	fechaPublicado: {
		allowNull: false,
		field: 'fecha_publicado',
		type: DataTypes.DATEONLY
	},
	url: {
		allowNull: true,
		type: DataTypes.STRING(300)
	},
	metadatos: {
		allowNull: true,
		type: DataTypes.JSONB
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

class ProductoInvestigacion extends Model {
	static associate(models) {
		// Relación con proyecto
		this.belongsTo(models.ProyectoInvestigacion, {
			as: 'proyectoInfo',
			foreignKey: 'proyecto'
		});

		// Relación con tipo de producto
		this.belongsTo(models.ProductoTipo, {
			as: 'tipo',
			foreignKey: 'tipoProducto'
		});

		// Relación con autorías
		this.hasMany(models.Autoria, {
			as: 'autorias',
			foreignKey: 'producto'
		});

		// Relación muchos a muchos con investigadores a través de autoría
		this.belongsToMany(models.Investigador, {
			through: models.Autoria,
			as: 'autores',
			foreignKey: 'producto',
			otherKey: 'investigador'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: PRODUCTO_INVESTIGACION_TABLE,
			modelName: 'ProductoInvestigacion',
			timestamps: true,
			underscored: true,
			validate: {
				fechaValidation() {
					if (this.fechaPublicado > new Date()) {
						throw new Error('La fecha de publicación no puede ser futura');
					}
				},
				isbnValidation() {
					if (this.isbn) {
						const cleanIsbn = this.isbn.replace(/-/g, '');
						if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
							throw new Error('ISBN debe tener 10 o 13 dígitos');
						}
					}
				}
			}
		};
	}
}

module.exports = { PRODUCTO_INVESTIGACION_TABLE, ProductoInvestigacionSchema, ProductoInvestigacion };
