const boom = require('@hapi/boom');

class FacultadService {
	constructor() {
		this.facultades = [];
		this.generate();
	}

	async generate() {
		// Datos de ejemplo para desarrollo
		const facultadesEjemplo = [
			{
				id_facultad: 'FAC0000001',
				nombre: 'Facultad de Ingeniería',
				decano: 'Dr. Carlos Rodríguez',
				sede: 'Campus Principal',
				ciudad: 'Bogotá',
			},
			{
				id_facultad: 'FAC0000002',
				nombre: 'Facultad de Ciencias',
				decano: 'Dra. María González',
				sede: 'Campus Norte',
				ciudad: 'Medellín',
			},
			{
				id_facultad: 'FAC0000003',
				nombre: 'Facultad de Medicina',
				decano: 'Dr. Juan Pérez',
				sede: 'Campus Salud',
				ciudad: 'Cali',
			},
			{
				id_facultad: 'FAC0000004',
				nombre: 'Facultad de Ciencias Sociales',
				decano: 'Dra. Ana López',
				sede: 'Campus Central',
				ciudad: 'Barranquilla',
			},
			{
				id_facultad: 'FAC0000005',
				nombre: 'Facultad de Artes',
				decano: 'Mtro. Luis Hernández',
				sede: 'Campus Cultural',
				ciudad: 'Cartagena',
			},
		];

		this.facultades = facultadesEjemplo;
	}

	async find() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(this.facultades);
			}, 100);
		});
	}

	async findOne(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const facultad = this.facultades.find((item) => item.id_facultad === id);
				if (!facultad) {
					reject(boom.notFound('Facultad no encontrada'));
				}
				resolve(facultad);
			}, 100);
		});
	}

	async create(data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Verificar que no exista ya una facultad con el mismo ID
				const existingFacultad = this.facultades.find(
					(item) => item.id_facultad === data.id_facultad
				);
				if (existingFacultad) {
					reject(boom.conflict('Ya existe una facultad con ese ID'));
					return;
				}

				// Verificar que no exista una facultad con el mismo nombre
				const existingNombre = this.facultades.find(
					(item) => item.nombre.toLowerCase() === data.nombre.toLowerCase()
				);
				if (existingNombre) {
					reject(boom.conflict('Ya existe una facultad con ese nombre'));
					return;
				}

				const newFacultad = {
					...data,
					created_at: new Date(),
					updated_at: new Date(),
				};

				this.facultades.push(newFacultad);
				resolve(newFacultad);
			}, 100);
		});
	}

	async update(id, changes) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.facultades.findIndex((item) => item.id_facultad === id);
				if (index === -1) {
					reject(boom.notFound('Facultad no encontrada'));
					return;
				}

				// Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
				if (changes.nombre) {
					const existingNombre = this.facultades.find(
						(item) =>
							item.nombre.toLowerCase() === changes.nombre.toLowerCase() &&
							item.id_facultad !== id
					);
					if (existingNombre) {
						reject(boom.conflict('Ya existe una facultad con ese nombre'));
						return;
					}
				}

				const facultad = this.facultades[index];
				this.facultades[index] = {
					...facultad,
					...changes,
					updated_at: new Date(),
				};

				resolve(this.facultades[index]);
			}, 100);
		});
	}

	async delete(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = this.facultades.findIndex((item) => item.id_facultad === id);
				if (index === -1) {
					reject(boom.notFound('Facultad no encontrada'));
					return;
				}

				this.facultades.splice(index, 1);
				resolve({ id_facultad: id, message: 'Facultad eliminada exitosamente' });
			}, 100);
		});
	}

	// Método para buscar por nombre
	async findByNombre(nombre) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const facultades = this.facultades.filter((item) =>
					item.nombre.toLowerCase().includes(nombre.toLowerCase())
				);
				resolve(facultades);
			}, 100);
		});
	}

	// Método para buscar por ciudad
	async findByCiudad(ciudad) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const facultades = this.facultades.filter((item) =>
					item.ciudad && item.ciudad.toLowerCase().includes(ciudad.toLowerCase())
				);
				resolve(facultades);
			}, 100);
		});
	}
}

module.exports = FacultadService;
