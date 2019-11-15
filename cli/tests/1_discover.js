var conf = require('../conf')
var Network = require('../network/network')
var NodePool = require('../network/node_pool')
const NetworkLogic = require('../network/network_logic')
var Store = require('../store')

var store = new Store('store')

var net = new Network(conf.servers, 'main')

var nodePool = new NodePool(net, store);
const NetworkDiscover = require('../network/NetworkDiscover')
// nodePool.discover();

 var nl = new NetworkLogic(net, store);


// var nd = new NetworkDiscover(net, nodePool)
// nd.discover()

setTimeout(() => {

    // nodePool.send("TEST", {a: 10, b: 20, c: 30})


}, 1000)


