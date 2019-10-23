const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')

var app = express();
app.use(bodyParser.json());

var MAC = "";

const conf = require('./conf')
const Store = require('./store')
const Network = require('./network/network')
const NetworkLogic = require('./network/network_logic')
const DataStore = require('./datastore/datastore')

const ExpressLogic = require('./express_logic')


var ds = new DataStore();
var store = new Store(ds);
var network = new Network(conf.servers);
var nw_logic = new NetworkLogic(network, store);
var ex_logic = new ExpressLogic(conf.port, nw_logic, store);



// var node = ds.node('asd')
// node.load()
// console.log(node.data);
// node.data.x = 50
// node.save()

// console.log(ds._filehash(ds.adr('asd123asd')));


// nats.subscribe('create_contract_req', function(msg) {
//     // Create contract and send approve (res) or reject (rej)
//     console.log('wants create contract: ');
//     fs.writeFileSync('./contracts/available/' + msg.cid + '.js', msg.code);
//     nats.publish('create_contract_res', {mac: MAC, cid: msg.cid});
// });
  
// nats.subscribe('create_contract_res', function(msg) {
//     // Create contract and send approve (res) or reject (rej)
//     console.log('create contract approved by ' + msg.mac);

//     if (!create_approves[msg.cid])
//         create_approves[msg.cid] = [];

//     // die if there was approve from mac
//     if (create_approves[msg.cid].includes(msg.mac)) return;

//     create_approves[msg.cid].push(msg.mac);
//     console.log(create_approves);

//     if (create_approves[msg.cid].length < create_approves_min) return;
//     if (!fs.existsSync('./contracts/available/' + msg.cid + '.js')) return;

//     console.log('creation contract ' + msg.cid + ' APPROVED!');

//     // Переносим контракт в папку активных.
//     // fs.copyFileSync('./contracts/available/' + msg.cid + '.js', './contracts/eanbled/' + msg.cid + '.js')
//     // fs.unlinkSync('./contracts/available/' + msg.cid + '.js');
//     fs.renameSync('./contracts/available/' + msg.cid + '.js', './contracts/enabled/' + msg.cid + '.js');
// });


// // Вызов контракта (req, res, done, sync)
// nats.subscribe('run_contract_req', function(msg) {
//     // Create contract and send approve (res) or reject (rej)
//     console.log('wants create contract: ');
//     fs.writeFileSync('./contracts/available/' + msg.cid + '.js', msg.code);
//     nats.publish('create_contract_res', {mac: MAC, cid: msg.cid});
// });

// nats.subscribe('run_contract_rej', function(msg) {
//     // Create contract and send approve (res) or reject (rej)
//     console.log('wants create contract: ');
//     fs.writeFileSync('./contracts/available/' + msg.cid + '.js', msg.code);
//     nats.publish('create_contract_res', {mac: MAC, cid: msg.cid});
// });


