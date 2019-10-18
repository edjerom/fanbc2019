const fs = require('fs')
const transaction = require('./transaction')

module.exports = class {
    constructor(ds){
        this.ds = ds
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

    adr_txres(id){
        return this.path_txs + id + '_result.json';
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

    create_transaction(id, cid, method, args){
        var tx = {id, cid, method, args}
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

        var dsnode = this.ds.node(tx.cid)

    console.log('TX:', tx);

        var res = transaction(this.adr_ena(tx.cid), tx.method, tx.args, dsnode)

        // Сохраним результат работы
        this.store_res(id, res)
        fs.renameSync(this.adr_tx(id), this.adr_txd(id));
    }

    store_res(txid, data){
        fs.writeFileSync(this.adr_txres(txid), JSON.stringify(data));
    }

    get_txres(txid){
        return JSON.parse(fs.readFileSync(this.adr_txres(txid)));
    }

    db_hash(){
        return '123456789';
    }
}