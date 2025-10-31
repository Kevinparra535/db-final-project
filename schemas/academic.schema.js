const Joi = require('joi');

// ============================================================================
// CAMPOS COMUNES REUTILIZABLES
// ============================================================================

// Identificadores
const id_facultad = Joi.string().length(10);
const id_investigador = Joi.string().length(10);
const id_profesor = Joi.string().length(10);
const id_estudiante = Joi.string().length(10);
const id_grupo = Joi.string().length(10);
const id_linea = Joi.string().length(10);
const id_proyecto = Joi.string().length(12);
const id_producto = Joi.string().length(12);
const id_convocatoria = Joi.string().length(10);
const id_ptipo = Joi.string().length(10);
const id_afiliacion = Joi.string().length(10);
const id_autoria = Joi.string().length(10);

// Campos de personas
const nombres = Joi.string().max(80).required();
const apellidos = Joi.string().max(80).required();
const tipo_id = Joi.string().valid('CC', 'TI', 'CE', 'PP');
const num_id = Joi.string().max(20);
const email = Joi.string().email().max(120);
const telefono = Joi.string().max(20);

// Fechas
const fecha = Joi.date();
const anio = Joi.number().integer().min(2000).max(new Date().getFullYear() + 5);

// ============================================================================
// SCHEMAS DE FACULTAD
// ============================================================================

const createFacultadSchema = Joi.object({
	id_facultad: id_facultad.required(),
	nombre: Joi.string().max(150).required(),
	decano: Joi.string().max(150).optional(),
	sede: Joi.string().max(50).optional(),
	ciudad: Joi.string().max(50).optional(),
});

const updateFacultadSchema = Joi.object({
	nombre: Joi.string().max(150),
	decano: Joi.string().max(150),
	sede: Joi.string().max(50),
	ciudad: Joi.string().max(50),
});

const getFacultadSchema = Joi.object({
	id: id_facultad.required(),
});

// ============================================================================
// SCHEMAS DE INVESTIGADOR
// ============================================================================

const createInvestigadorSchema = Joi.object({
	id_investigador: id_investigador.required(),
	nombres: nombres,
	apellidos: apellidos,
	tipo_id: tipo_id.optional(),
	num_id: num_id.optional(),
	orcid: Joi.string().max(19).optional(),
	estado: Joi.string().valid('activo', 'inactivo').default('activo'),
	fecha_registro: fecha.required(),
});

const updateInvestigadorSchema = Joi.object({
	nombres: nombres.optional(),
	apellidos: apellidos.optional(),
	tipo_id: tipo_id.optional(),
	num_id: num_id.optional(),
	orcid: Joi.string().max(19).optional(),
	estado: Joi.string().valid('activo', 'inactivo'),
});

const getInvestigadorSchema = Joi.object({
	id: id_investigador.required(),
});

// Schemas para emails y teléfonos del investigador
const createInvestigadorEmailSchema = Joi.object({
	email: email.required(),
	etiqueta: Joi.string().valid('institucional', 'personal').required(),
});

const createInvestigadorTelefonoSchema = Joi.object({
	numero: telefono.required(),
	tipo: Joi.string().valid('móvil', 'fijo').required(),
});

// ============================================================================
// SCHEMAS DE PROFESOR
// ============================================================================

const createProfesorSchema = Joi.object({
	id_profesor: id_profesor.required(),
	nombres: nombres,
	apellidos: apellidos,
	tipo_id: tipo_id.optional(),
	num_id: num_id.required(),
	correo_institucional: email.optional(),
	telefono: telefono.optional(),
	fecha_nacimiento: fecha.required(),
	categoria: Joi.string().valid('auxiliar', 'asistente', 'asociado', 'titular').optional(),
	dedicacion: Joi.string().valid('TC', 'MT', 'HC').optional(),
	departamento: Joi.string().max(100).required(),
});

const updateProfesorSchema = Joi.object({
	nombres: nombres.optional(),
	apellidos: apellidos.optional(),
	tipo_id: tipo_id.optional(),
	num_id: num_id.optional(),
	correo_institucional: email.optional(),
	telefono: telefono.optional(),
	fecha_nacimiento: fecha.optional(),
	categoria: Joi.string().valid('auxiliar', 'asistente', 'asociado', 'titular').optional(),
	dedicacion: Joi.string().valid('TC', 'MT', 'HC').optional(),
	departamento: Joi.string().max(100).optional(),
});

const getProfesorSchema = Joi.object({
	id: id_profesor.required(),
});

// Schema para emails adicionales del profesor
const createProfesorEmailSchema = Joi.object({
	email: email.required(),
});

// ============================================================================
// SCHEMAS DE ESTUDIANTE
// ============================================================================

const createEstudianteSchema = Joi.object({
	id_estudiante: id_estudiante.required(),
	nombres: Joi.string().max(50).required(),
	apellidos: Joi.string().max(50).required(),
	tipo_id: tipo_id.optional(),
	num_id: num_id.optional(),
	codigo_estudiantil: Joi.string().length(12).optional(),
	programa: Joi.string().max(120).optional(),
	nivel: Joi.string().valid('pregrado', 'maestría', 'doctorado').required(),
	semestre: Joi.number().integer().min(1).max(10).optional(),
	correo_institucional: email.required(),
});

const updateEstudianteSchema = Joi.object({
	nombres: Joi.string().max(50).optional(),
	apellidos: Joi.string().max(50).optional(),
	tipo_id: tipo_id.optional(),
	num_id: num_id.optional(),
	codigo_estudiantil: Joi.string().length(12).optional(),
	programa: Joi.string().max(120).optional(),
	nivel: Joi.string().valid('pregrado', 'maestría', 'doctorado').optional(),
	semestre: Joi.number().integer().min(1).max(10).optional(),
	correo_institucional: email.optional(),
});

const getEstudianteSchema = Joi.object({
	id: id_estudiante.required(),
});

// ============================================================================
// SCHEMAS DE GRUPO DE INVESTIGACIÓN
// ============================================================================

const createGrupoSchema = Joi.object({
	id_grupo: id_grupo.required(),
	nombre: Joi.string().max(150).required(),
	clasificacion: Joi.string().valid('A1', 'A', 'B', 'C', 'Reconocido').optional(),
	facultad: id_facultad.required(),
});

const updateGrupoSchema = Joi.object({
	nombre: Joi.string().max(150).optional(),
	clasificacion: Joi.string().valid('A1', 'A', 'B', 'C', 'Reconocido').optional(),
	facultad: id_facultad.optional(),
});

const getGrupoSchema = Joi.object({
	id: id_grupo.required(),
});

// ============================================================================
// SCHEMAS DE LÍNEA DE INVESTIGACIÓN
// ============================================================================

const createLineaSchema = Joi.object({
	id_linea: id_linea.required(),
	nombre: Joi.string().max(150).required(),
});

const updateLineaSchema = Joi.object({
	nombre: Joi.string().max(150).optional(),
});

const getLineaSchema = Joi.object({
	id: id_linea.required(),
});

// ============================================================================
// SCHEMAS DE CONVOCATORIA
// ============================================================================

const createConvocatoriaSchema = Joi.object({
	id_convocatoria: id_convocatoria.required(),
	nombre: Joi.string().max(150).required(),
	tipo: Joi.string().valid('interna', 'Minciencias', 'internacional', 'otra').required(),
	entidad: Joi.string().max(150).required(),
	anio: anio.required(),
	fecha_apertura: fecha.optional(),
	fecha_cierre: fecha.required(),
	monto_maximo: Joi.number().precision(2).optional(),
});

const updateConvocatoriaSchema = Joi.object({
	nombre: Joi.string().max(150).optional(),
	tipo: Joi.string().valid('interna', 'Minciencias', 'internacional', 'otra').optional(),
	entidad: Joi.string().max(150).optional(),
	anio: anio.optional(),
	fecha_apertura: fecha.optional(),
	fecha_cierre: fecha.optional(),
	monto_maximo: Joi.number().precision(2).optional(),
});

const getConvocatoriaSchema = Joi.object({
	id: id_convocatoria.required(),
});

// ============================================================================
// SCHEMAS DE PROYECTO DE INVESTIGACIÓN
// ============================================================================

const createProyectoSchema = Joi.object({
	id_proyecto: id_proyecto.required(),
	codigo_interno: Joi.string().max(30).optional(),
	titulo: Joi.string().max(200).required(),
	resumen: Joi.string().optional(),
	grupo: id_grupo.optional(),
	convocatoria: id_convocatoria.optional(),
	fecha_inicio: fecha.required(),
	fecha_fin: fecha.optional(),
	estado: Joi.string().valid('propuesto', 'ejecución', 'finalizado', 'suspendido').required(),
	presupuesto_aprobado: Joi.number().precision(2).optional(),
});

const updateProyectoSchema = Joi.object({
	codigo_interno: Joi.string().max(30).optional(),
	titulo: Joi.string().max(200).optional(),
	resumen: Joi.string().optional(),
	grupo: id_grupo.optional(),
	convocatoria: id_convocatoria.optional(),
	fecha_inicio: fecha.optional(),
	fecha_fin: fecha.optional(),
	estado: Joi.string().valid('propuesto', 'ejecución', 'finalizado', 'suspendido').optional(),
	presupuesto_aprobado: Joi.number().precision(2).optional(),
});

const getProyectoSchema = Joi.object({
	id: id_proyecto.required(),
});

// ============================================================================
// SCHEMAS DE TIPO DE PRODUCTO
// ============================================================================

const createProductoTipoSchema = Joi.object({
	id_ptipo: id_ptipo.required(),
	nombre: Joi.string().max(120).required(),
});

const updateProductoTipoSchema = Joi.object({
	nombre: Joi.string().max(120).optional(),
});

const getProductoTipoSchema = Joi.object({
	id: id_ptipo.required(),
});

// ============================================================================
// SCHEMAS DE PRODUCTO DE INVESTIGACIÓN
// ============================================================================

const createProductoSchema = Joi.object({
	id_producto: id_producto.required(),
	proyecto: id_proyecto.optional(),
	tipo_producto: id_ptipo.optional(),
	titulo: Joi.string().max(200).required(),
	resumen: Joi.string().optional(),
	doi: Joi.string().max(100).optional(),
	fecha_publicado: fecha.required(),
	url: Joi.string().uri().max(300).optional(),
	metadatos: Joi.object().optional(), // JSONB flexible
});

const updateProductoSchema = Joi.object({
	proyecto: id_proyecto.optional(),
	tipo_producto: id_ptipo.optional(),
	titulo: Joi.string().max(200).optional(),
	resumen: Joi.string().optional(),
	doi: Joi.string().max(100).optional(),
	fecha_publicado: fecha.optional(),
	url: Joi.string().uri().max(300).optional(),
	metadatos: Joi.object().optional(),
});

const getProductoSchema = Joi.object({
	id: id_producto.required(),
});

// ============================================================================
// SCHEMAS DE AFILIACIÓN
// ============================================================================

const createAfiliacionSchema = Joi.object({
	id_afiliacion: id_afiliacion.required(),
	investigador: id_investigador.required(),
	grupo: id_grupo.required(),
	rol: Joi.string().valid('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo').required(),
	fecha_inicio: fecha.required(),
	fecha_fin: fecha.optional(),
});

const updateAfiliacionSchema = Joi.object({
	rol: Joi.string().valid('líder', 'coinvestigador', 'semillerista', 'asistente', 'administrativo').optional(),
	fecha_fin: fecha.optional(),
});

const getAfiliacionSchema = Joi.object({
	id: id_afiliacion.required(),
});

// ============================================================================
// SCHEMAS DE AUTORÍA
// ============================================================================

const createAutoriaSchema = Joi.object({
	id_autoria: id_autoria.required(),
	investigador: id_investigador.required(),
	producto: id_producto.required(),
	orden_autor: Joi.number().integer().min(1).optional(),
	rol_autor: Joi.string().valid('autor', 'coautor', 'director').optional(),
	fecha_fin: fecha.optional(),
});

const updateAutoriaSchema = Joi.object({
	orden_autor: Joi.number().integer().min(1).optional(),
	rol_autor: Joi.string().valid('autor', 'coautor', 'director').optional(),
	fecha_fin: fecha.optional(),
});

const getAutoriaSchema = Joi.object({
	id: id_autoria.required(),
});

// ============================================================================
// SCHEMAS DE RELACIONES MANY-TO-MANY
// ============================================================================

const createGrupoLineaSchema = Joi.object({
	id_grupo: id_grupo.required(),
	id_linea: id_linea.required(),
});

const createProyectoLineaSchema = Joi.object({
	id_proyecto: id_proyecto.required(),
	id_linea: id_linea.required(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
	// Facultad
	createFacultadSchema,
	updateFacultadSchema,
	getFacultadSchema,

	// Investigador
	createInvestigadorSchema,
	updateInvestigadorSchema,
	getInvestigadorSchema,
	createInvestigadorEmailSchema,
	createInvestigadorTelefonoSchema,

	// Profesor
	createProfesorSchema,
	updateProfesorSchema,
	getProfesorSchema,
	createProfesorEmailSchema,

	// Estudiante
	createEstudianteSchema,
	updateEstudianteSchema,
	getEstudianteSchema,

	// Grupo de investigación
	createGrupoSchema,
	updateGrupoSchema,
	getGrupoSchema,

	// Línea de investigación
	createLineaSchema,
	updateLineaSchema,
	getLineaSchema,

	// Convocatoria
	createConvocatoriaSchema,
	updateConvocatoriaSchema,
	getConvocatoriaSchema,

	// Proyecto de investigación
	createProyectoSchema,
	updateProyectoSchema,
	getProyectoSchema,

	// Tipo de producto
	createProductoTipoSchema,
	updateProductoTipoSchema,
	getProductoTipoSchema,

	// Producto de investigación
	createProductoSchema,
	updateProductoSchema,
	getProductoSchema,

	// Afiliación
	createAfiliacionSchema,
	updateAfiliacionSchema,
	getAfiliacionSchema,

	// Autoría
	createAutoriaSchema,
	updateAutoriaSchema,
	getAutoriaSchema,

	// Relaciones many-to-many
	createGrupoLineaSchema,
	createProyectoLineaSchema,
};
