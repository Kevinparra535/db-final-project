const sequelize = require('../libs/sequelize');

class BooksService {
	constructor() {
		this.books = [];

		this.generate(); // Iniciamos nuestros servicios de libros
	}

	async generate() {
		const limit = 100;

		for (let i = 0; i < limit; i++) {
			this.books.push({
				id: i + 1,
				nombre: `Libro ${i + 1}`,
				precio: parseInt(Math.random() * 100),
				descripcion: `Descripcion del libro ${i + 1}`,
				imagen: 'https://placeimg.com/640/480/any',
			});
		}
	}

	// Funciones para los servicios
	async create(data) {
		const newBook = {
			id: this.books.length + 1,
			...data,
		};
		this.books.push(newBook);
		return newBook;
	}

	async find() {
		const { sequelize } = require('../libs/sequelize');
    const query = 'SELECT * FROM tasks';
    const [data, metadata] = await sequelize.query(query);
    return { data, metadata };
		// return new Promise((resolve, reject) => {
		// 	setTimeout(() => {
		// 		resolve(this.books);
		// 	}, 5000);
		// });
	}

	async findOne(id) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(this.books.find((item) => item.id === id));
			}, 5000);
		});
	}

	async update(id, changes) {
		const index = this.books.findIndex((item) => item.id === id);
		if (index === -1) {
			throw new Error('Book not found');
		}
		const book = this.books[index];
		this.books[index] = {
			...book,
			...changes,
		};
		return this.books[index];
	}

	async delete(id) {
		const index = this.books.findIndex((item) => item.id === id);
		if (index === -1) {
			throw new Error('Book not found');
		}
		this.books.splice(index, 1);
		return { id };
	}
}

module.exports = BooksService;
