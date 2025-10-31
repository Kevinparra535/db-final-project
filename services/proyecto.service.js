const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class ProyectoInvestigacionService {

	async find() {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				],
				order: [['createdAt', 'DESC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al obtener proyectos de investigación', error);
		}
	}

	async findOne(id) {
		try {
			const proyecto = await models.ProyectoInvestigacion.findByPk(id, {
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				]
			});

			if (!proyecto) {
				throw boom.notFound('Proyecto de investigación no encontrado');
			}

			return proyecto;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener proyecto de investigación', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();

		try {
			// Validar que el grupo de investigación existe
			if (data.grupoInfo) {
				const grupoExists = await models.GrupoInvestigacion.findByPk(data.grupoInfo, { transaction });
				if (!grupoExists) {
					throw boom.badRequest('El grupo de investigación especificado no existe');
				}
			}

			// Validar que la convocatoriaInfo existe si se proporciona
			if (data.convocatoriaInfo) {
				const convocatoriaInfoExists = await models.Convocatoria.findByPk(data.convocatoriaInfo, { transaction });
				if (!convocatoriaInfoExists) {
					throw boom.badRequest('La convocatoriaInfo especificada no existe');
				}
			}

			// Validar fechas
			if (data.fechaInicio && data.fechaFin) {
				if (new Date(data.fechaInicio) >= new Date(data.fechaFin)) {
					throw boom.badRequest('La fecha de inicio debe ser anterior a la fecha de fin');
				}
			}

			// Crear el proyecto
			const proyecto = await models.ProyectoInvestigacion.create(data, { transaction });
			await transaction.commit();

			// Retornar el proyecto completo con relaciones
			return await this.findOne(proyecto.id);

		} catch (error) {
			await transaction.rollback();

			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'proyectos_investigacion_titulo_unique') {
					throw boom.conflict('Ya existe un proyecto con ese título');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear proyecto de investigación', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();

		try {
			const proyecto = await models.ProyectoInvestigacion.findByPk(id, { transaction });
			if (!proyecto) {
				throw boom.notFound('Proyecto de investigación no encontrado');
			}

			// Validar grupo de investigación si se está cambiando
			if (changes.grupoInfo) {
				const grupoExists = await models.GrupoInvestigacion.findByPk(changes.grupoInfo, { transaction });
				if (!grupoExists) {
					throw boom.badRequest('El grupo de investigación especificado no existe');
				}
			}

			// Validar convocatoriaInfo si se está cambiando
			if (changes.convocatoriaInfo) {
				const convocatoriaInfoExists = await models.Convocatoria.findByPk(changes.convocatoriaInfo, { transaction });
				if (!convocatoriaInfoExists) {
					throw boom.badRequest('La convocatoriaInfo especificada no existe');
				}
			}

			// Validar fechas si se están actualizando
			const fechaInicio = changes.fechaInicio || proyecto.fechaInicio;
			const fechaFin = changes.fechaFin || proyecto.fechaFin;

			if (fechaInicio && fechaFin) {
				if (new Date(fechaInicio) >= new Date(fechaFin)) {
					throw boom.badRequest('La fecha de inicio debe ser anterior a la fecha de fin');
				}
			}

			// Actualizar proyecto
			await proyecto.update(changes, { transaction });
			await transaction.commit();

			// Retornar proyecto actualizado
			return await this.findOne(id);

		} catch (error) {
			await transaction.rollback();

			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'proyectos_investigacion_titulo_unique') {
					throw boom.conflict('Ya existe un proyecto con ese título');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar proyecto de investigación', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();

		try {
			const proyecto = await models.ProyectoInvestigacion.findByPk(id, { transaction });
			if (!proyecto) {
				throw boom.notFound('Proyecto de investigación no encontrado');
			}

			await proyecto.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Proyecto eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar proyecto de investigación', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByTitulo(titulo) {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				where: {
					titulo: {
						[models.Sequelize.Op.iLike]: `%${titulo}%`
					}
				},
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					}
				],
				order: [['createdAt', 'DESC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al buscar proyectos por título', error);
		}
	}

	async findByEstado(estado) {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				where: { estado },
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					}
				],
				order: [['createdAt', 'DESC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al buscar proyectos por estado', error);
		}
	}

	async findByGrupo(grupoId) {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				where: { grupoInfo: grupoId },
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				],
				order: [['createdAt', 'DESC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al buscar proyectos por grupo', error);
		}
	}

	async findByConvocatoria(convocatoriaInfoId) {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				where: { convocatoriaInfo: convocatoriaInfoId },
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					}
				],
				order: [['createdAt', 'DESC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al buscar proyectos por convocatoriaInfo', error);
		}
	}

	async findByRangoFechas(fechaInicio, fechaFin) {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				where: {
					fechaInicio: {
						[models.Sequelize.Op.between]: [fechaInicio, fechaFin]
					}
				},
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					}
				],
				order: [['fechaInicio', 'ASC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al buscar proyectos por rango de fechas', error);
		}
	}

	async findActivos() {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				where: {
					estado: {
						[models.Sequelize.Op.in]: ['en_ejecucion', 'aprobado']
					}
				},
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al buscar proyectos activos', error);
		}
	}

	async findProximosAFinalizar(dias = 30) {
		try {
			const hoy = new Date();
			const fechaLimite = new Date(hoy.getTime() + (dias * 24 * 60 * 60 * 1000));

			const proyectos = await models.ProyectoInvestigacion.findAll({
				where: {
					estado: {
						[models.Sequelize.Op.in]: ['en_ejecucion', 'aprobado']
					},
					fechaFin: {
						[models.Sequelize.Op.between]: [hoy, fechaLimite]
					}
				},
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						required: false
					},
					{
						model: models.Convocatoria,
						as: 'convocatoriaInfo',
						required: false
					}
				],
				order: [['fechaFin', 'ASC']]
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al buscar proyectos próximos a finalizar', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE LÍNEAS DE INVESTIGACIÓN
	// ============================================================================

	async getLineasInvestigacion(proyectoId) {
		try {
			const proyecto = await models.ProyectoInvestigacion.findByPk(proyectoId, {
				include: [
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				]
			});

			if (!proyecto) {
				throw boom.notFound('Proyecto de investigación no encontrado');
			}

			return proyecto.lineas || [];
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener líneas de investigación del proyecto', error);
		}
	}

	async addLineaInvestigacion(proyectoId, lineaId) {
		const transaction = await models.sequelize.transaction();

		try {
			// Verificar que el proyecto existe
			const proyecto = await models.ProyectoInvestigacion.findByPk(proyectoId, { transaction });
			if (!proyecto) {
				throw boom.notFound('Proyecto de investigación no encontrado');
			}

			// Verificar que la línea existe
			const linea = await models.LineaInvestigacion.findByPk(lineaId, { transaction });
			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			// Asociar la línea al proyecto
			await proyecto.addLineasInvestigacion(linea, { transaction });
			await transaction.commit();

			return {
				message: 'Línea de investigación agregada exitosamente',
				proyectoId,
				lineaId
			};

		} catch (error) {
			await transaction.rollback();

			// Manejar error de asociación ya existente
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('La línea de investigación ya está asociada al proyecto');
			}

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al asociar línea de investigación al proyecto', error);
		}
	}

	async removeLineaInvestigacion(proyectoId, lineaId) {
		const transaction = await models.sequelize.transaction();

		try {
			// Verificar que el proyecto existe
			const proyecto = await models.ProyectoInvestigacion.findByPk(proyectoId, { transaction });
			if (!proyecto) {
				throw boom.notFound('Proyecto de investigación no encontrado');
			}

			// Verificar que la línea existe
			const linea = await models.LineaInvestigacion.findByPk(lineaId, { transaction });
			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			// Desasociar la línea del proyecto
			const removed = await proyecto.removeLineasInvestigacion(linea, { transaction });
			if (removed === 0) {
				throw boom.notFound('La línea no está asociada al proyecto');
			}

			await transaction.commit();

			return { message: 'Línea de investigación removida exitosamente' };

		} catch (error) {
			await transaction.rollback();

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al remover línea de investigación del proyecto', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorEstado() {
		try {
			const { sequelize } = require('../libs/sequelize');
			const estadisticas = await models.ProyectoInvestigacion.findAll({
				attributes: [
					'estado',
					[sequelize.fn('COUNT', sequelize.col('idProyecto')), 'total'],
					[sequelize.fn('AVG', sequelize.col('presupuestoAprobado')), 'presupuesto_promedio'],
					[sequelize.fn('AVG',
						sequelize.literal('EXTRACT(DAY FROM (fecha_fin - fecha_inicio))')
					), 'duracion_promedio_dias']
				],
				group: ['estado'],
				order: [['estado', 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por estado', error);
		}
	}

	async getEstadisticasPorGrupo() {
		try {
			const estadisticas = await models.ProyectoInvestigacion.findAll({
				attributes: [
					[models.sequelize.fn('COUNT', models.sequelize.col('ProyectoInvestigacion.id')), 'total_proyectos'],
					[models.sequelize.fn('SUM', models.sequelize.col('presupuesto')), 'presupuesto_total'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN estado IN ('en_ejecucion', 'aprobado') THEN 1 END")), 'activos'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN estado = 'finalizado' THEN 1 END")), 'finalizados']
				],
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre'],
						required: true
					}
				],
				group: ['grupoInfo.id', 'grupoInfo.nombre'],
				order: [[models.sequelize.col('grupoInfo.nombre'), 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por grupo', error);
		}
	}

	async getProyectosMasAntiguos(limite = 10) {
		try {
			const proyectos = await models.ProyectoInvestigacion.findAll({
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre'],
						required: false
					}
				],
				order: [['fechaInicio', 'ASC']],
				limit: limite
			});

			return proyectos;
		} catch (error) {
			throw boom.internal('Error al obtener proyectos más antiguos', error);
		}
	}

	async getEstadisticasGenerales() {
		try {
			const [total, activos, finalizados, enEjecucion, aprobados, presupuestoTotal] = await Promise.all([
				models.ProyectoInvestigacion.count(),
				models.ProyectoInvestigacion.count({
					where: {
						estado: { [models.Sequelize.Op.in]: ['en_ejecucion', 'aprobado'] }
					}
				}),
				models.ProyectoInvestigacion.count({ where: { estado: 'finalizado' } }),
				models.ProyectoInvestigacion.count({ where: { estado: 'en_ejecucion' } }),
				models.ProyectoInvestigacion.count({ where: { estado: 'aprobado' } }),
				models.ProyectoInvestigacion.sum('presupuesto')
			]);

			// Proyectos próximos a finalizar (próximos 30 días)
			const proximosVencer = await this.findProximosAFinalizar(30);

			return {
				total,
				activos,
				finalizados,
				en_ejecucion: enEjecucion,
				aprobados,
				cancelados: total - activos - finalizados,
				presupuesto_total: presupuestoTotal || 0,
				proximos_a_finalizar: proximosVencer.length
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas generales', error);
		}
	}
}

module.exports = ProyectoInvestigacionService;
