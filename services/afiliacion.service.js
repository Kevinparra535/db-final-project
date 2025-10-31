const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

class AfiliacionService {
	constructor() {
		this.afiliaciones = [];
		this.generate();
	}

	generate() {
		const limit = 200;

		for (let index = 0; index < limit; index++) {
			const fechaInicio = faker.date.past();
			const fechaFin = faker.helpers.maybe(() => faker.date.recent(), { probability: 0.3 }); // 30% terminadas

			this.afiliaciones.push({
				id: faker.string.alphanumeric({ length: 12 }),
				investigador_id: faker.string.alphanumeric({ length: 10 }),
				grupo_investigacion_id: faker.string.alphanumeric({ length: 10 }),
				rol: faker.helpers.arrayElement(['lider', 'coinvestigador', 'semillerista', 'asistente', 'administrativo']),
				fecha_inicio: fechaInicio,
				fecha_fin: fechaFin,
				observaciones: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
				fecha_creacion: faker.date.past(),
				fecha_actualizacion: faker.date.recent()
			});
		}
	}

	async find() {
		return this.afiliaciones;
	}

	async findOne(id) {
		const afiliacion = this.afiliaciones.find(item => item.id === id);
		if (!afiliacion) {
			throw boom.notFound('Afiliación no encontrada');
		}
		return afiliacion;
	}

	async create(data) {
		// Validar que no exista una afiliación activa del mismo investigador al mismo grupo
		const afiliacionExistente = this.afiliaciones.find(a =>
			a.investigador_id === data.investigador_id &&
			a.grupo_investigacion_id === data.grupo_investigacion_id &&
			!a.fecha_fin
		);

		if (afiliacionExistente) {
			throw boom.conflict('El investigador ya tiene una afiliación activa en este grupo');
		}

		const newAfiliacion = {
			id: faker.string.alphanumeric({ length: 12 }),
			...data,
			fecha_creacion: new Date(),
			fecha_actualizacion: new Date()
		};
		this.afiliaciones.push(newAfiliacion);
		return newAfiliacion;
	}

	async update(id, changes) {
		const index = this.afiliaciones.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Afiliación no encontrada');
		}
		const afiliacion = this.afiliaciones[index];
		this.afiliaciones[index] = {
			...afiliacion,
			...changes,
			fecha_actualizacion: new Date()
		};
		return this.afiliaciones[index];
	}

	async delete(id) {
		const index = this.afiliaciones.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Afiliación no encontrada');
		}
		this.afiliaciones.splice(index, 1);
		return { id, message: 'Afiliación eliminada exitosamente' };
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByInvestigador(investigadorId) {
		return this.afiliaciones.filter(afiliacion => afiliacion.investigador_id === investigadorId);
	}

	async findByGrupo(grupoId) {
		return this.afiliaciones.filter(afiliacion => afiliacion.grupo_investigacion_id === grupoId);
	}

	async findByRol(rol) {
		return this.afiliaciones.filter(afiliacion => afiliacion.rol === rol);
	}

	async findActivas() {
		return this.afiliaciones.filter(afiliacion => !afiliacion.fecha_fin);
	}

	async findByRangoFechas(fechaInicio, fechaFin) {
		const inicio = new Date(fechaInicio);
		const fin = new Date(fechaFin);

		return this.afiliaciones.filter(afiliacion => {
			const afiliacionInicio = new Date(afiliacion.fecha_inicio);
			return afiliacionInicio >= inicio && afiliacionInicio <= fin;
		});
	}

	async findLideres() {
		return this.afiliaciones.filter(afiliacion =>
			afiliacion.rol === 'lider' && !afiliacion.fecha_fin
		);
	}

	async findCoinvestigadores() {
		return this.afiliaciones.filter(afiliacion =>
			afiliacion.rol === 'coinvestigador' && !afiliacion.fecha_fin
		);
	}

	async findSemilleristas() {
		return this.afiliaciones.filter(afiliacion =>
			afiliacion.rol === 'semillerista' && !afiliacion.fecha_fin
		);
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE AFILIACIONES
	// ============================================================================

	async finalizarAfiliacion(id, fechaFin = new Date()) {
		const index = this.afiliaciones.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Afiliación no encontrada');
		}

		if (this.afiliaciones[index].fecha_fin) {
			throw boom.conflict('La afiliación ya está finalizada');
		}

		this.afiliaciones[index].fecha_fin = fechaFin;
		this.afiliaciones[index].fecha_actualizacion = new Date();

		return {
			message: 'Afiliación finalizada exitosamente',
			afiliacion: this.afiliaciones[index]
		};
	}

	async cambiarRol(id, nuevoRol) {
		const index = this.afiliaciones.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Afiliación no encontrada');
		}

		const rolAnterior = this.afiliaciones[index].rol;
		this.afiliaciones[index].rol = nuevoRol;
		this.afiliaciones[index].fecha_actualizacion = new Date();

		return {
			message: `Rol cambiado de ${rolAnterior} a ${nuevoRol}`,
			afiliacion: this.afiliaciones[index]
		};
	}

	async transferirAfiliacion(id, nuevoGrupoId, fechaTransferencia = new Date()) {
		const afiliacion = await this.findOne(id);

		// Finalizar afiliación actual
		await this.finalizarAfiliacion(id, fechaTransferencia);

		// Crear nueva afiliación en el nuevo grupo
		const nuevaAfiliacion = await this.create({
			investigador_id: afiliacion.investigador_id,
			grupo_investigacion_id: nuevoGrupoId,
			rol: afiliacion.rol,
			fecha_inicio: fechaTransferencia,
			observaciones: `Transferido desde grupo ${afiliacion.grupo_investigacion_id}`
		});

		return {
			message: 'Afiliación transferida exitosamente',
			afiliacion_anterior: afiliacion,
			nueva_afiliacion: nuevaAfiliacion
		};
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorRol() {
		const estadisticas = {};
		this.afiliaciones.forEach(afiliacion => {
			const rol = afiliacion.rol;
			if (!estadisticas[rol]) {
				estadisticas[rol] = {
					total: 0,
					activas: 0,
					finalizadas: 0,
					duracion_promedio_dias: 0
				};
			}
			estadisticas[rol].total++;
			if (afiliacion.fecha_fin) {
				estadisticas[rol].finalizadas++;
			} else {
				estadisticas[rol].activas++;
			}
		});

		// Calcular duración promedio para afiliaciones finalizadas
		Object.keys(estadisticas).forEach(rol => {
			const afiliacionesRol = this.afiliaciones.filter(a => a.rol === rol && a.fecha_fin);
			if (afiliacionesRol.length > 0) {
				const totalDuracion = afiliacionesRol.reduce((sum, a) => {
					const duracion = new Date(a.fecha_fin) - new Date(a.fecha_inicio);
					return sum + (duracion / (1000 * 60 * 60 * 24)); // convertir a días
				}, 0);
				estadisticas[rol].duracion_promedio_dias = Math.round(totalDuracion / afiliacionesRol.length);
			}
		});

		return estadisticas;
	}

	async getEstadisticasPorGrupo() {
		const estadisticas = {};
		this.afiliaciones.forEach(afiliacion => {
			const grupoId = afiliacion.grupo_investigacion_id;
			if (!estadisticas[grupoId]) {
				estadisticas[grupoId] = {
					total_miembros: 0,
					miembros_activos: 0,
					lideres: 0,
					coinvestigadores: 0,
					semilleristas: 0,
					asistentes: 0,
					administrativos: 0
				};
			}
			estadisticas[grupoId].total_miembros++;

			if (!afiliacion.fecha_fin) {
				estadisticas[grupoId].miembros_activos++;
			}

			// Contar por rol
			switch (afiliacion.rol) {
				case 'lider':
					estadisticas[grupoId].lideres++;
					break;
				case 'coinvestigador':
					estadisticas[grupoId].coinvestigadores++;
					break;
				case 'semillerista':
					estadisticas[grupoId].semilleristas++;
					break;
				case 'asistente':
					estadisticas[grupoId].asistentes++;
					break;
				case 'administrativo':
					estadisticas[grupoId].administrativos++;
					break;
			}
		});

		return estadisticas;
	}

	async getRankingGruposPorMiembros(limite = 10) {
		const estadisticas = await this.getEstadisticasPorGrupo();

		return Object.entries(estadisticas)
			.map(([grupoId, stats]) => ({
				grupo_id: grupoId,
				total_miembros: stats.total_miembros,
				miembros_activos: stats.miembros_activos,
				diversidad_roles: [
					stats.lideres > 0 ? 'lider' : null,
					stats.coinvestigadores > 0 ? 'coinvestigador' : null,
					stats.semilleristas > 0 ? 'semillerista' : null,
					stats.asistentes > 0 ? 'asistente' : null,
					stats.administrativos > 0 ? 'administrativo' : null
				].filter(Boolean).length
			}))
			.sort((a, b) => b.miembros_activos - a.miembros_activos)
			.slice(0, limite);
	}

	async getHistorialInvestigador(investigadorId) {
		const afiliacionesInvestigador = await this.findByInvestigador(investigadorId);

		return afiliacionesInvestigador
			.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
			.map(afiliacion => ({
				...afiliacion,
				duracion_dias: afiliacion.fecha_fin ?
					Math.round((new Date(afiliacion.fecha_fin) - new Date(afiliacion.fecha_inicio)) / (1000 * 60 * 60 * 24)) :
					Math.round((new Date() - new Date(afiliacion.fecha_inicio)) / (1000 * 60 * 60 * 24)),
				estado: afiliacion.fecha_fin ? 'finalizada' : 'activa'
			}));
	}

	async getEvolucionGrupo(grupoId) {
		const afiliacionesGrupo = await this.findByGrupo(grupoId);

		// Agrupar por año
		const evolucion = {};
		afiliacionesGrupo.forEach(afiliacion => {
			const año = new Date(afiliacion.fecha_inicio).getFullYear();
			if (!evolucion[año]) {
				evolucion[año] = {
					nuevos_miembros: 0,
					miembros_salientes: 0,
					por_rol: {}
				};
			}
			evolucion[año].nuevos_miembros++;

			if (!evolucion[año].por_rol[afiliacion.rol]) {
				evolucion[año].por_rol[afiliacion.rol] = 0;
			}
			evolucion[año].por_rol[afiliacion.rol]++;

			// Contar salidas
			if (afiliacion.fecha_fin) {
				const añoSalida = new Date(afiliacion.fecha_fin).getFullYear();
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
	}
}

module.exports = AfiliacionService;
