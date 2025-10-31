const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class ConvocatoriaService {
	
	async find() {
		try {
			const convocatorias = await models.Convocatoria.findAll({
				order: [['createdAt', 'DESC']]
			});
			
			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al obtener convocatorias', error);
		}
	}

	async findOne(id) {
		try {
			const convocatoria = await models.Convocatoria.findByPk(id);

			if (!convocatoria) {
				throw boom.notFound('Convocatoria no encontrada');
			}

			return convocatoria;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener convocatoria', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Validar fechas
			if (data.fechaApertura && data.fechaCierre) {
				if (new Date(data.fechaApertura) >= new Date(data.fechaCierre)) {
					throw boom.badRequest('La fecha de apertura debe ser anterior a la fecha de cierre');
				}
			}

			// Crear la convocatoria
			const convocatoria = await models.Convocatoria.create(data, { transaction });
			await transaction.commit();

			// Retornar la convocatoria creada
			return await this.findOne(convocatoria.id);

		} catch (error) {
			await transaction.rollback();
			
			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'convocatorias_nombre_unique') {
					throw boom.conflict('Ya existe una convocatoria con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear convocatoria', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const convocatoria = await models.Convocatoria.findByPk(id, { transaction });
			if (!convocatoria) {
				throw boom.notFound('Convocatoria no encontrada');
			}

			// Validar fechas si se están actualizando
			const fechaApertura = changes.fechaApertura || convocatoria.fechaApertura;
			const fechaCierre = changes.fechaCierre || convocatoria.fechaCierre;
			
			if (fechaApertura && fechaCierre) {
				if (new Date(fechaApertura) >= new Date(fechaCierre)) {
					throw boom.badRequest('La fecha de apertura debe ser anterior a la fecha de cierre');
				}
			}

			// Actualizar convocatoria
			await convocatoria.update(changes, { transaction });
			await transaction.commit();

			// Retornar convocatoria actualizada
			return await this.findOne(id);

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'convocatorias_nombre_unique') {
					throw boom.conflict('Ya existe una convocatoria con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar convocatoria', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const convocatoria = await models.Convocatoria.findByPk(id, { transaction });
			if (!convocatoria) {
				throw boom.notFound('Convocatoria no encontrada');
			}

			await convocatoria.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Convocatoria eliminada exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar convocatoria', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByNombre(nombre) {
		try {
			const convocatorias = await models.Convocatoria.findAll({
				where: {
					nombre: {
						[models.Sequelize.Op.iLike]: `%${nombre}%`
					}
				},
				order: [['createdAt', 'DESC']]
			});

			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al buscar convocatorias por nombre', error);
		}
	}

	async findByTipo(tipo) {
		try {
			const convocatorias = await models.Convocatoria.findAll({
				where: { tipo },
				order: [['createdAt', 'DESC']]
			});

			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al buscar convocatorias por tipo', error);
		}
	}

	async findByEstado(estado) {
		try {
			const convocatorias = await models.Convocatoria.findAll({
				where: { estado },
				order: [['createdAt', 'DESC']]
			});

			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al buscar convocatorias por estado', error);
		}
	}

	async findActivas() {
		try {
			const hoy = new Date();
			const convocatorias = await models.Convocatoria.findAll({
				where: {
					estado: 'abierta',
					fechaCierre: {
						[models.Sequelize.Op.gt]: hoy
					}
				},
				order: [['fechaCierre', 'ASC']]
			});

			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al buscar convocatorias activas', error);
		}
	}

	async findProximasAVencer(dias = 30) {
		try {
			const hoy = new Date();
			const fechaLimite = new Date(hoy.getTime() + (dias * 24 * 60 * 60 * 1000));

			const convocatorias = await models.Convocatoria.findAll({
				where: {
					estado: 'abierta',
					fechaCierre: {
						[models.Sequelize.Op.between]: [hoy, fechaLimite]
					}
				},
				order: [['fechaCierre', 'ASC']]
			});

			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al buscar convocatorias próximas a vencer', error);
		}
	}

	async findByEntidadFinanciadora(entidad) {
		try {
			const convocatorias = await models.Convocatoria.findAll({
				where: {
					entidadFinanciadora: {
						[models.Sequelize.Op.iLike]: `%${entidad}%`
					}
				},
				order: [['createdAt', 'DESC']]
			});

			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al buscar convocatorias por entidad financiadora', error);
		}
	}

	async findByRangoPresupuesto(minimo, maximo) {
		try {
			const whereClause = {};
			
			if (minimo !== undefined && maximo !== undefined) {
				whereClause.presupuesto = {
					[models.Sequelize.Op.between]: [minimo, maximo]
				};
			} else if (minimo !== undefined) {
				whereClause.presupuesto = {
					[models.Sequelize.Op.gte]: minimo
				};
			} else if (maximo !== undefined) {
				whereClause.presupuesto = {
					[models.Sequelize.Op.lte]: maximo
				};
			}

			const convocatorias = await models.Convocatoria.findAll({
				where: whereClause,
				order: [['presupuesto', 'DESC']]
			});

			return convocatorias;
		} catch (error) {
			throw boom.internal('Error al buscar convocatorias por rango de presupuesto', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorTipo() {
		try {
			const estadisticas = await models.Convocatoria.findAll({
				attributes: [
					'tipo',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('SUM', models.sequelize.col('presupuesto')), 'presupuesto_total'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN estado = 'abierta' THEN 1 END")), 'abiertas'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN estado != 'abierta' THEN 1 END")), 'cerradas']
				],
				group: ['tipo'],
				order: [['tipo', 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por tipo', error);
		}
	}

	async getEstadisticasPorEstado() {
		try {
			const estadisticas = await models.Convocatoria.findAll({
				attributes: [
					'estado',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('AVG', models.sequelize.col('presupuesto')), 'presupuesto_promedio']
				],
				group: ['estado'],
				order: [['estado', 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por estado', error);
		}
	}

	async getEstadisticasPorAno(ano) {
		try {
			const whereClause = {};
			if (ano) {
				whereClause[models.Sequelize.Op.and] = [
					models.sequelize.where(
						models.sequelize.fn('EXTRACT', models.sequelize.literal('YEAR FROM "fecha_creacion"')),
						ano
					)
				];
			}

			const estadisticas = await models.Convocatoria.findAll({
				attributes: [
					[models.sequelize.fn('EXTRACT', models.sequelize.literal('YEAR FROM "fecha_creacion"')), 'ano'],
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('SUM', models.sequelize.col('presupuesto')), 'presupuesto_total'],
					[models.sequelize.fn('AVG', models.sequelize.col('presupuesto')), 'presupuesto_promedio']
				],
				where: whereClause,
				group: [models.sequelize.fn('EXTRACT', models.sequelize.literal('YEAR FROM "fecha_creacion"'))],
				order: [[models.sequelize.fn('EXTRACT', models.sequelize.literal('YEAR FROM "fecha_creacion"')), 'DESC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por año', error);
		}
	}

	async getEstadisticasGenerales() {
		try {
			const [total, activas, enEvaluacion, finalizadas, presupuestoTotal, presupuestoPromedio] = await Promise.all([
				models.Convocatoria.count(),
				models.Convocatoria.count({ where: { estado: 'abierta' } }),
				models.Convocatoria.count({ where: { estado: 'en_evaluacion' } }),
				models.Convocatoria.count({ where: { estado: 'finalizada' } }),
				models.Convocatoria.sum('presupuesto'),
				models.Convocatoria.findAll({
					attributes: [
						[models.sequelize.fn('AVG', models.sequelize.col('presupuesto')), 'promedio']
					]
				})
			]);

			// Convocatorias próximas a vencer (próximos 30 días)
			const proximasVencer = await this.findProximasAVencer(30);

			return {
				total,
				activas,
				en_evaluacion: enEvaluacion,
				finalizadas,
				cerradas: total - activas - enEvaluacion - finalizadas,
				presupuesto_total: presupuestoTotal || 0,
				presupuesto_promedio: presupuestoPromedio[0]?.dataValues?.promedio ? 
					parseFloat(presupuestoPromedio[0].dataValues.promedio).toFixed(2) : 0,
				proximas_a_vencer: proximasVencer.length
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas generales', error);
		}
	}

	// ============================================================================
	// MÉTODOS ESPECÍFICOS DE GESTIÓN
	// ============================================================================

	async cerrarConvocatoria(id) {
		try {
			const convocatoria = await models.Convocatoria.findByPk(id);
			if (!convocatoria) {
				throw boom.notFound('Convocatoria no encontrada');
			}

			if (convocatoria.estado === 'cerrada' || convocatoria.estado === 'finalizada') {
				throw boom.badRequest('La convocatoria ya está cerrada o finalizada');
			}

			await convocatoria.update({ estado: 'cerrada' });
			return await this.findOne(id);
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al cerrar convocatoria', error);
		}
	}

	async finalizarConvocatoria(id) {
		try {
			const convocatoria = await models.Convocatoria.findByPk(id);
			if (!convocatoria) {
				throw boom.notFound('Convocatoria no encontrada');
			}

			await convocatoria.update({ estado: 'finalizada' });
			return await this.findOne(id);
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al finalizar convocatoria', error);
		}
	}
}

module.exports = ConvocatoriaService;