const boom = require('@hapi/boom');

class ProfesorService {
	constructor() {
		this.profesores = [];
		this.profesorEmails = [];
		this.generate();
	}

	async generate() {
		// Datos de ejemplo para desarrollo
		const profesoresEjemplo = [
			{
				id_profesor: 'PRF0000001',
				nombres: 'Ana María',
				apellidos: 'Suárez Gómez',
				tipo_id: 'CC',
				num_id: '11223344',
				correo_institucional: 'ana.suarez@universidad.edu.co',
				telefono: '3001112233',
				fecha_nacimiento: '1980-05-15',
				categoria: 'asociado',
				dedicacion: 'TC',
				departamento: 'Ingeniería de Sistemas',
			},
			{
				id_profesor: 'PRF0000002',
				nombres: 'Ricardo',
				apellidos: 'Morales Vélez',
				tipo_id: 'CC',
				num_id: '55667788',
				correo_institucional: 'ricardo.morales@universidad.edu.co',
				telefono: '3009988776',
				fecha_nacimiento: '1975-11-28',
				categoria: 'titular',
				dedicacion: 'TC',
				departamento: 'Matemáticas',
			},
			{
				id_profesor: 'PRF0000003',
				nombres: 'Claudia Patricia',
				apellidos: 'Ramírez Torres',
				tipo_id: 'CC',
				num_id: '99887766',
				correo_institucional: 'claudia.ramirez@universidad.edu.co',
				telefono: null,
				fecha_nacimiento: '1985-03-12',
				categoria: 'asistente',
				dedicacion: 'MT',
				departamento: 'Física',
			},
		];

		// Emails adicionales de ejemplo
		const emailsEjemplo = [
			{ id_profesor: 'PRF0000001', email: 'ana.suarez.personal@gmail.com' },
			{ id_profesor: 'PRF0000001', email: 'asuarez@ieee.org' },
			{ id_profesor: 'PRF0000002', email: 'rmorales@outlook.com' },
		];

		this.profesores = profesoresEjemplo;
		this.profesorEmails = emailsEjemplo;
	}

	async find() {
		return new Promise((resolve) => {
			setTimeout(() => {
				// Incluir emails adicionales en la respuesta
				const profesoresCompletos = this.profesores.map((profesor) => ({
					...profesor,
					emails_adicionales: this.profesorEmails.filter(e => e.id_profesor === profesor.id_profesor),
				}));
				resolve(profesoresCompletos);
			}, 100);
		});
	}

	async findOne(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const profesor = this.profesores.find((item) => item.id_profesor === id);
				if (!profesor) {
					reject(boom.notFound('Profesor no encontrado'));
					return;
				}

				// Incluir emails adicionales
				const profesorCompleto = {
					...profesor,
					emails_adicionales: this.profesorEmails.filter(e => e.id_profesor === id),
				};

				resolve(profesorCompleto);
			}, 100);
		});
	}

	async create(data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que no exista ya un profesor con el mismo ID
				const existingProfesor = this.profesores.find(
					(item) => item.id_profesor === data.id_profesor
				);
				if (existingProfesor) {
					reject(boom.conflict('Ya existe un profesor con ese ID'));
					return;
				}

				// Verificar que no exista un profesor con la misma combinación tipo_id + num_id
				const existingNumId = this.profesores.find(
					(item) => item.tipo_id === data.tipo_id && item.num_id === data.num_id
				);
				if (existingNumId) {
					reject(boom.conflict('Ya existe un profesor con ese tipo y número de identificación'));
					return;
				}

				const newProfesor = {
					...data,
					created_at: new Date(),
					updated_at: new Date(),
				};

				this.profesores.push(newProfesor);
				resolve(newProfesor);
			}, 100);
		});
	}

	async update(id, changes) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.profesores.findIndex((item) => item.id_profesor === id);
				if (index === -1) {
					reject(boom.notFound('Profesor no encontrado'));
					return;
				}

				// Validar unicidad de tipo_id + num_id si se están cambiando
				if (changes.tipo_id || changes.num_id) {
					const profesor = this.profesores[index];
					const nuevoTipoId = changes.tipo_id || profesor.tipo_id;
					const nuevoNumId = changes.num_id || profesor.num_id;

					const existingNumId = this.profesores.find(
						(item) =>
							item.tipo_id === nuevoTipoId &&
							item.num_id === nuevoNumId &&
							item.id_profesor !== id
					);
					if (existingNumId) {
						reject(boom.conflict('Ya existe un profesor con ese tipo y número de identificación'));
						return;
					}
				}

				const profesor = this.profesores[index];
				this.profesores[index] = {
					...profesor,
					...changes,
					updated_at: new Date(),
				};

				resolve(this.profesores[index]);
			}, 100);
		});
	}

	async delete(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.profesores.findIndex((item) => item.id_profesor === id);
				if (index === -1) {
					reject(boom.notFound('Profesor no encontrado'));
					return;
				}

				// Eliminar también emails adicionales asociados
				this.profesorEmails = this.profesorEmails.filter(e => e.id_profesor !== id);

				this.profesores.splice(index, 1);
				resolve({ id_profesor: id, message: 'Profesor eliminado exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS PARA EMAILS ADICIONALES
	// ============================================================================

	async addEmail(id, emailData) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que el profesor existe
				const profesor = this.profesores.find(item => item.id_profesor === id);
				if (!profesor) {
					reject(boom.notFound('Profesor no encontrado'));
					return;
				}

				// Verificar que no exista ya ese email para el profesor
				const existingEmail = this.profesorEmails.find(
					e => e.id_profesor === id && e.email === emailData.email
				);
				if (existingEmail) {
					reject(boom.conflict('Ya existe ese email para el profesor'));
					return;
				}

				const newEmail = {
					id_profesor: id,
					...emailData,
				};

				this.profesorEmails.push(newEmail);
				resolve(newEmail);
			}, 100);
		});
	}

	async removeEmail(id, email) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.profesorEmails.findIndex(
					e => e.id_profesor === id && e.email === email
				);
				if (index === -1) {
					reject(boom.notFound('Email no encontrado'));
					return;
				}

				this.profesorEmails.splice(index, 1);
				resolve({ message: 'Email eliminado exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const profesores = this.profesores.filter((item) =>
					item.nombres.toLowerCase().includes(nombre.toLowerCase()) ||
					item.apellidos.toLowerCase().includes(nombre.toLowerCase())
				);
				resolve(profesores);
			}, 100);
		});
	}

	async findByDepartamento(departamento) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const profesores = this.profesores.filter((item) =>
					item.departamento.toLowerCase().includes(departamento.toLowerCase())
				);
				resolve(profesores);
			}, 100);
		});
	}

	async findByCategoria(categoria) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const profesores = this.profesores.filter((item) => item.categoria === categoria);
				resolve(profesores);
			}, 100);
		});
	}

	async findByDedicacion(dedicacion) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const profesores = this.profesores.filter((item) => item.dedicacion === dedicacion);
				resolve(profesores);
			}, 100);
		});
	}

	// Método para obtener estadísticas por departamento
	async getEstadisticasPorDepartamento() {
		return new Promise((resolve) => {
			setTimeout(() => {
				const estadisticas = {};

				this.profesores.forEach(profesor => {
					const dept = profesor.departamento;
					if (!estadisticas[dept]) {
						estadisticas[dept] = {
							total: 0,
							por_categoria: {},
							por_dedicacion: {},
						};
					}

					estadisticas[dept].total++;

					// Contar por categoría
					const categoria = profesor.categoria || 'sin_categoria';
					estadisticas[dept].por_categoria[categoria] =
						(estadisticas[dept].por_categoria[categoria] || 0) + 1;

					// Contar por dedicación
					const dedicacion = profesor.dedicacion || 'sin_dedicacion';
					estadisticas[dept].por_dedicacion[dedicacion] =
						(estadisticas[dept].por_dedicacion[dedicacion] || 0) + 1;
				});

				resolve(estadisticas);
			}, 100);
		});
	}
}

module.exports = ProfesorService;
