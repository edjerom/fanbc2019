const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')

// var app = express();
// app.use(bodyParser.json());

const conf = require('./conf')
const Store = require('./store')
const Network = require('./network/network')
const NetworkLogic = require('./network/network_logic')
const ExpressLogic = require('./express_logic')

var store = new Store();

var network = new Network(conf.servers);
require('./core/misc/id').init(network.mac)

// return;

var nw_logic = new NetworkLogic(network, store);
// return;
var ex_logic = new ExpressLogic(conf.port, nw_logic, store);