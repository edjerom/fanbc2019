/** Модуль генерирует новый id по запросу next(). Один раз надо приписать prefx через init(mac). */

module.exports = {
    id: 0,

    prefix: '',

    init(prefix){
        this.prefix = prefix;
    },

    next(){
        this.id = (this.id + 1) % 1000000
        var s_date = Date.now().toString().padStart(16, '0')
        var s_id = this.id.toString().padStart(6, '0')
        return this.prefix + s_date + s_id;
    }
}