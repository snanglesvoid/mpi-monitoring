const keystone = require('keystone')
const fs = require('fs')
const url = require('url')
const pth = require('path')
const shell = require('shelljs')

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

exports = module.exports = async (req, res) => {
    let view = new keystone.View(req, res)
    let path = url.parse(req.url).pathname
    let locals = res.locals
    locals.directories = []

    path = path.split('/').filter(x => x.length > 0)
    path = path.slice(1)

    path = path.length == 0 ? '' : path.reduce((a,b) => a + '/' + b)

    fpath = __dirname + '/../../data/' + path

    locals.path = path

    let upath = path.split('/').filter(x => x.length > 0)
    if (upath.length > 0) {
        upath.pop()
        upath = upath.length == 0 ? '' : upath.reduce((a,b) => a + '/' + b)
    }
    else {
        upath = ''
    }

    locals.upath = upath

    fs.readdir(fpath, function(err, items) {
        console.log(items)
        console.error(err)
        if (err || !items) {
            //no such directory
            if (err && err.code == 'ENOTDIR') {
                return res.download(pth.resolve(fpath))
            }
            else {
                req.flash('error', 'Ordner oder Datei existieren nicht')
                return view.render('errors/404')
            }
        }
        locals.directories = items
        view.render('uploads')
    })

    async function shellExec(command) {
        return new Promise((resolve, reject) => {
            shell.exec(command, (code, stdout, stderr) => {
                if (code == 0) {
                    resolve(stdout)
                }
                else {
                    reject(stderr)
                }
            })
        })
    }

    view.on('post', async next => {
        if (!shell.which('zip')) {
            req.flash('error', 'this script requires zip to be installed on the server')
            return next()
        }
        try {
            let tempName = pth.resolve(fpath + '.zip')
            let stdout = await shellExec('zip -r ' + tempName + ' ' + pth.resolve(fpath))
            console.log('ZIP OUTPUT:\n' + stdout)
            res.download(tempName, async err => {
                if (err) {
                    req.flash('err')
                    return next()
                }
                stdout = await shellExec('rm ' + tempName)
                console.log('ZIP FILE REMOVED:\n' + stdout)
               
            })
        } 
        catch (err) {
            req.flash('error', err)
            return next()
        }


    })
}