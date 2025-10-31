const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

class ProyectoInvestigacionService {
	constructor() {
		this.proyectos = [];
		this.proyectoLineas = []; // Relación many-to-many con líneas de investigación
		this.generate();
	}

	generate() {
		const limit = 80;

		for (let index = 0; index < limit; index++) {
			const fechaInicio = faker.date.past();
			const fechaFin = faker.date.future();

			this.proyectos.push({
				id: faker.string.alphanumeric({ length: 10 }),
				titulo: faker.commerce.productName() + ' Research Project',
				descripcion: faker.lorem.paragraphs(2),
				objetivo_general: faker.lorem.sentence(),
				objetivos_especificos: faker.lorem.sentences(3),
				metodologia: faker.lorem.paragraph(),
				estado: faker.helpers.arrayElement(['propuesto', 'aprobado', 'en_ejecucion', 'finalizado', 'cancelado']),
				fecha_inicio: fechaInicio,
				fecha_fin: fechaFin,
				presupuesto: faker.number.int({ min: 5000000, max: 200000000 }),
				grupo_investigacion_id: faker.string.alphanumeric({ length: 10 }),
				convocatoria_id: faker.helpers.maybe(() => faker.string.alphanumeric({ length: 10 }), { probability: 0.7 }),
				fecha_creacion: faker.date.past(),
				fecha_actualizacion: faker.date.recent()
			});
		}

		// Generar relaciones proyecto-líneas de investigación
		this.proyectos.forEach(proyecto => {
			const numLineas = faker.number.int({ min: 1, max: 3 });
			for (let i = 0; i < numLineas; i++) {
				this.proyectoLineas.push({
					id: faker.string.alphanumeric({ length: 12 }),
					proyecto_investigacion_id: proyecto.id,
					linea_investigacion_id: faker.string.alphanumeric({ length: 10 }),
					fecha_asociacion: faker.date.recent()
				});
			}
		});
	}

	async find() {
		return this.proyectos;
	}

	async findOne(id) {
		const proyecto = this.proyectos.find(item => item.id === id);
		if (!proyecto) {
			throw boom.notFound('Proyecto de investigación no encontrado');
		}
		return proyecto;
	}

	async create(data) {
		const newProyecto = {
			id: faker.string.alphanumeric({ length: 10 }),
			...data,
			fecha_creacion: new Date(),
			fecha_actualizacion: new Date()
		};
		this.proyectos.push(newProyecto);
		return newProyecto;
	}

	async update(id, changes) {
		const index = this.proyectos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Proyecto de investigación no encontrado');
		}
		const proyecto = this.proyectos[index];
		this.proyectos[index] = {
			...proyecto,
			...changes,
			fecha_actualizacion: new Date()
		};
		return this.proyectos[index];
	}

	async delete(id) {
		const index = this.proyectos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Proyecto de investigación no encontrado');
		}
		// Eliminar también las relaciones con líneas
		this.proyectoLineas = this.proyectoLineas.filter(rel => rel.proyecto_investigacion_id !== id);
		this.proyectos.splice(index, 1);
		return { id, message: 'Proyecto eliminado exitosamente' };
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByTitulo(titulo) {
		return this.proyectos.filter(proyecto =>
			proyecto.titulo.toLowerCase().includes(titulo.toLowerCase())
		);
	}

	async findByEstado(estado) {
		return this.proyectos.filter(proyecto => proyecto.estado === estado);
	}

	async findByGrupo(grupoId) {
		return this.proyectos.filter(proyecto => proyecto.grupo_investigacion_id === grupoId);
	}

	async findByConvocatoria(convocatoriaId) {
		return this.proyectos.filter(proyecto => proyecto.convocatoria_id === convocatoriaId);
	}

	async findByRangoFechas(fechaInicio, fechaFin) {
		const inicio = new Date(fechaInicio);
		const fin = new Date(fechaFin);

		return this.proyectos.filter(proyecto => {
			const proyectoInicio = new Date(proyecto.fecha_inicio);
			return proyectoInicio >= inicio && proyectoInicio <= fin;
		});
	}

	async findActivos() {
		return this.proyectos.filter(proyecto =>
			proyecto.estado === 'en_ejecucion' || proyecto.estado === 'aprobado'
		);
	}

	async findProximosAFinalizar(dias = 30) {
		const hoy = new Date();
		const fechaLimite = new Date(hoy.getTime() + (dias * 24 * 60 * 60 * 1000));

		return this.proyectos.filter(proyecto =>
			(proyecto.estado === 'en_ejecucion' || proyecto.estado === 'aprobado') &&
			new Date(proyecto.fecha_fin) <= fechaLimite &&
			new Date(proyecto.fecha_fin) > hoy
		);
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE LÍNEAS DE INVESTIGACIÓN
	// ============================================================================

	async getLineasInvestigacion(proyectoId) {
		const proyecto = await this.findOne(proyectoId);
		return this.proyectoLineas
			.filter(rel => rel.proyecto_investigacion_id === proyectoId)
			.map(rel => ({
				id: rel.linea_investigacion_id,
				fecha_asociacion: rel.fecha_asociacion
			}));
	}

	async addLineaInvestigacion(proyectoId, lineaId) {
		const proyecto = await this.findOne(proyectoId);

		// Verificar si la relación ya existe
		const existeRelacion = this.proyectoLineas.some(rel =>
			rel.proyecto_investigacion_id === proyectoId &&
			rel.linea_investigacion_id === lineaId
		);

		if (existeRelacion) {
			throw boom.conflict('La línea de investigación ya está asociada al proyecto');
		}

		const nuevaRelacion = {
			id: faker.string.alphanumeric({ length: 12 }),
			proyecto_investigacion_id: proyectoId,
			linea_investigacion_id: lineaId,
			fecha_asociacion: new Date()
		};

		this.proyectoLineas.push(nuevaRelacion);
		return { message: 'Línea de investigación agregada exitosamente', relacion: nuevaRelacion };
	}

	async removeLineaInvestigacion(proyectoId, lineaId) {
		const proyecto = await this.findOne(proyectoId);

		const index = this.proyectoLineas.findIndex(rel =>
			rel.proyecto_investigacion_id === proyectoId &&
			rel.linea_investigacion_id === lineaId
		);

		if (index === -1) {
			throw boom.notFound('Relación no encontrada');
		}

		this.proyectoLineas.splice(index, 1);
		return { message: 'Línea de investigación removida exitosamente' };
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorEstado() {
		const estadisticas = {};
		this.proyectos.forEach(proyecto => {
			const estado = proyecto.estado;
			if (!estadisticas[estado]) {
				estadisticas[estado] = {
					total: 0,
					presupuesto_promedio: 0,
					duracion_promedio_dias: 0
				};
			}
			estadisticas[estado].total++;
		});

		// Calcular promedios
		Object.keys(estadisticas).forEach(estado => {
			const proyectosEstado = this.proyectos.filter(p => p.estado === estado);
			const totalPresupuesto = proyectosEstado.reduce((sum, p) => sum + p.presupuesto, 0);
			estadisticas[estado].presupuesto_promedio = totalPresupuesto / proyectosEstado.length;

			const totalDuracion = proyectosEstado.reduce((sum, p) => {
				const duracion = new Date(p.fecha_fin) - new Date(p.fecha_inicio);
				return sum + (duracion / (1000 * 60 * 60 * 24)); // convertir a días
			}, 0);
			estadisticas[estado].duracion_promedio_dias = Math.round(totalDuracion / proyectosEstado.length);
		});

		return estadisticas;
	}

	async getEstadisticasPorGrupo() {
		const estadisticas = {};
		this.proyectos.forEach(proyecto => {
			const grupoId = proyecto.grupo_investigacion_id;
			if (!estadisticas[grupoId]) {
				estadisticas[grupoId] = {
					total_proyectos: 0,
					presupuesto_total: 0,
					activos: 0,
					finalizados: 0
				};
			}
			estadisticas[grupoId].total_proyectos++;
			estadisticas[grupoId].presupuesto_total += proyecto.presupuesto;

			if (proyecto.estado === 'en_ejecucion' || proyecto.estado === 'aprobado') {
				estadisticas[grupoId].activos++;
			} else if (proyecto.estado === 'finalizado') {
				estadisticas[grupoId].finalizados++;
			}
		});
		return estadisticas;
	}

	async getProyectosMasAntiguos(limite = 10) {
		return this.proyectos
			.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
			.slice(0, limite);
	}
}

module.exports = ProyectoInvestigacionService;
