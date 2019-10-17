const fs = require('fs')

module.exports = class {
    constructor(){
        this.init();
    }

    init(){
        this.path = './contracts/';
        this.path_ava = this.path + 'available/';
        this.path_ena = this.path + 'enabled/';
        this.path_txs = this.path + 'transactions/';

        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
        if (!fs.existsSync(this.path_ava)) fs.mkdirSync(this.path_ava);
        if (!fs.existsSync(this.path_ena)) fs.mkdirSync(this.path_ena);
        if (!fs.existsSync(this.path_txs)) fs.mkdirSync(this.path_txs);
    }

    adr_ava(id){
        return this.path_ava + id + '.js';
    }

    adr_ena(id){
        return this.path_ena + id + '.js';
    }

    adr_tx(id){
        return this.path_txs + id + '.json';
    }

    adr_txd(id){
        return this.path_txs + id + '_done.json';
    }

    /**
     * Is contract available.
     * @param {Contract id} id 
     */
    is_ava(id){
        return fs.existsSync(this.adr_ava(id));
    }

    /**
     * Is contract enabled.
     * @param {Contract id} id 
     */
    is_ena(id){
        return fs.existsSync(this.adr_ena(id));
    }

    /**
     * Есть ли транзакция в пуле вызова.
     * @param {Contract id} id 
     */
    is_tx(id){
        return fs.existsSync(this.adr_tx(id));
    }    

    create_contract(id, code){
        fs.writeFileSync(this.adr_ava(id), code);
    }

    enable_contract(id){
        fs.renameSync(this.adr_ava(id), this.adr_ena(id));
    }

    create_transaction(id, cid, args){
        var tx = {txid: id, cid: cid, args: args}
        fs.writeFileSync(this.adr_tx(id), JSON.stringify(tx));
    }

    run_transaction(id){
        console.log("--- Executing transaction " + id);
        var tx = JSON.parse(fs.readFileSync(this.adr_tx(id)));
        console.log(tx);

        if (!this.is_ena(tx.cid)){
            console.log('Contract ' + tx.cid + ' is not enabled.')
            return false;
        }

        var ctr = require(this.adr_ena(tx.cid))
        console.log('ctr=', ctr);

        // Do tx
        ctr(...tx.args);

        fs.renameSync(this.adr_tx(id), this.adr_txd(id));
    }

    db_hash(){
        return '123456789';
    }
}