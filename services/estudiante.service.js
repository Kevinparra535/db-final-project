const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class EstudianteService {
	
	async find() {
		try {
			const estudiantes = await models.Estudiante.findAll({
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});
			
			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al obtener estudiantes', error);
		}
	}

	async findOne(id) {
		try {
			const estudiante = await models.Estudiante.findByPk(id, {
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				]
			});

			if (!estudiante) {
				throw boom.notFound('Estudiante no encontrado');
			}

			return estudiante;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener estudiante', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Verificar que la facultad existe si se proporciona
			if (data.facultad) {
				const facultadExists = await models.Facultad.findByPk(data.facultad, { transaction });
				if (!facultadExists) {
					throw boom.badRequest('La facultad especificada no existe');
				}
			}

			// Crear el estudiante
			const estudiante = await models.Estudiante.create(data, { transaction });
			await transaction.commit();

			// Retornar el estudiante completo con relaciones
			return await this.findOne(estudiante.id);

		} catch (error) {
			await transaction.rollback();
			
			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'estudiantes_tipo_num_id_unique') {
					throw boom.conflict('Ya existe un estudiante con ese tipo y número de identificación');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear estudiante', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const estudiante = await models.Estudiante.findByPk(id, { transaction });
			if (!estudiante) {
				throw boom.notFound('Estudiante no encontrado');
			}

			// Verificar facultad si se está cambiando
			if (changes.facultad) {
				const facultadExists = await models.Facultad.findByPk(changes.facultad, { transaction });
				if (!facultadExists) {
					throw boom.badRequest('La facultad especificada no existe');
				}
			}

			// Actualizar estudiante
			await estudiante.update(changes, { transaction });
			await transaction.commit();

			// Retornar estudiante actualizado
			return await this.findOne(id);

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'estudiantes_tipo_num_id_unique') {
					throw boom.conflict('Ya existe un estudiante con ese tipo y número de identificación');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar estudiante', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const estudiante = await models.Estudiante.findByPk(id, { transaction });
			if (!estudiante) {
				throw boom.notFound('Estudiante no encontrado');
			}

			await estudiante.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Estudiante eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar estudiante', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		try {
			const estudiantes = await models.Estudiante.findAll({
				where: {
					[models.Sequelize.Op.or]: [
						{
							nombres: {
								[models.Sequelize.Op.iLike]: `%${nombre}%`
							}
						},
						{
							apellidos: {
								[models.Sequelize.Op.iLike]: `%${nombre}%`
							}
						}
					]
				},
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al buscar estudiantes por nombre', error);
		}
	}

	async findByPrograma(programa) {
		try {
			const estudiantes = await models.Estudiante.findAll({
				where: {
					programa: {
						[models.Sequelize.Op.iLike]: `%${programa}%`
					}
				},
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al buscar estudiantes por programa', error);
		}
	}

	async findByFacultad(facultadId) {
		try {
			const estudiantes = await models.Estudiante.findAll({
				where: { facultad: facultadId },
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al buscar estudiantes por facultad', error);
		}
	}

	async findByEstado(estado) {
		try {
			const estudiantes = await models.Estudiante.findAll({
				where: { estado },
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al buscar estudiantes por estado', error);
		}
	}

	async findByRangoSemestre(semestreMin, semestreMax) {
		try {
			const estudiantes = await models.Estudiante.findAll({
				where: {
					semestre: {
						[models.Sequelize.Op.between]: [semestreMin, semestreMax]
					}
				},
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['semestre', 'ASC'], ['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al buscar estudiantes por rango de semestre', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorPrograma() {
		try {
			const estadisticas = await models.Estudiante.findAll({
				attributes: [
					'programa',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN estado = 'activo' THEN 1 END")), 'activos'],
					[models.sequelize.fn('AVG', models.sequelize.col('semestre')), 'semestre_promedio']
				],
				group: ['programa'],
				order: [['programa', 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por programa', error);
		}
	}

	async getEstadisticasPorFacultad() {
		try {
			const estadisticas = await models.Estudiante.findAll({
				attributes: [
					[models.sequelize.fn('COUNT', models.sequelize.col('Estudiante.id')), 'total']
				],
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						attributes: ['id', 'nombre', 'ciudad'],
						required: true
					}
				],
				group: ['facultadInfo.id', 'facultadInfo.nombre', 'facultadInfo.ciudad'],
				order: [[models.sequelize.col('facultadInfo.nombre'), 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por facultad', error);
		}
	}

	async getEstadisticasPorSemestre() {
		try {
			const estadisticas = await models.Estudiante.findAll({
				attributes: [
					'semestre',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total']
				],
				where: {
					semestre: {
						[models.Sequelize.Op.not]: null
					}
				},
				group: ['semestre'],
				order: [['semestre', 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por semestre', error);
		}
	}

	async getEstadisticasGenerales() {
		try {
			const [total, activos, inactivos, porPrograma, semestrePromedio] = await Promise.all([
				models.Estudiante.count(),
				models.Estudiante.count({ where: { estado: 'activo' } }),
				models.Estudiante.count({ where: { estado: 'inactivo' } }),
				models.Estudiante.count({
					group: ['programa'],
					attributes: ['programa']
				}),
				models.Estudiante.findAll({
					attributes: [
						[models.sequelize.fn('AVG', models.sequelize.col('semestre')), 'promedio']
					],
					where: {
						semestre: {
							[models.Sequelize.Op.not]: null
						}
					}
				})
			]);

			return {
				total,
				activos,
				inactivos,
				suspendidos: total - activos - inactivos,
				programas_unicos: porPrograma.length || 0,
				semestre_promedio: semestrePromedio[0]?.dataValues?.promedio ? 
					parseFloat(semestrePromedio[0].dataValues.promedio).toFixed(1) : 0
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas generales', error);
		}
	}

	// ============================================================================
	// MÉTODOS ESPECÍFICOS
	// ============================================================================

	async findActivosPorPrograma(programa) {
		try {
			const estudiantes = await models.Estudiante.findAll({
				where: {
					programa: {
						[models.Sequelize.Op.iLike]: `%${programa}%`
					},
					estado: 'activo'
				},
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['semestre', 'ASC'], ['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al buscar estudiantes activos por programa', error);
		}
	}

	async findProximosGraduar() {
		try {
			// Asumiendo que estudiantes con semestre >= 8 están próximos a graduarse
			const estudiantes = await models.Estudiante.findAll({
				where: {
					semestre: {
						[models.Sequelize.Op.gte]: 8
					},
					estado: 'activo'
				},
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['semestre', 'DESC'], ['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return estudiantes;
		} catch (error) {
			throw boom.internal('Error al buscar estudiantes próximos a graduarse', error);
		}
	}
}

module.exports = EstudianteService;