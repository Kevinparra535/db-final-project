const express = require('express');
const InvestigadorService = require('../services/investigador.service');
const validatorHandler = require('../middleware/validator.handler');
const {
	createInvestigadorSchema,
	updateInvestigadorSchema,
	getInvestigadorSchema,
	createInvestigadorEmailSchema,
	createInvestigadorTelefonoSchema,
} = require('../schemas/academic.schema');

const router = express.Router();
const service = new InvestigadorService();

// ============================================================================
// RUTAS PRINCIPALES
// ============================================================================

// Obtener todos los investigadores
router.get('/', async (req, res, next) => {
	try {
		const investigadores = await service.find();
		res.json(investigadores);
	} catch (error) {
		next(error);
	}
});

// Buscar investigadores por nombre
router.get('/search/nombre/:nombre', async (req, res, next) => {
	try {
		const { nombre } = req.params;
		const investigadores = await service.findByNombre(nombre);
		res.json(investigadores);
	} catch (error) {
		next(error);
	}
});

// Buscar investigadores por estado
router.get('/search/estado/:estado', async (req, res, next) => {
	try {
		const { estado } = req.params;
		const investigadores = await service.findByEstado(estado);
		res.json(investigadores);
	} catch (error) {
		next(error);
	}
});

// Buscar investigador por ORCID
router.get('/search/orcid/:orcid', async (req, res, next) => {
	try {
		const { orcid } = req.params;
		const investigador = await service.findByOrcid(orcid);
		if (investigador) {
			res.json(investigador);
		} else {
			res.status(404).json({ message: 'Investigador no encontrado' });
		}
	} catch (error) {
		next(error);
	}
});

// Obtener investigadores activos
router.get('/activos', async (req, res, next) => {
	try {
		const investigadores = await service.findByEstado('activo');
		res.json(investigadores);
	} catch (error) {
		next(error);
	}
});

// Obtener un investigador específico por ID
router.get(
	'/:id',
	validatorHandler(getInvestigadorSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const investigador = await service.findOne(id);
			res.json(investigador);
		} catch (error) {
			next(error);
		}
	}
);

// Crear nuevo investigador
router.post(
	'/',
	validatorHandler(createInvestigadorSchema, 'body'),
	async (req, res, next) => {
		try {
			const body = req.body;
			const newInvestigador = await service.create(body);
			res.status(201).json(newInvestigador);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar investigador completo
router.put(
	'/:id',
	validatorHandler(getInvestigadorSchema, 'params'),
	validatorHandler(updateInvestigadorSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const investigador = await service.update(id, body);
			res.json(investigador);
		} catch (error) {
			next(error);
		}
	}
);

// Actualizar investigador parcial
router.patch(
	'/:id',
	validatorHandler(getInvestigadorSchema, 'params'),
	validatorHandler(updateInvestigadorSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const investigador = await service.update(id, body);
			res.json(investigador);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar investigador
router.delete(
	'/:id',
	validatorHandler(getInvestigadorSchema, 'params'),
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
// RUTAS PARA EMAILS
// ============================================================================

// Agregar email a investigador
router.post(
	'/:id/emails',
	validatorHandler(getInvestigadorSchema, 'params'),
	validatorHandler(createInvestigadorEmailSchema, 'body'),
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

// Eliminar email de investigador
router.delete(
	'/:id/emails/:email',
	validatorHandler(getInvestigadorSchema, 'params'),
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

// ============================================================================
// RUTAS PARA TELÉFONOS
// ============================================================================

// Agregar teléfono a investigador
router.post(
	'/:id/telefonos',
	validatorHandler(getInvestigadorSchema, 'params'),
	validatorHandler(createInvestigadorTelefonoSchema, 'body'),
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			const newTelefono = await service.addTelefono(id, body);
			res.status(201).json(newTelefono);
		} catch (error) {
			next(error);
		}
	}
);

// Eliminar teléfono de investigador
router.delete(
	'/:id/telefonos/:numero',
	validatorHandler(getInvestigadorSchema, 'params'),
	async (req, res, next) => {
		try {
			const { id, numero } = req.params;
			const result = await service.removeTelefono(id, numero);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
