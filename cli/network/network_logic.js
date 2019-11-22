/** Модуль объеденяет всю сетевую логику, но не исполняет ее. */

const NetworkCipher = require('./cipher/NetworkCipher')
const Keystore = require('./cipher/keystore')

const NetworkDiscover = require('./NetworkDiscover')
const Contracts = require('../contracts')
const Transactions = require('../transactions')
const ARStack = require('./ARStack')


module.exports = class {
    constructor(network, store) {
        this.store = store;
        this.mac = network.mac
        // this.nodes = new NodePool(this.store);

        this.keystore = new Keystore(store, network.mac)
        // keystore.append(this.network.mac, this.nodes.node)
        this.transport = new NetworkCipher(network, this.keystore)

        this.network = this.transport;

        this.contracts = new Contracts(store)
        this.transactions = new Transactions(store, this.contracts)
        this.arstack = new ARStack(this)

        this._discover().then(() => this._subscribe());
    }

    create_contract(code){
        return this.buildAR('CREATE_CONTRACT').send({data: {code}}, true).id
    }

    create_transaction(cid, method, args){
        var msg = this.buildAR('CREATE_TRANSACTION').send({data: {cid, method, args}}, true)
        // this.transactions.create_transaction(msg.id, cid, method, args);
        return msg.id
    }

    _discover(){
        console.log('Discovering')
        // Сколько подтверждений надо получить чтобы считать что большинство за (временно).
        this.approves_min = 10;

        var nd = new NetworkDiscover(this.network.network, this.keystore)
        return nd.discover()
    }

    _subscribe(){
        // this.network.cipher = this.nodes.node
        console.log('Subscribing')
        this.syncinit();
    }

    syncinit() {
        // this.approves_min = this.nodes.approves_min() //Math.floor(this.nodes.length / 2) + 1;
        console.log('#Quorum:', this.keystore.quorum())
        this.approves_min = this.keystore.quorum()
        this.buildAR('INIT').send()
    }

    buildAR(name){
        return this.arstack.buildAR(name)
    }
}