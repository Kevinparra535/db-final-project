const express = require('express');
const ProductoInvestigacionService = require('../services/producto.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createProductoSchema,
	updateProductoSchema,
	getProductoSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new ProductoInvestigacionService();

// ============================================================================
// RUTAS DE BÚSQUEDA ESPECÍFICAS (ANTES DE RUTAS PARAMETRIZADAS)
// ============================================================================

// Buscar productos por título
router.get('/search/titulo/:titulo', async (req, res, next) => {
	try {
		const { titulo } = req.params;
		const productos = await service.findByTitulo(titulo);
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Buscar productos por tipo
router.get('/search/tipo/:tipoId', async (req, res, next) => {
	try {
		const { tipoId } = req.params;
		const productos = await service.findByTipo(tipoId);
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Buscar productos por proyecto
router.get('/search/proyecto/:proyectoId', async (req, res, next) => {
	try {
		const { proyectoId } = req.params;
		const productos = await service.findByProyecto(proyectoId);
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Buscar productos por año de publicación
router.get('/search/año/:año', async (req, res, next) => {
	try {
		const { año } = req.params;
		const productos = await service.findByAñoPublicacion(parseInt(año));
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Buscar productos por rango de años
router.get('/search/años/:añoInicio/:añoFin', async (req, res, next) => {
	try {
		const { añoInicio, añoFin } = req.params;
		const productos = await service.findByRangoAños(parseInt(añoInicio), parseInt(añoFin));
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Buscar productos por keywords en metadatos
router.get('/search/metadata/:keywords', async (req, res, next) => {
	try {
		const { keywords } = req.params;
		const productos = await service.findByMetadataKeywords(keywords);
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Obtener productos más recientes (ruta con parámetro)
router.get('/recientes/:limite', async (req, res, next) => {
	try {
		const { limite } = req.params;
		const productos = await service.findMasRecientes(parseInt(limite));
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Obtener productos más recientes (ruta sin parámetro, default 10)
router.get('/recientes', async (req, res, next) => {
	try {
		const productos = await service.findMasRecientes(10);
		res.json(productos);
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

// Obtener estadísticas por año
router.get('/estadisticas/años', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorAño();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas por proyecto
router.get('/estadisticas/proyectos', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasPorProyecto();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Ranking de productos por proyecto (ruta con parámetro)
router.get('/ranking/proyectos/:limite', async (req, res, next) => {
	try {
		const { limite } = req.params;
		const ranking = await service.getRankingProyectos(parseInt(limite));
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Ranking de productos por proyecto (ruta sin parámetro, default 10)
router.get('/ranking/proyectos', async (req, res, next) => {
	try {
		const ranking = await service.getRankingProyectos(10);
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Tendencias de publicación
router.get('/tendencias/publicacion', async (req, res, next) => {
	try {
		const tendencias = await service.getTendenciasPublicacion();
		res.json(tendencias);
	} catch (error) {
		next(error);
	}
});

// ============================================================================
// RUTAS DE GESTIÓN DE METADATOS
// ============================================================================

// Obtener metadatos de un producto
router.get('/:id/metadata', validatorHandler(getProductoSchema, 'params'), async (req, res, next) => {
	try {
		const { id } = req.params;
		const metadata = await service.getMetadata(id);
		res.json(metadata);
	} catch (error) {
		next(error);
	}
});

// Actualizar metadatos de un producto
router.put('/:id/metadata',
	validatorHandler(getProductoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const metadata = req.body;
			const result = await service.updateMetadata(id, metadata);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// Agregar campo a metadatos
router.post('/:id/metadata/:campo',
	validatorHandler(getProductoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id, campo } = req.params;
			const { valor } = req.body;
			const result = await service.addMetadataField(id, campo, valor);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar campo de metadatos
router.delete('/:id/metadata/:campo',
	validatorHandler(getProductoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id, campo } = req.params;
			const result = await service.removeMetadataField(id, campo);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todos los productos
router.get('/', async (req, res, next) => {
	try {
		const { limite, desde, tipo, año } = req.query;
		let productos = await service.find();

		// Aplicar filtros si se proporcionan
		if (tipo) {
			productos = productos.filter(p => p.producto_tipo_id === tipo);
		}

		if (año) {
			productos = productos.filter(p => p.año_publicacion === parseInt(año));
		}

		// Aplicar paginación si se proporciona
		if (limite && desde) {
			const start = parseInt(desde);
			const limit = parseInt(limite);
			const paginatedResults = productos.slice(start, start + limit);
			res.json({
				productos: paginatedResults,
				total: productos.length,
				desde: start,
				limite: limit
			});
		} else {
			res.json(productos);
		}
	} catch (error) {
		next(error);
	}
});

// Obtener un producto específico por ID
router.get(
	'/:id',
	validatorHandler(getProductoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const producto = await service.findOne(id);
			res.json(producto);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nuevo producto de investigación
router.post(
	'/',
	validatorHandler(createProductoSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newProducto = await service.create(body);
			res.status(201).json(newProducto);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar producto completo
router.put(
	'/:id',
	validatorHandler(getProductoSchema, 'params'),
	validatorHandler(updateProductoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const producto = await service.update(id, body);
			res.json(producto);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar producto parcial
router.patch(
	'/:id',
	validatorHandler(getProductoSchema, 'params'),
	validatorHandler(updateProductoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const producto = await service.update(id, body);
			res.json(producto);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar producto
router.delete(
	'/:id',
	validatorHandler(getProductoSchema, 'params'),
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
