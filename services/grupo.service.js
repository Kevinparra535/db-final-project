const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class GrupoService {

	async find() {
		try {
			const grupos = await models.GrupoInvestigacion.findAll({
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] }, // Exclude junction table attributes
						required: false
					}
				],
				order: [['nombre', 'ASC']]
			});

			return grupos;
		} catch (error) {
			throw boom.internal('Error al obtener grupos de investigación', error);
		}
	}

	async findOne(id) {
		try {
			const grupo = await models.GrupoInvestigacion.findByPk(id, {
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
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

			if (!grupo) {
				throw boom.notFound('Grupo de investigación no encontrado');
			}

			return grupo;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener grupo de investigación', error);
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

			// Crear el grupo de investigación
			const grupo = await models.GrupoInvestigacion.create(data, { transaction });
			await transaction.commit();

			// Retornar el grupo completo con relaciones
			return await this.findOne(grupo.id);

		} catch (error) {
			await transaction.rollback();

			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'grupos_investigacion_nombre_unique') {
					throw boom.conflict('Ya existe un grupo con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear grupo de investigación', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();

		try {
			const grupo = await models.GrupoInvestigacion.findByPk(id, { transaction });
			if (!grupo) {
				throw boom.notFound('Grupo de investigación no encontrado');
			}

			// Verificar facultad si se está cambiando
			if (changes.facultad) {
				const facultadExists = await models.Facultad.findByPk(changes.facultad, { transaction });
				if (!facultadExists) {
					throw boom.badRequest('La facultad especificada no existe');
				}
			}

			// Actualizar grupo
			await grupo.update(changes, { transaction });
			await transaction.commit();

			// Retornar grupo actualizado
			return await this.findOne(id);

		} catch (error) {
			await transaction.rollback();

			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'grupos_investigacion_nombre_unique') {
					throw boom.conflict('Ya existe un grupo con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar grupo de investigación', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();

		try {
			const grupo = await models.GrupoInvestigacion.findByPk(id, { transaction });
			if (!grupo) {
				throw boom.notFound('Grupo de investigación no encontrado');
			}

			await grupo.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Grupo de investigación eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar grupo de investigación', error);
		}
	}

	// ============================================================================
	// MÉTODOS PARA LÍNEAS DE INVESTIGACIÓN
	// ============================================================================

	async addLinea(idGrupo, idLinea) {
		const transaction = await models.sequelize.transaction();

		try {
			// Verificar que el grupo existe
			const grupo = await models.GrupoInvestigacion.findByPk(idGrupo, { transaction });
			if (!grupo) {
				throw boom.notFound('Grupo de investigación no encontrado');
			}

			// Verificar que la línea existe
			const linea = await models.LineaInvestigacion.findByPk(idLinea, { transaction });
			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			// Asociar la línea al grupo
			await grupo.addLineasInvestigacion(linea, { transaction });
			await transaction.commit();

			return {
				idGrupo,
				idLinea,
				message: 'Línea de investigación asociada al grupo exitosamente'
			};

		} catch (error) {
			await transaction.rollback();

			// Manejar error de asociación ya existente
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('La línea ya está asociada al grupo');
			}

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al asociar línea de investigación al grupo', error);
		}
	}

	async removeLinea(idGrupo, idLinea) {
		const transaction = await models.sequelize.transaction();

		try {
			// Verificar que el grupo existe
			const grupo = await models.GrupoInvestigacion.findByPk(idGrupo, { transaction });
			if (!grupo) {
				throw boom.notFound('Grupo de investigación no encontrado');
			}

			// Verificar que la línea existe
			const linea = await models.LineaInvestigacion.findByPk(idLinea, { transaction });
			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			// Desasociar la línea del grupo
			const removed = await grupo.removeLineasInvestigacion(linea, { transaction });
			if (removed === 0) {
				throw boom.notFound('La línea no está asociada al grupo');
			}

			await transaction.commit();

			return { message: 'Línea de investigación removida del grupo exitosamente' };

		} catch (error) {
			await transaction.rollback();

			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al remover línea de investigación del grupo', error);
		}
	}

	async getLineasByGrupo(idGrupo) {
		try {
			const grupo = await models.GrupoInvestigacion.findByPk(idGrupo, {
				include: [
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				]
			});

			if (!grupo) {
				throw boom.notFound('Grupo de investigación no encontrado');
			}

			return grupo.lineas || [];
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener líneas del grupo', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		try {
			const grupos = await models.GrupoInvestigacion.findAll({
				where: {
					nombre: {
						[models.Sequelize.Op.iLike]: `%${nombre}%`
					}
				},
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				],
				order: [['nombre', 'ASC']]
			});

			return grupos;
		} catch (error) {
			throw boom.internal('Error al buscar grupos por nombre', error);
		}
	}

	async findByFacultad(facultadId) {
		try {
			const grupos = await models.GrupoInvestigacion.findAll({
				where: { facultad: facultadId },
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				],
				order: [['nombre', 'ASC']]
			});

			return grupos;
		} catch (error) {
			throw boom.internal('Error al buscar grupos por facultad', error);
		}
	}

	async findByClasificacion(clasificacion) {
		try {
			const grupos = await models.GrupoInvestigacion.findAll({
				where: { clasificacion },
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						required: false
					}
				],
				order: [['nombre', 'ASC']]
			});

			return grupos;
		} catch (error) {
			throw boom.internal('Error al buscar grupos por clasificación', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorFacultad() {
		try {
			const estadisticas = await models.GrupoInvestigacion.findAll({
				attributes: [
					[models.sequelize.fn('COUNT', models.sequelize.col('GrupoInvestigacion.id')), 'total']
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

	async getEstadisticasPorClasificacion() {
		try {
			const estadisticas = await models.GrupoInvestigacion.findAll({
				attributes: [
					'clasificacion',
					[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total']
				],
				group: ['clasificacion'],
				order: [['clasificacion', 'ASC']]
			});

			return estadisticas;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por clasificación', error);
		}
	}

	async getGruposConMasLineas(limite = 5) {
		try {
			const { sequelize } = require('../libs/sequelize');
			const grupos = await models.GrupoInvestigacion.findAll({
				attributes: [
					'id',
					'nombre',
					'clasificacion',
					'facultad',
					[sequelize.fn('COUNT', sequelize.col('lineas.id')), 'cantidad_lineas']
				],
				include: [
					{
						model: models.Facultad,
						as: 'facultadInfo',
						attributes: ['nombre'],
						required: false
					},
					{
						model: models.LineaInvestigacion,
						as: 'lineas',
						through: { attributes: [] },
						attributes: [],
						required: false
					}
				],
				group: [
					'GrupoInvestigacion.id',
					'GrupoInvestigacion.nombre',
					'GrupoInvestigacion.clasificacion',
					'GrupoInvestigacion.facultad',
					'facultadInfo.id',
					'facultadInfo.nombre'
				],
				order: [[sequelize.literal('cantidad_lineas'), 'DESC']],
				limit: limite
			});

			return grupos;
		} catch (error) {
			throw boom.internal('Error al obtener grupos con más líneas', error);
		}
	}

	async getEstadisticasGenerales() {
		try {
			const [total, porClasificacion, porFacultad] = await Promise.all([
				models.GrupoInvestigacion.count(),
				models.GrupoInvestigacion.count({
					group: ['clasificacion'],
					attributes: ['clasificacion']
				}),
				models.GrupoInvestigacion.count({
					group: ['facultad'],
					attributes: ['facultad']
				})
			]);

			return {
				total,
				clasificaciones_unicas: porClasificacion.length || 0,
				facultades_con_grupos: porFacultad.length || 0
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas generales', error);
		}
	}
}

module.exports = GrupoService;
