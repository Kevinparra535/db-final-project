const boom = require('@hapi/boom');

class LineaInvestigacionService {
	constructor() {
		this.lineas = [];
		this.generate();
	}

	async generate() {
		// Datos de ejemplo para desarrollo
		const lineasEjemplo = [
			{
				id_linea: 'LIN0000001',
				nombre: 'Inteligencia Artificial y Machine Learning',
			},
			{
				id_linea: 'LIN0000002',
				nombre: 'Robótica y Automatización',
			},
			{
				id_linea: 'LIN0000003',
				nombre: 'Matemáticas Aplicadas',
			},
			{
				id_linea: 'LIN0000004',
				nombre: 'Estadística y Análisis de Datos',
			},
			{
				id_linea: 'LIN0000005',
				nombre: 'Biomedicina y Biotecnología',
			},
			{
				id_linea: 'LIN0000006',
				nombre: 'Ingeniería de Software',
			},
			{
				id_linea: 'LIN0000007',
				nombre: 'Ciencias Sociales Computacionales',
			},
			{
				id_linea: 'LIN0000008',
				nombre: 'Arte Digital y Multimedia',
			},
		];

		this.lineas = lineasEjemplo;
	}

	async find() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(this.lineas);
			}, 100);
		});
	}

	async findOne(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const linea = this.lineas.find((item) => item.id_linea === id);
				if (!linea) {
					reject(boom.notFound('Línea de investigación no encontrada'));
					return;
				}
				resolve(linea);
			}, 100);
		});
	}

	async create(data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que no exista ya una línea con el mismo ID
				const existingLinea = this.lineas.find(
					(item) => item.id_linea === data.id_linea
				);
				if (existingLinea) {
					reject(boom.conflict('Ya existe una línea de investigación con ese ID'));
					return;
				}

				// Verificar que no exista una línea con el mismo nombre
				const existingNombre = this.lineas.find(
					(item) => item.nombre.toLowerCase() === data.nombre.toLowerCase()
				);
				if (existingNombre) {
					reject(boom.conflict('Ya existe una línea de investigación con ese nombre'));
					return;
				}

				const newLinea = {
					...data,
					created_at: new Date(),
					updated_at: new Date(),
				};

				this.lineas.push(newLinea);
				resolve(newLinea);
			}, 100);
		});
	}

	async update(id, changes) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.lineas.findIndex((item) => item.id_linea === id);
				if (index === -1) {
					reject(boom.notFound('Línea de investigación no encontrada'));
					return;
				}

				// Validar unicidad del nombre si se está cambiando
				if (changes.nombre) {
					const existingNombre = this.lineas.find(
						(item) =>
							item.nombre.toLowerCase() === changes.nombre.toLowerCase() &&
							item.id_linea !== id
					);
					if (existingNombre) {
						reject(boom.conflict('Ya existe una línea de investigación con ese nombre'));
						return;
					}
				}

				const linea = this.lineas[index];
				this.lineas[index] = {
					...linea,
					...changes,
					updated_at: new Date(),
				};

				resolve(this.lineas[index]);
			}, 100);
		});
	}

	async delete(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.lineas.findIndex((item) => item.id_linea === id);
				if (index === -1) {
					reject(boom.notFound('Línea de investigación no encontrada'));
					return;
				}

				this.lineas.splice(index, 1);
				resolve({ id_linea: id, message: 'Línea de investigación eliminada exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const lineas = this.lineas.filter((item) =>
					item.nombre.toLowerCase().includes(nombre.toLowerCase())
				);
				resolve(lineas);
			}, 100);
		});
	}

	// Buscar líneas por palabras clave en el nombre
	async findByKeywords(keywords) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const keywordArray = keywords.toLowerCase().split(' ');
				const lineas = this.lineas.filter((item) => {
					const nombreLower = item.nombre.toLowerCase();
					return keywordArray.some(keyword => nombreLower.includes(keyword));
				});
				resolve(lineas);
			}, 100);
		});
	}

	// Método para obtener estadísticas básicas
	async getEstadisticas() {
		return new Promise((resolve) => {
			setTimeout(() => {
				const stats = {
					total_lineas: this.lineas.length,
					lineas_por_area: this._agruparPorArea(),
				};
				resolve(stats);
			}, 100);
		});
	}

	// Método privado para agrupar líneas por área temática
	_agruparPorArea() {
		const areas = {
			'Computación': [],
			'Matemáticas': [],
			'Medicina': [],
			'Ingeniería': [],
			'Ciencias Sociales': [],
			'Arte': [],
			'Otras': [],
		};

		this.lineas.forEach(linea => {
			const nombre = linea.nombre.toLowerCase();

			if (nombre.includes('artificial') || nombre.includes('software') || nombre.includes('datos')) {
				areas['Computación'].push(linea);
			} else if (nombre.includes('matemáticas') || nombre.includes('estadística')) {
				areas['Matemáticas'].push(linea);
			} else if (nombre.includes('biomedicina') || nombre.includes('biotecnología')) {
				areas['Medicina'].push(linea);
			} else if (nombre.includes('robótica') || nombre.includes('automatización') || nombre.includes('ingeniería')) {
				areas['Ingeniería'].push(linea);
			} else if (nombre.includes('sociales')) {
				areas['Ciencias Sociales'].push(linea);
			} else if (nombre.includes('arte') || nombre.includes('digital') || nombre.includes('multimedia')) {
				areas['Arte'].push(linea);
			} else {
				areas['Otras'].push(linea);
			}
		});

		// Convertir a formato de conteo
		Object.keys(areas).forEach(area => {
			areas[area] = {
				cantidad: areas[area].length,
				lineas: areas[area].map(l => ({ id: l.id_linea, nombre: l.nombre })),
			};
		});

		return areas;
	}
}

module.exports = LineaInvestigacionService;
