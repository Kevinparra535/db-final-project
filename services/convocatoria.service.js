const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

class ConvocatoriaService {
	constructor() {
		this.convocatorias = [];
		this.generate();
	}

	generate() {
		const limit = 50;

		for (let index = 0; index < limit; index++) {
			const fechaApertura = faker.date.past();
			const fechaCierre = faker.date.future();

			this.convocatorias.push({
				id: faker.string.alphanumeric({ length: 10 }),
				nombre: faker.company.name() + ' - Convocatoria de Investigación',
				descripcion: faker.lorem.paragraph(),
				tipo: faker.helpers.arrayElement(['interna', 'minciencias', 'internacional', 'otra']),
				estado: faker.helpers.arrayElement(['abierta', 'cerrada', 'en_evaluacion', 'finalizada']),
				fecha_apertura: fechaApertura,
				fecha_cierre: fechaCierre,
				presupuesto: faker.number.int({ min: 10000000, max: 500000000 }),
				requisitos: faker.lorem.sentences(3),
				entidad_financiadora: faker.company.name(),
				fecha_creacion: faker.date.past(),
				fecha_actualizacion: faker.date.recent()
			});
		}
	}

	async find() {
		return this.convocatorias;
	}

	async findOne(id) {
		const convocatoria = this.convocatorias.find(item => item.id === id);
		if (!convocatoria) {
			throw boom.notFound('Convocatoria no encontrada');
		}
		return convocatoria;
	}

	async create(data) {
		const newConvocatoria = {
			id: faker.string.alphanumeric({ length: 10 }),
			...data,
			fecha_creacion: new Date(),
			fecha_actualizacion: new Date()
		};
		this.convocatorias.push(newConvocatoria);
		return newConvocatoria;
	}

	async update(id, changes) {
		const index = this.convocatorias.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Convocatoria no encontrada');
		}
		const convocatoria = this.convocatorias[index];
		this.convocatorias[index] = {
			...convocatoria,
			...changes,
			fecha_actualizacion: new Date()
		};
		return this.convocatorias[index];
	}

	async delete(id) {
		const index = this.convocatorias.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Convocatoria no encontrada');
		}
		this.convocatorias.splice(index, 1);
		return { id, message: 'Convocatoria eliminada exitosamente' };
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByNombre(nombre) {
		return this.convocatorias.filter(convocatoria =>
			convocatoria.nombre.toLowerCase().includes(nombre.toLowerCase())
		);
	}

	async findByTipo(tipo) {
		return this.convocatorias.filter(convocatoria => convocatoria.tipo === tipo);
	}

	async findByEstado(estado) {
		return this.convocatorias.filter(convocatoria => convocatoria.estado === estado);
	}

	async findActivas() {
		const hoy = new Date();
		return this.convocatorias.filter(convocatoria =>
			convocatoria.estado === 'abierta' &&
			new Date(convocatoria.fecha_cierre) > hoy
		);
	}

	async findProximasAVencer(dias = 30) {
		const hoy = new Date();
		const fechaLimite = new Date(hoy.getTime() + (dias * 24 * 60 * 60 * 1000));

		return this.convocatorias.filter(convocatoria =>
			convocatoria.estado === 'abierta' &&
			new Date(convocatoria.fecha_cierre) <= fechaLimite &&
			new Date(convocatoria.fecha_cierre) > hoy
		);
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorTipo() {
		const estadisticas = {};
		this.convocatorias.forEach(convocatoria => {
			const tipo = convocatoria.tipo;
			if (!estadisticas[tipo]) {
				estadisticas[tipo] = {
					total: 0,
					presupuesto_total: 0,
					abiertas: 0,
					cerradas: 0
				};
			}
			estadisticas[tipo].total++;
			estadisticas[tipo].presupuesto_total += convocatoria.presupuesto;
			if (convocatoria.estado === 'abierta') {
				estadisticas[tipo].abiertas++;
			} else {
				estadisticas[tipo].cerradas++;
			}
		});
		return estadisticas;
	}

	async getEstadisticasPorEstado() {
		const estadisticas = {};
		this.convocatorias.forEach(convocatoria => {
			const estado = convocatoria.estado;
			if (!estadisticas[estado]) {
				estadisticas[estado] = {
					total: 0,
					presupuesto_promedio: 0
				};
			}
			estadisticas[estado].total++;
		});

		// Calcular presupuesto promedio por estado
		Object.keys(estadisticas).forEach(estado => {
			const convocatoriasEstado = this.convocatorias.filter(c => c.estado === estado);
			const totalPresupuesto = convocatoriasEstado.reduce((sum, c) => sum + c.presupuesto, 0);
			estadisticas[estado].presupuesto_promedio = totalPresupuesto / convocatoriasEstado.length;
		});

		return estadisticas;
	}
}

module.exports = ConvocatoriaService;
