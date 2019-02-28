const keystone = require('keystone')

exports = module.exports = async (req, res) => {
    const view = new keystone.View(req, res)

    view.render('account')
}