const boom = require('@hapi/boom');

class GrupoService {
	constructor() {
		this.grupos = [];
		this.grupoLineas = []; // Relación many-to-many con líneas de investigación
		this.generate();
	}

	async generate() {
		// Datos de ejemplo para desarrollo
		const gruposEjemplo = [
			{
				id_grupo: 'GRP0000001',
				nombre: 'Grupo de Inteligencia Artificial y Robótica',
				clasificacion: 'A1',
				facultad: 'FAC0000001', // Facultad de Ingeniería
			},
			{
				id_grupo: 'GRP0000002',
				nombre: 'Grupo de Investigación en Matemáticas Aplicadas',
				clasificacion: 'A',
				facultad: 'FAC0000002', // Facultad de Ciencias
			},
			{
				id_grupo: 'GRP0000003',
				nombre: 'Grupo de Biomedicina y Biotecnología',
				clasificacion: 'B',
				facultad: 'FAC0000003', // Facultad de Medicina
			},
			{
				id_grupo: 'GRP0000004',
				nombre: 'Grupo de Estudios Sociales y Culturales',
				clasificacion: 'Reconocido',
				facultad: 'FAC0000004', // Facultad de Ciencias Sociales
			},
			{
				id_grupo: 'GRP0000005',
				nombre: 'Grupo de Investigación en Artes Digitales',
				clasificacion: 'C',
				facultad: 'FAC0000005', // Facultad de Artes
			},
		];

		// Relaciones grupo-línea de ejemplo
		const grupoLineasEjemplo = [
			{ id_grupo: 'GRP0000001', id_linea: 'LIN0000001' }, // IA y Robótica
			{ id_grupo: 'GRP0000001', id_linea: 'LIN0000002' }, // Machine Learning
			{ id_grupo: 'GRP0000002', id_linea: 'LIN0000003' }, // Matemáticas Aplicadas
			{ id_grupo: 'GRP0000002', id_linea: 'LIN0000004' }, // Estadística
			{ id_grupo: 'GRP0000003', id_linea: 'LIN0000005' }, // Biomedicina
		];

		this.grupos = gruposEjemplo;
		this.grupoLineas = grupoLineasEjemplo;
	}

	async find() {
		return new Promise((resolve) => {
			setTimeout(() => {
				// Incluir líneas de investigación en la respuesta
				const gruposCompletos = this.grupos.map((grupo) => ({
					...grupo,
					lineas_investigacion: this.grupoLineas
						.filter(gl => gl.id_grupo === grupo.id_grupo)
						.map(gl => gl.id_linea),
				}));
				resolve(gruposCompletos);
			}, 100);
		});
	}

	async findOne(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const grupo = this.grupos.find((item) => item.id_grupo === id);
				if (!grupo) {
					reject(boom.notFound('Grupo de investigación no encontrado'));
					return;
				}

				// Incluir líneas de investigación
				const grupoCompleto = {
					...grupo,
					lineas_investigacion: this.grupoLineas
						.filter(gl => gl.id_grupo === id)
						.map(gl => gl.id_linea),
				};

				resolve(grupoCompleto);
			}, 100);
		});
	}

	async create(data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que no exista ya un grupo con el mismo ID
				const existingGrupo = this.grupos.find(
					(item) => item.id_grupo === data.id_grupo
				);
				if (existingGrupo) {
					reject(boom.conflict('Ya existe un grupo con ese ID'));
					return;
				}

				// Verificar que no exista un grupo con el mismo nombre
				const existingNombre = this.grupos.find(
					(item) => item.nombre.toLowerCase() === data.nombre.toLowerCase()
				);
				if (existingNombre) {
					reject(boom.conflict('Ya existe un grupo con ese nombre'));
					return;
				}

				const newGrupo = {
					...data,
					created_at: new Date(),
					updated_at: new Date(),
				};

				this.grupos.push(newGrupo);
				resolve(newGrupo);
			}, 100);
		});
	}

	async update(id, changes) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.grupos.findIndex((item) => item.id_grupo === id);
				if (index === -1) {
					reject(boom.notFound('Grupo de investigación no encontrado'));
					return;
				}

				// Validar unicidad del nombre si se está cambiando
				if (changes.nombre) {
					const existingNombre = this.grupos.find(
						(item) =>
							item.nombre.toLowerCase() === changes.nombre.toLowerCase() &&
							item.id_grupo !== id
					);
					if (existingNombre) {
						reject(boom.conflict('Ya existe un grupo con ese nombre'));
						return;
					}
				}

				const grupo = this.grupos[index];
				this.grupos[index] = {
					...grupo,
					...changes,
					updated_at: new Date(),
				};

				resolve(this.grupos[index]);
			}, 100);
		});
	}

	async delete(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.grupos.findIndex((item) => item.id_grupo === id);
				if (index === -1) {
					reject(boom.notFound('Grupo de investigación no encontrado'));
					return;
				}

				// Eliminar también las relaciones con líneas de investigación
				this.grupoLineas = this.grupoLineas.filter(gl => gl.id_grupo !== id);

				this.grupos.splice(index, 1);
				resolve({ id_grupo: id, message: 'Grupo de investigación eliminado exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS PARA LÍNEAS DE INVESTIGACIÓN
	// ============================================================================

	async addLinea(idGrupo, idLinea) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que el grupo existe
				const grupo = this.grupos.find(item => item.id_grupo === idGrupo);
				if (!grupo) {
					reject(boom.notFound('Grupo de investigación no encontrado'));
					return;
				}

				// Verificar que no exista ya la relación
				const existingRelacion = this.grupoLineas.find(
					gl => gl.id_grupo === idGrupo && gl.id_linea === idLinea
				);
				if (existingRelacion) {
					reject(boom.conflict('La línea ya está asociada al grupo'));
					return;
				}

				const newRelacion = {
					id_grupo: idGrupo,
					id_linea: idLinea,
				};

				this.grupoLineas.push(newRelacion);
				resolve(newRelacion);
			}, 100);
		});
	}

	async removeLinea(idGrupo, idLinea) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.grupoLineas.findIndex(
					gl => gl.id_grupo === idGrupo && gl.id_linea === idLinea
				);
				if (index === -1) {
					reject(boom.notFound('Relación grupo-línea no encontrada'));
					return;
				}

				this.grupoLineas.splice(index, 1);
				resolve({ message: 'Línea de investigación removida del grupo exitosamente' });
			}, 100);
		});
	}

	async getLineasByGrupo(idGrupo) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const lineas = this.grupoLineas
					.filter(gl => gl.id_grupo === idGrupo)
					.map(gl => gl.id_linea);
				resolve(lineas);
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const grupos = this.grupos.filter((item) =>
					item.nombre.toLowerCase().includes(nombre.toLowerCase())
				);
				resolve(grupos);
			}, 100);
		});
	}

	async findByFacultad(facultadId) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const grupos = this.grupos.filter((item) => item.facultad === facultadId);
				resolve(grupos);
			}, 100);
		});
	}

	async findByClasificacion(clasificacion) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const grupos = this.grupos.filter((item) => item.clasificacion === clasificacion);
				resolve(grupos);
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorFacultad() {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estadisticas = {};

				this.grupos.forEach(grupo => {
					const facultad = grupo.facultad;
					if (!estadisticas[facultad]) {
						estadisticas[facultad] = {
							total: 0,
							por_clasificacion: {},
						};
					}

					estadisticas[facultad].total++;

					// Contar por clasificación
					const clasificacion = grupo.clasificacion || 'sin_clasificacion';
					estadisticas[facultad].por_clasificacion[clasificacion] =
						(estadisticas[facultad].por_clasificacion[clasificacion] || 0) + 1;
				});

				resolve(estadisticas);
			}, 100);
		});
	}

	async getEstadisticasPorClasificacion() {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estadisticas = {};

				this.grupos.forEach(grupo => {
					const clasificacion = grupo.clasificacion || 'sin_clasificacion';
					if (!estadisticas[clasificacion]) {
						estadisticas[clasificacion] = {
							total: 0,
							grupos: [],
						};
					}

					estadisticas[clasificacion].total++;
					estadisticas[clasificacion].grupos.push({
						id: grupo.id_grupo,
						nombre: grupo.nombre,
						facultad: grupo.facultad,
					});
				});

				resolve(estadisticas);
			}, 100);
		});
	}

	// Método para obtener grupos con más líneas de investigación
	async getGruposConMasLineas(limite = 5) {
		return new Promise((resolve) => {
			setTimeout(() => {
				// Contar líneas por grupo
				const conteoLineas = {};
				this.grupoLineas.forEach(gl => {
					conteoLineas[gl.id_grupo] = (conteoLineas[gl.id_grupo] || 0) + 1;
				});

				// Ordenar grupos por cantidad de líneas
				const gruposOrdenados = this.grupos
					.map(grupo => ({
						...grupo,
						cantidad_lineas: conteoLineas[grupo.id_grupo] || 0,
					}))
					.sort((a, b) => b.cantidad_lineas - a.cantidad_lineas)
					.slice(0, limite);

				resolve(gruposOrdenados);
			}, 100);
		});
	}
}

module.exports = GrupoService;
