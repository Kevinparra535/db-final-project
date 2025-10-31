const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

class AutoriaService {
	constructor() {
		this.autorias = [];
		this.generate();
	}

	generate() {
		const limit = 300;

		for (let index = 0; index < limit; index++) {
			this.autorias.push({
				id: faker.string.alphanumeric({ length: 12 }),
				investigador_id: faker.string.alphanumeric({ length: 10 }),
				producto_investigacion_id: faker.string.alphanumeric({ length: 12 }),
				rol: faker.helpers.arrayElement(['autor', 'coautor', 'director']),
				orden_autoria: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 }), { probability: 0.8 }),
				porcentaje_participacion: faker.helpers.maybe(() => faker.number.int({ min: 10, max: 100 }), { probability: 0.6 }),
				observaciones: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
				fecha_creacion: faker.date.past(),
				fecha_actualizacion: faker.date.recent()
			});
		}
	}

	async find() {
		return this.autorias;
	}

	async findOne(id) {
		const autoria = this.autorias.find(item => item.id === id);
		if (!autoria) {
			throw boom.notFound('Autoría no encontrada');
		}
		return autoria;
	}

	async create(data) {
		// Validar que no exista una autoría duplicada del mismo investigador en el mismo producto
		const autoriaExistente = this.autorias.find(a =>
			a.investigador_id === data.investigador_id &&
			a.producto_investigacion_id === data.producto_investigacion_id &&
			a.rol === data.rol
		);

		if (autoriaExistente) {
			throw boom.conflict('Ya existe una autoría de este investigador con este rol en el producto');
		}

		const newAutoria = {
			id: faker.string.alphanumeric({ length: 12 }),
			...data,
			fecha_creacion: new Date(),
			fecha_actualizacion: new Date()
		};
		this.autorias.push(newAutoria);
		return newAutoria;
	}

	async update(id, changes) {
		const index = this.autorias.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Autoría no encontrada');
		}
		const autoria = this.autorias[index];
		this.autorias[index] = {
			...autoria,
			...changes,
			fecha_actualizacion: new Date()
		};
		return this.autorias[index];
	}

	async delete(id) {
		const index = this.autorias.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Autoría no encontrada');
		}
		this.autorias.splice(index, 1);
		return { id, message: 'Autoría eliminada exitosamente' };
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByInvestigador(investigadorId) {
		return this.autorias.filter(autoria => autoria.investigador_id === investigadorId);
	}

	async findByProducto(productoId) {
		return this.autorias.filter(autoria => autoria.producto_investigacion_id === productoId);
	}

	async findByRol(rol) {
		return this.autorias.filter(autoria => autoria.rol === rol);
	}

	async findAutoresPrincipales() {
		return this.autorias.filter(autoria => autoria.rol === 'autor');
	}

	async findCoautores() {
		return this.autorias.filter(autoria => autoria.rol === 'coautor');
	}

	async findDirectores() {
		return this.autorias.filter(autoria => autoria.rol === 'director');
	}

	async findByAño(año) {
		// Nota: En una implementación real, esto requeriría hacer JOIN con la tabla de productos
		// Por ahora simulamos filtrando por productos mock
		return this.autorias.filter(autoria => {
			// Simulación: asumir que algunos productos son del año especificado
			const esDelAño = faker.helpers.maybe(() => true, { probability: 0.3 });
			return esDelAño;
		});
	}

	// ============================================================================
	// MÉTODOS DE COLABORACIÓN
	// ============================================================================

	async findColaboraciones() {
		// Encontrar productos con múltiples autores
		const productosColaborativos = {};

		this.autorias.forEach(autoria => {
			const productoId = autoria.producto_investigacion_id;
			if (!productosColaborativos[productoId]) {
				productosColaborativos[productoId] = [];
			}
			productosColaborativos[productoId].push(autoria.investigador_id);
		});

		// Filtrar solo productos con más de un autor
		const colaboraciones = [];
		Object.entries(productosColaborativos).forEach(([productoId, investigadores]) => {
			if (investigadores.length > 1) {
				// Crear pares de colaboración
				for (let i = 0; i < investigadores.length; i++) {
					for (let j = i + 1; j < investigadores.length; j++) {
						colaboraciones.push({
							producto_id: productoId,
							investigador_1: investigadores[i],
							investigador_2: investigadores[j]
						});
					}
				}
			}
		});

		return colaboraciones;
	}

	async findColaboracionesPorInvestigador(investigadorId) {
		const colaboraciones = await this.findColaboraciones();

		return colaboraciones.filter(colaboracion =>
			colaboracion.investigador_1 === investigadorId ||
			colaboracion.investigador_2 === investigadorId
		).map(colaboracion => ({
			...colaboracion,
			colaborador: colaboracion.investigador_1 === investigadorId ?
				colaboracion.investigador_2 : colaboracion.investigador_1
		}));
	}

	async getRedColaboracion(investigadorId) {
		const colaboraciones = await this.findColaboracionesPorInvestigador(investigadorId);

		// Contar frecuencia de colaboración
		const redColaboracion = {};
		colaboraciones.forEach(colaboracion => {
			const colaborador = colaboracion.colaborador;
			if (!redColaboracion[colaborador]) {
				redColaboracion[colaborador] = {
					investigador_id: colaborador,
					productos_compartidos: 0,
					productos: []
				};
			}
			redColaboracion[colaborador].productos_compartidos++;
			redColaboracion[colaborador].productos.push(colaboracion.producto_id);
		});

		return Object.values(redColaboracion)
			.sort((a, b) => b.productos_compartidos - a.productos_compartidos);
	}

	async findProductosColaborativos() {
		const productosColaborativos = {};

		this.autorias.forEach(autoria => {
			const productoId = autoria.producto_investigacion_id;
			if (!productosColaborativos[productoId]) {
				productosColaborativos[productoId] = {
					producto_id: productoId,
					autores: [],
					total_autores: 0
				};
			}
			productosColaborativos[productoId].autores.push({
				investigador_id: autoria.investigador_id,
				rol: autoria.rol,
				orden: autoria.orden_autoria
			});
			productosColaborativos[productoId].total_autores++;
		});

		// Filtrar solo productos con múltiples autores y ordenar por total de autores
		return Object.values(productosColaborativos)
			.filter(producto => producto.total_autores > 1)
			.sort((a, b) => b.total_autores - a.total_autores);
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE AUTORÍAS
	// ============================================================================

	async cambiarRol(id, nuevoRol) {
		const index = this.autorias.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Autoría no encontrada');
		}

		const rolAnterior = this.autorias[index].rol;
		this.autorias[index].rol = nuevoRol;
		this.autorias[index].fecha_actualizacion = new Date();

		return {
			message: `Rol cambiado de ${rolAnterior} a ${nuevoRol}`,
			autoria: this.autorias[index]
		};
	}

	async transferirAutoria(id, nuevoInvestigadorId) {
		const index = this.autorias.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Autoría no encontrada');
		}

		const investigadorAnterior = this.autorias[index].investigador_id;
		this.autorias[index].investigador_id = nuevoInvestigadorId;
		this.autorias[index].fecha_actualizacion = new Date();

		return {
			message: `Autoría transferida del investigador ${investigadorAnterior} al ${nuevoInvestigadorId}`,
			autoria: this.autorias[index]
		};
	}

	async duplicarAutoria(id, nuevoRol) {
		const autoriaOriginal = await this.findOne(id);

		const nuevaAutoria = await this.create({
			investigador_id: autoriaOriginal.investigador_id,
			producto_investigacion_id: autoriaOriginal.producto_investigacion_id,
			rol: nuevoRol,
			orden_autoria: autoriaOriginal.orden_autoria,
			porcentaje_participacion: autoriaOriginal.porcentaje_participacion,
			observaciones: `Duplicada desde autoría ${id} con rol ${autoriaOriginal.rol}`
		});

		return {
			message: `Autoría duplicada con nuevo rol ${nuevoRol}`,
			autoria_original: autoriaOriginal,
			nueva_autoria: nuevaAutoria
		};
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorRol() {
		const estadisticas = {};
		this.autorias.forEach(autoria => {
			const rol = autoria.rol;
			if (!estadisticas[rol]) {
				estadisticas[rol] = {
					total: 0,
					investigadores_unicos: new Set(),
					productos_unicos: new Set()
				};
			}
			estadisticas[rol].total++;
			estadisticas[rol].investigadores_unicos.add(autoria.investigador_id);
			estadisticas[rol].productos_unicos.add(autoria.producto_investigacion_id);
		});

		// Convertir Sets a números
		Object.keys(estadisticas).forEach(rol => {
			estadisticas[rol].investigadores_unicos = estadisticas[rol].investigadores_unicos.size;
			estadisticas[rol].productos_unicos = estadisticas[rol].productos_unicos.size;
		});

		return estadisticas;
	}

	async getEstadisticasProductividad() {
		const productividad = {};

		this.autorias.forEach(autoria => {
			const investigadorId = autoria.investigador_id;
			if (!productividad[investigadorId]) {
				productividad[investigadorId] = {
					investigador_id: investigadorId,
					total_productos: 0,
					como_autor: 0,
					como_coautor: 0,
					como_director: 0,
					productos: new Set()
				};
			}

			productividad[investigadorId].productos.add(autoria.producto_investigacion_id);

			switch (autoria.rol) {
				case 'autor':
					productividad[investigadorId].como_autor++;
					break;
				case 'coautor':
					productividad[investigadorId].como_coautor++;
					break;
				case 'director':
					productividad[investigadorId].como_director++;
					break;
			}
		});

		// Calcular total de productos únicos por investigador
		Object.keys(productividad).forEach(investigadorId => {
			productividad[investigadorId].total_productos = productividad[investigadorId].productos.size;
			delete productividad[investigadorId].productos; // No necesario en el resultado final
		});

		return productividad;
	}

	async getRankingProductividad(limite = 10) {
		const productividad = await this.getEstadisticasProductividad();

		return Object.values(productividad)
			.sort((a, b) => b.total_productos - a.total_productos)
			.slice(0, limite);
	}

	async getRankingColaboradores(limite = 10) {
		const colaboraciones = await this.findColaboraciones();
		const conteoColaboraciones = {};

		colaboraciones.forEach(colaboracion => {
			[colaboracion.investigador_1, colaboracion.investigador_2].forEach(investigadorId => {
				if (!conteoColaboraciones[investigadorId]) {
					conteoColaboraciones[investigadorId] = {
						investigador_id: investigadorId,
						total_colaboraciones: 0,
						colaboradores_unicos: new Set()
					};
				}
				conteoColaboraciones[investigadorId].total_colaboraciones++;

				// Agregar el otro investigador como colaborador
				const otroInvestigador = investigadorId === colaboracion.investigador_1 ?
					colaboracion.investigador_2 : colaboracion.investigador_1;
				conteoColaboraciones[investigadorId].colaboradores_unicos.add(otroInvestigador);
			});
		});

		// Convertir Sets a números
		Object.keys(conteoColaboraciones).forEach(investigadorId => {
			conteoColaboraciones[investigadorId].colaboradores_unicos =
				conteoColaboraciones[investigadorId].colaboradores_unicos.size;
		});

		return Object.values(conteoColaboraciones)
			.sort((a, b) => b.total_colaboraciones - a.total_colaboraciones)
			.slice(0, limite);
	}

	async getTendenciasColaboracion() {
		// Simulación de tendencias por año
		const tendencias = {};

		// Generar datos de ejemplo para los últimos 5 años
		for (let año = 2020; año <= 2024; año++) {
			const autoriasPorAño = this.autorias.filter(() =>
				faker.helpers.maybe(() => true, { probability: 0.2 }) // Simular distribución por años
			);

			const productosColaborativos = {};
			autoriasPorAño.forEach(autoria => {
				const productoId = autoria.producto_investigacion_id;
				if (!productosColaborativos[productoId]) {
					productosColaborativos[productoId] = 0;
				}
				productosColaborativos[productoId]++;
			});

			const colaborativos = Object.values(productosColaborativos).filter(count => count > 1).length;
			const individuales = Object.values(productosColaborativos).filter(count => count === 1).length;

			tendencias[año] = {
				productos_colaborativos: colaborativos,
				productos_individuales: individuales,
				porcentaje_colaboracion: colaborativos + individuales > 0 ?
					Math.round((colaborativos / (colaborativos + individuales)) * 100) : 0
			};
		}

		return tendencias;
	}
}

module.exports = AutoriaService;
