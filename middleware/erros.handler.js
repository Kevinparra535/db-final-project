/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
// Detector de errores globales

const { ValidationError } = require('sequelize');
const boom = require('@hapi/boom');

// Middleware para capturar errores globales
function logErrors(err, req, res, next) {
  console.error(err);

  // Si se envia el parametro error le decimos que es un Middleware tipo error
  next(err); // Envia el error al siguiente middleware
}

// Middleware para formatear los errores
// Siempre debe tener los 4 parametros
function errorHandler(err, req, res, next) {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // En donde ocurrio el error
  });
}

// Detector de errores para boom
function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json({
      error: output.payload,
    });
  }
  next(err);
}


// Validamos si hay un error de validacion,ejemplo explicito en los correos repetidos
function ormErrorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(409).json({
      statusCode: 409,
      message: err.name,
      errors: err.errors,
    });
  }
  next(err);
}

module.exports = { logErrors, errorHandler, boomErrorHandler, ormErrorHandler };
