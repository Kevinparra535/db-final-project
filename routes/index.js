// Este archivo sera nuestro sistema de routing

const homeRoutes = require('./home.router');
const booksRoutes = require('./books.router');
const userRoutes = require('./users.router');

function routerApi(app) {
	app.use('/api/v1/', homeRoutes);
	app.use('/api/v1/books', booksRoutes);
	app.use('/api/v1/user', userRoutes);
}

module.exports = routerApi;
