module.exports = function () {
    var ni = require('os').networkInterfaces()
    var vals = Object.values(ni)
    var vals2 = []
    for (var k in vals) {
        vals2.push(...vals[k])
    }
    vals2 = vals2.filter(k => k.internal == false
        && !k.mac.startsWith('0a:00')
        && k.family == 'IPv4')

    return vals2[0] ? vals2[0].mac : '12:34:56:78:90:ab:cd'
}