const express = require('express');
const BooksService = require('../services/books.services');
const validatorHandler = require('../middleware/validator.handler');
const { getBooksSchema } = require('../schemas/validator.schema');

const router = express.Router();

const service = new BooksService();

router.get('/', async (req, res) => {
	const books = await service.find();

	res.json(books);
});

router.get('/filter', (req, res) => {
	res.send('Soy un filtro');
});

router.get(
	'/:id',
	validatorHandler(getBooksSchema, 'params'),
	async (req, res) => {
		const { id } = req.params;
		const books = await service.findOne(id);

		res.json(books);
	},
);

router.post('/', async (req, res) => {
	const body = req.body;
	const newbooks = await service.create(body);
	res.status(201).json(newbooks);
});

router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const body = req.body;
	const books = await service.update(id, body);
	res.json(books);
});

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
