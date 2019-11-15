const fs = require('fs')

var Store = class {
    constructor(name, path) {
        this._path = (path || "./") + (name || "_store") + "/"

        if (!fs.existsSync(this._path)) fs.mkdirSync(this._path);
    }

    sub(name) {
        return new Store(name, this._path);
    }


    exists(name) {
        return fs.existsSync(this.path(name))
    }

    path(name) {
        return this._path + name;
    }

    drop(name){
        fs.unlinkSync(this.path(name))
    }

    
    load_raw(name) {
        return fs.readFileSync(this.path(name)).toString();
    }

    save_raw(name, data) {
        fs.writeFileSync(this.path(name), data);
    }

    load(name) {
        return JSON.parse(this.load_raw(name))
    }

    save(name, data) {
        this.save_raw(name, JSON.stringify(data))
    }


    /**
     * Получить все файлы хранилища.
     */
    files() {
        return this.all().filter(file => !fs.statSync(this._path + file).isDirectory())
    }

    /**
     * Получить все папки хранилища.
     */
    dirs() {
        return this.all().filter(file => fs.statSync(this._path + file).isDirectory())
    }

    /**
     * Получить все файлы и папки хранилища.
     */
    all() {
        return fs.readdirSync(this._path)
    }







    create_contract(id, code) {
        fs.writeFileSync(this.adr_ava(id), code);
    }

    enable_contract(id) {
        fs.renameSync(this.adr_ava(id), this.adr_ena(id));
    }

    read_contract(id) {
        return fs.readFileSync(this.adr_ena(id)).toString();
    }

    create_transaction(id, cid, method, args) {
        var tx = { id, cid, method, args }
        fs.writeFileSync(this.adr_tx(id), JSON.stringify(tx));
    }

    read_transaction(id) {
        return fs.readFileSync(this.adr_tx(id)).toString();
    }

    write_transaction(id, text) {
        fs.writeFileSync(this.adr_tx(id), text);
    }


    contracts_list() {
        var files = fs.readdirSync(this._path_ena)
        return files.map(f => f.replace('.js', ''))
    }

    transactions_list() {
        var files = fs.readdirSync(this._path_txs)
        var ctrs = {}
        files.map(f => {
            var id = f.replace('.json', '')
            var tx = JSON.parse(this.read_transaction(id))
            // console.log(tx)

            // var parts = f.split('_')
            // var c = {id: parts[0], state: 'created'}
            var c = { id: id, state: tx.done ? 'done' : 'created' }
            if (!ctrs[c.id]) ctrs[c.id] = c; else c = ctrs[c.id];

            c.result = tx.result;

            // if (parts.length > 1){
            //     if (parts[1] == 'done')
            //         c.state = 'done'
            //     if (parts[1] == 'result')
            //         c.result = JSON.parse(fs.readFileSync(this._path_txs + f + '.json'))
            // }
            return c;
        })
        return Object.values(ctrs)
    }

    data_list() {
        return this.ds.data_list();
    }

    read_data(id) {
        return this.ds.read_data(id)
    }

    write_data(id, text) {
        this.ds.write_data(id, text)
    }

    run_transaction(id) {
        console.log("--- Executing transaction " + id);
        var tx = JSON.parse(fs.readFileSync(this.adr_tx(id)));
        console.log(tx);

        if (tx.done) {
            console.log('Transaction ' + id + ' already done.')
            return false;
        }

        if (!this.is_ena(tx.cid)) {
            console.log('Contract ' + tx.cid + ' is not enabled.')
            return false;
        }

        var dsnode = this.ds.node(tx.cid)

        console.log('TX:', tx);

        var res = transaction(this.adr_ena(tx.cid), tx.method, tx.args, dsnode)

        // Сохраним результат работы
        tx.done = 1
        tx.result = res
        this.write_transaction(id, JSON.stringify(tx))
    }

    get_txres(id) {
        var tx_text = this.read_transaction(id)
        var tx = JSON.parse(tx_text)
        return tx.result
    }

    db_hash() {
        return '123456789';
    }
}

module.exports = Store