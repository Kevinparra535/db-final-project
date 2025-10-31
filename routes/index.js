// Este archivo sera nuestro sistema de routing

// ============================================================================
// RUTAS TEMPORALES (EJEMPLO DE FLUJO)
// ============================================================================
const homeRoutes = require('./home.router');
const booksRoutes = require('./books.router'); // TEMPORAL - solo ejemplo de flujo
const userRoutes = require('./users.router');

// ============================================================================
// RUTAS ACADÉMICAS (SISTEMA REAL)
// ============================================================================
const facultadesRoutes = require('./facultades.router');
const investigadoresRoutes = require('./investigadores.router');
const profesoresRoutes = require('./profesores.router');
const estudiantesRoutes = require('./estudiantes.router');
const gruposRoutes = require('./grupos.router');
const lineasRoutes = require('./lineas.router');
const convocatoriasRoutes = require('./convocatorias.router');
const proyectosRoutes = require('./proyectos.router');
const productosRoutes = require('./productos.router');
const tiposProductoRoutes = require('./tipos-producto.router');
const afiliacionesRoutes = require('./afiliaciones.router');
const autoriasRoutes = require('./autorias.router');

function routerApi(app) {
	// ========================================================================
	// RUTAS TEMPORALES (EJEMPLO DE FLUJO)
	// ========================================================================
	app.use('/api/v1/', homeRoutes);
	app.use('/api/v1/books', booksRoutes); // TEMPORAL - solo ejemplo de flujo
	app.use('/api/v1/user', userRoutes);

	// ========================================================================
	// RUTAS ACADÉMICAS (SISTEMA REAL)
	// ========================================================================
	// Entidades principales
	app.use('/api/v1/facultades', facultadesRoutes);
	app.use('/api/v1/investigadores', investigadoresRoutes);
	app.use('/api/v1/profesores', profesoresRoutes);
	app.use('/api/v1/estudiantes', estudiantesRoutes);

	// Grupos y líneas de investigación
	app.use('/api/v1/grupos', gruposRoutes);
	app.use('/api/v1/lineas', lineasRoutes);

	// Convocatorias y proyectos
	app.use('/api/v1/convocatorias', convocatoriasRoutes);
	app.use('/api/v1/proyectos', proyectosRoutes);

	// Productos y tipos
	app.use('/api/v1/productos', productosRoutes);
	app.use('/api/v1/tipos-producto', tiposProductoRoutes);

	// Relaciones
	app.use('/api/v1/afiliaciones', afiliacionesRoutes);
	app.use('/api/v1/autorias', autoriasRoutes);
}

module.exports = routerApi;
