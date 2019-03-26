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

    let milestones = await keystone.list('Milestone').model.find({ project : project.id })
        .sort('date')
        .exec()
    let opFields = await keystone.list('OperationField').model.find().exec()
    let themeclusters = await keystone.list('Themecluster').model.find().exec()

    locals.opFields = opFields || []
    locals.themeclusters = themeclusters || []

    let canWrite = req.user.isAdmin || (project.writePermission || []).find(x => req.user.id == x.id) !== undefined
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
            let field = opFields.find(x => x._id.equals(req.body['measure.field']))
            project.measure.field = field ? field.id : null 
            project.measure.goal = req.body['measure.goal']
            let sd = new Date(req.body['measure.startDate'])
            project.measure.startDate = isNaN(sd.getTime()) ? null : sd
            let ed = new Date(req.body['measure.endDate'])
            project.measure.endDate = isNaN(ed.getTime()) ? null : ed

            project.administration.institution = req.body['administration.institution']
            project.administration.name = req.body['administration.name']
            project.administration.email = req.body['administration.email']
            project.administration.phone = req.body['administration.phone']

            project.budget = req.body.budget
            project.main.funding = req.body['main.funding']
            project.main.personel = req.body['main.personel']
            project.main.resources = req.body['main.resources']
            project.support1.name = req.body['support1.name']
            project.support1.funding = req.body['support1.funding']
            project.support1.personel = req.body['support1.personel']
            project.support1.resources = req.body['support1.resources']
            project.support2.name = req.body['support2.name']
            project.support2.funding = req.body['support2.funding']
            project.support2.personel = req.body['support2.personel']
            project.support2.resources = req.body['support2.resources']

            project.output.description = req.body['output.description']
            project.output.contribution = req.body['output.contribution']
            project.output.indicators = req.body['output.indicators']

            let ptcs = []
           
            themeclusters.forEach(tc => {
                if (req.body[tc.title]) {
                    ptcs.push(tc._id)
                }
            })

            project.output.themecluster = ptcs

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
            console.error(error)
            req.flash('error', 'Es ist ein Fehler aufgetreten.')
            return next(error)
        }
        req.flash('success', 'Ihre Änderungen wurden gespeichert.')
        
        res.redirect('back')
    })

    view.render('project')
}