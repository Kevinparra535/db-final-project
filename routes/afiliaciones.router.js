const express = require('express');
const AfiliacionService = require('../services/afiliacion.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createAfiliacionSchema,
	updateAfiliacionSchema,
	getAfiliacionSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new AfiliacionService();

// ============================================================================
// RUTAS DE BÚSQUEDA ESPECÍFICAS (ANTES DE RUTAS PARAMETRIZADAS)
// ============================================================================

// Buscar afiliaciones por investigador
router.get('/search/investigador/:investigadorId', async (req, res, next) => {
	try {
		const { investigadorId } = req.params;
		const afiliaciones = await service.findByInvestigador(investigadorId);
		res.json(afiliaciones);
	} catch (error) {
		next(error);
	}
});

// Buscar afiliaciones por grupo
router.get('/search/grupo/:grupoId', async (req, res, next) => {
	try {
		const { grupoId } = req.params;
		const afiliaciones = await service.findByGrupo(grupoId);
		res.json(afiliaciones);
	} catch (error) {
		next(error);
	}
});

// Buscar afiliaciones por rol
router.get('/search/rol/:rol', async (req, res, next) => {
	try {
		const { rol } = req.params;
		const afiliaciones = await service.findByRol(rol);
		res.json(afiliaciones);
	} catch (error) {
		next(error);
	}
});

// Buscar afiliaciones activas
router.get('/activas', async (req, res, next) => {
	try {
		const afiliaciones = await service.findActivas();
		res.json(afiliaciones);
	} catch (error) {
		next(error);
	}
});

// Buscar afiliaciones por rango de fechas
router.get('/search/fechas/:fechaInicio/:fechaFin', async (req, res, next) => {
	try {
		const { fechaInicio, fechaFin } = req.params;
		const afiliaciones = await service.findByRangoFechas(fechaInicio, fechaFin);
		res.json(afiliaciones);
	} catch (error) {
		next(error);
	}
});

// Obtener líderes de grupos
router.get('/lideres', async (req, res, next) => {
	try {
		const lideres = await service.findLideres();
		res.json(lideres);
	} catch (error) {
		next(error);
	}
});

// Obtener coinvestigadores
router.get('/coinvestigadores', async (req, res, next) => {
	try {
		const coinvestigadores = await service.findCoinvestigadores();
		res.json(coinvestigadores);
	} catch (error) {
		next(error);
	}
});

// Obtener semilleristas
router.get('/semilleristas', async (req, res, next) => {
	try {
		const semilleristas = await service.findSemilleristas();
		res.json(semilleristas);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por rol
router.get('/estadisticas/roles', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorRol();
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

// Ranking de grupos por número de miembros (ruta con parámetro)
router.get('/ranking/grupos-miembros/:limite', async (req, res, next) => {
	try {
		const { limite } = req.params;
		const ranking = await service.getRankingGruposPorMiembros(parseInt(limite));
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Ranking de grupos por número de miembros (ruta sin parámetro, default 10)
router.get('/ranking/grupos-miembros', async (req, res, next) => {
	try {
		const ranking = await service.getRankingGruposPorMiembros(10);
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Obtener historial de afiliaciones de un investigador
router.get('/historial/investigador/:investigadorId', async (req, res, next) => {
	try {
		const { investigadorId } = req.params;
		const historial = await service.getHistorialInvestigador(investigadorId);
		res.json(historial);
	} catch (error) {
		next(error);
	}
});

// Obtener evolución temporal de un grupo
router.get('/evolucion/grupo/:grupoId', async (req, res, next) => {
	try {
		const { grupoId } = req.params;
		const evolucion = await service.getEvolucionGrupo(grupoId);
		res.json(evolucion);
	} catch (error) {
		next(error);
	}
});

// ============================================================================
// RUTAS DE GESTIÓN DE AFILIACIONES
// ============================================================================

// Finalizar afiliación
router.patch('/:id/finalizar',
	validatorHandler(getAfiliacionSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const { fecha_fin = new Date() } = req.body;
			const result = await service.finalizarAfiliacion(id, fecha_fin);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// Cambiar rol de afiliación
router.patch('/:id/cambiar-rol',
	validatorHandler(getAfiliacionSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const { nuevo_rol } = req.body;
			const result = await service.cambiarRol(id, nuevo_rol);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// Transferir afiliación a otro grupo
router.patch('/:id/transferir',
	validatorHandler(getAfiliacionSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const { nuevo_grupo_id, fecha_transferencia = new Date() } = req.body;
			const result = await service.transferirAfiliacion(id, nuevo_grupo_id, fecha_transferencia);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todas las afiliaciones
router.get('/', async (req, res, next) => {
	try {
		const { limite, desde, rol, activas } = req.query;
		let afiliaciones = await service.find();

		// Aplicar filtros si se proporcionan
		if (rol) {
			afiliaciones = afiliaciones.filter(a => a.rol === rol);
		}

		if (activas === 'true') {
			afiliaciones = afiliaciones.filter(a => !a.fecha_fin);
		}

		// Aplicar paginación si se proporciona
		if (limite && desde) {
			const start = parseInt(desde);
			const limit = parseInt(limite);
			const paginatedResults = afiliaciones.slice(start, start + limit);
			res.json({
				afiliaciones: paginatedResults,
				total: afiliaciones.length,
				desde: start,
				limite: limit
			});
		} else {
			res.json(afiliaciones);
		}
	} catch (error) {
		next(error);
	}
});

// Obtener una afiliación específica por ID
router.get(
	'/:id',
	validatorHandler(getAfiliacionSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const afiliacion = await service.findOne(id);
			res.json(afiliacion);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nueva afiliación
router.post(
	'/',
	validatorHandler(createAfiliacionSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newAfiliacion = await service.create(body);
			res.status(201).json(newAfiliacion);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar afiliación completa
router.put(
	'/:id',
	validatorHandler(getAfiliacionSchema, 'params'),
	validatorHandler(updateAfiliacionSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const afiliacion = await service.update(id, body);
			res.json(afiliacion);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar afiliación parcial
router.patch(
	'/:id',
	validatorHandler(getAfiliacionSchema, 'params'),
	validatorHandler(updateAfiliacionSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const afiliacion = await service.update(id, body);
			res.json(afiliacion);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar afiliación
router.delete(
	'/:id',
	validatorHandler(getAfiliacionSchema, 'params'),
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
