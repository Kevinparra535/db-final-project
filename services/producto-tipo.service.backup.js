const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

class ProductoTipoService {
	constructor() {
		this.tipos = [];
		this.generate();
	}

	generate() {
		const tiposComunes = [
			{ nombre: 'Artículo de revista', categoria: 'publicacion_cientifica', descripcion: 'Artículo publicado en revista científica indexada' },
			{ nombre: 'Libro de investigación', categoria: 'publicacion_cientifica', descripcion: 'Libro resultado de investigación' },
			{ nombre: 'Capítulo de libro', categoria: 'publicacion_cientifica', descripcion: 'Capítulo en libro de investigación' },
			{ nombre: 'Ponencia en congreso', categoria: 'evento_cientifico', descripcion: 'Presentación en evento científico' },
			{ nombre: 'Poster científico', categoria: 'evento_cientifico', descripcion: 'Poster presentado en evento científico' },
			{ nombre: 'Tesis doctoral', categoria: 'formacion', descripcion: 'Trabajo de grado doctoral' },
			{ nombre: 'Tesis de maestría', categoria: 'formacion', descripcion: 'Trabajo de grado de maestría' },
			{ nombre: 'Trabajo de pregrado', categoria: 'formacion', descripcion: 'Trabajo de grado de pregrado' },
			{ nombre: 'Patente', categoria: 'propiedad_intelectual', descripcion: 'Registro de patente de invención' },
			{ nombre: 'Software', categoria: 'desarrollo_tecnologico', descripcion: 'Desarrollo de software científico' },
			{ nombre: 'Prototipo', categoria: 'desarrollo_tecnologico', descripcion: 'Prototipo tecnológico' },
			{ nombre: 'Informe técnico', categoria: 'consultoria', descripcion: 'Informe de consultoría técnica' },
			{ nombre: 'Manual técnico', categoria: 'consultoria', descripcion: 'Manual o guía técnica' },
			{ nombre: 'Base de datos', categoria: 'desarrollo_tecnologico', descripcion: 'Base de datos científica' },
			{ nombre: 'Video educativo', categoria: 'divulgacion', descripcion: 'Material audiovisual educativo' }
		];

		tiposComunes.forEach(tipo => {
			this.tipos.push({
				id: faker.string.alphanumeric({ length: 8 }),
				nombre: tipo.nombre,
				descripcion: tipo.descripcion,
				categoria: tipo.categoria,
				activo: true,
				requiere_doi: tipo.categoria === 'publicacion_cientifica',
				requiere_isbn: tipo.nombre.includes('Libro'),
				fecha_creacion: faker.date.past(),
				fecha_actualizacion: faker.date.recent()
			});
		});

		// Agregar algunos tipos adicionales
		const limit = 5;
		for (let index = 0; index < limit; index++) {
			this.tipos.push({
				id: faker.string.alphanumeric({ length: 8 }),
				nombre: faker.commerce.productName(),
				descripcion: faker.lorem.sentence(),
				categoria: faker.helpers.arrayElement([
					'publicacion_cientifica',
					'evento_cientifico',
					'formacion',
					'propiedad_intelectual',
					'desarrollo_tecnologico',
					'consultoria',
					'divulgacion'
				]),
				activo: faker.datatype.boolean(),
				requiere_doi: faker.datatype.boolean(),
				requiere_isbn: faker.datatype.boolean(),
				fecha_creacion: faker.date.past(),
				fecha_actualizacion: faker.date.recent()
			});
		}
	}

	async find() {
		return this.tipos;
	}

	async findOne(id) {
		const tipo = this.tipos.find(item => item.id === id);
		if (!tipo) {
			throw boom.notFound('Tipo de producto no encontrado');
		}
		return tipo;
	}

	async create(data) {
		const newTipo = {
			id: faker.string.alphanumeric({ length: 8 }),
			...data,
			fecha_creacion: new Date(),
			fecha_actualizacion: new Date()
		};
		this.tipos.push(newTipo);
		return newTipo;
	}

	async update(id, changes) {
		const index = this.tipos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Tipo de producto no encontrado');
		}
		const tipo = this.tipos[index];
		this.tipos[index] = {
			...tipo,
			...changes,
			fecha_actualizacion: new Date()
		};
		return this.tipos[index];
	}

	async delete(id) {
		const index = this.tipos.findIndex(item => item.id === id);
		if (index === -1) {
			throw boom.notFound('Tipo de producto no encontrado');
		}
		this.tipos.splice(index, 1);
		return { id, message: 'Tipo de producto eliminado exitosamente' };
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA ESPECÍFICOS
	// ============================================================================

	async findByNombre(nombre) {
		return this.tipos.filter(tipo =>
			tipo.nombre.toLowerCase().includes(nombre.toLowerCase())
		);
	}

	async findByCategoria(categoria) {
		return this.tipos.filter(tipo => tipo.categoria === categoria);
	}

	async findActivos() {
		return this.tipos.filter(tipo => tipo.activo === true);
	}

	// ============================================================================
	// MÉTODOS DE GESTIÓN DE PRODUCTOS
	// ============================================================================

	async getProductosPorTipo(tipoId) {
		// En una implementación real, esto haría una consulta a la tabla de productos
		// Por ahora simulamos con datos mock
		const tipo = await this.findOne(tipoId);

		// Simulación: generar algunos productos de ejemplo para este tipo
		const productos = [];
		const numProductos = faker.number.int({ min: 5, max: 20 });

		for (let i = 0; i < numProductos; i++) {
			productos.push({
				id: faker.string.alphanumeric({ length: 12 }),
				titulo: faker.commerce.productName(),
				año_publicacion: faker.number.int({ min: 2015, max: 2024 }),
				tipo_id: tipoId,
				tipo_nombre: tipo.nombre
			});
		}

		return productos;
	}

	async getEstadisticasProductosPorTipo(tipoId) {
		const productos = await this.getProductosPorTipo(tipoId);

		const estadisticas = {
			total_productos: productos.length,
			por_año: {},
			año_mas_productivo: null,
			tendencia: null
		};

		// Agrupar por año
		productos.forEach(producto => {
			const año = producto.año_publicacion;
			if (!estadisticas.por_año[año]) {
				estadisticas.por_año[año] = 0;
			}
			estadisticas.por_año[año]++;
		});

		// Encontrar año más productivo
		let maxProductos = 0;
		Object.entries(estadisticas.por_año).forEach(([año, cantidad]) => {
			if (cantidad > maxProductos) {
				maxProductos = cantidad;
				estadisticas.año_mas_productivo = { año: parseInt(año), productos: cantidad };
			}
		});

		// Calcular tendencia simple (comparar últimos 2 años)
		const años = Object.keys(estadisticas.por_año).map(a => parseInt(a)).sort();
		if (años.length >= 2) {
			const ultimoAño = años[años.length - 1];
			const penultimoAño = años[años.length - 2];
			const cambio = estadisticas.por_año[ultimoAño] - estadisticas.por_año[penultimoAño];
			estadisticas.tendencia = cambio > 0 ? 'creciente' : cambio < 0 ? 'decreciente' : 'estable';
		}

		return estadisticas;
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS GENERALES
	// ============================================================================

	async getEstadisticasUso() {
		// Simulación de estadísticas de uso de tipos
		const estadisticas = {};

		this.tipos.forEach(tipo => {
			const usoSimulado = faker.number.int({ min: 0, max: 100 });
			estadisticas[tipo.id] = {
				tipo_nombre: tipo.nombre,
				categoria: tipo.categoria,
				total_usos: usoSimulado,
				activo: tipo.activo
			};
		});

		return estadisticas;
	}

	async getTiposMasUtilizados(limite = 10) {
		const estadisticasUso = await this.getEstadisticasUso();

		return Object.entries(estadisticasUso)
			.map(([tipoId, stats]) => ({
				tipo_id: tipoId,
				nombre: stats.tipo_nombre,
				categoria: stats.categoria,
				total_usos: stats.total_usos,
				activo: stats.activo
			}))
			.sort((a, b) => b.total_usos - a.total_usos)
			.slice(0, limite);
	}

	// ============================================================================
	// MÉTODOS AUXILIARES
	// ============================================================================

	async getCategorias() {
		const categorias = [...new Set(this.tipos.map(tipo => tipo.categoria))];
		return categorias.map(categoria => ({
			categoria,
			total_tipos: this.tipos.filter(t => t.categoria === categoria).length,
			tipos_activos: this.tipos.filter(t => t.categoria === categoria && t.activo).length
		}));
	}

	async validateTipoForProduct(tipoId, productData) {
		const tipo = await this.findOne(tipoId);

		const validaciones = {
			valido: true,
			errores: [],
			advertencias: []
		};

		// Validar DOI requerido
		if (tipo.requiere_doi && !productData.doi) {
			validaciones.errores.push(`El tipo "${tipo.nombre}" requiere DOI`);
			validaciones.valido = false;
		}

		// Validar ISBN requerido
		if (tipo.requiere_isbn && !productData.isbn) {
			validaciones.errores.push(`El tipo "${tipo.nombre}" requiere ISBN`);
			validaciones.valido = false;
		}

		// Validar que el tipo esté activo
		if (!tipo.activo) {
			validaciones.advertencias.push(`El tipo "${tipo.nombre}" está inactivo`);
		}

		return validaciones;
	}
}

module.exports = ProductoTipoService;
