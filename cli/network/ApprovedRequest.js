const md5 = require('md5')

module.exports = class {
    constructor(nw_logic, req, af, cb_req, cb_res) {
        this.nw_logic = nw_logic
        this.req = req
        this.af = 'data'//af
        this.cb_req = cb_req
        this.cb_res = cb_res
        this.answers = {}

        // this.skip_self = true

        // Сюда складываем подтверждения.
        this.approves = {};

        this.nw_logic.network.subscribe(req + '_req', (msg) => {
            console.log('Req ' + req + ' id:' + msg.id + ' requested by ' + msg.mac);
            if (this.skip_self && this.nw_logic.mac == msg.mac)
            {
                console.log('Skip self');
                return;
            }

            if (this.cb_req(msg, this.nw_logic))
                this.nw_logic.network.send(req + '_res', msg);
            else
                this.nw_logic.network.send(req + '_rej', { id: msg.id });
        });

        this.nw_logic.network.subscribe(req + '_res', (msg) => {
            // Create contract and send approve (res) or reject (rej)
            console.log('Req ' + req + ' id:' + msg.id + ' approved by ' + msg.mac);
            // console.log('+MAC:' + this.nw_logic.mac);

            if (this.skip_self && this.nw_logic.mac == msg.mac){
                console.log('Skip self');
                return;
            } 

            if (this.approves[msg.id] == 'done'){
                console.log('Request ' + msg.id + ' already done');
                return;
            }

            if (!this.approves[msg.id])
                this.approves[msg.id] = [];

            // die if there was approve from this mac
            if (this.approves[msg.id].includes(msg.mac)) return;
            this.approves[msg.id].push(msg.mac);

            if (!this.answers[msg.id])
                this.answers[msg.id] = [];

            var hash = md5(JSON.stringify(msg[this.af]))

            if (!this.answers[msg.id][hash]) this.answers[msg.id][hash] = 0;
            this.answers[msg.id][hash]++;

            // console.log('#this.answers', this.answers)
            // console.log('#this.nw_logic.approves_min', this.nw_logic.approves_min)
            if (this.answers[msg.id][hash] < this.nw_logic.approves_min) return;
            this.approves[msg.id] = 'done';

            console.log('AprReq ' + req + ' id:' + msg.id + ' APPROVED by 51%!');
            delete msg.mac
            this.cb_res(msg, this.nw_logic);
        });
    }

    send(data, send_self) {
        data = data || {};
        var dec = data
        data = this.nw_logic.network.send(this.req + '_req', data);
        dec.id = data.id
        dec.mac = data.mac
        if (send_self){
            this.cb_req(dec, this.nw_logic)
            this.nw_logic.network.send(this.req + '_res', dec);           
        }

        console.log('AprReq ' + this.req + ' id:' + data.id + ' sended send_self:' + send_self);
        return data
    }
}