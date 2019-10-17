var NATS = require('nats');
var address = require('address');

module.exports = class {
    constructor(servers){
        this.nats = NATS.connect({'servers': servers, json: true});

        address.mac((err, addr) => {
            this.mac = addr.replace(/:/g, '');
            console.log('my mac is', this.mac)
            this.send('connected', {})
          });

          this.subscribe('connected', m => console.log('Connected:' + m.mac))
    }

    send(ch, message){
        message.mac = this.mac;
        this.nats.publish(ch, message);
    }

    subscribe(ch, cb){
        this.nats.subscribe(ch, cb);
    }
}