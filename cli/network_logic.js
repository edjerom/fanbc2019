module.exports = class {
    constructor(network, store) {
        this.network = network;
        this.store = store;

        // Сколько подтверждений надо получить чтобы считать что большинство за.
        this.approves_min = 1;
        // Сюда складываем подтверждения создания контрактов.
        this.create_approves = {};
        // Сюда складываем подтверждения вызова контрактов.
        this.call_approves = {};
        // Сюда складываем подтверждения состояния базы после выполнения транзакции.
        this.aftertx_approves = {};

        this.sub_create();
        this.sub_call();
        this.sub_aftertx();
    }

    gen_id() {
        var timeInMs = Date.now().toString().padStart(16, '0');
        return this.network.mac + timeInMs;
    }

    /**
     * Попросить сеть создать контракт.
     * @param {*} cid 
     * @param {Код контракта} code 
     */
    request_create(code) {
        var id = this.gen_id();
        this.network.send('create_contract_req', { cid: id, code: code });
        return id;
    }

    sub_create() {
        this.network.subscribe('create_contract_req', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('wants create contract: ');
            this.store.create_contract(msg.cid, msg.code);
            this.network.send('create_contract_res', { mac: this.network.mac, cid: msg.cid });
        });

        this.network.subscribe('create_contract_res', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('create contract approved by ' + msg.mac);

            if (!this.create_approves[msg.cid])
                this.create_approves[msg.cid] = [];

            // die if there was approve from mac
            if (this.create_approves[msg.cid].includes(msg.mac)) return;

            this.create_approves[msg.cid].push(msg.mac);
            console.log(this.create_approves);

            if (this.create_approves[msg.cid].length < this.approves_min) return;
            if (!this.store.is_ava(msg.cid)) return;

            console.log('creation contract ' + msg.cid + ' APPROVED!');

            // Переносим контракт в папку активных.
            this.store.enable_contract(msg.cid);
        });
    }

    request_call(cid, args) {
        var id = this.gen_id();
        this.network.send('call_contract_req', { txid: id, cid: cid, args: args });
        return id;
    }

    sub_call() {
        this.network.subscribe('call_contract_req', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log(msg.mac + ' wants call contract: ', msg.cid, msg);

            this.store.create_transaction(msg.txid, msg.cid, msg.args);
            this.network.send('call_contract_res', { txid: msg.txid });
        });

        this.network.subscribe('call_contract_res', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('call contract ' + msg.txid + ' approved by ' + msg.mac);

            if (!this.call_approves[msg.txid])
                this.call_approves[msg.txid] = [];

            // die if there was approve from mac
            if (this.call_approves[msg.txid].includes(msg.mac)) return;

            this.call_approves[msg.txid].push(msg.mac);
            console.log(this.call_approves);

            if (this.call_approves[msg.txid].length < this.approves_min) return;
            if (!this.store.is_tx(msg.txid)) return;

            console.log('run transaction "' + msg.txid + '" APPROVED!');

            // Переносим контракт в папку активных.
            this.store.run_transaction(msg.txid);

            // Send DB hash after tx
            this.network.send('aftertx_req', { txid: msg.txid, hash: this.store.db_hash() });
        })
    }

    sub_aftertx() {
        this.network.subscribe('aftertx_req', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log(msg.mac + ' wants check aftertx: ', msg.txid, msg);

            if (msg.dbhash == this.store.db_hash())
                this.network.send('aftertx_res', { txid: msg.txid });
            else
                this.network.send('aftertx_rej', { txid: msg.txid });
        });

        this.network.subscribe('aftertx_res', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('aftertx ' + msg.txid + ' approved by ' + msg.mac);

            if (!this.aftertx_approves[msg.txid])
                this.aftertx_approves[msg.txid] = [];

            // die if there was approve from mac
            if (this.aftertx_approves[msg.txid].includes(msg.mac)) return;

            this.aftertx_approves[msg.txid].push(msg.mac);
            console.log(this.aftertx_approves);

            if (this.aftertx_approves[msg.txid].length < this.approves_min) return;
            //  if (!this.store.is_tx(msg.txid)) return;

            console.log('DB state synced after "' + msg.txid + '"');

            // Принять кандидата как текущее состояние базы.
        })
    }
}