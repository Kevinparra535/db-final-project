const { models } = require('../libs/sequelize');

async function seedDatabase() {
	console.log('🌱 Iniciando población de base de datos...');

	try {
		// Crear facultades
		console.log('📚 Creando facultades...');
		const facultades = await models.Facultad.bulkCreate([
			{
				id: 'FAC0000001',
				nombre: 'Facultad de Ingeniería',
				decano: 'Dr. Carlos Rodríguez',
				sede: 'Campus Principal',
				ciudad: 'Bogotá'
			},
			{
				id: 'FAC0000002',
				nombre: 'Facultad de Ciencias',
				decano: 'Dra. María González',
				sede: 'Campus Norte',
				ciudad: 'Medellín'
			},
			{
				id: 'FAC0000003',
				nombre: 'Facultad de Medicina',
				decano: 'Dr. Juan Pérez',
				sede: 'Campus Salud',
				ciudad: 'Cali'
			}
		], { ignoreDuplicates: true });

		// Crear líneas de investigación
		console.log('🔬 Creando líneas de investigación...');
		const lineas = await models.LineaInvestigacion.bulkCreate([
			{
				id: 'LIN0000001',
				nombre: 'Inteligencia Artificial',
				descripcion: 'Investigación en machine learning, deep learning y IA aplicada'
			},
			{
				id: 'LIN0000002',
				nombre: 'Desarrollo de Software',
				descripcion: 'Metodologías ágiles, arquitectura de software y DevOps'
			},
			{
				id: 'LIN0000003',
				nombre: 'Biotecnología',
				descripcion: 'Aplicaciones de biotecnología en medicina y agricultura'
			},
			{
				id: 'LIN0000004',
				nombre: 'Energías Renovables',
				descripcion: 'Investigación en energía solar, eólica y biomasa'
			}
		], { ignoreDuplicates: true });

		// Crear tipos de producto
		console.log('📄 Creando tipos de producto...');
		const tiposProducto = await models.ProductoTipo.bulkCreate([
			{
				id: 'ART0000001',
				nombre: 'Artículo de revista',
				descripcion: 'Artículo publicado en revista científica indexada',
				categoria: 'Publicación científica',
				requiereDoi: true,
				requiereIsbn: false
			},
			{
				id: 'LIB0000001',
				nombre: 'Libro',
				descripcion: 'Libro de investigación o texto académico',
				categoria: 'Publicación científica',
				requiereDoi: false,
				requiereIsbn: true
			},
			{
				id: 'PON0000001',
				nombre: 'Ponencia',
				descripcion: 'Presentación en evento científico',
				categoria: 'Evento científico',
				requiereDoi: false,
				requiereIsbn: false
			}
		], { ignoreDuplicates: true });

		// Crear investigadores
		console.log('👥 Creando investigadores...');
		const investigadores = await models.Investigador.bulkCreate([
			{
				id: 'INV0000001',
				nombres: 'Carlos Alberto',
				apellidos: 'García Rodríguez',
				tipoId: 'CC',
				numId: '12345678',
				orcid: '0000-0002-1825-0097',
				estado: 'activo',
				fechaRegistro: '2023-01-15'
			},
			{
				id: 'INV0000002',
				nombres: 'María Elena',
				apellidos: 'López Martínez',
				tipoId: 'CC',
				numId: '87654321',
				orcid: '0000-0003-2134-5678',
				estado: 'activo',
				fechaRegistro: '2023-02-20'
			},
			{
				id: 'INV0000003',
				nombres: 'Juan David',
				apellidos: 'Hernández Silva',
				tipoId: 'CE',
				numId: '98765432',
				orcid: null,
				estado: 'activo',
				fechaRegistro: '2023-03-10'
			}
		], { ignoreDuplicates: true });

		// Crear emails de investigadores
		console.log('📧 Creando emails de investigadores...');
		await models.InvestigadorCorreo.bulkCreate([
			{
				idInvestigador: 'INV0000001',
				email: 'carlos.garcia@universidad.edu.co',
				etiqueta: 'institucional'
			},
			{
				idInvestigador: 'INV0000001',
				email: 'cgarcia@gmail.com',
				etiqueta: 'personal'
			},
			{
				idInvestigador: 'INV0000002',
				email: 'maria.lopez@universidad.edu.co',
				etiqueta: 'institucional'
			},
			{
				idInvestigador: 'INV0000003',
				email: 'juan.hernandez@universidad.edu.co',
				etiqueta: 'institucional'
			}
		], { ignoreDuplicates: true });

		// Crear teléfonos de investigadores
		console.log('📱 Creando teléfonos de investigadores...');
		await models.InvestigadorTelefono.bulkCreate([
			{
				idInvestigador: 'INV0000001',
				numero: '3001234567',
				tipo: 'móvil'
			},
			{
				idInvestigador: 'INV0000001',
				numero: '6012345678',
				tipo: 'fijo'
			},
			{
				idInvestigador: 'INV0000002',
				numero: '3109876543',
				tipo: 'móvil'
			}
		], { ignoreDuplicates: true });

		// Crear grupos de investigación
		console.log('🏛️ Creando grupos de investigación...');
		const grupos = await models.GrupoInvestigacion.bulkCreate([
			{
				id: 'GRP0000001',
				nombre: 'Grupo de Inteligencia Artificial',
				clasificacion: 'A1',
				facultad: 'FAC0000001',
				descripcion: 'Grupo dedicado a la investigación en IA y machine learning'
			},
			{
				id: 'GRP0000002',
				nombre: 'Grupo de Biotecnología Aplicada',
				clasificacion: 'A',
				facultad: 'FAC0000002',
				descripcion: 'Investigación en biotecnología para aplicaciones médicas'
			}
		], { ignoreDuplicates: true });

		// Crear convocatorias
		console.log('📢 Creando convocatorias...');
		const convocatorias = await models.Convocatoria.bulkCreate([
			{
				id: 'CONV000001',
				nombre: 'Convocatoria Nacional de Investigación 2024',
				tipo: 'Minciencias',
				entidad: 'Minciencias',
				anio: 2024,
				fechaApertura: '2024-01-15',
				fechaCierre: '2024-06-30',
				montoMaximo: 500000000,
				descripcion: 'Convocatoria para financiar proyectos de investigación básica y aplicada'
			}
		], { ignoreDuplicates: true });

		console.log('✅ Base de datos poblada exitosamente!');
		console.log(`📊 Creados:
		- ${facultades.length} facultades
		- ${lineas.length} líneas de investigación
		- ${tiposProducto.length} tipos de producto
		- ${investigadores.length} investigadores
		- ${grupos.length} grupos de investigación
		- ${convocatorias.length} convocatorias`);

	} catch (error) {
		console.error('❌ Error al poblar la base de datos:', error);
		throw error;
	}
}

// Ejecutar si es llamado directamente
if (require.main === module) {
	seedDatabase()
		.then(() => {
			console.log('🎉 Proceso de población completado!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('💥 Error en el proceso de población:', error);
			process.exit(1);
		});
}

module.exports = { seedDatabase };
