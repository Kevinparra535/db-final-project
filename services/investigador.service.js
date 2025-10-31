const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class InvestigadorService {
	constructor() {
		// No necesitamos generar datos mock ya que usaremos Sequelize
	}

	async find() {
		try {
			const investigadores = await models.Investigador.findAll({
				include: [
					{
						association: 'emails',
						attributes: ['email', 'etiqueta']
					},
					{
						association: 'telefonos',
						attributes: ['numero', 'tipo']
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});
			return investigadores;
		} catch (error) {
			throw boom.internal('Error al obtener investigadores');
		}
	}

	async findOne(id) {
		try {
			const investigador = await models.Investigador.findByPk(id, {
				include: [
					{
						association: 'emails',
						attributes: ['email', 'etiqueta']
					},
					{
						association: 'telefonos',
						attributes: ['numero', 'tipo']
					},
					{
						association: 'afiliaciones',
						include: [
							{
								association: 'grupoInfo',
								attributes: ['id', 'nombre']
							}
						]
					}
				]
			});
			
			if (!investigador) {
				throw boom.notFound('Investigador no encontrado');
			}
			
			return investigador;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener el investigador');
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Generar ID único para el investigador
			const ultimoInvestigador = await models.Investigador.findOne({
				order: [['id', 'DESC']],
				attributes: ['id']
			});
			
			let nuevoId = 'INV0000001';
			if (ultimoInvestigador) {
				const ultimoNumero = parseInt(ultimoInvestigador.id.slice(3));
				nuevoId = `INV${(ultimoNumero + 1).toString().padStart(7, '0')}`;
			}

			// Separar emails y teléfonos del data principal
			const { emails, telefonos, ...investigadorData } = data;

			// Crear el investigador
			const newInvestigador = await models.Investigador.create({
				id: nuevoId,
				...investigadorData
			}, { transaction });

			// Crear emails si existen
			if (emails && emails.length > 0) {
				const emailsData = emails.map(email => ({
					idInvestigador: nuevoId,
					...email
				}));
				await models.InvestigadorCorreo.bulkCreate(emailsData, { transaction });
			}

			// Crear teléfonos si existen
			if (telefonos && telefonos.length > 0) {
				const telefonosData = telefonos.map(telefono => ({
					idInvestigador: nuevoId,
					...telefono
				}));
				await models.InvestigadorTelefono.bulkCreate(telefonosData, { transaction });
			}

			await transaction.commit();

			// Obtener el investigador completo con sus relaciones
			return await this.findOne(nuevoId);
		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('Ya existe un investigador con esos datos únicos');
			}
			if (error.name === 'SequelizeValidationError') {
				throw boom.badRequest('Error de validación: ' + error.message);
			}
			throw boom.internal('Error al crear el investigador');
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const investigador = await models.Investigador.findByPk(id);
			
			if (!investigador) {
				throw boom.notFound('Investigador no encontrado');
			}

			// Separar emails y teléfonos de los cambios principales
			const { emails, telefonos, ...investigadorChanges } = changes;

			// Actualizar datos del investigador
			if (Object.keys(investigadorChanges).length > 0) {
				await investigador.update(investigadorChanges, { transaction });
			}

			// Actualizar emails si se proporcionan
			if (emails) {
				// Eliminar emails existentes
				await models.InvestigadorCorreo.destroy({
					where: { idInvestigador: id },
					transaction
				});
				
				// Crear nuevos emails
				if (emails.length > 0) {
					const emailsData = emails.map(email => ({
						idInvestigador: id,
						...email
					}));
					await models.InvestigadorCorreo.bulkCreate(emailsData, { transaction });
				}
			}

			// Actualizar teléfonos si se proporcionan
			if (telefonos) {
				// Eliminar teléfonos existentes
				await models.InvestigadorTelefono.destroy({
					where: { idInvestigador: id },
					transaction
				});
				
				// Crear nuevos teléfonos
				if (telefonos.length > 0) {
					const telefonosData = telefonos.map(telefono => ({
						idInvestigador: id,
						...telefono
					}));
					await models.InvestigadorTelefono.bulkCreate(telefonosData, { transaction });
				}
			}

			await transaction.commit();

			// Retornar el investigador actualizado
			return await this.findOne(id);
		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('Ya existe un investigador con esos datos únicos');
			}
			if (error.name === 'SequelizeValidationError') {
				throw boom.badRequest('Error de validación: ' + error.message);
			}
			throw boom.internal('Error al actualizar el investigador');
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const investigador = await models.Investigador.findByPk(id);
			
			if (!investigador) {
				throw boom.notFound('Investigador no encontrado');
			}

			// Eliminar emails y teléfonos (cascada automática por configuración del modelo)
			await investigador.destroy({ transaction });
			
			await transaction.commit();
			
			return { id, message: 'Investigador eliminado exitosamente' };
		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			if (error.name === 'SequelizeForeignKeyConstraintError') {
				throw boom.badRequest('No se puede eliminar el investigador porque tiene relaciones activas');
			}
			throw boom.internal('Error al eliminar el investigador');
		}
	}

	// Método para buscar por nombre
	async findByNombre(nombre) {
		try {
			const investigadores = await models.Investigador.findAll({
				where: {
					nombres: {
						[models.Sequelize.Op.iLike]: `%${nombre}%`
					}
				},
				include: [
					{
						association: 'emails',
						attributes: ['email', 'etiqueta']
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});
			return investigadores;
		} catch (error) {
			throw boom.internal('Error al buscar investigadores por nombre');
		}
	}

	// Método para buscar por apellido
	async findByApellido(apellido) {
		try {
			const investigadores = await models.Investigador.findAll({
				where: {
					apellidos: {
						[models.Sequelize.Op.iLike]: `%${apellido}%`
					}
				},
				include: [
					{
						association: 'emails',
						attributes: ['email', 'etiqueta']
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});
			return investigadores;
		} catch (error) {
			throw boom.internal('Error al buscar investigadores por apellido');
		}
	}

	// Método para buscar por ORCID
	async findByOrcid(orcid) {
		try {
			const investigador = await models.Investigador.findOne({
				where: { orcid },
				include: [
					{
						association: 'emails',
						attributes: ['email', 'etiqueta']
					},
					{
						association: 'telefonos',
						attributes: ['numero', 'tipo']
					}
				]
			});
			
			if (!investigador) {
				throw boom.notFound('Investigador con ORCID no encontrado');
			}
			
			return investigador;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al buscar investigador por ORCID');
		}
	}

	// Método para obtener investigadores activos
	async findActivos() {
		try {
			const investigadores = await models.Investigador.findAll({
				where: { estado: 'activo' },
				include: [
					{
						association: 'emails',
						attributes: ['email', 'etiqueta']
					}
				],
				order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
			});
			return investigadores;
		} catch (error) {
			throw boom.internal('Error al obtener investigadores activos');
		}
	}

	// Método para gestionar emails del investigador
	async addEmail(investigadorId, emailData) {
		try {
			const investigador = await models.Investigador.findByPk(investigadorId);
			
			if (!investigador) {
				throw boom.notFound('Investigador no encontrado');
			}

			const newEmail = await models.InvestigadorCorreo.create({
				idInvestigador: investigadorId,
				...emailData
			});

			return newEmail;
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('El email ya está registrado para este investigador');
			}
			if (error.name === 'SequelizeValidationError') {
				throw boom.badRequest('Error de validación: ' + error.message);
			}
			throw boom.internal('Error al agregar email');
		}
	}

	// Método para gestionar teléfonos del investigador
	async addTelefono(investigadorId, telefonoData) {
		try {
			const investigador = await models.Investigador.findByPk(investigadorId);
			
			if (!investigador) {
				throw boom.notFound('Investigador no encontrado');
			}

			const newTelefono = await models.InvestigadorTelefono.create({
				idInvestigador: investigadorId,
				...telefonoData
			});

			return newTelefono;
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw boom.conflict('El teléfono ya está registrado para este investigador');
			}
			if (error.name === 'SequelizeValidationError') {
				throw boom.badRequest('Error de validación: ' + error.message);
			}
			throw boom.internal('Error al agregar teléfono');
		}
	}
}

module.exports = InvestigadorService;