const fs = require('fs')
const mkdirp = require('mkdirp')

async function ensureDir (dirpath) {
    return new Promise((resolve, reject) => {
        mkdirp(dirpath, err => {
            if (err) {
                return reject(err)
            }
            return resolve('exists')
        })
    })
}

async function readFile (path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) return reject(err)
            return resolve(data)
        })
    })
}
async function readDir (path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, items) => {
            if (err) return reject(err)
            return resolve(items)
        })
    })
}

exports = module.exports = {
    ensureDir : ensureDir,
    readFile : readFile,
    readDir : readDir
}