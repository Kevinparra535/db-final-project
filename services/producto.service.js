const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class ProductoInvestigacionService {
	
	async find() {
		try {
			const productos = await models.ProductoInvestigacion.findAll({
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['fechaCreacion', 'DESC']]
			});
			
			return productos;
		} catch (error) {
			throw boom.internal('Error al obtener productos de investigación', error);
		}
	}

	async findOne(id) {
		try {
			const producto = await models.ProductoInvestigacion.findByPk(id, {
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				]
			});

			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			return producto;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener producto de investigación', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Validar que el proyecto existe si se proporciona
			if (data.proyectoInvestigacion) {
				const proyectoExists = await models.ProyectoInvestigacion.findByPk(data.proyectoInvestigacion, { transaction });
				if (!proyectoExists) {
					throw boom.badRequest('El proyecto de investigación especificado no existe');
				}
			}

			// Validar que el tipo de producto existe
			if (data.productoTipo) {
				const tipoExists = await models.ProductoTipo.findByPk(data.productoTipo, { transaction });
				if (!tipoExists) {
					throw boom.badRequest('El tipo de producto especificado no existe');
				}
			}

			// Crear el producto
			const producto = await models.ProductoInvestigacion.create(data, { transaction });
			await transaction.commit();

			// Retornar el producto completo con relaciones
			return await this.findOne(producto.id);

		} catch (error) {
			await transaction.rollback();
			
			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'productos_investigacion_titulo_unique') {
					throw boom.conflict('Ya existe un producto con ese título');
				}
				if (field === 'productos_investigacion_doi_unique') {
					throw boom.conflict('Ya existe un producto con ese DOI');
				}
				if (field === 'productos_investigacion_isbn_unique') {
					throw boom.conflict('Ya existe un producto con ese ISBN');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear producto de investigación', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const producto = await models.ProductoInvestigacion.findByPk(id, { transaction });
			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			// Validar proyecto si se está cambiando
			if (changes.proyectoInvestigacion) {
				const proyectoExists = await models.ProyectoInvestigacion.findByPk(changes.proyectoInvestigacion, { transaction });
				if (!proyectoExists) {
					throw boom.badRequest('El proyecto de investigación especificado no existe');
				}
			}

			// Validar tipo si se está cambiando
			if (changes.productoTipo) {
				const tipoExists = await models.ProductoTipo.findByPk(changes.productoTipo, { transaction });
				if (!tipoExists) {
					throw boom.badRequest('El tipo de producto especificado no existe');
				}
			}

			// Actualizar producto
			await producto.update(changes, { transaction });
			await transaction.commit();

			// Retornar producto actualizado
			return await this.findOne(id);

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'productos_investigacion_titulo_unique') {
					throw boom.conflict('Ya existe un producto con ese título');
				}
				if (field === 'productos_investigacion_doi_unique') {
					throw boom.conflict('Ya existe un producto con ese DOI');
				}
				if (field === 'productos_investigacion_isbn_unique') {
					throw boom.conflict('Ya existe un producto con ese ISBN');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar producto de investigación', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const producto = await models.ProductoInvestigacion.findByPk(id, { transaction });
			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			await producto.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Producto eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar producto de investigación', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByTitulo(titulo) {
		try {
			const productos = await models.ProductoInvestigacion.findAll({
				where: {
					titulo: {
						[models.Sequelize.Op.iLike]: `%${titulo}%`
					}
				},
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['fechaCreacion', 'DESC']]
			});

			return productos;
		} catch (error) {
			throw boom.internal('Error al buscar productos por título', error);
		}
	}

	async findByTipo(tipoId) {
		try {
			const productos = await models.ProductoInvestigacion.findAll({
				where: { productoTipo: tipoId },
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['fechaCreacion', 'DESC']]
			});

			return productos;
		} catch (error) {
			throw boom.internal('Error al buscar productos por tipo', error);
		}
	}

	async findByProyecto(proyectoId) {
		try {
			const productos = await models.ProductoInvestigacion.findAll({
				where: { proyectoInvestigacion: proyectoId },
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['fechaCreacion', 'DESC']]
			});

			return productos;
		} catch (error) {
			throw boom.internal('Error al buscar productos por proyecto', error);
		}
	}

	async findByAñoPublicacion(año) {
		try {
			const productos = await models.ProductoInvestigacion.findAll({
				where: { añoPublicacion: año },
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['fechaPublicacion', 'DESC']]
			});

			return productos;
		} catch (error) {
			throw boom.internal('Error al buscar productos por año de publicación', error);
		}
	}

	async findByRangoAños(añoInicio, añoFin) {
		try {
			const productos = await models.ProductoInvestigacion.findAll({
				where: {
					añoPublicacion: {
						[models.Sequelize.Op.between]: [añoInicio, añoFin]
					}
				},
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['añoPublicacion', 'ASC'], ['fechaPublicacion', 'DESC']]
			});

			return productos;
		} catch (error) {
			throw boom.internal('Error al buscar productos por rango de años', error);
		}
	}

	async findByMetadataKeywords(keywords) {
		try {
			const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
			
			// Construir condiciones de búsqueda en JSONB
			const orConditions = keywordList.map(keyword => ({
				metadata: {
					[models.Sequelize.Op.contains]: {
						palabras_clave: [keyword]
					}
				}
			}));

			// También buscar en otros campos de metadata
			keywordList.forEach(keyword => {
				orConditions.push({
					[models.Sequelize.Op.or]: [
						models.sequelize.where(
							models.sequelize.cast(models.sequelize.col('metadata'), 'text'),
							{
								[models.Sequelize.Op.iLike]: `%${keyword}%`
							}
						)
					]
				});
			});

			const productos = await models.ProductoInvestigacion.findAll({
				where: {
					[models.Sequelize.Op.or]: orConditions
				},
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['fechaCreacion', 'DESC']]
			});

			return productos;
		} catch (error) {
			throw boom.internal('Error al buscar productos por metadatos', error);
		}
	}

	async findMasRecientes(limite = 10) {
		try {
			const productos = await models.ProductoInvestigacion.findAll({
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						required: false
					},
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						required: false
					}
				],
				order: [['fechaPublicacion', 'DESC'], ['fechaCreacion', 'DESC']],
				limit: limite
			});

			return productos;
		} catch (error) {
			throw boom.internal('Error al buscar productos más recientes', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE METADATOS
	// ============================================================================

	async getMetadata(id) {
		try {
			const producto = await models.ProductoInvestigacion.findByPk(id, {
				attributes: ['id', 'metadata']
			});

			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			return producto.metadata || {};
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener metadatos del producto', error);
		}
	}

	async updateMetadata(id, newMetadata) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const producto = await models.ProductoInvestigacion.findByPk(id, { transaction });
			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			// Combinar metadatos existentes con nuevos
			const metadataActualizados = {
				...producto.metadata,
				...newMetadata
			};

			await producto.update({ metadata: metadataActualizados }, { transaction });
			await transaction.commit();

			return metadataActualizados;
		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar metadatos del producto', error);
		}
	}

	async addMetadataField(id, campo, valor) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const producto = await models.ProductoInvestigacion.findByPk(id, { transaction });
			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			const metadataActualizados = {
				...producto.metadata,
				[campo]: valor
			};

			await producto.update({ metadata: metadataActualizados }, { transaction });
			await transaction.commit();

			return {
				message: `Campo ${campo} agregado exitosamente`,
				metadata: metadataActualizados
			};
		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al agregar campo a metadatos', error);
		}
	}

	async removeMetadataField(id, campo) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const producto = await models.ProductoInvestigacion.findByPk(id, { transaction });
			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			if (!producto.metadata || !producto.metadata.hasOwnProperty(campo)) {
				throw boom.notFound(`Campo ${campo} no encontrado en metadatos`);
			}

			const metadataActualizados = { ...producto.metadata };
			delete metadataActualizados[campo];

			await producto.update({ metadata: metadataActualizados }, { transaction });
			await transaction.commit();

			return {
				message: `Campo ${campo} eliminado exitosamente`,
				metadata: metadataActualizados
			};
		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar campo de metadatos', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorTipo() {
		try {
			const estadisticas = await models.ProductoInvestigacion.findAll({
				attributes: [
					[models.sequelize.fn('COUNT', models.sequelize.col('ProductoInvestigacion.id')), 'total']
				],
				include: [
					{
						model: models.ProductoTipo,
						as: 'productoTipo',
						attributes: ['id', 'nombre'],
						required: true
					}
				],
				group: ['productoTipo.id', 'productoTipo.nombre'],
				order: [[models.sequelize.col('productoTipo.nombre'), 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por tipo', error);
		}
	}

	async getEstadisticasPorAño() {
		try {
			const estadisticas = await models.ProductoInvestigacion.findAll({
				attributes: [
					'añoPublicacion',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN doi IS NOT NULL THEN 1 END")), 'con_doi'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN isbn IS NOT NULL THEN 1 END")), 'con_isbn'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN metadata->'indexacion' IS NOT NULL THEN 1 END")), 'indexados']
				],
				group: ['añoPublicacion'],
				order: [['añoPublicacion', 'DESC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por año', error);
		}
	}

	async getEstadisticasPorProyecto() {
		try {
			const estadisticas = await models.ProductoInvestigacion.findAll({
				attributes: [
					[models.sequelize.fn('COUNT', models.sequelize.col('ProductoInvestigacion.id')), 'total_productos'],
					[models.sequelize.fn('COUNT', models.sequelize.fn('DISTINCT', models.sequelize.col('añoPublicacion'))), 'años_activos'],
					[models.sequelize.fn('COUNT', models.sequelize.fn('DISTINCT', models.sequelize.col('productoTipo'))), 'tipos_productos']
				],
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						attributes: ['id', 'titulo'],
						required: true
					}
				],
				group: ['proyectoInvestigacion.id', 'proyectoInvestigacion.titulo'],
				order: [[models.sequelize.literal('total_productos'), 'DESC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por proyecto', error);
		}
	}

	async getRankingProyectos(limite = 10) {
		try {
			const ranking = await models.ProductoInvestigacion.findAll({
				attributes: [
					[models.sequelize.fn('COUNT', models.sequelize.col('ProductoInvestigacion.id')), 'total_productos'],
					[models.sequelize.fn('COUNT', models.sequelize.fn('DISTINCT', models.sequelize.col('productoTipo'))), 'diversidad_tipos'],
					[models.sequelize.fn('COUNT', models.sequelize.fn('DISTINCT', models.sequelize.col('añoPublicacion'))), 'años_activos']
				],
				include: [
					{
						model: models.ProyectoInvestigacion,
						as: 'proyectoInvestigacion',
						attributes: ['id', 'titulo'],
						required: true
					}
				],
				group: ['proyectoInvestigacion.id', 'proyectoInvestigacion.titulo'],
				order: [[models.sequelize.literal('total_productos'), 'DESC']],
				limit: limite
			});

			return ranking;
		} catch (error) {
			throw boom.internal('Error al obtener ranking de proyectos', error);
		}
	}

	async getTendenciasPublicacion() {
		try {
			const tendencias = await models.ProductoInvestigacion.findAll({
				attributes: [
					'añoPublicacion',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total']
				],
				group: ['añoPublicacion'],
				order: [['añoPublicacion', 'ASC']]
			});

			// Convertir a objeto para facilitar cálculos
			const produccionPorAño = {};
			tendencias.forEach(item => {
				produccionPorAño[item.añoPublicacion] = parseInt(item.dataValues.total);
			});

			// Calcular crecimiento año a año
			const años = Object.keys(produccionPorAño).sort();
			const crecimiento = {};

			for (let i = 1; i < años.length; i++) {
				const añoActual = años[i];
				const añoAnterior = años[i - 1];
				const crecimientoAnual = ((produccionPorAño[añoActual] - produccionPorAño[añoAnterior]) / produccionPorAño[añoAnterior]) * 100;
				crecimiento[añoActual] = Math.round(crecimientoAnual * 100) / 100;
			}

			return {
				produccion_por_año: produccionPorAño,
				crecimiento_anual: crecimiento
			};
		} catch (error) {
			throw boom.internal('Error al obtener tendencias de publicación', error);
		}
	}

	async getEstadisticasGenerales() {
		try {
			const [total, conDoi, conIsbn, indexados, porTipo] = await Promise.all([
				models.ProductoInvestigacion.count(),
				models.ProductoInvestigacion.count({ where: { doi: { [models.Sequelize.Op.not]: null } } }),
				models.ProductoInvestigacion.count({ where: { isbn: { [models.Sequelize.Op.not]: null } } }),
				models.ProductoInvestigacion.count({
					where: models.sequelize.where(
						models.sequelize.col('metadata'),
						models.Sequelize.Op.contains,
						{ indexacion: { [models.Sequelize.Op.not]: null } }
					)
				}),
				models.ProductoInvestigacion.count({
					group: ['productoTipo'],
					attributes: ['productoTipo']
				})
			]);

			const añoMasReciente = await models.ProductoInvestigacion.max('añoPublicacion');
			const añoMasAntiguo = await models.ProductoInvestigacion.min('añoPublicacion');

			return {
				total,
				con_doi: conDoi,
				con_isbn: conIsbn,
				indexados: indexados || 0,
				tipos_unicos: porTipo.length || 0,
				rango_años: {
					mas_antiguo: añoMasAntiguo,
					mas_reciente: añoMasReciente
				}
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas generales', error);
		}
	}
}

module.exports = ProductoInvestigacionService;