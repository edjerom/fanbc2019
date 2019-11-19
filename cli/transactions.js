function do_transaction(path, method, args, ds){
    console.log('path is:', path );
        var ctr = require(path)
        console.log(ctr);
        var c = new ctr();
        console.log('dsnode is', ds)

        c.ds = ds;
        console.log('c.ds is', c.ds)
        // Do tx
        console.log('class is', c);
        console.log('c.method is', method);

        var res = c[method](args);
        console.log('tx res is', res);
        return res;
}

module.exports = class {
    constructor(store, contracts){
        this.store = store.sub('transactions')
        this.contracts = contracts
    }

    create_transaction(id, cid, method, args){
        var tx = {id, cid, method, args, state: 'created'}
        this.store.save(id, tx)
    }

    run_transaction(id){
        console.log("--- Executing transaction " + id);
        var tx = this.store.load(id)
        console.log(tx);

        if (tx.state != 'created'){
            console.log('Transaction ' + id + ' already in progress.')
            return false;
        }

        if (!this.contracts.store_ena.exists(tx.cid)){
            console.log('Contract ' + tx.cid + ' is not enabled.')
            return false;
        }

        var dsnode = this.contracts.store_data.exists(tx.cid) ? this.contracts.store_data.load(tx.cid) : {}
        var res = do_transaction(this.contracts.store_ena.path(tx.cid), tx.method, tx.args, dsnode)
        this.contracts.store_data.save(tx.cid, dsnode)

        // Сохраним результат работы
        tx.state = 'executed'
        tx.result = res
        this.store.save(id, tx)
    }

    get_txres(id){
        var tx_text = this.read_transaction(id)
        var tx = JSON.parse(tx_text)
        return tx.result
    }

    db_hash(){
        return '123456789';
    }
}