const NodeRSA = require('node-rsa');
 
module.exports = class {
    /**
     * Создает класс для шифрования-дешифрования данных узла.
     * @param {Хранилище ключей этой ноды или decKey другой ноды} store 
     */
    constructor(store){
        if (typeof(store) == 'string'){
            this.decKey = store;
            return;
        }

        // this.network = network;
        this.store = store

        if (store.exists('keys'))
        {
            try {
                var keys = store.load('keys')                
                this.encKey = keys.enc
                this.decKey = keys.dec
                this.key = new NodeRSA({b: 512});
                this.key.importKey(keys.enc)
                this.key.importKey(keys.dec)
                return
            }
            catch(ex){
            }
        }

        this.key = new NodeRSA({b: 512});
        this.encKey = this.key.exportKey('public')
        this.decKey = this.key.exportKey('private')
        store.save('keys', {enc: this.encKey, dec: this.decKey})
    }

    encrypt(data){
        return this.key.encrypt(JSON.stringify(data), 'base64');
    }

    decrypt(text){
        return JSON.parse(this.key.decrypt(text, 'utf8'));
    }
}