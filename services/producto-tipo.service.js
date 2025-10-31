const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class ProductoTipoService {
	
	async find() {
		try {
			const tipos = await models.ProductoTipo.findAll({
				order: [['nombre', 'ASC']]
			});
			
			return tipos;
		} catch (error) {
			throw boom.internal('Error al obtener tipos de producto', error);
		}
	}

	async findOne(id) {
		try {
			const tipo = await models.ProductoTipo.findByPk(id);

			if (!tipo) {
				throw boom.notFound('Tipo de producto no encontrado');
			}

			return tipo;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener tipo de producto', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Crear el tipo de producto
			const tipo = await models.ProductoTipo.create(data, { transaction });
			await transaction.commit();

			return tipo;

		} catch (error) {
			await transaction.rollback();
			
			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'productos_tipos_nombre_unique') {
					throw boom.conflict('Ya existe un tipo de producto con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear tipo de producto', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const tipo = await models.ProductoTipo.findByPk(id, { transaction });
			if (!tipo) {
				throw boom.notFound('Tipo de producto no encontrado');
			}

			// Actualizar tipo
			await tipo.update(changes, { transaction });
			await transaction.commit();

			return tipo;

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'productos_tipos_nombre_unique') {
					throw boom.conflict('Ya existe un tipo de producto con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar tipo de producto', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const tipo = await models.ProductoTipo.findByPk(id, { transaction });
			if (!tipo) {
				throw boom.notFound('Tipo de producto no encontrado');
			}

			await tipo.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Tipo de producto eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar tipo de producto', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByNombre(nombre) {
		try {
			const tipos = await models.ProductoTipo.findAll({
				where: {
					nombre: {
						[models.Sequelize.Op.iLike]: `%${nombre}%`
					}
				},
				order: [['nombre', 'ASC']]
			});

			return tipos;
		} catch (error) {
			throw boom.internal('Error al buscar tipos por nombre', error);
		}
	}

	async findByCategoria(categoria) {
		try {
			const tipos = await models.ProductoTipo.findAll({
				where: { categoria },
				order: [['nombre', 'ASC']]
			});

			return tipos;
		} catch (error) {
			throw boom.internal('Error al buscar tipos por categoría', error);
		}
	}

	async findActivos() {
		try {
			const tipos = await models.ProductoTipo.findAll({
				where: { activo: true },
				order: [['nombre', 'ASC']]
			});

			return tipos;
		} catch (error) {
			throw boom.internal('Error al buscar tipos activos', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE PRODUCTOS
	// ============================================================================

	async getProductosPorTipo(tipoId) {
		try {
			const tipo = await models.ProductoTipo.findByPk(tipoId);
			if (!tipo) {
				throw boom.notFound('Tipo de producto no encontrado');
			}

			const productos = await models.ProductoInvestigacion.findAll({
				where: { productoTipo: tipoId },
				attributes: ['id', 'titulo', 'añoPublicacion'],
				order: [['añoPublicacion', 'DESC'], ['titulo', 'ASC']]
			});

			return productos;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener productos por tipo', error);
		}
	}

	async getEstadisticasProductosPorTipo(tipoId) {
		try {
			const tipo = await models.ProductoTipo.findByPk(tipoId);
			if (!tipo) {
				throw boom.notFound('Tipo de producto no encontrado');
			}

			const [totalProductos, porAño] = await Promise.all([
				models.ProductoInvestigacion.count({ where: { productoTipo: tipoId } }),
				models.ProductoInvestigacion.findAll({
					where: { productoTipo: tipoId },
					attributes: [
						'añoPublicacion',
						[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total']
					],
					group: ['añoPublicacion'],
					order: [['añoPublicacion', 'ASC']]
				})
			]);

			// Convertir resultado de años a objeto
			const porAñoObj = {};
			porAño.forEach(item => {
				porAñoObj[item.añoPublicacion] = parseInt(item.dataValues.total);
			});

			// Encontrar año más productivo
			let añoMasProductivo = null;
			let maxProductos = 0;
			Object.entries(porAñoObj).forEach(([año, cantidad]) => {
				if (cantidad > maxProductos) {
					maxProductos = cantidad;
					añoMasProductivo = { año: parseInt(año), productos: cantidad };
				}
			});

			// Calcular tendencia simple (comparar últimos 2 años)
			const años = Object.keys(porAñoObj).map(a => parseInt(a)).sort();
			let tendencia = null;
			if (años.length >= 2) {
				const ultimoAño = años[años.length - 1];
				const penultimoAño = años[años.length - 2];
				const cambio = porAñoObj[ultimoAño] - porAñoObj[penultimoAño];
				tendencia = cambio > 0 ? 'creciente' : cambio < 0 ? 'decreciente' : 'estable';
			}

			return {
				total_productos: totalProductos,
				por_año: porAñoObj,
				año_mas_productivo: añoMasProductivo,
				tendencia
			};
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener estadísticas de productos por tipo', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS GENERALES
	// ============================================================================

	async getEstadisticasUso() {
		try {
			const estadisticas = await models.ProductoTipo.findAll({
				attributes: [
					'id',
					'nombre', 
					'categoria',
					'activo',
					[models.sequelize.fn('COUNT', models.sequelize.col('productos.id')), 'total_usos']
				],
				include: [
					{
						model: models.ProductoInvestigacion,
						as: 'productos',
						attributes: [],
						required: false
					}
				],
				group: ['ProductoTipo.id', 'ProductoTipo.nombre', 'ProductoTipo.categoria', 'ProductoTipo.activo'],
				order: [[models.sequelize.literal('total_usos'), 'DESC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas de uso', error);
		}
	}

	async getTiposMasUtilizados(limite = 10) {
		try {
			const tiposMasUtilizados = await models.ProductoTipo.findAll({
				attributes: [
					'id',
					'nombre',
					'categoria',
					'activo',
					[models.sequelize.fn('COUNT', models.sequelize.col('productos.id')), 'total_usos']
				],
				include: [
					{
						model: models.ProductoInvestigacion,
						as: 'productos',
						attributes: [],
						required: false
					}
				],
				group: ['ProductoTipo.id', 'ProductoTipo.nombre', 'ProductoTipo.categoria', 'ProductoTipo.activo'],
				order: [[models.sequelize.literal('total_usos'), 'DESC']],
				limit: limite
			});

			return tiposMasUtilizados;
		} catch (error) {
			throw boom.internal('Error al obtener tipos más utilizados', error);
		}
	}

	// ============================================================================
	// MÉTODOS AUXILIARES
	// ============================================================================

	async getCategorias() {
		try {
			const categorias = await models.ProductoTipo.findAll({
				attributes: [
					'categoria',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total_tipos'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN activo = true THEN 1 END")), 'tipos_activos']
				],
				group: ['categoria'],
				order: [['categoria', 'ASC']]
			});

			return categorias;
		} catch (error) {
			throw boom.internal('Error al obtener categorías', error);
		}
	}

	async validateTipoForProduct(tipoId, productData) {
		try {
			const tipo = await models.ProductoTipo.findByPk(tipoId);
			if (!tipo) {
				throw boom.notFound('Tipo de producto no encontrado');
			}

			const validaciones = {
				valido: true,
				errores: [],
				advertencias: []
			};

			// Validar DOI requerido
			if (tipo.requiereDoi && !productData.doi) {
				validaciones.errores.push(`El tipo "${tipo.nombre}" requiere DOI`);
				validaciones.valido = false;
			}

			// Validar ISBN requerido
			if (tipo.requiereIsbn && !productData.isbn) {
				validaciones.errores.push(`El tipo "${tipo.nombre}" requiere ISBN`);
				validaciones.valido = false;
			}

			// Validar que el tipo esté activo
			if (!tipo.activo) {
				validaciones.advertencias.push(`El tipo "${tipo.nombre}" está inactivo`);
			}

			return validaciones;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al validar tipo para producto', error);
		}
	}

	async getEstadisticasGenerales() {
		try {
			const [total, activos, inactivos, porCategoria] = await Promise.all([
				models.ProductoTipo.count(),
				models.ProductoTipo.count({ where: { activo: true } }),
				models.ProductoTipo.count({ where: { activo: false } }),
				models.ProductoTipo.count({
					group: ['categoria'],
					attributes: ['categoria']
				})
			]);

			return {
				total,
				activos,
				inactivos,
				categorias_unicas: porCategoria.length || 0
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas generales', error);
		}
	}
}

module.exports = ProductoTipoService;