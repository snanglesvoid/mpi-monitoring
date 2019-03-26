const _ = require('lodash');


/**
	Initialises the standard view locals
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
	];
	if (req.user) {
		res.locals.navLinks.push({
			label: 'Meine Projekte', key: 'projects', href: '/account'
		})
	}
	res.locals.user = req.user;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Bitte melden Sie sich an um Zugang zu dieser Seite zu erhalten.');
		res.redirect('/login');
	} else {
		next();
	}
};

exports.requireAdmin = function(req, res, next) {
	if (req.user && req.user.isAdmin) {
		next()
	} else {
		req.flash('error', 'Bitte melden Sie sich als Administrator an um Zugang zu dieser Seite zu erhalten.')
		res.redirect('/login')
	}
}
