const express = require('express');
const BooksService = require('../services/books.services');

const router = express.Router();

const service = new BooksService();

// Devuelve un JSON
router.get('/', async (req, res) => {
	// Traemos los datos desde nuestros servicios
	const books = await service.find();

	res.json(books); // Respuesta
});

// El orden influye en la ejecucion
router.get('/filter', (req, res) => {
	res.send('Soy un filtro'); // Respuesta
});

// Recibimos un parametro (:) y enviamos una respuesta
router.get('/:id', async (req, res) => {
	const { id } = req.params; // Destructuracion del parametro
	const books = await service.findOne(id); // Lo trae del servicio

	res.json(books); // Respuesta con el parametro
});

// Ruta para hacer post
router.post('/', async (req, res) => {
	const body = req.body;
	const newbooks = await service.create(body);
	res.status(201).json(newbooks);
});

// Ruta para recibir actualizaciones global
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const body = req.body;
	const books = await service.update(id, body);
	res.json(books);
});

// Ruta para recibir actualizaciones parciales
router.patch('/:id', async (req, res) => {
	const { id } = req.params;
	const body = req.body;
	const books = await service.update(id, body);
	res.json(books);
});

router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const books = await service.delete(id);
		res.json(books);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
});

module.exports = router;
