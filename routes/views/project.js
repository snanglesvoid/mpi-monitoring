const keystone = require('keystone')

exports = module.exports = async (req, res) => {
    let view = new keystone.View(req, res)

    let locals = res.locals


    let project = await keystone.list('Project').model.findOne({
        projectId : req.params.id,
    })
    .populate('milestones readPermission writePermission output.themecluster measure.field')
    .exec()

    console.log(project);
    (project.readPermission || []).forEach(console.log);
    (project.writePermission || []).forEach(console.log)

    let canWrite = (project.writePermission || []).find(x => req.user.id == x.id) !== undefined
    let canRead = (project.readPermission || []).find(x => req.user.id == x.id) !== undefined || canWrite

    if (!canWrite && !canRead) {
        return view.render('errors/403')
    }

    locals.canEdit = canWrite


    locals.project = project

    view.on('post', async next => {
        if (!locals.canEdit) {
            req.flash('error', 'you should not be trying to edit this')
            return view.render('errors/403')
        }

        //update project
        try {
            let handler = project.getUpdateHandler()
            await project.save()
        }
        catch (error) {
            return next(error)
        }
        finally {
            next()
        }
    })

    view.render('project')
}