const { Model, DataTypes, Sequelize } = require('sequelize');

const PRODUCTO_TIPO_TABLE = 'producto_tipo';

const ProductoTipoSchema = {
	id: {
		allowNull: false,
		primaryKey: true,
		type: DataTypes.CHAR(10),
		field: 'id_ptipo'
	},
	nombre: {
		allowNull: false,
		unique: true,
		type: DataTypes.STRING(120)
	},
	descripcion: {
		allowNull: true,
		type: DataTypes.TEXT
	},
	categoria: {
		allowNull: true,
		type: DataTypes.STRING(50)
	},
	activo: {
		allowNull: false,
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	requiereDoi: {
		allowNull: false,
		field: 'requiere_doi',
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	requiereIsbn: {
		allowNull: false,
		field: 'requiere_isbn',
		type: DataTypes.BOOLEAN,
		defaultValue: false
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

class ProductoTipo extends Model {
	static associate(models) {
		// Relación con productos
		this.hasMany(models.ProductoInvestigacion, {
			as: 'productos',
			foreignKey: 'tipoProducto'
		});
	}

	static config(sequelize) {
		return {
			sequelize,
			tableName: PRODUCTO_TIPO_TABLE,
			modelName: 'ProductoTipo',
			timestamps: true,
			underscored: true
		};
	}
}

module.exports = { PRODUCTO_TIPO_TABLE, ProductoTipoSchema, ProductoTipo };
