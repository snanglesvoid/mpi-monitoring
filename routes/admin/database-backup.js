const keystone = require("keystone");

exports = module.exports = async (req, res) => {
	let EvaluationPeriod = await keystone.list("EvaluationPeriod").model.find();
	let Milestone = await keystone.list("Milestone").model.find();
	let OperationField = await keystone.list("OperationField").model.find();
	let Page = await keystone.list("Page").model.find();
	let Project = await keystone.list("Project").model.find();
	let Themecluster = await keystone.list("Themecluster").model.find();
	let User = await keystone.list("User").model.find();

	let db = {
		EvaluationPeriod,
		Milestone,
		OperationField,
		Page,
		Project,
		Themecluster,
		User,
	};

	res.json(db);
};
