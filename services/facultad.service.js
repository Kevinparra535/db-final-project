const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class FacultadService {
	constructor() {
		// No necesitamos generar datos mock ya que usaremos Sequelize
	}

	async find() {
		try {
			const facultades = await models.Facultad.findAll({
				order: [['createdAt', 'DESC']]
			});
			return facultades;
		} catch (error) {
			throw boom.internal('Error al obtener facultades');
		}
	}

	async findOne(id) {
		try {
			const facultad = await models.Facultad.findByPk(id, {
				include: [
					{
						association: 'grupos',
						attributes: ['id', 'nombre', 'clasificacion']
					}
				]
			});
			
			if (!facultad) {
				throw boom.notFound('Facultad no encontrada');
			}
			
			return facultad;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener la facultad');
		}
	}

	async create(data) {
		try {
			// Generar ID único para la facultad
			const ultimaFacultad = await models.Facultad.findOne({
				order: [['id', 'DESC']],
				attributes: ['id']
			});
			
			let nuevoId = 'FAC0000001';
			if (ultimaFacultad) {
				const ultimoNumero = parseInt(ultimaFacultad.id.slice(3));
				nuevoId = `FAC${(ultimoNumero + 1).toString().padStart(7, '0')}`;
			}

			const newFacultad = await models.Facultad.create({
				id: nuevoId,
				...data
			});
			
			return newFacultad;
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('Ya existe una facultad con ese nombre');
			}
			if (error.name === 'SequelizeValidationError') {
				throw boom.badRequest('Error de validación: ' + error.message);
			}
			throw boom.internal('Error al crear la facultad');
		}
	}

	async update(id, changes) {
		try {
			const facultad = await models.Facultad.findByPk(id);
			
			if (!facultad) {
				throw boom.notFound('Facultad no encontrada');
			}

			const updatedFacultad = await facultad.update(changes);
			return updatedFacultad;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('Ya existe una facultad con ese nombre');
			}
			if (error.name === 'SequelizeValidationError') {
				throw boom.badRequest('Error de validación: ' + error.message);
			}
			throw boom.internal('Error al actualizar la facultad');
		}
	}

	async delete(id) {
		try {
			const facultad = await models.Facultad.findByPk(id);
			
			if (!facultad) {
				throw boom.notFound('Facultad no encontrada');
			}

			await facultad.destroy();
			return { id, message: 'Facultad eliminada exitosamente' };
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			if (error.name === 'SequelizeForeignKeyConstraintError') {
				throw boom.badRequest('No se puede eliminar la facultad porque tiene grupos asociados');
			}
			throw boom.internal('Error al eliminar la facultad');
		}
	}

	// Método para buscar por nombre
	async findByNombre(nombre) {
		try {
			const facultades = await models.Facultad.findAll({
				where: {
					nombre: {
						[models.Sequelize.Op.iLike]: `%${nombre}%`
					}
				},
				order: [['nombre', 'ASC']]
			});
			return facultades;
		} catch (error) {
			throw boom.internal('Error al buscar facultades por nombre');
		}
	}

	// Método para buscar por ciudad
	async findByCiudad(ciudad) {
		try {
			const facultades = await models.Facultad.findAll({
				where: {
					ciudad: {
						[models.Sequelize.Op.iLike]: `%${ciudad}%`
					}
				},
				order: [['ciudad', 'ASC'], ['nombre', 'ASC']]
			});
			return facultades;
		} catch (error) {
			throw boom.internal('Error al buscar facultades por ciudad');
		}
	}

	// Método para obtener estadísticas
	async getEstadisticas() {
		try {
			const totalFacultades = await models.Facultad.count();
			
			const porCiudad = await models.Facultad.findAll({
				attributes: [
					'ciudad',
					[models.Sequelize.fn('COUNT', models.Sequelize.col('ciudad')), 'total']
				],
				group: ['ciudad'],
				order: [[models.Sequelize.literal('total'), 'DESC']]
			});

			return {
				total: totalFacultades,
				por_ciudad: porCiudad
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas de facultades');
		}
	}
}

module.exports = FacultadService;
