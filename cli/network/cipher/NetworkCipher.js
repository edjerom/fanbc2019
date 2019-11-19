/** Модуль отвечает за подключение к сети, отправку данных в сеть и прием данных из сети. */

module.exports = class {
    constructor(network, keystore) {
        this.network = network
        this.keystore = keystore
    }

    send(ch, message) {
        message = message || {}
        var enc = this.keystore.encrypt(message)
        return this.network.send(ch, {id: message.id, _enc: enc })
    }

    subscribe(ch, cb) {
        var cb2 = msg => {
            var id = msg.id
            var mac = msg.mac

            var dec = msg
            if (msg._enc) {                
                dec = JSON.parse(this.keystore.decrypt(msg._enc, mac))
                dec.id = id
                dec.mac = mac
            }
            return cb(dec)
        }
        this.network.subscribe(ch, cb2);
    }
}