const keystone = require('keystone')

exports = module.exports = async (req, res) => {
    console.log(req.body)
    console.log(req.files)
    res.send(req.body)
}