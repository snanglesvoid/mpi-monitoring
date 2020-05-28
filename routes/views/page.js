const keystone = require('keystone')

exports = module.exports = async (req, res) => {
	const view = new keystone.View(req, res)

	let page = await keystone
		.list('Page')
		.model.findOne({ slug: req.params.slug })

	console.log('slug', req.params.slug)
	console.log('page', page)

	if (!page) {
		return view.render('errors/404')
	}
	res.locals.page = page

	view.render('page')
}
