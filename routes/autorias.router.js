const express = require('express');
const AutoriaService = require('../services/autoria.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createAutoriaSchema,
	updateAutoriaSchema,
	getAutoriaSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new AutoriaService();

// ============================================================================
// RUTAS DE BÚSQUEDA ESPECÍFICAS (ANTES DE RUTAS PARAMETRIZADAS)
// ============================================================================

// Buscar autorías por investigador
router.get('/search/investigador/:investigadorId', async (req, res, next) => {
	try {
		const { investigadorId } = req.params;
		const autorias = await service.findByInvestigador(investigadorId);
		res.json(autorias);
	} catch (error) {
		next(error);
	}
});

// Buscar autorías por producto
router.get('/search/producto/:productoId', async (req, res, next) => {
	try {
		const { productoId } = req.params;
		const autorias = await service.findByProducto(productoId);
		res.json(autorias);
	} catch (error) {
		next(error);
	}
});

// Buscar autorías por rol
router.get('/search/rol/:rol', async (req, res, next) => {
	try {
		const { rol } = req.params;
		const autorias = await service.findByRol(rol);
		res.json(autorias);
	} catch (error) {
		next(error);
	}
});

// Obtener autores principales
router.get('/autores-principales', async (req, res, next) => {
	try {
		const autores = await service.findAutoresPrincipales();
		res.json(autores);
	} catch (error) {
		next(error);
	}
});

// Obtener coautores
router.get('/coautores', async (req, res, next) => {
	try {
		const coautores = await service.findCoautores();
		res.json(coautores);
	} catch (error) {
		next(error);
	}
});

// Obtener directores
router.get('/directores', async (req, res, next) => {
	try {
		const directores = await service.findDirectores();
		res.json(directores);
	} catch (error) {
		next(error);
	}
});

// Obtener colaboraciones (investigadores que han trabajado juntos)
router.get('/colaboraciones', async (req, res, next) => {
	try {
		const colaboraciones = await service.findColaboraciones();
		res.json(colaboraciones);
	} catch (error) {
		next(error);
	}
});

// Obtener colaboraciones de un investigador específico
router.get('/colaboraciones/investigador/:investigadorId', async (req, res, next) => {
	try {
		const { investigadorId } = req.params;
		const colaboraciones = await service.findColaboracionesPorInvestigador(investigadorId);
		res.json(colaboraciones);
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

// Obtener estadísticas de productividad por investigador
router.get('/estadisticas/productividad', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasProductividad();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Ranking de investigadores más productivos (ruta con parámetro)
router.get('/ranking/productivos/:limite', async (req, res, next) => {
	try {
		const { limite } = req.params;
		const ranking = await service.getRankingProductividad(parseInt(limite));
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Ranking de investigadores más productivos (ruta sin parámetro, default 10)
router.get('/ranking/productivos', async (req, res, next) => {
	try {
		const ranking = await service.getRankingProductividad(10);
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Ranking de investigadores por colaboraciones (ruta con parámetro)
router.get('/ranking/colaboradores/:limite', async (req, res, next) => {
	try {
		const { limite } = req.params;
		const ranking = await service.getRankingColaboradores(parseInt(limite));
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Ranking de investigadores por colaboraciones (ruta sin parámetro, default 10)
router.get('/ranking/colaboradores', async (req, res, next) => {
	try {
		const ranking = await service.getRankingColaboradores(10);
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Obtener red de colaboración de un investigador
router.get('/red-colaboracion/investigador/:investigadorId', async (req, res, next) => {
	try {
		const { investigadorId } = req.params;
		const red = await service.getRedColaboracion(investigadorId);
		res.json(red);
	} catch (error) {
		next(error);
	}
});

// Obtener productos con múltiples autores
router.get('/productos-colaborativos', async (req, res, next) => {
	try {
		const productos = await service.findProductosColaborativos();
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Obtener autorías por año
router.get('/search/año/:año', async (req, res, next) => {
	try {
		const { año } = req.params;
		const autorias = await service.findByAño(parseInt(año));
		res.json(autorias);
	} catch (error) {
		next(error);
	}
});

// Obtener tendencias de colaboración por años
router.get('/tendencias/colaboracion', async (req, res, next) => {
	try {
		const tendencias = await service.getTendenciasColaboracion();
		res.json(tendencias);
	} catch (error) {
		next(error);
	}
});

// ============================================================================
// RUTAS DE GESTIÓN DE AUTORÍAS
// ============================================================================

// Cambiar rol de autoría
router.patch('/:id/cambiar-rol',
	validatorHandler(getAutoriaSchema, 'params'),
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

// Transferir autoría a otro investigador
router.patch('/:id/transferir',
	validatorHandler(getAutoriaSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const { nuevo_investigador_id } = req.body;
			const result = await service.transferirAutoria(id, nuevo_investigador_id);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// Duplicar autoría (para casos donde un investigador tiene múltiples roles)
router.post('/:id/duplicar',
	validatorHandler(getAutoriaSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const { nuevo_rol } = req.body;
			const result = await service.duplicarAutoria(id, nuevo_rol);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	}
);

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todas las autorías
router.get('/', async (req, res, next) => {
	try {
		const { limite, desde, rol, investigador, producto } = req.query;
		let autorias = await service.find();

		// Aplicar filtros si se proporcionan
		if (rol) {
			autorias = autorias.filter(a => a.rol === rol);
		}

		if (investigador) {
			autorias = autorias.filter(a => a.investigador_id === investigador);
		}

		if (producto) {
			autorias = autorias.filter(a => a.producto_investigacion_id === producto);
		}

		// Aplicar paginación si se proporciona
		if (limite && desde) {
			const start = parseInt(desde);
			const limit = parseInt(limite);
			const paginatedResults = autorias.slice(start, start + limit);
			res.json({
				autorias: paginatedResults,
				total: autorias.length,
				desde: start,
				limite: limit
			});
		} else {
			res.json(autorias);
		}
	} catch (error) {
		next(error);
	}
});

// Obtener una autoría específica por ID
router.get(
	'/:id',
	validatorHandler(getAutoriaSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const autoria = await service.findOne(id);
			res.json(autoria);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nueva autoría
router.post(
	'/',
	validatorHandler(createAutoriaSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newAutoria = await service.create(body);
			res.status(201).json(newAutoria);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar autoría completa
router.put(
	'/:id',
	validatorHandler(getAutoriaSchema, 'params'),
	validatorHandler(updateAutoriaSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const autoria = await service.update(id, body);
			res.json(autoria);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar autoría parcial
router.patch(
	'/:id',
	validatorHandler(getAutoriaSchema, 'params'),
	validatorHandler(updateAutoriaSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const autoria = await service.update(id, body);
			res.json(autoria);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar autoría
router.delete(
	'/:id',
	validatorHandler(getAutoriaSchema, 'params'),
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
