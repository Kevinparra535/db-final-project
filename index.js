/* eslint-disable no-console */
const express = require('express');
const { logErrors, errorHandler, boomErrorHandler, ormErrorHandler } = require('./middleware/erros.handler');
const routerApi = require('./routes/index');

const app = express();

const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello world!'); // Respuesta
});

routerApi(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(errorHandler);
app.use(boomErrorHandler);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`);
});
