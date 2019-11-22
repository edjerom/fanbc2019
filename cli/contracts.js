/** Модуль для работы */

module.exports = class {
    constructor(store){
        this.store = store.sub('contracts')
        this.store_ava = this.store.sub('ava')
        this.store_ena = this.store.sub('ena')
        this.store_data = this.store.sub('data')
    }

    create_contract(id, code){
        this.store_ava.save_raw(id, code)
    }

    enable_contract(id){
        var code = this.store_ava.load_raw(id)
        if (!code) return;
        this.store_ena.save_raw(id, code)
        this.store_ava.drop(id)
    }

    data(id){
        return this.store_data.load(id)
    }
}