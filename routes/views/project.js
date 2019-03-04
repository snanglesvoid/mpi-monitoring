const keystone = require('keystone')

exports = module.exports = async (req, res) => {
    let view = new keystone.View(req, res)

    let locals = res.locals


    let project = await keystone.list('Project').model.findOne({
        projectId : req.params.id,
    })
    .populate('milestones readPermission writePermission output.themecluster measure.field')
    .exec()

    if (!project) {
        req.flash('Kein Projekt mit dieser projektId konnte gefunden werden!')
        return view.render('errors/404')
    }

    let milestones = await keystone.list('Milestone').model.find({ project : project.id }).exec()

    let opFields = await keystone.list('OperationField').model.find().exec()
    let themeclusters = await keystone.list('Themecluster').model.find().exec()

    locals.opFields = opFields || []
    locals.themeclusters = themeclusters || []

    let canWrite = (project.writePermission || []).find(x => req.user.id == x.id) !== undefined
    let canRead = (project.readPermission || []).find(x => req.user.id == x.id) !== undefined || canWrite

    if (!canWrite && !canRead) {
        return view.render('errors/403')
    }

    locals.canEdit = canWrite
    locals.project = project
    locals.milestones = milestones

    view.on('post', async next => {
        if (!locals.canEdit) {
            req.flash('error', 'you should not be trying to edit this')
            return view.render('errors/403')
        }

        //update project
        try {
            console.log(req.body)
            project.notes = req.body.notes
            project.measure.description = req.body['measure.description']
            let field = opFields.find(x => x.title == req.body['measure.field'])
            project.measure.field = field ? field.id : null 
            project.measure.goal = req.body['measure.goal']

            await project.save()

            milestones.forEach(async milestone => {
                let key = milestone.key
                milestone.description = req.body[key + '.description']
                milestone.notes = req.body[key + '.notes']
                milestone.state = req.body[key + '.state']
                milestone.evaluation = req.body[key + '.evaluation']
                await milestone.save()
            })
        }
        catch (error) {
            return next(error)
        }
        res.redirect('back')
    })

    view.render('project')
}