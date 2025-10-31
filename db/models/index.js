// Importar todos los modelos
const { User, UserSchema } = require('./user.model');

// Entidades académicas principales
const { Facultad, FacultadSchema } = require('./facultad.model');
const { Investigador, InvestigadorSchema } = require('./investigador.model');
const { InvestigadorCorreo, InvestigadorCorreoSchema } = require('./investigador-correo.model');
const { InvestigadorTelefono, InvestigadorTelefonoSchema } = require('./investigador-telefono.model');
const { Profesor, ProfesorSchema } = require('./profesor.model');
const { ProfesorCorreo, ProfesorCorreoSchema } = require('./profesor-correo.model');
const { Estudiante, EstudianteSchema } = require('./estudiante.model');

// Estructura académica
const { LineaInvestigacion, LineaInvestigacionSchema } = require('./linea-investigacion.model');
const { GrupoInvestigacion, GrupoInvestigacionSchema } = require('./grupo-investigacion.model');
const { GrupoLinea, GrupoLineaSchema } = require('./grupo-linea.model');

// Proyectos y productos
const { Convocatoria, ConvocatoriaSchema } = require('./convocatoria.model');
const { ProyectoInvestigacion, ProyectoInvestigacionSchema } = require('./proyecto-investigacion.model');
const { ProyectoLinea, ProyectoLineaSchema } = require('./proyecto-linea.model');
const { ProductoTipo, ProductoTipoSchema } = require('./producto-tipo.model');
const { ProductoInvestigacion, ProductoInvestigacionSchema } = require('./producto-investigacion.model');

// Relaciones
const { Afiliacion, AfiliacionSchema } = require('./afiliacion.model');
const { Autoria, AutoriaSchema } = require('./autoria.model');

// Este es el setup inicial de sequelize
function setupModels(sequelize) {
	// Inicializar todos los modelos
	User.init(UserSchema, User.config(sequelize));

	// Entidades principales
	Facultad.init(FacultadSchema, Facultad.config(sequelize));
	Investigador.init(InvestigadorSchema, Investigador.config(sequelize));
	InvestigadorCorreo.init(InvestigadorCorreoSchema, InvestigadorCorreo.config(sequelize));
	InvestigadorTelefono.init(InvestigadorTelefonoSchema, InvestigadorTelefono.config(sequelize));
	Profesor.init(ProfesorSchema, Profesor.config(sequelize));
	ProfesorCorreo.init(ProfesorCorreoSchema, ProfesorCorreo.config(sequelize));
	Estudiante.init(EstudianteSchema, Estudiante.config(sequelize));

	// Estructura académica
	LineaInvestigacion.init(LineaInvestigacionSchema, LineaInvestigacion.config(sequelize));
	GrupoInvestigacion.init(GrupoInvestigacionSchema, GrupoInvestigacion.config(sequelize));
	GrupoLinea.init(GrupoLineaSchema, GrupoLinea.config(sequelize));

	// Proyectos y productos
	Convocatoria.init(ConvocatoriaSchema, Convocatoria.config(sequelize));
	ProyectoInvestigacion.init(ProyectoInvestigacionSchema, ProyectoInvestigacion.config(sequelize));
	ProyectoLinea.init(ProyectoLineaSchema, ProyectoLinea.config(sequelize));
	ProductoTipo.init(ProductoTipoSchema, ProductoTipo.config(sequelize));
	ProductoInvestigacion.init(ProductoInvestigacionSchema, ProductoInvestigacion.config(sequelize));

	// Relaciones
	Afiliacion.init(AfiliacionSchema, Afiliacion.config(sequelize));
	Autoria.init(AutoriaSchema, Autoria.config(sequelize));

	// Configurar asociaciones después de que todos los modelos estén inicializados
	User.associate(sequelize.models);
	Facultad.associate(sequelize.models);
	Investigador.associate(sequelize.models);
	InvestigadorCorreo.associate(sequelize.models);
	InvestigadorTelefono.associate(sequelize.models);
	Profesor.associate(sequelize.models);
	ProfesorCorreo.associate(sequelize.models);
	Estudiante.associate(sequelize.models);
	LineaInvestigacion.associate(sequelize.models);
	GrupoInvestigacion.associate(sequelize.models);
	GrupoLinea.associate(sequelize.models);
	Convocatoria.associate(sequelize.models);
	ProyectoInvestigacion.associate(sequelize.models);
	ProyectoLinea.associate(sequelize.models);
	ProductoTipo.associate(sequelize.models);
	ProductoInvestigacion.associate(sequelize.models);
	Afiliacion.associate(sequelize.models);
	Autoria.associate(sequelize.models);
}

module.exports = setupModels;
