const express = require('express');

// Esto nos crea un router especifico
const router = express.Router();

// Devuelve un JSON
router.get('/', (req, res) => {
	// Creamos un array de libros
	const books = [
		{
			id: 1,
			nombre: 'Libro de NodeJS',
			precio: 50,
			descripcion: 'Descripcion del libro de NodeJS',
			imagen: 'https://placeimg.com/640/480/any',
		},
		{
			id: 2,
			nombre: 'Libro de Python',
			precio: 60,
			descripcion: 'Descripcion del libro de Python',
			imagen: 'https://placeimg.com/640/480/any',
		},
		{
			id: 3,
			nombre: 'Libro de JavaScript',
			precio: 70,
			descripcion: 'Descripcion del libro de JavaScript',
			imagen: 'https://placeimg.com/640/480/any',
		},
	];

	// Limitamos la consulta a 10 libros
	const { size } = req.query;
	const limit = size || 10;

	// Push de libros
	res.json(books); // Respuesta
});

// El orden influye en la ejecucion
router.get('/filter', (req, res) => {
	res.send('Soy un filtro'); // Respuesta
});

// Recibimos un parametro (:) y enviamos una respuesta
router.get('/:id', (req, res) => {
	const { id } = req.params; // Destructuracion del parametro

	res.json({
		producto: {
			id,
			nombre: 'Producto 1',
			precio: 100,
		},
	}); // Respuesta con el parametro
});

// Respuesta con dos parametros
router.get('/categories/:categoryId/books/:booksId', (req, res) => {
	const { categoryId, booksId } = req.params; // Destructuracion del parametro

	res.json({
		producto: {
			categoryId,
			booksId,
			nombre: 'Book 1',
			precio: 100.0,
		},
	}); // Respuesta con el parametro
});

// Ruta para hacer post
router.post('/', (req, res) => {
	const body = req.body;
	res.json({
		message: 'Libro creado',
		data: body,
	});
});

module.exports = router;
