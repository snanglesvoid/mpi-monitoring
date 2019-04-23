function pad(i) { 
    let s = String(i)
    while(s.length < 2) {s = "0" + s}
    return s
}
function dateTimeStr(d) { 
    return d && d.constructor.name =='Date' ? 
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}` : null
}

function decodeUmlauts(str) {
    return str
        .replace(/%C3%A4/g, 'ä')
        .replace(/%C3%BC/g, 'ü')
        .replace(/%C3%B6/g, 'ö')
        .replace(/%C3%9F/g, 'ß')
}

exports = module.exports = {
    pad : pad,
    dateTimeStr : dateTimeStr,
    pathSanitize : require('./pathsanitize'),
    decodeUmlauts : decodeUmlauts,
}