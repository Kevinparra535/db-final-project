const boom = require('@hapi/boom');

class InvestigadorService {
	constructor() {
		this.investigadores = [];
		this.investigadorEmails = [];
		this.investigadorTelefonos = [];
		this.generate();
	}

	async generate() {
		// Datos de ejemplo para desarrollo
		const investigadoresEjemplo = [
			{
				id_investigador: 'INV0000001',
				nombres: 'Carlos Alberto',
				apellidos: 'García Rodríguez',
				tipo_id: 'CC',
				num_id: '12345678',
				orcid: '0000-0002-1825-0097',
				estado: 'activo',
				fecha_registro: '2023-01-15',
			},
			{
				id_investigador: 'INV0000002',
				nombres: 'María Elena',
				apellidos: 'López Martínez',
				tipo_id: 'CC',
				num_id: '87654321',
				orcid: '0000-0003-2134-5678',
				estado: 'activo',
				fecha_registro: '2023-02-20',
			},
			{
				id_investigador: 'INV0000003',
				nombres: 'Juan David',
				apellidos: 'Hernández Silva',
				tipo_id: 'CE',
				num_id: '98765432',
				orcid: null,
				estado: 'activo',
				fecha_registro: '2023-03-10',
			},
		];

		// Emails de ejemplo
		const emailsEjemplo = [
			{ id_investigador: 'INV0000001', email: 'carlos.garcia@universidad.edu.co', etiqueta: 'institucional' },
			{ id_investigador: 'INV0000001', email: 'cgarcia@gmail.com', etiqueta: 'personal' },
			{ id_investigador: 'INV0000002', email: 'maria.lopez@universidad.edu.co', etiqueta: 'institucional' },
			{ id_investigador: 'INV0000003', email: 'juan.hernandez@universidad.edu.co', etiqueta: 'institucional' },
		];

		// Teléfonos de ejemplo
		const telefonosEjemplo = [
			{ id_investigador: 'INV0000001', numero: '3001234567', tipo: 'móvil' },
			{ id_investigador: 'INV0000001', numero: '6012345678', tipo: 'fijo' },
			{ id_investigador: 'INV0000002', numero: '3109876543', tipo: 'móvil' },
			{ id_investigador: 'INV0000003', numero: '3205551234', tipo: 'móvil' },
		];

		this.investigadores = investigadoresEjemplo;
		this.investigadorEmails = emailsEjemplo;
		this.investigadorTelefonos = telefonosEjemplo;
	}

	async find() {
		return new Promise((resolve) => {
			setTimeout(() => {
				// Incluir emails y teléfonos en la respuesta
				const investigadoresCompletos = this.investigadores.map((investigador) => ({
					...investigador,
					emails: this.investigadorEmails.filter(e => e.id_investigador === investigador.id_investigador),
					telefonos: this.investigadorTelefonos.filter(t => t.id_investigador === investigador.id_investigador),
				}));
				resolve(investigadoresCompletos);
			}, 100);
		});
	}

	async findOne(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const investigador = this.investigadores.find((item) => item.id_investigador === id);
				if (!investigador) {
					reject(boom.notFound('Investigador no encontrado'));
					return;
				}

				// Incluir emails y teléfonos
				const investigadorCompleto = {
					...investigador,
					emails: this.investigadorEmails.filter(e => e.id_investigador === id),
					telefonos: this.investigadorTelefonos.filter(t => t.id_investigador === id),
				};

				resolve(investigadorCompleto);
			}, 100);
		});
	}

	async create(data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que no exista ya un investigador con el mismo ID
				const existingInvestigador = this.investigadores.find(
					(item) => item.id_investigador === data.id_investigador
				);
				if (existingInvestigador) {
					reject(boom.conflict('Ya existe un investigador con ese ID'));
					return;
				}

				// Verificar que no exista un investigador con el mismo num_id
				if (data.num_id) {
					const existingNumId = this.investigadores.find(
						(item) => item.num_id === data.num_id
					);
					if (existingNumId) {
						reject(boom.conflict('Ya existe un investigador con ese número de identificación'));
						return;
					}
				}

				// Verificar nombres y apellidos únicos
				const existingNombre = this.investigadores.find(
					(item) =>
						item.nombres.toLowerCase() === data.nombres.toLowerCase() &&
						item.apellidos.toLowerCase() === data.apellidos.toLowerCase()
				);
				if (existingNombre) {
					reject(boom.conflict('Ya existe un investigador con ese nombre y apellidos'));
					return;
				}

				const newInvestigador = {
					...data,
					created_at: new Date(),
					updated_at: new Date(),
				};

				this.investigadores.push(newInvestigador);
				resolve(newInvestigador);
			}, 100);
		});
	}

	async update(id, changes) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.investigadores.findIndex((item) => item.id_investigador === id);
				if (index === -1) {
					reject(boom.notFound('Investigador no encontrado'));
					return;
				}

				// Validaciones de unicidad si se están cambiando los campos
				if (changes.num_id) {
					const existingNumId = this.investigadores.find(
						(item) => item.num_id === changes.num_id && item.id_investigador !== id
					);
					if (existingNumId) {
						reject(boom.conflict('Ya existe un investigador con ese número de identificación'));
						return;
					}
				}

				if (changes.nombres && changes.apellidos) {
					const existingNombre = this.investigadores.find(
						(item) =>
							item.nombres.toLowerCase() === changes.nombres.toLowerCase() &&
							item.apellidos.toLowerCase() === changes.apellidos.toLowerCase() &&
							item.id_investigador !== id
					);
					if (existingNombre) {
						reject(boom.conflict('Ya existe un investigador con ese nombre y apellidos'));
						return;
					}
				}

				const investigador = this.investigadores[index];
				this.investigadores[index] = {
					...investigador,
					...changes,
					updated_at: new Date(),
				};

				resolve(this.investigadores[index]);
			}, 100);
		});
	}

	async delete(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.investigadores.findIndex((item) => item.id_investigador === id);
				if (index === -1) {
					reject(boom.notFound('Investigador no encontrado'));
					return;
				}

				// Eliminar también emails y teléfonos asociados
				this.investigadorEmails = this.investigadorEmails.filter(e => e.id_investigador !== id);
				this.investigadorTelefonos = this.investigadorTelefonos.filter(t => t.id_investigador !== id);

				this.investigadores.splice(index, 1);
				resolve({ id_investigador: id, message: 'Investigador eliminado exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS PARA EMAILS
	// ============================================================================

	async addEmail(id, emailData) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que el investigador existe
				const investigador = this.investigadores.find(item => item.id_investigador === id);
				if (!investigador) {
					reject(boom.notFound('Investigador no encontrado'));
					return;
				}

				// Verificar que no exista ya ese email para el investigador
				const existingEmail = this.investigadorEmails.find(
					e => e.id_investigador === id && e.email === emailData.email
				);
				if (existingEmail) {
					reject(boom.conflict('Ya existe ese email para el investigador'));
					return;
				}

				const newEmail = {
					id_investigador: id,
					...emailData,
				};

				this.investigadorEmails.push(newEmail);
				resolve(newEmail);
			}, 100);
		});
	}

	async removeEmail(id, email) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.investigadorEmails.findIndex(
					e => e.id_investigador === id && e.email === email
				);
				if (index === -1) {
					reject(boom.notFound('Email no encontrado'));
					return;
				}

				this.investigadorEmails.splice(index, 1);
				resolve({ message: 'Email eliminado exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS PARA TELÉFONOS
	// ============================================================================

	async addTelefono(id, telefonoData) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que el investigador existe
				const investigador = this.investigadores.find(item => item.id_investigador === id);
				if (!investigador) {
					reject(boom.notFound('Investigador no encontrado'));
					return;
				}

				// Verificar que no exista ya ese número para el investigador
				const existingTelefono = this.investigadorTelefonos.find(
					t => t.id_investigador === id && t.numero === telefonoData.numero
				);
				if (existingTelefono) {
					reject(boom.conflict('Ya existe ese número telefónico para el investigador'));
					return;
				}

				const newTelefono = {
					id_investigador: id,
					...telefonoData,
				};

				this.investigadorTelefonos.push(newTelefono);
				resolve(newTelefono);
			}, 100);
		});
	}

	async removeTelefono(id, numero) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.investigadorTelefonos.findIndex(
					t => t.id_investigador === id && t.numero === numero
				);
				if (index === -1) {
					reject(boom.notFound('Teléfono no encontrado'));
					return;
				}

				this.investigadorTelefonos.splice(index, 1);
				resolve({ message: 'Teléfono eliminado exitosamente' });
			}, 100);
		});
	}

	// ============================================================================
	// MÉTODOS DE BÚSQUEDA
	// ============================================================================

	async findByNombre(nombre) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const investigadores = this.investigadores.filter((item) =>
					item.nombres.toLowerCase().includes(nombre.toLowerCase()) ||
					item.apellidos.toLowerCase().includes(nombre.toLowerCase())
				);
				resolve(investigadores);
			}, 100);
		});
	}

	async findByEstado(estado) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const investigadores = this.investigadores.filter((item) => item.estado === estado);
				resolve(investigadores);
			}, 100);
		});
	}

	async findByOrcid(orcid) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const investigador = this.investigadores.find((item) => item.orcid === orcid);
				resolve(investigador || null);
			}, 100);
		});
	}
}

module.exports = InvestigadorService;
