const keystone = require('keystone')

exports = module.exports = async (req, res) => {
    const view = new keystone.View(req, res)

    let locals = res.locals
    locals.section = 'projects'

    let readProjects = await keystone.list('Project').model
        .find({ readPermission: req.user.id })

    let writeProjects = await keystone.list('Project').model
        .find({ writePermission: req.user.id })

    let projects = []
    writeProjects.forEach(p => {
        if (!projects.find(x => x.id == p.id)) {
            projects.push(p)
        }
    })
    readProjects.forEach(p => {
        if (!projects.find(x => x.id == p.id)) {
            projects.push(p)
        }
    })

    locals.projects = projects


    locals.canEdit = function(project) {
        return writeProjects.includes(project)
    }

    view.render('account')
}