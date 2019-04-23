const sanitize = require('./pathsanitize')
const shell = require('shelljs')
const asyncfs = require('./asyncfs')
const asyncForEach = require('./asyncforeach')
const pth = require('path')

async function sanitizeFolderRec(path) {
    console.log('sanitize folder:', path)
    try {
        let dirs = await asyncfs.readDir(path)
        // console.log('dirs: ', dirs)
        await asyncForEach(dirs, async dir => new Promise(async (resolve, reject) => {
            try {
                let p = pth.resolve(path + '/' + dir)
                let type = await sanitizeFolderRec(p)
                
                let dirS = sanitize(dir)
                
                if (dirS == dir) {
                    console.log(dir, 'does not need to be sanitized.')
                    return resolve()
                }
                
                let out = shell.cp('-r', p, pth.resolve(path + '/' + dirS))
                console.log('copied', dir, 'to', dirS)
                console.log('shell out:\n', out.cat())
                out = shell.rm('-rf', p)
                console.log('removed', p)
                console.log('shell out:\n', out.cat())
                
                resolve()
            } 
            catch(err) {
                // console.log('catch', err)
                return reject(err)
            }
        }))
        return Promise.resolve('DIR')
    }
    catch (error) {
        if (error.code == 'ENOTDIR') {
            console.log('Not a directory, exit')
            return Promise.resolve('FILE')
        }
        else {
            console.error(error)
            return Promise.reject(error)
        }
    }
}


async function exec() {
    let path = pth.resolve(process.cwd() + '/' + process.argv[2])
    // console.log(shell.cd(path))
    
    await sanitizeFolderRec(path)
    
    console.log('DONE')
}

exec()
