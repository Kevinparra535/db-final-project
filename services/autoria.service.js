const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class AutoriaService {
	
	async find() {
		try {
			const autorias = await models.Autoria.findAll({
				include: [
					{
						model: models.Investigador,
						as: 'investigador',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.ProductoInvestigacion,
						as: 'producto',
						attributes: ['id', 'titulo', 'añoPublicacion']
					}
				],
				order: [['createdAt', 'DESC']]
			});
			
			return autorias;
		} catch (error) {
			throw boom.internal('Error al obtener autorías', error);
		}
	}

	async findOne(id) {
		try {
			const autoria = await models.Autoria.findByPk(id, {
				include: [
					{
						model: models.Investigador,
						as: 'investigador',
						attributes: ['id', 'nombres', 'apellidos', 'tipoIdentificacion', 'identificacion']
					},
					{
						model: models.ProductoInvestigacion,
						as: 'producto',
						attributes: ['id', 'titulo', 'añoPublicacion', 'doi', 'isbn'],
						include: [
							{
								model: models.ProductoTipo,
								as: 'tipo',
								attributes: ['id', 'nombre']
							}
						]
					}
				]
			});

			if (!autoria) {
				throw boom.notFound('Autoría no encontrada');
			}

			return autoria;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener autoría', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Validar que existan el investigador y producto
			const [investigador, producto] = await Promise.all([
				models.Investigador.findByPk(data.investigador, { transaction }),
				models.ProductoInvestigacion.findByPk(data.productoInvestigacion, { transaction })
			]);

			if (!investigador) {
				throw boom.notFound('Investigador no encontrado');
			}
			if (!producto) {
				throw boom.notFound('Producto de investigación no encontrado');
			}

			// Verificar que no exista autoría duplicada del mismo investigador con el mismo rol en el mismo producto
			const autoriaExistente = await models.Autoria.findOne({
				where: {
					investigador: data.investigador,
					productoInvestigacion: data.productoInvestigacion,
					rol: data.rol
				},
				transaction
			});

			if (autoriaExistente) {
				throw boom.conflict('Ya existe una autoría de este investigador con este rol en el producto');
			}

			// Crear autoría
			const autoria = await models.Autoria.create(data, { transaction });
			await transaction.commit();

			// Retornar con datos completos
			return await this.findOne(autoria.id);

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear autoría', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const autoria = await models.Autoria.findByPk(id, { transaction });
			if (!autoria) {
				throw boom.notFound('Autoría no encontrada');
			}

			// Si se está cambiando investigador o producto, validar que existan
			if (changes.investigador) {
				const investigador = await models.Investigador.findByPk(changes.investigador, { transaction });
				if (!investigador) {
					throw boom.notFound('Investigador no encontrado');
				}
			}

			if (changes.productoInvestigacion) {
				const producto = await models.ProductoInvestigacion.findByPk(changes.productoInvestigacion, { transaction });
				if (!producto) {
					throw boom.notFound('Producto de investigación no encontrado');
				}
			}

			await autoria.update(changes, { transaction });
			await transaction.commit();

			return await this.findOne(autoria.id);

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar autoría', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const autoria = await models.Autoria.findByPk(id, { transaction });
			if (!autoria) {
				throw boom.notFound('Autoría no encontrada');
			}

			await autoria.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Autoría eliminada exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar autoría', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByInvestigador(investigadorId) {
		try {
			const autorias = await models.Autoria.findAll({
				where: { investigador: investigadorId },
				include: [
					{
						model: models.ProductoInvestigacion,
						as: 'producto',
						attributes: ['id', 'titulo', 'añoPublicacion', 'doi', 'isbn'],
						include: [
							{
								model: models.ProductoTipo,
								as: 'tipo',
								attributes: ['nombre']
							}
						]
					}
				],
				order: [['rol', 'ASC'], [{ model: models.ProductoInvestigacion, as: 'producto' }, 'añoPublicacion', 'DESC']]
			});

			return autorias;
		} catch (error) {
			throw boom.internal('Error al buscar autorías por investigador', error);
		}
	}

	async findByProducto(productoId) {
		try {
			const autorias = await models.Autoria.findAll({
				where: { productoInvestigacion: productoId },
				include: [
					{
						model: models.Investigador,
						as: 'investigador',
						attributes: ['id', 'nombres', 'apellidos', 'tipoIdentificacion', 'identificacion']
					}
				],
				order: [['ordenAutoria', 'ASC'], ['rol', 'ASC']]
			});

			return autorias;
		} catch (error) {
			throw boom.internal('Error al buscar autorías por producto', error);
		}
	}

	async findByRol(rol) {
		try {
			const autorias = await models.Autoria.findAll({
				where: { rol },
				include: [
					{
						model: models.Investigador,
						as: 'investigador',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.ProductoInvestigacion,
						as: 'producto',
						attributes: ['id', 'titulo', 'añoPublicacion']
					}
				],
				order: [['createdAt', 'DESC']]
			});

			return autorias;
		} catch (error) {
			throw boom.internal('Error al buscar autorías por rol', error);
		}
	}

	async findAutoresPrincipales() {
		return await this.findByRol('autor');
	}

	async findCoautores() {
		return await this.findByRol('coautor');
	}

	async findDirectores() {
		return await this.findByRol('director');
	}

	async findByAño(año) {
		try {
			const autorias = await models.Autoria.findAll({
				include: [
					{
						model: models.Investigador,
						as: 'investigador',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.ProductoInvestigacion,
						as: 'producto',
						where: { añoPublicacion: año },
						attributes: ['id', 'titulo', 'añoPublicacion']
					}
				],
				order: [['rol', 'ASC']]
			});

			return autorias;
		} catch (error) {
			throw boom.internal('Error al buscar autorías por año', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE COLABORACIÓN
	// ============================================================================

	async findColaboraciones() {
		try {
			// Encontrar productos con múltiples autores
			const colaboraciones = await models.Autoria.findAll({
				attributes: [
					'productoInvestigacion',
					[models.sequelize.fn('array_agg', models.sequelize.col('investigador')), 'investigadores']
				],
				group: ['productoInvestigacion'],
				having: models.sequelize.where(
					models.sequelize.fn('COUNT', models.sequelize.col('investigador')),
					{
						[models.Sequelize.Op.gt]: 1
					}
				)
			});

			// Crear pares de colaboración
			const paresColaboracion = [];
			for (const colaboracion of colaboraciones) {
				const investigadores = colaboracion.dataValues.investigadores;
				for (let i = 0; i < investigadores.length; i++) {
					for (let j = i + 1; j < investigadores.length; j++) {
						paresColaboracion.push({
							producto_id: colaboracion.productoInvestigacion,
							investigador_1: investigadores[i],
							investigador_2: investigadores[j]
						});
					}
				}
			}

			return paresColaboracion;
		} catch (error) {
			throw boom.internal('Error al buscar colaboraciones', error);
		}
	}

	async findColaboracionesPorInvestigador(investigadorId) {
		try {
			const colaboraciones = await this.findColaboraciones();

			return colaboraciones.filter(colaboracion =>
				colaboracion.investigador_1 === investigadorId ||
				colaboracion.investigador_2 === investigadorId
			).map(colaboracion => ({
				...colaboracion,
				colaborador: colaboracion.investigador_1 === investigadorId ?
					colaboracion.investigador_2 : colaboracion.investigador_1
			}));
		} catch (error) {
			throw boom.internal('Error al buscar colaboraciones por investigador', error);
		}
	}

	async getRedColaboracion(investigadorId) {
		try {
			const colaboraciones = await this.findColaboracionesPorInvestigador(investigadorId);

			// Contar frecuencia de colaboración
			const redColaboracion = {};
			colaboraciones.forEach(colaboracion => {
				const colaborador = colaboracion.colaborador;
				if (!redColaboracion[colaborador]) {
					redColaboracion[colaborador] = {
						investigador_id: colaborador,
						productos_compartidos: 0,
						productos: []
					};
				}
				redColaboracion[colaborador].productos_compartidos++;
				redColaboracion[colaborador].productos.push(colaboracion.producto_id);
			});

			// Obtener información completa de los colaboradores
			const colaboradores = Object.keys(redColaboracion);
			if (colaboradores.length > 0) {
				const investigadoresInfo = await models.Investigador.findAll({
					where: { id: { [models.Sequelize.Op.in]: colaboradores } },
					attributes: ['id', 'nombres', 'apellidos']
				});

				investigadoresInfo.forEach(investigador => {
					if (redColaboracion[investigador.id]) {
						redColaboracion[investigador.id].nombres = investigador.nombres;
						redColaboracion[investigador.id].apellidos = investigador.apellidos;
					}
				});
			}

			return Object.values(redColaboracion)
				.sort((a, b) => b.productos_compartidos - a.productos_compartidos);
		} catch (error) {
			throw boom.internal('Error al obtener red de colaboración', error);
		}
	}

	async findProductosColaborativos() {
		try {
			const productosColaborativos = await models.Autoria.findAll({
				attributes: [
					'productoInvestigacion',
					[models.sequelize.fn('COUNT', models.sequelize.col('investigador')), 'total_autores'],
					[models.sequelize.fn('array_agg', 
						models.sequelize.json({
							investigador: models.sequelize.col('investigador'),
							rol: models.sequelize.col('rol'),
							orden: models.sequelize.col('ordenAutoria')
						})
					), 'autores']
				],
				include: [
					{
						model: models.ProductoInvestigacion,
						as: 'producto',
						attributes: ['titulo', 'añoPublicacion']
					}
				],
				group: ['productoInvestigacion', 'producto.id', 'producto.titulo', 'producto.añoPublicacion'],
				having: models.sequelize.where(
					models.sequelize.fn('COUNT', models.sequelize.col('investigador')),
					{
						[models.Sequelize.Op.gt]: 1
					}
				),
				order: [[models.sequelize.literal('total_autores'), 'DESC']]
			});

			return productosColaborativos.map(item => ({
				producto_id: item.productoInvestigacion,
				titulo: item.producto.titulo,
				año_publicacion: item.producto.añoPublicacion,
				total_autores: parseInt(item.dataValues.total_autores),
				autores: item.dataValues.autores
			}));
		} catch (error) {
			throw boom.internal('Error al buscar productos colaborativos', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE AUTORÍAS
	// ============================================================================

	async cambiarRol(id, nuevoRol) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const autoria = await models.Autoria.findByPk(id, { transaction });
			if (!autoria) {
				throw boom.notFound('Autoría no encontrada');
			}

			const rolAnterior = autoria.rol;
			await autoria.update({ rol: nuevoRol }, { transaction });
			await transaction.commit();

			return {
				message: `Rol cambiado de ${rolAnterior} a ${nuevoRol}`,
				autoria: await this.findOne(autoria.id)
			};

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al cambiar rol', error);
		}
	}

	async transferirAutoria(id, nuevoInvestigadorId) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const autoria = await models.Autoria.findByPk(id, { transaction });
			if (!autoria) {
				throw boom.notFound('Autoría no encontrada');
			}

			// Validar que el nuevo investigador exista
			const nuevoInvestigador = await models.Investigador.findByPk(nuevoInvestigadorId, { transaction });
			if (!nuevoInvestigador) {
				throw boom.notFound('Nuevo investigador no encontrado');
			}

			const investigadorAnterior = autoria.investigador;
			await autoria.update({ investigador: nuevoInvestigadorId }, { transaction });
			await transaction.commit();

			return {
				message: `Autoría transferida del investigador ${investigadorAnterior} al ${nuevoInvestigadorId}`,
				autoria: await this.findOne(autoria.id)
			};

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al transferir autoría', error);
		}
	}

	async duplicarAutoria(id, nuevoRol) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const autoriaOriginal = await models.Autoria.findByPk(id, { transaction });
			if (!autoriaOriginal) {
				throw boom.notFound('Autoría no encontrada');
			}

			const nuevaAutoria = await models.Autoria.create({
				investigador: autoriaOriginal.investigador,
				productoInvestigacion: autoriaOriginal.productoInvestigacion,
				rol: nuevoRol,
				ordenAutoria: autoriaOriginal.ordenAutoria,
				porcentajeParticipacion: autoriaOriginal.porcentajeParticipacion,
				observaciones: `Duplicada desde autoría ${id} con rol ${autoriaOriginal.rol}`
			}, { transaction });

			await transaction.commit();

			return {
				message: `Autoría duplicada con nuevo rol ${nuevoRol}`,
				autoria_original: await this.findOne(autoriaOriginal.id),
				nueva_autoria: await this.findOne(nuevaAutoria.id)
			};

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al duplicar autoría', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorRol() {
		try {
			const estadisticas = await models.Autoria.findAll({
				attributes: [
					'rol',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('COUNT', models.sequelize.fn('DISTINCT', models.sequelize.col('investigador'))), 'investigadores_unicos'],
					[models.sequelize.fn('COUNT', models.sequelize.fn('DISTINCT', models.sequelize.col('productoInvestigacion'))), 'productos_unicos']
				],
				group: ['rol'],
				order: [['rol', 'ASC']]
			});

			// Convertir a objeto más legible
			const resultado = {};
			estadisticas.forEach(stat => {
				resultado[stat.rol] = {
					total: parseInt(stat.dataValues.total),
					investigadores_unicos: parseInt(stat.dataValues.investigadores_unicos),
					productos_unicos: parseInt(stat.dataValues.productos_unicos)
				};
			});

			return resultado;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por rol', error);
		}
	}

	async getEstadisticasProductividad() {
		try {
			const productividad = await models.Autoria.findAll({
				attributes: [
					'investigador',
					[models.sequelize.fn('COUNT', models.sequelize.fn('DISTINCT', models.sequelize.col('productoInvestigacion'))), 'total_productos'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'autor' THEN 1 END")), 'como_autor'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'coautor' THEN 1 END")), 'como_coautor'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'director' THEN 1 END")), 'como_director']
				],
				include: [
					{
						model: models.Investigador,
						as: 'investigador',
						attributes: ['nombres', 'apellidos']
					}
				],
				group: ['investigador', 'investigador.id', 'investigador.nombres', 'investigador.apellidos'],
				order: [[models.sequelize.literal('total_productos'), 'DESC']]
			});

			return productividad.map(item => ({
				investigador_id: item.investigador,
				nombres: item.investigador.nombres,
				apellidos: item.investigador.apellidos,
				total_productos: parseInt(item.dataValues.total_productos),
				como_autor: parseInt(item.dataValues.como_autor),
				como_coautor: parseInt(item.dataValues.como_coautor),
				como_director: parseInt(item.dataValues.como_director)
			}));
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas de productividad', error);
		}
	}

	async getRankingProductividad(limite = 10) {
		try {
			const estadisticas = await this.getEstadisticasProductividad();
			return estadisticas.slice(0, limite);
		} catch (error) {
			throw boom.internal('Error al obtener ranking de productividad', error);
		}
	}

	async getRankingColaboradores(limite = 10) {
		try {
			// Contar colaboraciones por investigador
			const colaboradores = await models.sequelize.query(`
				WITH colaboraciones AS (
					SELECT DISTINCT 
						a1.investigador AS investigador_id,
						a2.investigador AS colaborador_id,
						a1.producto_investigacion AS producto_id
					FROM autorias a1
					JOIN autorias a2 ON a1.producto_investigacion = a2.producto_investigacion
					WHERE a1.investigador != a2.investigador
				)
				SELECT 
					c.investigador_id,
					i.nombres,
					i.apellidos,
					COUNT(DISTINCT c.colaborador_id) as colaboradores_unicos,
					COUNT(*) as total_colaboraciones
				FROM colaboraciones c
				JOIN investigadores i ON c.investigador_id = i.id
				GROUP BY c.investigador_id, i.nombres, i.apellidos
				ORDER BY total_colaboraciones DESC
				LIMIT :limite
			`, {
				replacements: { limite },
				type: models.sequelize.QueryTypes.SELECT
			});

			return colaboradores.map(item => ({
				investigador_id: item.investigador_id,
				nombres: item.nombres,
				apellidos: item.apellidos,
				colaboradores_unicos: parseInt(item.colaboradores_unicos),
				total_colaboraciones: parseInt(item.total_colaboraciones)
			}));
		} catch (error) {
			throw boom.internal('Error al obtener ranking de colaboradores', error);
		}
	}

	async getTendenciasColaboracion() {
		try {
			const tendencias = await models.sequelize.query(`
				WITH productos_por_año AS (
					SELECT 
						p.año_publicacion,
						p.id as producto_id,
						COUNT(a.investigador) as num_autores
					FROM productos_investigacion p
					LEFT JOIN autorias a ON p.id = a.producto_investigacion
					WHERE p.año_publicacion IS NOT NULL
					GROUP BY p.año_publicacion, p.id
				)
				SELECT 
					año_publicacion,
					COUNT(CASE WHEN num_autores > 1 THEN 1 END) as productos_colaborativos,
					COUNT(CASE WHEN num_autores = 1 THEN 1 END) as productos_individuales,
					ROUND(
						100.0 * COUNT(CASE WHEN num_autores > 1 THEN 1 END) / NULLIF(COUNT(*), 0), 2
					) as porcentaje_colaboracion
				FROM productos_por_año
				GROUP BY año_publicacion
				ORDER BY año_publicacion ASC
			`, {
				type: models.sequelize.QueryTypes.SELECT
			});

			// Convertir a objeto con años como claves
			const resultado = {};
			tendencias.forEach(item => {
				resultado[item.año_publicacion] = {
					productos_colaborativos: parseInt(item.productos_colaborativos),
					productos_individuales: parseInt(item.productos_individuales),
					porcentaje_colaboracion: parseFloat(item.porcentaje_colaboracion) || 0
				};
			});

			return resultado;
		} catch (error) {
			throw boom.internal('Error al obtener tendencias de colaboración', error);
		}
	}
}

module.exports = AutoriaService;