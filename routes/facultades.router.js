const express = require('express');
const FacultadService = require('../services/facultad.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createFacultadSchema,
	updateFacultadSchema,
	getFacultadSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new FacultadService();

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todas las facultades
router.get('/', async (req, res, next) => {
	try {
		const facultades = await service.find();
		res.json(facultades);
	} catch (error) {
		next(error);
	}
});

// Buscar facultades por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const facultades = await service.findByNombre(nombre);
		res.json(facultades);
	} catch (error) {
		next(error);
	}
});

// Buscar facultades por ciudad
router.get('/search/ciudad/:ciudad', async (req, res, next) => {
	try {
		const { ciudad } = req.params;
		const facultades = await service.findByCiudad(ciudad);
		res.json(facultades);
	} catch (error) {
		next(error);
	}
});

// Obtener una facultad específica por ID
router.get(
	'/:id',
	validatorHandler(getFacultadSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const facultad = await service.findOne(id);
			res.json(facultad);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nueva facultad
router.post(
	'/',
	validatorHandler(createFacultadSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newFacultad = await service.create(body);
			res.status(201).json(newFacultad);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar facultad completa
router.put(
	'/:id',
	validatorHandler(getFacultadSchema, 'params'),
	validatorHandler(updateFacultadSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const facultad = await service.update(id, body);
			res.json(facultad);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar facultad parcial
router.patch(
	'/:id',
	validatorHandler(getFacultadSchema, 'params'),
	validatorHandler(updateFacultadSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const facultad = await service.update(id, body);
			res.json(facultad);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar facultad
router.delete(
	'/:id',
	validatorHandler(getFacultadSchema, 'params'),
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
