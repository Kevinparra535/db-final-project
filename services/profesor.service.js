const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class ProfesorService {
	
	async find() {
		try {
			const profesores = await models.Profesor.findAll({
				include: [
					{
						model: models.ProfesorCorreo,
						as: 'correos',
						required: false
					},
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});
			
			return profesores;
		} catch (error) {
			throw boom.internal('Error al obtener profesores', error);
		}
	}

	async findOne(id) {
		try {
			const profesor = await models.Profesor.findByPk(id, {
				include: [
					{
						model: models.ProfesorCorreo,
						as: 'correos',
						required: false
					},
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				]
			});

			if (!profesor) {
				throw boom.notFound('Profesor no encontrado');
			}

			return profesor;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener profesor', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Verificar que la facultad existe
			if (data.facultad) {
				const facultadExists = await models.Facultad.findByPk(data.facultad, { transaction });
				if (!facultadExists) {
					throw boom.badRequest('La facultad especificada no existe');
				}
			}

			// Extraer correos adicionales si los hay
			const { correosAdicionales, ...profesorData } = data;

			// Crear el profesor
			const profesor = await models.Profesor.create(profesorData, { transaction });

			// Si hay correos adicionales, crearlos
			if (correosAdicionales && Array.isArray(correosAdicionales)) {
				const correosToCreate = correosAdicionales.map(correo => ({
					idProfesor: profesor.id,
					email: correo.email,
					etiqueta: correo.etiqueta || 'personal'
				}));

				await models.ProfesorCorreo.bulkCreate(correosToCreate, { 
					transaction,
					validate: true 
				});
			}

			await transaction.commit();

			// Retornar el profesor completo con correos
			return await this.findOne(profesor.id);

		} catch (error) {
			await transaction.rollback();
			
			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'profesores_tipo_num_id_unique') {
					throw boom.conflict('Ya existe un profesor con ese tipo y número de identificación');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear profesor', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const profesor = await models.Profesor.findByPk(id, { transaction });
			if (!profesor) {
				throw boom.notFound('Profesor no encontrado');
			}

			// Verificar facultad si se está cambiando
			if (changes.facultad) {
				const facultadExists = await models.Facultad.findByPk(changes.facultad, { transaction });
				if (!facultadExists) {
					throw boom.badRequest('La facultad especificada no existe');
				}
			}

			// Actualizar profesor
			await profesor.update(changes, { transaction });
			await transaction.commit();

			// Retornar profesor actualizado
			return await this.findOne(id);

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'profesores_tipo_num_id_unique') {
					throw boom.conflict('Ya existe un profesor con ese tipo y número de identificación');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar profesor', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const profesor = await models.Profesor.findByPk(id, { transaction });
			if (!profesor) {
				throw boom.notFound('Profesor no encontrado');
			}

			// Los correos se eliminan automáticamente por CASCADE
			await profesor.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Profesor eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar profesor', error);
		}
	}

	// ============================================================================
	// MÉTODOS PARA CORREOS ADICIONALES
	// ============================================================================

	async getCorreos(profesorId) {
		try {
			const profesor = await models.Profesor.findByPk(profesorId);
			if (!profesor) {
				throw boom.notFound('Profesor no encontrado');
			}

			const correos = await models.ProfesorCorreo.findAll({
				where: { idProfesor: profesorId },
				order: [['etiqueta', 'ASC'], ['email', 'ASC']]
			});

			return correos;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener correos del profesor', error);
		}
	}

	async addCorreo(profesorId, correoData) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Verificar que el profesor existe
			const profesor = await models.Profesor.findByPk(profesorId, { transaction });
			if (!profesor) {
				throw boom.notFound('Profesor no encontrado');
			}

			// Crear el correo
			const nuevoCorreo = await models.ProfesorCorreo.create({
				idProfesor: profesorId,
				email: correoData.email,
				etiqueta: correoData.etiqueta || 'personal'
			}, { transaction });

			await transaction.commit();

			return nuevoCorreo;

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('Ya existe ese correo para el profesor');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al agregar correo', error);
		}
	}

	async removeCorreo(profesorId, email) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const correo = await models.ProfesorCorreo.findOne({
				where: { 
					idProfesor: profesorId,
					email: email 
				},
				transaction
			});

			if (!correo) {
				throw boom.notFound('Correo no encontrado');
			}

			await correo.destroy({ transaction });
			await transaction.commit();

			return { message: 'Correo eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar correo', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		try {
			const profesores = await models.Profesor.findAll({
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
						model: models.ProfesorCorreo,
						as: 'correos',
						required: false
					},
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return profesores;
		} catch (error) {
			throw boom.internal('Error al buscar profesores por nombre', error);
		}
	}

	async findByDepartamento(departamento) {
		try {
			const profesores = await models.Profesor.findAll({
				where: {
					departamento: {
						[models.Sequelize.Op.iLike]: `%${departamento}%`
					}
				},
				include: [
					{
						model: models.ProfesorCorreo,
						as: 'correos',
						required: false
					},
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return profesores;
		} catch (error) {
			throw boom.internal('Error al buscar profesores por departamento', error);
		}
	}

	async findByFacultad(facultadId) {
		try {
			const profesores = await models.Profesor.findAll({
				where: { facultad: facultadId },
				include: [
					{
						model: models.ProfesorCorreo,
						as: 'correos',
						required: false
					},
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return profesores;
		} catch (error) {
			throw boom.internal('Error al buscar profesores por facultad', error);
		}
	}

	async findByEstado(estado) {
		try {
			const profesores = await models.Profesor.findAll({
				where: { estado },
				include: [
					{
						model: models.ProfesorCorreo,
						as: 'correos',
						required: false
					},
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});

			return profesores;
		} catch (error) {
			throw boom.internal('Error al buscar profesores por estado', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorDepartamento() {
		try {
			const estadisticas = await models.Profesor.findAll({
				attributes: [
					'departamento',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN estado = 'activo' THEN 1 END")), 'activos'],
					[models.sequelize.fn('COUNT', models.sequelize.literal("CASE WHEN estado = 'inactivo' THEN 1 END")), 'inactivos']
				],
				group: ['departamento'],
				order: [['departamento', 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por departamento', error);
		}
	}

	async getEstadisticasPorFacultad() {
		try {
			const estadisticas = await models.Profesor.findAll({
				attributes: [
					[models.sequelize.fn('COUNT', models.sequelize.col('Profesor.id')), 'total']
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

	async getEstadisticasGenerales() {
		try {
			const [total, activos, inactivos, porDepartamento] = await Promise.all([
				models.Profesor.count(),
				models.Profesor.count({ where: { estado: 'activo' } }),
				models.Profesor.count({ where: { estado: 'inactivo' } }),
				models.Profesor.count({
					group: ['departamento'],
					attributes: ['departamento']
				})
			]);

			return {
				total,
				activos,
				inactivos,
				suspendidos: total - activos - inactivos,
				departamentos_unicos: porDepartamento.length || 0
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas generales', error);
		}
	}
}

module.exports = ProfesorService;