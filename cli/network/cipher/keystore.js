const NodeRSA = require('node-rsa');

module.exports = class {
    constructor(store, mac) {
        this.store = store.sub('keys')
        this.mac = mac

        this.reset();
    }

    reset() {
        this.count = 0
        this.keys = {};
        this.init(this.mac);
    }

    init(mac) {
        if (this.store.exists('keys')) {
            try {
                var keys = this.store.load('keys')
                this.encKey = keys.enc
                this.decKey = keys.dec
                this.key = new NodeRSA({ b: 512 });
                this.key.importKey(keys.enc)
                this.key.importKey(keys.dec)
            }
            catch (ex) {
            }
        }
        else {
            this.key = new NodeRSA({ b: 512 });
            this.encKey = this.key.exportKey('public')
            this.decKey = this.key.exportKey('private')
            this.store.save('keys', { enc: this.encKey, dec: this.decKey })
        }

        this.append(mac, this.encKey, this.decKey)
    }

    append(mac, encKey, decKey) {
        if (this.keys[mac]) {
            console.log("#Keystore.Node " + mac + " already discovered")
            return;
        }

        console.log("Node " + mac + " added")
        this.count++
        this.keys[mac] = { enc: encKey, dec: decKey }
    }

    quorum(){
         // return this.count < 2 ? 0 : this.count < 3 ? 1 : Math.floor(this.count / 2) + 1;
         return Math.floor(this.count / 2) + 1;
    }

    encrypt(data) {
        try {
            data = JSON.stringify(data)
            var rsa = new NodeRSA();
            // console.log('#ENC:', data, '#KEY:', this.encKey)
            rsa.importKey(this.encKey)
            return rsa.encrypt(JSON.stringify(data), 'base64');
        }
        catch (ex) {
            console.log("Key error with node " + this.encKey)
            return null;
        }
    }

    decrypt(data, mac) {
        // console.log('decrypt', data, this.keys)
        try {
            var rsa = new NodeRSA();
            rsa.importKey(this.keys[mac].dec)
            return JSON.parse(rsa.decrypt(data, 'utf8'));
        }
        catch (ex) {
            console.log("Key error with node " + mac)
            return null;
        }
    }
}