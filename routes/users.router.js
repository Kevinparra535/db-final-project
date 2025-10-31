const express = require('express');
const router = express.Router();

// Parametros tipo Query http://.../users?limit=10&offset=200
router.get('/', (req, res) => {
  const { limit, offset } = req.query; // Destructuracion del parametro

  if (limit && offset) {
    // Valiadmos que existan los parametros
    res.json({
      limit,
      offset,
    });
  } else {
    res.send('No hay parametros'); // Respuesta con el parametro
  }
});

module.exports = router;
