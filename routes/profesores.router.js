const express = require('express');
const ProfesorService = require('../services/profesor.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createProfesorSchema,
	updateProfesorSchema,
	getProfesorSchema,
	createProfesorEmailSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new ProfesorService();

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todos los profesores
router.get('/', async (req, res, next) => {
	try {
		const profesores = await service.find();
		res.json(profesores);
	} catch (error) {
		next(error);
	}
});

// Buscar profesores por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const profesores = await service.findByNombre(nombre);
		res.json(profesores);
	} catch (error) {
		next(error);
	}
});

// Buscar profesores por departamento
router.get('/search/departamento/:departamento', async (req, res, next) => {
	try {
		const { departamento } = req.params;
		const profesores = await service.findByDepartamento(departamento);
		res.json(profesores);
	} catch (error) {
		next(error);
	}
});

// Buscar profesores por categoría
router.get('/search/categoria/:categoria', async (req, res, next) => {
	try {
		const { categoria } = req.params;
		const profesores = await service.findByCategoria(categoria);
		res.json(profesores);
	} catch (error) {
		next(error);
	}
});

// Buscar profesores por dedicación
router.get('/search/dedicacion/:dedicacion', async (req, res, next) => {
	try {
		const { dedicacion } = req.params;
		const profesores = await service.findByDedicacion(dedicacion);
		res.json(profesores);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por departamento
router.get('/estadisticas/departamentos', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorDepartamento();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener un profesor específico por ID
router.get(
	'/:id',
	validatorHandler(getProfesorSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const profesor = await service.findOne(id);
			res.json(profesor);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nuevo profesor
router.post(
	'/',
	validatorHandler(createProfesorSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newProfesor = await service.create(body);
			res.status(201).json(newProfesor);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar profesor completo
router.put(
	'/:id',
	validatorHandler(getProfesorSchema, 'params'),
	validatorHandler(updateProfesorSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const profesor = await service.update(id, body);
			res.json(profesor);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar profesor parcial
router.patch(
	'/:id',
	validatorHandler(getProfesorSchema, 'params'),
	validatorHandler(updateProfesorSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const profesor = await service.update(id, body);
			res.json(profesor);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar profesor
router.delete(
	'/:id',
	validatorHandler(getProfesorSchema, 'params'),
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

// ============================================================================
// RUTAS PARA EMAILS ADICIONALES
// ============================================================================

// Agregar email adicional a profesor
router.post(
	'/:id/emails',
	validatorHandler(getProfesorSchema, 'params'),
	validatorHandler(createProfesorEmailSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const newEmail = await service.addEmail(id, body);
			res.status(201).json(newEmail);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar email adicional de profesor
router.delete(
	'/:id/emails/:email',
	validatorHandler(getProfesorSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id, email } = req.params;
			const result = await service.removeEmail(id, email);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
