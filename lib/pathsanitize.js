let stringHelpers = require('./stringhelpers')

function sanitizePath(path) {
    return path
        .split('/')
        .map(stringHelpers.decodeUmlauts)
        .map(x => x.replace(/%20/g, ' '))
        .map(x => x.replace(/([^a-z0-9.\/äöüß]+)/gi, '-'))
        .map(x => {
            while (x.slice(-1) === '-') {
                x = x.slice(0, -1)
            }
            while (x[0] === '-') {
                x = x.substr(1)
            }
            return x
        })
        .join('/')
}

exports = module.exports = sanitizePath
