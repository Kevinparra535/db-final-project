const Joi = require('joi');

const id = Joi.string().uuid();
const name = Joi.string().alphanum().min(3).max(15);
const price = Joi.number().integer().min(1);

// Validacion para la creacion de un producto
const createBooksSchema = Joi.object().keys({
  name: name.required(),
  price: price.required(),
});

// Validacion para la actualizacion de un producto
const updateBooksSchema = Joi.object().keys({
  name,
  price,
});

// Obtener un id antes de mostrar
const getBooksSchema = Joi.object().keys({
  id: id.required(),
});

module.exports = { createBooksSchema, updateBooksSchema, getBooksSchema };
