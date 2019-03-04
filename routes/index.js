
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
};
