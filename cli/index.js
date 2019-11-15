const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')

var app = express();
app.use(bodyParser.json());

const conf = require('./conf')
const Store = require('./store')
const Network = require('./network/network')
const Node = require('./network/network_logic')
const DataStore = require('./datastore/datastore')

const ExpressLogic = require('./express_logic')

// var ds = new DataStore();
var store = new Store();
// return;
// store.data = 1
// store.contracts = 2
// store.keys = 3
// store.transactions = 4
// store.log = 5
// store.save('aaa.txt', {a: 10, b: {c:5}})


var network = new Network(conf.servers);
require('./core/misc/id').init(network.mac)

// return;

var nw_logic = new Node(network, store);
// return;
var ex_logic = new ExpressLogic(conf.port, nw_logic, store);