const Approve = require('./approve')
const ApprovedRequest = require('./ApprovedRequest')

module.exports = class {
    constructor(network, store) {
        this.network = network;
        this.store = store;
        this.nodes = [];

        // Сколько подтверждений надо получить чтобы считать что большинство за.
        this.approves_min = 10;
        // Сюда складываем подтверждения создания контрактов.
        this.create_approves = {};
        // Сюда складываем подтверждения вызова контрактов.
        this.call_approves = {};
        // Сюда складываем подтверждения состояния базы после выполнения транзакции.
        this.aftertx_approves = {};

        this.sub_create();
        this.sub_call();
        this.sub_aftertx();

        this.app_create_contract = new Approve(this, 'CREATE_CONTRACT',
            (msg) => {
                // console.log('wants create contract: ');
                this.store.create_contract(msg.id, msg.code);
                return true;
            },
            (msg) => {
                console.log('CREATE APPROVED 222');
                if (this.store.is_ava(msg.id)) {
                    console.log('AND WILL BE ENABLED 222');
                    this.store.enable_contract(msg.id);
                    console.log('SUCCEFULLY 222');
                }
                console.log('creation contract ' + msg.id + ' APPROVED!');
                return true;
            })

        this.app_ping = new Approve(this, 'PING',
            (msg) => {
                if (!this.nodes.includes(msg.mac)) {
                    this.nodes.push(msg.mac);
                    this.approves_min = Math.floor(this.nodes.length / 2) + 1;
                }
                return true;
            },
            (msg) => {
                return true;
            })


        // INIT_ASK -> net (все услышали и дают списки контр, транз, данных)
        // INIT_ASK_CT(CTID) -> net (все дают контракт CTID в ответ)
        // INIT_ASK_TX(TXID) -> net (все дают транзакцию TXID в ответ)
        // INIT_ASK_DS(DSID) -> net (все дают блок данных DSID в ответ)

        this.apr_init_ask_ct = new ApprovedRequest(this, 'INIT_ASK_CT', 'data',
            (msg) => {
                msg.data = this.store.read_contract(msg.did)
                return msg;
            },
            (msg) => {
                this.store.create_contract(msg.did, msg.data);
                this.store.enable_contract(msg.did);
                // console.log(msg)
                return true;
            })

        this.apr_init_ask_tx = new ApprovedRequest(this, 'INIT_ASK_TX', 'data',
            (msg) => {
                msg.data = this.store.read_transaction(msg.did)
                return msg;
            },
            (msg) => {
                this.store.write_transaction(msg.did, msg.data);
                // console.log(msg)
                return true;
            })

            this.apr_init_ask_ds = new ApprovedRequest(this, 'INIT_ASK_DS', 'data',
            (msg) => {                
                msg.data = this.store.read_data(msg.did)
                
                return msg;
            },
            (msg) => {
                this.store.write_data(msg.did, msg.data);
                return true;
            })


        this.apr_init_ask = new ApprovedRequest(this, 'INIT_ASK', 'data',
            (msg) => {
                msg.data = {
                    crs: this.store.contracts_list(),
                    trs: this.store.transactions_list().map(tx => tx.id),
                    dss: this.store.data_list()
                }

                return msg;
            },
            (msg) => {
                for (var k in msg.data.crs) {
                    this.apr_init_ask_ct.send({ did: msg.data.crs[k] })
                }

                for (var k in msg.data.trs) {
                    this.apr_init_ask_tx.send({ did: msg.data.trs[k] })
                }

                for (var k in msg.data.dss) {
                    this.apr_init_ask_ds.send({ did: msg.data.dss[k] })
                }                

                // console.log(msg)
                return true;
            })

        this.ping()
    }

    syncinit() {
        this.apr_init_ask.send({})
    }

    ping() {
        this.nodes = [];
        this.approves_min = 2;
        this.app_ping.send({})
        setTimeout(() => this.syncinit(), 1000)
    }

    create_contract(code) {
        return this.app_create_contract.send({ code: code })
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

    request_call(cid, method, args) {
        var id = this.gen_id();
        this.network.send('call_contract_req', { txid: id, cid: cid, method: method, args: args });
        return id;
    }

    sub_call() {
        this.network.subscribe('call_contract_req', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log(msg.mac + ' wants call contract: ', msg.cid, msg);

            this.store.create_transaction(msg.txid, msg.cid, msg.method, msg.args);
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