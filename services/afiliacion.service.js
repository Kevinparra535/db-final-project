const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class AfiliacionService {
	
	async find() {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});
			
			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al obtener afiliaciones', error);
		}
	}

	async findOne(id) {
		try {
			const afiliacion = await models.Afiliacion.findByPk(id, {
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos', 'tipoIdentificacion', 'identificacion']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre', 'facultad'],
						include: [
							{
								model: models.Facultad,
								as: 'facultadObj',
								attributes: ['id', 'nombre']
							}
						]
					}
				]
			});

			if (!afiliacion) {
				throw boom.notFound('Afiliación no encontrada');
			}

			return afiliacion;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener afiliación', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Validar que existan el investigador y grupo
			const [investigador, grupo] = await Promise.all([
				models.Investigador.findByPk(data.investigador, { transaction }),
				models.GrupoInvestigacion.findByPk(data.grupoInvestigacion, { transaction })
			]);

			if (!investigador) {
				throw boom.notFound('Investigador no encontrado');
			}
			if (!grupo) {
				throw boom.notFound('Grupo de investigación no encontrado');
			}

			// Verificar que no exista afiliación activa del mismo investigador al mismo grupo
			const afiliacionExistente = await models.Afiliacion.findOne({
				where: {
					investigador: data.investigador,
					grupoInvestigacion: data.grupoInvestigacion,
					fechaFin: null
				},
				transaction
			});

			if (afiliacionExistente) {
				throw boom.conflict('El investigador ya tiene una afiliación activa en este grupo');
			}

			// Crear afiliación
			const afiliacion = await models.Afiliacion.create(data, { transaction });
			await transaction.commit();

			// Retornar con datos completos
			return await this.findOne(afiliacion.id);

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear afiliación', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const afiliacion = await models.Afiliacion.findByPk(id, { transaction });
			if (!afiliacion) {
				throw boom.notFound('Afiliación no encontrada');
			}

			// Si se está cambiando investigador o grupo, validar que existan
			if (changes.investigador) {
				const investigador = await models.Investigador.findByPk(changes.investigador, { transaction });
				if (!investigador) {
					throw boom.notFound('Investigador no encontrado');
				}
			}

			if (changes.grupoInvestigacion) {
				const grupo = await models.GrupoInvestigacion.findByPk(changes.grupoInvestigacion, { transaction });
				if (!grupo) {
					throw boom.notFound('Grupo de investigación no encontrado');
				}
			}

			await afiliacion.update(changes, { transaction });
			await transaction.commit();

			return await this.findOne(afiliacion.id);

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar afiliación', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const afiliacion = await models.Afiliacion.findByPk(id, { transaction });
			if (!afiliacion) {
				throw boom.notFound('Afiliación no encontrada');
			}

			await afiliacion.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Afiliación eliminada exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar afiliación', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByInvestigador(investigadorId) {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: { investigador: investigadorId },
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre', 'facultad'],
						include: [
							{
								model: models.Facultad,
								as: 'facultadObj',
								attributes: ['id', 'nombre']
							}
						]
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar afiliaciones por investigador', error);
		}
	}

	async findByGrupo(grupoId) {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: { grupoInvestigacion: grupoId },
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos', 'tipoIdentificacion', 'identificacion']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar afiliaciones por grupo', error);
		}
	}

	async findByRol(rol) {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: { rol },
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar afiliaciones por rol', error);
		}
	}

	async findActivas() {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: { fechaFin: null },
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar afiliaciones activas', error);
		}
	}

	async findByRangoFechas(fechaInicio, fechaFin) {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: {
					fechaInicio: {
						[models.Sequelize.Op.between]: [fechaInicio, fechaFin]
					}
				},
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'ASC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar afiliaciones por rango de fechas', error);
		}
	}

	async findLideres() {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: {
					rol: 'lider',
					fechaFin: null
				},
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar líderes', error);
		}
	}

	async findCoinvestigadores() {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: {
					rol: 'coinvestigador',
					fechaFin: null
				},
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar coinvestigadores', error);
		}
	}

	async findSemilleristas() {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: {
					rol: 'semillerista',
					fechaFin: null
				},
				include: [
					{
						model: models.Investigador,
						as: 'investigadorInfo',
						attributes: ['id', 'nombres', 'apellidos']
					},
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones;
		} catch (error) {
			throw boom.internal('Error al buscar semilleristas', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE AFILIACIONES
	// ============================================================================

	async finalizarAfiliacion(id, fechaFin = new Date()) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const afiliacion = await models.Afiliacion.findByPk(id, { transaction });
			if (!afiliacion) {
				throw boom.notFound('Afiliación no encontrada');
			}

			if (afiliacion.fechaFin) {
				throw boom.conflict('La afiliación ya está finalizada');
			}

			await afiliacion.update({ fechaFin }, { transaction });
			await transaction.commit();

			return {
				message: 'Afiliación finalizada exitosamente',
				afiliacion: await this.findOne(afiliacion.id)
			};

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al finalizar afiliación', error);
		}
	}

	async cambiarRol(id, nuevoRol) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const afiliacion = await models.Afiliacion.findByPk(id, { transaction });
			if (!afiliacion) {
				throw boom.notFound('Afiliación no encontrada');
			}

			const rolAnterior = afiliacion.rol;
			await afiliacion.update({ rol: nuevoRol }, { transaction });
			await transaction.commit();

			return {
				message: `Rol cambiado de ${rolAnterior} a ${nuevoRol}`,
				afiliacion: await this.findOne(afiliacion.id)
			};

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al cambiar rol', error);
		}
	}

	async transferirAfiliacion(id, nuevoGrupoId, fechaTransferencia = new Date()) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const afiliacion = await models.Afiliacion.findByPk(id, { transaction });
			if (!afiliacion) {
				throw boom.notFound('Afiliación no encontrada');
			}

			// Validar que el nuevo grupo exista
			const nuevoGrupo = await models.GrupoInvestigacion.findByPk(nuevoGrupoId, { transaction });
			if (!nuevoGrupo) {
				throw boom.notFound('Nuevo grupo de investigación no encontrado');
			}

			// Finalizar afiliación actual
			await afiliacion.update({ fechaFin: fechaTransferencia }, { transaction });

			// Crear nueva afiliación en el nuevo grupo
			const nuevaAfiliacion = await models.Afiliacion.create({
				investigador: afiliacion.investigador,
				grupoInvestigacion: nuevoGrupoId,
				rol: afiliacion.rol,
				fechaInicio: fechaTransferencia,
				observaciones: `Transferido desde grupo ${afiliacion.grupoInvestigacion}`
			}, { transaction });

			await transaction.commit();

			return {
				message: 'Afiliación transferida exitosamente',
				afiliacion_anterior: await this.findOne(afiliacion.id),
				nueva_afiliacion: await this.findOne(nuevaAfiliacion.id)
			};

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al transferir afiliación', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorRol() {
		try {
			const estadisticas = await models.Afiliacion.findAll({
				attributes: [
					'rol',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN fecha_fin IS NULL THEN 1 END")), 'activas'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN fecha_fin IS NOT NULL THEN 1 END")), 'finalizadas'],
					[models.sequelize.fn('AVG', 
						models.sequelize.literal("CASE WHEN fecha_fin IS NOT NULL THEN EXTRACT(DAY FROM fecha_fin - fecha_inicio) END")
					), 'duracion_promedio_dias']
				],
				group: ['rol'],
				order: [['rol', 'ASC']]
			});

			// Convertir a objeto más legible
			const resultado = {};
			estadisticas.forEach(stat => {
				resultado[stat.rol] = {
					total: parseInt(stat.dataValues.total),
					activas: parseInt(stat.dataValues.activas),
					finalizadas: parseInt(stat.dataValues.finalizadas),
					duracion_promedio_dias: stat.dataValues.duracion_promedio_dias ? 
						Math.round(parseFloat(stat.dataValues.duracion_promedio_dias)) : 0
				};
			});

			return resultado;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por rol', error);
		}
	}

	async getEstadisticasPorGrupo() {
		try {
			const estadisticas = await models.Afiliacion.findAll({
				attributes: [
					'grupoInvestigacion',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total_miembros'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN fecha_fin IS NULL THEN 1 END")), 'miembros_activos'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'lider' THEN 1 END")), 'lideres'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'coinvestigador' THEN 1 END")), 'coinvestigadores'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'semillerista' THEN 1 END")), 'semilleristas'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'asistente' THEN 1 END")), 'asistentes'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN rol = 'administrativo' THEN 1 END")), 'administrativos']
				],
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['nombre']
					}
				],
				group: ['grupoInvestigacion', 'grupo.id', 'grupo.nombre'],
				order: [['grupoInvestigacion', 'ASC']]
			});

			// Convertir a objeto más legible
			const resultado = {};
			estadisticas.forEach(stat => {
				resultado[stat.grupoInvestigacion] = {
					nombre_grupo: stat.grupo.nombre,
					total_miembros: parseInt(stat.dataValues.total_miembros),
					miembros_activos: parseInt(stat.dataValues.miembros_activos),
					lideres: parseInt(stat.dataValues.lideres),
					coinvestigadores: parseInt(stat.dataValues.coinvestigadores),
					semilleristas: parseInt(stat.dataValues.semilleristas),
					asistentes: parseInt(stat.dataValues.asistentes),
					administrativos: parseInt(stat.dataValues.administrativos)
				};
			});

			return resultado;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por grupo', error);
		}
	}

	async getRankingGruposPorMiembros(limite = 10) {
		try {
			const ranking = await models.Afiliacion.findAll({
				attributes: [
					'grupoInvestigacion',
					[models.sequelize.fn('COUNT', models.sequelize.col('Afiliacion.id')), 'total_miembros'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN fecha_fin IS NULL THEN 1 END")), 'miembros_activos'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("DISTINCT rol")), 'diversidad_roles']
				],
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['nombre']
					}
				],
				group: ['grupoInvestigacion', 'grupo.id', 'grupo.nombre'],
				order: [[models.sequelize.literal('miembros_activos'), 'DESC']],
				limit: limite
			});

			return ranking.map(item => ({
				grupo_id: item.grupoInvestigacion,
				nombre_grupo: item.grupo.nombre,
				total_miembros: parseInt(item.dataValues.total_miembros),
				miembros_activos: parseInt(item.dataValues.miembros_activos),
				diversidad_roles: parseInt(item.dataValues.diversidad_roles)
			}));
		} catch (error) {
			throw boom.internal('Error al obtener ranking de grupos por miembros', error);
		}
	}

	async getHistorialInvestigador(investigadorId) {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: { investigador: investigadorId },
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'grupoInfo',
						attributes: ['id', 'nombre']
					}
				],
				order: [['fechaInicio', 'DESC']]
			});

			return afiliaciones.map(afiliacion => {
				const duracionDias = afiliacion.fechaFin ?
					Math.round((new Date(afiliacion.fechaFin) - new Date(afiliacion.fechaInicio)) / (1000 * 60 * 60 * 24)) :
					Math.round((new Date() - new Date(afiliacion.fechaInicio)) / (1000 * 60 * 60 * 24));

				return {
					...afiliacion.toJSON(),
					duracion_dias: duracionDias,
					estado: afiliacion.fechaFin ? 'finalizada' : 'activa'
				};
			});
		} catch (error) {
			throw boom.internal('Error al obtener historial del investigador', error);
		}
	}

	async getEvolucionGrupo(grupoId) {
		try {
			const afiliaciones = await models.Afiliacion.findAll({
				where: { grupoInvestigacion: grupoId },
				order: [['fechaInicio', 'ASC']]
			});

			// Agrupar por año
			const evolucion = {};
			
			afiliaciones.forEach(afiliacion => {
				const añoInicio = new Date(afiliacion.fechaInicio).getFullYear();
				
				if (!evolucion[añoInicio]) {
					evolucion[añoInicio] = {
						nuevos_miembros: 0,
						miembros_salientes: 0,
						por_rol: {}
					};
				}
				
				evolucion[añoInicio].nuevos_miembros++;
				
				if (!evolucion[añoInicio].por_rol[afiliacion.rol]) {
					evolucion[añoInicio].por_rol[afiliacion.rol] = 0;
				}
				evolucion[añoInicio].por_rol[afiliacion.rol]++;

				// Contar salidas
				if (afiliacion.fechaFin) {
					const añoSalida = new Date(afiliacion.fechaFin).getFullYear();
					if (!evolucion[añoSalida]) {
						evolucion[añoSalida] = {
							nuevos_miembros: 0,
							miembros_salientes: 0,
							por_rol: {}
						};
					}
					evolucion[añoSalida].miembros_salientes++;
				}
			});

			return evolucion;
		} catch (error) {
			throw boom.internal('Error al obtener evolución del grupo', error);
		}
	}
}

module.exports = AfiliacionService;