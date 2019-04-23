function pad(i) { 
    let s = String(i)
    while(s.length < 2) {s = "0" + s}
    return s
}
function dateTimeStr(d) { 
    return d && d.constructor.name =='Date' ? 
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}` : null
}

exports = module.exports = {
    pad : pad,
    dateTimeStr : dateTimeStr,
    pathSanitize : require('./pathsanitize')
}