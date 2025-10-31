const express = require('express');
const ConvocatoriaService = require('../services/convocatoria.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createConvocatoriaSchema,
	updateConvocatoriaSchema,
	getConvocatoriaSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new ConvocatoriaService();

// ============================================================================
// RUTAS DE BÚSQUEDA ESPECÍFICAS (ANTES DE RUTAS PARAMETRIZADAS)
// ============================================================================

// Buscar convocatorias por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const convocatorias = await service.findByNombre(nombre);
		res.json(convocatorias);
	} catch (error) {
		next(error);
	}
});

// Buscar convocatorias por tipo
router.get('/search/tipo/:tipo', async (req, res, next) => {
	try {
		const { tipo } = req.params;
		const convocatorias = await service.findByTipo(tipo);
		res.json(convocatorias);
	} catch (error) {
		next(error);
	}
});

// Buscar convocatorias por estado
router.get('/search/estado/:estado', async (req, res, next) => {
	try {
		const { estado } = req.params;
		const convocatorias = await service.findByEstado(estado);
		res.json(convocatorias);
	} catch (error) {
		next(error);
	}
});

// Obtener convocatorias activas
router.get('/activas', async (req, res, next) => {
	try {
		const convocatorias = await service.findActivas();
		res.json(convocatorias);
	} catch (error) {
		next(error);
	}
});

// Obtener convocatorias próximas a vencer (ruta con parámetro)
router.get('/proximas-vencer/:dias', async (req, res, next) => {
	try {
		const { dias } = req.params;
		const convocatorias = await service.findProximasAVencer(parseInt(dias));
		res.json(convocatorias);
	} catch (error) {
		next(error);
	}
});

// Obtener convocatorias próximas a vencer (ruta sin parámetro, default 30 días)
router.get('/proximas-vencer', async (req, res, next) => {
	try {
		const convocatorias = await service.findProximasAVencer(30);
		res.json(convocatorias);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por tipo
router.get('/estadisticas/tipos', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorTipo();
		res.json(estadisticas);
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

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todas las convocatorias
router.get('/', async (req, res, next) => {
	try {
		const { limite, desde } = req.query;
		const convocatorias = await service.find();

		// Aplicar paginación si se proporciona
		if (limite && desde) {
			const start = parseInt(desde);
			const limit = parseInt(limite);
			const paginatedResults = convocatorias.slice(start, start + limit);
			res.json({
				convocatorias: paginatedResults,
				total: convocatorias.length,
				desde: start,
				limite: limit
			});
		} else {
			res.json(convocatorias);
		}
	} catch (error) {
		next(error);
	}
});

// Obtener una convocatoria específica por ID
router.get(
	'/:id',
	validatorHandler(getConvocatoriaSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const convocatoria = await service.findOne(id);
			res.json(convocatoria);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nueva convocatoria
router.post(
	'/',
	validatorHandler(createConvocatoriaSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newConvocatoria = await service.create(body);
			res.status(201).json(newConvocatoria);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar convocatoria completa
router.put(
	'/:id',
	validatorHandler(getConvocatoriaSchema, 'params'),
	validatorHandler(updateConvocatoriaSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const convocatoria = await service.update(id, body);
			res.json(convocatoria);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar convocatoria parcial
router.patch(
	'/:id',
	validatorHandler(getConvocatoriaSchema, 'params'),
	validatorHandler(updateConvocatoriaSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const convocatoria = await service.update(id, body);
			res.json(convocatoria);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar convocatoria
router.delete(
	'/:id',
	validatorHandler(getConvocatoriaSchema, 'params'),
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
