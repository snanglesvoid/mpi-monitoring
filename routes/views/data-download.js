const keystone = require('keystone')
const asyncForEach = require('../../lib/asyncforeach')

exports = module.exports = async (req, res) => {
    let view = new keystone.View(req, res)
    let locals = res.locals

    locals.lists = [
        'Milestone', 'Project', 'User'
    ].map(x => keystone.list(x))

    view.on('post', async next => {
        next()
    })

    view.render('data-download')
}