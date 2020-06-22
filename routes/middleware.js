const _ = require('lodash')
const UAParser = require('ua-parser-js')

/**
	Initialises the standard view locals
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [{ label: 'Home', key: 'home', href: '/' }]
	if (req.user) {
		res.locals.navLinks.push({
			label: 'Meine Projekte',
			key: 'projects',
			href: '/account',
		})
	}
	res.locals.user = req.user
	res.locals.showFooter = true
	next()
}

exports.ensureBrowser = function (req, res, next) {
	let parser = new UAParser()
	let ua = req.headers['user-agent']
	let browserName = parser.setUA(ua).getBrowser().name

	// console.log('browser name: ', browserName)
	// let fullBrowserVersion = parser.setUA(ua).getBrowser().version
	// let browserVersion = fullBrowserVersion.split('.', 1).toString()
	// let browserVersionNumber = Number(browserVersion)

	if (browserName === 'IE') {
		req.flash(
			'warning',
			'Internet Explorer wird nicht mehr von Microsoft unterstützt! Falls Probleme auftreten verwenden Sie bitte einen modernen Browser (z.B. Firefox, Chrome, Safari oder Microsoft Edge).',
		)
	}
	next()
}

/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	// console.log('flash messages')
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	}
	res.locals.messages = _.some(flashMessages, function (msgs) {
		return msgs.length
	})
		? flashMessages
		: false
	next()
}

/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash(
			'error',
			'Bitte melden Sie sich an um Zugang zu dieser Seite zu erhalten.',
		)
		res.redirect('/login')
	} else {
		next()
	}
}

exports.requireAdmin = function (req, res, next) {
	if (req.user && req.user.isAdmin) {
		next()
	} else {
		req.flash(
			'error',
			'Bitte melden Sie sich als Administrator an um Zugang zu dieser Seite zu erhalten.',
		)
		res.redirect('/login')
	}
}
