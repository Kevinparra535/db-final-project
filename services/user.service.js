const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class UserService {
	
	async find() {
		try {
			const users = await models.User.findAll({
				order: [['createdAt', 'DESC']]
			});
			
			return users;
		} catch (error) {
			throw boom.internal('Error al obtener usuarios', error);
		}
	}

	async findOne(id) {
		try {
			const user = await models.User.findByPk(id);

			if (!user) {
				throw boom.notFound('Usuario no encontrado');
			}

			return user;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener usuario', error);
		}
	}

	async create(data) {
		const transaction = await models.sequelize.transaction();
		
		try {
			// Verificar que no exista un usuario con el mismo email
			const existingUser = await models.User.findOne({
				where: { email: data.email },
				transaction
			});

			if (existingUser) {
				throw boom.conflict('Ya existe un usuario con este email');
			}

			// Crear usuario
			const user = await models.User.create(data, { transaction });
			await transaction.commit();

			return user;

		} catch (error) {
			await transaction.rollback();
			
			// Manejar errores de unicidad de Sequelize
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'email') {
					throw boom.conflict('Ya existe un usuario con este email');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al crear usuario', error);
		}
	}

	async update(id, changes) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const user = await models.User.findByPk(id, { transaction });
			if (!user) {
				throw boom.notFound('Usuario no encontrado');
			}

			// Si se está cambiando el email, verificar que no exista otro usuario con ese email
			if (changes.email && changes.email !== user.email) {
				const existingUser = await models.User.findOne({
					where: { 
						email: changes.email,
						id: { [models.Sequelize.Op.ne]: id }
					},
					transaction
				});

				if (existingUser) {
					throw boom.conflict('Ya existe otro usuario con este email');
				}
			}

			// Actualizar usuario
			await user.update(changes, { transaction });
			await transaction.commit();

			return user;

		} catch (error) {
			await transaction.rollback();
			
			if (error.name === 'SequelizeUniqueConstraintError') {
				const field = error.errors[0]?.path;
				if (field === 'email') {
					throw boom.conflict('Ya existe otro usuario con este email');
				}
				throw boom.conflict('Violación de restricción de unicidad');
			}
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al actualizar usuario', error);
		}
	}

	async delete(id) {
		const transaction = await models.sequelize.transaction();
		
		try {
			const user = await models.User.findByPk(id, { transaction });
			if (!user) {
				throw boom.notFound('Usuario no encontrado');
			}

			await user.destroy({ transaction });
			await transaction.commit();

			return { id, message: 'Usuario eliminado exitosamente' };

		} catch (error) {
			await transaction.rollback();
			
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al eliminar usuario', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByEmail(email) {
		try {
			const user = await models.User.findOne({
				where: { email }
			});

			return user;
		} catch (error) {
			throw boom.internal('Error al buscar usuario por email', error);
		}
	}

	async findActive() {
		try {
			const users = await models.User.findAll({
				where: { isActive: true },
				order: [['createdAt', 'DESC']]
			});

			return users;
		} catch (error) {
			throw boom.internal('Error al buscar usuarios activos', error);
		}
	}

	async findByRole(role) {
		try {
			const users = await models.User.findAll({
				where: { role },
				order: [['createdAt', 'DESC']]
			});

			return users;
		} catch (error) {
			throw boom.internal('Error al buscar usuarios por rol', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE USUARIOS
	// ============================================================================

	async activateUser(id) {
		try {
			const user = await this.update(id, { isActive: true });
			return {
				message: 'Usuario activado exitosamente',
				user
			};
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al activar usuario', error);
		}
	}

	async deactivateUser(id) {
		try {
			const user = await this.update(id, { isActive: false });
			return {
				message: 'Usuario desactivado exitosamente',
				user
			};
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al desactivar usuario', error);
		}
	}

	async changeRole(id, newRole) {
		try {
			const user = await this.update(id, { role: newRole });
			return {
				message: `Rol cambiado exitosamente a ${newRole}`,
				user
			};
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al cambiar rol del usuario', error);
		}
	}

	async changePassword(id, newPassword) {
		try {
			const user = await this.update(id, { password: newPassword });
			return {
				message: 'Contraseña cambiada exitosamente'
			};
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al cambiar contraseña', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getStatistics() {
		try {
			const [total, active, inactive, byRole] = await Promise.all([
				models.User.count(),
				models.User.count({ where: { isActive: true } }),
				models.User.count({ where: { isActive: false } }),
				models.User.findAll({
					attributes: [
						'role',
						[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total']
					],
					group: ['role'],
					order: [['role', 'ASC']]
				})
			]);

			// Convertir resultado de roles a objeto
			const roleStats = {};
			byRole.forEach(item => {
				roleStats[item.role] = parseInt(item.dataValues.total);
			});

			return {
				total,
				active,
				inactive,
				by_role: roleStats
			};
		} catch (error) {
			throw boom.internal('Error al obtener estadísticas de usuarios', error);
		}
	}

	async getRecentUsers(limite = 10) {
		try {
			const recentUsers = await models.User.findAll({
				order: [['createdAt', 'DESC']],
				limit: limite,
				attributes: ['id', 'email', 'role', 'isActive', 'createdAt']
			});

			return recentUsers;
		} catch (error) {
			throw boom.internal('Error al obtener usuarios recientes', error);
		}
	}

	// ============================================================================
	// MÉTODOS DE VALIDACIÓN
	// ============================================================================

	async validateEmailUniqueness(email, excludeId = null) {
		try {
			const whereClause = { email };
			if (excludeId) {
				whereClause.id = { [models.Sequelize.Op.ne]: excludeId };
			}

			const existingUser = await models.User.findOne({
				where: whereClause
			});

			return {
				isUnique: !existingUser,
				existingUser: existingUser ? {
					id: existingUser.id,
					email: existingUser.email
				} : null
			};
		} catch (error) {
			throw boom.internal('Error al validar unicidad del email', error);
		}
	}

	async getUserProfile(id) {
		try {
			const user = await models.User.findByPk(id, {
				attributes: { exclude: ['password'] } // Excluir password por seguridad
			});

			if (!user) {
				throw boom.notFound('Usuario no encontrado');
			}

			return user;
		} catch (error) {
			if (boom.isBoom(error)) {
				throw error;
			}
			throw boom.internal('Error al obtener perfil del usuario', error);
		}
	}
}

module.exports = UserService;