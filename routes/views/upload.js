const keystone = require('keystone')
const fs = require('fs')
const pth = require('path')
const pathSanitize = require('../../lib/pathsanitize')
const asyncForEach = require('../../lib/asyncforeach')
const afs = require('../../lib/asyncfs')

module.exports.get = async (req, res) => {
    const view = new keystone.View(req, res)
    let project = await keystone.list('Project').model.findOne({ 
        projectId : req.params.projectId 
    })
    if (!project) {
        req.flash('error', 'Projekt Id ungueltig!')
        return view.render('errors/404')
    }
    let canWrite = req.user.isAdmin || (project.writePermission || []).find(x => req.user.id == x) !== undefined
    let canRead = (project.readPermission || []).find(x => req.user.id == x) !== undefined || canWrite

    if (!canWrite && !canRead) {
        req.flash('error', 'Nicht autorisiert')
        return view.render('errors/403')
    }

    try {
        let path = __dirname + '/../../data/uploads/' + req.params.projectId + '/' + req.params.key + '/'
        path = pathSanitize(pth.resolve(path))

        let items = await afs.readDir(path)

        let result = []
        await asyncForEach(items, async item => new Promise(async (resolve, reject) => {
            fs.stat(path + '/' + item, (err, stats) => {
                if (err) return reject(err)
                result.push({
                    filename : item, meta : stats
                })
                return resolve()
            })
        }))

        res.json({
            msg: 'ok',
            data: result
        })
    }
    catch (error) {
        console.error(error)
        if (error.code === 'ENOENT') {
            res.json({
                msg: 'no such directory',
                data: []
            })
        }
        else {
            res.status(500).json({
                msg: 'error', error: error
            })
        }
    }
}

module.exports.post = async (req, res) => {
    const view = new keystone.View(req, res)

    let project = await keystone.list('Project').model.findOne({ 
        projectId : req.params.projectId 
    })
    if (!project) {
        req.flash('error', 'Projekt Id ungueltig!')
        return view.render('errors/404')
    }
    let canWrite = req.user.isAdmin || (project.writePermission || []).find(x => req.user.id == x) !== undefined
    if (!canWrite) {
        req.flash('error', 'Nicht autorisiert')
        return view.render('errors/403')
    }

    console.log(req.files)
    
    if (!req.files.file) {
        return res.status(500).send('error')
    }

    try {
        let path = __dirname + '/../../data/uploads/' + req.params.projectId + '/' + req.params.key + '/'
        path = pathSanitize(pth.resolve(path))
        console.log('path', path)
        await afs.ensureDir(path)
        let readStream = fs.createReadStream(req.files.file.path)
        let writeStream = fs.createWriteStream(path + '/' + req.files.file.originalname)
        readStream.pipe(writeStream)
    
        readStream.on('end', () => {
            req.flash('success', 'Upload erfolgreich.')
            res.redirect(302, '/project/' + req.params.projectId)
        })
    }
    catch (error) {
        console.error(error)
        req.flash(error)
        view.render('errors/500')
    }
}

module.exports.delete = async (req, res) => {
    console.log('delete route')
    const view = new keystone.View(req, res)
    let project = await keystone.list('Project').model.findOne({ 
        projectId : req.params.projectId 
    })
    if (!project) {
        req.flash('error', 'Projekt Id ungueltig!')
        return res.status(422).send('Projekt Id ungueltig!')
    }
    let canWrite = req.user.isAdmin || (project.writePermission || []).find(x => req.user.id == x) !== undefined

    if (!canWrite) {
        req.flash('error', 'Nicht autorisiert')
        return res.status(403).send('Nicht autorisiert')
    }
    
    try {
        let path = pth.resolve(__dirname + '/../../data/uploads/' + req.params.projectId + '/' + req.params.key + '/' + req.params.filename)
        path = pathSanitize(path)
        fs.unlink(path, err => {
            if (err) throw err
            else {
                // res.json({
                //     msg: 'ok'
                // })
                req.flash('success', 'Datei wurde gelöscht!')
                res.redirect(302, '/project/' + req.params.projectId)
            }
        })
    }
    catch (error) {
        console.error(error)
        req.flash(error)
        view.render('errors/500')
    }
}