/** Модуль кеширует создание ApprovedRequest, чтобы не было двойной подписи на событие. */

const ApprovedRequest = require('./ApprovedRequest')

module.exports = class {
    constructor(nl){
        this.nl = nl
        this._hash = {};
    }

    buildAR(name){
        if (!this._hash[name])
        {
            var ar = require('./requests/' + name)
            this._hash[name] = new ApprovedRequest(this.nl, name, "", ar.requested, ar.approved)
        }
        return this._hash[name];
    }
}