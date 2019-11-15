/** Модуль объеденяет всю сетевую логику, но не исполняет ее. */

const NodePool = require('./node_pool')
const NetworkDiscover = require('./NetworkDiscover')
const Contracts = require('../contracts')
const Transactions = require('../transactions')
const ARStack = require('./ARStack')

module.exports = class {
    constructor(network, store) {
        this.network = network;
        this.store = store;
        this.nodes = new NodePool(this.store);

        this.contracts = new Contracts(store)
        this.transactions = new Transactions(store, this.contracts)
        this.arstack = new ARStack(this)

        this._discover().then(() => this._subscribe());
    }

    create_contract(code){
        return this.buildAR('CREATE_CONTRACT').send({data: {code}}).id
    }

    create_transaction(cid, method, args){
        return this.buildAR('CREATE_TRANSACTION').send({data: {cid, method, args}}).id
    }

    _discover(){
        console.log('Discovering')
        // Сколько подтверждений надо получить чтобы считать что большинство за (временно).
        this.approves_min = 10;

        var nd = new NetworkDiscover(this.network, this.nodes)
        return nd.discover()
    }

    _subscribe(){
        console.log('Subscribing')
        this.syncinit();
    }

    syncinit() {
        this.approves_min = this.nodes.approves_min() //Math.floor(this.nodes.length / 2) + 1;
        this.buildAR('INIT').send()
    }

    buildAR(name){
        return this.arstack.buildAR(name)
    }
}