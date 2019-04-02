
var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);
	app.get('/account', middleware.requireUser, routes.views.account);
	app.get('/page/:slug', routes.views.page);
	app.all('/changePassword', middleware.requireUser, routes.views.changePassword);
	app.all('/project/:id', middleware.requireUser, routes.views.project);
	app.all('/login', routes.views.login);
	app.all('/register/:token', routes.views.register);

	app.get('/password-generator', middleware.requireAdmin, routes.views['password-generator'])
	app.get('/projects-upload', middleware.requireAdmin, routes.views['projects-upload'].get)
	app.post('/projects-upload', middleware.requireAdmin, routes.views['projects-upload'].post)
	app.get('/project-detail-upload', middleware.requireAdmin, routes.views['project-detail-upload'].get)
	app.post('/project-detail-upload', middleware.requireAdmin, routes.views['project-detail-upload'].post)
	app.get('/csv-to-excel', middleware.requireAdmin, routes.views['csv-to-excel'].get)
	app.post('/csv-to-excel', middleware.requireAdmin, routes.views['csv-to-excel'].post)
};
