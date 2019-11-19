/** Модуль кеширует создание ApprovedRequest, чтобы не было двойной подписи на событие. */

const ApprovedRequest = require('./ApprovedRequest')

module.exports = class {
    constructor(nl){
        this.nl = nl
        this._hash = {};
        
        this.ars = {}
        this.ars['INIT'] = require('./requests/INIT')
        this.ars['INIT_CT'] = require('./requests/INIT_CT')
        this.ars['INIT_DS'] = require('./requests/INIT_DS')
        this.ars['INIT_TX'] = require('./requests/INIT_TX')
        this.ars['CREATE_CONTRACT'] = require('./requests/CREATE_CONTRACT')
        this.ars['CREATE_TRANSACTION'] = require('./requests/CREATE_TRANSACTION')
        this.ars['RUN_TRANSACTION'] = require('./requests/RUN_TRANSACTION')

        for (var k in this.ars){
            var ar = this.ars[k]
            this._hash[k] = new ApprovedRequest(this.nl, k, "", ar.requested, ar.approved)
        }
    }

    buildAR(name){
        if (!this.ars[name]){
            console.log('ERROR. ARStack. Module not difined in constructor. ', name)
            return null;
        }

        if (!this._hash[name])
        {
            console.log('#ARStack. added to hash', name)
            var ar = this.ars[name] // require(__dirname + '/requests/' + name + '.js')
            this._hash[name] = new ApprovedRequest(this.nl, name, "", ar.requested, ar.approved)
        }
        return this._hash[name];
    }
}