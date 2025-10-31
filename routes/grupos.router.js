const express = require('express');
const GrupoService = require('../services/grupo.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createGrupoSchema,
	updateGrupoSchema,
	getGrupoSchema,
	createGrupoLineaSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new GrupoService();

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todos los grupos de investigación
router.get('/', async (req, res, next) => {
	try {
		const grupos = await service.find();
		res.json(grupos);
	} catch (error) {
		next(error);
	}
});

// Buscar grupos por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const grupos = await service.findByNombre(nombre);
		res.json(grupos);
	} catch (error) {
		next(error);
	}
});

// Buscar grupos por facultad
router.get('/search/facultad/:facultadId', async (req, res, next) => {
	try {
		const { facultadId } = req.params;
		const grupos = await service.findByFacultad(facultadId);
		res.json(grupos);
	} catch (error) {
		next(error);
	}
});

// Buscar grupos por clasificación Minciencias
router.get('/search/clasificacion/:clasificacion', async (req, res, next) => {
	try {
		const { clasificacion } = req.params;
		const grupos = await service.findByClasificacion(clasificacion);
		res.json(grupos);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por facultad
router.get('/estadisticas/facultades', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorFacultad();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por clasificación
router.get('/estadisticas/clasificaciones', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorClasificacion();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener grupos con más líneas de investigación
router.get('/ranking/lineas', async (req, res, next) => {
	try {
		const { limite } = req.query;
		const grupos = await service.getGruposConMasLineas(limite ? parseInt(limite) : 5);
		res.json(grupos);
	} catch (error) {
		next(error);
	}
});

// Obtener un grupo específico por ID
router.get(
	'/:id',
	validatorHandler(getGrupoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const grupo = await service.findOne(id);
			res.json(grupo);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nuevo grupo de investigación
router.post(
	'/',
	validatorHandler(createGrupoSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newGrupo = await service.create(body);
			res.status(201).json(newGrupo);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar grupo completo
router.put(
	'/:id',
	validatorHandler(getGrupoSchema, 'params'),
	validatorHandler(updateGrupoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const grupo = await service.update(id, body);
			res.json(grupo);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar grupo parcial
router.patch(
	'/:id',
	validatorHandler(getGrupoSchema, 'params'),
	validatorHandler(updateGrupoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const grupo = await service.update(id, body);
			res.json(grupo);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar grupo
router.delete(
	'/:id',
	validatorHandler(getGrupoSchema, 'params'),
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
// RUTAS PARA LÍNEAS DE INVESTIGACIÓN
// ============================================================================

// Obtener líneas de investigación de un grupo
router.get(
	'/:id/lineas',
	validatorHandler(getGrupoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const lineas = await service.getLineasByGrupo(id);
			res.json(lineas);
		} catch (error) {
			next(error);
		}
	}
);

// Agregar línea de investigación a grupo
router.post(
	'/:id/lineas',
	validatorHandler(getGrupoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const { id_linea } = req.body;

			if (!id_linea) {
				return res.status(400).json({ message: 'id_linea es requerido' });
			}

			const result = await service.addLinea(id, id_linea);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar línea de investigación de grupo
router.delete(
	'/:id/lineas/:lineaId',
	validatorHandler(getGrupoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id, lineaId } = req.params;
			const result = await service.removeLinea(id, lineaId);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
