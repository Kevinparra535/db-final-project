const boom = require('@hapi/boom');

class EstudianteService {
	constructor() {
		this.estudiantes = [];
		this.generate();
	}

	async generate() {
		// Datos de ejemplo para desarrollo
		const estudiantesEjemplo = [
			{
				id_estudiante: 'EST0000001',
				nombres: 'Laura',
				apellidos: 'Gómez Pérez',
				tipo_id: 'CC',
				num_id: '1001234567',
				codigo_estudiantil: 'EST202300001',
				programa: 'Maestría en Ingeniería de Sistemas',
				nivel: 'maestría',
				semestre: 3,
				correo_institucional: 'laura.gomez@estudiantes.universidad.edu.co',
			},
			{
				id_estudiante: 'EST0000002',
				nombres: 'Diego',
				apellidos: 'Martínez López',
				tipo_id: 'CC',
				num_id: '1009876543',
				codigo_estudiantil: 'EST202300002',
				programa: 'Doctorado en Matemáticas',
				nivel: 'doctorado',
				semestre: 6,
				correo_institucional: 'diego.martinez@estudiantes.universidad.edu.co',
			},
			{
				id_estudiante: 'EST0000003',
				nombres: 'Sofía',
				apellidos: 'Hernández Ruiz',
				tipo_id: 'TI',
				num_id: '1098765432',
				codigo_estudiantil: 'EST202300003',
				programa: 'Maestría en Física',
				nivel: 'maestría',
				semestre: 2,
				correo_institucional: 'sofia.hernandez@estudiantes.universidad.edu.co',
			},
			{
				id_estudiante: 'EST0000004',
				nombres: 'Andrés Felipe',
				apellidos: 'Vargas Castro',
				tipo_id: 'CC',
				num_id: '1087654321',
				codigo_estudiantil: 'EST202300004',
				programa: 'Especialización en Gerencia de Proyectos',
				nivel: 'pregrado', // Especialización se considera pregrado en este contexto
				semestre: 1,
				correo_institucional: 'andres.vargas@estudiantes.universidad.edu.co',
			},
		];

		this.estudiantes = estudiantesEjemplo;
	}

	async find() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(this.estudiantes);
			}, 100);
		});
	}

	async findOne(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const estudiante = this.estudiantes.find((item) => item.id_estudiante === id);
				if (!estudiante) {
					reject(boom.notFound('Estudiante no encontrado'));
					return;
				}
				resolve(estudiante);
			}, 100);
		});
	}

	async create(data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que no exista ya un estudiante con el mismo ID
				const existingEstudiante = this.estudiantes.find(
					(item) => item.id_estudiante === data.id_estudiante
				);
				if (existingEstudiante) {
					reject(boom.conflict('Ya existe un estudiante con ese ID'));
					return;
				}

				// Verificar que no exista un estudiante con el mismo num_id
				if (data.num_id) {
					const existingNumId = this.estudiantes.find(
						(item) => item.num_id === data.num_id
					);
					if (existingNumId) {
						reject(boom.conflict('Ya existe un estudiante con ese número de identificación'));
						return;
					}
				}

				// Verificar que no exista un estudiante con el mismo código estudiantil
				if (data.codigo_estudiantil) {
					const existingCodigo = this.estudiantes.find(
						(item) => item.codigo_estudiantil === data.codigo_estudiantil
					);
					if (existingCodigo) {
						reject(boom.conflict('Ya existe un estudiante con ese código estudiantil'));
						return;
					}
				}

				// Verificar que no exista un estudiante con el mismo correo institucional
				const existingCorreo = this.estudiantes.find(
					(item) => item.correo_institucional === data.correo_institucional
				);
				if (existingCorreo) {
					reject(boom.conflict('Ya existe un estudiante con ese correo institucional'));
					return;
				}

				const newEstudiante = {
					...data,
					created_at: new Date(),
					updated_at: new Date(),
				};

				this.estudiantes.push(newEstudiante);
				resolve(newEstudiante);
			}, 100);
		});
	}

	async update(id, changes) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.estudiantes.findIndex((item) => item.id_estudiante === id);
				if (index === -1) {
					reject(boom.notFound('Estudiante no encontrado'));
					return;
				}

				// Validaciones de unicidad si se están cambiando los campos
				if (changes.num_id) {
					const existingNumId = this.estudiantes.find(
						(item) => item.num_id === changes.num_id && item.id_estudiante !== id
					);
					if (existingNumId) {
						reject(boom.conflict('Ya existe un estudiante con ese número de identificación'));
						return;
					}
				}

				if (changes.codigo_estudiantil) {
					const existingCodigo = this.estudiantes.find(
						(item) =>
							item.codigo_estudiantil === changes.codigo_estudiantil &&
							item.id_estudiante !== id
					);
					if (existingCodigo) {
						reject(boom.conflict('Ya existe un estudiante con ese código estudiantil'));
						return;
					}
				}

				if (changes.correo_institucional) {
					const existingCorreo = this.estudiantes.find(
						(item) =>
							item.correo_institucional === changes.correo_institucional &&
							item.id_estudiante !== id
					);
					if (existingCorreo) {
						reject(boom.conflict('Ya existe un estudiante con ese correo institucional'));
						return;
					}
				}

				const estudiante = this.estudiantes[index];
				this.estudiantes[index] = {
					...estudiante,
					...changes,
					updated_at: new Date(),
				};

				resolve(this.estudiantes[index]);
			}, 100);
		});
	}

	async delete(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.estudiantes.findIndex((item) => item.id_estudiante === id);
				if (index === -1) {
					reject(boom.notFound('Estudiante no encontrado'));
					return;
				}

				this.estudiantes.splice(index, 1);
				resolve({ id_estudiante: id, message: 'Estudiante eliminado exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estudiantes = this.estudiantes.filter((item) =>
					item.nombres.toLowerCase().includes(nombre.toLowerCase()) ||
					item.apellidos.toLowerCase().includes(nombre.toLowerCase())
				);
				resolve(estudiantes);
			}, 100);
		});
	}

	async findByPrograma(programa) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estudiantes = this.estudiantes.filter((item) =>
					item.programa && item.programa.toLowerCase().includes(programa.toLowerCase())
				);
				resolve(estudiantes);
			}, 100);
		});
	}

	async findByNivel(nivel) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estudiantes = this.estudiantes.filter((item) => item.nivel === nivel);
				resolve(estudiantes);
			}, 100);
		});
	}

	async findBySemestre(semestre) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estudiantes = this.estudiantes.filter((item) => item.semestre === parseInt(semestre));
				resolve(estudiantes);
			}, 100);
		});
	}

	async findByCodigoEstudiantil(codigo) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estudiante = this.estudiantes.find((item) => item.codigo_estudiantil === codigo);
				resolve(estudiante || null);
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS DE ESTADÍSTICAS
	// ============================================================================

	async getEstadisticasPorNivel() {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estadisticas = {};

				this.estudiantes.forEach(estudiante => {
					const nivel = estudiante.nivel;
					if (!estadisticas[nivel]) {
						estadisticas[nivel] = {
							total: 0,
							por_semestre: {},
						};
					}

					estadisticas[nivel].total++;

					// Contar por semestre si existe
					if (estudiante.semestre) {
						const semestre = estudiante.semestre;
						estadisticas[nivel].por_semestre[semestre] =
							(estadisticas[nivel].por_semestre[semestre] || 0) + 1;
					}
				});

				resolve(estadisticas);
			}, 100);
		});
	}

	async getEstadisticasPorPrograma() {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estadisticas = {};

				this.estudiantes.forEach(estudiante => {
					const programa = estudiante.programa || 'Sin programa';
					if (!estadisticas[programa]) {
						estadisticas[programa] = {
							total: 0,
							por_nivel: {},
							por_semestre: {},
						};
					}

					estadisticas[programa].total++;

					// Contar por nivel
					const nivel = estudiante.nivel;
					estadisticas[programa].por_nivel[nivel] =
						(estadisticas[programa].por_nivel[nivel] || 0) + 1;

					// Contar por semestre si existe
					if (estudiante.semestre) {
						const semestre = estudiante.semestre;
						estadisticas[programa].por_semestre[semestre] =
							(estadisticas[programa].por_semestre[semestre] || 0) + 1;
					}
				});

				resolve(estadisticas);
			}, 100);
		});
	}

	// Método para buscar estudiantes por rango de semestre
	async findByRangoSemestre(semestreMin, semestreMax) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estudiantes = this.estudiantes.filter((item) => {
					if (!item.semestre) return false;
					return item.semestre >= semestreMin && item.semestre <= semestreMax;
				});
				resolve(estudiantes);
			}, 100);
		});
	}
}

module.exports = EstudianteService;
