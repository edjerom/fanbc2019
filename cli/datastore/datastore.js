const fs = require('fs')
const md5 = require('md5');
const DSNode = require('./dsnode')

module.exports = class {
    constructor(){
        this.init();
    }

    init(){
        this.path = './contracts/datastore/';

        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
    }

    adr(id){
        return this.path + id + '.json';
    }

    /**
     * Is contract available.
     * @param {Contract id} id 
     */
    has_store(id){
        return fs.existsSync(this.adr(id));
    }

    node(id){
            return new DSNode(this.adr(id))
    }

    hash(id){
        return this._filehash(this.adr(id != null ? id : "current"))
    }
}