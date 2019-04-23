
var keystone = require('keystone');
var multer = require('multer')
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', middleware.ensureBrowser);

let upload = multer({ dest: 'uploads/' })

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	// app.use(middleware.fileUpload)
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
	app.all('/data-download', middleware.requireAdmin, routes.views['data-download'])

	app.all('/uploads/*', middleware.requireAdmin, routes.views.uploads)
	app.all('/uploads', (req, res) => res.redirect('/uploads/'))

	app.get('/upload/:projectId/:key', [middleware.requireUser], routes.views.upload.get)
	app.post('/upload/:projectId/:key', [middleware.requireUser, upload.single('avatar')], routes.views.upload.post)
	app.delete('/upload/:projectId/:key/:filename', [middleware.requireUser], routes.views.upload.delete)
	app.get('/download/:projectId/:key/:filename', [middleware.requireUser], routes.views.download)
};
