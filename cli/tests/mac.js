// var nm = require('node-getmac')
// console.log(nm)

var ni = require('os').networkInterfaces()
var vals = Object.values(ni)
var vals2 = []
for(var k in vals){
    vals2.push(...vals[k])
}
vals2 = vals2.filter(k => k.internal == false 
    && !k.mac.startsWith('0a:00')
    && k.family == 'IPv4')
//console.log(vals)
console.log(vals2[0].mac)

if (ni.eth0){
    console.log('mac', ni.eth0.mac) 
}
else {
    //var mac = Object.values(ni)[0].filter(k => k.)
    // console.log(mac)
}

// console.log('ni', ni)