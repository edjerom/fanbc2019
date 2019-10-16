var NATS = require('nats');
const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')
var address = require('address');

var servers = ['nats://195.128.124.107:4222'];
 
// Randomly connect to a server in the cluster group.
var nats = NATS.connect({'servers': servers, json: true});

var app = express();
app.use(bodyParser.json());

var MAC = "";

// Simple Publisher
// nats.publish('foo', '');
 
// Simple Subscriber
nats.subscribe('foo', function(msg) {
    console.log('Received a message: ' + msg);
});


// Сюда складываем подтверждения создания контрактов.
var create_approves = {};
// Сколько подтверждений надо получить чтобы считать что создание контракта подтверждено. 
var create_approves_min = 2;


nats.subscribe('create_contract_req', function(msg) {
    // Create contract and send approve (res) or reject (rej)
    console.log('wants create contract: ');
    fs.writeFileSync('./contracts/available/' + msg.cid + '.js', msg.code);
    nats.publish('create_contract_res', {mac: MAC, cid: msg.cid});
});
  
nats.subscribe('create_contract_res', function(msg) {
    // Create contract and send approve (res) or reject (rej)
    console.log('create contract approved by ' + msg.mac);

    if (!create_approves[msg.cid])
        create_approves[msg.cid] = [];

    // die if there was approve from mac
    if (create_approves[msg.cid].includes(msg.mac)) return;

    create_approves[msg.cid].push(msg.mac);
    console.log(create_approves);

    if (create_approves[msg.cid].length < create_approves_min) return;
    if (!fs.existsSync('./contracts/available/' + msg.cid + '.js')) return;

    console.log('creation contract ' + msg.cid + ' APPROVED!');

    // Переносим контракт в папку активных.
    // fs.copyFileSync('./contracts/available/' + msg.cid + '.js', './contracts/eanbled/' + msg.cid + '.js')
    // fs.unlinkSync('./contracts/available/' + msg.cid + '.js');
    fs.renameSync('./contracts/available/' + msg.cid + '.js', './contracts/enabled/' + msg.cid + '.js');
});


// Вызов контракта (req, res, done, sync)
nats.subscribe('run_contract_req', function(msg) {
    // Create contract and send approve (res) or reject (rej)
    console.log('wants create contract: ');
    fs.writeFileSync('./contracts/available/' + msg.cid + '.js', msg.code);
    nats.publish('create_contract_res', {mac: MAC, cid: msg.cid});
});

nats.subscribe('run_contract_rej', function(msg) {
    // Create contract and send approve (res) or reject (rej)
    console.log('wants create contract: ');
    fs.writeFileSync('./contracts/available/' + msg.cid + '.js', msg.code);
    nats.publish('create_contract_res', {mac: MAC, cid: msg.cid});
});



app.post('/create_contract', (req, res) => {
    if (!req.body.params.code)
        return res.send({success: false, message: "param code not defined"})

    // Generate file id (mymac + time)
    var timeInMs = Date.now().toString().padStart(16, '0');
    var cid = MAC + timeInMs;

    // Save code to DB (or file)
    // fs.writeFileSync('./contracts/' + cid + '.js', req.body.params.code);

    // Send contract request to network.
    nats.publish('create_contract_req', {mac: MAC, cid: cid, code: req.body.params.code});

    console.log(req.body)
    res.send({success: true, id: cid});
});

app.post('/run_contract', (req, res) => {
    if (!req.body.params.code)
        return res.send({success: false, message: "param code not defined"})

    // Generate file id (mymac + time)
    var timeInMs = Date.now().toString().padStart(16, '0');
    var cid = MAC + timeInMs;

    // Save code to DB (or file)
    console.log(fs.writeFileSync('./contracts/' + cid + '.js', req.body.params.code));

    console.log(req.body)
    res.send({success: true, id: cid});
});






address.mac(function (err, addr) {
    MAC = addr.replace(/:/g, '');
    nats.publish('foo', MAC + ' MAC published');
    console.log(MAC); // '78:ca:39:b0:e6:7d'
  });



app.listen(3000);

function create_contract(){

}