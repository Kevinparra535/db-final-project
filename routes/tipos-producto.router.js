const express = require('express');
const ProductoTipoService = require('../services/producto-tipo.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createProductoTipoSchema,
	updateProductoTipoSchema,
	getProductoTipoSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new ProductoTipoService();

// ============================================================================
// RUTAS DE BÚSQUEDA ESPECÍFICAS (ANTES DE RUTAS PARAMETRIZADAS)
// ============================================================================

// Buscar tipos por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const tipos = await service.findByNombre(nombre);
		res.json(tipos);
	} catch (error) {
		next(error);
	}
});

// Buscar tipos por categoría
router.get('/search/categoria/:categoria', async (req, res, next) => {
	try {
		const { categoria } = req.params;
		const tipos = await service.findByCategoria(categoria);
		res.json(tipos);
	} catch (error) {
		next(error);
	}
});

// Obtener tipos activos
router.get('/activos', async (req, res, next) => {
	try {
		const tipos = await service.findActivos();
		res.json(tipos);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas de uso
router.get('/estadisticas/uso', async (req, res, next) => {
	try {
		const estadisticas = await service.getEstadisticasUso();
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// Obtener tipos más utilizados (ruta con parámetro)
router.get('/ranking/mas-utilizados/:limite', async (req, res, next) => {
	try {
		const { limite } = req.params;
		const ranking = await service.getTiposMasUtilizados(parseInt(limite));
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// Obtener tipos más utilizados (ruta sin parámetro, default 10)
router.get('/ranking/mas-utilizados', async (req, res, next) => {
	try {
		const ranking = await service.getTiposMasUtilizados(10);
		res.json(ranking);
	} catch (error) {
		next(error);
	}
});

// ============================================================================
// RUTAS DE GESTIÓN DE PRODUCTOS POR TIPO
// ============================================================================

// Obtener productos de un tipo específico
router.get('/:id/productos', validatorHandler(getProductoTipoSchema, 'params'), async (req, res, next) => {
	try {
		const { id } = req.params;
		const productos = await service.getProductosPorTipo(id);
		res.json(productos);
	} catch (error) {
		next(error);
	}
});

// Obtener estadísticas de productos por tipo
router.get('/:id/estadisticas', validatorHandler(getProductoTipoSchema, 'params'), async (req, res, next) => {
	try {
		const { id } = req.params;
		const estadisticas = await service.getEstadisticasProductosPorTipo(id);
		res.json(estadisticas);
	} catch (error) {
		next(error);
	}
});

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todos los tipos de producto
router.get('/', async (req, res, next) => {
	try {
		const { categoria, activo } = req.query;
		let tipos = await service.find();

		// Aplicar filtros si se proporcionan
		if (categoria) {
			tipos = tipos.filter(t => t.categoria === categoria);
		}

		if (activo !== undefined) {
			const esActivo = activo === 'true';
			tipos = tipos.filter(t => t.activo === esActivo);
		}

		res.json(tipos);
	} catch (error) {
		next(error);
	}
});

// Obtener un tipo específico por ID
router.get(
	'/:id',
	validatorHandler(getProductoTipoSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const tipo = await service.findOne(id);
			res.json(tipo);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nuevo tipo de producto
router.post(
	'/',
	validatorHandler(createProductoTipoSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newTipo = await service.create(body);
			res.status(201).json(newTipo);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar tipo completo
router.put(
	'/:id',
	validatorHandler(getProductoTipoSchema, 'params'),
	validatorHandler(updateProductoTipoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const tipo = await service.update(id, body);
			res.json(tipo);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar tipo parcial
router.patch(
	'/:id',
	validatorHandler(getProductoTipoSchema, 'params'),
	validatorHandler(updateProductoTipoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const tipo = await service.update(id, body);
			res.json(tipo);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar tipo
router.delete(
	'/:id',
	validatorHandler(getProductoTipoSchema, 'params'),
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
