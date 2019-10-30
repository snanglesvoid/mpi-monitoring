const keystone = require("keystone");

exports = module.exports = async (req, res) => {
	const view = new keystone.View(req, res);

	let page = await keystone
		.list("Page")
		.model.findOne({ slug: req.params.slug });

	if (!page) {
		return view.render("errors/404");
	}

	view.render("page");
};
