const conf = require('./conf')
const Store = require('./store')
const Network = require('./network/network')
const NetworkLogic = require('./network/network_logic')
const ExpressLogic = require('./express_logic')

console.log("#conf", conf)

var store = new Store();

var network = new Network(conf.servers, conf.subnet);
require('./core/misc/id').init(network.mac)

var nw_logic = new NetworkLogic(network, store);

var ex_logic = new ExpressLogic(conf.port, nw_logic, store);