/* eslint-disable no-console */
const express = require('express');
const faker = require('faker');
// Creamos una nueva aplicacion de express
const app = express();

// Puerto
const port = 3000;

// Rutas
app.get('/', (req, res) => {
  res.send('Hello world!'); // Respuesta
});

app.get('/nueva-ruta', (req, res) => {
  res.send('Otro endpoint'); // Respuesta
});

// Devuelve un JSON
app.get('/products', (req, res) => {
  // Creamos un array de productos
  const productos = [];

  // Limitamos la consulta a 10 productos
  const { size } = req.query;
  const limit = size || 10;

  // Push de productos
  for (let i = 0; i < limit; i++) {
    productos.push({
      id: i,
      nombre: faker.commerce.productName(),
      precio: parseInt(faker.commerce.price(), 10), // Numero en base 10
      descripcion: faker.lorem.sentence(),
      imagen: faker.image.imageUrl(),
    });
  }

  res.json(productos); // Respuesta
});

// El orden influye en la ejecucion
app.get('/products/filter', (req, res) => {
  res.send('Soy un filtro'); // Respuesta
})

// Recibimos un parametro (:) y enviamos una respuesta
app.get('/productos/:id', (req, res) => {
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
app.get('/categories/:categoryId/products/:productsId', (req, res) => {
  const { categoryId, productsId } = req.params; // Destructuracion del parametro

  res.json({
    producto: {
      categoryId,
      productsId,
      nombre: 'Producto 1',
      precio: 100.0,
    },
  }); // Respuesta con el parametro
});

// Parametros tipo Query http://.../users?limit=10&offset=200
app.get('/users', (req, res) => {
  const { limit, offset } = req.query; // Destructuracion del parametro

  if (limit && offset) { // Valiadmos que existan los parametros
    res.json({
      limit,
      offset,
    });
  } else {
    res.send('No hay parametros'); // Respuesta con el parametro
  }
});

// Le decimos que escuche en el puerto 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
