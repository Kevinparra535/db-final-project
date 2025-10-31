const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

class ProductoInvestigacionService {
	constructor() {
		this.productos = [];
		this.generate();
	}

	generate() {
		const limit = 120;

		for (let index = 0; index < limit; index++) {
			this.productos.push({
				id: faker.string.alphanumeric({ length: 12 }),
				titulo: faker.commerce.productName() + ' Research Output',
				descripcion: faker.lorem.paragraph(),
				año_publicacion: faker.number.int({ min: 2015, max: 2024 }),
				fecha_publicacion: faker.date.between({ from: '2015-01-01', to: '2024-12-31' }),
				url: faker.internet.url(),
				doi: faker.helpers.maybe(() => `10.${faker.number.int({ min: 1000, max: 9999 })}/${faker.string.alphanumeric({ length: 8 })}`, { probability: 0.6 }),
				isbn: faker.helpers.maybe(() => faker.string.numeric(13), { probability: 0.3 }),
				proyecto_investigacion_id: faker.string.alphanumeric({ length: 10 }),
				producto_tipo_id: faker.string.alphanumeric({ length: 8 }),
				metadata: {
					revista: faker.helpers.maybe(() => faker.company.name() + ' Journal', { probability: 0.5 }),
					volumen: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 50 }), { probability: 0.4 }),
					numero: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 12 }), { probability: 0.4 }),
					paginas: faker.helpers.maybe(() => `${faker.number.int({ min: 1, max: 100 })}-${faker.number.int({ min: 101, max: 200 })}`, { probability: 0.4 }),
					editorial: faker.helpers.maybe(() => faker.company.name() + ' Publishers', { probability: 0.3 }),
					indexacion: faker.helpers.maybe(() => faker.helpers.arrayElement(['Scopus', 'Web of Science', 'SciELO', 'Publindex']), { probability: 0.6 }),
					idioma: faker.helpers.arrayElement(['español', 'ingles', 'portugues', 'frances']),
					pais_publicacion: faker.location.country(),
					palabras_clave: faker.lorem.words(5).split(' ')
				},
				fecha_creacion: faker.date.past(),
				fecha_actualizacion: faker.date.recent()
			});
		}
	}

	async find() {
		return this.productos;
	}

	async findOne(id) {
		const producto = this.productos.find(item => item.id === id);
		if (!producto) {
			throw boom.notFound('Producto de investigación no encontrado');
		}
		return producto;
	}

	async create(data) {
		const newProducto = {
			id: faker.string.alphanumeric({ length: 12 }),
			...data,
			fecha_creacion: new Date(),
			fecha_actualizacion: new Date()
		};
		this.productos.push(newProducto);
		return newProducto;
	}

	async update(id, changes) {
		const index = this.productos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Producto de investigación no encontrado');
		}
		const producto = this.productos[index];
		this.productos[index] = {
			...producto,
			...changes,
			fecha_actualizacion: new Date()
		};
		return this.productos[index];
	}

	async delete(id) {
		const index = this.productos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Producto de investigación no encontrado');
		}
		this.productos.splice(index, 1);
		return { id, message: 'Producto eliminado exitosamente' };
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByTitulo(titulo) {
		return this.productos.filter(producto =>
			producto.titulo.toLowerCase().includes(titulo.toLowerCase())
		);
	}

	async findByTipo(tipoId) {
		return this.productos.filter(producto => producto.producto_tipo_id === tipoId);
	}

	async findByProyecto(proyectoId) {
		return this.productos.filter(producto => producto.proyecto_investigacion_id === proyectoId);
	}

	async findByAñoPublicacion(año) {
		return this.productos.filter(producto => producto.año_publicacion === año);
	}

	async findByRangoAños(añoInicio, añoFin) {
		return this.productos.filter(producto =>
			producto.año_publicacion >= añoInicio && producto.año_publicacion <= añoFin
		);
	}

	async findByMetadataKeywords(keywords) {
		const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());

		return this.productos.filter(producto => {
			if (!producto.metadata || !producto.metadata.palabras_clave) return false;

			return producto.metadata.palabras_clave.some(palabra =>
				keywordList.some(keyword => palabra.toLowerCase().includes(keyword))
			);
		});
	}

	async findMasRecientes(limite = 10) {
		return this.productos
			.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
			.slice(0, limite);
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE METADATOS
	// ============================================================================

	async getMetadata(id) {
		const producto = await this.findOne(id);
		return producto.metadata || {};
	}

	async updateMetadata(id, newMetadata) {
		const index = this.productos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Producto de investigación no encontrado');
		}

		this.productos[index].metadata = {
			...this.productos[index].metadata,
			...newMetadata
		};
		this.productos[index].fecha_actualizacion = new Date();

		return this.productos[index].metadata;
	}

	async addMetadataField(id, campo, valor) {
		const index = this.productos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Producto de investigación no encontrado');
		}

		if (!this.productos[index].metadata) {
			this.productos[index].metadata = {};
		}

		this.productos[index].metadata[campo] = valor;
		this.productos[index].fecha_actualizacion = new Date();

		return {
			message: `Campo ${campo} agregado exitosamente`,
			metadata: this.productos[index].metadata
		};
	}

	async removeMetadataField(id, campo) {
		const index = this.productos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Producto de investigación no encontrado');
		}

		if (!this.productos[index].metadata || !this.productos[index].metadata[campo]) {
			throw boom.notFound(`Campo ${campo} no encontrado en metadatos`);
		}

		delete this.productos[index].metadata[campo];
		this.productos[index].fecha_actualizacion = new Date();

		return {
			message: `Campo ${campo} eliminado exitosamente`,
			metadata: this.productos[index].metadata
		};
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorTipo() {
		const estadisticas = {};
		this.productos.forEach(producto => {
			const tipoId = producto.producto_tipo_id;
			if (!estadisticas[tipoId]) {
				estadisticas[tipoId] = {
					total: 0,
					por_año: {}
				};
			}
			estadisticas[tipoId].total++;

			const año = producto.año_publicacion;
			if (!estadisticas[tipoId].por_año[año]) {
				estadisticas[tipoId].por_año[año] = 0;
			}
			estadisticas[tipoId].por_año[año]++;
		});
		return estadisticas;
	}

	async getEstadisticasPorAño() {
		const estadisticas = {};
		this.productos.forEach(producto => {
			const año = producto.año_publicacion;
			if (!estadisticas[año]) {
				estadisticas[año] = {
					total: 0,
					con_doi: 0,
					con_isbn: 0,
					indexados: 0
				};
			}
			estadisticas[año].total++;
			if (producto.doi) estadisticas[año].con_doi++;
			if (producto.isbn) estadisticas[año].con_isbn++;
			if (producto.metadata && producto.metadata.indexacion) estadisticas[año].indexados++;
		});
		return estadisticas;
	}

	async getEstadisticasPorProyecto() {
		const estadisticas = {};
		this.productos.forEach(producto => {
			const proyectoId = producto.proyecto_investigacion_id;
			if (!estadisticas[proyectoId]) {
				estadisticas[proyectoId] = {
					total_productos: 0,
					años_activos: new Set(),
					tipos_productos: new Set()
				};
			}
			estadisticas[proyectoId].total_productos++;
			estadisticas[proyectoId].años_activos.add(producto.año_publicacion);
			estadisticas[proyectoId].tipos_productos.add(producto.producto_tipo_id);
		});

		// Convertir Sets a arrays para JSON
		Object.keys(estadisticas).forEach(proyectoId => {
			estadisticas[proyectoId].años_activos = Array.from(estadisticas[proyectoId].años_activos);
			estadisticas[proyectoId].tipos_productos = Array.from(estadisticas[proyectoId].tipos_productos);
		});

		return estadisticas;
	}

	async getRankingProyectos(limite = 10) {
		const estadisticas = await this.getEstadisticasPorProyecto();

		return Object.entries(estadisticas)
			.map(([proyectoId, stats]) => ({
				proyecto_id: proyectoId,
				total_productos: stats.total_productos,
				diversidad_tipos: stats.tipos_productos.length,
				años_activos: stats.años_activos.length
			}))
			.sort((a, b) => b.total_productos - a.total_productos)
			.slice(0, limite);
	}

	async getTendenciasPublicacion() {
		const tendencias = {};
		this.productos.forEach(producto => {
			const año = producto.año_publicacion;
			if (!tendencias[año]) {
				tendencias[año] = 0;
			}
			tendencias[año]++;
		});

		// Calcular crecimiento año a año
		const años = Object.keys(tendencias).sort();
		const crecimiento = {};

		for (let i = 1; i < años.length; i++) {
			const añoActual = años[i];
			const añoAnterior = años[i - 1];
			const crecimientoAnual = ((tendencias[añoActual] - tendencias[añoAnterior]) / tendencias[añoAnterior]) * 100;
			crecimiento[añoActual] = Math.round(crecimientoAnual * 100) / 100; // Redondear a 2 decimales
		}

		return {
			produccion_por_año: tendencias,
			crecimiento_anual: crecimiento
		};
	}
}

module.exports = ProductoInvestigacionService;
