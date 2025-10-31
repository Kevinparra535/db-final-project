const express = require('express');
const LineaInvestigacionService = require('../services/linea.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createLineaSchema,
	updateLineaSchema,
	getLineaSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new LineaInvestigacionService();

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todas las líneas de investigación
router.get('/', async (req, res, next) => {
	try {
		const lineas = await service.find();
		res.json(lineas);
	} catch (error) {
		next(error);
	}
});

// Buscar líneas por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const lineas = await service.findByNombre(nombre);
		res.json(lineas);
	} catch (error) {
		next(error);
	}
});

// Buscar líneas por palabras clave
router.get('/search/keywords/:keywords', async (req, res, next) => {
	try {
		const { keywords } = req.params;
		const lineas = await service.findByKeywords(keywords);
		res.json(lineas);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas generales
router.get('/estadisticas', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticas();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener una línea específica por ID
router.get(
	'/:id',
	validatorHandler(getLineaSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const linea = await service.findOne(id);
			res.json(linea);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nueva línea de investigación
router.post(
	'/',
	validatorHandler(createLineaSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newLinea = await service.create(body);
			res.status(201).json(newLinea);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar línea completa
router.put(
	'/:id',
	validatorHandler(getLineaSchema, 'params'),
	validatorHandler(updateLineaSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const linea = await service.update(id, body);
			res.json(linea);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar línea parcial
router.patch(
	'/:id',
	validatorHandler(getLineaSchema, 'params'),
	validatorHandler(updateLineaSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const linea = await service.update(id, body);
			res.json(linea);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar línea
router.delete(
	'/:id',
	validatorHandler(getLineaSchema, 'params'),
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
