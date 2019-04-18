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

function pad(i) { 
    let s = String(i)
    while(s.length < 2) {s = "0" + s}
    return s
}
function dateTimeStr(d) { 
    return d && d.constructor.name =='Date' ? 
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}` : null
}

exports = module.exports = async (req, res) => {
    let view = new keystone.View(req, res)
    let path = url.parse(req.url).pathname.replace(/%20/g,' ')
    let locals = res.locals
    locals.directories = []
    locals.dateTimeStr = dateTimeStr

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

    fs.readdir(pth.resolve(fpath), async function(err, items) {
        console.log(items)
        console.log(err)
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
        locals.directories = []
        try {
            await asyncForEach(items, async item => new Promise((resolve, reject) => {
                let p = pth.resolve(fpath + '/' + item)
                let isDir = false
                try {
                    isDir = fs.lstatSync(p).isDirectory()
                }
                catch (error) {
                    return reject(error)
                }
                fs.stat(p, (err, stats) => {
                    if (err) return reject(err)
                    locals.directories.push({
                        filename : item, meta : stats, directory: isDir
                    })
                    resolve()
                })
            }))
            // console.log('dirs: ', locals.directories)
            view.render('uploads')
        }
        catch(error) {
            req.flash('error', error)
            res.redirect('/uploads/')
        }
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
            if (fpath == '' || fpath == '/') {
                return next()
            }
            let tempName = pth.resolve(fpath + '.zip')
            console.log('tempName', tempName)
            let stdout = shell.cd(pth.resolve(fpath))//await shellExec('cd ' + pth.resolve(fpath))
            console.log('CD OUTPUT:\n', 'cd ' + pth.resolve(fpath), stdout)
            stdout = await shellExec('ls')
            console.log('LS OUTPUT:\n', stdout)
            stdout = await shellExec('zip -r ' + tempName + ' ./*')
            console.log('ZIP OUTPUT:\n', stdout)
            res.download(tempName, async err => {
                if (err) {
                    console.error('DOWNLOAD ERROR: ', err)
                    req.flash('err')
                    return next()
                }
                stdout = await shellExec('rm ' + tempName)
                console.log('ZIP FILE REMOVED:\n', 'rm ' + tempName, stdout)
            })
        } 
        catch (err) {
            req.flash('error', err)
            return next()
        }
    })
}