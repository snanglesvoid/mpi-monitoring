const keystone = require('keystone')

module.exports.get = (req, res) => {
    const view = new keystone.View(req, res)
    view.render('csv-to-excel')
}

module.exports.post = (req, res) => {
    console.log(req.body)
    res.json(req.body)
}