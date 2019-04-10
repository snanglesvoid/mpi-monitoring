const keystone = require('keystone')
const pth = require('path')
const fs = require('fs')

exports = module.exports = async (req, res) => {
    let project = await keystone.list('Project').model.findOne({
        projectId : req.params.projectId
    })
    if (!project) {
        return res.status(404).send('not found')
    }
    let canWrite = req.user.isAdmin || (project.writePermission || []).find(x => req.user.id == x) !== undefined
    let canRead = (project.readPermission || []).find(x => req.user.id == x) !== undefined || canWrite

    if (!canWrite && !canRead) {
        return res.status(403).send('not authorized')
    }

    try {
        let path = __dirname + '/../../data/uploads/' + req.params.projectId + '/' + req.params.key + '/' + req.params.filename
        path = pth.resolve(path)

        let readStream = fs.createReadStream(path)
        res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=" + req.params.filename
        })
        readStream.pipe(res)
    }
    catch(error) {
        console.error(error)
        if (error.code === 'ENOENT') {
            res.status(404).send(error)
        }   
        else {
            res.status(500).send(error)
        }
    }
}