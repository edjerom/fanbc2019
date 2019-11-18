/** Модуль отвечает за подключение к сети, отправку данных в сеть и прием данных из сети. */

module.exports = class {
    constructor(network, keystore) {
        this.network = network
        this.keystore = keystore
    }

    send(ch, message) {
        message = message || {}
        // console.log('#cipher.send1:', this.network.mac)
        // var key = this.keystore.keys[this.network.mac];
        // console.log('#cipher.send2:', key)
        var enc = this.keystore.encrypt(message)
        // console.log('#cipher.send3:', message, '#enc:', enc)
        return this.network.send(ch, { _enc: enc })
    }

    subscribe(ch, cb) {
        var cb2 = msg => {
            var id = msg.id
            var mac = msg.mac

            var dec = msg
            if (msg._enc) {                
                // console.log('#MSG', msg)
                dec = JSON.parse(this.keystore.decrypt(msg._enc, mac))
                // console.log('#DEC', dec)
                // console.log('#KEYS', this.keystore.keys)
                dec.id = id
                dec.mac = mac
            }
            // console.log('received', msg)
            //  this. cipher.decrypt(msg)
            return cb(dec)
        }
        this.network.subscribe(ch, cb2);
    }
}