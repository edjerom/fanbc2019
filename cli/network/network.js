/** Модуль отвечает за подключение к сети, отправку данных в сеть и прием данных из сети. */

var NATS = require('nats');
var ID = require('../core/misc/id')

module.exports = class {
    constructor(servers, subnet){
        this.mac = require('./misc/getmac')().replace(/[-:]/g, '').toLowerCase() + Math.round(Math.random()*9999).toString().padStart(4, '0')

        console.log('#mymac:', this.mac)

        this.subnet = subnet;
        this.nats = NATS.connect({'servers': servers, json: true});

        // this.subscribe('connected', m => console.log('Connected: ' + m.mac))
        // this.send('connected')            
    }
   
    gen_id() {
        return ID.next()
    }

    send(ch, message){
        message = message || {}
        message.mac = this.mac;
        message.id = message.id || this.gen_id()

        this.nats.publish(this.subnet + "." + ch, message);
        return message
    }

    subscribe(ch, cb){
        this.nats.subscribe(this.subnet + "." + ch, cb);
    }
}