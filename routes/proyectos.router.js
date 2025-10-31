const express = require('express');
const ProyectoInvestigacionService = require('../services/proyecto.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createProyectoSchema,
	updateProyectoSchema,
	getProyectoSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new ProyectoInvestigacionService();

// ============================================================================
// RUTAS DE BÚSQUEDA ESPECÍFICAS (ANTES DE RUTAS PARAMETRIZADAS)
// ============================================================================

// Buscar proyectos por título
router.get('/search/titulo/:titulo', async (req, res, next) => {
	try {
		const { titulo } = req.params;
		const proyectos = await service.findByTitulo(titulo);
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Buscar proyectos por estado
router.get('/search/estado/:estado', async (req, res, next) => {
	try {
		const { estado } = req.params;
		const proyectos = await service.findByEstado(estado);
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Buscar proyectos por grupo de investigación
router.get('/search/grupo/:grupoId', async (req, res, next) => {
	try {
		const { grupoId } = req.params;
		const proyectos = await service.findByGrupo(grupoId);
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Buscar proyectos por convocatoria
router.get('/search/convocatoria/:convocatoriaId', async (req, res, next) => {
	try {
		const { convocatoriaId } = req.params;
		const proyectos = await service.findByConvocatoria(convocatoriaId);
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Buscar proyectos por rango de fechas
router.get('/search/fechas/:fechaInicio/:fechaFin', async (req, res, next) => {
	try {
		const { fechaInicio, fechaFin } = req.params;
		const proyectos = await service.findByRangoFechas(fechaInicio, fechaFin);
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Obtener proyectos activos
router.get('/activos', async (req, res, next) => {
	try {
		const proyectos = await service.findActivos();
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Obtener proyectos próximos a finalizar (ruta con parámetro)
router.get('/proximos-finalizar/:dias', async (req, res, next) => {
	try {
		const { dias } = req.params;
		const proyectos = await service.findProximosAFinalizar(parseInt(dias));
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Obtener proyectos próximos a finalizar (ruta sin parámetro, default 30 días)
router.get('/proximos-finalizar', async (req, res, next) => {
	try {
		const proyectos = await service.findProximosAFinalizar(30);
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por estado
router.get('/estadisticas/estados', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorEstado();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por grupo
router.get('/estadisticas/grupos', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorGrupo();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener proyectos más antiguos (ruta con parámetro)
router.get('/ranking/antiguos/:limite', async (req, res, next) => {
	try {
		const { limite } = req.params;
		const proyectos = await service.getProyectosMasAntiguos(parseInt(limite));
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// Obtener proyectos más antiguos (ruta sin parámetro, default 10)
router.get('/ranking/antiguos', async (req, res, next) => {
	try {
		const proyectos = await service.getProyectosMasAntiguos(10);
		res.json(proyectos);
	} catch (error) {
		next(error);
	}
});

// ============================================================================
// RUTAS DE GESTIÓN DE LÍNEAS DE INVESTIGACIÓN
// ============================================================================

// Obtener líneas de investigación de un proyecto
router.get('/:id/lineas', validatorHandler(getProyectoSchema, 'params'), async (req, res, next) => {
	try {
		const { id } = req.params;
		const lineas = await service.getLineasInvestigacion(id);
		res.json(lineas);
	} catch (error) {
		next(error);
	}
});

// Agregar línea de investigación a proyecto
router.post('/:id/lineas/:lineaId',
	validatorHandler(getProyectoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id, lineaId } = req.params;
			const result = await service.addLineaInvestigacion(id, lineaId);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// Remover línea de investigación de proyecto
router.delete('/:id/lineas/:lineaId',
	validatorHandler(getProyectoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id, lineaId } = req.params;
			const result = await service.removeLineaInvestigacion(id, lineaId);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todos los proyectos
router.get('/', async (req, res, next) => {
	try {
		const { limite, desde } = req.query;
		const proyectos = await service.find();

		// Aplicar paginación si se proporciona
		if (limite && desde) {
			const start = parseInt(desde);
			const limit = parseInt(limite);
			const paginatedResults = proyectos.slice(start, start + limit);
			res.json({
				proyectos: paginatedResults,
				total: proyectos.length,
				desde: start,
				limite: limit
			});
		} else {
			res.json(proyectos);
		}
	} catch (error) {
		next(error);
	}
});

// Obtener un proyecto específico por ID
router.get(
	'/:id',
	validatorHandler(getProyectoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const proyecto = await service.findOne(id);
			res.json(proyecto);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nuevo proyecto de investigación
router.post(
	'/',
	validatorHandler(createProyectoSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newProyecto = await service.create(body);
			res.status(201).json(newProyecto);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar proyecto completo
router.put(
	'/:id',
	validatorHandler(getProyectoSchema, 'params'),
	validatorHandler(updateProyectoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const proyecto = await service.update(id, body);
			res.json(proyecto);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar proyecto parcial
router.patch(
	'/:id',
	validatorHandler(getProyectoSchema, 'params'),
	validatorHandler(updateProyectoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const proyecto = await service.update(id, body);
			res.json(proyecto);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar proyecto
router.delete(
	'/:id',
	validatorHandler(getProyectoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const result = await service.delete(id);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
