const express = require('express');
const EstudianteService = require('../services/estudiante.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createEstudianteSchema,
	updateEstudianteSchema,
	getEstudianteSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new EstudianteService();

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todos los estudiantes
router.get('/', async (req, res, next) => {
	try {
		const estudiantes = await service.find();
		res.json(estudiantes);
	} catch (error) {
		next(error);
	}
});

// Buscar estudiantes por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const estudiantes = await service.findByNombre(nombre);
		res.json(estudiantes);
	} catch (error) {
		next(error);
	}
});

// Buscar estudiantes por programa
router.get('/search/programa/:programa', async (req, res, next) => {
	try {
		const { programa } = req.params;
		const estudiantes = await service.findByPrograma(programa);
		res.json(estudiantes);
	} catch (error) {
		next(error);
	}
});

// Buscar estudiantes por nivel
router.get('/search/nivel/:nivel', async (req, res, next) => {
	try {
		const { nivel } = req.params;
		const estudiantes = await service.findByNivel(nivel);
		res.json(estudiantes);
	} catch (error) {
		next(error);
	}
});

// Buscar estudiantes por semestre
router.get('/search/semestre/:semestre', async (req, res, next) => {
	try {
		const { semestre } = req.params;
		const estudiantes = await service.findBySemestre(semestre);
		res.json(estudiantes);
	} catch (error) {
		next(error);
	}
});

// Buscar estudiantes por rango de semestre
router.get('/search/semestre-rango/:min/:max', async (req, res, next) => {
	try {
		const { min, max } = req.params;
		const estudiantes = await service.findByRangoSemestre(parseInt(min), parseInt(max));
		res.json(estudiantes);
	} catch (error) {
		next(error);
	}
});

// Buscar estudiante por código estudiantil
router.get('/search/codigo/:codigo', async (req, res, next) => {
	try {
		const { codigo } = req.params;
		const estudiante = await service.findByCodigoEstudiantil(codigo);
		if (estudiante) {
			res.json(estudiante);
		} else {
			res.status(404).json({ message: 'Estudiante no encontrado' });
		}
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por nivel
router.get('/estadisticas/niveles', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorNivel();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por programa
router.get('/estadisticas/programas', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorPrograma();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener un estudiante específico por ID
router.get(
	'/:id',
	validatorHandler(getEstudianteSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const estudiante = await service.findOne(id);
			res.json(estudiante);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nuevo estudiante
router.post(
	'/',
	validatorHandler(createEstudianteSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newEstudiante = await service.create(body);
			res.status(201).json(newEstudiante);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar estudiante completo
router.put(
	'/:id',
	validatorHandler(getEstudianteSchema, 'params'),
	validatorHandler(updateEstudianteSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const estudiante = await service.update(id, body);
			res.json(estudiante);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar estudiante parcial
router.patch(
	'/:id',
	validatorHandler(getEstudianteSchema, 'params'),
	validatorHandler(updateEstudianteSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const estudiante = await service.update(id, body);
			res.json(estudiante);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar estudiante
router.delete(
	'/:id',
	validatorHandler(getEstudianteSchema, 'params'),
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
