const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class LineaInvestigacionService {
	
	async find() {
		try {
			const lineas = await models.LineaInvestigacion.findAll({
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						through: { attributes: [] }, // Exclude junction table attributes
						required: false
					}
				],
				order: [['nombre', 'ASC']]
			});
			
			return lineas;
		} catch (error) {
			throw boom.internal('Error al obtener líneas de investigación', error);
		}
	}

	async findOne(id) {
		try {
			const linea = await models.LineaInvestigacion.findByPk(id, {
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						through: { attributes: [] },
						required: false
					}
				]
			});

			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			return linea;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener línea de investigación', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Crear la línea de investigación
			const linea = await models.LineaInvestigacion.create(data, { transaction });
			await transaction.commit();

			// Retornar la línea completa con relaciones
			return await this.findOne(linea.id);

		} catch (error) {
			await transaction.rollback();
			
			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'lineas_investigacion_nombre_unique') {
					throw boom.conflict('Ya existe una línea de investigación con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear línea de investigación', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const linea = await models.LineaInvestigacion.findByPk(id, { transaction });
			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			// Actualizar línea
			await linea.update(changes, { transaction });
			await transaction.commit();

			// Retornar línea actualizada
			return await this.findOne(id);

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'lineas_investigacion_nombre_unique') {
					throw boom.conflict('Ya existe una línea de investigación con ese nombre');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar línea de investigación', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const linea = await models.LineaInvestigacion.findByPk(id, { transaction });
			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			await linea.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Línea de investigación eliminada exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar línea de investigación', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		try {
			const lineas = await models.LineaInvestigacion.findAll({
				where: {
					nombre: {
						[models.Sequelize.Op.iLike]: `%${nombre}%`
					}
				},
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						through: { attributes: [] },
						required: false
					}
				],
				order: [['nombre', 'ASC']]
			});

			return lineas;
		} catch (error) {
			throw boom.internal('Error al buscar líneas por nombre', error);
		}
	}

	async findByKeywords(keywords) {
		try {
			const keywordArray = keywords.toLowerCase().split(' ');
			
			// Crear condiciones OR para cada palabra clave
			const orConditions = keywordArray.map(keyword => ({
				nombre: {
					[models.Sequelize.Op.iLike]: `%${keyword}%`
				}
			}));

			const lineas = await models.LineaInvestigacion.findAll({
				where: {
					[models.Sequelize.Op.or]: orConditions
				},
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						through: { attributes: [] },
						required: false
					}
				],
				order: [['nombre', 'ASC']]
			});

			return lineas;
		} catch (error) {
			throw boom.internal('Error al buscar líneas por palabras clave', error);
		}
	}

	async findByGrupo(grupoId) {
		try {
			const lineas = await models.LineaInvestigacion.findAll({
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						through: { attributes: [] },
						where: { id: grupoId },
						required: true
					}
				],
				order: [['nombre', 'ASC']]
			});

			return lineas;
		} catch (error) {
			throw boom.internal('Error al buscar líneas por grupo', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticas() {
		try {
			const [total, conGrupos, sinGrupos] = await Promise.all([
				models.LineaInvestigacion.count(),
				models.LineaInvestigacion.count({
					include: [
						{
							model: models.GrupoInvestigacion,
							as: 'gruposInvestigacion',
							required: true
						}
					]
				}),
				models.LineaInvestigacion.count({
					include: [
						{
							model: models.GrupoInvestigacion,
							as: 'gruposInvestigacion',
							required: false
						}
					],
					where: {
						'$gruposInvestigacion.id$': null
					}
				})
			]);

			const areaStats = await this.getEstadisticasPorArea();

			return {
				total_lineas: total,
				con_grupos: conGrupos,
				sin_grupos: sinGrupos,
				lineas_por_area: areaStats
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas', error);
		}
	}

	async getEstadisticasPorArea() {
		try {
			// Definir categorías de áreas temáticas
			const areas = {
				'Computación': ['artificial', 'software', 'datos', 'machine', 'learning', 'inteligencia'],
				'Matemáticas': ['matemáticas', 'estadística', 'análisis'],
				'Medicina': ['biomedicina', 'biotecnología', 'salud', 'médica'],
				'Ingeniería': ['robótica', 'automatización', 'ingeniería', 'sistemas'],
				'Ciencias Sociales': ['sociales', 'humanas', 'cultural'],
				'Arte': ['arte', 'digital', 'multimedia', 'creativo', 'diseño'],
				'Otras': []
			};

			const resultado = {};

			// Buscar líneas para cada área
			for (const [area, keywords] of Object.entries(areas)) {
				if (keywords.length === 0) continue;

				const orConditions = keywords.map(keyword => ({
					nombre: {
						[models.Sequelize.Op.iLike]: `%${keyword}%`
					}
				}));

				const lineas = await models.LineaInvestigacion.findAll({
					where: {
						[models.Sequelize.Op.or]: orConditions
					},
					attributes: ['id', 'nombre'],
					order: [['nombre', 'ASC']]
				});

				resultado[area] = {
					cantidad: lineas.length,
					lineas: lineas.map(l => ({ id: l.id, nombre: l.nombre }))
				};
			}

			// Calcular líneas que no coinciden con ninguna categoría
			const lineasCategorizadas = Object.values(resultado)
				.flatMap(area => area.lineas.map(l => l.id));

			const lineasOtras = await models.LineaInvestigacion.findAll({
				where: {
					id: {
						[models.Sequelize.Op.notIn]: lineasCategorizadas
					}
				},
				attributes: ['id', 'nombre'],
				order: [['nombre', 'ASC']]
			});

			resultado['Otras'] = {
				cantidad: lineasOtras.length,
				lineas: lineasOtras.map(l => ({ id: l.id, nombre: l.nombre }))
			};

			return resultado;
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas por área', error);
		}
	}

	async getLineasMasUtilizadas(limite = 10) {
		try {
			const lineas = await models.LineaInvestigacion.findAll({
				attributes: [
					'id',
					'nombre',
					[models.sequelize.fn('COUNT', models.sequelize.col('gruposInvestigacion.id')), 'cantidad_grupos']
				],
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						through: { attributes: [] },
						attributes: [],
						required: false
					}
				],
				group: ['LineaInvestigacion.id', 'LineaInvestigacion.nombre'],
				order: [[models.sequelize.literal('cantidad_grupos'), 'DESC']],
				limit: limite
			});

			return lineas;
		} catch (error) {
			throw boom.internal('Error al obtener líneas más utilizadas', error);
		}
	}

	async getLineasSinGrupos() {
		try {
			const lineas = await models.LineaInvestigacion.findAll({
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						required: false
					}
				],
				where: {
					'$gruposInvestigacion.id$': null
				},
				order: [['nombre', 'ASC']]
			});

			return lineas;
		} catch (error) {
			throw boom.internal('Error al obtener líneas sin grupos', error);
		}
	}

	// ============================================================================
	// MÉTODOS ESPECÍFICOS
	// ============================================================================

	async getGruposByLinea(idLinea) {
		try {
			const linea = await models.LineaInvestigacion.findByPk(idLinea, {
				include: [
					{
						model: models.GrupoInvestigacion,
						as: 'gruposInvestigacion',
						through: { attributes: [] },
						include: [
							{
								model: models.Facultad,
								as: 'facultadInfo',
								attributes: ['id', 'nombre'],
								required: false
							}
						],
						required: false
					}
				]
			});

			if (!linea) {
				throw boom.notFound('Línea de investigación no encontrada');
			}

			return linea.gruposInvestigacion || [];
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener grupos de la línea', error);
		}
	}
}

module.exports = LineaInvestigacionService;